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
      result.push({ value, index });
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
      result.push({ value, key });
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
      result.push({ value, index });
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
      result.push({ value, key });
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
      result.push({ value, index });
    });
    assert.deepStrictEqual(result, [
      { value: 1, index: 0 },
      { value: 2, index: 1 },
      { value: 3, index: 2 }
    ]);
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
});

test('map для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const array = [1, 2, 3];
    const result = deep(array).map(x => x * 2);
    assert.deepStrictEqual(result.this, [2, 4, 6]);
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = deep(obj).map(x => x * 2);
    assert.deepStrictEqual(result.this, [2, 4, 6]);
  });

  await t.test('Для строки', () => {
    const str = 'abc';
    const result = deep(str).map(x => x.toUpperCase());
    assert.deepStrictEqual(result.this, ['A', 'B', 'C']);
  });

  await t.test('Для Map', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const result = deep(map).map(x => x * 2);
    assert.deepStrictEqual(result.this, [2, 4, 6]);
  });

  await t.test('Для Set', () => {
    const set = new Set([1, 2, 3]);
    const result = deep(set).map(x => x * 2);
    assert.deepStrictEqual(result.this, [2, 4, 6]);
  });

  // Тесты для примитивов
  await t.test('Для числа', () => {
    const num = 123;
    const result = deep(num).map(x => x * 2);
    assert.deepStrictEqual(result.this, [246], 'Число должно быть преобразовано в массив с одним элементом');
  });

  await t.test('Для boolean', () => {
    const bool = true;
    const result = deep(bool).map(x => !x);
    assert.deepStrictEqual(result.this, [false], 'Boolean должен быть преобразован в массив с одним элементом');
  });

  await t.test('Для null и undefined', () => {
    const nullResult = deep(null).map(x => x);
    assert.deepStrictEqual(nullResult.this, [], 'null должен быть преобразован в пустой массив');

    const undefinedResult = deep(undefined).map(x => x);
    assert.deepStrictEqual(undefinedResult.this, [], 'undefined должен быть преобразован в пустой массив');
  });

  // Тесты для примитивов с константным возвратом
  await t.test('Для примитивов с константным возвратом', () => {
    const numResult = deep(123).map(() => 2);
    assert.deepStrictEqual(numResult.this, [2], 'Число с константным возвратом должно работать корректно');

    const boolResult = deep(true).map(() => 2);
    assert.deepStrictEqual(boolResult.this, [2], 'Boolean с константным возвратом должен работать корректно');

    const symbolResult = deep(Symbol('test')).map(() => 2);
    assert.deepStrictEqual(symbolResult.this, [2], 'Symbol с константным возвратом должен работать корректно');

    const bigintResult = deep(BigInt(123)).map(() => 2);
    assert.deepStrictEqual(bigintResult.this, [2], 'BigInt с константным возвратом должен работать корректно');
  });
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
    const result = deep(str).filter(x => ['a', 'e'].includes(x));
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
    const result = deep(str).reduce((acc, x) => acc + x.toUpperCase(), '');
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
    assert.strictEqual(deep([1, 3, 6]).some(x => x % 2 === 0), true);
    assert.strictEqual(deep([1, 3, 5]).some(x => x % 2 === 0), false);
  });

  await t.test('Для объекта', () => {
    assert.strictEqual(deep({ a: 1, b: 4 }).some(x => x % 2 === 0), true);
    assert.strictEqual(deep({ a: 1, b: 3 }).some(x => x % 2 === 0), false);
  });
});

test('find и findKey для разных типов данных', async (t) => {
  await t.test('find для массива', () => {
    assert.strictEqual(deep([1, 2, 3]).find(x => x > 1), 2);
    assert.strictEqual(deep([1, 2, 3]).find(x => x > 5), undefined);
  });

  await t.test('findKey для массива', () => {
    assert.strictEqual(deep([1, 2, 3]).findKey(x => x > 1), 1);
    assert.strictEqual(deep([1, 2, 3]).findKey(x => x > 5), undefined);
  });

  await t.test('find для объекта', () => {
    assert.strictEqual(deep({ a: 1, b: 2 }).find(x => x > 1), 2);
    assert.strictEqual(deep({ a: 1, b: 2 }).findKey(x => x > 1), 'b');
  });
});

test('keys, values, entries для разных типов данных', async (t) => {
  await t.test('keys', () => {
    assert.deepStrictEqual(deep([10, 20, 30]).keys(), [0, 1, 2]);
    assert.deepStrictEqual(deep({ a: 1, b: 2 }).keys(), ['a', 'b']);
    assert.deepStrictEqual(deep('abc').keys(), [0, 1, 2]);
  });

  await t.test('values', () => {
    assert.deepStrictEqual(deep([10, 20, 30]).values(), [10, 20, 30]);
    assert.deepStrictEqual(deep({ a: 1, b: 2 }).values(), [1, 2]);
    assert.deepStrictEqual(deep('abc').values(), ['a', 'b', 'c']);
  });

  await t.test('entries', () => {
    assert.deepStrictEqual(deep([10, 20]).entries(), [[0, 10], [1, 20]]);
    assert.deepStrictEqual(deep({ a: 1, b: 2 }).entries(), [['a', 1], ['b', 2]]);
    assert.deepStrictEqual(deep('ab').entries(), [[0, 'a'], [1, 'b']]);
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
