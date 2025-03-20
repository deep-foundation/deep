/**
 * Модуль операций с WeakMap и WeakSet
 *
 * Содержит методы для работы с "слабыми" коллекциями WeakMap и WeakSet.
 */

import { Association } from "../association.js";

/**
 * Установка значения по ключу в WeakMap или добавление значения в WeakSet
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция weakSet или экземпляр Association
 */
export function weakSet(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.weakSet = ass.temp.weakSet || function(key, value) {
      const target = ass.this;

      // Проверяем, что target - WeakMap
      if (!(target instanceof WeakMap)) {
        throw new TypeError('weakSet called on non-WeakMap');
      }

      // Проверяем, что ключ - это объект
      if (key === null || typeof key !== 'object') {
        throw new TypeError('WeakMap key must be an object');
      }

      // Невозможно получить предыдущее значение для сравнения,
      // так как нельзя итерировать WeakMap

      // Устанавливаем новое значение
      target.set(key, value);

      // Генерируем события
      ass.emit('weakSet', key, value);

      // Генерируем общее событие change
      ass.emit('change', { [String(key)]: 'unknown' }, target, key, {
        method: 'weakSet',
        arguments: [key, value]
      });

      return ass;
    };
  } else if (op === 'apply' && args.length >= 2) {
    const [key, value] = args;
    return weakSet(ass, 'get')(key, value);
  }
}

/**
 * Удаление значения по ключу из WeakMap или значения из WeakSet
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|boolean} - Функция weakDelete или результат операции (true, если значение было удалено)
 */
export function weakDelete(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.weakDelete = ass.temp.weakDelete || function(key) {
      const target = ass.this;

      // Проверяем, что target - WeakMap или WeakSet
      if (!(target instanceof WeakMap) && !(target instanceof WeakSet)) {
        throw new TypeError('weakDelete called on non-WeakMap and non-WeakSet');
      }

      // Проверяем, что ключ - это объект
      if (key === null || typeof key !== 'object') {
        throw new TypeError('WeakMap/WeakSet key must be an object');
      }

      // Проверяем, существует ли ключ
      const hasKey = target.has(key);
      if (!hasKey) {
        return false;
      }

      // Удаляем значение
      const result = target.delete(key);

      // Генерируем события только если удаление было успешным
      if (result) {
        ass.emit('weakDelete', key);

        // Генерируем общее событие change
        ass.emit('change', { [String(key)]: 'removed' }, target, key, {
          method: 'weakDelete',
          arguments: [key]
        });
      }

      return result;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [key] = args;
    return weakDelete(ass, 'get')(key);
  }
}

/**
 * Добавление значения в WeakSet
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция weakAdd или экземпляр Association
 */
export function weakAdd(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.weakAdd = ass.temp.weakAdd || function(value) {
      const target = ass.this;

      // Проверяем, что target - WeakSet
      if (!(target instanceof WeakSet)) {
        throw new TypeError('weakAdd called on non-WeakSet');
      }

      // Проверяем, что значение - это объект
      if (value === null || typeof value !== 'object') {
        throw new TypeError('WeakSet value must be an object');
      }

      // Проверяем, есть ли уже такое значение
      const hasValue = target.has(value);
      if (hasValue) {
        return ass;
      }

      // Добавляем значение
      target.add(value);

      // Генерируем события
      ass.emit('weakAdd', value);

      // Генерируем общее событие change
      ass.emit('change', { [String(value)]: 'added' }, target, value, {
        method: 'weakAdd',
        arguments: [value]
      });

      return ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [value] = args;
    return weakAdd(ass, 'get')(value);
  }
}
