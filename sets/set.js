/**
 * Универсальный метод set для установки значения по ключу
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function set(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function(key, value) {
    const type = ass.detect;
    const prev = ass.this;

    switch (type) {
      case 'array':
        ass.this[key] = value;
        break;

      case 'map':
        ass.this.set(key, value);
        break;

      case 'set':
        ass.this.add(value); // Для Set ключ игнорируется
        break;

      case 'object':
        ass.this[key] = value;
        break;

      case 'string':
        if (typeof key !== 'number' || key < 0 || key >= ass.this.length) {
          throw new Error('Invalid index for string');
        }
        ass.this = ass.this.slice(0, key) + value + ass.this.slice(key + 1);
        break;

      case 'number':
        if (typeof key !== 'number' || key < 0 || key >= String(ass.this).length) {
          throw new Error('Invalid index for number');
        }
        const str = String(ass.this);
        ass.this = Number(str.slice(0, key) + value + str.slice(key + 1));
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Генерируем события
    ass.emit('set', { key, value });
    ass.emit('change', {
      prev: prev,
      next: ass.this
    }, {
      method: 'set',
      arguments: [key, value]
    });

    return ass.this;
  };
}
