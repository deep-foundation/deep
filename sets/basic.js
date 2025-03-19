/**
 * Модуль для базовых операций с наборами данных
 *
 * Содержит методы для работы с основными типами коллекций: Set, Map, Array, Object
 */

import { Association } from "../association.js";

/**
 * Добавляет элемент в набор данных
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция add или экземпляр Association
 */
export function add(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.add = ass.temp.add || function(key, value) {
      const target = ass.this;

      if (target === null || target === undefined) {
        throw new TypeError('Cannot add to null or undefined');
      }

      if (Array.isArray(target)) {
        // Для массивов, если указан ключ (индекс), устанавливаем по индексу, иначе push
        if (key !== undefined) {
          if (typeof key !== 'number') {
            throw new TypeError('Array key must be a number');
          }
          // Если индекс больше длины, расширяем массив
          if (key >= target.length) {
            target.length = key + 1;
          }
          target[key] = value !== undefined ? value : key;
        } else {
          target.push(value);
        }
      } else if (target instanceof Map) {
        // Для Map используем set
        target.set(key, value);
      } else if (target instanceof Set) {
        // Для Set используем add
        target.add(value !== undefined ? value : key);
      } else if (typeof target === 'object') {
        // Для объектов устанавливаем свойство
        target[key] = value;
      }

      return ass;
    };
  } else if (op === 'apply') {
    const [key, value] = args;
    return add(ass, 'get')(key, value);
  }
}

/**
 * Удаляет элемент из набора данных
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция remove или экземпляр Association
 */
export function remove(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.remove = ass.temp.remove || function(key) {
      const target = ass.this;

      if (target === null || target === undefined) {
        throw new TypeError('Cannot remove from null or undefined');
      }

      if (Array.isArray(target)) {
        // Для массивов, если key - это число, удаляем по индексу, иначе удаляем все вхождения значения
        if (typeof key === 'number') {
          if (key >= 0 && key < target.length) {
            target.splice(key, 1);
          }
        } else {
          // Удаляем все элементы, равные key
          let i = target.length;
          while (i--) {
            if (target[i] === key) {
              target.splice(i, 1);
            }
          }
        }
      } else if (target instanceof Map) {
        // Для Map используем delete
        target.delete(key);
      } else if (target instanceof Set) {
        // Для Set используем delete
        target.delete(key);
      } else if (typeof target === 'object') {
        // Для объектов удаляем свойство
        delete target[key];
      }

      return ass;
    };
  } else if (op === 'apply') {
    const [key] = args;
    return remove(ass, 'get')(key);
  }
}

/**
 * Проверяет наличие элемента в наборе данных
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|boolean} - Функция has или результат проверки
 */
export function has(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.has = ass.temp.has || function(key) {
      const target = ass.this;

      if (target === null || target === undefined) {
        return false;
      }

      if (Array.isArray(target)) {
        // Для массивов проверяем, есть ли индекс или значение
        if (typeof key === 'number') {
          return key >= 0 && key < target.length && target[key] !== undefined;
        } else {
          return target.includes(key);
        }
      } else if (target instanceof Map) {
        // Для Map используем has
        return target.has(key);
      } else if (target instanceof Set) {
        // Для Set используем has
        return target.has(key);
      } else if (typeof target === 'object') {
        // Для объектов проверяем наличие свойства
        return Object.prototype.hasOwnProperty.call(target, key);
      }

      return false;
    };
  } else if (op === 'apply') {
    const [key] = args;
    return has(ass, 'get')(key);
  }
}

/**
 * Возвращает элемент из набора данных
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|any} - Функция get или полученный элемент
 */
export function get(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.get = ass.temp.get || function(key, defaultValue) {
      const target = ass.this;

      if (target === null || target === undefined) {
        return defaultValue;
      }

      if (Array.isArray(target)) {
        // Для массивов возвращаем элемент по индексу
        if (typeof key === 'number' && key >= 0 && key < target.length) {
          return target[key] !== undefined ? target[key] : defaultValue;
        }
        return defaultValue;
      } else if (target instanceof Map) {
        // Для Map используем get
        return target.has(key) ? target.get(key) : defaultValue;
      } else if (target instanceof Set) {
        // Для Set проверяем наличие и возвращаем сам элемент, если он есть
        return target.has(key) ? key : defaultValue;
      } else if (typeof target === 'object') {
        // Для объектов возвращаем свойство
        return Object.prototype.hasOwnProperty.call(target, key) ? target[key] : defaultValue;
      }

      return defaultValue;
    };
  } else if (op === 'apply') {
    const [key, defaultValue] = args;
    return get(ass, 'get')(key, defaultValue);
  }
}

/**
 * Очищает набор данных
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция clear или экземпляр Association
 */
export function clear(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.clear = ass.temp.clear || function() {
      const target = ass.this;

      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Cannot clear primitive values');
      }

      if (Array.isArray(target)) {
        // Для массивов устанавливаем длину в 0
        target.length = 0;
      } else if (target instanceof Map || target instanceof Set) {
        // Для Map и Set используем встроенный метод clear
        target.clear();
      } else if (typeof target === 'object') {
        // Для объектов удаляем все собственные перечисляемые свойства
        Object.keys(target).forEach(key => {
          delete target[key];
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    return clear(ass, 'get')();
  }
}

/**
 * Возвращает размер набора данных
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|number} - Функция size или размер набора
 */
export function size(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.size = ass.temp.size || function() {
      const target = ass.this;

      if (target === null || target === undefined) {
        return 0;
      }

      if (Array.isArray(target)) {
        // Для массивов возвращаем длину
        return target.length;
      } else if (target instanceof Map || target instanceof Set) {
        // Для Map и Set используем свойство size
        return target.size;
      } else if (typeof target === 'object') {
        // Для объектов возвращаем количество собственных перечисляемых свойств
        return Object.keys(target).length;
      }

      return 0;
    };
  } else if (op === 'apply') {
    return size(ass, 'get')();
  }
}

/**
 * Преобразует набор данных в новый тип
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|any} - Функция convert или преобразованные данные
 */
export function convert(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.convert = ass.temp.convert || function(type) {
      const target = ass.this;

      if (target === null || target === undefined) {
        return null;
      }

      switch(type) {
        case 'array':
          if (Array.isArray(target)) {
            return [...target];
          } else if (target instanceof Map) {
            return Array.from(target.entries());
          } else if (target instanceof Set) {
            return Array.from(target);
          } else if (typeof target === 'object') {
            return Object.entries(target);
          }
          break;

        case 'map':
          if (Array.isArray(target)) {
            return new Map(target.map((value, index) => [index, value]));
          } else if (target instanceof Map) {
            return new Map(target);
          } else if (target instanceof Set) {
            return new Map(Array.from(target).map(value => [value, value]));
          } else if (typeof target === 'object') {
            return new Map(Object.entries(target));
          }
          break;

        case 'set':
          if (Array.isArray(target)) {
            return new Set(target);
          } else if (target instanceof Map) {
            return new Set(target.values());
          } else if (target instanceof Set) {
            return new Set(target);
          } else if (typeof target === 'object') {
            return new Set(Object.values(target));
          }
          break;

        case 'object':
          if (Array.isArray(target)) {
            return Object.assign({}, target);
          } else if (target instanceof Map) {
            return Object.fromEntries(target);
          } else if (target instanceof Set) {
            return Array.from(target).reduce((obj, value, index) => {
              obj[index] = value;
              return obj;
            }, {});
          } else if (typeof target === 'object') {
            return {...target};
          }
          break;

        case 'json':
          return JSON.stringify(target);

        default:
          throw new TypeError(`Unsupported conversion type: ${type}`);
      }

      return null;
    };
  } else if (op === 'apply') {
    const [type] = args;
    return convert(ass, 'get')(type);
  }
}

/**
 * Создает новую копию объекта или массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|any} - Функция clone или клонированный объект
 */
export function clone(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.clone = ass.temp.clone || function(deep = false) {
      const target = ass.this;

      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        return target;
      }

      // Глубокое клонирование с помощью структурного клонирования
      if (deep) {
        try {
          return JSON.parse(JSON.stringify(target));
        } catch (e) {
          // Если не удалось с помощью JSON, используем стандартное клонирование
        }
      }

      if (Array.isArray(target)) {
        return [...target];
      } else if (target instanceof Map) {
        return new Map(target);
      } else if (target instanceof Set) {
        return new Set(target);
      } else if (typeof target === 'object') {
        return {...target};
      }

      return target;
    };
  } else if (op === 'apply') {
    const [deep] = args;
    return clone(ass, 'get')(deep);
  }
}

/**
 * Слияние двух наборов данных
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция merge или экземпляр Association
 */
export function merge(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.merge = ass.temp.merge || function(source, options = {}) {
      const target = ass.this;

      if (target === null || target === undefined) {
        throw new TypeError('Cannot merge into null or undefined');
      }

      if (source === null || source === undefined) {
        return ass;
      }

      // Опции слияния
      const deep = options.deep || false;
      const overwrite = options.overwrite !== false; // По умолчанию true

      // Вспомогательная функция для глубокого слияния объектов
      function deepMerge(target, source) {
        if (typeof source !== 'object' || source === null) {
          return source;
        }

        if (typeof target !== 'object' || target === null) {
          return Array.isArray(source) ? [...source] : {...source};
        }

        if (Array.isArray(source)) {
          if (!Array.isArray(target)) {
            return [...source];
          }

          const result = [...target];
          source.forEach((item, index) => {
            if (index >= result.length) {
              result.push(deep ? deepMerge(undefined, item) : item);
            } else if (overwrite) {
              result[index] = deep ? deepMerge(result[index], item) : item;
            }
          });

          return result;
        }

        const result = {...target};
        Object.keys(source).forEach(key => {
          if (!(key in result)) {
            result[key] = deep ? deepMerge(undefined, source[key]) : source[key];
          } else if (overwrite) {
            result[key] = deep ? deepMerge(result[key], source[key]) : source[key];
          }
        });

        return result;
      }

      if (Array.isArray(target)) {
        if (Array.isArray(source)) {
          // Массив в массив
          if (deep) {
            const result = deepMerge(target, source);
            target.length = 0;
            target.push(...result);
          } else {
            if (overwrite) {
              // Перезаписываем элементы
              source.forEach((item, index) => {
                if (index < target.length) {
                  target[index] = item;
                } else {
                  target.push(item);
                }
              });
            } else {
              // Добавляем только новые элементы
              target.push(...source);
            }
          }
        } else if (source instanceof Map || source instanceof Set || typeof source === 'object') {
          // Преобразуем source в массив и сливаем
          const sourceArray =
            source instanceof Map ? Array.from(source.entries()) :
            source instanceof Set ? Array.from(source) :
            Object.entries(source);

          if (deep) {
            const result = deepMerge(target, sourceArray);
            target.length = 0;
            target.push(...result);
          } else {
            if (overwrite) {
              sourceArray.forEach((item, index) => {
                if (index < target.length) {
                  target[index] = item;
                } else {
                  target.push(item);
                }
              });
            } else {
              target.push(...sourceArray);
            }
          }
        }
      } else if (target instanceof Map) {
        if (source instanceof Map) {
          // Map в Map
          source.forEach((value, key) => {
            if (!target.has(key) || overwrite) {
              target.set(key, deep && typeof value === 'object' && value !== null
                ? deepMerge(target.get(key), value)
                : value);
            }
          });
        } else if (Array.isArray(source)) {
          // Массив в Map (ожидаем пары [ключ, значение])
          source.forEach(entry => {
            if (Array.isArray(entry) && entry.length >= 2) {
              const [key, value] = entry;
              if (!target.has(key) || overwrite) {
                target.set(key, deep && typeof value === 'object' && value !== null
                  ? deepMerge(target.get(key), value)
                  : value);
              }
            }
          });
        } else if (typeof source === 'object') {
          // Объект в Map
          Object.entries(source).forEach(([key, value]) => {
            if (!target.has(key) || overwrite) {
              target.set(key, deep && typeof value === 'object' && value !== null
                ? deepMerge(target.get(key), value)
                : value);
            }
          });
        }
      } else if (target instanceof Set) {
        if (source instanceof Set) {
          // Set в Set
          source.forEach(value => {
            target.add(value);
          });
        } else if (Array.isArray(source)) {
          // Массив в Set
          source.forEach(value => {
            target.add(value);
          });
        } else if (typeof source === 'object') {
          // Объект в Set
          Object.values(source).forEach(value => {
            target.add(value);
          });
        }
      } else if (typeof target === 'object') {
        if (typeof source === 'object' && !(source instanceof Map) && !(source instanceof Set)) {
          // Объект в объект
          if (deep) {
            const result = deepMerge(target, source);
            Object.keys(target).forEach(key => {
              delete target[key];
            });
            Object.entries(result).forEach(([key, value]) => {
              target[key] = value;
            });
          } else {
            Object.entries(source).forEach(([key, value]) => {
              if (!(key in target) || overwrite) {
                target[key] = value;
              }
            });
          }
        } else if (Array.isArray(source)) {
          // Массив в объект
          source.forEach((value, index) => {
            const key = index.toString();
            if (!(key in target) || overwrite) {
              target[key] = value;
            }
          });
        } else if (source instanceof Map) {
          // Map в объект
          source.forEach((value, key) => {
            const stringKey = String(key);
            if (!(stringKey in target) || overwrite) {
              target[stringKey] = value;
            }
          });
        }
      }

      return ass;
    };
  } else if (op === 'apply') {
    const [source, options] = args;
    return merge(ass, 'get')(source, options);
  }
}

/**
 * Модуль базовых операций с объектами
 *
 * Содержит методы для основных операций с объектами: установка, удаление, очистка и т.д.
 */

/**
 * Установка значения по ключу
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply', 'set')
 * @param {Array} args - Аргументы операции
 * @returns {Function|any} - Функция установки или результат операции
 */
export function set(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.set = ass.temp.set || function(key, value) {
      const target = ass.this;

      // Проверяем, что target не примитивный тип
      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Cannot set properties on primitive values');
      }

      const prev = target[key];
      target[key] = value;

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('set', key, value, prev);

        // Генерируем общее событие change
        ass.events.emit('change', { ...target, [key]: prev }, target, key, {
          method: 'set',
          arguments: [key, value]
        });
      }

      return ass;
    };
  } else if (op === 'apply' && args.length >= 2) {
    const [key, value] = args;
    return set(ass, 'get')(key, value);
  }
}

/**
 * Удаление значения по ключу
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|any} - Функция удаления или результат операции
 */
export function delete_(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp['delete'] = ass.temp['delete'] || function(key) {
      const target = ass.this;

      // Проверяем, что target не примитивный тип
      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Cannot delete properties from primitive values');
      }

      // Запоминаем предыдущее значение и проверяем наличие ключа
      const hadKey = key in target;
      const prev = target[key];

      // Создаем копию для события change
      const prevState = { ...target };

      // Выполняем операцию
      const result = delete target[key];

      // Генерируем события только если ключ существовал
      if (hadKey && ass.events && ass.events.emit) {
        ass.events.emit('delete', key, prev);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, key, {
          method: 'delete',
          arguments: [key]
        });
      }

      return result;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [key] = args;
    return delete_(ass, 'get')(key);
  }
}

