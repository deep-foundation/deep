/**
 * Модуль универсальных методов доступа (неизменяемые операции)
 *
 * Содержит набор методов для работы с данными, оптимизированных для использования
 * с классом Association. Эти методы не вносят изменений в исходные данные
 * и работают с различными типами данных.
 */

import { Association } from "./association.js";

/**
 * Выполняет перебор элементов коллекции или свойств объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {Association} - Исходный экземпляр Association
 */
export function forEach(ass, op, callback) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return ass;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        callback(value[i], i, value);
      }
    } else if (value instanceof Map) {
      value.forEach((val, key) => callback(val, key, value));
    } else if (value instanceof Set) {
      let index = 0;
      value.forEach(val => callback(val, index++, value));
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        callback(value[i], i, value);
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        callback(value[key], key, value);
      }
    }

    return ass;
  };
}

/**
 * Преобразует элементы коллекции или свойства объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {Array} - Новый массив с преобразованными значениями
 */
export function map(ass, op, callback) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;
    const result = [];

    if (value === null || value === undefined) {
      return result;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        result.push(callback(value[i], i, value));
      }
    } else if (value instanceof Map) {
      value.forEach((val, key) => {
        result.push(callback(val, key, value));
      });
    } else if (value instanceof Set) {
      let index = 0;
      value.forEach(val => {
        result.push(callback(val, index++, value));
      });
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        result.push(callback(value[i], i, value));
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        result.push(callback(value[key], key, value));
      }
    }

    return result;
  };
}

/**
 * Фильтрует элементы коллекции или свойства объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {Array} - Новый массив с отфильтрованными значениями
 */
export function filter(ass, op, callback) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;
    const result = [];

    if (value === null || value === undefined) {
      return result;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          result.push(value[i]);
        }
      }
    } else if (value instanceof Map) {
      value.forEach((val, key) => {
        if (callback(val, key, value)) {
          result.push(val);
        }
      });
    } else if (value instanceof Set) {
      let index = 0;
      value.forEach(val => {
        if (callback(val, index++, value)) {
          result.push(val);
        }
      });
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          result.push(value[i]);
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          result.push(value[key]);
        }
      }
    }

    return result;
  };
}

/**
 * Выполняет свертку элементов коллекции или свойств объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (accumulator, value, key, collection)
 * @param {*} [initialValue] - начальное значение аккумулятора
 * @returns {*} - Результат свертки
 */
export function reduce(ass, op, callback, initialValue) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback, initialValue) {
    const value = ass.this;
    let accumulator = initialValue;
    let startIndex = 0;

    if (value === null || value === undefined) {
      return initialValue;
    }

    // Если initialValue не указано, берем первый элемент как начальное значение
    if (arguments.length < 2) {
      if (Array.isArray(value) && value.length > 0) {
        accumulator = value[0];
        startIndex = 1;
      } else if (value instanceof Map && value.size > 0) {
        const firstEntry = value.entries().next().value;
        accumulator = firstEntry[1];
        startIndex = 1;
      } else if (value instanceof Set && value.size > 0) {
        accumulator = value.values().next().value;
        startIndex = 1;
      } else if (typeof value === 'string' && value.length > 0) {
        accumulator = value[0];
        startIndex = 1;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        const keys = Object.keys(value);
        accumulator = value[keys[0]];
        startIndex = 1;
      } else {
        return initialValue; // Пустая коллекция без initialValue
      }
    }

    if (Array.isArray(value)) {
      for (let i = startIndex; i < value.length; i++) {
        accumulator = callback(accumulator, value[i], i, value);
      }
    } else if (value instanceof Map) {
      let index = 0;
      value.forEach((val, key) => {
        if (index >= startIndex) {
          accumulator = callback(accumulator, val, key, value);
        }
        index++;
      });
    } else if (value instanceof Set) {
      let index = 0;
      value.forEach(val => {
        if (index >= startIndex) {
          accumulator = callback(accumulator, val, index, value);
        }
        index++;
      });
    } else if (typeof value === 'string') {
      for (let i = startIndex; i < value.length; i++) {
        accumulator = callback(accumulator, value[i], i, value);
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = startIndex; i < keys.length; i++) {
        const key = keys[i];
        accumulator = callback(accumulator, value[key], key, value);
      }
    }

    return accumulator;
  };
}

/**
 * Проверяет, удовлетворяют ли все элементы условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {boolean} - true, если все элементы удовлетворяют условию
 */
export function every(ass, op, callback) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return true;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (!callback(value[i], i, value)) {
          return false;
        }
      }
    } else if (value instanceof Map) {
      for (const [key, val] of value.entries()) {
        if (!callback(val, key, value)) {
          return false;
        }
      }
    } else if (value instanceof Set) {
      let index = 0;
      for (const val of value) {
        if (!callback(val, index++, value)) {
          return false;
        }
      }
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (!callback(value[i], i, value)) {
          return false;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!callback(value[key], key, value)) {
          return false;
        }
      }
    }

    return true;
  };
}

/**
 * Проверяет, удовлетворяет ли хотя бы один элемент условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {boolean} - true, если хотя бы один элемент удовлетворяет условию
 */
export function some(ass, op, callback) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return false;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return true;
        }
      }
    } else if (value instanceof Map) {
      for (const [key, val] of value.entries()) {
        if (callback(val, key, value)) {
          return true;
        }
      }
    } else if (value instanceof Set) {
      let index = 0;
      for (const val of value) {
        if (callback(val, index++, value)) {
          return true;
        }
      }
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return true;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          return true;
        }
      }
    }

    return false;
  };
}

/**
 * Ищет первый элемент, удовлетворяющий условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {*} - Найденный элемент или undefined
 */
export function find(ass, op, callback) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return value[i];
        }
      }
    } else if (value instanceof Map) {
      for (const [key, val] of value.entries()) {
        if (callback(val, key, value)) {
          return val;
        }
      }
    } else if (value instanceof Set) {
      let index = 0;
      for (const val of value) {
        if (callback(val, index++, value)) {
          return val;
        }
      }
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return value[i];
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          return value[key];
        }
      }
    }

    return undefined;
  };
}

/**
 * Ищет ключ первого элемента, удовлетворяющего условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {string|number|symbol} - Найденный ключ или undefined
 */
export function findKey(ass, op, callback) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return i;
        }
      }
    } else if (value instanceof Map) {
      for (const [key, val] of value.entries()) {
        if (callback(val, key, value)) {
          return key;
        }
      }
    } else if (value instanceof Set) {
      let index = 0;
      for (const val of value) {
        if (callback(val, index, value)) {
          return index;
        }
        index++;
      }
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return i;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          return key;
        }
      }
    }

    return undefined;
  };
}

/**
 * Возвращает массив ключей коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив ключей
 */
export function keys(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const value = ass.this;

    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return Array.from({ length: value.length }, (_, i) => i);
    } else if (value instanceof Map) {
      return Array.from(value.keys());
    } else if (value instanceof Set) {
      return Array.from({ length: value.size }, (_, i) => i);
    } else if (typeof value === 'string') {
      return Array.from({ length: value.length }, (_, i) => i);
    } else if (typeof value === 'object') {
      return Object.keys(value);
    }

    return [];
  };
}

/**
 * Возвращает массив значений коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив значений
 */
export function values(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const value = ass.this;

    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return [...value];
    } else if (value instanceof Map) {
      return Array.from(value.values());
    } else if (value instanceof Set) {
      return Array.from(value);
    } else if (typeof value === 'string') {
      return value.split('');
    } else if (typeof value === 'object') {
      return Object.values(value);
    }

    return [];
  };
}

/**
 * Возвращает массив пар [ключ, значение] коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив пар [ключ, значение]
 */
export function entries(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const value = ass.this;

    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((v, i) => [i, v]);
    } else if (value instanceof Map) {
      return Array.from(value.entries());
    } else if (value instanceof Set) {
      return Array.from(value).map((v, i) => [i, v]);
    } else if (typeof value === 'string') {
      return Array.from(value).map((v, i) => [i, v]);
    } else if (typeof value === 'object') {
      return Object.entries(value);
    }

    return [];
  };
}

/**
 * Объединяет элементы коллекции в строку
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {string} [separator=','] - Разделитель
 * @returns {string} - Объединенная строка
 */
export function join(ass, op, separator) {
  if (op !== 'get' && op !== 'apply') return;

  return function(separator = ',') {
    const value = ass.this;

    if (value === null || value === undefined) {
      return '';
    }

    if (Array.isArray(value)) {
      return value.join(separator);
    } else if (value instanceof Map) {
      return Array.from(value.values()).join(separator);
    } else if (value instanceof Set) {
      return Array.from(value).join(separator);
    } else if (typeof value === 'string') {
      return value.split('').join(separator);
    } else if (typeof value === 'object') {
      return Object.values(value).join(separator);
    }

    return String(value);
  };
}

/**
 * Группа всех методов для экспорта
 */
export const all = {
  forEach,
  map,
  filter,
  reduce,
  every,
  some,
  find,
  findKey,
  keys,
  values,
  entries,
  join
};

// Добавляем методы в прокси
for (const name in all) {
  Association._proxy.set(name, all[name]);
}
