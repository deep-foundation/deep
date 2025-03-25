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

    switch (type) {
      case 'array':
        ass.this.push(value);
        break;

      case 'map':
        ass.this.set(value, value);
        break;

      case 'weakmap':
        if (typeof value !== 'object' || value === null) {
          throw new Error('WeakMap keys must be objects');
        }
        ass.this.set(value, value);
        break;

      case 'set':
        ass.this.add(value);
        break;

      case 'weakset':
        if (typeof value !== 'object' || value === null) {
          throw new Error('WeakSet values must be objects');
        }
        ass.this.add(value);
        break;

      case 'object':
        const key = Object.keys(ass.this).length;
        ass.this[key] = value;
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Генерируем события
    ass.emit('add', { value });
    ass.emit('change', {
      prev: prev,
      next: ass.this
    }, {
      method: 'add',
      arguments: [value]
    });

    return ass.this;
  };
}
