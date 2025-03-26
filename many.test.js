/**
 * Тесты для модуля many.js
 */

import { deep } from './index.js';
import assert from 'node:assert';
import test from 'node:test';

test('Операции над множествами', async (t) => {
  await t.test('difference - разность множеств', async (t) => {
    // Тест для Set
    await t.test('difference для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Разность множеств
      const result = deep(set1).difference(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [1, 2], 'Должны остаться только элементы из первого множества');
    });

    // Тест для других типов данных
    await t.test('difference для других типов', () => {
      const set = new Set([1, 2, 3]);
      const array = [3, 4, 5];
      const map = new Map([['a', 3], ['b', 4]]);
      const obj = { a: 3, b: 4 };

      // Проверка выброса ошибки для Array
      assert.throws(
        () => deep(array).difference(set),
        { message: 'difference метод работает только с типом Set' }
      );

      // Проверка выброса ошибки для Map
      assert.throws(
        () => deep(map).difference(set),
        { message: 'difference метод работает только с типом Set' }
      );

      // Проверка выброса ошибки для Object
      assert.throws(
        () => deep(obj).difference(set),
        { message: 'difference метод работает только с типом Set' }
      );

      // Проверка выброса ошибки при передаче не Set аргумента
      assert.throws(
        () => deep(set).difference(array),
        { message: 'difference метод работает только с типом Set' }
      );
    });
  });

  await t.test('intersection - пересечение множеств', async (t) => {
    // Тест для Set
    await t.test('intersection для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Пересечение множеств
      const result = deep(set1).intersection(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [3, 4], 'Должны остаться только общие элементы');
    });

    // Тест для других типов данных
    await t.test('intersection для других типов', () => {
      const set = new Set([1, 2, 3]);
      const array = [3, 4, 5];
      const map = new Map([['a', 3], ['b', 4]]);
      const obj = { a: 3, b: 4 };

      // Проверка выброса ошибки для Array
      assert.throws(
        () => deep(array).intersection(set),
        { message: 'intersection метод работает только с типом Set' }
      );

      // Проверка выброса ошибки для Map
      assert.throws(
        () => deep(map).intersection(set),
        { message: 'intersection метод работает только с типом Set' }
      );

      // Проверка выброса ошибки для Object
      assert.throws(
        () => deep(obj).intersection(set),
        { message: 'intersection метод работает только с типом Set' }
      );

      // Проверка выброса ошибки при передаче не Set аргумента
      assert.throws(
        () => deep(set).intersection(array),
        { message: 'intersection метод работает только с типом Set' }
      );
    });
  });

  await t.test('symmetricDifference - симметрическая разность множеств', async (t) => {
    // Тест для Set
    await t.test('symmetricDifference для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Симметрическая разность множеств
      const result = deep(set1).symmetricDifference(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      const resultArray = Array.from(result.this);
      assert.ok(resultArray.includes(1), 'Должен содержать 1');
      assert.ok(resultArray.includes(2), 'Должен содержать 2');
      assert.ok(resultArray.includes(5), 'Должен содержать 5');
      assert.ok(resultArray.includes(6), 'Должен содержать 6');
      assert.ok(!resultArray.includes(3), 'Не должен содержать 3');
      assert.ok(!resultArray.includes(4), 'Не должен содержать 4');
    });

    // Тест для других типов данных
    await t.test('symmetricDifference для других типов', () => {
      const set = new Set([1, 2, 3]);
      const array = [3, 4, 5];
      const map = new Map([['a', 3], ['b', 4]]);
      const obj = { a: 3, b: 4 };

      // Проверка выброса ошибки для Array
      assert.throws(
        () => deep(array).symmetricDifference(set),
        { message: 'symmetricDifference метод работает только с типом Set' }
      );

      // Проверка выброса ошибки для Map
      assert.throws(
        () => deep(map).symmetricDifference(set),
        { message: 'symmetricDifference метод работает только с типом Set' }
      );

      // Проверка выброса ошибки для Object
      assert.throws(
        () => deep(obj).symmetricDifference(set),
        { message: 'symmetricDifference метод работает только с типом Set' }
      );

      // Проверка выброса ошибки при передаче не Set аргумента
      assert.throws(
        () => deep(set).symmetricDifference(array),
        { message: 'symmetricDifference метод работает только с типом Set' }
      );
    });
  });

  await t.test('union', async (t) => {
    await t.test('Set', async (t) => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);
      const result = deep(set1).union(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual([...result.this], [1, 2, 3, 4, 5, 6], 'Должны быть все элементы из обоих множеств');
    });

    await t.test('другие типы', async (t) => {
      const set = new Set([1, 2, 3]);
      const arr = [1, 2, 3];
      const map = new Map([['a', 1]]);
      const obj = { a: 1 };

      assert.throws(() => deep(set).union(arr), { message: 'union метод работает только с типом Set' });
      assert.throws(() => deep(set).union(map), { message: 'union метод работает только с типом Set' });
      assert.throws(() => deep(set).union(obj), { message: 'union метод работает только с типом Set' });
    });
  });
});
