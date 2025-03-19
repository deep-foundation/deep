/**
 * Модуль комплексных операций
 *
 * Содержит методы для сложных операций с данными, таких как upsert, patch и batch.
 */

import { Association } from "../association.js";

/**
 * Обновление если существует, иначе создание записи
 *
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция upsert или экземпляр Association
 */
export function upsert(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.upsert = ass.temp.upsert || function(key, value, createFn, options = {}) {
      const target = ass.this;

      // Проверяем, что target не примитивный тип
      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Cannot upsert properties on primitive values');
      }

      // Флаг, указывающий, существует ли запись
      let exists = false;
      // Предыдущее значение
      let prevValue;
      // Результат обновления или создания
      let result;

      // Обработка в зависимости от типа объекта
      if (Array.isArray(target)) {
        if (typeof key === 'number' && key >= 0 && key < target.length) {
          // Запись существует, обновляем
          exists = true;
          prevValue = target[key];
          target[key] = value;
          result = value;
        } else if (typeof key === 'number' && key >= 0) {
          // Создаем новую запись
          // Заполняем пустые места, если индекс больше текущей длины
          if (key > target.length) {
            for (let i = target.length; i < key; i++) {
              target[i] = createFn ? createFn(i) : undefined;
            }
          }
          target[key] = value;
          result = value;
        } else {
          // Добавляем в конец массива (если ключ не число или отрицательный)
          key = target.length;
          target.push(value);
          result = value;
        }
      } else if (target instanceof Map) {
        exists = target.has(key);
        prevValue = exists ? target.get(key) : undefined;

        if (exists) {
          // Обновляем значение
          target.set(key, value);
          result = value;
        } else if (createFn) {
          // Создаем значение с помощью фабричной функции
          const newValue = createFn(key);
          target.set(key, newValue);
          result = newValue;
        } else {
          // Просто устанавливаем новое значение
          target.set(key, value);
          result = value;
        }
      } else if (target instanceof Set) {
        exists = target.has(key);
        prevValue = exists ? key : undefined;

        if (!exists) {
          // Для Set ключ и значение - это одно и то же
          const valueToAdd = (key !== undefined) ? key : value;
          target.add(valueToAdd);
          result = valueToAdd;
        } else {
          // Для Set нельзя обновить существующий элемент
          // Просто возвращаем существующий элемент
          result = key;
        }
      } else if (typeof target === 'object') {
        // Обычный объект
        exists = key in target;
        prevValue = target[key];

        if (exists) {
          // Обновляем значение
          target[key] = value;
          result = value;
        } else if (createFn) {
          // Создаем значение с помощью фабричной функции
          const newValue = createFn(key);
          target[key] = newValue;
          result = newValue;
        } else {
          // Просто устанавливаем новое значение
          target[key] = value;
          result = value;
        }
      }

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('upsert', key, result, prevValue, exists);

        // Генерируем соответствующее событие в зависимости от типа операции
        if (exists) {
          if (target instanceof Map) {
            ass.events.emit('mapSet', key, result, prevValue);
          } else if (target instanceof Set) {
            // Для Set ничего не делаем, так как элемент уже существует
          } else {
            ass.events.emit('set', key, result, prevValue);
          }
        } else {
          if (target instanceof Map) {
            ass.events.emit('mapSet', key, result, undefined);
          } else if (target instanceof Set) {
            ass.events.emit('setAdd', result);
          } else if (Array.isArray(target)) {
            ass.events.emit('set', key, result, undefined);
          } else {
            ass.events.emit('set', key, result, undefined);
          }
        }

        // Создаем копию предыдущего состояния
        let prevState;

        if (target instanceof Map || target instanceof Set) {
          prevState = new Map();
          if (exists) {
            prevState.set(key, prevValue);
          }
          if (!exists) {
            prevState.delete(result);
          }
        } else {
          prevState = { ...target };
          if (exists) {
            prevState[key] = prevValue;
          } else {
            delete prevState[key];
          }
        }

        ass.events.emit('change', prevState, target, key, {
          method: 'upsert',
          arguments: [key, value, createFn]
        });
      }

      // Возвращаем ass, чтобы тесты проходили
      return options.returnResults ? result : ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [key, value, createFn, options] = args;
    return upsert(ass, 'get')(key, value, createFn, options);
  }
}

/**
 * Применение набора операций в стиле JSON Patch
 *
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция patch или экземпляр Association
 */
export function patch(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.patch = ass.temp.patch || function(operations, options = {}) {
      const target = ass.this;

      // Проверяем, что target не примитивный тип
      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Cannot patch primitive values');
      }

      // Проверяем, что operations - массив
      if (!Array.isArray(operations)) {
        throw new TypeError('Operations must be an array');
      }

      // Копия объекта для события change
      const prevState = deepCopy(target);

      // Результаты операций
      const results = [];

      // Применяем операции
      for (const operation of operations) {
        const { op, path, value, from } = operation;

        if (!op || !path) {
          throw new Error('Invalid operation: missing op or path');
        }

        // Разбираем путь
        const pathParts = parsePath(path);

        // Применяем операцию
        let result;

        switch (op.toLowerCase()) {
          case 'add':
            result = addOperation(target, pathParts, value);
            break;
          case 'remove':
            result = removeOperation(target, pathParts);
            break;
          case 'replace':
            result = replaceOperation(target, pathParts, value);
            break;
          case 'move':
            if (!from) {
              throw new Error('Move operation requires "from" field');
            }
            result = moveOperation(target, parsePath(from), pathParts);
            break;
          case 'copy':
            if (!from) {
              throw new Error('Copy operation requires "from" field');
            }
            result = copyOperation(target, parsePath(from), pathParts);
            break;
          case 'test':
            result = testOperation(target, pathParts, value);
            break;
          default:
            throw new Error(`Unknown operation: ${op}`);
        }

        results.push(result);
      }

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('patch', operations, results);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, null, {
          method: 'patch',
          arguments: [operations]
        });
      }

      return options.returnResults ? results : ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [operations, options] = args;
    return patch(ass, 'get')(operations, options);
  }
}

/**
 * Выполнение пакетных операций
 *
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция batch или экземпляр Association
 */
export function batch(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.batch = ass.temp.batch || function(operations, options = {}) {
      const target = ass.this;

      // Проверяем, что target не примитивный тип
      if (target === null || target === undefined ||
          typeof target === 'number' || typeof target === 'string' ||
          typeof target === 'boolean' || typeof target === 'symbol' ||
          typeof target === 'bigint') {
        throw new TypeError('Cannot perform batch operations on primitive values');
      }

      // Проверяем, что operations - массив
      if (!Array.isArray(operations)) {
        throw new TypeError('Operations must be an array');
      }

      // Настройки (с дефолтными значениями)
      const settings = {
        // Генерировать ли события для каждой операции
        emitIndividual: options.emitIndividual !== false,
        // Генерировать ли batch событие
        emitBatch: options.emitBatch !== false,
        // Продолжать ли при ошибке
        continueOnError: options.continueOnError === true,
        // Возвращать ли результаты операций вместо ass
        returnResults: options.returnResults === true
      };

      // Сохраняем старое состояние для события change
      const prevState = deepCopy(target);

      // Результаты операций
      const results = [];

      // Временно отключаем события, если не нужно генерировать индивидуальные события
      const originalEmit = ass.events && ass.events.emit;
      let suppressedEvents = [];

      if (!settings.emitIndividual && originalEmit) {
        // Временно заменяем функцию emit, чтобы собирать события,
        // но не отправлять их сразу
        ass.events.emit = function(...args) {
          suppressedEvents.push(args);
        };
      }

      try {
        // Применяем операции
        for (let i = 0; i < operations.length; i++) {
          const operation = operations[i];

          if (!operation || typeof operation !== 'object') {
            throw new TypeError(`Operation at index ${i} is not an object`);
          }

          const { method, args = [] } = operation;

          if (!method || typeof method !== 'string') {
            throw new TypeError(`Operation at index ${i} has invalid method`);
          }

          if (!Array.isArray(args)) {
            throw new TypeError(`Operation at index ${i} has invalid args type (should be array)`);
          }

          try {
            // Проверяем наличие метода
            if (!(method in ass)) {
              throw new Error(`Method "${method}" not found`);
            }

            // Вызываем метод
            const result = ass[method](...args);
            results.push(result);
          } catch (error) {
            if (settings.continueOnError) {
              // Сохраняем ошибку и продолжаем
              results.push({ error: error.message });
            } else {
              // Прерываем выполнение
              throw error;
            }
          }
        }
      } finally {
        // Восстанавливаем оригинальную функцию emit
        if (!settings.emitIndividual && originalEmit) {
          ass.events.emit = originalEmit;
        }
      }

      // Генерируем события
      if (ass.events && ass.events.emit) {
        // Если был включен режим подавления индивидуальных событий,
        // но нужно сгенерировать batch событие
        if (!settings.emitIndividual && settings.emitBatch) {
          ass.events.emit('batch', operations, results);

          // Генерируем общее событие change
          ass.events.emit('change', prevState, target, null, {
            method: 'batch',
            arguments: [operations, options]
          });
        } else if (settings.emitBatch) {
          // Генерируем batch событие после индивидуальных событий
          ass.events.emit('batch', operations, results);

          // Генерируем общее событие change
          ass.events.emit('change', prevState, target, null, {
            method: 'batch',
            arguments: [operations, options]
          });
        }
      }

      return settings.returnResults ? results : ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [operations, options] = args;
    return batch(ass, 'get')(operations, options);
  }
}

// Вспомогательные функции для patch

/**
 * Парсит строку пути в массив компонентов пути
 * @param {string} path - Путь в формате JSON Pointer (например, "/a/b/c")
 * @returns {Array} - Массив компонентов пути
 */
function parsePath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string');
  }

  if (path === '') return [];
  if (path === '/') return [''];

  // Разбиваем путь на компоненты
  const parts = path.split('/').slice(1);

  // Декодируем escape-последовательности
  return parts.map(part =>
    part.replace(/~1/g, '/').replace(/~0/g, '~')
  );
}

/**
 * Получает значение по пути
 * @param {Object} obj - Объект, в котором ищем значение
 * @param {Array} path - Массив компонентов пути
 * @returns {*} - Найденное значение
 */
function getValue(obj, path) {
  let current = obj;

  for (let i = 0; i < path.length; i++) {
    const key = path[i];

    if (Array.isArray(current) && key === '-') {
      // Специальный случай для добавления в конец массива
      return undefined;
    }

    if (current === undefined || current === null) {
      return undefined;
    }

    if (Array.isArray(current) && !isNaN(parseInt(key))) {
      current = current[parseInt(key)];
    } else if (current instanceof Map) {
      current = current.get(key);
    } else if (typeof current === 'object') {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Устанавливает значение по пути
 * @param {Object} obj - Объект, в котором устанавливаем значение
 * @param {Array} path - Массив компонентов пути
 * @param {*} value - Значение для установки
 * @returns {boolean} - Успешно ли была выполнена операция
 */
function setValue(obj, path, value) {
  if (path.length === 0) {
    // Нельзя заменить корневой объект
    throw new Error('Cannot replace the root object');
  }

  let current = obj;
  const lastKey = path[path.length - 1];

  // Проходим по пути до предпоследнего элемента
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];

    if (current === undefined || current === null) {
      return false;
    }

    if (Array.isArray(current) && !isNaN(parseInt(key))) {
      current = current[parseInt(key)];
    } else if (current instanceof Map) {
      const nextValue = current.get(key);
      if (nextValue === undefined) {
        // Создаем объект на промежуточном пути, если его нет
        const newValue = isNaN(parseInt(path[i+1])) ? {} : [];
        current.set(key, newValue);
        current = newValue;
      } else {
        current = nextValue;
      }
    } else if (typeof current === 'object') {
      if (current[key] === undefined) {
        // Создаем объект на промежуточном пути, если его нет
        current[key] = isNaN(parseInt(path[i+1])) ? {} : [];
      }
      current = current[key];
    } else {
      return false;
    }
  }

  // Устанавливаем значение
  if (Array.isArray(current)) {
    if (lastKey === '-') {
      // Добавляем в конец массива
      current.push(value);
    } else if (!isNaN(parseInt(lastKey))) {
      current[parseInt(lastKey)] = value;
    } else {
      return false;
    }
  } else if (current instanceof Map) {
    current.set(lastKey, value);
  } else if (typeof current === 'object' && current !== null) {
    current[lastKey] = value;
  } else {
    return false;
  }

  return true;
}

/**
 * Удаляет значение по пути
 * @param {Object} obj - Объект, из которого удаляем значение
 * @param {Array} path - Массив компонентов пути
 * @returns {*} - Удаленное значение
 */
function deleteValue(obj, path) {
  if (path.length === 0) {
    // Нельзя удалить корневой объект
    throw new Error('Cannot delete the root object');
  }

  let current = obj;
  const lastKey = path[path.length - 1];

  // Проходим по пути до предпоследнего элемента
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];

    if (current === undefined || current === null) {
      return undefined;
    }

    if (Array.isArray(current) && !isNaN(parseInt(key))) {
      current = current[parseInt(key)];
    } else if (current instanceof Map) {
      current = current.get(key);
    } else if (typeof current === 'object') {
      current = current[key];
    } else {
      return undefined;
    }
  }

  // Получаем значение перед удалением
  let removedValue;

  // Удаляем значение
  if (Array.isArray(current)) {
    if (!isNaN(parseInt(lastKey))) {
      const index = parseInt(lastKey);
      removedValue = current[index];
      current.splice(index, 1);
    } else {
      return undefined;
    }
  } else if (current instanceof Map) {
    removedValue = current.get(lastKey);
    current.delete(lastKey);
  } else if (typeof current === 'object' && current !== null) {
    removedValue = current[lastKey];
    delete current[lastKey];
  } else {
    return undefined;
  }

  return removedValue;
}

/**
 * Выполняет операцию "add" из JSON Patch
 * @param {Object} obj - Объект, в котором выполняем операцию
 * @param {Array} path - Массив компонентов пути
 * @param {*} value - Значение для добавления
 * @returns {boolean} - Успешно ли была выполнена операция
 */
function addOperation(obj, path, value) {
  return setValue(obj, path, value);
}

/**
 * Выполняет операцию "remove" из JSON Patch
 * @param {Object} obj - Объект, из которого удаляем значение
 * @param {Array} path - Массив компонентов пути
 * @returns {*} - Удаленное значение
 */
function removeOperation(obj, path) {
  return deleteValue(obj, path);
}

/**
 * Выполняет операцию "replace" из JSON Patch
 * @param {Object} obj - Объект, в котором заменяем значение
 * @param {Array} path - Массив компонентов пути
 * @param {*} value - Новое значение
 * @returns {boolean} - Успешно ли была выполнена операция
 */
function replaceOperation(obj, path, value) {
  // Получаем старое значение
  const oldValue = getValue(obj, path);

  // Если пути не существует, операция не выполняется
  if (oldValue === undefined && !path.includes('-')) {
    return false;
  }

  // Заменяем значение
  return setValue(obj, path, value);
}

/**
 * Выполняет операцию "move" из JSON Patch
 * @param {Object} obj - Объект, в котором перемещаем значение
 * @param {Array} fromPath - Исходный путь
 * @param {Array} toPath - Целевой путь
 * @returns {boolean} - Успешно ли была выполнена операция
 */
function moveOperation(obj, fromPath, toPath) {
  // Получаем значение из исходного пути
  const value = getValue(obj, fromPath);

  // Если исходного пути не существует, операция не выполняется
  if (value === undefined) {
    return false;
  }

  // Удаляем значение из исходного пути
  deleteValue(obj, fromPath);

  // Устанавливаем значение по новому пути
  return setValue(obj, toPath, value);
}

/**
 * Выполняет операцию "copy" из JSON Patch
 * @param {Object} obj - Объект, в котором копируем значение
 * @param {Array} fromPath - Исходный путь
 * @param {Array} toPath - Целевой путь
 * @returns {boolean} - Успешно ли была выполнена операция
 */
function copyOperation(obj, fromPath, toPath) {
  // Получаем значение из исходного пути
  const value = getValue(obj, fromPath);

  // Если исходного пути не существует, операция не выполняется
  if (value === undefined) {
    return false;
  }

  // Создаем глубокую копию значения
  const copiedValue = deepCopy(value);

  // Устанавливаем значение по новому пути
  return setValue(obj, toPath, copiedValue);
}

/**
 * Выполняет операцию "test" из JSON Patch
 * @param {Object} obj - Объект, в котором проверяем значение
 * @param {Array} path - Массив компонентов пути
 * @param {*} expectedValue - Ожидаемое значение
 * @returns {boolean} - Успешно ли была выполнена операция (совпадает ли значение)
 */
function testOperation(obj, path, expectedValue) {
  // Получаем значение по пути
  const actualValue = getValue(obj, path);

  // Сравниваем значения
  if (typeof actualValue === 'object' && actualValue !== null) {
    return JSON.stringify(actualValue) === JSON.stringify(expectedValue);
  } else {
    return actualValue === expectedValue;
  }
}

/**
 * Создает глубокую копию объекта
 * @param {*} obj - Объект для копирования
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
