/**
 * Модуль операций с массивами
 *
 * Содержит методы для модификации массивов: push, pop, shift, unshift, splice, и т.д.
 */

import { Association } from "../association.js";

/**
 * Добавление элементов в конец массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|number} - Функция push или новая длина массива
 */
export function push(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.push = ass.temp.push || function(...items) {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('push called on non-array');
      }

      // Сохраняем текущую длину массива и предыдущее состояние для событий
      const prevLength = target.length;
      const prevState = [...target];

      // Добавляем элементы в конец массива
      const result = target.push(...items);

      // Генерируем события
      ass.emit('push', items, result);

      // Генерируем события для каждого добавленного элемента
      for (let i = 0; i < items.length; i++) {
        ass.emit('set', prevLength + i, items[i], undefined);
      }

      // Генерируем событие для изменения длины
      ass.emit('set', 'length', result, prevLength);

      // Генерируем общее событие change
      ass.emit('change', prevState, target, null, {
        method: 'push',
        arguments: items
      });

      return result;
    };
  } else if (op === 'apply') {
    return push(ass, 'get')(...args);
  }
}

/**
 * Удаление последнего элемента из массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|any} - Функция pop или удаленный элемент
 */
export function pop(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.pop = ass.temp.pop || function() {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('pop called on non-array');
      }

      // Если массив пустой, возвращаем undefined
      if (target.length === 0) {
        return undefined;
      }

      // Сохраняем текущую длину массива и предыдущее состояние для событий
      const prevLength = target.length;
      const prevState = [...target];
      const lastIndex = prevLength - 1;
      const lastElement = target[lastIndex];

      // Удаляем последний элемент
      const result = target.pop();

      // Генерируем события
      ass.emit('pop', result, target.length);

      // Генерируем событие для удаленного элемента
      ass.emit('delete', lastIndex, lastElement);

      // Генерируем событие для изменения длины
      ass.emit('set', 'length', target.length, prevLength);

      // Генерируем общее событие change
      ass.emit('change', prevState, target, lastIndex, {
        method: 'pop',
        arguments: []
      });

      return result;
    };
  } else if (op === 'apply') {
    return pop(ass, 'get')();
  }
}

/**
 * Удаление первого элемента из массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|any} - Функция shift или удаленный элемент
 */
export function shift(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.shift = ass.temp.shift || function() {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('shift called on non-array');
      }

      // Если массив пустой, возвращаем undefined
      if (target.length === 0) {
        return undefined;
      }

      // Сохраняем текущую длину массива и предыдущее состояние для событий
      const prevLength = target.length;
      const prevState = [...target];
      const firstElement = target[0];

      // Удаляем первый элемент
      const result = target.shift();

      // Генерируем события
      ass.emit('shift', result, target.length);

      // Генерируем событие для удаленного элемента
      ass.emit('delete', 0, firstElement);

      // Генерируем события для сдвинутых элементов
      for (let i = 0; i < target.length; i++) {
        ass.emit('set', i, target[i], prevState[i + 1]);
      }

      // Генерируем событие для изменения длины
      ass.emit('set', 'length', target.length, prevLength);

      // Генерируем общее событие change
      ass.emit('change', prevState, target, 0, {
        method: 'shift',
        arguments: []
      });

      return result;
    };
  } else if (op === 'apply') {
    return shift(ass, 'get')();
  }
}

/**
 * Добавление элементов в начало массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|number} - Функция unshift или новая длина массива
 */
export function unshift(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.unshift = ass.temp.unshift || function(...items) {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('unshift called on non-array');
      }

      // Сохраняем текущую длину массива и предыдущее состояние для событий
      const prevLength = target.length;
      const prevState = [...target];

      // Добавляем элементы в начало массива
      const result = target.unshift(...items);

      // Генерируем события
      ass.emit('unshift', items, result);

      // Генерируем события для всех элементов
      // Сначала для новых элементов
      for (let i = 0; i < items.length; i++) {
        ass.emit('set', i, items[i], i < prevLength ? prevState[i] : undefined);
      }

      // Затем для сдвинутых элементов
      for (let i = items.length; i < result; i++) {
        ass.emit('set', i, target[i], i - items.length < prevLength ? prevState[i - items.length] : undefined);
      }

      // Генерируем событие для изменения длины
      ass.emit('set', 'length', result, prevLength);

      // Генерируем общее событие change
      ass.emit('change', prevState, target, null, {
        method: 'unshift',
        arguments: items
      });

      return result;
    };
  } else if (op === 'apply') {
    return unshift(ass, 'get')(...args);
  }
}

/**
 * Удаление/добавление элементов массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Array} - Функция splice или массив удаленных элементов
 */
export function splice(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.splice = ass.temp.splice || function(start, deleteCount, ...items) {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('splice called on non-array');
      }

      // Сохраняем текущую длину массива и предыдущее состояние для событий
      const prevLength = target.length;
      const prevState = [...target];

      // Нормализуем start
      const actualStart = start < 0 ? Math.max(prevLength + start, 0) : Math.min(start, prevLength);

      // Нормализуем deleteCount, если он не указан
      const actualDeleteCount = deleteCount === undefined ? prevLength - actualStart :
        Math.max(0, Math.min(deleteCount, prevLength - actualStart));

      // Выполняем операцию splice
      const deleted = target.splice(actualStart, actualDeleteCount, ...items);

      // Генерируем события
      ass.emit('splice', actualStart, deleted, items);

      // Генерируем события delete для каждого удаленного элемента
      for (let i = 0; i < deleted.length; i++) {
        ass.emit('delete', actualStart + i, deleted[i]);
      }

      // Генерируем события set для каждого добавленного элемента
      for (let i = 0; i < items.length; i++) {
        ass.emit('set', actualStart + i, items[i],
          actualStart + i < actualStart + actualDeleteCount ? prevState[actualStart + i] : undefined);
      }

      // Генерируем события set для каждого смещенного элемента
      const deltaLength = items.length - actualDeleteCount;
      if (deltaLength !== 0) {
        const startOffset = actualStart + actualDeleteCount;
        const endOffset = prevLength;

        for (let i = startOffset; i < endOffset; i++) {
          const newIndex = i + deltaLength;
          if (newIndex < target.length) {
            ass.emit('set', newIndex, target[newIndex], prevState[i]);
          }
        }
      }

      // Генерируем событие изменения длины, если длина изменилась
      if (prevLength !== target.length) {
        ass.emit('set', 'length', target.length, prevLength);
      }

      // Генерируем общее событие change
      ass.emit('change', prevState, target, actualStart, {
        method: 'splice',
        arguments: [actualStart, actualDeleteCount, ...items]
      });

      return deleted;
    };
  } else if (op === 'apply') {
    return splice(ass, 'get')(...args);
  }
}

/**
 * Обращение порядка элементов массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция reverse или экземпляр Association
 */
export function reverse(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.reverse = ass.temp.reverse || function() {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('reverse called on non-array');
      }

      // Сохраняем предыдущее состояние для событий
      const prevState = [...target];

      // Выполняем операцию reverse
      target.reverse();

      // Проверяем, были ли изменения
      let changed = false;
      for (let i = 0; i < target.length; i++) {
        if (target[i] !== prevState[i]) {
          changed = true;
          break;
        }
      }

      // Генерируем события только если были изменения
      if (changed) {
        ass.emit('reverse');

        // Генерируем общее событие change
        ass.emit('change', prevState, target, null, {
          method: 'reverse',
          arguments: []
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    return reverse(ass, 'get')();
  }
}

/**
 * Сортировка элементов массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция sort или экземпляр Association
 */
export function sort(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.sort = ass.temp.sort || function(compareFunction) {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('sort called on non-array');
      }

      // Сохраняем предыдущее состояние для событий
      const prevState = [...target];

      // Выполняем операцию sort
      target.sort(compareFunction);

      // Проверяем, были ли изменения
      let changed = false;
      for (let i = 0; i < target.length; i++) {
        if (target[i] !== prevState[i]) {
          changed = true;
          break;
        }
      }

      // Генерируем события только если были изменения
      if (changed) {
        ass.emit('sort', compareFunction);

        // Генерируем события set для каждого измененного элемента
        for (let i = 0; i < target.length; i++) {
          if (target[i] !== prevState[i]) {
            ass.emit('set', i, target[i], prevState[i]);
          }
        }

        // Генерируем общее событие change
        ass.emit('change', prevState, target, null, {
          method: 'sort',
          arguments: [compareFunction]
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    const [compareFunction] = args;
    return sort(ass, 'get')(compareFunction);
  }
}

/**
 * Заполнение массива одним значением
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция fill или экземпляр Association
 */
export function fill(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.fill = ass.temp.fill || function(value, start = 0, end) {
      const target = ass.this;

      // Проверяем, что target - массив
      if (!Array.isArray(target)) {
        throw new TypeError('fill called on non-array');
      }

      // Сохраняем предыдущее состояние для событий
      const prevState = [...target];

      // Нормализуем start и end
      const actualStart = start < 0 ? Math.max(target.length + start, 0) : Math.min(start, target.length);
      const actualEnd = end === undefined ? target.length : end < 0 ? Math.max(target.length + end, 0) : Math.min(end, target.length);

      // Выполняем операцию fill
      target.fill(value, actualStart, actualEnd);

      // Генерируем события
      ass.emit('fill', value, actualStart, actualEnd);

      // Генерируем события set для каждого измененного элемента
      for (let i = actualStart; i < actualEnd; i++) {
        if (prevState[i] !== value) {
          ass.emit('set', i, value, prevState[i]);
        }
      }

      // Генерируем общее событие change
      ass.emit('change', prevState, target, null, {
        method: 'fill',
        arguments: [value, actualStart, actualEnd]
      });

      return ass;
    };
  } else if (op === 'apply') {
    const [value, start, end] = args;
    return fill(ass, 'get')(value, start, end);
  }
}
