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
function setupOriginsSubscriptions(result, track, updateHandler) {
  if (!result || !result.temp) {
    console.error('setupOriginsSubscriptions: Invalid result or missing temp property', result);
    return;
  }

  // Создаем массив для хранения функций отписки, если его еще нет
  if (!track.temp) {
    track.temp = {};
  }

  track.temp.offChanges = [];

  console.log(`setupOriginsSubscriptions: Настройка подписок для ${result.temp.origins.length} истоков`);

  // Подписываемся на изменения всех истоков
  for (let i = 0; i < result.temp.origins.length; i++) {
    const origin = result.temp.origins[i];
    console.log(`setupOriginsSubscriptions: Настройка подписки для истока ${i}`);

    if (origin.on && origin.emit) {
      const offChange = origin.on('change', (event, meta) => {
        console.log(`setupOriginsSubscriptions: Получено событие change от истока ${i}`);
        // Вызываем обработчик с контекстом события
        updateHandler(origin, event, meta);
      });

      track.temp.offChanges.push(offChange);
    } else {
      console.warn(`setupOriginsSubscriptions: Исток ${i} не поддерживает события`);
    }
  }

  // Подписываемся на изменения в списке истоков
  const originsChangeHandler = () => {
    // Отписываемся от всех текущих истоков
    if (track.temp.offChanges) {
      for (const off of track.temp.offChanges) {
        off();
      }
      track.temp.offChanges = [];
    }

    // Подписываемся на новые истоки
    for (const origin of result.temp.origins) {
      if (origin.on && origin.emit) {
        const offChange = origin.on('change', (event, meta) => {
          updateHandler(origin, event, meta);
        });

        track.temp.offChanges.push(offChange);
      }
    }
  };

  // Добавляем обработчик изменения списка истоков
  if (result.on) {
    track.temp.offOriginsChange = result.on('originsChanged', originsChangeHandler);
  }

  // Добавляем унификацию для очистки всех подписок
  track.temp.unsubscribe = () => {
    // Отписываемся от всех истоков
    if (track.temp.offChanges) {
      for (const off of track.temp.offChanges) {
        off();
      }
      track.temp.offChanges = [];
    }

    // Отписываемся от изменения списка истоков
    if (track.temp.offOriginsChange) {
      track.temp.offOriginsChange();
      track.temp.offOriginsChange = null;
    }
  };

  return track;
}

/**
 * Полный пересчет результата операции на основе текущего состояния истоков
 * @param {Association} result - Экземпляр Association с результатом операции
 */
function recalculateResult(result) {
  if (!result || !result.temp || !result.temp.origins || result.temp.origins.length === 0) {
    console.warn('recalculateResult: Invalid result or no origins', result);
    return;
  }

  const method = result.temp.method;
  if (!method) {
    console.warn('recalculateResult: No method found in result.temp', result.temp);
    return;
  }

  // Добавление отладочной информации
  console.log(`recalculateResult: method=${method}, origins=${result.temp.origins.length}`);
  for (let i = 0; i < result.temp.origins.length; i++) {
    if (result.temp.origins[i].this && result.temp.origins[i].this.isSet) {
      console.log(`Origin ${i} is Set with items: ${Array.from(result.temp.origins[i].this).join(', ')}`);
    } else if (result.temp.origins[i].this && result.temp.origins[i].this.isMap) {
      console.log(`Origin ${i} is Map with keys: ${Array.from(result.temp.origins[i].this.keys()).join(', ')}`);
    }
  }

  // Получаем текущее состояние
  const oldState = result.this && result.this.isSet ?
                  new Set(Array.from(result.this)) :
                  (result.this && result.this.isMap ? new Map(Array.from(result.this.entries())) : null);

  if (result.this.isArray || result.this.isSet) {
    // Для Set и Array
    const counts = new Map();

    // Подсчитываем вхождения каждого элемента по всем истокам
    for (let i = 0; i < result.origins.length; i++) {
      const set = toSet(result.origins[i].this);

      for (const item of set) {
        counts.set(item, (counts.get(item) || 0) + 1);
      }
    }

    let newResult;

    switch (method) {
      case 'difference':
        // Выбираем элементы, которые встречаются только в первом множестве
        newResult = new Set();
        const firstSet = toSet(result.origins[0].this);

        for (const item of firstSet) {
          // Элемент должен быть только в первом множестве
          let inOtherSets = false;
          for (let i = 1; i < result.origins.length; i++) {
            if (toSet(result.origins[i].this).has(item)) {
              inOtherSets = true;
              break;
            }
          }

          if (!inOtherSets) {
            newResult.add(item);
          }
        }
        break;

      case 'intersection':
        // Выбираем элементы, которые встречаются во всех множествах
        newResult = new Set();
        const firstSetForIntersection = toSet(result.origins[0].this);

        for (const item of firstSetForIntersection) {
          let inAllSets = true;
          for (let i = 1; i < result.origins.length; i++) {
            if (!toSet(result.origins[i].this).has(item)) {
              inAllSets = false;
            break;
          }
        }

          if (inAllSets) {
            newResult.add(item);
          }
        }
        break;

      case 'symmetricDifference':
        // Выбираем элементы, которые встречаются нечетное число раз
        newResult = new Set();

        for (const [item, count] of counts.entries()) {
          if (count % 2 !== 0) {
            newResult.add(item);
          }
        }
        break;

      case 'union':
        // Объединяем все элементы
        newResult = new Set();

        for (const [item] of counts.entries()) {
          newResult.add(item);
        }
        break;

      default:
        console.warn('recalculateResult: Unknown method', method);
        return;
    }

    // Сортируем элементы для стабильности результатов
    const sortedArray = Array.from(newResult).sort((a, b) => a - b);

    // Сравниваем старое и новое состояние для логирования изменений
    if (oldState && oldState.isSet) {
      const added = [];
      const removed = [];

      // Находим добавленные элементы
      for (const item of newResult) {
        if (!oldState.has(item)) {
          added.push(item);
        }
      }

      // Находим удаленные элементы
      for (const item of oldState) {
        if (!newResult.has(item)) {
          removed.push(item);
        }
      }

      console.log(`Changes in ${method}: added [${added.join(', ')}], removed [${removed.join(', ')}]`);
    }

    console.log(`Result after recalculation (${method}): ${Array.from(newResult).join(', ')}`);

    // Обновляем result.this новыми данными
    result.this = new Set(sortedArray);
  } else {
    // Для Map и Object
    const resultMap = new Map();

    switch (method) {
      case 'difference':
        // Сначала копируем первый исток
        const firstMap = toMap(result.origins[0].this);

        for (const [key, value] of firstMap) {
          let inOtherMaps = false;
          for (let i = 1; i < result.origins.length; i++) {
            if (toMap(result.origins[i].this).has(key)) {
              inOtherMaps = true;
              break;
            }
          }

          if (!inOtherMaps) {
            resultMap.set(key, value);
          }
        }
        break;

      case 'intersection':
        // Элементы, которые есть во всех картах
        const firstMapForIntersection = toMap(result.origins[0].this);

        for (const [key, value] of firstMapForIntersection) {
          let inAllMaps = true;
          for (let i = 1; i < result.origins.length; i++) {
            if (!toMap(result.origins[i].this).has(key)) {
              inAllMaps = false;
              break;
            }
          }

          if (inAllMaps) {
          resultMap.set(key, value);
        }
      }
        break;

      case 'symmetricDifference':
        // Подсчитываем вхождения каждого ключа
        const keyCounts = new Map();

        for (let i = 0; i < result.origins.length; i++) {
          const map = toMap(result.origins[i].this);

          for (const [key] of map) {
            keyCounts.set(key, (keyCounts.get(key) || 0) + 1);
          }
        }

        // Добавляем ключи, которые встречаются нечетное число раз
        for (const [key, count] of keyCounts.entries()) {
          if (count % 2 !== 0) {
            // Берем значение из первого истока, который содержит этот ключ
            for (let i = 0; i < result.origins.length; i++) {
              const map = toMap(result.origins[i].this);
              if (map.has(key)) {
                resultMap.set(key, map.get(key));
                break;
              }
            }
          }
        }
        break;

      case 'union':
        // Последовательно добавляем ключи из всех истоков
        for (let i = 0; i < result.origins.length; i++) {
          const map = toMap(result.origins[i].this);

          for (const [key, value] of map) {
          resultMap.set(key, value);
        }
        }
        break;

      default:
        console.warn('recalculateResult: Unknown method for Map/Object', method);
        return;
      }

      result.this = resultMap;

    // Получаем новое состояние и вычисляем различия
    if (oldState && oldState.isMap) {
      const newKeys = Array.from(result.this.keys());
      const oldKeys = Array.from(oldState.keys());

      const added = newKeys.filter(key => !oldState.has(key));
      const removed = oldKeys.filter(key => !result.this.has(key));
      const changed = newKeys.filter(key => oldState.has(key) && result.this.get(key) !== oldState.get(key));

      if (added.length > 0 || removed.length > 0 || changed.length > 0) {
        console.log(`Changes in ${method}: added [${added.join(', ')}], removed [${removed.join(', ')}], changed [${changed.join(', ')}]`);
      }
    }

    // Вывод результата для отладки
    console.log(`Result after recalculation (${method}): ${Array.from(result.this.entries()).map(([k, v]) => `${k}:${v}`).join(', ')}`);
  }
}

// Экспортируем функцию recalculateResult для использования в других модулях
// Делаем её доступной в глобальной области видимости для доступа из других модулей
if (typeof window !== 'undefined') {
  window.recalculateResult = recalculateResult;
} else if (typeof global !== 'undefined') {
  global.recalculateResult = recalculateResult;
}

// Экспортируем функцию для возможности импорта
export { recalculateResult };

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

// Функция для настройки track для множественных операций
function setupTrackForMultipleOperations(result) {
  // Возвращает функцию, которая настраивает track для результата
  return function(ass, op) {
    if (op !== 'get') return;

    // Получаем базовый трекер
    const track = Association._proxy.get('track').call(ass, ass, 'get');

    // Проверяем наличие истоков
    if (!ass.temp || !ass.temp.origins || ass.temp.origins.length === 0) {
      console.warn('No origins found for track setup');
      return track;
    }

    // Правильно устанавливаем this для трекера
    Object.defineProperty(track, 'this', {
      get() {
        return ass.this;
      },
      set(newValue) {
        ass.this = newValue;
      }
    });

    // Создаем обработчик изменений для всех истоков
    const updateHandler = (origin, event, meta) => {
      console.log(`setupTrackForMultipleOperations: Update from origin ${origin.temp && origin.temp.symbol ? origin.temp.symbol.toString() : 'unknown'}`);
      console.log(`Event details:`, event);

      // Принудительно вызываем recalculateResult для пересчета результата
      recalculateResult(ass);

      // Важно явно обновить this у трекера, чтобы он соответствовал обновленному результату
      track.this = ass.this;

      // Генерируем событие изменения
      if (ass.emit) {
        ass.emit('change', {
          reason: 'track',
          origin: origin,
          detail: event?.detail || {}
        }, meta);
      }
    };

    // Подписываемся на изменения всех истоков
    setupOriginsSubscriptions(ass, track, updateHandler);

    return track;
  };
}

/**
 * Вычисляет разность множеств (A - B - C - ...)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее элементы из A, которых нет в остальных множествах
 */
export function difference(ass, op, args) {
  if (op === 'get') {
    return function(...others) {
      // Применяем unwrap к аргументам
      const unwrappedOthers = others.map(other => ass.unwrap(other));

      // Проверяем что есть хотя бы один аргумент
      if (unwrappedOthers.length === 0) {
        return ass.wrap(ass.this);
      }

      // Проверяем совместимость типов для всех аргументов
      for (const other of unwrappedOthers) {
        assertCompatibleTypes(ass.this, other, 'difference');
      }

      if (ass.this.isArray || ass.this.isSet) {
        // Начинаем с первого истока (текущего объекта)
        const set1 = toSet(ass.this);
        const resultSet = new Set(set1);

        // Вычитаем все остальные множества
        for (const other of unwrappedOthers) {
          const otherSet = toSet(other);
          for (const item of otherSet) {
            resultSet.delete(item);
          }
        }

        // Сортируем и создаем новую ассоциацию
        const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
        const result = ass.wrap(new Set(sortedArray));

        // Устанавливаем истоки - все множества
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'difference';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Начинаем с первого истока
          const resultSet = new Set(toSet(result.origins[0].this));

          // Вычитаем все остальные истоки
          for (let i = 1; i < result.origins.length; i++) {
            const currentSet = toSet(result.origins[i].this);
            for (const item of currentSet) {
              resultSet.delete(item);
            }
          }

          // Сортируем и возвращаем результат
          const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
          return new Set(sortedArray);
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      } else {
        // Для Map и Object - начинаем с первого истока
        const map1 = toMap(ass.this);
        const resultMap = new Map(map1);

        // Удаляем ключи, которые есть в других аргументах
        for (const other of unwrappedOthers) {
          const otherMap = toMap(other);
          for (const key of otherMap.keys()) {
            resultMap.delete(key);
          }
        }

        const result = ass.wrap(resultMap);

        // Устанавливаем истоки
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'difference';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Начинаем с первого истока
          const resultMap = new Map(toMap(result.origins[0].this));

          // Удаляем ключи из всех остальных истоков
          for (let i = 1; i < result.origins.length; i++) {
            const currentMap = toMap(result.origins[i].this);
            for (const key of currentMap.keys()) {
              resultMap.delete(key);
            }
          }

          return resultMap;
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      }
    };
  }

  if (op === 'apply') {
    // Применяем unwrap к аргументам
    const [unwrappedOther] = args.map(arg => ass.unwrap(arg));

    assertCompatibleTypes(ass.this, unwrappedOther, 'difference');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(unwrappedOther);
      const result = new Set();

      // Добавляем элементы, которые есть только в первом множестве
      for (const item of set1) {
        if (!set2.has(item)) {
          result.add(item);
        }
      }

      // Сортируем результат
      const sortedArray = Array.from(result).sort((a, b) => a - b);
      return ass.wrap(new Set(sortedArray));
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(unwrappedOther);
      const result = new Map();

      // Добавляем ключи, которые есть только в первой карте
      for (const [key, value] of map1) {
        if (!map2.has(key)) {
          result.set(key, value);
        }
      }

      return ass.wrap(result);
    }
  }
}

/**
 * Вычисляет пересечение множеств (A ∩ B ∩ C ∩ ...)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее элементы общие для всех множеств
 */
export function intersection(ass, op, args) {
  if (op === 'get') {
    return function(...others) {
      // Применяем unwrap к аргументам
      const unwrappedOthers = others.map(other => ass.unwrap(other));

      // Проверяем что есть хотя бы один аргумент
      if (unwrappedOthers.length === 0) {
        return ass.wrap(ass.this);
      }

      // Проверяем совместимость типов для всех аргументов
      for (const other of unwrappedOthers) {
        assertCompatibleTypes(ass.this, other, 'intersection');
      }

      if (ass.this.isArray || ass.this.isSet) {
        // Начинаем с первого истока (текущего объекта)
        const set1 = toSet(ass.this);
        let resultSet = new Set(set1);

        // Пересекаем с каждым последующим множеством
        for (const other of unwrappedOthers) {
          const otherSet = toSet(other);
          resultSet = new Set(Array.from(resultSet).filter(item => otherSet.has(item)));
        }

        // Сортируем и создаем новую ассоциацию
        const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
        const result = ass.wrap(new Set(sortedArray));

        // Устанавливаем истоки - все множества
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'intersection';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Начинаем с первого истока
          let resultSet = new Set(toSet(result.origins[0].this));

          // Пересекаем с каждым множеством
          for (let i = 1; i < result.origins.length; i++) {
            const currentSet = toSet(result.origins[i].this);
            resultSet = new Set(Array.from(resultSet).filter(item => currentSet.has(item)));
          }

          // Сортируем и возвращаем результат
          const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
          return new Set(sortedArray);
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      } else {
        // Для Map и Object - начинаем с первого истока
        const map1 = toMap(ass.this);
        const resultMap = new Map();

        // Добавляем только те ключи, которые есть во всех объектах
        for (const [key, value] of map1) {
          let existsInAll = true;
          for (const other of unwrappedOthers) {
            const otherMap = toMap(other);
            if (!otherMap.has(key)) {
              existsInAll = false;
              break;
            }
          }
          if (existsInAll) {
            resultMap.set(key, value);
          }
        }

        const result = ass.wrap(resultMap);

        // Устанавливаем истоки
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'intersection';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Начинаем с первого истока
          const firstMap = toMap(result.origins[0].this);
          const resultMap = new Map();

          // Проверяем каждый ключ из первого истока
          for (const [key, value] of firstMap) {
            let existsInAll = true;
            for (let i = 1; i < result.origins.length; i++) {
              const currentMap = toMap(result.origins[i].this);
              if (!currentMap.has(key)) {
                existsInAll = false;
                break;
              }
            }
            if (existsInAll) {
              resultMap.set(key, value);
            }
          }

          return resultMap;
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      }
    };
  }

  if (op === 'apply') {
    // Применяем unwrap к аргументам
    const [unwrappedOther] = args.map(arg => ass.unwrap(arg));

    assertCompatibleTypes(ass.this, unwrappedOther, 'intersection');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(unwrappedOther);
      const result = new Set();

      // Добавляем элементы, которые есть в обоих множествах
      for (const item of set1) {
        if (set2.has(item)) {
          result.add(item);
        }
      }

      // Сортируем результат
      const sortedArray = Array.from(result).sort((a, b) => a - b);
      return ass.wrap(new Set(sortedArray));
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(unwrappedOther);
      const result = new Map();

      // Добавляем ключи, которые есть в обеих картах
      for (const [key, value] of map1) {
        if (map2.has(key)) {
          result.set(key, value);
        }
      }

      return ass.wrap(result);
    }
  }
}

/**
 * Вычисляет симметрическую разность множеств (элементы, которые есть только в одном из множеств)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее элементы, которые присутствуют только в одном множестве
 */
export function symmetricDifference(ass, op, args) {
  if (op === 'get') {
    return function(...others) {
      // Применяем unwrap к аргументам
      const unwrappedOthers = others.map(other => ass.unwrap(other));

      // Проверяем что есть хотя бы один аргумент
      if (unwrappedOthers.length === 0) {
        return ass.wrap(ass.this);
      }

      // Проверяем совместимость типов для всех аргументов
      for (const other of unwrappedOthers) {
        assertCompatibleTypes(ass.this, other, 'symmetricDifference');
      }

      if (ass.this.isArray || ass.this.isSet) {
        // Подсчитываем вхождения каждого элемента по всем множествам
        const counts = new Map();
        const set1 = toSet(ass.this);

        // Добавляем элементы из первого множества
        for (const item of set1) {
          counts.set(item, (counts.get(item) || 0) + 1);
        }

        // Добавляем элементы из остальных множеств
        for (const other of unwrappedOthers) {
          const otherSet = toSet(other);
          for (const item of otherSet) {
            counts.set(item, (counts.get(item) || 0) + 1);
          }
        }

        // Создаем результирующее множество с элементами, встречающимися нечетное число раз
        const resultSet = new Set();
        for (const [item, count] of counts.entries()) {
          if (count % 2 !== 0) {
            resultSet.add(item);
          }
        }

        // Сортируем и создаем новую ассоциацию
        const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
        const result = ass.wrap(new Set(sortedArray));

        // Устанавливаем истоки - все множества
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'symmetricDifference';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Подсчитываем вхождения каждого элемента
          const counts = new Map();

          // Для всех истоков
          for (let i = 0; i < result.origins.length; i++) {
            const currentSet = toSet(result.origins[i].this);
            for (const item of currentSet) {
              counts.set(item, (counts.get(item) || 0) + 1);
            }
          }

          // Создаем результирующее множество
          const resultSet = new Set();
          for (const [item, count] of counts.entries()) {
            if (count % 2 !== 0) {
              resultSet.add(item);
            }
          }

          // Сортируем и возвращаем результат
          const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
          return new Set(sortedArray);
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      } else {
        // Для Map и Object - подсчитываем вхождения ключей
        const keyCount = new Map();
        const map1 = toMap(ass.this);

        // Добавляем ключи из первой карты
        for (const key of map1.keys()) {
          keyCount.set(key, (keyCount.get(key) || 0) + 1);
        }

        // Добавляем ключи из остальных карт
        for (const other of unwrappedOthers) {
          const otherMap = toMap(other);
          for (const key of otherMap.keys()) {
            keyCount.set(key, (keyCount.get(key) || 0) + 1);
          }
        }

        // Создаем результирующую карту с ключами, встречающимися нечетное число раз
        const resultMap = new Map();
        for (const [key, count] of keyCount.entries()) {
          if (count % 2 !== 0) {
            // Берем значение из первой карты, в которой есть этот ключ
            let value;
            if (map1.has(key)) {
              value = map1.get(key);
            } else {
              for (const other of unwrappedOthers) {
                const otherMap = toMap(other);
                if (otherMap.has(key)) {
                  value = otherMap.get(key);
                  break;
                }
              }
            }
            resultMap.set(key, value);
          }
        }

        const result = ass.wrap(resultMap);

        // Устанавливаем истоки
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'symmetricDifference';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Подсчитываем вхождения каждого ключа
          const keyCount = new Map();
          const valueMap = new Map();

          // Для всех истоков
          for (let i = 0; i < result.origins.length; i++) {
            const currentMap = toMap(result.origins[i].this);
            for (const [key, value] of currentMap.entries()) {
              keyCount.set(key, (keyCount.get(key) || 0) + 1);
              if (!valueMap.has(key)) {
                valueMap.set(key, value);
              }
            }
          }

          // Создаем результирующую карту
          const resultMap = new Map();
          for (const [key, count] of keyCount.entries()) {
            if (count % 2 !== 0) {
              resultMap.set(key, valueMap.get(key));
            }
          }

          return resultMap;
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      }
    };
  }

  if (op === 'apply') {
    // Применяем unwrap к аргументам
    const [unwrappedOther] = args.map(arg => ass.unwrap(arg));

    assertCompatibleTypes(ass.this, unwrappedOther, 'symmetricDifference');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(unwrappedOther);
      const result = new Set();

      // Добавляем элементы, которые есть только в одном из множеств
      for (const item of set1) {
        if (!set2.has(item)) {
          result.add(item);
        }
      }

      for (const item of set2) {
        if (!set1.has(item)) {
          result.add(item);
        }
      }

      // Сортируем результат
      const sortedArray = Array.from(result).sort((a, b) => a - b);
      return ass.wrap(new Set(sortedArray));
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(unwrappedOther);
      const result = new Map();

      // Добавляем ключи, которые есть только в первой карте
      for (const [key, value] of map1) {
        if (!map2.has(key)) {
          result.set(key, value);
        }
      }

      // Добавляем ключи, которые есть только во второй карте
      for (const [key, value] of map2) {
        if (!map1.has(key)) {
          result.set(key, value);
        }
      }

      return ass.wrap(result);
    }
  }
}

/**
 * Вычисляет объединение множеств (A ∪ B ∪ C ∪ ...)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set|Map} - Новое множество/карта, содержащее элементы из всех множеств
 */
export function union(ass, op, args) {
  if (op === 'get') {
    return function(...others) {
      // Применяем unwrap к аргументам
      const unwrappedOthers = others.map(other => ass.unwrap(other));

      // Проверяем что есть хотя бы один аргумент
      if (unwrappedOthers.length === 0) {
        return ass.wrap(ass.this);
      }

      // Проверяем совместимость типов для всех аргументов
      for (const other of unwrappedOthers) {
        assertCompatibleTypes(ass.this, other, 'union');
      }

      if (ass.this.isArray || ass.this.isSet) {
        // Начинаем с первого истока (текущего объекта)
        const resultSet = new Set(toSet(ass.this));

        // Добавляем элементы из остальных множеств
        for (const other of unwrappedOthers) {
          const otherSet = toSet(other);
          for (const item of otherSet) {
            resultSet.add(item);
          }
        }

        // Сортируем и создаем новую ассоциацию
        const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
        const result = ass.wrap(new Set(sortedArray));

        // Устанавливаем истоки - все множества
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'union';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Объединяем все множества
          const resultSet = new Set();

          // Для всех истоков
          for (let i = 0; i < result.origins.length; i++) {
            const currentSet = toSet(result.origins[i].this);
            for (const item of currentSet) {
              resultSet.add(item);
            }
          }

          // Сортируем и возвращаем результат
          const sortedArray = Array.from(resultSet).sort((a, b) => a - b);
          return new Set(sortedArray);
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      } else {
        // Для Map и Object - начинаем с первого истока
        const resultMap = new Map();

        // Перебираем все истоки по порядку, чтобы последние перезаписывали предыдущие
        // Сначала текущий объект (первый исток)
        const map1 = toMap(ass.this);
        for (const [key, value] of map1) {
          resultMap.set(key, value);
        }

        // Затем все последующие истоки (в порядке передачи)
        for (const other of unwrappedOthers) {
          const otherMap = toMap(other);
          for (const [key, value] of otherMap) {
            resultMap.set(key, value); // Перезаписывает предыдущие значения
          }
        }

        const result = ass.wrap(resultMap);

        // Устанавливаем истоки
        const origins = [ass];
        for (const other of others) {
          origins.push(new Association(other));
        }
        result.origins = origins;
        result.temp.method = 'union';

        // Обновляем трансформер для работы со множеством истоков
        result.temp.transformer = () => {
          if (result.origins.length <= 1) return result.origins[0].this;

          // Объединяем все карты, последние перезаписывают предыдущие
          const resultMap = new Map();

          // Для всех истоков в порядке их добавления
          for (let i = 0; i < result.origins.length; i++) {
            const currentMap = toMap(result.origins[i].this);
            for (const [key, value] of currentMap) {
              resultMap.set(key, value); // Перезаписывает предыдущие значения
            }
          }

          return resultMap;
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', setupTrackForMultipleOperations(result));

        return result;
      }
    };
  }

  if (op === 'apply') {
    // Применяем unwrap к аргументам
    const [unwrappedOther] = args.map(arg => ass.unwrap(arg));

    assertCompatibleTypes(ass.this, unwrappedOther, 'union');

    if (ass.this.isArray || ass.this.isSet) {
      const set1 = toSet(ass.this);
      const set2 = toSet(unwrappedOther);
      const result = new Set(set1);

      // Добавляем элементы из второго множества
      for (const item of set2) {
        result.add(item);
      }

      // Сортируем результат
      const sortedArray = Array.from(result).sort((a, b) => a - b);
      return ass.wrap(new Set(sortedArray));
    } else {
      const map1 = toMap(ass.this);
      const map2 = toMap(unwrappedOther);
      const result = new Map();

      // Сначала добавляем все ключи из первой карты
      for (const [key, value] of map1) {
        result.set(key, value);
      }

      // Затем добавляем все ключи из второй карты (перезаписывая совпадающие)
      for (const [key, value] of map2) {
        result.set(key, value);
      }

      return ass.wrap(result);
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

