import assert from "node:assert";
import { test } from "node:test";
import { Deep } from './deep';

test('new Deep()', () => {
  const deep = new Deep();
  assert.equal(deep.name, 'deep');
});

test('value = Symbol', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = Symbol();
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = undefined', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = undefined;
  v.value = value;
  assert(v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 1);
});

test('value = Promise', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = new Promise(res => res(undefined));
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = Boolean', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = true;
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  const v2 = deep.new();
  v2.value = true;
  const _v2 = v2.value;
  assert(_v2 == _v);
  assert(_v2.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 3);
});

test('value = String', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = 'abc';
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = Number', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = 123;
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = BigInt', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = BigInt(123);
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = Set', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = new Set();
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = WeakSet', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = new WeakSet();
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = Map', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = new Map();
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = WeakMap', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = new WeakMap();
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = Array', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = [];
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = Object', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = {};
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = Function', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const v = deep.new();
  const value = () => {};
  v.value = value;
  const _v = v.value;
  assert(_v instanceof Deep);
  assert(_v.value === value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('value = deep', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const c = deep.new();
  const v = deep.new();
  assert.throws(() => {
    c.value = v;
  });
  assert.equal(deep.memory.all.size - prevAllSize, 2);
});

test('.value .valued', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const a = deep.wrap("abc");
  const b = deep.new("abc");
  const c = deep.wrap("abc");
  assert.equal(deep.memory.all.size - prevAllSize, 2);
  assert.equal(a, b.value);
  assert.equal(deep.memory.all.size - prevAllSize, 2);
  assert.equal(a, c);
  assert.equal(a.value, "abc");
  assert.equal(a.valued.size, 1);
  assert.equal(deep.new(a.valued).first, b);
});

test('.type .typed .from .out .to .in .value', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const A = deep.new();
  const B = deep.new();
  B.from = A; B.to = A;
  const a = deep.new(); a.type = A;
  const b = deep.new(); b.type = B;
  b.from = a; b.to = a;
  assert.equal(A.type, deep);
  assert.equal(A.from, undefined);
  assert.equal(A.to, undefined);
  assert.equal(A.value, undefined);
  assert.equal(B.type, deep);
  assert.equal(B.from, A);
  assert.equal(B.to, A);
  assert.equal(B.value, undefined);
  assert.equal(a.type, A);
  assert.equal(a.from, undefined);
  assert.equal(a.to, undefined);
  assert.equal(a.value, undefined);
  assert.equal(b.type, B);
  assert.equal(b.from, a);
  assert.equal(b.to, a);
  assert.equal(b.value, undefined);
});

test('._is', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  assert.equal(deep._is(Symbol()), deep.contains.Symbol);
  assert.equal(deep._is(undefined), deep.contains.Undefined);
  assert.equal(deep._is(new Promise(res => res(undefined))), deep.contains.Promise);
  assert.equal(deep._is(true), deep.contains.Boolean);
  assert.equal(deep._is('abc'), deep.contains.String);
  assert.equal(deep._is(123), deep.contains.Number);
  assert.equal(deep._is(BigInt(123)), deep.contains.BigInt);
  assert.equal(deep._is(new Set()), deep.contains.Set);
  assert.equal(deep._is(new WeakSet()), deep.contains.WeakSet);
  assert.equal(deep._is(new Map()), deep.contains.Map);
  assert.equal(deep._is(new WeakMap()), deep.contains.WeakMap);
  assert.equal(deep._is([]), deep.contains.Array);
  assert.equal(deep._is({}), deep.contains.Object);
  assert.equal(deep._is(() => {}), deep.contains.Function);
});

test('.is', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  assert.equal(deep.is(Symbol()), deep.contains.Symbol);
  assert.equal(deep.is(undefined), deep.contains.Undefined);
  assert.equal(deep.is(new Promise(res => res(undefined))), deep.contains.Promise);
  assert.equal(deep.is(true), deep.contains.Boolean);
  assert.equal(deep.is('abc'), deep.contains.String);
  assert.equal(deep.is(123), deep.contains.Number);
  assert.equal(deep.is(BigInt(123)), deep.contains.BigInt);
  assert.equal(deep.is(new Set()), deep.contains.Set);
  assert.equal(deep.is(new WeakSet()), deep.contains.WeakSet);
  assert.equal(deep.is(new Map()), deep.contains.Map);
  assert.equal(deep.is(new WeakMap()), deep.contains.WeakMap);
  assert.equal(deep.is([]), deep.contains.Array);
  assert.equal(deep.is({}), deep.contains.Object);
  assert.equal(deep.is(() => {}), deep.contains.Function);
});

test(`Symbol methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = Symbol();
  const d = deep.new();
  d.value = value;
  assert.equal(d.has(value), true);
  assert.equal(d.has(Symbol()), false);

  assert.equal(d.get(value), value);
  assert.equal(d.size, 1);
  assert.deepEqual(d.map(v => v), [value]);
  assert.equal(d.add(value), value);
  assert.equal(d.set(value, value), d);
  assert.equal(d.unset(value), false);
  assert.deepEqual(d.keys, []);
  assert.deepEqual(d.values, [value]);
  assert.equal(d.find(v => v === value), value);
  assert.deepEqual(d.filter(v => v === value), [value]);
  assert.equal(d.each(v => v), undefined);
});

test(`String methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = 'abc';
  const d = deep.new();
  d.value = value;
  assert.equal(d.has(value), true);
  assert.equal(d.has('def'), false);

  assert.equal(d.get(value), value);
  assert.equal(d.size, 3);
  assert.deepEqual(d.map(v => v), [value]);
  assert.equal(d.add(value), value);
  assert.equal(d.set(value, value), d);
  assert.equal(d.unset(value), false);
  assert.deepEqual(d.keys, []);
  assert.deepEqual(d.values, [value]);
  assert.equal(d.find(v => v === value), value);
  assert.deepEqual(d.filter(v => v === value), [value]);
  assert.equal(d.each(v => v), undefined);
});

test(`Number methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = 123;
  const d = deep.new();
  d.value = value;
  assert.equal(d.has(value), true);
  assert.equal(d.has(234), false);

  assert.equal(d.get(value), value);
  assert.equal(d.size, 3);
  assert.deepEqual(d.map(v => v), [value]);
  assert.equal(d.add(value), value);
  assert.equal(d.set(value, value), d);
  assert.equal(d.unset(value), false);
  assert.deepEqual(d.keys, []);
  assert.deepEqual(d.values, [value]);
  assert.equal(d.find(v => v === value), value);
  assert.deepEqual(d.filter(v => v === value), [value]);
  assert.equal(d.each(v => v), undefined);
});

test(`BigInt methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = BigInt(123); 
  const d = deep.new();
  d.value = value;
  assert.equal(d.has(value), true);
  assert.equal(d.has(BigInt(234)), false);

  assert.equal(d.get(value), value);
  assert.equal(d.size, 3);
  assert.deepEqual(d.map(v => v), [value]);
  assert.equal(d.add(value), value);
  assert.equal(d.set(value, value), d);
  assert.equal(d.unset(value), false);
  assert.deepEqual(d.keys, []);
  assert.deepEqual(d.values, [value]);
  assert.equal(d.find(v => v === value), value);
  assert.deepEqual(d.filter(v => v === value), [value]);
  assert.equal(d.each(v => v), undefined);
});

test(`Set methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = new Set([1,2,3]);
  const d = deep.new();
  d.value = value;
  assert.equal(d.has(2), true);
  assert.equal(d.has(4), false);

  assert.equal(d.get(2), 2);
  assert.equal(d.get(4), undefined);

  assert.equal(d.size, 3);
  assert.deepEqual(d.map(v => v), [1,2,3]);

  assert.equal(d.add(4), true);
  assert.equal(d.get(4), 4);

  assert.equal(d.set(5, 5), d);
  assert.throws(() => {
    d.set(5, 6);
  })

  assert.equal(d.has(5), true);
  assert.equal(d.unset(5), true);
  assert.equal(d.get(5), undefined);
  assert.equal(d.unset(6), false);

  assert.deepEqual(d.keys, [1,2,3,4]);
  assert.deepEqual(d.values, [1,2,3,4]);
  assert.equal(d.find(v => v === 3), 3);
  assert.deepEqual(d.filter(v => v === 3), [3]);
  assert.equal(d.each(v => v), undefined);
});

test.skip(`WeakSet methods`, () => {});

test(`Map methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = new Map([['a',1],['b',2],['c',3]]);
  const d = deep.new();
  d.value = value;
  assert.equal(d.has('b'), true);
  assert.equal(d.has('d'), false);

  assert.equal(d.get('b'), 2);
  assert.equal(d.get('d'), undefined);

  assert.equal(d.size, 3);
  assert.deepEqual(d.map(v => v), [1,2,3]);

  assert.equal(d.add(4), true);
  assert.equal(d.get(4), 4);
  
  assert.equal(d.set('d', 5), d);
  assert.equal(d.get('d'), 5);
  assert.equal(d.size, 5);

  assert.equal(d.has('d'), true);
  assert.equal(d.unset('d'), true);
  assert.equal(d.get('d'), undefined);
  assert.equal(d.unset('d'), false);

  assert.deepEqual(d.keys, ['a','b','c',4]);
  assert.deepEqual(d.values, [1,2,3,4]);
  assert.equal(d.find(v => v === 3), 3);
  assert.deepEqual(d.filter((v,k) => d.deep.contains.isString.call(k)), [1,2,3]);
  assert.equal(d.each(v => v), undefined);
});

test.skip(`WeakMap methods`, () => {});

test(`Array methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = ['a','b','c']
  const d = deep.new();
  d.value = value;
  assert.equal(d.has(1), true);
  assert.equal(d.has(3), false);

  assert.equal(d.get(1), 'b');
  assert.equal(d.get(3), undefined);

  assert.equal(d.size, 3);
  assert.deepEqual(d.map(v => v), ['a','b','c']);

  assert.equal(d.add(4), 3);
  assert.equal(d.get(3), 4);
  
  assert.equal(d.set(3, 5), d);
  assert.equal(d.get(3), 5);
  assert.equal(d.size, 4);

  assert.equal(d.has(3), true);
  assert.equal(d.unset(3), true);
  assert.equal(d.get(3), undefined);
  assert.equal(d.unset(3), false);

  assert.deepEqual(d.keys, [0,1,2]);
  assert.deepEqual(d.values, ['a','b','c']);
  assert.equal(d.find((v,k) => k === 2), 'c');
  assert.deepEqual(d.filter((v,k) => k >= 1), ['b','c']);
  assert.equal(d.each(v => v), undefined);
});

test(`Object methods`, () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const value = { a: 1, b: 2, c: 3 };
  const d = deep.new();
  d.value = value;
  assert.equal(d.has('b'), true);
  assert.equal(d.has('d'), false);

  assert.equal(d.get('b'), 2);
  assert.equal(d.get('d'), undefined);

  assert.equal(d.size, 3);
  assert.deepEqual(d.map(v => v), [1,2,3]);

  const k4 = d.add(4);
  assert.equal(d.get(k4), 4);
  
  assert.equal(d.set('d', 5), d);
  assert.equal(d.get('d'), 5);
  assert.equal(d.size, 5);

  assert.equal(d.has('d'), true);
  assert.equal(d.unset('d'), true);
  assert.equal(d.get('d'), undefined);
  assert.equal(d.unset('d'), false);

  assert.deepEqual(d.keys, ['a','b','c',k4]);
  assert.deepEqual(d.values, [1,2,3,4]);
  assert.equal(d.find(v => v === 3), 3);
  assert.deepEqual(d.filter((v,k) => k.length > 1), [4]);
  assert.equal(d.each(v => v), undefined);
});

test('id', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  const a = deep.new();
  const agent = deep.new();
  const aId = a.id(); // new random id
  const _aId = a.id(); // equal
  assert.equal(aId, _aId);
  const aId2 = a.id('a1'); // strict id
  const aId3 = a.id('a2', agent); // strict id with agency
  assert.equal(a.id(), aId);
  assert.equal(a.ids.size, 3);
});

test('select type, type.type', () => {
  const deep = new Deep();
  const A = deep.new();
  const B = deep.new();
  const selection1 = deep.select({ type: A });
  const relations1 = selection1.out;
  assert.equal(relations1.size, 1);
  let counter = 0;
  selection1.on(() => {
    counter++;
  });
  assert.equal(selection1.call().size, 0);
  const a1 = A.new();
  assert.equal(selection1.call().size, 1);
  assert.equal(counter, 2);
  const a2 = A.new();
  assert.equal(selection1.call().size, 2);
  assert.equal(counter, 4);
  a1.kill();
  assert.equal(selection1.call().size, 1);
  assert.equal(counter, 5);
  a2.kill();
  assert.equal(selection1.call().size, 0);
  assert.equal(counter, 6);
});

test('select from.type to.type', () => {
  const deep = new Deep();
  const A = deep.new();
  const B = deep.new();
  B.from = A; B.to = A;
  const C = deep.new();
  C.from = A; C.to = B;
  assert.equal(deep.contains.type.typed.size, 0);
  assert.equal(deep.contains.from.typed.size, 0);
  assert.equal(deep.contains.to.typed.size, 0);
  const selection = deep.select({ from: { type: A }, to: { type: B } });
  assert.equal(deep.contains.type.typed.size, 2);
  assert.equal(deep.contains.from.typed.size, 1);
  assert.equal(deep.contains.to.typed.size, 1);
  let result = selection.call();
  let outerCounter = 0;
  selection.on(() => {
    outerCounter++;
    result = selection.call();
  });
  const relations1 = selection.out;
  assert.equal(relations1.size, 2);
  let innerRelationsCounter = 0;
  relations1.each(r => r.on(() => {
    innerRelationsCounter++;
  }))
  assert.equal(outerCounter, 0);
  assert.equal(innerRelationsCounter, 0);
  assert.equal(result.size, 0);
  const a = A.new();
  assert.equal(innerRelationsCounter, 2);
  assert.equal(outerCounter, 2);
  assert.equal(result.size, 0);
  const b = B.new();
  assert.equal(innerRelationsCounter, 4);
  assert.equal(outerCounter, 4);
  assert.equal(result.size, 0);
  const c = C.new();
  assert.equal(innerRelationsCounter, 4);
  assert.equal(result.size, 0);
  assert.equal(outerCounter, 4);
  c.from = a;
  assert.equal(innerRelationsCounter, 5);
  assert.equal(result.size, 0);
  c.to = b;
  assert.equal(innerRelationsCounter, 6);
  assert.equal(result.size, 1);
  assert.equal(outerCounter, 7);
});

test('select result changes', () => {
  const deep = new Deep();
  const A = deep.new();
  const B = deep.new();
  const b = B.new();
  const selection = deep.select({ type: B });
  assert.equal(selection.to.size, 1);
  let outerCounter = 0;
  selection.on(() => {
    outerCounter++;
  });
  b.from = A; b.to = A;
  assert.equal(outerCounter, 2);
});

// test('watch symbol', () => {
//   const deep = new Deep();
//   const prevAllSize = deep.memory.all.size;
//   const a = deep.wrap(Symbol());
// });

// test('subscribe', () => {
//   const deep = new Deep();
//   const A = deep.new();
//   const B = deep.new();
//   const potetial1 = deep.subscribe({
//     type: B,
//   });
//   const a = A.new();
//   const potetial2 = deep.subscribe({
//     type: B, from: a,
//   });
//   const potetial3 = deep.subscribe({
//     type: B, from: a, to: a,
//   });
//   const b = B.new();
//   b.from = a;
//   b.to = a;
// });
