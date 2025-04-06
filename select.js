/**
 * Модуль Select - реализует фильтрацию ассоциаций на основе объекта-выражения.
 */
import { Association } from './association.js';
import { types, froms, tos, values } from './relations.js';
import { all } from './lifecycle.js';
import { deep } from './index.js';

/**
 * Карта инвертированных отношений для преобразования ключей
 * Каждый ключ в _invertedRelations содержит соответствующий ему "обратный" ключ:
 * - type/typed: type ищет экземпляры типа, typed ищет тип экземпляра
 * - from/out: from ищет ассоциации с указанным источником, out ищет ассоциации от источника
 * - to/in: to ищет ассоциации с указанным назначением, in ищет ассоциации к назначению
 * - value/valued: value ищет ассоциации с указанным значением, valued ищет значения ассоциации
 * @type {Object}
 */
export const _invertedRelations = {
  type: 'typed',
  typed: 'type',
  from: 'out',
  out: 'from',
  to: 'in',
  in: 'to',
  value: 'valued',
  valued: 'value'
};

/**
 * Объект с обработчиками для разных ключей выражения.
 * Каждый обработчик принимает значение и возвращает множество ассоциаций,
 * удовлетворяющих условию.
 */
export const _expAssociationsVariants = {
  /**
   * Обработчик для ключа type - возвращает ассоциации, имеющие указанный тип.
   * @param {Association|any} value - Тип ассоциаций для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций указанного типа
   */
  type: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Получаем множество ассоциаций, имеющих указанный тип
    const typedSet = types.many(unwrappedValue);
    // Возвращаем саму ассоциацию, а не её .this
    return typedSet;
  },

  /**
   * Обработчик для ключа typed - возвращает ассоциации, для которых указанное значение является типом
   * @param {Association|any} value - Значение ассоциации, для которой ищем связанные типы
   * @returns {Association} - Ассоциация содержащая множество ассоциаций типов
   */
  typed: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Получаем тип ассоциации
    const typeValue = types.one(unwrappedValue);

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Если тип найден, добавляем его в множество и устанавливаем value
    if (typeValue !== undefined) {
      result.this.add(typeValue);
      result.value = typeValue;
    }

    return result;
  },

  /**
   * Обработчик для ключа from - возвращает ассоциации, у которых from равен указанному значению
   * @param {Association|any} value - Значение from для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным from
   */
  from: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Получаем множество ассоциаций, имеющих указанный from
    const outSet = froms.many(unwrappedValue);
    // Возвращаем саму ассоциацию, а не её .this
    return outSet;
  },

  /**
   * Обработчик для ключа out - возвращает множество ассоциаций, у которых from равен указанному значению
   * @param {Association|any} value - Значение для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным from
   */
  out: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Поиск всех ассоциаций, у которых from равен переданному значению
    const result = new Association(new Set());

    for (const ass of all.this) {
      const fromValue = froms.one(ass);
      if (fromValue === unwrappedValue) {
        result.this.add(ass);
      }
    }

    return result;
  },

  /**
   * Обработчик для ключа to - возвращает ассоциации, у которых to равен указанному значению
   * @param {Association|any} value - Значение to для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным to
   */
  to: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Получаем множество ассоциаций, имеющих указанный to
    const inSet = tos.many(unwrappedValue);
    // Возвращаем саму ассоциацию, а не её .this
    return inSet;
  },

  /**
   * Обработчик для ключа in - возвращает множество ассоциаций, у которых to равен указанному значению
   * @param {Association|any} value - Значение для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным to
   */
  in: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Поиск всех ассоциаций, у которых to равен переданному значению
    const result = new Association(new Set());

    for (const ass of all.this) {
      const toValue = tos.one(ass);
      if (toValue === unwrappedValue) {
        result.this.add(ass);
      }
    }

    return result;
  },

  /**
   * Обработчик для ключа value - возвращает ассоциации, у которых value равен указанному значению
   * @param {Association|any} value - Значение value для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным value
   */
  value: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Получаем множество ассоциаций, имеющих указанное значение
    const valuedSet = values.many(unwrappedValue);
    // Возвращаем саму ассоциацию, а не её .this
    return valuedSet;
  },

  /**
   * Обработчик для ключа valued - возвращает множество ассоциаций, у которых value равен указанному значению
   * @param {Association|any} value - Значение для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным value
   */
  valued: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Поиск значения ассоциации
    const valueResult = values.one(unwrappedValue);

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Если значение найдено, добавляем его в множество и устанавливаем value
    if (valueResult !== undefined) {
      result.this.add(valueResult);
      result.value = valueResult;
    }

    return result;
  },

  /**
   * Обработчик для ключа this - возвращает ассоциации с указанным значением this.
   * @param {*} value - Значение this для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным значением this
   */
  this: (value) => {
    // Если значение - это Association, выдаем ошибку для совместимости с предыдущей версией
    if (value instanceof Association) {
      throw new Error('Значение ключа this не должно быть экземпляром Association');
    }

    // Фильтруем все ассоциации, оставляя только те, у которых this === value
    const result = new Association(new Set());

    for (const ass of all.this) {
      if (ass === value) {
        result.this.add(ass);
      }
    }

    return result;
  }
};

/**
 * Функция для парсинга объекта-выражения и получения множеств ассоциаций.
 * @param {Object} expAssociations - Объект-выражение для поиска ассоциаций
 * @returns {Object} - Объект с ассоциациями и информацией о релейшенах
 */
export function _parseExpAssociations(expAssociations) {
  // Создаем результат
  const result = {
    sets: [], // Ассоциации для intersection
    setSets: [], // Множества из .this ассоциаций для совместимости
    _relatedResults: {} // Сохраняем результаты для релейшенов
  };

  // Проверяем, является ли объект выражения пустым
  if (Object.keys(expAssociations).length === 0) {
    // Для пустого объекта выражения создаем ассоциацию, содержащую all.this
    const allAssociations = new Association(new Set(all.this));

    result.sets.push(allAssociations);
    result.setSets.push(allAssociations.this);
    result._relatedResults.all = allAssociations;
    return result;
  }

  // Перебираем все ключи выражения
  for (const key in expAssociations) {
    // Проверяем наличие обработчика для ключа
    if (key in _expAssociationsVariants) {
      // Получаем ассоциацию с множеством результатов для ключа
      const value = expAssociations[key];
      const assocSet = _expAssociationsVariants[key](value);

      // Добавляем ассоциацию в список для пересечения
      result.sets.push(assocSet);

      // Добавляем множество .this из ассоциации для совместимости
      result.setSets.push(assocSet.this);

      // Сохраняем ассоциацию в результате для трекинга
      result._relatedResults[key] = assocSet;
    } else {
      throw new Error(`Неизвестный ключ в выражении: ${key}`);
    }
  }

  return result;
}

/**
 * Функция для получения пересечения множеств ассоциаций.
 * @param {Object} parsedResults - Результат парсинга объекта-выражения
 * @returns {Set} - Итоговое множество ассоциаций
 */
export function _and(parsedResults) {
  const { sets, setSets } = parsedResults;

  // Если нет ассоциаций, возвращаем пустое множество
  if (sets.length === 0) {
    return new Set();
  }

  // Начинаем с первого множества
  // Используем setSets для совместимости
  let result = new Set(setSets[0]);

  // Выполняем пересечение со всеми остальными множествами
  for (let i = 1; i < setSets.length; i++) {
    const currentSet = setSets[i];
    const intersection = new Set();

    // Находим общие элементы
    for (const item of result) {
      if (currentSet.has(item)) {
        intersection.add(item);
      }
    }

    // Обновляем результат
    result = intersection;
  }

  return result;
}

/**
 * Ассоциативный прокси-метод для фильтрации ассоциаций.
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get' или 'apply')
 * @param {Array} args - Аргументы операции
 * @returns {Association} - Ассоциация с результатом фильтрации
 */
export function select(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию для вызова select
    return ass.temp.select = ass.temp.select || ((expAssociations) =>
      Association._proxy.get('select')(ass, 'apply', [expAssociations])
    );
  }

  if (op === 'apply') {
    // Получаем объект-выражение из аргументов
    const [expAssociations] = args;

    // Проверяем, что аргумент является объектом
    if (!expAssociations || typeof expAssociations !== 'object') {
      throw new Error('Аргумент select должен быть объектом');
    }

    // Парсим выражение и получаем ассоциации с множествами результатов
    const parsedResults = _parseExpAssociations(expAssociations);

    // Получаем итоговое множество (пересечение всех множеств)
    const resultSet = _and(parsedResults);

    // Создаем ассоциацию с результатом
    const resultAssociation = new Association(resultSet);

    // Сохраняем информацию для трекинга
    resultAssociation.temp.method = 'select';
    resultAssociation.temp.expression = expAssociations;

    // Создаем функцию-трансформер для пересчета результата
    resultAssociation.temp.transformer = () => {
      // Выполняем новый запрос select с тем же выражением
      const params = resultAssociation.temp.expression;
      const parsedResults = _parseExpAssociations(params);
      return _and(parsedResults);
    };

    // Сохраняем истоки (источники) для трекинга
    // Для отслеживания нам необходимо следить за:
    // 1. Ассоциациями, полученными из _expAssociationsVariants для трекинга изменений
    // 2. Ассоциациями, которые выступают значениями в ключах выражения (type, from, то и т.д.)
    // 3. Глобальной ассоциацией all для отслеживания создания и удаления ассоциаций
    resultAssociation.origins = [];

    // Добавляем ассоциации из результатов поиска в истоки для отслеживания их изменений
    for (const assocSet of parsedResults.sets) {
      resultAssociation.origins.push(assocSet);
    }

    // Добавляем ассоциации из выражения в истоки
    for (const [key, expValue] of Object.entries(expAssociations)) {
      // Добавляем только ассоциации
      if (expValue instanceof Association) {
        resultAssociation.origins.push(expValue);
      }
    }

    // Добавляем также все ассоциации из результатов для отслеживания их изменений
    for (const resultItem of resultSet) {
      if (resultItem instanceof Association) {
        resultAssociation.origins.push(resultItem);
      }
    }

    // Добавляем all для отслеживания глобальных изменений (создание/удаление)
    resultAssociation.origins.push(all);

    // Настраиваем локальный track
    resultAssociation._proxy.set('track', (resultAss, op) => {
      if (op !== 'get') return;

      // Проверяем, есть ли уже созданный трекер
      if (resultAss.temp.track) {
        return resultAss.temp.track;
      }

      // Создаем трекер
      resultAss.temp.track = new Association();
      const track = resultAss.temp.track;
      track.temp.isActive = true;

      // Храним функции отписки от событий
      const offChanges = [];

      // Обработчик для обновления результата при изменениях в источниках
      const updateHandler = (origin, event, meta) => {
        // Проверяем активен ли трекер
        if (!track.temp.isActive) return;

        // Выполняем пересчет результата
        const prevResult = resultAss.this;
        const newResultSet = resultAss.temp.transformer();

        // Обновляем результат и генерируем событие только если изменился
        // Это позволяет избежать зацикливания и ложных срабатываний
        const prevSize = prevResult.size;
        const newSize = newResultSet.size;
        let changed = prevSize !== newSize;

        if (!changed && newSize > 0) {
          // Проверяем поэлементно, если размеры совпадают
          const prevArray = Array.from(prevResult);
          const newArray = Array.from(newResultSet);

          for (let i = 0; i < prevSize; i++) {
            if (prevArray[i] !== newArray[i]) {
              changed = true;
              break;
            }
          }
        }

        // Если результат изменился, обновляем его и генерируем событие
        if (changed) {
          // Обновляем результат
          resultAss.this = newResultSet;

          // Генерируем событие изменения
          if (resultAss.emit) {
            resultAss.emit('change', {
              reason: 'select-update',
              origin: origin,
              detail: event?.detail || { operation: 'unknown' }
            }, meta);
          }
        }
      };

      // Подписываемся на события для всех истоков
      for (const origin of resultAss.origins) {
        if (origin && origin.on && origin.emit) {
          // Подписываемся на событие change
          const offChange = origin.on('change', (event, meta) => {
            updateHandler(origin, event, meta);
          });
          offChanges.push(offChange);
        }
      }

      // Добавляем метод kill для отписки от всех событий
      track._proxy.set('kill', (trackAss, op) => {
        if (op === 'get') {
          return function() {
            // Деактивируем трекер
            track.temp.isActive = false;

            // Отписываемся от всех событий
            for (const offChange of offChanges) {
              if (typeof offChange === 'function') {
                offChange();
              }
            }

            return true;
          };
        }
      });

      // Сохраняем функции отписки
      track.temp.offChanges = offChanges;

      // Выполняем первичное обновление результата
      setTimeout(() => {
        if (track.temp.isActive) {
          updateHandler(null, { detail: { operation: 'track-init' } });
        }
      }, 0);

      return track;
    });

    return resultAssociation;
  }
}

// Регистрируем метод select в прокси Association
Association._proxy.set('select', select);
