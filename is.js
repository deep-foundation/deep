/**
 * Модуль для проверки типов данных
 *
 * Содержит набор методов для проверки типов, оптимизированных для использования
 * с классом Association.
 */

/**
 * Проверяет, является ли значение символом
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является символом
 */
function isSymbol(ass) {
  return typeof ass.this === 'symbol';
}

/**
 * Проверяет, является ли значение строкой
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является строкой
 */
function isString(ass) {
  return typeof ass.this === 'string';
}

/**
 * Проверяет, является ли значение числом
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является числом
 */
function isNumber(ass) {
  return typeof ass.this === 'number';
}

/**
 * Проверяет, является ли значение булевым
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является булевым
 */
function isBoolean(ass) {
  return typeof ass.this === 'boolean';
}

/**
 * Проверяет, является ли значение BigInt
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является BigInt
 */
function isBigInt(ass) {
  return typeof ass.this === 'bigint';
}

/**
 * Проверяет, является ли значение функцией
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является функцией
 */
function isFunction(ass) {
  return typeof ass.this === 'function';
}

/**
 * Проверяет, является ли значение undefined
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является undefined
 */
function isUndefined(ass) {
  return ass.this === undefined;
}

/**
 * Проверяет, является ли значение null
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является null
 */
function isNull(ass) {
  return ass.this === null;
}

/**
 * Проверяет, является ли значение массивом
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является массивом
 */
function isArray(ass) {
  return Array.isArray(ass.this);
}

/**
 * Проверяет, является ли значение объектом (не null)
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является объектом и не null
 */
function isObject(ass) {
  return typeof ass.this === 'object' && ass.this !== null;
}

/**
 * Проверяет, является ли значение простым объектом
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является простым объектом
 */
function isPlainObject(ass) {
  const value = ass.this;
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Проверяет, является ли значение Date
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является Date
 */
function isDate(ass) {
  return ass.this instanceof Date;
}

/**
 * Проверяет, является ли значение RegExp
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является RegExp
 */
function isRegExp(ass) {
  return ass.this instanceof RegExp;
}

/**
 * Проверяет, является ли значение Set
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является Set
 */
function isSet(ass) {
  return ass.this instanceof Set;
}

/**
 * Проверяет, является ли значение Map
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является Map
 */
function isMap(ass) {
  return ass.this instanceof Map;
}

/**
 * Проверяет, является ли значение WeakMap
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является WeakMap
 */
function isWeakMap(ass) {
  return ass.this instanceof WeakMap;
}

/**
 * Проверяет, является ли значение WeakSet
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является WeakSet
 */
function isWeakSet(ass) {
  return ass.this instanceof WeakSet;
}

/**
 * Проверяет, является ли значение Promise
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является Promise
 */
function isPromise(ass) {
  return ass.this?.[Symbol.toStringTag] === 'Promise';
}

/**
 * Проверяет, является ли значение похожим на Promise
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение похоже на Promise
 */
function isPromiseLike(ass) {
  return ass.this && typeof ass.this.then === 'function';
}

/**
 * Проверяет, является ли значение примитивным типом
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является примитивным типом
 */
function isPrimitive(ass) {
  const value = ass.this;
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

/**
 * Проверяет, является ли значение итерируемым объектом
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является итерируемым объектом
 */
function isIterable(ass) {
  const value = ass.this;
  return value !== null && value !== undefined && typeof value[Symbol.iterator] === 'function';
}

/**
 * Проверяет, является ли функция конструктором без создания экземпляра
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если функция является конструктором
 */
function isConstructor(ass) {
  const value = ass.this;

  if (typeof value !== 'function') return false;

  // Проверка по имени (все встроенные конструкторы имеют имя с большой буквы)
  const name = value.name;
  if (name && name[0] === name[0].toUpperCase() && name[0] !== '_') {
    return true;
  }

  // Проверка прототипа
  const prototype = value.prototype;
  if (!prototype) return false;

  // Конструкторы обычно имеют prototype с конструктором, указывающим на себя
  if (prototype.constructor !== value) return false;

  // Проверка наличия методов в прототипе
  const descriptors = Object.getOwnPropertyDescriptors(prototype);
  // Удаляем "constructor" из рассмотрения
  delete descriptors.constructor;

  // Если в прототипе есть еще методы или свойства помимо constructor, вероятно это конструктор
  return Object.keys(descriptors).length > 0 || Object.getPrototypeOf(prototype) !== Object.prototype;
}

/**
 * Проверяет, является ли значение Error или унаследованным от Error
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является Error
 */
function isError(ass) {
  return ass.this instanceof Error;
}

/**
 * Проверяет, является ли значение корректным JSON
 * Использует быструю предварительную проверку перед полным парсингом
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является корректным JSON
 */
function isJSON(ass) {
  const value = ass.this;

  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Проверяет, является ли значение пустым
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение считается пустым
 */
function isEmpty(ass) {
  const value = ass.this;
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    if (value instanceof Set || value instanceof Map) return value.size === 0;
    return Object.keys(value).length === 0;
  }
  return false;
}

/**
 * Проверяет, является ли значение множественным (Set, Map, Array, Object)
 * @param {Association} ass - Экземпляр Association
 * @returns {boolean} - true, если значение является множественным типом
 */
function isMany(ass) {
  const value = ass.this;
  if (value === null || value === undefined) return false;

  // Проверяем очевидные множественные типы
  if (Array.isArray(value)) return true;
  if (value instanceof Set) return true;
  if (value instanceof Map) return true;

  // Объект тоже считаем множественным типом
  if (typeof value === 'object' && !isPrimitive(ass) &&
      !(value instanceof Date) && !(value instanceof RegExp)) {
    return true;
  }

  return false;
}

/**
 * Словарь типов: имя типа -> функция проверки
 * Используется для регистрации методов проверки типов в Association
 * @type {Map<string, Function>}
 */
const types = new Map([
  ['symbol', isSymbol],
  ['string', isString],
  ['number', isNumber],
  ['boolean', isBoolean],
  ['bigint', isBigInt],
  ['function', isFunction],
  ['undefined', isUndefined],
  ['null', isNull],
  ['array', isArray],
  ['object', isObject],
  ['plainObject', isPlainObject],
  ['date', isDate],
  ['regexp', isRegExp],
  ['set', isSet],
  ['map', isMap],
  ['weakMap', isWeakMap],
  ['weakSet', isWeakSet],
  ['promise', isPromise],
  ['promiseLike', isPromiseLike],
  ['primitive', isPrimitive],
  ['iterable', isIterable],
  ['constructor', isConstructor],
  ['error', isError],
  ['json', isJSON],
  ['empty', isEmpty],
  ['many', isMany]
]);

/**
 * Обратный словарь: функция проверки -> имя типа
 * Используется для определения типа по функции проверки
 * @type {Map<Function, string>}
 */
const checks = new Map([...types.entries()].map(([name, fn]) => [fn, name]));

/**
 * Последовательность проверки типов при определении типа значения.
 * Содержит только "чистые" типы данных JavaScript, а не характеристики типов.
 * Порядок важен: например, array проверяется до object, так как массивы
 * тоже являются объектами.
 * @type {Array<string>}
 */
const order = [
  'undefined',
  'null',
  'boolean',
  'number',
  'bigint',
  'string',
  'symbol',
  'function',
  'array',
  'set',
  'weakSet',
  'map',
  'weakMap',
  'date',
  'regexp',
  'promise',
  'error',
  'object'
];

// Экспортируем только структуры данных
export {
  types,
  checks,
  order,
};

// Экспортируем все методы проверок.
const all = {
  isSymbol,
  isString,
  isNumber,
  isBoolean,
  isBigInt,
  isFunction,
  isUndefined,
  isNull,
  isArray,
  isObject,
  isPlainObject,
  isDate,
  isRegExp,
  isSet,
  isMap,
  isWeakMap,
  isWeakSet,
  isPromise,
  isPromiseLike,
  isPrimitive,
  isIterable,
  isConstructor,
  isError,
  isJSON,
  isEmpty,
  isMany,
};

// Инициализация методов проверки типов для Association
import { Association } from './association.js';

// Добавляем методы проверки типов в Association._proxy
for (const name in all) {
  Association._proxy.set(
    name, all[name],
  );
}

// Переопределяем основные экспорты для обратной совместимости
// Оригинальные функции остаются доступными для Association
export {
  isSymbol,
  isString,
  isNumber,
  isBoolean,
  isBigInt,
  isFunction,
  isUndefined,
  isNull,
  isArray,
  isObject,
  isPlainObject,
  isDate,
  isRegExp,
  isSet,
  isMap,
  isWeakMap,
  isWeakSet,
  isPromise,
  isPromiseLike,
  isPrimitive,
  isIterable,
  isConstructor,
  isError,
  isJSON,
  isEmpty,
  isMany,
};

/**
 * Модуль для определения типов данных
 */

/**
 * Геттер из любой ассоциации, определяет тип данных, возвращает строку
 * @param {any} ass - Ассоциация для проверки
 * @returns {string} - Тип данных
 * @example
 * const ass = deep('hello');
 * console.log(ass.detect); // 'string'
 */
export function detect(ass) {
  const value = ass.this;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Set) return 'set';
  if (value instanceof Map) return 'map';
  if (value instanceof WeakMap) return 'weakmap';
  if (value instanceof WeakSet) return 'weakset';
  if (value instanceof Date) return 'date';
  if (typeof value === 'object') return 'object';
  return typeof value;
}

Association._proxy.set(
  'detect', detect,
);

// Методы проверки типов
export const is = {
  array: (value) => Array.isArray(value),
  set: (value) => value instanceof Set,
  map: (value) => value instanceof Map,
  weakmap: (value) => value instanceof WeakMap,
  weakset: (value) => value instanceof WeakSet,
  object: (value) => value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Set) && !(value instanceof Map) && !(value instanceof WeakMap) && !(value instanceof WeakSet),
  primitive: (value) => value === null || value === undefined || typeof value !== 'object',
};
