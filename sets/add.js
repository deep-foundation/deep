/**
 * Универсальный метод add для добавления значения в коллекцию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function add(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function(value) {
    const type = ass.detect;
    const prev = ass.this;

    // Информация о добавленном элементе
    let addedKey;

    switch (type) {
      case 'array':
        // Сохраняем индекс, куда будет добавлен элемент
        addedKey = ass.this.length;
        ass.this.push(value);
        break;

      case 'map':
        addedKey = value;
        ass.this.set(value, value);
        break;

      case 'weakmap':
        if (typeof value !== 'object' || value === null) {
          throw new Error('WeakMap keys must be objects');
        }
        addedKey = value;
        ass.this.set(value, value);
        break;

      case 'set':
        // Для множества ключом является само значение
        addedKey = value;
        ass.this.add(value);
        break;

      case 'weakset':
        if (typeof value !== 'object' || value === null) {
          throw new Error('WeakSet values must be objects');
        }
        addedKey = value;
        ass.this.add(value);
        break;

      case 'object':
        addedKey = Object.keys(ass.this).length;
        ass.this[addedKey] = value;
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Генерируем события
    ass.emit('add', { value, key: addedKey });
    ass.emit('change', {
      prev: prev,
      next: ass.this,
      // Добавляем расширенную информацию
      detail: {
        type: type,
        operation: 'add',
        key: addedKey,
        value: value,
        // Позиция в коллекции для массивов и объектов
        position: type === 'array' || type === 'object' ? addedKey : undefined,
        // Размер коллекции после изменения
        size: type === 'array' ? ass.this.length :
              type === 'set' ? ass.this.size :
              type === 'map' ? ass.this.size :
              type === 'object' ? Object.keys(ass.this).length : undefined
      }
    }, {
      method: 'add',
      arguments: [value]
    });

    return ass.this;
  };
}
