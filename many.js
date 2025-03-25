/**
 * Модуль для работы с множествами разных типов
 *
 * Содержит универсальные методы для операций над множествами,
 * которые работают с разными типами данных (Array, Set, Map, Object)
 */

import { Association } from './association.js';

/**
 * Создает ассоциацию из значения, если оно еще не является ассоциацией
 * @param {*} value - Значение для оборачивания в ассоциацию
 * @returns {import('./association.js').Association} - Ассоциация
 */
function ensureAssociation(value) {
  if (value && typeof value === 'object' && 'this' in value && value.constructor.name === 'Association') {
    return value;
  }
  return new Association(value);
}

/**
 * Вычисляет разность множеств (элементы, присутствующие в первом множестве, но отсутствующие во втором)
 * @param {import('./association.js').Association} ass - Ассоциация с множеством
 * @param {*} otherSet - Другое множество или значение
 * @returns {import('./association.js').Association} - Ассоциация с результирующим множеством того же типа, что и исходное
 */
function difference(ass, otherSet) {
  const otherAss = ensureAssociation(otherSet);

  const thisValue = ass.this;
  const otherValue = otherAss.this;

  // Если исходное значение не множественное, возвращаем его как единичное множество,
  // только если оно не найдено во втором множестве
  if (!ass.isMany) {
    // Если второе значение тоже единичное, просто сравниваем
    if (!otherAss.isMany) {
      // Если значения равны, возвращаем пустой объект того же типа
      // (если это примитивы, возвращаем пустой объект)
      if (thisValue === otherValue) {
        return new Association({});
      }
      // Иначе возвращаем исходное значение
      return ass;
    }

    // Если второе значение множественное, проверяем, содержится ли в нем исходное значение
    // Для Set
    if (otherValue instanceof Set && otherValue.has(thisValue)) {
      return new Association({});
    }
    // Для Map (проверяем значения)
    if (otherValue instanceof Map) {
      for (const [, value] of otherValue) {
        if (value === thisValue) {
          return new Association({});
        }
      }
    }
    // Для Array
    if (Array.isArray(otherValue) && otherValue.includes(thisValue)) {
      return new Association({});
    }
    // Для Object (проверяем значения)
    if (typeof otherValue === 'object' && otherValue !== null &&
        !(otherValue instanceof Set) && !(otherValue instanceof Map) &&
        !Array.isArray(otherValue)) {
      for (const key in otherValue) {
        if (otherValue[key] === thisValue) {
          return new Association({});
        }
      }
    }

    // Если исходное значение не найдено во втором множестве, возвращаем его
    return ass;
  }

  // Обработка для различных типов множеств

  // Для Set
  if (thisValue instanceof Set) {
    const resultSet = new Set();

    // Если второе значение тоже Set, используем нативный метод
    if (otherValue instanceof Set) {
      // Используем нативную операцию разности множеств для Set
      for (const item of thisValue) {
        if (!otherValue.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение массив
    else if (Array.isArray(otherValue)) {
      const otherSet = new Set(otherValue);
      for (const item of thisValue) {
        if (!otherSet.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение Map, сравниваем с его значениями
    else if (otherValue instanceof Map) {
      const otherValues = new Set(Array.from(otherValue.values()));
      for (const item of thisValue) {
        if (!otherValues.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение объект, сравниваем с его значениями
    else if (typeof otherValue === 'object' && otherValue !== null) {
      const otherValues = new Set(Object.values(otherValue));
      for (const item of thisValue) {
        if (!otherValues.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение не множественное, исключаем только его
    else {
      for (const item of thisValue) {
        if (item !== otherValue) {
          resultSet.add(item);
        }
      }
    }

    return new Association(resultSet);
  }

  // Для Map
  if (thisValue instanceof Map) {
    const resultMap = new Map();

    // Если второе значение тоже Map
    if (otherValue instanceof Map) {
      for (const [key, value] of thisValue) {
        if (!otherValue.has(key)) {
          resultMap.set(key, value);
        }
      }
    }
    // Если второе значение не Map, сравниваем по ключам
    // Предполагаем, что otherValue - это объект с ключами
    else if (typeof otherValue === 'object' && otherValue !== null && !Array.isArray(otherValue)) {
      for (const [key, value] of thisValue) {
        if (!(key in otherValue)) {
          resultMap.set(key, value);
        }
      }
    }
    // Для других типов, возвращаем исходную Map (нет смысла в разности с не-объектами)
    else {
      return ass;
    }

    return new Association(resultMap);
  }

  // Для Array
  if (Array.isArray(thisValue)) {
    let result;

    // Если второе значение Set
    if (otherValue instanceof Set) {
      result = thisValue.filter(item => !otherValue.has(item));
    }
    // Если второе значение тоже Array
    else if (Array.isArray(otherValue)) {
      // Используем filter для более эффективной фильтрации
      result = thisValue.filter(item => !otherValue.includes(item));
    }
    // Если второе значение Map, сравниваем с его значениями
    else if (otherValue instanceof Map) {
      const otherValues = Array.from(otherValue.values());
      result = thisValue.filter(item => !otherValues.includes(item));
    }
    // Если второе значение объект, сравниваем с его значениями
    else if (typeof otherValue === 'object' && otherValue !== null) {
      const otherValues = Object.values(otherValue);
      result = thisValue.filter(item => !otherValues.includes(item));
    }
    // Если второе значение не множественное, исключаем только его
    else {
      result = thisValue.filter(item => item !== otherValue);
    }

    return new Association(result);
  }

  // Для Object
  if (typeof thisValue === 'object' && thisValue !== null &&
      !(thisValue instanceof Set) && !(thisValue instanceof Map) &&
      !Array.isArray(thisValue)) {
    const result = {};

    // Если второе значение тоже Object
    if (typeof otherValue === 'object' && otherValue !== null &&
        !(otherValue instanceof Set) && !(otherValue instanceof Map) &&
        !Array.isArray(otherValue)) {
      for (const key in thisValue) {
        if (!(key in otherValue)) {
          result[key] = thisValue[key];
        }
      }
    }
    // Если второе значение Map
    else if (otherValue instanceof Map) {
      for (const key in thisValue) {
        if (!otherValue.has(key)) {
          result[key] = thisValue[key];
        }
      }
    }
    // Для других типов, возвращаем исходный объект
    else {
      return ass;
    }

    return new Association(result);
  }

  // Если тип не обрабатывается, возвращаем исходное значение
  return ass;
}

/**
 * Вычисляет пересечение множеств (элементы, присутствующие и в первом, и во втором множестве)
 * @param {import('./association.js').Association} ass - Ассоциация с множеством
 * @param {*} otherSet - Другое множество или значение
 * @returns {import('./association.js').Association} - Ассоциация с результирующим множеством того же типа, что и исходное
 */
function intersection(ass, otherSet) {
  const otherAss = ensureAssociation(otherSet);

  const thisValue = ass.this;
  const otherValue = otherAss.this;

  // Если исходное значение не множественное, возвращаем его как единичное множество,
  // только если оно найдено во втором множестве
  if (!ass.isMany) {
    // Если второе значение тоже единичное, просто сравниваем
    if (!otherAss.isMany) {
      // Если значения равны, возвращаем исходное значение
      if (thisValue === otherValue) {
        return ass;
      }
      // Иначе возвращаем пустой объект
      return new Association({});
    }

    // Если второе значение множественное, проверяем, содержится ли в нем исходное значение
    // Для Set
    if (otherValue instanceof Set && otherValue.has(thisValue)) {
      return ass;
    }
    // Для Map (проверяем значения)
    if (otherValue instanceof Map) {
      for (const [, value] of otherValue) {
        if (value === thisValue) {
          return ass;
        }
      }
    }
    // Для Array
    if (Array.isArray(otherValue) && otherValue.includes(thisValue)) {
      return ass;
    }
    // Для Object (проверяем значения)
    if (typeof otherValue === 'object' && otherValue !== null &&
        !(otherValue instanceof Set) && !(otherValue instanceof Map) &&
        !Array.isArray(otherValue)) {
      for (const key in otherValue) {
        if (otherValue[key] === thisValue) {
          return ass;
        }
      }
    }

    // Если исходное значение не найдено во втором множестве, возвращаем пустой объект
    return new Association({});
  }

  // Обработка для различных типов множеств

  // Для Set
  if (thisValue instanceof Set) {
    const resultSet = new Set();

    // Если второе значение тоже Set
    if (otherValue instanceof Set) {
      for (const item of thisValue) {
        if (otherValue.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение массив
    else if (Array.isArray(otherValue)) {
      const otherSet = new Set(otherValue);
      for (const item of thisValue) {
        if (otherSet.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение Map, сравниваем с его значениями
    else if (otherValue instanceof Map) {
      const otherValues = new Set(Array.from(otherValue.values()));
      for (const item of thisValue) {
        if (otherValues.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение объект, сравниваем с его значениями
    else if (typeof otherValue === 'object' && otherValue !== null) {
      const otherValues = new Set(Object.values(otherValue));
      for (const item of thisValue) {
        if (otherValues.has(item)) {
          resultSet.add(item);
        }
      }
    }
    // Если второе значение не множественное, проверяем только его
    else {
      if (thisValue.has(otherValue)) {
        resultSet.add(otherValue);
      }
    }

    return new Association(resultSet);
  }

  // Для Map
  if (thisValue instanceof Map) {
    const resultMap = new Map();

    // Если второе значение тоже Map
    if (otherValue instanceof Map) {
      for (const [key, value] of thisValue) {
        if (otherValue.has(key)) {
          resultMap.set(key, value);
        }
      }
    }
    // Если второе значение обычный объект
    else if (typeof otherValue === 'object' && otherValue !== null && !Array.isArray(otherValue)) {
      for (const [key, value] of thisValue) {
        if (key in otherValue) {
          resultMap.set(key, value);
        }
      }
    }
    // Для других типов, возвращаем пустую Map (нет смысла в пересечении с не-объектами)
    else {
      return new Association(new Map());
    }

    return new Association(resultMap);
  }

  // Для Array
  if (Array.isArray(thisValue)) {
    let result;

    // Если второе значение Set
    if (otherValue instanceof Set) {
      result = thisValue.filter(item => otherValue.has(item));
    }
    // Если второе значение тоже Array
    else if (Array.isArray(otherValue)) {
      result = thisValue.filter(item => otherValue.includes(item));
    }
    // Если второе значение Map, сравниваем с его значениями
    else if (otherValue instanceof Map) {
      const otherValues = Array.from(otherValue.values());
      result = thisValue.filter(item => otherValues.includes(item));
    }
    // Если второе значение объект, сравниваем с его значениями
    else if (typeof otherValue === 'object' && otherValue !== null) {
      const otherValues = Object.values(otherValue);
      result = thisValue.filter(item => otherValues.includes(item));
    }
    // Если второе значение не множественное, проверяем только его
    else {
      result = thisValue.includes(otherValue) ? [otherValue] : [];
    }

    return new Association(result);
  }

  // Для Object
  if (typeof thisValue === 'object' && thisValue !== null &&
      !(thisValue instanceof Set) && !(thisValue instanceof Map) &&
      !Array.isArray(thisValue)) {
    const result = {};

    // Если второе значение тоже Object
    if (typeof otherValue === 'object' && otherValue !== null &&
        !(otherValue instanceof Set) && !(otherValue instanceof Map) &&
        !Array.isArray(otherValue)) {
      for (const key in thisValue) {
        if (key in otherValue) {
          result[key] = thisValue[key];
        }
      }
    }
    // Если второе значение Map
    else if (otherValue instanceof Map) {
      for (const key in thisValue) {
        if (otherValue.has(key)) {
          result[key] = thisValue[key];
        }
      }
    }
    // Для других типов, возвращаем пустой объект
    else {
      return new Association({});
    }

    return new Association(result);
  }

  // Если тип не обрабатывается, возвращаем пустой объект
  return new Association({});
}

/**
 * Возвращает симметричную разность двух множеств
 * Симметричная разность - элементы, которые есть только в одном из множеств, но не в обоих
 *
 * @param {Association|*} ass Первое множество в виде Association или любого значения
 * @param {*} other Второе множество или любое значение
 * @returns {Association} Новый объект Association, содержащий элементы, присутствующие только в одном из множеств
 */
function symmetricDifference(ass, other) {
  // Обеспечиваем, что оба аргумента - Association
  if (!((typeof ass === 'object' || typeof ass === 'function') && 'this' in ass && 'temp' in ass)) {
    ass = ensureAssociation(ass);
  }

  let otherAss = (other && typeof other === 'object' && 'this' in other && 'temp' in other)
    ? other
    : ensureAssociation(other);

  const thisValue = ass.this;
  const otherValue = otherAss.this;
  let result;

  // Обработка Set
  if (thisValue instanceof Set) {
    // Создаем копию первого множества
    result = new Set([...thisValue]);

    // Для элементов из второго множества:
    // - Если элемент уже есть в результате, удаляем его
    // - Если элемента нет в результате, добавляем его
    if (otherValue instanceof Set) {
      for (const item of otherValue) {
        if (result.has(item)) {
          result.delete(item);
        } else {
          result.add(item);
        }
      }
    } else if (Array.isArray(otherValue)) {
      for (const item of otherValue) {
        if (result.has(item)) {
          result.delete(item);
        } else {
          result.add(item);
        }
      }
    } else if (otherValue instanceof Map) {
      for (const [key, value] of otherValue.entries()) {
        if (result.has(key)) {
          result.delete(key);
        } else {
          result.add(key);
        }
      }
    } else if (otherValue !== null && typeof otherValue === 'object') {
      for (const key in otherValue) {
        if (Object.prototype.hasOwnProperty.call(otherValue, key)) {
          if (result.has(key)) {
            result.delete(key);
          } else {
            result.add(key);
          }
        }
      }
    } else if (otherValue !== undefined && otherValue !== null) {
      // Для примитивов
      if (result.has(otherValue)) {
        result.delete(otherValue);
      } else {
        result.add(otherValue);
      }
    }
  }
  // Обработка Array
  else if (Array.isArray(thisValue)) {
    // Для массивов используем множество для отслеживания элементов
    const tempSet = new Set();

    // Добавляем все элементы из первого массива в множество
    for (const item of thisValue) {
      tempSet.add(item);
    }

    // Для второго множества/массива, проверяем каждый элемент
    if (Array.isArray(otherValue)) {
      for (const item of otherValue) {
        if (tempSet.has(item)) {
          tempSet.delete(item);
        } else {
          tempSet.add(item);
        }
      }
    } else if (otherValue instanceof Set) {
      for (const item of otherValue) {
        if (tempSet.has(item)) {
          tempSet.delete(item);
        } else {
          tempSet.add(item);
        }
      }
    } else if (otherValue instanceof Map) {
      for (const [key, value] of otherValue.entries()) {
        if (tempSet.has(key)) {
          tempSet.delete(key);
        } else {
          tempSet.add(key);
        }
      }
    } else if (otherValue !== null && typeof otherValue === 'object') {
      for (const key in otherValue) {
        if (Object.prototype.hasOwnProperty.call(otherValue, key)) {
          if (tempSet.has(key)) {
            tempSet.delete(key);
          } else {
            tempSet.add(key);
          }
        }
      }
    } else if (otherValue !== undefined && otherValue !== null) {
      // Для примитивов
      if (tempSet.has(otherValue)) {
        tempSet.delete(otherValue);
      } else {
        tempSet.add(otherValue);
      }
    }

    // Преобразуем множество обратно в массив
    result = Array.from(tempSet);
  }
  // Обработка Map
  else if (thisValue instanceof Map) {
    result = new Map(thisValue); // Копируем исходную Map

    // Для элементов из второго множества:
    // - Если ключ уже есть в результате, удаляем его
    // - Если ключа нет в результате, добавляем его
    if (otherValue instanceof Map) {
      for (const [key, value] of otherValue.entries()) {
        if (result.has(key)) {
          result.delete(key);
        } else {
          result.set(key, value);
        }
      }
    } else if (Array.isArray(otherValue)) {
      for (let i = 0; i < otherValue.length; i++) {
        const key = i.toString();
        if (result.has(key)) {
          result.delete(key);
        } else if (otherValue[i] !== undefined) {
          result.set(key, otherValue[i]);
        }
      }
    } else if (otherValue instanceof Set) {
      let i = 0;
      for (const item of otherValue) {
        if (result.has(item)) {
          result.delete(item);
        } else {
          result.set(item, i++);
        }
      }
    } else if (otherValue !== null && typeof otherValue === 'object') {
      for (const key in otherValue) {
        if (Object.prototype.hasOwnProperty.call(otherValue, key)) {
          if (result.has(key)) {
            result.delete(key);
          } else {
            result.set(key, otherValue[key]);
          }
        }
      }
    } else if (otherValue !== undefined && otherValue !== null &&
              (typeof otherValue === 'string' || typeof otherValue === 'number')) {
      if (result.has(otherValue)) {
        result.delete(otherValue);
      } else {
        result.set(otherValue, 0);
      }
    }
  }
  // Обработка Object
  else if (thisValue !== null && typeof thisValue === 'object') {
    result = {...thisValue}; // Копируем исходный объект

    // Для элементов из второго множества:
    // - Если ключ уже есть в результате, удаляем его
    // - Если ключа нет в результате, добавляем его
    if (otherValue !== null && typeof otherValue === 'object' && !Array.isArray(otherValue) &&
        !(otherValue instanceof Set) && !(otherValue instanceof Map)) {
      for (const key in otherValue) {
        if (Object.prototype.hasOwnProperty.call(otherValue, key)) {
          if (key in result) {
            delete result[key];
          } else {
            result[key] = otherValue[key];
          }
        }
      }
    } else if (Array.isArray(otherValue)) {
      for (let i = 0; i < otherValue.length; i++) {
        if (i in result) {
          delete result[i];
        } else if (otherValue[i] !== undefined) {
          result[i] = otherValue[i];
        }
      }
    } else if (otherValue instanceof Set) {
      let i = 0;
      for (const item of otherValue) {
        const key = typeof item === 'string' || typeof item === 'number' ? item : i++;
        if (key in result) {
          delete result[key];
        } else {
          result[key] = item;
        }
      }
    } else if (otherValue instanceof Map) {
      for (const [key, value] of otherValue.entries()) {
        if (typeof key === 'string' || typeof key === 'number') {
          if (key in result) {
            delete result[key];
          } else {
            result[key] = value;
          }
        }
      }
    } else if (otherValue !== undefined && otherValue !== null &&
              (typeof otherValue === 'string' || typeof otherValue === 'number')) {
      if (otherValue in result) {
        delete result[otherValue];
      } else {
        result[otherValue] = otherValue;
      }
    }
  }
  // Обработка примитивов
  else {
    if (thisValue === otherValue) {
      // Если значения равны, возвращаем пустой массив
      result = [];
    } else {
      // Если значения различны, включаем оба в результат
      result = [thisValue, otherValue];
    }
  }

  return new Association(result);
}

// Экспортируем все методы работы с множествами
export const all = {
  difference,
  intersection,
  symmetricDifference,
};

export const _many = { difference, intersection, symmetricDifference };

// Инициализация методов работы с множествами для Association
// Добавляем методы работы с множествами в Association._proxy
for (const name in all) {
  Association._proxy.set(name, (ass, op, args) => {
    if (op === 'get') {
      // Кешируем функцию в temp для повышения производительности
      return ass.temp[name] = ass.temp[name] || (otherSet =>
        all[name](ass, otherSet)
      );
    } else if (op === 'apply') {
      // При прямом вызове метода (например, в тестах)
      return all[name](ass, args[0]);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  });
}

// Переопределяем основные экспорты для обратной совместимости
export {
  difference,
  intersection,
  symmetricDifference
};
