/**
 * Универсальный метод delete для удаления значения по ключу
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function deleteMethod(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function(key) {
    const type = ass.detect;
    const prev = ass.this;

    // Сохраняем удаляемое значение и информацию о нем
    let deletedValue;
    let prevSize;

    switch (type) {
      case 'array':
        if (typeof key !== 'number' || key < 0 || key >= ass.this.length) {
          throw new Error('Invalid index for array');
        }
        deletedValue = ass.this[key];
        prevSize = ass.this.length;
        ass.this.splice(key, 1);
        break;

      case 'map':
        if (!ass.this.has(key)) {
          throw new Error('Key not found in map');
        }
        deletedValue = ass.this.get(key);
        prevSize = ass.this.size;
        ass.this.delete(key);
        break;

      case 'weakmap':
        if (typeof key !== 'object' || key === null) {
          throw new Error('WeakMap keys must be objects');
        }
        if (!ass.this.has(key)) {
          throw new Error('Key not found in weakmap');
        }
        deletedValue = ass.this.get(key);
        // WeakMap не имеет size
        ass.this.delete(key);
        break;

      case 'set':
        if (!ass.this.has(key)) {
          throw new Error('Value not found in set');
        }
        deletedValue = key; // В Set значение и есть ключ
        prevSize = ass.this.size;
        ass.this.delete(key);
        break;

      case 'weakset':
        if (typeof key !== 'object' || key === null) {
          throw new Error('WeakSet values must be objects');
        }
        if (!ass.this.has(key)) {
          throw new Error('Value not found in weakset');
        }
        deletedValue = key; // В WeakSet значение и есть ключ
        // WeakSet не имеет size
        ass.this.delete(key);
        break;

      case 'object':
        if (!(key in ass.this)) {
          throw new Error('Property not found in object');
        }
        deletedValue = ass.this[key];
        prevSize = Object.keys(ass.this).length;
        delete ass.this[key];
        break;

      case 'string':
        if (typeof key !== 'number' || key < 0 || key >= ass.this.length) {
          throw new Error('Invalid index for string');
        }
        deletedValue = ass.this[key];
        prevSize = ass.this.length;
        // Удаляем символ по индексу и собираем строку обратно
        ass.this = ass.this.substring(0, key) + ass.this.substring(key + 1);
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Генерируем события
    ass.emit('delete', { key, value: deletedValue });
    ass.emit('change', {
      prev: prev,
      next: ass.this,
      // Добавляем расширенную информацию
      detail: {
        type: type,
        operation: 'delete',
        key: key,
        value: deletedValue,
        // Информация о размере до и после
        prevSize: prevSize,
        // Текущий размер после удаления
        size: type === 'array' ? ass.this.length :
              type === 'set' ? ass.this.size :
              type === 'map' ? ass.this.size :
              type === 'object' ? Object.keys(ass.this).length :
              type === 'string' ? ass.this.length : undefined,
        // Для массивов и строк - затронутые индексы
        affectedIndices: (type === 'array' || type === 'string') ?
                         Array.from({ length: prevSize - key - 1 }, (_, i) => key + i + 1) :
                         undefined
      }
    }, {
      method: 'delete',
      arguments: [key]
    });

    return ass.this;
  };
}
