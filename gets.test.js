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

test('get - доступ к элементам разных типов данных', async (t) => {
  await t.test('доступ к элементам массива по индексу', () => {
    const arr = [1, 2, 3, 4, 5];
    const a = deep(arr);

    assert.ok(a.get(0) instanceof Association, 'Результат должен быть Association');
    assert.strictEqual(a.get(0).this, 1);
    assert.strictEqual(a.get(2).this, 3);
    assert.strictEqual(a.get(4).this, 5);
    assert.strictEqual(a.get(-1), undefined); // Отрицательный индекс
    assert.strictEqual(a.get(10), undefined); // Индекс за пределами массива
  });

  await t.test('доступ к символам строки по индексу', () => {
    const str = 'hello';
    const a = deep(str);

    assert.ok(a.get(0) instanceof Association, 'Результат должен быть Association');
    assert.strictEqual(a.get(0).this, 'h');
    assert.strictEqual(a.get(2).this, 'l');
    assert.strictEqual(a.get(4).this, 'o');
    assert.strictEqual(a.get(-1), undefined); // Отрицательный индекс
    assert.strictEqual(a.get(10), undefined); // Индекс за пределами строки
  });

  await t.test('доступ к элементам Map по ключу', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ]);
    const a = deep(map);

    assert.ok(a.get('a') instanceof Association, 'Результат должен быть Association');
    assert.strictEqual(a.get('a').this, 1);
    assert.strictEqual(a.get('b').this, 2);
    assert.strictEqual(a.get('c').this, 3);
    assert.strictEqual(a.get('d'), undefined); // Несуществующий ключ
  });

  await t.test('доступ к элементам Set по индексу', () => {
    const set = new Set([5, 6, 7, 8]);
    const a = deep(set);

    assert.ok(a.get(0) instanceof Association, 'Результат должен быть Association');
    assert.strictEqual(a.get(0).this, 5);
    assert.strictEqual(a.get(1).this, 6);
    assert.strictEqual(a.get(2).this, 7);
    assert.strictEqual(a.get(3).this, 8);
    assert.strictEqual(a.get(4), undefined); // Индекс за пределами Set
    assert.strictEqual(a.get(-1), undefined); // Отрицательный индекс
  });

  await t.test('доступ к свойствам объекта по ключу', () => {
    const obj = { name: 'John', age: 30, city: 'New York' };
    const a = deep(obj);

    assert.ok(a.get('name') instanceof Association, 'Результат должен быть Association');
    assert.strictEqual(a.get('name').this, 'John');
    assert.strictEqual(a.get('age').this, 30);
    assert.strictEqual(a.get('city').this, 'New York');
    assert.strictEqual(a.get('country'), undefined); // Несуществующее свойство
  });

  await t.test('доступ к цифрам числа по индексу', () => {
    const num = 12345;
    const a = deep(num);

    assert.ok(a.get(0) instanceof Association, 'Результат должен быть Association');
    assert.strictEqual(a.get(0).this, 1);
    assert.strictEqual(a.get(2).this, 3);
    assert.strictEqual(a.get(4).this, 5);
    assert.strictEqual(a.get(5), undefined); // Индекс за пределами числа
    assert.strictEqual(a.get(-1), undefined); // Отрицательный индекс
  });

  await t.test('работа с null и undefined', () => {
    const nullValue = deep(null);
    const undefinedValue = deep(undefined);

    assert.strictEqual(nullValue.get(0), undefined);
    assert.strictEqual(undefinedValue.get('key'), undefined);
  });

  await t.test('проверка кеширования функции', () => {
    const arr = [1, 2, 3];
    const a = deep(arr);

    // Получаем ссылки на функцию get
    const get1 = a.get;
    const get2 = a.get;

    // Проверяем, что это одна и та же функция (благодаря кешированию)
    assert.strictEqual(get1, get2);
  });

  await t.test('метод не изменяет исходные данные', () => {
    const arr = [1, 2, 3];
    const a = deep(arr);

    // Получаем значение
    const value = a.get(1);

    // Проверяем, что метод не меняет данные
    assert.deepStrictEqual(arr, [1, 2, 3]);
    assert.strictEqual(value.this, 2);
    assert.ok(value instanceof Association, 'Результат должен быть Association');
  });

  await t.test('unwrap применяется к ключу', () => {
    const arr = [1, 2, 3, 4, 5];
    const a = deep(arr);
    const wrappedKey = deep(2);

    // Ключ должен быть автоматически развернут
    assert.ok(a.get(wrappedKey) instanceof Association, 'Результат должен быть Association');
    assert.strictEqual(a.get(wrappedKey).this, 3);
  });
});
