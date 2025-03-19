/**
 * Модуль специфических операций с объектами
 *
 * Содержит методы для операций, специфичных для объектов, таких как создание, клонирование,
 * получение списка ключей, значений и пар ключ-значение.
 */

import { Association } from "../association.js";

/**
 * Создание нового пустого объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция create или экземпляр Association
 */
export function create(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.create = ass.temp.create || function() {
      // Создаем новый объект
      const newObj = {};

      // Заменяем текущий объект
      const prev = ass.this;
      ass.this = newObj;

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('create', newObj);

        // Генерируем общее событие change
        ass.events.emit('change', prev, newObj, null, {
          method: 'create',
          arguments: []
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    return create(ass, 'get')();
  }
}

/**
 * Создание глубокой копии объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция clone или экземпляр Association
 */
export function clone(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.clone = ass.temp.clone || function() {
      const target = ass.this;

      // Функция глубокого клонирования
      const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') {
          return obj;
        }

        // Обработка массивов
        if (Array.isArray(obj)) {
          return obj.map(item => deepClone(item));
        }

        // Обработка объектов
        if (obj instanceof Date) {
          return new Date(obj);
        }

        if (obj instanceof RegExp) {
          return new RegExp(obj);
        }

        if (obj instanceof Map) {
          const clonedMap = new Map();
          obj.forEach((value, key) => {
            clonedMap.set(
              typeof key === 'object' ? deepClone(key) : key,
              deepClone(value)
            );
          });
          return clonedMap;
        }

        if (obj instanceof Set) {
          const clonedSet = new Set();
          obj.forEach(value => {
            clonedSet.add(deepClone(value));
          });
          return clonedSet;
        }

        // Для обычных объектов
        const cloned = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
          }
        }
        return cloned;
      };

      // Сохраняем исходный объект для события
      const prev = target;

      // Создаем глубокую копию
      const cloned = deepClone(target);

      // Заменяем текущий объект на копию
      ass.this = cloned;

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('clone', cloned, prev);

        // Генерируем общее событие change
        ass.events.emit('change', prev, cloned, null, {
          method: 'clone',
          arguments: []
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    return clone(ass, 'get')();
  }
}

/**
 * Получение списка ключей объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Array} - Функция keys или массив ключей
 */
export function keys(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.keys = ass.temp.keys || function() {
      const target = ass.this;

      // Обработка примитивных типов
      if (target === null || target === undefined) {
        return [];
      }

      if (typeof target === 'string') {
        return Array.from({ length: target.length }, (_, i) => i);
      }

      if (typeof target === 'number' || typeof target === 'boolean' ||
          typeof target === 'symbol' || typeof target === 'bigint') {
        return [];
      }

      // Получаем ключи в зависимости от типа объекта
      if (Array.isArray(target)) {
        // Возвращаем числовые индексы для массивов, а не строки
        return Array.from({ length: target.length }, (_, i) => i);
      } else if (target instanceof Map || target instanceof Set) {
        return Array.from(target.keys());
      } else if (typeof target === 'object') {
        return Object.keys(target);
      }

      return [];
    };
  } else if (op === 'apply') {
    return keys(ass, 'get')();
  }
}

/**
 * Получение списка значений объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Array} - Функция values или массив значений
 */
export function values(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.values = ass.temp.values || function() {
      const target = ass.this;

      // Обработка примитивных типов
      if (target === null || target === undefined) {
        return [];
      }

      if (typeof target === 'string') {
        return target.split('');
      }

      if (typeof target === 'number' || typeof target === 'boolean' ||
          typeof target === 'symbol' || typeof target === 'bigint') {
        return [target];
      }

      // Получаем значения в зависимости от типа объекта
      if (Array.isArray(target)) {
        return [...target];
      } else if (target instanceof Map) {
        return Array.from(target.values());
      } else if (target instanceof Set) {
        return Array.from(target);
      } else if (typeof target === 'object') {
        return Object.values(target);
      }

      return [];
    };
  } else if (op === 'apply') {
    return values(ass, 'get')();
  }
}

/**
 * Получение списка пар [ключ, значение] объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Array} - Функция entries или массив пар [ключ, значение]
 */
export function entries(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.entries = ass.temp.entries || function() {
      const target = ass.this;

      // Обработка примитивных типов
      if (target === null || target === undefined) {
        return [];
      }

      if (typeof target === 'string') {
        return target.split('').map((char, i) => [i, char]);
      }

      if (typeof target === 'number' || typeof target === 'boolean' ||
          typeof target === 'symbol' || typeof target === 'bigint') {
        return [[0, target]];
      }

      // Получаем пары [ключ, значение] в зависимости от типа объекта
      if (Array.isArray(target)) {
        return target.map((value, index) => [index, value]);
      } else if (target instanceof Map) {
        return Array.from(target.entries());
      } else if (target instanceof Set) {
        return Array.from(target).map(value => [value, value]);
      } else if (typeof target === 'object') {
        return Object.entries(target);
      }

      return [];
    };
  } else if (op === 'apply') {
    return entries(ass, 'get')();
  }
}

/**
 * Копирование свойств из объекта-источника в целевой объект (аналог Object.assign)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция assign или экземпляр Association
 */
export function assign(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.assign = ass.temp.assign || function(...sources) {
      const target = ass.this;

      // Проверяем, что target не примитивный тип
      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Object.assign called on non-object');
      }

      // Сохраняем предыдущее состояние для события change
      const prevState = { ...target };

      // Применяем Object.assign
      Object.assign(target, ...sources);

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('assign', sources);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, null, {
          method: 'assign',
          arguments: sources
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    return assign(ass, 'get')(...args);
  }
}

/**
 * Определение свойства с дескриптором (аналог Object.defineProperty)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция defineProperty или экземпляр Association
 */
export function defineProperty(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.defineProperty = ass.temp.defineProperty || function(key, descriptor) {
      const target = ass.this;

      // Проверяем, что target не примитивный тип
      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Object.defineProperty called on non-object');
      }

      // Сохраняем предыдущее состояние для события change
      const prevState = { ...target };
      const prevValue = target[key];

      // Применяем Object.defineProperty
      Object.defineProperty(target, key, descriptor);

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('defineProperty', key, descriptor, prevValue);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, key, {
          method: 'defineProperty',
          arguments: [key, descriptor]
        });
      }

      return ass;
    };
  } else if (op === 'apply' && args.length >= 2) {
    const [key, descriptor] = args;
    return defineProperty(ass, 'get')(key, descriptor);
  }
}
