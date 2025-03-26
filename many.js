/**
 * Модуль для работы с множествами (Set)
 */

import { Association } from './association.js';

/**
 * Проверяет, является ли значение множеством Set
 * @param {*} value - Проверяемое значение
 * @throws {Error} Если значение не является Set
 */
function assertSet(value, methodName) {
  if (!(value instanceof Set)) {
    throw new Error(`${methodName} метод работает только с типом Set`);
  }
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
 * @returns {Set} - Новое множество, содержащее элементы из A, которых нет в B
 */
export function difference(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertSet(ass.this, 'difference');
      assertSet(other, 'difference');
      return new Association(ass.this.difference(other));
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertSet(ass.this, 'difference');
    assertSet(other, 'difference');
    return ass.this.difference(other);
  }
}

/**
 * Вычисляет пересечение множеств (A ∩ B)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set} - Новое множество, содержащее общие элементы A и B
 */
export function intersection(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertSet(ass.this, 'intersection');
      assertSet(other, 'intersection');
      return new Association(ass.this.intersection(other));
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertSet(ass.this, 'intersection');
    assertSet(other, 'intersection');
    return ass.this.intersection(other);
  }
}

/**
 * Вычисляет симметрическую разность множеств (A △ B)
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set} - Новое множество, содержащее элементы, присутствующие только в одном из множеств
 */
export function symmetricDifference(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertSet(ass.this, 'symmetricDifference');
      assertSet(other, 'symmetricDifference');
      return new Association(ass.this.symmetricDifference(other));
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertSet(ass.this, 'symmetricDifference');
    assertSet(other, 'symmetricDifference');
    return ass.this.symmetricDifference(other);
  }
}

/**
 * Вычисляет объединение двух множеств
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {Set} - Новое множество, содержащее все элементы из обоих множеств
 */
export function union(ass, op, args) {
  if (op === 'get') {
    return function(other) {
      assertSet(ass.this, 'union');
      assertSet(other, 'union');
      return new Association(new Set([...ass.this, ...other]));
    };
  }

  if (op === 'apply') {
    const [other] = args;
    assertSet(ass.this, 'union');
    assertSet(other, 'union');
    return new Set([...ass.this, ...other]);
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
