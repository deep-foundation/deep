/**
 * Тесты для sets.js
 */
import test from 'node:test';
import assert from 'node:assert';
import { deep } from './index.js';

test('set method', async (t) => {
  await t.test('array', () => {
    const arr = deep([1, 2, 3]);
    arr.set(1, 4);
    assert.deepStrictEqual(arr.this, [1, 4, 3]);
  });

  await t.test('map', () => {
    const map = deep(new Map([['a', 1]]));
    map.set('b', 2);
    assert.deepStrictEqual(Array.from(map.this.entries()), [['a', 1], ['b', 2]]);
  });

  await t.test('set', () => {
    const set = deep(new Set([1, 2]));
    set.set('ignored', 3); // ключ игнорируется
    assert.deepStrictEqual(Array.from(set.this), [1, 2, 3]);
  });

  await t.test('object', () => {
    const obj = deep({ a: 1 });
    obj.set('b', 2);
    assert.deepStrictEqual(obj.this, { a: 1, b: 2 });
  });

  await t.test('string', () => {
    const str = deep('abc');
    str.set(1, 'x');
    assert.strictEqual(str.this, 'axc');
  });

  await t.test('number', () => {
    const num = deep(123);
    num.set(1, '4');
    assert.strictEqual(num.this, 143);
  });

  await t.test('unsupported types', () => {
    const types = [
      true, // boolean
      null, // null
      undefined, // undefined
      Symbol(), // symbol
      BigInt(1), // bigint
      () => {} // function
    ];

    for (const value of types) {
      const ass = deep(value);
      assert.throws(
        () => ass.set(0, 'test'),
        { message: `unexpected type ${ass.detect}` }
      );
    }
  });

  await t.test('events', () => {
    const arr = deep([1, 2, 3]);
    let setEvent = null;
    let changeEvent = false;

    arr.on('set', (event, data) => {
      setEvent = data;
    });

    arr.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    arr.set(1, 4);

    assert.deepStrictEqual(setEvent, { key: 1, value: 4 });
    assert.deepStrictEqual(changeEvent, { data: { prev: [1, 4, 3], next: [1, 4, 3] }, method: { method: 'set', arguments: [1, 4] } });
  });

  await t.test('invalid indices', () => {
    const str = deep('abc');
    assert.throws(
      () => str.set(-1, 'x'),
      { message: 'Invalid index for string' }
    );

    const num = deep(123);
    assert.throws(
      () => num.set(3, '4'),
      { message: 'Invalid index for number' }
    );
  });
});

test('add method', async (t) => {
  await t.test('array', () => {
    const arr = deep([1, 2, 3]);
    arr.add(4);
    assert.deepStrictEqual(arr.this, [1, 2, 3, 4]);
  });

  await t.test('map', () => {
    const map = deep(new Map([['a', 1]]));
    map.add('b');
    assert.deepStrictEqual(Array.from(map.this.entries()), [['a', 1], ['b', 'b']]);
  });

  await t.test('set', () => {
    const set = deep(new Set([1, 2]));
    set.add(3);
    assert.deepStrictEqual(Array.from(set.this), [1, 2, 3]);
  });

  await t.test('object', () => {
    const obj = deep({ a: 1 });
    obj.add(2);
    assert.deepStrictEqual(obj.this, { a: 1, '1': 2 });
  });

  await t.test('unsupported types', () => {
    const types = [
      'abc', // string
      123, // number
      true, // boolean
      null, // null
      undefined, // undefined
      Symbol(), // symbol
      BigInt(1), // bigint
      () => {} // function
    ];

    for (const value of types) {
      const ass = deep(value);
      assert.throws(
        () => ass.add('test'),
        { message: `unexpected type ${ass.detect}` }
      );
    }
  });

  await t.test('events', () => {
    const arr = deep([1, 2, 3]);
    let addEvent = null;
    let changeEvent = null;

    arr.on('add', (event, data) => {
      addEvent = data;
    });

    arr.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    arr.add(4);

    assert.deepStrictEqual(addEvent, { value: 4 });
    assert.deepStrictEqual(changeEvent, {
      data: { prev: [1, 2, 3, 4], next: [1, 2, 3, 4] },
      method: { method: 'add', arguments: [4] }
    });
  });
});
