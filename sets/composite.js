/**
 * Модуль композитных операций
 *
 * Содержит методы для сложных операций модификации данных, таких как слияние,
 * замена и трансформация.
 */

import { Association } from "../association.js";

/**
 * Умное слияние с другой структурой данных
 *
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция merge или экземпляр Association
 */
export function merge(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.merge = ass.temp.merge || function(source) {
      const target = ass.this;

      // Копия объекта для события change
      const prevState = deepCopy(target);

      // Функция рекурсивного слияния
      const mergeInto = (target, source) => {
        // Если источник не определен, ничего не делаем
        if (source === undefined || source === null) {
          return target;
        }

        // Если target примитивный, просто возвращаем source
        if (target === null || target === undefined ||
            typeof target === 'number' || typeof target === 'string' ||
            typeof target === 'boolean' || typeof target === 'symbol' ||
            typeof target === 'bigint') {
          return source;
        }

        // Для массивов - сливаем элементы
        if (Array.isArray(target)) {
          if (Array.isArray(source)) {
            // Если source тоже массив, добавляем элементы в конец
            for (let i = 0; i < source.length; i++) {
              target.push(source[i]);

              // Генерируем событие для каждого элемента
              ass.emit('set', target.length - 1, source[i], undefined);
            }
          } else {
            // Если source не массив, добавляем его как элемент
            target.push(source);

            // Генерируем событие для всего массива
            ass.emit('set', target.length - 1, source, undefined);
          }
          return target;
        }

        // Для Map
        if (target instanceof Map) {
          if (source instanceof Map) {
            // Если source тоже Map, объединяем ключи
            source.forEach((value, key) => {
              const hasKey = target.has(key);
              const prevValue = hasKey ? target.get(key) : undefined;

              // Если оба значения - объекты, делаем рекурсивное слияние
              if (typeof value === 'object' && value !== null &&
                  typeof prevValue === 'object' && prevValue !== null) {
                target.set(key, mergeInto(prevValue, value));
              } else {
                target.set(key, value);
              }

              // Генерируем события для Map.set
              ass.emit('mapSet', key, value, prevValue);
            });
          } else if (source && typeof source === 'object') {
            // Если source - обычный объект, добавляем его ключи в Map
            Object.entries(source).forEach(([key, value]) => {
              const hasKey = target.has(key);
              const prevValue = hasKey ? target.get(key) : undefined;

              target.set(key, value);

              // Генерируем события для Map.set
              ass.emit('mapSet', key, value, prevValue);
            });
          }
          return target;
        }

        // Для Set
        if (target instanceof Set) {
          if (source instanceof Set) {
            // Если source тоже Set, объединяем значения
            source.forEach(value => {
              const hasValue = target.has(value);

              if (!hasValue) {
                target.add(value);

                // Генерируем события для Set.add
                ass.emit('setAdd', value);
              }
            });
          } else if (Array.isArray(source)) {
            // Если source - массив, добавляем его элементы в Set
            source.forEach(value => {
              const hasValue = target.has(value);

              if (!hasValue) {
                target.add(value);

                // Генерируем события для Set.add
                ass.emit('setAdd', value);
              }
            });
          } else if (source && typeof source === 'object') {
            // Если source - обычный объект, добавляем его значения в Set
            Object.values(source).forEach(value => {
              const hasValue = target.has(value);

              if (!hasValue) {
                target.add(value);

                // Генерируем события для Set.add
                ass.emit('setAdd', value);
              }
            });
          } else {
            // Для примитивного значения - просто добавляем в Set
            const hasValue = target.has(source);

            if (!hasValue) {
              target.add(source);

              // Генерируем события для Set.add
              ass.emit('setAdd', source);
            }
          }
          return target;
        }

        // Для обычных объектов - рекурсивное слияние
        if (typeof target === 'object' && typeof source === 'object' && source !== null) {
          Object.entries(source).forEach(([key, value]) => {
            // Если оба значения - объекты, делаем рекурсивное слияние
            if (target[key] !== undefined && typeof target[key] === 'object' &&
                typeof value === 'object' && value !== null) {
              mergeInto(target[key], value);
            } else {
              const prevValue = target[key];
              target[key] = value;

              // Генерируем события
              ass.emit('set', key, value, prevValue);
            }
          });
        }

        return target;
      };

      // Выполняем слияние
      mergeInto(target, source);

      // Генерируем событие слияния
      ass.emit('merge', source);

      // Генерируем общее событие change
      ass.emit('change', prevState, target, null, {
        method: 'merge',
        arguments: [source]
      });

      return ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [source] = args;
    return merge(ass, 'get')(source);
  }
}

/**
 * Полная замена значения в Association
 *
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция replace или экземпляр Association
 */
export function replace(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.replace = ass.temp.replace || function(newValue) {
      // Запоминаем предыдущее значение
      const prevValue = ass.this;

      if (typeof prevValue === 'object' && prevValue !== null &&
          typeof newValue === 'object' && newValue !== null) {

        // Очищаем все существующие свойства в объекте
        if (Array.isArray(prevValue)) {
          prevValue.length = 0;
          if (Array.isArray(newValue)) {
            // Копируем все элементы из нового массива
            for (let i = 0; i < newValue.length; i++) {
              prevValue[i] = newValue[i];
            }
          } else {
            // Преобразуем в объект, копируя свойства
            Object.assign(prevValue, newValue);
          }
        } else if (prevValue instanceof Map && newValue instanceof Map) {
          prevValue.clear();
          for (const [key, val] of newValue.entries()) {
            prevValue.set(key, val);
          }
        } else if (prevValue instanceof Set && newValue instanceof Set) {
          prevValue.clear();
          for (const val of newValue) {
            prevValue.add(val);
          }
        } else if (prevValue instanceof Map || prevValue instanceof Set) {
          // Если типы не совпадают, полностью заменяем
          ass.this = newValue;
        } else {
          // Объекты: удаляем все старые свойства и копируем новые
          for (const key of Object.keys(prevValue)) {
            delete prevValue[key];
          }
          Object.assign(prevValue, newValue);
        }
      } else {
        // Для примитивов или несовместимых типов - полная замена
        ass.this = newValue;
      }

      // Генерируем событие замены
      ass.emit('replace', ass.this, prevValue);

      // Генерируем общее событие change
      ass.emit('change', prevValue, ass.this, null, {
        method: 'replace',
        arguments: [newValue]
      });

      return ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [newValue] = args;
    return replace(ass, 'get')(newValue);
  }
}

/**
 * Применение функции трансформации к данным
 *
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция transform или экземпляр Association
 */
export function transform(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.transform = ass.temp.transform || function(transformFn) {
      if (typeof transformFn !== 'function') {
        throw new TypeError('Argument transformFn must be a function');
      }

      // Запоминаем предыдущее значение
      const prevValue = deepCopy(ass.this);

      // Применяем трансформацию
      const result = transformFn(ass.this);

      // Если функция вернула новое значение, используем его
      if (result !== undefined) {
        ass.this = result;
      }

      // Генерируем событие трансформации
      ass.emit('transform', ass.this, prevValue);

      // Генерируем общее событие change
      ass.emit('change', prevValue, ass.this, null, {
        method: 'transform',
        arguments: [transformFn]
      });

      return ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [transformer] = args;
    return transform(ass, 'get')(transformer);
  }
}

/**
 * Вспомогательная функция для создания глубокой копии объекта
 * @param {*} obj - Объект для клонирования
 * @returns {*} - Глубокая копия объекта
 */
function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Обработка массивов
  if (Array.isArray(obj)) {
    return obj.map(item => deepCopy(item));
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
        typeof key === 'object' ? deepCopy(key) : key,
        deepCopy(value)
      );
    });
    return clonedMap;
  }

  if (obj instanceof Set) {
    const clonedSet = new Set();
    obj.forEach(value => {
      clonedSet.add(deepCopy(value));
    });
    return clonedSet;
  }

  // Для обычных объектов
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCopy(obj[key]);
    }
  }
  return cloned;
}
