/**
 * Тесты для gets.js
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { Association } from './association.js';
import { deep } from './index.js';
import * as gets from './gets.js';

test('forEach для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const array = [1, 2, 3];
    const result = [];
    deep(array).forEach((value, index) => {
      assert.ok(value instanceof Association, 'Значение должно быть экземпляром Association');
      result.push({ value: value.this, index });
    });
    assert.deepStrictEqual(result, [
      { value: 1, index: 0 },
      { value: 2, index: 1 },
      { value: 3, index: 2 }
    ]);
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = [];
    deep(obj).forEach((value, key) => {
      assert.ok(value instanceof Association, 'Значение должно быть экземпляром Association');
      result.push({ value: value.this, key });
    });
    assert.deepStrictEqual(result, [
      { value: 1, key: 'a' },
      { value: 2, key: 'b' },
      { value: 3, key: 'c' }
    ]);
  });

  await t.test('Для строки', () => {
    const str = 'abc';
    const result = [];
    deep(str).forEach((value, index) => {
      assert.ok(value instanceof Association, 'Значение должно быть экземпляром Association');
      result.push({ value: value.this, index });
    });
    assert.deepStrictEqual(result, [
      { value: 'a', index: 0 },
      { value: 'b', index: 1 },
      { value: 'c', index: 2 }
    ]);
  });

  await t.test('Для Map', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const result = [];
    deep(map).forEach((value, key) => {
      assert.ok(value instanceof Association, 'Значение должно быть экземпляром Association');
      result.push({ value: value.this, key });
    });
    assert.deepStrictEqual(result, [
      { value: 1, key: 'a' },
      { value: 2, key: 'b' },
      { value: 3, key: 'c' }
    ]);
  });

  await t.test('Для Set', () => {
    const set = new Set([1, 2, 3]);
    const result = [];
    deep(set).forEach((value, index) => {
      assert.ok(value instanceof Association, 'Значение должно быть экземпляром Association');
      result.push({ value: value.this, index });
    });
    assert.deepStrictEqual(result, [
      { value: 1, index: 0 },
      { value: 2, index: 1 },
      { value: 3, index: 2 }
    ]);
  });

  await t.test('Для коллекции', () => {
    const set = new Set([1, 2, 3]);
    let collection;
    deep(set).forEach((value, index, coll) => {
      collection = coll;
    });
    assert.ok(collection instanceof Association, 'Коллекция должна быть экземпляром Association');
  });

  await t.test('Для null и undefined', () => {
    const result1 = [];
    deep(null).forEach((value) => {
      result1.push(value);
    });
    assert.deepStrictEqual(result1, []);

    const result2 = [];
    deep(undefined).forEach((value) => {
      result2.push(value);
    });
    assert.deepStrictEqual(result2, []);
  });

  await t.test('Проверка unwrap с callback', () => {
    const array = [1, 2, 3];
    const result = [];
    const wrappedCallback = deep((value, index) => {
      result.push({ value: value.this, index });
    });
    deep(array).forEach(wrappedCallback);
    assert.deepStrictEqual(result, [
      { value: 1, index: 0 },
      { value: 2, index: 1 },
      { value: 3, index: 2 }
    ]);
  });
});

test('map для разных типов данных', () => {
  // Тест для массива
  const arr = [1, 2, 3];
  const resultArr = deep(arr).map(x => x * 2);
  assert.deepEqual(resultArr.this, [2, 4, 6]);
  assert.ok(resultArr instanceof Association);

  // Проверка, что параметры коллбэка являются экземплярами Association
  const cbParams = [];
  deep(arr).map(x => {
    cbParams.push(x);
    return x * 2;
  });
  assert.ok(cbParams.every(x => x instanceof Association));

  // Тест для объекта
  const obj = { a: 1, b: 2, c: 3 };
  const resultObj = deep(obj).map(x => x * 2);
  assert.deepEqual(resultObj.this, [2, 4, 6]);

  // Тест для строки
  const str = 'abc';
  const resultStr = deep(str).map(x => x + x);
  assert.deepEqual(resultStr.this, ['aa', 'bb', 'cc']);

  // Тест для Map
  const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
  const resultMap = deep(map).map(x => x * 2);
  assert.deepEqual(resultMap.this, [2, 4, 6]);

  // Тест для Set
  const set = new Set([1, 2, 3]);
  const resultSet = deep(set).map(x => x * 2);
  assert.deepEqual(resultSet.this, [2, 4, 6]);

  // Тест для чисел
  const num = 123;
  const resultNum = deep(num).map(x => x + 1);
  assert.deepEqual(resultNum.this, [124]);

  // Тест для boolean
  const bool = true;
  const resultBool = deep(bool).map(x => x ? 'F' : 'T');
  assert.deepEqual(resultBool.this, ['F']);

  // Тесты для примитивов с константным возвращаемым значением
  const resultNumConst = deep(num).map(() => 'X');
  assert.deepEqual(resultNumConst.this, ['X']);

  // Проверка unwrap коллбэка
  const unwrappedCallback = x => x * 2;
  const wrappedCallback = new Association(unwrappedCallback);
  const resultWithWrappedCb = deep(arr).map(wrappedCallback);
  assert.deepEqual(resultWithWrappedCb.this, [2, 4, 6]);

  // Тест для null и undefined
  assert.deepEqual(deep(null).map(x => x).this, []);
  assert.deepEqual(deep(undefined).map(x => x).this, []);
});

test('filter для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const array = [1, 2, 3, 4, 5];
    const result = deep(array).filter(x => x % 2 === 0);
    assert.deepStrictEqual(result.this, [2, 4]);
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = deep(obj).filter(x => x % 2 === 0);
    assert.deepStrictEqual(result.this, [2, 4]);
  });

  await t.test('Для строки', () => {
    const str = 'abcde';
    const result = deep(str).filter(x => ['a', 'e'].includes(x.this));
    assert.deepStrictEqual(result.this, ['a', 'e']);
  });
});

test('reduce для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const array = [1, 2, 3, 4];
    const result = deep(array).reduce((acc, x) => acc + x, 0);
    assert.strictEqual(result.this, 10);
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = deep(obj).reduce((acc, x) => acc + x, 0);
    assert.strictEqual(result.this, 6);
  });

  await t.test('Для строки', () => {
    const str = 'abc';
    const result = deep(str).reduce((acc, x) => acc + x.this.toUpperCase(), '');
    assert.strictEqual(result.this, 'ABC');
  });

  await t.test('Без initial value', () => {
    const array = [1, 2, 3, 4];
    const result = deep(array).reduce((acc, x) => {
      return acc + x;
    }, 0);
    assert.strictEqual(result.this, 10);
  });
});

test('every для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    assert.strictEqual(deep([2, 4, 6]).every(x => x % 2 === 0).this, true);
    assert.strictEqual(deep([2, 3, 6]).every(x => x % 2 === 0).this, false);
  });

  await t.test('Для объекта', () => {
    assert.strictEqual(deep({ a: 2, b: 4 }).every(x => x % 2 === 0).this, true);
    assert.strictEqual(deep({ a: 2, b: 3 }).every(x => x % 2 === 0).this, false);
  });

  await t.test('Для строки', () => {
    assert.strictEqual(deep('abc').every(x => /[a-z]/.test(x)).this, true);
    assert.strictEqual(deep('ab1').every(x => /[a-z]/.test(x)).this, false);
  });
});

test('some для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const someResult1 = deep([1, 3, 6]).some(x => x % 2 === 0);
    assert.ok(someResult1 instanceof Association, 'Результат some должен быть Association');
    assert.strictEqual(someResult1.this, true);

    const someResult2 = deep([1, 3, 5]).some(x => x % 2 === 0);
    assert.ok(someResult2 instanceof Association, 'Результат some должен быть Association');
    assert.strictEqual(someResult2.this, false);
  });

  await t.test('Для объекта', () => {
    const someResult1 = deep({ a: 1, b: 4 }).some(x => x % 2 === 0);
    assert.ok(someResult1 instanceof Association, 'Результат some должен быть Association');
    assert.strictEqual(someResult1.this, true);

    const someResult2 = deep({ a: 1, b: 3 }).some(x => x % 2 === 0);
    assert.ok(someResult2 instanceof Association, 'Результат some должен быть Association');
    assert.strictEqual(someResult2.this, false);
  });
});

test('find и findKey для разных типов данных', async (t) => {
  await t.test('find для массива', () => {
    const findResult1 = deep([1, 2, 3]).find(x => x > 1);
    assert.ok(findResult1 instanceof Association, 'Результат find должен быть Association');
    assert.strictEqual(findResult1.this, 2);

    const findResult2 = deep([1, 2, 3]).find(x => x > 5);
    assert.strictEqual(findResult2, undefined);
  });

  await t.test('findKey для массива', () => {
    const findKeyResult1 = deep([1, 2, 3]).findKey(x => x > 1);
    assert.ok(findKeyResult1 instanceof Association, 'Результат findKey должен быть Association');
    assert.strictEqual(findKeyResult1.this, 1);

    const findKeyResult2 = deep([1, 2, 3]).findKey(x => x > 5);
    assert.strictEqual(findKeyResult2, undefined);
  });

  await t.test('find для объекта', () => {
    const findResult = deep({ a: 1, b: 2 }).find(x => x > 1);
    assert.ok(findResult instanceof Association, 'Результат find должен быть Association');
    assert.strictEqual(findResult.this, 2);

    const findKeyResult = deep({ a: 1, b: 2 }).findKey(x => x > 1);
    assert.ok(findKeyResult instanceof Association, 'Результат findKey должен быть Association');
    assert.strictEqual(findKeyResult.this, 'b');
  });
});

test('keys, values, entries для разных типов данных', async (t) => {
  await t.test('keys', () => {
    const keysResult = deep([10, 20, 30]).keys();
    assert.ok(keysResult instanceof Association, 'Результат keys должен быть Association');
    assert.deepStrictEqual(keysResult.this, [0, 1, 2]);

    const objKeysResult = deep({ a: 1, b: 2 }).keys();
    assert.ok(objKeysResult instanceof Association, 'Результат keys для объекта должен быть Association');
    assert.deepStrictEqual(objKeysResult.this, ['a', 'b']);

    const strKeysResult = deep('abc').keys();
    assert.ok(strKeysResult instanceof Association, 'Результат keys для строки должен быть Association');
    assert.deepStrictEqual(strKeysResult.this, [0, 1, 2]);
  });

  await t.test('values', () => {
    const valuesResult = deep([10, 20, 30]).values();
    assert.ok(valuesResult instanceof Association, 'Результат values должен быть Association');
    assert.deepStrictEqual(valuesResult.this, [10, 20, 30]);

    const objValuesResult = deep({ a: 1, b: 2 }).values();
    assert.ok(objValuesResult instanceof Association, 'Результат values для объекта должен быть Association');
    assert.deepStrictEqual(objValuesResult.this, [1, 2]);

    const strValuesResult = deep('abc').values();
    assert.ok(strValuesResult instanceof Association, 'Результат values для строки должен быть Association');
    assert.deepStrictEqual(strValuesResult.this, ['a', 'b', 'c']);
  });

  await t.test('entries', () => {
    const entriesResult = deep([10, 20]).entries();
    assert.ok(entriesResult instanceof Association, 'Результат entries должен быть Association');
    assert.deepStrictEqual(entriesResult.this, [[0, 10], [1, 20]]);

    const objEntriesResult = deep({ a: 1, b: 2 }).entries();
    assert.ok(objEntriesResult instanceof Association, 'Результат entries для объекта должен быть Association');
    assert.deepStrictEqual(objEntriesResult.this, [['a', 1], ['b', 2]]);

    const strEntriesResult = deep('ab').entries();
    assert.ok(strEntriesResult instanceof Association, 'Результат entries для строки должен быть Association');
    assert.deepStrictEqual(strEntriesResult.this, [[0, 'a'], [1, 'b']]);
  });
});

test('join для разных типов данных', async (t) => {
  await t.test('join для массива', () => {
    assert.strictEqual(deep([1, 2, 3]).join().this, '1,2,3');
    assert.strictEqual(deep([1, 2, 3]).join('-').this, '1-2-3');
  });

  await t.test('join для объекта', () => {
    // Порядок ключей в объектах может быть разным, поэтому проверяем по-другому
    const joined = deep({ a: 1, b: 2 }).join('-').this;
    assert.ok(joined === '1-2' || joined === '2-1');
  });

  await t.test('join для строки', () => {
    assert.strictEqual(deep('abc').join().this, 'a,b,c');
    assert.strictEqual(deep('abc').join('-').this, 'a-b-c');
  });
});

test('get для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const array = [1, 2, 3];
    const result = deep(array).get(1);
    assert.ok(result instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(result.this, 2, 'Должен вернуть элемент с индексом 1');

    // Индекс за пределами массива
    const outOfBounds = deep(array).get(10);
    assert.strictEqual(outOfBounds, undefined, 'Должен вернуть undefined для индекса за пределами массива');
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = deep(obj).get('b');
    assert.ok(result instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(result.this, 2, 'Должен вернуть значение по ключу "b"');

    // Несуществующий ключ
    const nonExistent = deep(obj).get('z');
    assert.strictEqual(nonExistent, undefined, 'Должен вернуть undefined для несуществующего ключа');
  });

  await t.test('Для строки', () => {
    const str = 'hello';
    const result = deep(str).get(1);
    assert.ok(result instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(result.this, 'e', 'Должен вернуть символ с индексом 1');

    // Индекс за пределами строки
    const outOfBounds = deep(str).get(10);
    assert.strictEqual(outOfBounds, undefined, 'Должен вернуть undefined для индекса за пределами строки');
  });

  await t.test('Для Map', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const result = deep(map).get('b');
    assert.ok(result instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(result.this, 2, 'Должен вернуть значение по ключу "b"');

    // Несуществующий ключ
    const nonExistent = deep(map).get('z');
    assert.strictEqual(nonExistent, undefined, 'Должен вернуть undefined для несуществующего ключа');
  });

  await t.test('Для Set', () => {
    const set = new Set([1, 2, 3]);
    const result = deep(set).get(1);
    assert.ok(result instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(result.this, 2, 'Должен вернуть элемент с индексом 1');

    // Индекс за пределами Set
    const outOfBounds = deep(set).get(10);
    assert.strictEqual(outOfBounds, undefined, 'Должен вернуть undefined для индекса за пределами Set');
  });

  await t.test('Для числа', () => {
    const num = 12345;
    const result = deep(num).get(2);
    assert.ok(result instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(result.this, 3, 'Должен вернуть цифру с индексом 2');

    // Индекс за пределами числа
    const outOfBounds = deep(num).get(10);
    assert.strictEqual(outOfBounds, undefined, 'Должен вернуть undefined для индекса за пределами числа');
  });

  await t.test('Для null и undefined', () => {
    const nullResult = deep(null).get(0);
    assert.strictEqual(nullResult, undefined, 'Должен вернуть undefined для null');

    const undefinedResult = deep(undefined).get(0);
    assert.strictEqual(undefinedResult, undefined, 'Должен вернуть undefined для undefined');
  });
});

test('has для разных типов данных', async (t) => {
  await t.test('Для массива (проверка индекса)', () => {
    const array = [1, 2, 3];
    assert.strictEqual(deep(array).has(1), true, 'Должен вернуть true для существующего индекса');
    assert.strictEqual(deep(array).has(3), false, 'Должен вернуть false для несуществующего индекса');
  });

  await t.test('Для массива (проверка значения)', () => {
    const array = [1, 2, 3];
    assert.strictEqual(deep(array).has(2), true, 'Должен вернуть true для существующего значения');
    assert.strictEqual(deep(array).has(5), false, 'Должен вернуть false для несуществующего значения');
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3 };
    assert.strictEqual(deep(obj).has('b'), true, 'Должен вернуть true для существующего свойства');
    assert.strictEqual(deep(obj).has('z'), false, 'Должен вернуть false для несуществующего свойства');
  });

  await t.test('Для строки (проверка индекса)', () => {
    const str = 'hello';
    assert.strictEqual(deep(str).has(1), true, 'Должен вернуть true для существующего индекса');
    assert.strictEqual(deep(str).has(10), false, 'Должен вернуть false для несуществующего индекса');
  });

  await t.test('Для строки (проверка подстроки)', () => {
    const str = 'hello';
    assert.strictEqual(deep(str).has('el'), true, 'Должен вернуть true для существующей подстроки');
    assert.strictEqual(deep(str).has('xyz'), false, 'Должен вернуть false для несуществующей подстроки');
  });

  await t.test('Для Map', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    assert.strictEqual(deep(map).has('b'), true, 'Должен вернуть true для существующего ключа');
    assert.strictEqual(deep(map).has('z'), false, 'Должен вернуть false для несуществующего ключа');
  });

  await t.test('Для Set', () => {
    const set = new Set([1, 2, 3]);
    assert.strictEqual(deep(set).has(2), true, 'Должен вернуть true для существующего значения');
    assert.strictEqual(deep(set).has(5), false, 'Должен вернуть false для несуществующего значения');
  });

  await t.test('Для числа', () => {
    const num = 12345;
    assert.strictEqual(deep(num).has(2), true, 'Должен вернуть true для существующего индекса');
    assert.strictEqual(deep(num).has(10), false, 'Должен вернуть false для несуществующего индекса');
  });

  await t.test('Для null и undefined', () => {
    assert.strictEqual(deep(null).has(0), false, 'Должен вернуть false для null');
    assert.strictEqual(deep(undefined).has(0), false, 'Должен вернуть false для undefined');
  });
});

test('count, size и length для разных типов данных', async (t) => {
  await t.test('count для массива', () => {
    const array = [1, 2, 3, 4, 5];
    const countResult = deep(array).count;
    assert.ok(countResult instanceof Association, 'Результат count должен быть Association');
    assert.strictEqual(countResult.this, 5, 'Count массива должен быть равен его длине');
  });

  await t.test('size для массива', () => {
    const array = [1, 2, 3, 4, 5];
    const sizeResult = deep(array).size;
    assert.ok(sizeResult instanceof Association, 'Результат size должен быть Association');
    assert.strictEqual(sizeResult.this, 5, 'Size массива должен быть равен его длине');
  });

  await t.test('length для массива', () => {
    const array = [1, 2, 3, 4, 5];
    const lengthResult = deep(array).length;
    assert.ok(lengthResult instanceof Association, 'Результат length должен быть Association');
    assert.strictEqual(lengthResult.this, 5, 'Length массива должен быть равен его длине');
  });

  await t.test('count для объекта', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const countResult = deep(obj).count;
    assert.ok(countResult instanceof Association, 'Результат count должен быть Association');
    assert.strictEqual(countResult.this, 3, 'Count объекта должен быть равен количеству его свойств');
  });

  await t.test('count для строки', () => {
    const str = 'hello';
    const countResult = deep(str).count;
    assert.ok(countResult instanceof Association, 'Результат count должен быть Association');
    assert.strictEqual(countResult.this, 5, 'Count строки должен быть равен ее длине');
  });

  await t.test('count для Map', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const countResult = deep(map).count;
    assert.ok(countResult instanceof Association, 'Результат count должен быть Association');
    assert.strictEqual(countResult.this, 3, 'Count Map должен быть равен его размеру');
  });

  await t.test('count для Set', () => {
    const set = new Set([1, 2, 3, 4]);
    const countResult = deep(set).count;
    assert.ok(countResult instanceof Association, 'Результат count должен быть Association');
    assert.strictEqual(countResult.this, 4, 'Count Set должен быть равен его размеру');
  });

  await t.test('count для числа', () => {
    const num = 42;
    const countResult = deep(num).count;
    assert.ok(countResult instanceof Association, 'Результат count должен быть Association');
    assert.strictEqual(countResult.this, 1, 'Count числа должен быть равен 1');
  });

  await t.test('count для boolean', () => {
    const bool = true;
    const countResult = deep(bool).count;
    assert.ok(countResult instanceof Association, 'Результат count должен быть Association');
    assert.strictEqual(countResult.this, 1, 'Count boolean должен быть равен 1');
  });

  await t.test('count для null и undefined', () => {
    const nullCount = deep(null).count;
    const undefinedCount = deep(undefined).count;
    assert.ok(nullCount instanceof Association, 'Результат count для null должен быть Association');
    assert.ok(undefinedCount instanceof Association, 'Результат count для undefined должен быть Association');
    assert.strictEqual(nullCount.this, 0, 'Count для null должен быть равен 0');
    assert.strictEqual(undefinedCount.this, 0, 'Count для undefined должен быть равен 0');
  });
});
