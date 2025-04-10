/**
 * Тесты для модуля проверки типов is.js
 */

import { Association } from './association.js';
import { deep } from './index.js';
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

  // Проверка detect
  await t.test('Метод detect для определения типа', () => {
    assert.strictEqual(deep('test').detect, 'string');
    assert.strictEqual(deep(123).detect, 'number');
    assert.strictEqual(deep(true).detect, 'boolean');
    assert.strictEqual(deep([]).detect, 'array');
    assert.strictEqual(deep({}).detect, 'object');
    assert.strictEqual(deep(null).detect, 'null');
    assert.strictEqual(deep(undefined).detect, 'undefined');
    assert.strictEqual(deep(new Set()).detect, 'set');
    assert.strictEqual(deep(new Map()).detect, 'map');
    assert.strictEqual(deep(new Date()).detect, 'date');
  });

  // Тесты для метода is
  await t.test('Метод is для проверки идентичности', async (t) => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1 };
    const obj3 = obj1;

    const deepObj1 = deep(obj1);
    const deepObj2 = deep(obj2);
    const deepObj3 = deep(obj3);

    await t.test('is проверяет идентичность объектов (одинаковые ссылки)', () => {
      assert.strictEqual(deepObj1.is(deepObj3), true, 'Одинаковые ссылки должны быть идентичны');
    });

    await t.test('is проверяет идентичность объектов (разные объекты)', () => {
      assert.strictEqual(deepObj1.is(deepObj2), false, 'Разные объекты не должны быть идентичны, даже с одинаковым содержимым');
    });

    await t.test('is работает с примитивами', () => {
      assert.strictEqual(deep(42).is(deep(42)), true, 'Одинаковые числа должны быть идентичны');
      assert.strictEqual(deep('text').is(deep('text')), true, 'Одинаковые строки должны быть идентичны');
      assert.strictEqual(deep(true).is(deep(true)), true, 'Одинаковые булевы значения должны быть идентичны');
      assert.strictEqual(deep(null).is(deep(null)), true, 'null должен быть идентичен null');
      assert.strictEqual(deep(undefined).is(deep(undefined)), true, 'undefined должен быть идентичен undefined');

      assert.strictEqual(deep(42).is(deep(43)), false, 'Разные числа не должны быть идентичны');
      assert.strictEqual(deep('text').is(deep('text2')), false, 'Разные строки не должны быть идентичны');
      assert.strictEqual(deep(true).is(deep(false)), false, 'Разные булевы значения не должны быть идентичны');
      assert.strictEqual(deep(null).is(deep(undefined)), false, 'null не должен быть идентичен undefined');
    });
  });

  // Расширенные тесты для isEmpty
  await t.test('Свойство isEmpty для проверки пустоты', async (t) => {
    await t.test('isEmpty для строк', () => {
      assert.strictEqual(deep('').isEmpty, true, 'Пустая строка должна быть пустой');
      assert.strictEqual(deep('text').isEmpty, false, 'Непустая строка не должна быть пустой');
    });

    await t.test('isEmpty для массивов', () => {
      assert.strictEqual(deep([]).isEmpty, true, 'Пустой массив должен быть пустым');
      assert.strictEqual(deep([1, 2, 3]).isEmpty, false, 'Непустой массив не должен быть пустым');
    });

    await t.test('isEmpty для объектов', () => {
      assert.strictEqual(deep({}).isEmpty, true, 'Пустой объект должен быть пустым');
      assert.strictEqual(deep({a: 1}).isEmpty, false, 'Непустой объект не должен быть пустым');
    });

    await t.test('isEmpty для коллекций', () => {
      assert.strictEqual(deep(new Set()).isEmpty, true, 'Пустой Set должен быть пустым');
      assert.strictEqual(deep(new Set([1, 2])).isEmpty, false, 'Непустой Set не должен быть пустым');

      assert.strictEqual(deep(new Map()).isEmpty, true, 'Пустой Map должен быть пустым');
      assert.strictEqual(deep(new Map([['a', 1]])).isEmpty, false, 'Непустой Map не должен быть пустым');
    });

    await t.test('isEmpty для чисел', () => {
      assert.strictEqual(deep(0).isEmpty, true, 'Число 0 должно считаться пустым');
      assert.strictEqual(deep(42).isEmpty, false, 'Ненулевое число не должно быть пустым');
    });

    await t.test('isEmpty для null и undefined', () => {
      assert.strictEqual(deep(null).isEmpty, true, 'null должен считаться пустым');
      assert.strictEqual(deep(undefined).isEmpty, true, 'undefined должен считаться пустым');
    });
  });
});
