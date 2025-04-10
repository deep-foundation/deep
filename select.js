/**
 * Модуль Select - реализует фильтрацию ассоциаций на основе объекта-выражения.
 */
import { Association } from './association.js';
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
 * которые указанным способом ссылаются на переданный аргумент.
 *
 * Например:
 * - type(T) ищет все ассоциации A, у которых A.type === T
 * - from(S) ищет все ассоциации R, у которых R.from === S
 * - to(T) ищет все ассоциации R, у которых R.to === T
 * - value(V) ищет все ассоциации A, у которых A.value === V
 *
 * А инвертированные отношения работают в обратную сторону:
 * - typed(A) ищет все типы T, для которых A.type === T
 * - out(R) ищет все источники S, для которых R.from === S
 * - in(R) ищет все назначения T, для которых R.to === T
 * - valued(A) ищет все значения V, для которых A.value === V
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

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Получаем ассоциации с данным типом через инвертированный релейшен 'typed'
    const inverseRel = _invertedRelations['type']; // 'typed'
    const typedResult = wrappedValue[inverseRel];

    // Если результат есть и имеет this, добавляем все элементы в наш результат
    if (typedResult && typedResult.this) {
      for (const item of typedResult.this) {
        result.this.add(item);
      }
    }

    return result;
  },

  /**
   * Обработчик для ключа typed - возвращает ассоциации, для которых указанное значение является типом
   * @param {Association|any} value - Значение ассоциации, для которой ищем связанные типы
   * @returns {Association} - Ассоциация содержащая множество ассоциаций типов
   */
  typed: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Получаем тип ассоциации через инвертированный релейшен 'type'
    const inverseRel = _invertedRelations['typed']; // 'type'
    const typeValue = wrappedValue[inverseRel];

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Если тип найден и это Association, добавляем его в результат
    if (typeValue !== undefined) {
      result.this.add(typeValue.this);
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

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Получаем ассоциации с данным from через инвертированный релейшен 'out'
    const inverseRel = _invertedRelations['from']; // 'out'
    const outResult = wrappedValue[inverseRel];

    // Если результат есть и имеет this, добавляем все элементы в наш результат
    if (outResult && outResult.this) {
      for (const item of outResult.this) {
        result.this.add(item);
      }
    }

    return result;
  },

  /**
   * Обработчик для ключа out - возвращает множество ассоциаций, у которых from равен указанному значению
   * @param {Association|any} value - Значение для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным from
   */
  out: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Получаем from через инвертированный релейшен 'from'
    const inverseRel = _invertedRelations['out']; // 'from'
    const fromValue = wrappedValue[inverseRel];

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Если from найден и это Association, добавляем его в результат
    if (fromValue !== undefined) {
      result.this.add(fromValue.this);
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

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Получаем ассоциации с данным to через инвертированный релейшен 'in'
    const inverseRel = _invertedRelations['to']; // 'in'
    const inResult = wrappedValue[inverseRel];

    // Если результат есть и имеет this, добавляем все элементы в наш результат
    if (inResult && inResult.this) {
      for (const item of inResult.this) {
        result.this.add(item);
      }
    }

    return result;
  },

  /**
   * Обработчик для ключа in - возвращает множество ассоциаций, у которых to равен указанному значению
   * @param {Association|any} value - Значение для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным to
   */
  in: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Получаем to через инвертированный релейшен 'to'
    const inverseRel = _invertedRelations['in']; // 'to'
    const toValue = wrappedValue[inverseRel];

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Если to найден и это Association, добавляем его в результат
    if (toValue !== undefined) {
      result.this.add(toValue.this);
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

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Получаем ассоциации с данным value через инвертированный релейшен 'valued'
    const inverseRel = _invertedRelations['value']; // 'valued'
    const valuedResult = wrappedValue[inverseRel];

    // Если результат есть и имеет this, добавляем все элементы в наш результат
    if (valuedResult && valuedResult.this) {
      for (const item of valuedResult.this) {
        result.this.add(item);
      }
    }

    return result;
  },

  /**
   * Обработчик для ключа valued - возвращает множество ассоциаций, у которых value равен указанному значению
   * @param {Association|any} value - Значение для поиска
   * @returns {Association} - Ассоциация содержащая множество ассоциаций с указанным value
   */
  valued: (value) => {
    // Распаковываем значение, если это Association
    const unwrappedValue = deep.unwrap(value);

    // Оборачиваем значение в ассоциацию
    const wrappedValue = deep.wrap(unwrappedValue);

    // Получаем value через инвертированный релейшен 'value'
    const inverseRel = _invertedRelations['valued']; // 'value'
    const valueResult = wrappedValue[inverseRel];

    // Создаем новую ассоциацию с пустым множеством
    const result = new Association(new Set());

    // Если value найдено и это Association, добавляем его в результат
    if (valueResult !== undefined) {
      result.this.add(valueResult.this);
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
    // Для пустого объекта выражения используем напрямую all.this
    const allAssociations = new Association(all.this);

    result.sets.push(allAssociations);
    result.setSets.push(all.this); // Используем all.this напрямую
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
 * @returns {Association} - Итоговое множество ассоциаций
 */
export function _and(parsedResults) {
  const sets = parsedResults.sets;

  // Проверка на пустой массив
  if (!sets || sets.length === 0) {
    return new Association(new Set());
  }

  // Проверка на единственное множество
  if (sets.length === 1) {
    return sets[0];
  }

  // Проверка на наличие пустых множеств
  for (let i = 0; i < sets.length; i++) {
    if (!sets[i] || !sets[i].this || sets[i].this.size === 0) {
      return new Association(new Set());
    }
  }

  try {
    // Формируем пересечение множеств вручную
    const base = sets[0].this;
    const result = new Set();

    // Добавляем в результат только те элементы, которые есть во всех множествах
    for (const item of base) {
      let existsInAll = true;

      // Проверяем наличие элемента во всех остальных множествах
      for (let i = 1; i < sets.length; i++) {
        if (!sets[i].this.has(item)) {
          existsInAll = false;
          break;
        }
      }

      // Если элемент есть во всех множествах, добавляем его в результат
      if (existsInAll) {
        result.add(item);
      }
    }

    return new Association(result);
  } catch (error) {
    // В случае ошибки возвращаем пустое множество
    return new Association(new Set());
  }
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

    // Если объект выражения пуст, возвращаем все ассоциации
    if (Object.keys(expAssociations).length === 0) {
      // Создаем ассоциацию напрямую с all.this, без создания нового Set
      const resultAssociation = new Association(all.this);
      resultAssociation.temp.method = 'select';
      resultAssociation.temp.expression = expAssociations;
      return resultAssociation;
    }

    // Парсим выражение и получаем ассоциации с множествами результатов
    const parsedResults = _parseExpAssociations(expAssociations);

    // Получаем итоговое множество (пересечение всех множеств)
    const resultAssociation = _and(parsedResults);

    // Сохраняем только метод для идентификации
    resultAssociation.temp.method = 'select';
    resultAssociation.temp.expression = expAssociations;

    return resultAssociation;
  }
}

// Регистрируем метод select в прокси Association
Association._proxy.set('select', select);

