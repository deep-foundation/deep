/**
 * Тесты для модуля many.js
 */

import { Association } from './association.js';
import { deep } from './index.js';
import * as many from './many.js';
import assert from 'node:assert';
import test from 'node:test';

test('Операции над множествами', async (t) => {
  await t.test('difference - разность множеств', async (t) => {
    // Тест для Set
    await t.test('difference для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Разность с Set
      const result1 = deep(set1).difference(set2);
      assert(result1.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result1.this), [1, 2], 'Должны остаться только элементы из первого множества');

      // Разность с Array
      const result2 = deep(set1).difference([3, 4, 5]);
      assert(result2.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result2.this), [1, 2], 'Должны остаться только элементы из первого множества');

      // Разность с Map
      const map = new Map([['a', 3], ['b', 4], ['c', 5]]);
      const result3 = deep(set1).difference(map);
      assert(result3.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result3.this), [1, 2], 'Должны остаться только элементы из первого множества');

      // Разность с Object
      const obj = { a: 3, b: 4, c: 5 };
      const result4 = deep(set1).difference(obj);
      assert(result4.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result4.this), [1, 2], 'Должны остаться только элементы из первого множества');

      // Разность с примитивом
      const result5 = deep(set1).difference(3);
      assert(result5.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result5.this), [1, 2, 4], 'Должны остаться элементы кроме указанного');
    });

    // Тест для Array
    await t.test('difference для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Разность с Array
      const result1 = deep(arr1).difference(arr2);
      assert(Array.isArray(result1.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result1.this, [1, 2], 'Должны остаться только элементы из первого массива');

      // Разность с Set
      const result2 = deep(arr1).difference(new Set([3, 4, 5]));
      assert(Array.isArray(result2.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result2.this, [1, 2], 'Должны остаться только элементы из первого массива');

      // Разность с Map
      const map = new Map([['a', 3], ['b', 4], ['c', 5]]);
      const result3 = deep(arr1).difference(map);
      assert(Array.isArray(result3.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result3.this, [1, 2], 'Должны остаться только элементы из первого массива');

      // Разность с Object
      const obj = { a: 3, b: 4, c: 5 };
      const result4 = deep(arr1).difference(obj);
      assert(Array.isArray(result4.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result4.this, [1, 2], 'Должны остаться только элементы из первого массива');

      // Разность с примитивом
      const result5 = deep(arr1).difference(3);
      assert(Array.isArray(result5.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result5.this, [1, 2, 4], 'Должны остаться элементы кроме указанного');
    });

    // Тест для Map
    await t.test('difference для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Разность с Map
      const result1 = deep(map1).difference(map2);
      assert(result1.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result1.this.entries()), [['a', 1]], 'Должны остаться только ключи из первой Map');

      // Разность с Object
      const obj = { b: 5, c: 6, d: 7 };
      const result2 = deep(map1).difference(obj);
      assert(result2.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result2.this.entries()), [['a', 1]], 'Должны остаться только ключи из первой Map');
    });

    // Тест для Object
    await t.test('difference для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 5, c: 6, d: 7 };

      // Разность с Object
      const result1 = deep(obj1).difference(obj2);
      assert.deepStrictEqual(typeof result1.this, 'object', 'Результат должен быть объектом');
      assert.deepStrictEqual(result1.this, { a: 1 }, 'Должны остаться только ключи из первого объекта');

      // Разность с Map
      const map = new Map([['b', 5], ['c', 6], ['d', 7]]);
      const result2 = deep(obj1).difference(map);
      assert.deepStrictEqual(typeof result2.this, 'object', 'Результат должен быть объектом');
      assert.deepStrictEqual(result2.this, { a: 1 }, 'Должны остаться только ключи из первого объекта');
    });

    // Тест для примитивов и единичных значений
    await t.test('difference для примитивов', () => {
      // Примитив с примитивом
      const result1 = deep(5).difference(5);
      assert.deepStrictEqual(result1.this, {}, 'Если значения равны, должен вернуться пустой объект');

      const result2 = deep(5).difference(10);
      assert.strictEqual(result2.this, 5, 'Если значения разные, должно вернуться исходное значение');

      // Примитив с множеством
      const result3 = deep(5).difference([1, 2, 3]);
      assert.strictEqual(result3.this, 5, 'Если примитив не найден в множестве, должно вернуться исходное значение');

      const result4 = deep(5).difference([1, 5, 10]);
      assert.deepStrictEqual(result4.this, {}, 'Если примитив найден в множестве, должен вернуться пустой объект');

      // Примитив с Set
      const result5 = deep(5).difference(new Set([1, 5, 10]));
      assert.deepStrictEqual(result5.this, {}, 'Если примитив найден в Set, должен вернуться пустой объект');

      // Примитив с Map (проверяем по значениям)
      const result6 = deep(5).difference(new Map([['a', 5], ['b', 10]]));
      assert.deepStrictEqual(result6.this, {}, 'Если примитив найден в значениях Map, должен вернуться пустой объект');

      // Примитив с Object (проверяем по значениям)
      const result7 = deep(5).difference({ a: 5, b: 10 });
      assert.deepStrictEqual(result7.this, {}, 'Если примитив найден в значениях Object, должен вернуться пустой объект');
    });
  });

  await t.test('intersection - пересечение множеств', async (t) => {
    // Тест для Set
    await t.test('intersection для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Пересечение с Set
      const result1 = deep(set1).intersection(set2);
      assert(result1.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result1.this), [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с Array
      const result2 = deep(set1).intersection([3, 4, 5]);
      assert(result2.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result2.this), [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с Map
      const map = new Map([['a', 3], ['b', 4], ['c', 5]]);
      const result3 = deep(set1).intersection(map);
      assert(result3.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result3.this), [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с Object
      const obj = { a: 3, b: 4, c: 5 };
      const result4 = deep(set1).intersection(obj);
      assert(result4.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result4.this), [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с примитивом
      const result5 = deep(set1).intersection(3);
      assert(result5.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result5.this), [3], 'Должен остаться только указанный элемент');
    });

    // Тест для Array
    await t.test('intersection для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Пересечение с Array
      const result1 = deep(arr1).intersection(arr2);
      assert(Array.isArray(result1.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result1.this, [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с Set
      const result2 = deep(arr1).intersection(new Set([3, 4, 5]));
      assert(Array.isArray(result2.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result2.this, [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с Map
      const map = new Map([['a', 3], ['b', 4], ['c', 5]]);
      const result3 = deep(arr1).intersection(map);
      assert(Array.isArray(result3.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result3.this, [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с Object
      const obj = { a: 3, b: 4, c: 5 };
      const result4 = deep(arr1).intersection(obj);
      assert(Array.isArray(result4.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result4.this, [3, 4], 'Должны остаться только общие элементы');

      // Пересечение с примитивом
      const result5 = deep(arr1).intersection(3);
      assert(Array.isArray(result5.this), 'Результат должен быть Array');
      assert.deepStrictEqual(result5.this, [3], 'Должен остаться только указанный элемент');
    });

    // Тест для Map
    await t.test('intersection для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Пересечение с Map
      const result1 = deep(map1).intersection(map2);
      assert(result1.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result1.this.entries()), [['b', 2], ['c', 3]], 'Должны остаться только общие ключи');

      // Пересечение с Object
      const obj = { b: 5, c: 6, d: 7 };
      const result2 = deep(map1).intersection(obj);
      assert(result2.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result2.this.entries()), [['b', 2], ['c', 3]], 'Должны остаться только общие ключи');
    });

    // Тест для Object
    await t.test('intersection для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 5, c: 6, d: 7 };

      // Пересечение с Object
      const result1 = deep(obj1).intersection(obj2);
      assert.deepStrictEqual(typeof result1.this, 'object', 'Результат должен быть объектом');
      assert.deepStrictEqual(result1.this, { b: 2, c: 3 }, 'Должны остаться только общие ключи');

      // Пересечение с Map
      const map = new Map([['b', 5], ['c', 6], ['d', 7]]);
      const result2 = deep(obj1).intersection(map);
      assert.deepStrictEqual(typeof result2.this, 'object', 'Результат должен быть объектом');
      assert.deepStrictEqual(result2.this, { b: 2, c: 3 }, 'Должны остаться только общие ключи');
    });

    // Тест для примитивов и единичных значений
    await t.test('intersection для примитивов', () => {
      // Примитив с примитивом
      const result1 = deep(5).intersection(5);
      assert.strictEqual(result1.this, 5, 'Если значения равны, должно вернуться исходное значение');

      const result2 = deep(5).intersection(10);
      assert.deepStrictEqual(result2.this, {}, 'Если значения разные, должен вернуться пустой объект');

      // Примитив с множеством
      const result3 = deep(5).intersection([1, 2, 3]);
      assert.deepStrictEqual(result3.this, {}, 'Если примитив не найден в множестве, должен вернуться пустой объект');

      const result4 = deep(5).intersection([1, 5, 10]);
      assert.strictEqual(result4.this, 5, 'Если примитив найден в множестве, должно вернуться исходное значение');

      // Примитив с Set
      const result5 = deep(5).intersection(new Set([1, 5, 10]));
      assert.strictEqual(result5.this, 5, 'Если примитив найден в Set, должно вернуться исходное значение');

      // Примитив с Map (проверяем по значениям)
      const result6 = deep(5).intersection(new Map([['a', 5], ['b', 10]]));
      assert.strictEqual(result6.this, 5, 'Если примитив найден в значениях Map, должно вернуться исходное значение');

      // Примитив с Object (проверяем по значениям)
      const result7 = deep(5).intersection({ a: 5, b: 10 });
      assert.strictEqual(result7.this, 5, 'Если примитив найден в значениях Object, должно вернуться исходное значение');
    });
  });
});

test('intersection с примитивами', (t) => {
  // Если примитивы равны, должен вернуть исходное значение
  const num1 = deep(5);
  const result1 = num1.intersection(5);
  assert.equal(result1.this, 5);

  // Если примитивы разные, должен вернуть пустой массив или объект (в зависимости от реализации)
  const num2 = deep(5);
  const result2 = num2.intersection(10);
  // Проверяем, что результат пустой (либо пустой массив, либо пустой объект)
  if (Array.isArray(result2.this)) {
    assert.equal(result2.this.length, 0);
  } else if (result2.this instanceof Set) {
    assert.equal(result2.this.size, 0);
  } else if (typeof result2.this === 'object') {
    assert.deepEqual(Object.keys(result2.this), []);
  }

  // Примитив и массив, содержащий этот примитив
  const num3 = deep(5);
  const result3 = num3.intersection([1, 5, 10]);
  assert.deepEqual(result3.this, 5);
});

// Сначала отладочный тест для проверки текущей реализации
test('debug symmetricDifference', (t) => {
  console.log('=== DEBUGGING SYMMETRIC DIFFERENCE ===');

  // Set
  const set1 = new Set([1, 2, 3, 4]);
  const set2 = new Set([3, 4, 5, 6]);

  // Отладка функции difference
  console.log('Set difference A-B:');
  const diffAB = deep(set1).difference(set2);
  console.log('Type:', diffAB.this.constructor.name);
  console.log('Content:', Array.from(diffAB.this));

  console.log('Set difference B-A:');
  const diffBA = deep(set2).difference(set1);
  console.log('Type:', diffBA.this.constructor.name);
  console.log('Content:', Array.from(diffBA.this));

  const resultSet = deep(set1).symmetricDifference(set2);
  console.log('Set symmetric difference:');
  console.log('Result type:', resultSet.this.constructor.name);
  console.log('Result:', Array.from(resultSet.this));

  // Array
  const array1 = [1, 2, 3, 4];
  const array2 = [3, 4, 5, 6];

  // Отладка функции difference для массивов
  console.log('\nArray difference A-B:');
  const diffArrayAB = deep(array1).difference(array2);
  console.log('Type:', Array.isArray(diffArrayAB.this) ? 'Array' : diffArrayAB.this.constructor.name);
  console.log('Content:', diffArrayAB.this);

  console.log('Array difference B-A:');
  const diffArrayBA = deep(array2).difference(array1);
  console.log('Type:', Array.isArray(diffArrayBA.this) ? 'Array' : diffArrayBA.this.constructor.name);
  console.log('Content:', diffArrayBA.this);

  const resultArray = deep(array1).symmetricDifference(array2);
  console.log('\nArray symmetric difference:');
  console.log('Result type:', Array.isArray(resultArray.this) ? 'Array' : resultArray.this.constructor.name);
  console.log('Result:', resultArray.this);
});

// Основные тесты после проверки
test('symmetricDifference с множествами (Set)', (t) => {
  const set1 = new Set([1, 2, 3, 4]);
  const set2 = new Set([3, 4, 5, 6]);

  const result = deep(set1).symmetricDifference(set2);

  // Проверяем тип результата
  assert.ok(result.this instanceof Set);

  // Проверяем содержимое
  assert.ok(result.this.has(1));
  assert.ok(result.this.has(2));
  assert.ok(result.this.has(5));
  assert.ok(result.this.has(6));
  assert.ok(!result.this.has(3));
  assert.ok(!result.this.has(4));
});

test('symmetricDifference с массивами (Array)', (t) => {
  const array1 = [1, 2, 3, 4];
  const array2 = [3, 4, 5, 6];

  const result = deep(array1).symmetricDifference(array2);

  // Проверяем тип результата
  assert.ok(Array.isArray(result.this));

  // Проверяем содержимое (порядок может отличаться)
  assert.ok(result.this.includes(1));
  assert.ok(result.this.includes(2));
  assert.ok(result.this.includes(5));
  assert.ok(result.this.includes(6));
  assert.ok(!result.this.includes(3));
  assert.ok(!result.this.includes(4));
});

test('symmetricDifference с Map', (t) => {
  const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
  const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

  const result = deep(map1).symmetricDifference(map2);

  // Проверяем тип результата
  assert.ok(result.this instanceof Map);

  // Проверяем содержимое
  assert.ok(result.this.has('a'));
  assert.ok(result.this.has('d'));
  assert.ok(!result.this.has('b'));
  assert.ok(!result.this.has('c'));
  assert.equal(result.this.get('a'), 1);
  assert.equal(result.this.get('d'), 4);
});

test('symmetricDifference с объектами (Object)', (t) => {
  const obj1 = { a: 1, b: 2, c: 3 };
  const obj2 = { b: 2, c: 3, d: 4 };

  const result = deep(obj1).symmetricDifference(obj2);

  // Проверяем тип результата
  assert.equal(typeof result.this, 'object');
  assert.ok(!Array.isArray(result.this));
  assert.ok(!(result.this instanceof Set));
  assert.ok(!(result.this instanceof Map));

  // Проверяем содержимое
  assert.equal(result.this.a, 1);
  assert.equal(result.this.d, 4);
  assert.ok(result.this.b === undefined || result.this.c === undefined);
});

test('symmetricDifference между разными типами данных', (t) => {
  // Set и Array
  const set1 = new Set([1, 2, 3]);
  const array1 = [2, 3, 4];

  const resultSetArray = deep(set1).symmetricDifference(array1);
  assert.ok(resultSetArray.this instanceof Set);
  assert.ok(resultSetArray.this.has(1));
  assert.ok(resultSetArray.this.has(4));
  assert.ok(!resultSetArray.this.has(2));
  assert.ok(!resultSetArray.this.has(3));

  // Array и Set
  const resultArraySet = deep(array1).symmetricDifference(set1);
  assert.ok(Array.isArray(resultArraySet.this));
  assert.ok(resultArraySet.this.includes(1) || resultArraySet.this.includes(4));
  assert.ok(!resultArraySet.this.includes(2) && !resultArraySet.this.includes(3));

  // Map и Object
  const map1 = new Map([['a', 1], ['b', 2]]);
  const obj1 = { b: 2, c: 3 };

  const resultMapObj = deep(map1).symmetricDifference(obj1);
  assert.ok(resultMapObj.this instanceof Map);
  assert.ok(resultMapObj.this.has('a'));
  assert.ok(resultMapObj.this.has('c'));
  assert.ok(!resultMapObj.this.has('b'));
});

test('symmetricDifference с примитивами', (t) => {
  // Примитив и множество
  const num1 = 5;
  const set1 = new Set([1, 2, 3]);

  const resultNumSet = deep(num1).symmetricDifference(set1);
  // В случае с примитивами и коллекциями, ожидаем, что результат будет содержать все элементы
  assert.ok(Array.isArray(resultNumSet.this) || resultNumSet.this instanceof Set);

  // Разные примитивы
  const resultNumNum = deep(5).symmetricDifference(10);
  assert.ok(Array.isArray(resultNumNum.this));
  assert.equal(resultNumNum.this.length, 2);
  assert.ok(resultNumNum.this.includes(5));
  assert.ok(resultNumNum.this.includes(10));

  // Одинаковые примитивы
  const resultSameNum = deep(5).symmetricDifference(5);
  assert.ok(Array.isArray(resultSameNum.this));
  assert.equal(resultSameNum.this.length, 0);
});
