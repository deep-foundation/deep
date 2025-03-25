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

    switch (type) {
      case 'array':
        key = ass.this.indexOf(value);
        if (key === -1) {
          throw new Error('Value not found in array');
        }
        ass.this.splice(key, 1);
        break;

      case 'map':
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
        if (!ass.this.has(value)) {
          throw new Error('Value not found in set');
        }
        ass.this.delete(value);
        break;

      case 'object':
        // Находим ключ, соответствующий значению
        key = Object.keys(ass.this).find(k => ass.this[k] === value);
        if (key === undefined) {
          throw new Error('Value not found in object');
        }
        delete ass.this[key];
        break;

      case 'weakset':
        if (typeof value !== 'object' || value === null) {
          throw new Error('WeakSet values must be objects');
        }
        if (!ass.this.has(value)) {
          throw new Error('Value not found in weakset');
        }
        ass.this.delete(value);
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Генерируем события
    ass.emit('remove', { value, key });
    ass.emit('change', {
      prev: prev,
      next: ass.this
    }, {
      method: 'remove',
      arguments: [value]
    });

    return ass.this;
  };
}
