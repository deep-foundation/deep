/**
 * Модуль для работы с множествами (Set)
 */

import { Association } from './association.js';
import { is } from './is.js';

/**
 * Функция для управления подписками на множественные истоки (origins)
 * @param {Association} resultAss - Результирующая ассоциация
 * @param {Association} track - Трекер связи
 * @param {Function} updateHandler - Функция обработки изменений
 */
function setupOriginsSubscriptions(resultAss, track, updateHandler) {
  // Массив для хранения функций отписки
  const offChanges = [];

  // Подписываемся на все истоки
  for (const origin of resultAss.origins) {
    if (origin && origin.on && origin.emit) {
      const offChange = origin.on('change', (event, meta) => {
        updateHandler(origin, event, meta);
      });
      offChanges.push(offChange);
    }
  }

  // Сохраняем функции отписки
  track.temp.offChanges = offChanges;

  // Подписываемся на изменение истоков
  const offOrigins = resultAss.on('origins', (event) => {
    // Отписываемся от старых истоков
    if (track.temp.offChanges) {
      track.temp.offChanges.forEach(off => off());
    }

    // Подписываемся на новые истоки
    setupOriginsSubscriptions(resultAss, track, updateHandler);

    // Полностью пересчитываем результат (можно оптимизировать в будущем)
    recalculateResult(resultAss);
  });

  // Сохраняем функцию отписки от события изменения истоков
  track.temp.offOrigins = offOrigins;
}

/**
 * Полный пересчет результата операции на основе текущего состояния истоков
 * @param {Association} result - Экземпляр Association с результатом операции
 */
function recalculateResult(result) {
  const method = result.temp.method;
  const origins = result.origins;

  console.log(`Пересчитываем результат метода ${method} для ${origins.length} истоков`);

  if (!method || !origins || origins.length === 0) {
    console.log('Недостаточно данных для пересчета');
    return;
  }

  if (method === 'difference') {
    let resultSet;

    // Используем первый исток как основу
    if (origins[0].this.isArray || origins[0].this.isSet) {
      resultSet = new Set(toSet(origins[0].this));

      // Вычитаем все остальные истоки
      for (let i = 1; i < origins.length; i++) {
        const currentSet = toSet(origins[i].this);
        for (const item of currentSet) {
          resultSet.delete(item);
        }
      }

      // Сортируем и обновляем результат
      const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
      result.this = new Set(sortedArray);
      console.log(`Пересчитан результат difference: ${Array.from(result.this)}`);
    } else {
      // Аналогично для Map
      const resultMap = new Map();
      const map1 = toMap(origins[0].this);

      // Сначала копируем все ключи из первого истока
      for (const [key, value] of map1) {
        resultMap.set(key, value);
      }

      // Удаляем ключи, которые есть в других истоках
      for (let i = 1; i < origins.length; i++) {
        const currentMap = toMap(origins[i].this);
        for (const key of currentMap.keys()) {
          resultMap.delete(key);
        }
      }

      result.this = resultMap;
      console.log(`Пересчитан результат difference для Map: ${Array.from(result.this.entries())}`);
    }
  } else if (method === 'intersection') {
    if (origins[0].this.isArray || origins[0].this.isSet) {
      // Начинаем с первого истока
      let resultSet = new Set(toSet(origins[0].this));

      // Пересекаем со всеми остальными истоками
      for (let i = 1; i < origins.length; i++) {
        const currentSet = toSet(origins[i].this);
        resultSet = new Set(
          Array.from(resultSet).filter(item => currentSet.has(item))
        );
      }

      // Сортируем и обновляем результат
      const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
      result.this = new Set(sortedArray);
      console.log(`Пересчитан результат intersection: ${Array.from(result.this)}`);
    } else {
      // Аналогично для Map
      const resultMap = new Map();
      const map1 = toMap(origins[0].this);

      // Проверяем каждый ключ первого истока
      for (const [key, value] of map1) {
        let inAllOrigins = true;

        // Проверяем наличие ключа во всех остальных истоках
        for (let i = 1; i < origins.length; i++) {
          if (!toMap(origins[i].this).has(key)) {
            inAllOrigins = false;
            break;
          }
        }

        if (inAllOrigins) {
          resultMap.set(key, value);
        }
      }

      result.this = resultMap;
      console.log(`Пересчитан результат intersection для Map: ${Array.from(result.this.entries())}`);
    }
  } else if (method === 'symmetricDifference') {
    if (origins[0].this.isArray || origins[0].this.isSet) {
      // Создаем карту для подсчета вхождений каждого элемента
      const countMap = new Map();

      // Подсчитываем вхождения каждого элемента во всех истоках
      for (let i = 0; i < origins.length; i++) {
        const currentSet = toSet(origins[i].this);
        for (const item of currentSet) {
          countMap.set(item, (countMap.get(item) || 0) + 1);
        }
      }

      // Создаем результирующее множество только из элементов,
      // встречающихся нечетное число раз
      const resultSet = new Set();
      for (const [item, count] of countMap) {
        if (count % 2 === 1) {
          resultSet.add(item);
        }
      }

      // Сортируем и обновляем результат
      const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
      result.this = new Set(sortedArray);
      console.log(`Пересчитан результат symmetricDifference: ${Array.from(result.this)}`);
    } else {
      // Аналогично для Map
      const countMap = new Map();

      // Собираем все ключи из всех истоков
      for (let i = 0; i < origins.length; i++) {
        const currentMap = toMap(origins[i].this);
        for (const [key, value] of currentMap) {
          if (!countMap.has(key)) {
            countMap.set(key, { count: 1, value });
          } else {
            countMap.get(key).count++;
          }
        }
      }

      // Создаем результирующую карту только из ключей,
      // встречающихся нечетное число раз
      const resultMap = new Map();
      for (const [key, { count, value }] of countMap) {
        if (count % 2 === 1) {
          resultMap.set(key, value);
        }
      }

      result.this = resultMap;
      console.log(`Пересчитан результат symmetricDifference для Map: ${Array.from(result.this.entries())}`);
    }
  } else if (method === 'union') {
    if (origins[0].this.isArray || origins[0].this.isSet) {
      // Создаем объединенное множество
      const resultSet = new Set();

      // Добавляем все элементы из всех истоков
      for (let i = 0; i < origins.length; i++) {
        const currentSet = toSet(origins[i].this);
        for (const item of currentSet) {
          resultSet.add(item);
        }
      }

      // Сортируем и обновляем результат
      const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
      result.this = new Set(sortedArray);
      console.log(`Пересчитан результат union: ${Array.from(result.this)}`);
    } else {
      // Аналогично для Map, последний исток имеет приоритет для значений
      const resultMap = new Map();

      // Проходим по всем истокам в порядке от первого к последнему,
      // чтобы значения из последних истоков перезаписывали предыдущие
      for (let i = 0; i < origins.length; i++) {
        const currentMap = toMap(origins[i].this);
        for (const [key, value] of currentMap) {
          resultMap.set(key, value);
        }
      }

      result.this = resultMap;
      console.log(`Пересчитан результат union для Map: ${Array.from(result.this.entries())}`);
    }
  }

  // Генерируем событие изменения
  if (result.emit) {
    result.emit('change', {
      reason: 'recalculate',
      origins: origins
    });
  }
}

// Добавляем геттеры для проверки типов
Object.defineProperties(Set.prototype, {
  isSet: { get: function() { return true } },
  isArray: { get: function() { return false } },
  isObject: { get: function() { return false } },
  isMap: { get: function() { return false } }
});

Object.defineProperties(Array.prototype, {
  isSet: { get: function() { return false } },
  isArray: { get: function() { return true } },
  isObject: { get: function() { return false } },
  isMap: { get: function() { return false } }
});

Object.defineProperties(Map.prototype, {
  isSet: { get: function() { return false } },
  isArray: { get: function() { return false } },
  isObject: { get: function() { return false } },
  isMap: { get: function() { return true } }
});

Object.defineProperties(Object.prototype, {
  isSet: { get: function() { return false } },
  isArray: { get: function() { return false } },
  isObject: { get: function() { return true } },
  isMap: { get: function() { return false } }
});

/**
 * Проверяет, является ли значение множественным типом данных
 * @param {*} value - Проверяемое значение
 * @returns {boolean} - true если значение является множественным типом
 */
function isManyType(value) {
  return value.isArray || value.isSet || value.isObject || value.isMap;
}

/**
 * Проверяет совместимость типов для операций над множествами
 * @param {*} first - Первый аргумент
 * @param {*} second - Второй аргумент
 * @param {string} methodName - Имя метода для сообщения об ошибке
 */
function assertCompatibleTypes(first, second, methodName) {
  // Проверяем, является ли second объектом Association или функцией с this
  if (second && typeof second === 'object' && second.constructor?.name === 'Association') {
    second = second.this;
  } else if (second && typeof second === 'function' && second.this) {
    second = second.this;
  }

  // Проверяем, относятся ли оба объекта к множественным типам данных
  if (!isManyType(first) || !isManyType(second)) {
    throw new Error(`${methodName} метод работает только с множественными типами данных`);
  }

  const isFirstArrayOrSet = first.isArray || first.isSet;
  const isSecondArrayOrSet = second.isArray || second.isSet;
  const isFirstObjectOrMap = first.isObject || first.isMap;
  const isSecondObjectOrMap = second.isObject || second.isMap;

  if ((isFirstArrayOrSet && !isSecondArrayOrSet) || (!isFirstArrayOrSet && isSecondArrayOrSet)) {
    throw new Error(`${methodName} метод не поддерживает смешивание массивов/множеств с объектами/картами`);
  }

  if ((isFirstObjectOrMap && !isSecondObjectOrMap) || (!isFirstObjectOrMap && isSecondObjectOrMap)) {
    throw new Error(`${methodName} метод не поддерживает смешивание массивов/множеств с объектами/картами`);
  }
}

/**
 * Преобразует значение в Set
 * @param {*} value - Значение для преобразования
 * @returns {Set} - Множество
 */
function toSet(value) {
  // Если это Association или функция с this, берем его внутреннее значение
  if (value && typeof value === 'object' && value.constructor?.name === 'Association') {
    value = value.this;
  } else if (value && typeof value === 'function' && value.this) {
    value = value.this;
  }

  if (value.isSet) return value;
  if (value.isArray) return new Set(value);
  throw new Error('Неподдерживаемый тип данных для преобразования в Set');
}

/**
 * Преобразует значение в Map
 * @param {*} value - Значение для преобразования
 * @returns {Map} - Карта
 */
function toMap(value) {
  // Если это Association или функция с this, берем его внутреннее значение
  if (value && typeof value === 'object' && value.constructor?.name === 'Association') {
    value = value.this;
  } else if (value && typeof value === 'function' && value.this) {
    value = value.this;
  }

  if (value.isMap) return value;
  if (value.isObject) return new Map(Object.entries(value));
  throw new Error('Неподдерживаемый тип данных для преобразования в Map');
}

// Добавляем нативные методы в прототип Set, если они отсутствуют
if (!Set.prototype.difference) {
  Set.prototype.difference = function(other) {
    assertSet(other, 'difference');
    const result = new Set();
    for (const item of this) {
      if (!other.has(item)) {
        result.add(item);
      }
    }
    return result;
  };
}

if (!Set.prototype.intersection) {
  Set.prototype.intersection = function(other) {
    assertSet(other, 'intersection');
    const result = new Set();
    for (const item of this) {
      if (other.has(item)) {
        result.add(item);
      }
    }
    return result;
  };
}

if (!Set.prototype.symmetricDifference) {
  Set.prototype.symmetricDifference = function(other) {
    assertSet(other, 'symmetricDifference');
    const result = new Set(this);
    for (const item of other) {
      if (result.has(item)) {
        result.delete(item);
      } else {
        result.add(item);
      }
    }
    return result;
  };
}

/**
 * Вычисляет разность множеств (A - B)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее элементы из A, которых нет в B
 */
export function difference(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertCompatibleTypes(ass.this, other, 'difference');

      if (ass.this.isArray || ass.this.isSet) {
        const set1 = toSet(ass.this);
        const set2 = toSet(other);
        const result = new Association(set1.difference(set2));

        // Устанавливаем истоки - первый элемент основной, второй - вычитаемый
        result.origins = [ass, new Association(other)];
        result.temp.method = 'difference';

        // Трансформер теперь должен работать со всеми истоками
        result.temp.transformer = (set) => {
          if (result.origins.length <= 1) return set;

          // Вычитаем все истоки кроме первого
          let res = toSet(set);
          for (let i = 1; i < result.origins.length; i++) {
            res = res.difference(toSet(result.origins[i].this));
          }
          return res;
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в difference от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(result);

            // Генерируем событие изменения
            if (result.emit) {
              result.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return result;
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        const result = new Map();
        for (const [key, value] of map1) {
          if (!map2.has(key)) {
            result.set(key, value);
          }
        }

        const resultAss = new Association(result);
        // Сохраняем оба источника в массиве origins
        resultAss.origins = [ass, new Association(other)];
        resultAss.temp.method = 'difference';

        // Трансформер должен учитывать все истоки
        resultAss.temp.transformer = (map) => {
          if (resultAss.origins.length <= 1) return toMap(map);

          const result = new Map();
          const map1 = toMap(map);

          // Перебираем ключи первого истока
          for (const [key, value] of map1) {
            let shouldAdd = true;

            // Проверяем отсутствие ключа во всех остальных истоках
            for (let i = 1; i < resultAss.origins.length; i++) {
              if (toMap(resultAss.origins[i].this).has(key)) {
                shouldAdd = false;
                break;
              }
            }

            if (shouldAdd) {
              result.set(key, value);
            }
          }

          return result;
        };

        // Добавляем локальный track с поддержкой множественных origins
        resultAss._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в difference от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(resultAss);

            // Генерируем событие изменения
            if (resultAss.emit) {
              resultAss.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return resultAss;
      }
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertCompatibleTypes(ass.this, other, 'difference');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(other);
      return set1.difference(set2);
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(other);
      const result = new Map();
      for (const [key, value] of map1) {
        if (!map2.has(key)) {
          result.set(key, value);
        }
      }
      return result;
    }
  }
}

/**
 * Вычисляет пересечение множеств (A ∩ B)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее общие элементы A и B
 */
export function intersection(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertCompatibleTypes(ass.this, other, 'intersection');

      if (ass.this.isArray || ass.this.isSet) {
        const set1 = toSet(ass.this);
        const set2 = toSet(other);
        const result = new Association(set1.intersection(set2));

        // Устанавливаем оба истока
        result.origins = [ass, new Association(other)];
        result.temp.method = 'intersection';

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в intersection от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(result);

            // Генерируем событие изменения
            if (result.emit) {
              result.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return result;
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        const result = new Map();
        for (const [key, value] of map1) {
          if (map2.has(key)) {
            result.set(key, value);
          }
        }

        const resultAss = new Association(result);
        // Сохраняем оба источника в массиве origins
        resultAss.origins = [ass, new Association(other)];
        resultAss.temp.method = 'intersection';

        // Добавляем локальный track с поддержкой множественных origins
        resultAss._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в intersection от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(resultAss);

            // Генерируем событие изменения
            if (resultAss.emit) {
              resultAss.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return resultAss;
      }
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertCompatibleTypes(ass.this, other, 'intersection');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(other);
      return set1.intersection(set2);
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(other);
      const result = new Map();
      for (const [key, value] of map1) {
        if (map2.has(key)) {
          result.set(key, value);
        }
      }
      return result;
    }
  }
}

/**
 * Вычисляет симметрическую разность множеств (A △ B)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее элементы, присутствующие только в одном из множеств
 */
export function symmetricDifference(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertCompatibleTypes(ass.this, other, 'symmetricDifference');

      if (ass.this.isArray || ass.this.isSet) {
        const set1 = toSet(ass.this);
        const set2 = toSet(other);
        const resultSet = set1.symmetricDifference(set2);
        const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
        const result = new Association(new Set(sortedArray));

        // Устанавливаем оба истока
        result.origins = [ass, new Association(other)];
        result.temp.method = 'symmetricDifference';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = (set) => {
          if (result.origins.length <= 1) return set;

          // Вычисляем симметрическую разность всех истоков
          let res = toSet(set);
          for (let i = 1; i < result.origins.length; i++) {
            res = res.symmetricDifference(toSet(result.origins[i].this));
          }
          return new Set(Array.from(res).sort((a, b) => a - b));
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в symmetricDifference от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(result);

            // Генерируем событие изменения
            if (result.emit) {
              result.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return result;
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        const result = new Map();

        // Ключи, которые есть в map1, но нет в map2
        for (const [key, value] of map1) {
          if (!map2.has(key)) {
            result.set(key, value);
          }
        }

        // Ключи, которые есть в map2, но нет в map1
        for (const [key, value] of map2) {
          if (!map1.has(key)) {
            result.set(key, value);
          }
        }

        const resultAss = new Association(result);
        // Сохраняем оба источника в origins
        resultAss.origins = [ass, new Association(other)];
        resultAss.temp.method = 'symmetricDifference';

        // Обновляем трансформер для работы со множеством истоков
        resultAss.temp.transformer = (map) => {
          if (resultAss.origins.length <= 1) return toMap(map);

          const result = new Map();

          // Для каждого истока проверяем уникальность ключей
          for (let i = 0; i < resultAss.origins.length; i++) {
            const currentMap = toMap(resultAss.origins[i].this);

            for (const [key, value] of currentMap) {
              // Считаем количество вхождений ключа во всех истоках
              let occurrences = 0;
              for (let j = 0; j < resultAss.origins.length; j++) {
                const otherMap = toMap(resultAss.origins[j].this);
                if (otherMap.has(key)) {
                  occurrences++;
                }
              }

              // Если ключ встречается нечетное число раз, добавляем его в результат
              if (occurrences % 2 === 1) {
                result.set(key, value);
              }
            }
          }

          return result;
        };

        // Добавляем локальный track с поддержкой множественных origins
        resultAss._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в symmetricDifference от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(resultAss);

            // Генерируем событие изменения
            if (resultAss.emit) {
              resultAss.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return resultAss;
      }
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertCompatibleTypes(ass.this, other, 'symmetricDifference');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(other);
      return set1.symmetricDifference(set2);
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(other);
      const result = new Map();
      for (const [key, value] of map1) {
        if (!map2.has(key)) {
          result.set(key, value);
        }
      }
      for (const [key, value] of map2) {
        if (!map1.has(key)) {
          result.set(key, value);
        }
      }
      return result;
    }
  }
}

/**
 * Вычисляет объединение двух множеств
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее все элементы из обоих множеств
 */
export function union(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertCompatibleTypes(ass.this, other, 'union');

      if (ass.this.isArray || ass.this.isSet) {
        const set1 = toSet(ass.this);
        const set2 = toSet(other);
        const combined = new Set([...set1, ...set2]);
        const sortedArray = Array.from(combined).sort((a, b) => a - b);
        const result = new Association(new Set(sortedArray));

        // Устанавливаем оба истока
        result.origins = [ass, new Association(other)];
        result.temp.method = 'union';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = (set) => {
          if (result.origins.length <= 1) return set;

          // Объединяем все истоки
          const combined = new Set();
          for (let i = 0; i < result.origins.length; i++) {
            const originSet = toSet(result.origins[i].this);
            for (const item of originSet) {
              combined.add(item);
            }
          }
          return new Set(Array.from(combined).sort((a, b) => a - b));
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в union от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(result);

            // Генерируем событие изменения
            if (result.emit) {
              result.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return result;
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        const result = new Map([...map1, ...map2]);
        const resultAss = new Association(result);

        // Сохраняем оба источника в origins
        resultAss.origins = [ass, new Association(other)];
        resultAss.temp.method = 'union';

        // Добавляем локальный track с поддержкой множественных origins
        resultAss._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          // Создаем обработчик изменений для всех истоков
          const updateHandler = (origin, event, meta) => {
            console.log(`Получено событие в union от ${origin?.temp?.method || 'неизвестно'}, операция: ${event?.detail?.operation || 'неизвестно'}`);

            // Вместо точечных обновлений делаем полный пересчет для надежности
            recalculateResult(resultAss);

            // Генерируем событие изменения
            if (resultAss.emit) {
              resultAss.emit('change', event, meta);
            }
          };

          // Настраиваем подписки на все истоки
          setupOriginsSubscriptions(ass, track, updateHandler);

          return track;
        });

        return resultAss;
      }
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertCompatibleTypes(ass.this, other, 'union');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(other);
      return new Set([...set1, ...set2]);
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(other);
      return new Map([...map1, ...map2]);
    }
  }
}

// Создаем объект с методами для many
const many = {
  difference,
  intersection,
  symmetricDifference,
  union
};

// Добавляем методы в прокси Association
for (const [name, method] of Object.entries(many)) {
  Association._proxy.set(name, method);
}

export default many;
