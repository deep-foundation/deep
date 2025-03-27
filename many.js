/**
 * Модуль для работы с множествами (Set)
 */

import { Association } from './association.js';
import { is } from './is.js';

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
 * Проверяет совместимость типов для операции
 * @param {*} first - Первое значение
 * @param {*} second - Второе значение
 * @throws {Error} Если типы несовместимы
 */
function assertCompatibleTypes(first, second, methodName) {
  if (!isManyType(first)) {
    throw new Error(`${methodName} метод работает только с множественными типами данных`);
  }

  if (!isManyType(second)) {
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
        return new Association(set1.difference(set2));
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        const result = new Map();
        for (const [key, value] of map1) {
          if (!map2.has(key)) {
            result.set(key, value);
          }
        }
        return new Association(result);
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
        return new Association(set1.intersection(set2));
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        const result = new Map();
        for (const [key, value] of map1) {
          if (map2.has(key)) {
            result.set(key, value);
          }
        }
        return new Association(result);
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
        return new Association(set1.symmetricDifference(set2));
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
        return new Association(result);
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
        return new Association(new Set([...set1, ...set2]));
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        return new Association(new Map([...map1, ...map2]));
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
