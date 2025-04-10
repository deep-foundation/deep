/**
 * Тесты производительности для модуля проверки типов is.js
 */

import Benchmarkify from 'benchmarkify';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { deep } from './index.js';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Is.js Benchmarks', {
  description: 'Тесты производительности для функций определения типа данных'
});
benchmark.printHeader();

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

// Добавляем тестовые объекты для сравнения ссылок
const obj1 = { a: 1 };
const obj2 = { a: 1 };
const obj3 = obj1;
const deepObj1 = deep(obj1);
const deepObj2 = deep(obj2);
const deepObj3 = deep(obj3);

// Группа тестов для обычных вызовов через typeof и instanceof
const nativeSuite = benchmark.createSuite('Обычные проверки типов');

nativeSuite.add('typeof string === "string"', () => typeof testString === 'string');
nativeSuite.add('typeof number === "number"', () => typeof testNumber === 'number');
nativeSuite.add('typeof boolean === "boolean"', () => typeof testBoolean === 'boolean');
nativeSuite.add('typeof symbol === "symbol"', () => typeof testSymbol === 'symbol');
nativeSuite.add('typeof bigint === "bigint"', () => typeof testBigInt === 'bigint');
nativeSuite.add('typeof function === "function"', () => typeof testFunction === 'function');
nativeSuite.add('value === undefined', () => testUndefined === undefined);
nativeSuite.add('value === null', () => testNull === null);
nativeSuite.add('Array.isArray(array)', () => Array.isArray(testArray));
nativeSuite.add('typeof object === "object"', () => typeof testObject === 'object' && testObject !== null);
nativeSuite.add('value instanceof Date', () => testDate instanceof Date);
nativeSuite.add('value instanceof RegExp', () => testRegExp instanceof RegExp);
nativeSuite.add('value instanceof Set', () => testSet instanceof Set);
nativeSuite.add('value instanceof Map', () => testMap instanceof Map);
nativeSuite.add('value instanceof Promise', () => testPromise instanceof Promise);
nativeSuite.add('value instanceof Error', () => testError instanceof Error);

// Добавляем проверку "множественности" типов
nativeSuite.add('Array.isArray(array) || value instanceof Set/Map || typeof object === "object"', () => {
  return Array.isArray(testArray) || testArray instanceof Set || testArray instanceof Map ||
         (typeof testArray === 'object' && testArray !== null &&
          !(testArray instanceof Date) && !(testArray instanceof RegExp));
});

// Группа тестов для проверки типов через deep свойства
const deepPropsSuite = benchmark.createSuite('Проверка типов через deep свойства');

deepPropsSuite.add('deep(string).isString', () => deepString.isString);
deepPropsSuite.add('deep(number).isNumber', () => deepNumber.isNumber);
deepPropsSuite.add('deep(boolean).isBoolean', () => deepBoolean.isBoolean);
deepPropsSuite.add('deep(symbol).isSymbol', () => deepSymbol.isSymbol);
deepPropsSuite.add('deep(bigint).isBigInt', () => deepBigInt.isBigInt);
deepPropsSuite.add('deep(function).isFunction', () => deepFunction.isFunction);
deepPropsSuite.add('deep(undefined).isUndefined', () => deepUndefined.isUndefined);
deepPropsSuite.add('deep(null).isNull', () => deepNull.isNull);
deepPropsSuite.add('deep(array).isArray', () => deepArray.isArray);
deepPropsSuite.add('deep(object).isObject', () => deepObject.isObject);
deepPropsSuite.add('deep(plainObject).isPlainObject', () => deepPlainObject.isPlainObject);
deepPropsSuite.add('deep(date).isDate', () => deepDate.isDate);
deepPropsSuite.add('deep(regexp).isRegExp', () => deepRegExp.isRegExp);
deepPropsSuite.add('deep(set).isSet', () => deepSet.isSet);
deepPropsSuite.add('deep(map).isMap', () => deepMap.isMap);
deepPropsSuite.add('deep(promise).isPromise', () => deepPromise.isPromise);
deepPropsSuite.add('deep(error).isError', () => deepError.isError);
deepPropsSuite.add('deep(json).isJSON', () => deepJSON.isJSON);
deepPropsSuite.add('deep(empty).isEmpty', () => deepEmpty.isEmpty);

// Добавляем тесты для isMany
deepPropsSuite.add('deep(array).isMany', () => deepArray.isMany);
deepPropsSuite.add('deep(object).isMany', () => deepObject.isMany);
deepPropsSuite.add('deep(set).isMany', () => deepSet.isMany);
deepPropsSuite.add('deep(map).isMany', () => deepMap.isMany);
deepPropsSuite.add('deep(string).isMany', () => deepString.isMany);
deepPropsSuite.add('deep(number).isMany', () => deepNumber.isMany);

// Группа тестов для сравнения встроенных функций и deep свойств
const compareSuite = benchmark.createSuite('Сравнение встроенных проверок и deep свойств');

compareSuite.add('typeof string === "string"', () => typeof testString === 'string');
compareSuite.add('deep(string).isString', () => deepString.isString);

compareSuite.add('typeof number === "number"', () => typeof testNumber === 'number');
compareSuite.add('deep(number).isNumber', () => deepNumber.isNumber);

compareSuite.add('Array.isArray(array)', () => Array.isArray(testArray));
compareSuite.add('deep(array).isArray', () => deepArray.isArray);

// Добавляем сравнение для isMany
compareSuite.add('Array.isArray(array) || value instanceof Set/Map || typeof object === "object"', () => {
  return Array.isArray(testArray) || testArray instanceof Set || testArray instanceof Map ||
         (typeof testArray === 'object' && testArray !== null &&
          !(testArray instanceof Date) && !(testArray instanceof RegExp));
});
compareSuite.add('deep(array).isMany', () => deepArray.isMany);

// Группа тестов для метода is и isEmpty
const isMethodSuite = benchmark.createSuite('Тесты для методов is и isEmpty');

// Бенчмарки для метода is
isMethodSuite.add('obj1 === obj3 (нативное сравнение ссылок)', () => obj1 === obj3);
isMethodSuite.add('obj1 === obj2 (нативное сравнение разных объектов)', () => obj1 === obj2);
isMethodSuite.add('deep(obj1).is(deep(obj3)) (одинаковые ссылки)', () => deepObj1.is(deepObj3));
isMethodSuite.add('deep(obj1).is(deep(obj2)) (разные объекты)', () => deepObj1.is(deepObj2));
isMethodSuite.add('deep(testString).is(deep(testString))', () => deepString.is(deep(testString)));
isMethodSuite.add('deep(testNumber).is(deep(testNumber))', () => deepNumber.is(deep(testNumber)));

// Бенчмарки для свойства isEmpty
isMethodSuite.add('deep("").isEmpty (пустая строка)', () => deep('').isEmpty);
isMethodSuite.add('deep([]).isEmpty (пустой массив)', () => deep([]).isEmpty);
isMethodSuite.add('deep({}).isEmpty (пустой объект)', () => deep({}).isEmpty);
isMethodSuite.add('deep(0).isEmpty (число 0)', () => deep(0).isEmpty);
isMethodSuite.add('deep(new Set()).isEmpty (пустой Set)', () => deep(new Set()).isEmpty);
isMethodSuite.add('deep(new Map()).isEmpty (пустой Map)', () => deep(new Map()).isEmpty);
isMethodSuite.add('deep(null).isEmpty (null)', () => deep(null).isEmpty);
isMethodSuite.add('deep(undefined).isEmpty (undefined)', () => deep(undefined).isEmpty);
isMethodSuite.add('deep("text").isEmpty (непустая строка)', () => deep('text').isEmpty);
isMethodSuite.add('deep([1,2,3]).isEmpty (непустой массив)', () => deep([1,2,3]).isEmpty);
isMethodSuite.add('deep({a:1}).isEmpty (непустой объект)', () => deep({a:1}).isEmpty);

// Сравнение нативных проверок и isEmpty
const emptyCompareSuite = benchmark.createSuite('Сравнение нативных проверок пустоты и deep.isEmpty');

emptyCompareSuite.add('string === "" (нативная проверка пустой строки)', () => testEmpty === '');
emptyCompareSuite.add('deep("").isEmpty (проверка пустой строки)', () => deep('').isEmpty);

emptyCompareSuite.add('array.length === 0 (нативная проверка пустого массива)', () => [].length === 0);
emptyCompareSuite.add('deep([]).isEmpty (проверка пустого массива)', () => deep([]).isEmpty);

emptyCompareSuite.add('Object.keys(obj).length === 0 (нативная проверка пустого объекта)', () =>
  Object.keys({}).length === 0);
emptyCompareSuite.add('deep({}).isEmpty (проверка пустого объекта)', () => deep({}).isEmpty);

emptyCompareSuite.add('set.size === 0 (нативная проверка пустого Set)', () =>
  new Set().size === 0);
emptyCompareSuite.add('deep(new Set()).isEmpty (проверка пустого Set)', () =>
  deep(new Set()).isEmpty);

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для is.js...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'IS.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();
