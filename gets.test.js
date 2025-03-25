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
});

test('filter для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const array = [1, 2, 3, 4, 5];
    const result = deep(array).filter(x => x % 2 === 0);
    assert.deepStrictEqual(result, [2, 4]);
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = deep(obj).filter(x => x % 2 === 0);
    assert.deepStrictEqual(result, [2, 4]);
  });

  await t.test('Для строки', () => {
    const str = 'abcde';
    const result = deep(str).filter(x => ['a', 'e'].includes(x));
    assert.deepStrictEqual(result, ['a', 'e']);
  });
});

test('reduce для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    const array = [1, 2, 3, 4];
    const result = deep(array).reduce((acc, x) => acc + x, 0);
    assert.strictEqual(result, 10);
  });

  await t.test('Для объекта', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = deep(obj).reduce((acc, x) => acc + x, 0);
    assert.strictEqual(result, 6);
  });

  await t.test('Для строки', () => {
    const str = 'abc';
    const result = deep(str).reduce((acc, x) => acc + x.toUpperCase(), '');
    assert.strictEqual(result, 'ABC');
  });

  await t.test('Без initial value', () => {
    const array = [1, 2, 3, 4];
    const result = deep(array).reduce((acc, x) => acc + x);
    assert.strictEqual(result, 10);
  });
});

test('every для разных типов данных', async (t) => {
  await t.test('Для массива', () => {
    assert.strictEqual(deep([2, 4, 6]).every(x => x % 2 === 0), true);
    assert.strictEqual(deep([2, 3, 6]).every(x => x % 2 === 0), false);
  });

  await t.test('Для объекта', () => {
    assert.strictEqual(deep({ a: 2, b: 4 }).every(x => x % 2 === 0), true);
    assert.strictEqual(deep({ a: 2, b: 3 }).every(x => x % 2 === 0), false);
  });

  await t.test('Для строки', () => {
    assert.strictEqual(deep('abc').every(x => /[a-z]/.test(x)), true);
    assert.strictEqual(deep('ab1').every(x => /[a-z]/.test(x)), false);
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
    assert.strictEqual(deep([1, 2, 3]).join(), '1,2,3');
    assert.strictEqual(deep([1, 2, 3]).join('-'), '1-2-3');
  });

  await t.test('join для объекта', () => {
    // Порядок ключей в объектах может быть разным, поэтому проверяем по-другому
    const joined = deep({ a: 1, b: 2 }).join('-');
    assert.ok(joined === '1-2' || joined === '2-1');
  });

  await t.test('join для строки', () => {
    assert.strictEqual(deep('abc').join(), 'a,b,c');
    assert.strictEqual(deep('abc').join('-'), 'a-b-c');
  });
});
