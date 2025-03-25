/**
 * Модуль механизма отслеживания связей между ассоциациями
 *
 * Предоставляет функциональность для автоматического отслеживания взаимосвязей
 * между ассоциациями, особенно при создании новых ассоциаций на основе существующих.
 */

import { Association } from './association.js';

/**
 * Геттер и сеттер для свойства origin
 *
 * @param {Association} ass - Экземпляр ассоциации
 * @param {string} op - Операция ('get', 'set')
 * @param {Array} args - Аргументы для операции set
 * @returns {Association|boolean} - Оригинальная ассоциация при get, успех операции при set
 */
export function origin(ass, op, args) {
  if (op === 'get') {
    // Возвращаем кешированное значение из temp
    return ass.temp.origin || null;
  } else if (op === 'set') {
    // Проверяем, что аргумент является ассоциацией
    if (args && args[0] instanceof Association) {
      // Сохраняем старое значение для события
      const oldOrigin = ass.temp.origin;

      // Обновляем значение
      ass.temp.origin = args[0];

      // Если есть система событий, генерируем событие изменения
      if (ass.emit) {
        ass.emit('origin', { prev: oldOrigin, current: args[0] });
      }

      return true;
    } else throw new Error('origin must be an Association');
  }
}

/**
 * Конструктор ассоциация для создания трекера
 * Не должен использоваться вручную, он автоматически создается используя ass.track;
 *
 * @param {Association} origin - Исходная ассоциация
 * @param {Association} result - Результирующая ассоциация
 * @returns {Association} - Трекер отношений
 */
export const Track = new Association((origin, result) => {
  const track = new Track();
  track.temp.origin = origin;
  track.temp.result = result;
  return track;
});

/**
 * Геттер для свойства track
 *
 * @param {Association} ass - Экземпляр ассоциации
 * @param {string} op - Операция ('get')
 * @returns {Association} - Экземпляр трекера
 */
export function track(ass, op) {
  if (op === 'get') {
    // Если трекер уже создан, возвращаем его
    if (ass.temp.track) {
      return ass.temp.track;
    }

    // Если есть origin, создаем трекер
    if (ass.temp.origin) {
      // Track будет инициализирован позже в index.js
      ass.temp.track = ass.temp.track || Track(ass.temp.origin, ass);
      return ass.temp.track;
    }

    // Если нет origin, возвращаем null
    return null;
  }
}

// Регистрируем геттеры в статическом _proxy ассоциации
Association._proxy.set('origin', origin);
Association._proxy.set('track', track);
