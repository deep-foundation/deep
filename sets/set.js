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

    // Сохраняем прежнее значение, если оно есть
    let prevValue;
    // Флаг создания нового свойства
    let isNewProperty = false;

    switch (type) {
      case 'array':
        prevValue = ass.this[key];
        isNewProperty = key >= ass.this.length;
        ass.this[key] = value;
        break;

      case 'map':
        prevValue = ass.this.has(key) ? ass.this.get(key) : undefined;
        isNewProperty = !ass.this.has(key);
        ass.this.set(key, value);
        break;

      case 'weakmap':
        if (typeof key !== 'object' || key === null) {
          throw new Error('WeakMap keys must be objects');
        }
        prevValue = ass.this.has(key) ? ass.this.get(key) : undefined;
        isNewProperty = !ass.this.has(key);
        ass.this.set(key, value);
        break;

      case 'set':
        prevValue = undefined; // Set не хранит пары ключ-значение
        isNewProperty = !ass.this.has(value);
        ass.this.add(value); // Для Set ключ игнорируется
        break;

      case 'weakset':
        throw new Error('Use add() method for WeakSet instead of set()');

      case 'object':
        prevValue = ass.this[key];
        isNewProperty = !(key in ass.this);
        ass.this[key] = value;
        break;

      case 'string':
        if (typeof key !== 'number' || key < 0 || key >= ass.this.length) {
          throw new Error('Invalid index for string');
        }
        prevValue = ass.this[key];
        ass.this = ass.this.slice(0, key) + value + ass.this.slice(key + 1);
        break;

      case 'number':
        if (typeof key !== 'number' || key < 0 || key >= String(ass.this).length) {
          throw new Error('Invalid index for number');
        }
        const str = String(ass.this);
        prevValue = str[key];
        ass.this = Number(str.slice(0, key) + value + str.slice(key + 1));
        break;

      default:
        throw new Error(`unexpected type ${type}`);
    }

    // Генерируем события
    ass.emit('set', { key, value, prevValue, isNewProperty });
    ass.emit('change', {
      prev: prev,
      next: ass.this,
      // Добавляем расширенную информацию
      detail: {
        type: type,
        operation: 'set',
        key: key,
        value: value,
        prevValue: prevValue,
        // Флаг, указывающий на создание нового свойства
        isNewProperty: isNewProperty,
        // Информация о позиции в массиве или объекте
        position: (type === 'array' || type === 'string' || type === 'number') ? key : undefined,
        // Размер коллекции
        size: type === 'array' ? ass.this.length :
              type === 'set' ? ass.this.size :
              type === 'map' ? ass.this.size :
              type === 'object' ? Object.keys(ass.this).length :
              type === 'string' ? ass.this.length :
              type === 'number' ? String(ass.this).length : undefined
      }
    }, {
      method: 'set',
      arguments: [key, value]
    });

    return ass.this;
  };
}
