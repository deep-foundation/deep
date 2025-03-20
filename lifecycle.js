import { Association } from './association.js';

/**
 * Хранилище всех живых ассоциаций в системе
 * @type {Association<Set>}
 */
export const all = new Association(new Set());

// Обработчик создания новой ассоциации
Association._proxy.set('onNew', (ass, op, args) => {
  if (op === 'get') {
    // Кешируем функцию в temp при первом обращении
    return ass.temp.onNew = ass.temp.onNew || ((...args) =>
      Association._proxy.get('onNew')(ass.proxy, 'apply', args)
    );
  } else if (op === 'apply') {
    // Получаем callback из аргументов (первый аргумент)
    const [callback] = args;

    // Если callback задан и это функция, вызываем ее с ass.this
    if (typeof callback === 'function') {
      // Добавляем ass.this в глобальный Set всех ассоциаций
      all.this.add(ass.this);

      // Вызываем callback с ass.this как аргументом
      return callback.call(ass, ass.this);
    }

    // Если callback не задан, просто добавляем ass.this в глобальный Set
    if (callback === undefined) {
      all.this.add(ass.this);
      return true;
    }

    return false;
  } else {
    throw new Error(`unexpected op=${op}`);
  }
});

// Обработчик удаления ассоциации
Association._proxy.set('onKill', (ass, op, args) => {
  if (op === 'get') {
    // Кешируем функцию в temp при первом обращении
    return ass.temp.onKill = ass.temp.onKill || ((...args) =>
      Association._proxy.get('onKill')(ass.proxy, 'apply', args)
    );
  } else if (op === 'apply') {
    // Получаем callback из аргументов (первый аргумент)
    const [callback] = args;

    // Если callback задан и это функция, вызываем ее с ass.this
    if (typeof callback === 'function') {
      // Удаляем ass.this из глобального Set всех ассоциаций
      all.this.delete(ass.this);

      // Вызываем callback с ass.this как аргументом
      return callback.call(ass, ass.this);
    }

    // Если callback не задан, просто удаляем ass.this из глобального Set
    if (callback === undefined) {
      all.this.delete(ass.this);
      return true;
    }

    return false;
  } else {
    throw new Error(`unexpected op=${op}`);
  }
});

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

  // Вызываем обработчик onKill
  return a.onKill();
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
  a.onKill();
  return a.onNew();
}
