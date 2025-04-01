/**
 * Модуль механизма отслеживания связей между ассоциациями
 *
 * Предоставляет функциональность для автоматического отслеживания взаимосвязей
 * между ассоциациями, особенно при создании новых ассоциаций на основе существующих.
 */

import { Association } from './association.js';

/**
 * Геттер и сеттер для свойства origins
 *
 * @param {Association} ass - Экземпляр ассоциации
 * @param {string} op - Операция ('get', 'set')
 * @param {Array} args - Аргументы для операции set
 * @returns {Array|boolean} - Массив ассоциаций-истоков при get, успех операции при set
 */
export function origins(ass, op, args) {
  if (op === 'get') {
    // Возвращаем кешированное значение из temp или пустой массив
    return ass.temp.origins || [];
  } else if (op === 'set') {
    // Проверяем, что аргумент является массивом ассоциаций
    if (args && Array.isArray(args[0])) {
      // Проверяем, что все элементы массива - ассоциации
      if (args[0].some(item => !(item instanceof Association))) {
        throw new Error('all origins must be Associations');
      }

      // Сохраняем старое значение для события
      const oldOrigins = ass.temp.origins || [];

      // Обновляем значение
      ass.temp.origins = args[0];

      // Если есть система событий, генерируем событие изменения
      if (ass.emit) {
        ass.emit('origins', { prev: oldOrigins, current: args[0] });
      }

      return true;
    } else throw new Error('origins must be an array of Associations');
  }
}

/**
 * Конструктор ассоциация для создания трекера
 * Не должен использоваться вручную, он автоматически создается используя ass.track;
 *
 * @param {Array} originsArray - Массив исходных ассоциаций
 * @param {Association} result - Результирующая ассоциация
 * @returns {Association} - Трекер отношений
 */
export const Track = new Association((originsArray, result) => {
  const track = new Track();
  track.origins = originsArray;
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
  // Используем this как контекст, если ass не передан
  const context = ass || this;

  if (op === 'get') {
    // Если трекер уже создан, возвращаем его
    if (context.temp.track) {
      return context.temp.track;
    }

    // Если есть origins, создаем трекер
    if (context.origins.length > 0) {
      context.temp.track = context.temp.track || Track(context.origins, context);

      // Создаем массив для хранения функций отписки
      const offChanges = [];

      // Добавляем обработчики событий для всех истоков
      for (const origin of context.origins) {
        if (origin.on && origin.emit) {
          // Обработчик для событий изменения
          const offChange = origin.on('change', (event, meta) => {
            const result = context.temp.track.temp.result;
            const method = result.temp.method;
            const transformer = result.temp.transformer;

            // Если есть трансформер, применяем его
            if (transformer) {
              const newValue = transformer(origin.this);
              result.this = newValue;

              // Генерируем событие изменения
              if (result.emit) {
                result.emit('change', {
                  prev: event.prev,
                  next: newValue,
                  detail: event.detail
                }, meta);
              }
            }
          });

          // Добавляем функцию отписки в массив
          offChanges.push(offChange);
        }
      }

      // Создаем общую функцию отписки
      context.temp.track.temp.offChange = () => {
        for (const off of offChanges) {
          off();
        }
      };

      return context.temp.track;
    }

    // Если нет истоков, возвращаем null
    return null;
  }
}

// Регистрируем геттеры в статическом _proxy ассоциации
Association._proxy.set('origins', origins);
Association._proxy.set('track', track);
