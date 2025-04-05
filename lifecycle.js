import { Association } from './association.js';

/**
 * Хранилище всех живых ассоциаций в системе
 * @type {Association<Set>}
 */
export const all = new Association(new Set());

// Обработчик создания новой ассоциации
Association._proxy.set('_onNew', (ass, op, args) => {
  if (op === 'get') {
    // Кешируем функцию в temp при первом обращении
    return ass.temp._onNew = ass.temp._onNew || ((...args) =>
      Association._proxy.get('_onNew')(ass.proxy, 'apply', args)
    );
  } else if (op === 'apply') {
    // Получаем callback из аргументов (первый аргумент)
    const [callback] = args;

    // Если callback задан и это функция, вызываем ее с ass.this
    if (typeof callback === 'function') {
      // Добавляем ass.this в глобальный Set всех ассоциаций
      all.add(ass.this);

      // Вызываем callback с ass.this как аргументом
      return callback.call(ass, ass.this);
    }

    // Если callback не задан, просто добавляем ass.this в глобальный Set
    if (callback === undefined) {
      all.add(ass.this);
      return true;
    }

    return false;
  } else {
    throw new Error(`unexpected op=${op}`);
  }
});

// Обработчик удаления ассоциации
Association._proxy.set('_onKill', (ass, op, args) => {
  if (op === 'get') {
    // Кешируем функцию в temp при первом обращении
    return ass.temp._onKill = ass.temp._onKill || ((...args) =>
      Association._proxy.get('_onKill')(ass.proxy, 'apply', args)
    );
  } else if (op === 'apply') {
    // Получаем callback из аргументов (первый аргумент)
    const [callback] = args;

    // Если callback задан и это функция, вызываем ее с ass.this
    if (typeof callback === 'function') {
      // Удаляем ass.this из глобального Set всех ассоциаций
      all.delete(ass.this);

      // Вызываем callback с ass.this как аргументом
      return callback.call(ass, ass.this);
    }

    // Если callback не задан, просто удаляем ass.this из глобального Set
    if (callback === undefined) {
      all.delete(ass.this);
      return true;
    }

    return false;
  } else {
    throw new Error(`unexpected op=${op}`);
  }
});

/**
 * Проверка, является ли ассоциация "живой" (есть в all)
 * @param {Association} ass - Экземпляр Association для проверки
 * @returns {boolean} - true, если ассоциация жива
 */
function isAlive(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    return ass.temp.isAlive = ass.temp.isAlive || (() =>
      Association._proxy.get('isAlive')(ass, 'apply')
    );
  } else if (op === 'apply') {
    return all.this.has(ass.this);
  } else {
    throw new Error(`unexpected op=${op}`);
  }
}

// Регистрируем метод isAlive
Association._proxy.set('isAlive', isAlive);

/**
 * Метод для удаления ассоциации
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {boolean} - Успешность операции
 */
function killMethod(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    return ass.temp.kill = ass.temp.kill || (() =>
      Association._proxy.get('kill')(ass, 'apply')
    );
  } else if (op === 'apply') {
    // Если есть экземпляр Events, генерируем событие kill и очищаем память
    if (ass.temp && ass.temp._events) {
      // Генерируем событие kill
      ass.temp._events.emit('kill', ass);

      // Удаляем все слушатели событий
      ass.temp._events.removeAllListeners();

      // Удаляем экземпляр Events
      delete ass.temp._events;
    }

    // Вызываем обработчик _onKill
    return ass._onKill();
  } else {
    throw new Error(`unexpected op=${op}`);
  }
}

// Регистрируем метод kill
Association._proxy.set('kill', killMethod);

/**
 * Удаляет ассоциацию из системы
 * @param {Association} a - ассоциация для удаления
 * @returns {boolean} - успешность операции
 */
export function kill(a) {
  if (!(a instanceof Association)) {
    return false;
  }

  // Если есть экземпляр Events, генерируем событие kill и очищаем память
  if (a.temp && a.temp._events) {
    // Генерируем событие kill
    a.temp._events.emit('kill', a);

    // Удаляем все слушатели событий
    a.temp._events.removeAllListeners();

    // Удаляем экземпляр Events
    delete a.temp._events;
  }

  // Вызываем обработчик _onKill
  return a._onKill();
}

/**
 * Перезагружает ассоциацию (удаляет и создает заново)
 * @param {Association} a - ассоциация для перезагрузки
 * @returns {boolean} - успешность операции
 */
export function reload(a) {
  if (!(a instanceof Association)) {
    return false;
  }

  // Удаляем и добавляем заново
  a._onKill();
  return a._onNew();
}
