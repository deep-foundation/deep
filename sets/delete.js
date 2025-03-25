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

    switch (type) {
      case 'array':
        if (typeof key !== 'number' || key < 0 || key >= ass.this.length) {
          throw new Error('Invalid index for array');
        }
        ass.this.splice(key, 1);
        break;

      case 'map':
        if (!ass.this.has(key)) {
          throw new Error('Key not found in map');
        }
        ass.this.delete(key);
        break;

      case 'weakmap':
        if (typeof key !== 'object' || key === null) {
          throw new Error('WeakMap keys must be objects');
        }
        if (!ass.this.has(key)) {
          throw new Error('Key not found in weakmap');
        }
        ass.this.delete(key);
        break;

      case 'set':
        if (!ass.this.has(key)) {
          throw new Error('Value not found in set');
        }
        ass.this.delete(key);
        break;

      case 'weakset':
        if (typeof key !== 'object' || key === null) {
          throw new Error('WeakSet values must be objects');
        }
        if (!ass.this.has(key)) {
          throw new Error('Value not found in weakset');
        }
        ass.this.delete(key);
        break;

      case 'object':
        if (!(key in ass.this)) {
          throw new Error('Property not found in object');
        }
        delete ass.this[key];
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Генерируем события
    ass.emit('delete', { key });
    ass.emit('change', {
      prev: prev,
      next: ass.this
    }, {
      method: 'delete',
      arguments: [key]
    });

    return ass.this;
  };
}
