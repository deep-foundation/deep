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
 * Функция создания трекера для отслеживания связей между ассоциациями
 *
 * @param {Association} origin - Исходная ассоциация
 * @param {Association} result - Результирующая ассоциация
 * @returns {Association} - Трекер отношений
 */
export function createTracker(origin, result) {
  // Создаем новый трекер
  const track = new Association({
    origin,
    result,
    method: result.temp.method,
    transformer: result.temp.transformer,
    timestamp: Date.now()
  });

  // Если у origin есть метод подписки на события
  if (origin.on) {
    // Подписываемся на изменения в origin
    track.temp.changeHandler = () => {
      if (track.this.method === 'map' && track.this.transformer && result) {
        // Обновляем результат, применяя трансформер к измененному origin
        result.this = origin.this.map(track.this.transformer);
      }
    };

    origin.on('change', track.temp.changeHandler);

    // Отписываемся при уничтожении трекера или исходной ассоциации
    if (track.on) {
      track.on('kill', () => {
        if (origin.off && track.temp.changeHandler) {
          origin.off('change', track.temp.changeHandler);
        }
      });
    }

    if (origin.on) {
      origin.on('kill', () => {
        if (track.kill) {
          track.kill();
        }
      });
    }

    if (result && result.on) {
      result.on('kill', () => {
        if (track.kill) {
          track.kill();
        }
      });
    }
  }

  // Регистрируем трекер в result.temp
  if (result) {
    result.temp.track = track;
  }

  return track;
}

// Объект Track заполним позже, после инициализации deep
export let Track;

// Функция для инициализации Track с помощью deep
export function initTrack(deepInstance) {
  Track = new deepInstance(createTracker);
  return Track;
}

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
      if (Track) {
        ass.temp.track = ass.temp.track || Track(ass.temp.origin, ass);
        return ass.temp.track;
      } else {
        // Если Track еще не инициализирован, используем функцию напрямую
        ass.temp.track = ass.temp.track || createTracker(ass.temp.origin, ass);
        return ass.temp.track;
      }
    }

    // Если нет origin, возвращаем null
    return null;
  }
}

// Регистрируем геттеры в статическом _proxy ассоциации
Association._proxy.set('origin', origin);
Association._proxy.set('track', track);
