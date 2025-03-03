import { Deep } from "./deep.js";
import test from 'node:test';
import assert from 'node:assert';

Deep.DEBUG = true;

test('methods', async (t) => {
  await t.test('has', async (t) => {
    await t.test('Symbol', () => {
      const deep = Deep.new(Symbol('test'));
      assert.strictEqual(deep.has('any'), false);
      assert.strictEqual(deep.has(deep.this), true);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.strictEqual(deep.has('any'), false);
      assert.strictEqual(deep.has(false), false);
      assert.strictEqual(deep.has(true), true);
    });

    await t.test('String', () => {
      const deep = Deep.new('hello');
      assert.strictEqual(deep.has(0), true);
      assert.strictEqual(deep.has(4), true);
      assert.strictEqual(deep.has(5), false);
      assert.strictEqual(deep.has(-1), false);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.strictEqual(deep.has(123), true);
      assert.strictEqual(deep.has(124), false);
      assert.strictEqual(deep.has(122), false);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.strictEqual(deep.has(123), true);
      assert.strictEqual(deep.has(124), false);
      assert.strictEqual(deep.has(122), false);
    });

    await t.test('Function', () => {
      const deep = Deep.new(() => { });
      assert.strictEqual(deep.has('any'), false);
      assert.strictEqual(deep.has(deep.this), true);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.strictEqual(deep.has('any'), false);
      assert.strictEqual(deep.has(null), true);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve();
      const deep = Deep.new(promise);
      assert.strictEqual(deep.has('any'), false);
      assert.strictEqual(deep.has(promise), true);
    });

    await t.test('Set', () => {
      const deep = Deep.new(new Set([1, 2, 3]));
      assert.strictEqual(deep.has(1), true);
      assert.strictEqual(deep.has(2), true);
      assert.strictEqual(deep.has(4), false);
    });

    await t.test('WeakSet', () => {
      const obj = {};
      const weakSet = new WeakSet([obj]);
      const deep = Deep.new(weakSet);
      assert.strictEqual(deep.has(obj), false);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      assert.strictEqual(deep.has('a'), true);
      assert.strictEqual(deep.has('b'), true);
      assert.strictEqual(deep.has('c'), false);
    });

    await t.test('WeakMap', () => {
      const obj = {};
      const weakMap = new WeakMap([[obj, 'value']]);
      const deep = Deep.new(weakMap);
      assert.strictEqual(deep.has(obj), false);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.strictEqual(deep.has(0), true);
      assert.strictEqual(deep.has(1), true);
      assert.strictEqual(deep.has(3), false);
      assert.strictEqual(deep.has(-1), false);
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      assert.strictEqual(deep.has('a'), true);
      assert.strictEqual(deep.has('b'), true);
      assert.strictEqual(deep.has('c'), false);
    });
  });

  await t.test('get', async (t) => {
    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      assert.strictEqual(deep.get('a'), 1);
      assert.strictEqual(deep.get('b'), 2);
      assert.strictEqual(deep.get('c'), undefined);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.strictEqual(deep.get(0), 1);
      assert.strictEqual(deep.get(1), 2);
      assert.strictEqual(deep.get(3), undefined);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      assert.strictEqual(deep.get('a'), 1);
      assert.strictEqual(deep.get('b'), 2);
      assert.strictEqual(deep.get('c'), undefined);
    });

    await t.test('String', () => {
      const str = 'hello';
      const deep = Deep.new(str);
      assert.strictEqual(deep.get(0), 'h');
      assert.strictEqual(deep.get(4), 'o');
      assert.strictEqual(deep.get(5), undefined);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.strictEqual(deep.get(1), 1);
      assert.strictEqual(deep.get(2), 2);
      assert.strictEqual(deep.get(3), 3);
      assert.strictEqual(deep.get(4), undefined);
    });
  });
  await t.test('size', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.strictEqual(deep.size, 1);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.strictEqual(deep.size, 1);
    });

    await t.test('String', () => {
      const str = 'hello';
      const deep = Deep.new(str);
      assert.strictEqual(deep.size, 5);
    });

    await t.test('Number', () => {
      const num = 123;
      const deep = Deep.new(num);
      assert.strictEqual(deep.size, 3);
    });

    await t.test('BigInt', () => {
      const big = BigInt(123);
      const deep = Deep.new(big);
      assert.strictEqual(deep.size, 3);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      assert.strictEqual(deep.size, 1);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.strictEqual(deep.size, 0);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve();
      const deep = Deep.new(promise);
      assert.strictEqual(deep.size, 0);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.strictEqual(deep.size, 3);
    });

    await t.test('WeakSet', () => {
      const weakSet = new WeakSet();
      const deep = Deep.new(weakSet);
      assert.strictEqual(deep.size, 0);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      assert.strictEqual(deep.size, 2);
    });

    await t.test('WeakMap', () => {
      const weakMap = new WeakMap();
      const deep = Deep.new(weakMap);
      assert.strictEqual(deep.size, 0);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.strictEqual(deep.size, 3);
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      assert.strictEqual(deep.size, 2);
    });
  });

  await t.test('map', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      const result = deep.map((v) => v);
      assert.deepStrictEqual(result, [symbol]);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      const resultTrue = deep.map((v) => !v);
      assert.deepStrictEqual(resultTrue, [false]);
      const resultFalse = deep.map((v) => v);
      assert.deepStrictEqual(resultFalse, [true]);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      const result = deep.map((v) => v * 2);
      assert.deepStrictEqual(result, [246]);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      const result = deep.map((v) => v + BigInt(1));
      assert.deepStrictEqual(result, [BigInt(124)]);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      const result = deep.map((v) => v() * 2);
      assert.deepStrictEqual(result, [84]);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      const result = deep.map((v) => v);
      assert.deepStrictEqual(result, [null]);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      const result = deep.map((v) => v);
      assert.deepStrictEqual(result, [promise]);
    });

    await t.test('WeakSet', () => {
      const weakSet = new WeakSet();
      const deep = Deep.new(weakSet);
      const result = deep.map((v) => v);
      assert.deepStrictEqual(result, []);
    });

    await t.test('WeakMap', () => {
      const weakMap = new WeakMap();
      const deep = Deep.new(weakMap);
      const result = deep.map((v) => v);
      assert.deepStrictEqual(result, []);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      const result = deep.map((v) => v * 2);
      assert.deepStrictEqual(result, [2, 4, 6]);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = deep.map((v) => v * 2);
      assert.deepStrictEqual(result, [2, 4, 6]);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      const result = deep.map((v, k) => v * 2);
      assert.deepStrictEqual(result, [2, 4]);
    });

    await t.test('String', () => {
      const str = 'abc';
      const deep = Deep.new(str);
      const result = deep.map((v) => v.toUpperCase());
      assert.deepStrictEqual(result, ['A', 'B', 'C']);
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      const result = deep.map((v) => v * 2);
      assert.deepStrictEqual(result, [2, 4]);
    });
  });

  await t.test('add', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.equal(deep.add(1), false);
      assert.equal(deep.add(symbol), false);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.equal(deep.add(true), false);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.equal(deep.add(234), false);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.equal(deep.add(BigInt(234)), false);
    });

    await t.test('Function', () => {
      const deep = Deep.new(() => { });
      assert.equal(deep.add(1), false);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.equal(deep.add(1), false);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const deep = Deep.new(Promise.resolve(42));
      assert.equal(deep.add(1), false);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = deep.add(4);
      assert.deepStrictEqual(Array.from(set), [1, 2, 3, 4]);
    });

    await t.test('WeakSet', () => {
      const weakSet = new WeakSet();
      const obj = {};
      const deep = Deep.new(weakSet);
      deep.add(obj);
      assert(weakSet.has(obj));
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1]]);
      const deep = Deep.new(map);
      const result = deep.add(2);
      assert.deepStrictEqual(Array.from(map), [['a', 1], [2, 2]]);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1]]);
      const deep = Deep.new(map);
      const result = deep.add(b);
      assert(map.get(b) == b);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      deep.add(4);
      assert.deepStrictEqual(arr, [1, 2, 3, 4]);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      const result = deep.add('d');
      assert.deepStrictEqual(result, false);
    });

    await t.test('Object', () => {
      const obj = { a: 1 };
      const deep = Deep.new(obj);
      const result = deep.add(2);
      assert.deepStrictEqual(obj, { a: 1, 2: 2 });
      assert.deepStrictEqual(result, true);
    });
  });

  await t.test('set', async (t) => {
    await t.test('Symbol', () => {
      const deep = Deep.new(Symbol('test'));
      const symbol = Symbol('test');
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.throws(() => deep.set('key', 1), {
        message: "Can't set into Set when key != value"
      });
    });

    await t.test('WeakSet', () => {
      const deep = Deep.new(new WeakSet());
      const weakSet = new WeakSet();
      assert.throws(() => deep.set('key', 1), {
        message: "Can't set into Set when key != value"
      });
      const obj = {};
      assert.equal(deep.set(obj, obj), true);
      assert.equal(weakSet.has(obj), false);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1]]);
      const deep = Deep.new(map);
      deep.set('b', 2);
      assert.deepStrictEqual(map.get('b'), 2);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1]]);
      const deep = Deep.new(map);
      deep.set(b, 2);
      assert.deepStrictEqual(map.get(b), 2);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      deep.set(1, 4);
      assert.deepStrictEqual(arr, [1, 4, 3]);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      assert.equal(deep.set('key', 1), false);
    });

    await t.test('Object', () => {
      const obj = { a: 1 };
      const deep = Deep.new(obj);
      deep.set('b', 2);
      assert.deepStrictEqual(obj, { a: 1, b: 2 });
    });
  });

  await t.test('unset', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.equal(deep.unset('key'), false);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.equal(deep.unset('key'), false);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.equal(deep.unset('key'), false);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.equal(deep.unset('key'), false);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      assert.equal(deep.unset('key'), false);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.equal(deep.unset('key'), false);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      assert.equal(deep.unset('key'), false);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.equal(deep.unset(1), true);
      assert.equal(set.has(1), false);
    });

    await t.test('WeakSet', () => {
      const obj = {};
      const weakSet = new WeakSet([obj]);
      const deep = Deep.new(weakSet);
      assert.equal(deep.unset(obj), true);
      assert.equal(weakSet.has(obj), false);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1]]);
      const deep = Deep.new(map);
      assert.equal(deep.unset('a'), true);
      assert.equal(map.has('a'), false);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const map = new WeakMap([[a, 1]]);
      const deep = Deep.new(map);
      assert.equal(deep.unset(a), true);
      assert.equal(map.has(a), false);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.equal(deep.unset(1), true);
      assert.deepStrictEqual(arr, [1, 3]);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      assert.equal(deep.unset('key'), false);
    });

    await t.test('Object', () => {
      const obj = { a: 1 };
      const deep = Deep.new(obj);
      assert.equal(deep.unset('a'), true);
      assert.deepStrictEqual(obj, {});
    });
  });

  await t.test('keys', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.deepStrictEqual(deep.keys(), [1, 2, 3]);
    });

    await t.test('WeakSet', () => {
      const obj = {};
      const weakSet = new WeakSet([obj]);
      const deep = Deep.new(weakSet);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      assert.deepStrictEqual(deep.keys(), ['a', 'b']);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      assert.deepStrictEqual(deep.keys(), []);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.deepStrictEqual(deep.keys(), [0, 1, 2]);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      assert.deepStrictEqual(deep.keys(), [0, 1, 2]);
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      assert.deepStrictEqual(deep.keys(), ['a', 'b']);
    });
  });

  await t.test('values', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.deepStrictEqual(deep.values(), [symbol]);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.deepStrictEqual(deep.values(), [true]);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.deepStrictEqual(deep.values(), [1, 2, 3]);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.deepStrictEqual(deep.values(), [BigInt(123)]);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      assert.deepStrictEqual(deep.values(), [func]);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.deepStrictEqual(deep.values(), [null]);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      assert.deepStrictEqual(deep.values(), [promise]);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.deepStrictEqual(deep.values(), [1, 2, 3]);
    });

    await t.test('WeakSet', () => {
      const obj = {};
      const weakSet = new WeakSet([obj]);
      const deep = Deep.new(weakSet);
      assert.deepStrictEqual(deep.values(), []);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      assert.deepStrictEqual(deep.values(), [1, 2]);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      assert.deepStrictEqual(deep.values(), []);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.deepStrictEqual(deep.values(), [1, 2, 3]);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      assert.deepStrictEqual(deep.values(), ['a', 'b', 'c']);
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      assert.deepStrictEqual(deep.values(), [1, 2]);
    });
  });

  await t.test('find', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.equal(deep.find(() => true), symbol);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.equal(deep.find(() => true), true);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.equal(deep.find(() => true), 123);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.equal(deep.find(() => true), BigInt(123));
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      assert.equal(deep.find(() => true), func);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.equal(deep.find(() => true), null);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      assert.equal(deep.find(() => true), promise);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.equal(deep.find(() => true), 3);
    });

    await t.test('WeakSet', () => {
      const obj = {};
      const weakSet = new WeakSet([obj]);
      const deep = Deep.new(weakSet);
      assert.equal(deep.find(() => true), undefined);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      assert.equal(deep.find(() => true), 2);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      assert.equal(deep.find(() => true), undefined);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.equal(deep.find(() => true), 1);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      assert.equal(deep.find(() => true), 'abc');
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      assert.equal(deep.find(() => true), 2);
    });
  });

  await t.test('filter', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.deepStrictEqual(deep.filter(), [symbol]);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      assert.deepStrictEqual(deep.filter(), [true]);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      assert.deepStrictEqual(deep.filter(), [123]);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      assert.deepStrictEqual(deep.filter(), [BigInt(123)]);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      assert.deepStrictEqual(deep.filter(), [func]);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      assert.deepStrictEqual(deep.filter(), [null]);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      assert.deepStrictEqual(deep.filter(), [promise]);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      assert.deepStrictEqual(deep.filter(), [1, 2, 3]);
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      assert.deepStrictEqual(deep.filter(), []);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      assert.deepStrictEqual(deep.filter(), [['a', 1], ['b', 2]]);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      assert.deepStrictEqual(deep.filter(), []);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      assert.deepStrictEqual(deep.filter(), [1, 2, 3]);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      assert.deepStrictEqual(deep.filter(), ['a', 'b', 'c']);
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      assert.deepStrictEqual(deep.filter(), [1, 2]);
    });
  });

  await t.test('each', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      let result = null;
      deep.each((v) => { result = v; });
      assert.equal(result, symbol);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      let result = null;
      deep.each((v) => { result = v; });
      assert.equal(result, true);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      let result = null;
      deep.each((v) => { result = v; });
      assert.equal(result, 123);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      let result = null;
      deep.each((v) => { result = v; });
      assert.equal(result, BigInt(123));
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      let result = null;
      deep.each((v) => { result = v; });
      assert.equal(result, func);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      let result = null;
      deep.each((v) => { result = v; });
      assert.equal(result, null);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      let result = null;
      deep.each((v) => { result = v; });
      assert.equal(result, promise);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = [];
      deep.each((v) => { result.push(v); });
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      let result = 0;
      deep.each(() => { result += 1; });
      assert.equal(result, 0);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      const result = [];
      deep.each((v) => { result.push(v); });
      assert.deepStrictEqual(result, [1, 2]);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      let result = 0;
      deep.each(() => { result += 1; });
      assert.equal(result, 0);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      const result = [];
      deep.each((v) => { result.push(v); });
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      const result = [];
      deep.each((v) => { result.push(v); });
      assert.deepStrictEqual(result, ['abc']);
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      const result = [];
      deep.each((v) => { result.push(v); });
      assert.deepStrictEqual(result, [1, 2]);
    });
  });

  await t.test('sort', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      assert.deepStrictEqual(deep.sort(), [symbol]);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      const result = deep.sort(() => 0);
      assert.deepStrictEqual(result, [true]);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      const result = deep.sort(() => 0);
      assert.deepStrictEqual(result, [123]);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      const result = deep.sort(() => 0);
      assert.deepStrictEqual(result, [BigInt(123)]);
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      const result = deep.sort(() => 0);
      assert.deepStrictEqual(result, [func]);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      const result = deep.sort(() => 0);
      assert.deepStrictEqual(result, [null]);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      const result = deep.sort(() => 0);
      assert.deepStrictEqual(result, [promise]);
    });

    await t.test('Set', () => {
      const set = new Set([3, 1, 2]);
      const deep = Deep.new(set);
      const result = deep.sort((a, b) => a - b);
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      const result = deep.sort(() => 0);
      assert.deepStrictEqual(result, []);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 3], ['b', 1], ['c', 2]]);
      const deep = Deep.new(map);
      const result = deep.sort((a, b) => a - b);
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      assert.deepStrictEqual(deep.sort(() => 0), []);
    });

    await t.test('Array', () => {
      const arr = [3, 1, 2];
      const deep = Deep.new(arr);
      const result = deep.sort((a, b) => a - b);
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    await t.test('String', () => {
      const str = 'cba';
      const deep = Deep.new(str);
      const result = deep.sort((a, b) => a.localeCompare(b));
      assert.deepStrictEqual(result, ['a', 'b', 'c']);
    });

    await t.test('Object', () => {
      const obj = { a: 3, b: 1, c: 2 };
      const deep = Deep.new(obj);
      const result = deep.sort((a, b) => a - b);
      assert.deepStrictEqual(result, [1, 2, 3]);
    });
  });

  await t.test('reduce', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      const result = deep.reduce((acc, cur) => acc + cur.toString(), '');
      assert.equal(result, symbol.toString());
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      const result = deep.reduce((acc, cur) => acc && cur, true);
      assert.equal(result, true);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      const result = deep.reduce((acc, cur) => acc + cur, 0);
      assert.equal(result, 123);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      const result = deep.reduce((acc, cur) => acc + cur, BigInt(0));
      assert.equal(result, BigInt(123));
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      const result = deep.reduce((acc, cur) => acc + cur(), 0);
      assert.equal(result, 42);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      const result = deep.reduce((acc, cur) => acc + (cur || 0), 0);
      assert.equal(result, 0);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      const result = deep.reduce((acc, cur) => [...acc, cur], []);
      assert.deepEqual(result, [promise]);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = deep.reduce((acc, cur) => acc + cur, 0);
      assert.equal(result, 6);
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      const result = deep.reduce((acc, cur) => acc + 1, 0);
      assert.equal(result, 0);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const deep = Deep.new(map);
      const result = deep.reduce((acc, cur) => acc + cur, 0);
      assert.equal(result, 6);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      const result = deep.reduce((acc, cur) => acc + 1, 0);
      assert.equal(result, 0);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      const result = deep.reduce((acc, cur) => acc + cur, 0);
      assert.equal(result, 6);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      const result = deep.reduce((acc, cur) => acc + cur, '');
      assert.equal(result, 'abc');
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const deep = Deep.new(obj);
      const result = deep.reduce((acc, cur) => acc + cur, 0);
      assert.equal(result, 6);
    });
  });

  await t.test('first', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      const result = deep.first;
      assert.equal(result.this, symbol);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      const result = deep.first;
      assert.equal(result.this, true);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      const result = deep.first;
      assert.equal(result.this, 123);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      const result = deep.first;
      assert.equal(result.this, BigInt(123));
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      const result = deep.first;
      assert.equal(result.this, func);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      const result = deep.first;
      assert.equal(result.this, null);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      const result = deep.first;
      assert.equal(result.this, promise);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = deep.first;
      assert.equal(result.this, 1);
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      const result = deep.first;
      assert.equal(result, undefined);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      const result = deep.first;
      assert.equal(result.this, 1);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      const result = deep.first;
      assert.equal(result, undefined);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      const result = deep.first;
      assert.equal(result.this, 1);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      const result = deep.first;
      assert.equal(result.this, 'a');
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      const result = deep.first;
      assert.equal(result.this, 1);
    });
  });

  await t.test('last', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      const result = deep.last;
      assert.equal(result.this, symbol);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      const result = deep.last;
      assert.equal(result.this, true);
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      const result = deep.last;
      assert.equal(result.this, 123);
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      const result = deep.last;
      assert.equal(result.this, BigInt(123));
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      const result = deep.last;
      assert.equal(result.this, func);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      const result = deep.last;
      assert.equal(result.this, null);
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      const result = deep.last;
      assert.equal(result.this, promise);
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = deep.last;
      assert.equal(result.this, 3);
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      const result = deep.last;
      assert.equal(result, undefined);
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      const result = deep.last;
      assert.equal(result.this, 2);
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      const result = deep.last;
      assert.equal(result, undefined);
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      const result = deep.last;
      assert.equal(result.this, 3);
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      const result = deep.last;
      assert.equal(result.this, 'c');
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      const result = deep.last;
      assert.equal(result.this, 2);
    });
  });

  await t.test('join', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      const result = deep.join();
      assert.equal(result, `Symbol(test)`);
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      const result = deep.join();
      assert.equal(result, 'true');
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      const result = deep.join();
      assert.equal(result, '123');
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      const result = deep.join();
      assert.equal(result, '123');
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      const result = deep.join();
      assert.equal(result, `() => 42`);
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      const result = deep.join();
      assert.equal(result, 'null');
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const deep = Deep.new(Promise.resolve(42));
      const result = deep.join();
      assert.equal(result, 'await');
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = deep.join();
      assert.equal(result, '1,2,3');
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      const result = deep.join();
      assert.equal(result, '');
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      const result = deep.join();
      assert.equal(result, '1,2');
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      const result = deep.join();
      assert.equal(result, '');
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      const result = deep.join();
      assert.equal(result, '1,2,3');
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      const result = deep.join();
      assert.equal(result, 'a,b,c');
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      const result = deep.join();
      assert.equal(result, '1,2');
    });
  });

  await t.test('toString', async (t) => {
    await t.test('Symbol', () => {
      const symbol = Symbol('test');
      const deep = Deep.new(symbol);
      const result = deep.toString();
      assert.equal(result, 'Symbol(test)');
    });

    await t.test('Boolean', () => {
      const deep = Deep.new(true);
      const result = deep.toString();
      assert.equal(result, 'true');
    });

    await t.test('Number', () => {
      const deep = Deep.new(123);
      const result = deep.toString();
      assert.equal(result, '123');
    });

    await t.test('BigInt', () => {
      const deep = Deep.new(BigInt(123));
      const result = deep.toString();
      assert.equal(result, '123');
    });

    await t.test('Function', () => {
      const func = () => 42;
      const deep = Deep.new(func);
      const result = deep.toString();
      assert.equal(result, '() => 42');
    });

    await t.test('Null', () => {
      const deep = Deep.new(null);
      const result = deep.toString();
      assert.equal(result, 'null');
    });

    await t.test('Undefined', () => {
      const deep = Deep.new(undefined);
      assert.strictEqual(deep, undefined);
    });

    await t.test('Promise', () => {
      const promise = Promise.resolve(42);
      const deep = Deep.new(promise);
      const result = deep.toString();
      assert.equal(result, '[object Promise]');
    });

    await t.test('Set', () => {
      const set = new Set([1, 2, 3]);
      const deep = Deep.new(set);
      const result = deep.toString();
      assert.equal(result, '[object Set]');
    });

    await t.test('WeakSet', () => {
      const obj1 = {};
      const obj2 = {};
      const weakSet = new WeakSet([obj1, obj2]);
      const deep = Deep.new(weakSet);
      const result = deep.toString();
      assert.equal(result, '[object WeakSet]');
    });

    await t.test('Map', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const deep = Deep.new(map);
      const result = deep.toString();
      assert.equal(result, '[object Map]');
    });

    await t.test('WeakMap', () => {
      const a = {};
      const b = {};
      const map = new WeakMap([[a, 1], [b, 2]]);
      const deep = Deep.new(map);
      const result = deep.toString();
      assert.equal(result, '[object WeakMap]');
    });

    await t.test('Array', () => {
      const arr = [1, 2, 3];
      const deep = Deep.new(arr);
      const result = deep.toString();
      assert.equal(result, '1,2,3');
    });

    await t.test('String', () => {
      const deep = Deep.new('abc');
      const result = deep.toString();
      assert.equal(result, 'abc');
    });

    await t.test('Object', () => {
      const obj = { a: 1, b: 2 };
      const deep = Deep.new(obj);
      const result = deep.toString();
      assert.equal(result, '[object Object]');
    });
  });
});
