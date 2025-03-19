/**
 * Тесты производительности для модуля проверки типов is.js
 */

import { bench, run, group } from 'mitata';
import { deep } from './index.js';

// Подготавливаем тестовые данные разных типов
const testString = 'test string';
const testNumber = 42;
const testBoolean = true;
const testSymbol = Symbol('test');
const testBigInt = BigInt(123);
const testFunction = function() {};
const testUndefined = undefined;
const testNull = null;
const testArray = [1, 2, 3];
const testObject = { a: 1, b: 2, c: 3 };
const testPlainObject = Object.create(null);
testPlainObject.a = 1;
const testDate = new Date();
const testRegExp = /test/;
const testSet = new Set([1, 2, 3]);
const testMap = new Map([['a', 1], ['b', 2]]);
const testWeakMap = new WeakMap();
const testWeakSet = new WeakSet();
const testPromise = Promise.resolve();
const testPromiseLike = { then: () => {} };
const testError = new Error('test error');
const testJSON = '{"a":1,"b":2}';
const testEmpty = '';

// Создаем deep-версии тестовых данных
const deepString = deep(testString);
const deepNumber = deep(testNumber);
const deepBoolean = deep(testBoolean);
const deepSymbol = deep(testSymbol);
const deepBigInt = deep(testBigInt);
const deepFunction = deep(testFunction);
const deepUndefined = deep(testUndefined);
const deepNull = deep(testNull);
const deepArray = deep(testArray);
const deepObject = deep(testObject);
const deepPlainObject = deep(testPlainObject);
const deepDate = deep(testDate);
const deepRegExp = deep(testRegExp);
const deepSet = deep(testSet);
const deepMap = deep(testMap);
const deepWeakMap = deep(testWeakMap);
const deepWeakSet = deep(testWeakSet);
const deepPromise = deep(testPromise);
const deepPromiseLike = deep(testPromiseLike);
const deepError = deep(testError);
const deepJSON = deep(testJSON);
const deepEmpty = deep(testEmpty);

// Добавим специальный флаг для вывода в JSON
const isJsonOutput = process.argv.includes('--json');

// Группа тестов для обычных вызовов через typeof и instanceof
group('Обычные проверки типов через встроенные методы JavaScript', () => {
  bench('typeof string === "string"', () => typeof testString === 'string');
  bench('typeof number === "number"', () => typeof testNumber === 'number');
  bench('typeof boolean === "boolean"', () => typeof testBoolean === 'boolean');
  bench('typeof symbol === "symbol"', () => typeof testSymbol === 'symbol');
  bench('typeof bigint === "bigint"', () => typeof testBigInt === 'bigint');
  bench('typeof function === "function"', () => typeof testFunction === 'function');
  bench('value === undefined', () => testUndefined === undefined);
  bench('value === null', () => testNull === null);
  bench('Array.isArray(array)', () => Array.isArray(testArray));
  bench('typeof object === "object"', () => typeof testObject === 'object' && testObject !== null);
  bench('value instanceof Date', () => testDate instanceof Date);
  bench('value instanceof RegExp', () => testRegExp instanceof RegExp);
  bench('value instanceof Set', () => testSet instanceof Set);
  bench('value instanceof Map', () => testMap instanceof Map);
  bench('value instanceof Promise', () => testPromise instanceof Promise);
  bench('value instanceof Error', () => testError instanceof Error);

  // Добавляем проверку "множественности" типов
  bench('Array.isArray(array) || value instanceof Set/Map || typeof object === "object"', () => {
    return Array.isArray(testArray) || testArray instanceof Set || testArray instanceof Map ||
           (typeof testArray === 'object' && testArray !== null &&
            !(testArray instanceof Date) && !(testArray instanceof RegExp));
  });
});

// Группа тестов для проверки типов через deep свойства
group('Проверка типов через deep свойства', () => {
  bench('deep(string).isString', () => deepString.isString);
  bench('deep(number).isNumber', () => deepNumber.isNumber);
  bench('deep(boolean).isBoolean', () => deepBoolean.isBoolean);
  bench('deep(symbol).isSymbol', () => deepSymbol.isSymbol);
  bench('deep(bigint).isBigInt', () => deepBigInt.isBigInt);
  bench('deep(function).isFunction', () => deepFunction.isFunction);
  bench('deep(undefined).isUndefined', () => deepUndefined.isUndefined);
  bench('deep(null).isNull', () => deepNull.isNull);
  bench('deep(array).isArray', () => deepArray.isArray);
  bench('deep(object).isObject', () => deepObject.isObject);
  bench('deep(plainObject).isPlainObject', () => deepPlainObject.isPlainObject);
  bench('deep(date).isDate', () => deepDate.isDate);
  bench('deep(regexp).isRegExp', () => deepRegExp.isRegExp);
  bench('deep(set).isSet', () => deepSet.isSet);
  bench('deep(map).isMap', () => deepMap.isMap);
  bench('deep(promise).isPromise', () => deepPromise.isPromise);
  bench('deep(error).isError', () => deepError.isError);
  bench('deep(json).isJSON', () => deepJSON.isJSON);
  bench('deep(empty).isEmpty', () => deepEmpty.isEmpty);

  // Добавляем тесты для isMany
  bench('deep(array).isMany', () => deepArray.isMany);
  bench('deep(object).isMany', () => deepObject.isMany);
  bench('deep(set).isMany', () => deepSet.isMany);
  bench('deep(map).isMany', () => deepMap.isMany);
  bench('deep(string).isMany', () => deepString.isMany);
  bench('deep(number).isMany', () => deepNumber.isMany);
});

// Группа тестов для проверки типов через deep функции (для сравнения)
group('Проверка типов через deep функции (устаревший вариант)', () => {
  bench('deep(string).isString()', () => deepString.isString());
  bench('deep(number).isNumber()', () => deepNumber.isNumber());
  bench('deep(boolean).isBoolean()', () => deepBoolean.isBoolean());
  bench('deep(array).isArray()', () => deepArray.isArray());
  bench('deep(object).isObject()', () => deepObject.isObject());
});

// Группа тестов для сравнения встроенных функций и deep свойств
group('Сравнение встроенных проверок и deep свойств', () => {
  bench('typeof string === "string"', () => typeof testString === 'string');
  bench('deep(string).isString', () => deepString.isString);

  bench('typeof number === "number"', () => typeof testNumber === 'number');
  bench('deep(number).isNumber', () => deepNumber.isNumber);

  bench('Array.isArray(array)', () => Array.isArray(testArray));
  bench('deep(array).isArray', () => deepArray.isArray);

  // Добавляем сравнение для isMany
  bench('Array.isArray(array) || value instanceof Set/Map || typeof object === "object"', () => {
    return Array.isArray(testArray) || testArray instanceof Set || testArray instanceof Map ||
           (typeof testArray === 'object' && testArray !== null &&
            !(testArray instanceof Date) && !(testArray instanceof RegExp));
  });
  bench('deep(array).isMany', () => deepArray.isMany);
});

// Запускаем бенчмарки
if (isJsonOutput) {
  const results = await run({ json: true });
  console.log(JSON.stringify(results, null, 2));
} else {
  await run();
}
