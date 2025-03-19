/**
 * Модуль операций с коллекциями Map и Set
 *
 * Содержит методы для работы с Map и Set: добавление, удаление, очистка и т.д.
 */

import { Association } from "../association.js";

/**
 * Установка значения по ключу в Map
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция mapSet или экземпляр Association
 */
export function mapSet(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.mapSet = ass.temp.mapSet || function(key, value) {
      const target = ass.this;

      // Проверяем, что target - Map
      if (!(target instanceof Map)) {
        throw new TypeError('mapSet called on non-Map');
      }

      // Сохраняем предыдущее значение, если оно есть
      const hasKey = target.has(key);
      const prevValue = hasKey ? target.get(key) : undefined;

      // Создаем копию Map для события change
      const prevState = new Map(target);

      // Устанавливаем новое значение
      target.set(key, value);

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('mapSet', key, value, prevValue);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, key, {
          method: 'mapSet',
          arguments: [key, value]
        });
      }

      return ass;
    };
  } else if (op === 'apply' && args.length >= 2) {
    const [key, value] = args;
    return mapSet(ass, 'get')(key, value);
  }
}

/**
 * Удаление значения по ключу из Map
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|boolean} - Функция mapDelete или результат операции (true, если ключ был удален)
 */
export function mapDelete(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.mapDelete = ass.temp.mapDelete || function(key) {
      const target = ass.this;

      // Проверяем, что target - Map
      if (!(target instanceof Map)) {
        throw new TypeError('mapDelete called on non-Map');
      }

      // Сохраняем предыдущее значение, если оно есть
      const hasKey = target.has(key);
      if (!hasKey) {
        return false;
      }

      const prevValue = target.get(key);

      // Создаем копию Map для события change
      const prevState = new Map(target);

      // Удаляем значение
      const result = target.delete(key);

      // Генерируем события
      if (result && ass.events && ass.events.emit) {
        ass.events.emit('mapDelete', key, prevValue);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, key, {
          method: 'mapDelete',
          arguments: [key]
        });
      }

      return result;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [key] = args;
    return mapDelete(ass, 'get')(key);
  }
}

/**
 * Очистка всех элементов Map
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция mapClear или экземпляр Association
 */
export function mapClear(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.mapClear = ass.temp.mapClear || function() {
      const target = ass.this;

      // Проверяем, что target - Map
      if (!(target instanceof Map)) {
        throw new TypeError('mapClear called on non-Map');
      }

      // Если Map пустой, ничего не делаем
      if (target.size === 0) {
        return ass;
      }

      // Создаем копию Map для события change
      const prevState = new Map(target);

      // Очищаем Map
      target.clear();

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('mapClear');

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, null, {
          method: 'mapClear',
          arguments: []
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    return mapClear(ass, 'get')();
  }
}

/**
 * Добавление значения в Set
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция setAdd или экземпляр Association
 */
export function setAdd(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.setAdd = ass.temp.setAdd || function(value) {
      const target = ass.this;

      // Проверяем, что target - Set
      if (!(target instanceof Set)) {
        throw new TypeError('setAdd called on non-Set');
      }

      // Проверяем, есть ли уже такое значение
      const hasValue = target.has(value);
      if (hasValue) {
        return ass;
      }

      // Создаем копию Set для события change
      const prevState = new Set(target);

      // Добавляем значение
      target.add(value);

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('setAdd', value);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, value, {
          method: 'setAdd',
          arguments: [value]
        });
      }

      return ass;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [value] = args;
    return setAdd(ass, 'get')(value);
  }
}

/**
 * Удаление значения из Set
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|boolean} - Функция setDelete или результат операции (true, если значение было удалено)
 */
export function setDelete(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.setDelete = ass.temp.setDelete || function(value) {
      const target = ass.this;

      // Проверяем, что target - Set
      if (!(target instanceof Set)) {
        throw new TypeError('setDelete called on non-Set');
      }

      // Проверяем, есть ли такое значение
      const hasValue = target.has(value);
      if (!hasValue) {
        return false;
      }

      // Создаем копию Set для события change
      const prevState = new Set(target);

      // Удаляем значение
      const result = target.delete(value);

      // Генерируем события
      if (result && ass.events && ass.events.emit) {
        ass.events.emit('setDelete', value);

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, value, {
          method: 'setDelete',
          arguments: [value]
        });
      }

      return result;
    };
  } else if (op === 'apply' && args.length >= 1) {
    const [value] = args;
    return setDelete(ass, 'get')(value);
  }
}

/**
 * Очистка всех элементов Set
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Function|Association} - Функция setClear или экземпляр Association
 */
export function setClear(ass, op, ...args) {
  if (op === 'get') {
    // Кешируем функцию в temp
    return ass.temp.setClear = ass.temp.setClear || function() {
      const target = ass.this;

      // Проверяем, что target - Set
      if (!(target instanceof Set)) {
        throw new TypeError('setClear called on non-Set');
      }

      // Если Set пустой, ничего не делаем
      if (target.size === 0) {
        return ass;
      }

      // Создаем копию Set для события change
      const prevState = new Set(target);

      // Очищаем Set
      target.clear();

      // Генерируем события
      if (ass.events && ass.events.emit) {
        ass.events.emit('setClear');

        // Генерируем общее событие change
        ass.events.emit('change', prevState, target, null, {
          method: 'setClear',
          arguments: []
        });
      }

      return ass;
    };
  } else if (op === 'apply') {
    return setClear(ass, 'get')();
  }
}
