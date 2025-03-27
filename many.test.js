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

    // Тест для Array
    await t.test('difference для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Разность массивов
      const result = deep(arr1).difference(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [1, 2], 'Должны остаться только элементы из первого массива');
    });

    // Тест для Map
    await t.test('difference для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Разность карт
      const result = deep(map1).difference(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1]], 'Должны остаться только элементы из первой карты');
    });

    // Тест для Object
    await t.test('difference для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };

      // Разность объектов
      const result = deep(obj1).difference(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1]], 'Должны остаться только элементы из первого объекта');
    });

    // Тест несовместимости типов
    await t.test('difference для несовместимых типов', () => {
      const set = new Set([1, 2, 3]);
      const obj = { a: 1, b: 2 };
      const map = new Map([['a', 1]]);
      const arr = [1, 2, 3];

      // Проверка смешивания Set с Object
      assert.throws(
        () => deep(set).difference(obj),
        { message: 'difference метод не поддерживает смешивание массивов/множеств с объектами/картами' }
      );

      // Проверка смешивания Map с Array
      assert.throws(
        () => deep(map).difference(arr),
        { message: 'difference метод не поддерживает смешивание массивов/множеств с объектами/картами' }
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

    // Тест для Array
    await t.test('intersection для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Пересечение массивов
      const result = deep(arr1).intersection(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [3, 4], 'Должны остаться только общие элементы');
    });

    // Тест для Map
    await t.test('intersection для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Пересечение карт
      const result = deep(map1).intersection(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3]], 'Должны остаться только общие элементы');
    });

    // Тест для Object
    await t.test('intersection для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };

      // Пересечение объектов
      const result = deep(obj1).intersection(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3]], 'Должны остаться только общие элементы');
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

    // Тест для Array
    await t.test('symmetricDifference для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Симметрическая разность массивов
      const result = deep(arr1).symmetricDifference(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      const resultArray = Array.from(result.this);
      assert.ok(resultArray.includes(1), 'Должен содержать 1');
      assert.ok(resultArray.includes(2), 'Должен содержать 2');
      assert.ok(resultArray.includes(5), 'Должен содержать 5');
      assert.ok(resultArray.includes(6), 'Должен содержать 6');
      assert.ok(!resultArray.includes(3), 'Не должен содержать 3');
      assert.ok(!resultArray.includes(4), 'Не должен содержать 4');
    });

    // Тест для Map
    await t.test('symmetricDifference для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Симметрическая разность карт
      const result = deep(map1).symmetricDifference(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['d', 4]], 'Должны остаться только уникальные элементы');
    });

    // Тест для Object
    await t.test('symmetricDifference для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };

      // Симметрическая разность объектов
      const result = deep(obj1).symmetricDifference(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['d', 4]], 'Должны остаться только уникальные элементы');
    });
  });

  await t.test('union', async (t) => {
    // Тест для Set
    await t.test('union для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);
      const result = deep(set1).union(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual([...result.this], [1, 2, 3, 4, 5, 6], 'Должны быть все элементы из обоих множеств');
    });

    // Тест для Array
    await t.test('union для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];
      const result = deep(arr1).union(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual([...result.this], [1, 2, 3, 4, 5, 6], 'Должны быть все элементы из обоих массивов');
    });

    // Тест для Map
    await t.test('union для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);
      const result = deep(map1).union(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['b', 2], ['c', 3], ['d', 4]], 'Должны быть все элементы из обеих карт');
    });

    // Тест для Object
    await t.test('union для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };
      const result = deep(obj1).union(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['b', 2], ['c', 3], ['d', 4]], 'Должны быть все элементы из обоих объектов');
    });

    // Тест несовместимости типов
    await t.test('union для несовместимых типов', () => {
      const set = new Set([1, 2, 3]);
      const obj = { a: 1, b: 2 };
      const map = new Map([['a', 1]]);
      const arr = [1, 2, 3];

      // Проверка смешивания Set с Object
      assert.throws(
        () => deep(set).union(obj),
        { message: 'union метод не поддерживает смешивание массивов/множеств с объектами/картами' }
      );

      // Проверка смешивания Map с Array
      assert.throws(
        () => deep(map).union(arr),
        { message: 'union метод не поддерживает смешивание массивов/множеств с объектами/картами' }
      );
    });
  });
});
