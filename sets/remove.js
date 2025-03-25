/**
 * Универсальный метод remove для удаления значения из коллекции по значению
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function remove(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function(value) {
    const type = ass.detect;
    const prev = ass.this;
    let key; // ключ для найденного элемента

    // Информация о размере коллекции до удаления
    let prevSize;

    // Позиция удаляемого элемента (для массивов и объектов)
    let position;

    switch (type) {
      case 'array':
        prevSize = ass.this.length;
        key = ass.this.indexOf(value);
        if (key === -1) {
          throw new Error('Value not found in array');
        }
        position = key;
        ass.this.splice(key, 1);
        break;

      case 'map':
        prevSize = ass.this.size;
        // Находим ключ, соответствующий значению
        key = null;
        for (const [k, v] of ass.this.entries()) {
          if (v === value) {
            key = k;
            break;
          }
        }
        if (key === null) {
          throw new Error('Value not found in map');
        }
        ass.this.delete(key);
        break;

      case 'set':
        prevSize = ass.this.size;
        if (!ass.this.has(value)) {
          throw new Error('Value not found in set');
        }
        key = value; // В Set ключ это само значение
        ass.this.delete(value);
        break;

      case 'object':
        prevSize = Object.keys(ass.this).length;
        // Находим ключ, соответствующий значению
        key = Object.keys(ass.this).find(k => ass.this[k] === value);
        if (key === undefined) {
          throw new Error('Value not found in object');
        }
        // Для объектов позиция - это индекс ключа в массиве ключей
        position = Object.keys(ass.this).indexOf(key);
        delete ass.this[key];
        break;

      case 'weakset':
        if (typeof value !== 'object' || value === null) {
          throw new Error('WeakSet values must be objects');
        }
        if (!ass.this.has(value)) {
          throw new Error('Value not found in weakset');
        }
        key = value; // В WeakSet ключ это само значение
        ass.this.delete(value);
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Получаем текущий размер после удаления
    let currentSize;
    if (type === 'array') {
      currentSize = ass.this.length;
    } else if (type === 'set' || type === 'map') {
      currentSize = ass.this.size;
    } else if (type === 'object') {
      currentSize = Object.keys(ass.this).length;
    }

    // Генерируем события
    ass.emit('remove', { value, key, position });
    ass.emit('change', {
      prev: prev,
      next: ass.this,
      // Добавляем расширенную информацию
      detail: {
        type: type,
        operation: 'remove',
        value: value,
        key: key,
        position: position,
        prevSize: prevSize,
        currentSize: currentSize,
        // Для массивов - затронутые индексы (те, что сдвинулись)
        affectedIndices: type === 'array' && position !== undefined ?
                         Array.from({ length: prevSize - position - 1 }, (_, i) => position + i + 1) :
                         undefined
      }
    }, {
      method: 'remove',
      arguments: [value]
    });

    return ass.this;
  };
}
