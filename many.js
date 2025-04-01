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
        const result = new Association(set1.difference(set2));
        result.origins = [ass];
        result.temp.method = 'difference';
        result.temp.transformer = (set) => set.difference(toSet(other));

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
            const origin = ass.origins[0];
            const offChange = origin.on('change', (event, meta) => {
              const detail = event?.detail;
              const set2 = toSet(other);

              if (detail) {
                const operation = detail.operation;
                const value = detail.value;

                switch (operation) {
                  case 'add':
                    // Добавляем элемент только если его нет в other
                    if (!set2.has(value)) {
                      result.this.add(value);
                    }
                    break;

                  case 'delete':
                    // Просто удаляем элемент из результата
                    result.this.delete(value);
                    break;

                  default:
                    // Для других операций делаем полный пересчет
                    result.this = toSet(origin.this).difference(set2);
                }

                // Генерируем событие изменения
                if (result.emit) {
                  result.emit('change', event, meta);
                }
              }
            });

            track.temp.offChange = offChange;
          }

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
        resultAss.origins = [ass];
        resultAss.temp.method = 'difference';
        resultAss.temp.transformer = (map) => {
          const result = new Map();
          for (const [key, value] of toMap(map)) {
            if (!map2.has(key)) {
              result.set(key, value);
            }
          }
          return result;
        };
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
        result.origins = [ass];
        result.temp.method = 'intersection';
        result.temp.transformer = (set) => set.intersection(toSet(other));

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
            const origin = ass.origins[0];
            const offChange = origin.on('change', (event, meta) => {
              const detail = event?.detail;
              const set2 = toSet(other);

              if (detail) {
                const operation = detail.operation;
                const value = detail.value;

                switch (operation) {
                  case 'add':
                    // Добавляем элемент только если он есть в other
                    if (set2.has(value)) {
                      result.this.add(value);
                    }
                    break;

                  case 'delete':
                    // Просто удаляем элемент из результата
                    result.this.delete(value);
                    break;

                  default:
                    // Для других операций делаем полный пересчет
                    result.this = toSet(origin.this).intersection(set2);
                }

                // Генерируем событие изменения
                if (result.emit) {
                  result.emit('change', event, meta);
                }
              }
            });

            track.temp.offChange = offChange;
          }

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
        resultAss.origins = [ass];
        resultAss.temp.method = 'intersection';
        resultAss.temp.transformer = (map) => {
          const result = new Map();
          for (const [key, value] of toMap(map)) {
            if (map2.has(key)) {
              result.set(key, value);
            }
          }
          return result;
        };
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
        result.origins = [ass];
        result.temp.method = 'symmetricDifference';
        result.temp.transformer = (set) => {
          const diff = toSet(set).symmetricDifference(toSet(other));
          return new Set(Array.from(diff).sort((a, b) => a - b));
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
            const origin = ass.origins[0];
            const offChange = origin.on('change', (event, meta) => {
              const detail = event?.detail;
              const set2 = toSet(other);

              if (detail) {
                const operation = detail.operation;
                const value = detail.value;

                switch (operation) {
                  case 'add':
                    // Если элемент есть в other, удаляем его из результата
                    // Если нет - добавляем
                    if (set2.has(value)) {
                      result.this.delete(value);
                    } else {
                      result.this.add(value);
                    }
                    break;

                  case 'delete':
                    // Если элемент есть в other, добавляем его в результат
                    // Если нет - удаляем
                    if (set2.has(value)) {
                      result.this.add(value);
                    } else {
                      result.this.delete(value);
                    }
                    break;

                  default:
                    // Для других операций делаем полный пересчет
                    const newSet = toSet(origin.this).symmetricDifference(set2);
                    result.this = new Set(Array.from(newSet).sort((a, b) => a - b));
                }

                // Генерируем событие изменения
                if (result.emit) {
                  result.emit('change', event, meta);
                }
              }
            });

            track.temp.offChange = offChange;
          }

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
        for (const [key, value] of map2) {
          if (!map1.has(key)) {
            result.set(key, value);
          }
        }
        const resultAss = new Association(result);
        resultAss.origins = [ass];
        resultAss.temp.method = 'symmetricDifference';
        resultAss.temp.transformer = (map) => {
          const result = new Map();
          const map1 = toMap(map);
          const map2 = toMap(other);
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
        };
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
        result.origins = [ass];
        result.temp.method = 'union';
        result.temp.transformer = (set) => {
          const combined = new Set([...toSet(set), ...toSet(other)]);
          return new Set(Array.from(combined).sort((a, b) => a - b));
        };

        // Добавляем локальный track для точечных обновлений
        result._proxy.set('track', (ass, op) => {
          if (op !== 'get') return;
          const track = Association._proxy.get('track').call(ass, ass, 'get');

          if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
            const origin = ass.origins[0];
            const offChange = origin.on('change', (event, meta) => {
              const detail = event?.detail;

              if (detail) {
                const operation = detail.operation;
                const value = detail.value;

                switch (operation) {
                  case 'add':
                    // Просто добавляем новый элемент
                    result.this.add(value);
                    // Пересортировываем результат
                    result.this = new Set(Array.from(result.this).sort((a, b) => a - b));
                    break;

                  case 'delete':
                    // Удаляем элемент только если его нет в other
                    if (!toSet(other).has(value)) {
                      result.this.delete(value);
                    }
                    break;

                  default:
                    // Для других операций делаем полный пересчет
                    const newSet = new Set([...toSet(origin.this), ...toSet(other)]);
                    result.this = new Set(Array.from(newSet).sort((a, b) => a - b));
                }

                // Генерируем событие изменения
                if (result.emit) {
                  result.emit('change', event, meta);
                }
              }
            });

            track.temp.offChange = offChange;
          }

          return track;
        });

        return result;
      } else {
        const map1 = toMap(ass.this);
        const map2 = toMap(other);
        const result = new Map([...map1, ...map2]);
        const resultAss = new Association(result);
        resultAss.origins = [ass];
        resultAss.temp.method = 'union';
        resultAss.temp.transformer = (map) => new Map([...toMap(map), ...toMap(other)]);
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
