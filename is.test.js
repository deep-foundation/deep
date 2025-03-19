/**
 * Тесты для модуля проверки типов is.js
 */

import { Association } from './association.js';
import { deep } from './index.js';
import * as is from './is.js';
import assert from 'node:assert';
import test from 'node:test';

test('Базовые функции проверки типов', async (t) => {
  // Проверка примитивных типов
  await t.test('Примитивные типы', () => {
    assert.strictEqual(deep('test').isString, true);
    assert.strictEqual(deep(123).isString, false);

    assert.strictEqual(deep(123).isNumber, true);
    assert.strictEqual(deep('123').isNumber, false);

    assert.strictEqual(deep(true).isBoolean, true);
    assert.strictEqual(deep(1).isBoolean, false);

    assert.strictEqual(deep(Symbol()).isSymbol, true);
    assert.strictEqual(deep('symbol').isSymbol, false);

    assert.strictEqual(deep(BigInt(123)).isBigInt, true);
    assert.strictEqual(deep(123).isBigInt, false);

    assert.strictEqual(deep(null).isNull, true);
    assert.strictEqual(deep(undefined).isNull, false);

    assert.strictEqual(deep(undefined).isUndefined, true);
    assert.strictEqual(deep(null).isUndefined, false);
  });

  // Проверка объектных типов
  await t.test('Объектные типы', () => {
    assert.strictEqual(deep(() => {}).isFunction, true);
    assert.strictEqual(deep({}).isFunction, false);

    assert.strictEqual(deep([]).isArray, true);
    assert.strictEqual(deep({}).isArray, false);

    assert.strictEqual(deep({}).isObject, true);
    assert.strictEqual(deep(null).isObject, false);
    assert.strictEqual(deep([]).isObject, true);

    assert.strictEqual(deep({}).isPlainObject, true);
    assert.strictEqual(deep([]).isPlainObject, false);
    assert.strictEqual(deep(new Date()).isPlainObject, false);

    assert.strictEqual(deep(new Date()).isDate, true);
    assert.strictEqual(deep('2023-01-01').isDate, false);

    assert.strictEqual(deep(/test/).isRegExp, true);
    assert.strictEqual(deep('test').isRegExp, false);

    assert.strictEqual(deep(new Set()).isSet, true);
    assert.strictEqual(deep(new Map()).isSet, false);

    assert.strictEqual(deep(new Map()).isMap, true);
    assert.strictEqual(deep(new Set()).isMap, false);

    assert.strictEqual(deep(new WeakMap()).isWeakMap, true);
    assert.strictEqual(deep(new Map()).isWeakMap, false);

    assert.strictEqual(deep(new WeakSet()).isWeakSet, true);
    assert.strictEqual(deep(new Set()).isWeakSet, false);
  });

  // Проверка составных типов
  await t.test('Составные типы', () => {
    assert.strictEqual(deep(Promise.resolve()).isPromise, true);
    assert.strictEqual(deep({ then: () => {} }).isPromise, false);

    assert.strictEqual(deep(Promise.resolve()).isPromiseLike, true);
    assert.strictEqual(deep({ then: () => {} }).isPromiseLike, true);
    assert.strictEqual(deep({}).isPromiseLike, false);

    assert.strictEqual(deep('string').isPrimitive, true);
    assert.strictEqual(deep(123).isPrimitive, true);
    assert.strictEqual(deep(true).isPrimitive, true);
    assert.strictEqual(deep(null).isPrimitive, true);
    assert.strictEqual(deep(undefined).isPrimitive, true);
    assert.strictEqual(deep({}).isPrimitive, false);
    assert.strictEqual(deep([]).isPrimitive, false);

    assert.strictEqual(deep([]).isIterable, true);
    assert.strictEqual(deep(new Set()).isIterable, true);
    assert.strictEqual(deep('string').isIterable, true);
    assert.strictEqual(deep({}).isIterable, false);

    function TestClass() {}
    assert.strictEqual(deep(TestClass).isConstructor, true);
    assert.strictEqual(deep(() => {}).isConstructor, false);

    assert.strictEqual(deep(new Error()).isError, true);
    assert.strictEqual(deep(new TypeError()).isError, true);
    assert.strictEqual(deep({ message: 'error' }).isError, false);

    assert.strictEqual(deep('{"test": 123}').isJSON, true);
    assert.strictEqual(deep('{test: 123}').isJSON, false);
    assert.strictEqual(deep(123).isJSON, true);

    assert.strictEqual(deep('').isEmpty, true);
    assert.strictEqual(deep([]).isEmpty, true);
    assert.strictEqual(deep({}).isEmpty, true);
    assert.strictEqual(deep(new Set()).isEmpty, true);
    assert.strictEqual(deep(new Map()).isEmpty, true);
    assert.strictEqual(deep('test').isEmpty, false);
    assert.strictEqual(deep([1, 2]).isEmpty, false);
    assert.strictEqual(deep({ a: 1 }).isEmpty, false);

    // Проверка isMany
    assert.strictEqual(deep([]).isMany, true, 'Массивы должны определяться как множественные');
    assert.strictEqual(deep({}).isMany, true, 'Объекты должны определяться как множественные');
    assert.strictEqual(deep(new Set()).isMany, true, 'Set должны определяться как множественные');
    assert.strictEqual(deep(new Map()).isMany, true, 'Map должны определяться как множественные');
    assert.strictEqual(deep('строка').isMany, false, 'Строки не должны определяться как множественные');
    assert.strictEqual(deep(123).isMany, false, 'Числа не должны определяться как множественные');
    assert.strictEqual(deep(true).isMany, false, 'Булевы значения не должны определяться как множественные');
    assert.strictEqual(deep(null).isMany, false, 'null не должен определяться как множественный');
    assert.strictEqual(deep(undefined).isMany, false, 'undefined не должен определяться как множественный');
    assert.strictEqual(deep(new Date()).isMany, false, 'Date не должен определяться как множественный');
    assert.strictEqual(deep(/test/).isMany, false, 'RegExp не должен определяться как множественный');
  });


  // Проверка структур данных, экспортируемых из is.js
  await t.test('Вспомогательные структуры is.js', () => {
    // Проверка types
    assert.strictEqual(is.types instanceof Map, true);
    assert(is.types.has('string'), 'types должен содержать string');
    assert(is.types.has('number'), 'types должен содержать number');
    assert(is.types.has('array'), 'types должен содержать array');
    assert.strictEqual(is.types.get('string'), is.isString);

    // Проверка checks
    assert.strictEqual(is.checks instanceof Map, true);
    assert(is.checks.has(is.isString), 'checks должен содержать isString');
    assert(is.checks.has(is.isNumber), 'checks должен содержать isNumber');
    assert.strictEqual(is.checks.get(is.isString), 'string');

    // Проверка order
    assert.strictEqual(Array.isArray(is.order), true);
    assert(is.order.includes('string'), 'order должен содержать string');
    assert(is.order.includes('number'), 'order должен содержать number');
    assert(is.order.indexOf('undefined') < is.order.indexOf('object'),
           'undefined должен проверяться раньше object');
    assert(is.order.indexOf('null') < is.order.indexOf('object'),
           'null должен проверяться раньше object');
    assert(is.order.indexOf('array') < is.order.indexOf('object'),
           'array должен проверяться раньше object');
  });
});
