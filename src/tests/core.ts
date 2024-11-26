import assert from "node:assert";
import { test } from "node:test";
import { Deep, DeepEvent } from '../deep.js';
import benchmarks from "../benchmark.js";

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
  assert.equal(d.get(Symbol()), undefined);

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
  assert.equal(d.get('def'), undefined);

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
  assert.equal(d.get(234), undefined);

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
  assert.equal(d.get(BigInt(234)), undefined);

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

test('getById', () => {
  const deep = new Deep();
  const agent = deep.new();

  // Create multiple entities with IDs
  const a = deep.new();
  const b = deep.new();
  const c = deep.new();

  const aId = a.id('entity-a');
  const bId = b.id('entity-b');
  const cId = c.id('entity-c', agent); // ID с другим агентом

  // Проверяем что можем найти сущности по их ID
  assert.equal(deep.getById('entity-a'), a);
  assert.equal(deep.getById('entity-b'), b);
  assert.equal(deep.getById('entity-c', agent), c);

  // Проверяем что получаем undefined для несуществующего ID
  assert.equal(deep.getById('non-existent'), undefined);
  
  // Проверяем что не находим сущность если агент не совпадает
  assert.equal(deep.getById('entity-c'), undefined);
  assert.equal(deep.getById('entity-a', agent), undefined);
});

test('not operator', () => {
  const deep = new Deep();
  const prevAllSize = deep.memory.all.size;
  
  const a = deep.new();
  const b = deep.new();
  const c = deep.new();
  
  a.type = b;
  b.type = c;
  c.type = c;
  c.to = a;
  
  // Проверяем базовый not
  const notB = deep.select({ not: { type: b } });
  assert.equal(notB.call().has(a), false);
  assert.equal(notB.call().has(b), true);
  assert.equal(notB.call().has(c), true);
  
  // Проверяем композицию not с другими условиями
  const notBAndTypeC = deep.select({
    not: { type: b },
    to: a,
  });
  assert.equal(notBAndTypeC.call().has(a), false);
  assert.equal(notBAndTypeC.call().has(b), false);
  assert.equal(notBAndTypeC.call().has(c), true);
});

test('and operator', () => {
  const deep = new Deep();
  
  const a = deep.new();
  const b = deep.new();
  const c = deep.new();
  const d = deep.new();
  
  a.type = b;
  b.type = c;
  c.type = b;
  c.to = a;
  d.to = a;
  
  // Проверяем and с массивом условий
  const andMultiple = deep.select({ 
    and: [
      { type: b },
      { to: a }
    ] 
  });
  assert.equal(andMultiple.call().has(a), false);
  assert.equal(andMultiple.call().has(b), false);
  assert.equal(andMultiple.call().has(c), true);
  assert.equal(andMultiple.call().has(d), false);
  
  // Проверяем and с тремя условиями
  const andThree = deep.select({
    and: [
      { type: b },
      { to: a },
      { type: { type: c } }
    ]
  });
  assert.equal(andThree.call().has(a), false);
  assert.equal(andThree.call().has(b), false);
  assert.equal(andThree.call().has(c), true);
  assert.equal(andThree.call().has(d), false);
  
  // Проверяем что and выбрасывает ошибку если не массив
  assert.throws(() => {
    deep.select({ and: { type: b } });
  });
});

test('or operator', () => {
  const deep = new Deep();
  
  // Create test instances
  const Type1 = deep.new();
  const Type2 = deep.new();
  const instance1 = Type1.new();
  const instance2 = Type1.new();
  const instance3 = Type1.new();

  // Test or operator
  const orQuery = deep.select({
    or: [
      { type: Type1 },
      { type: Type2 }
    ]
  });

  const result = orQuery.call();
  assert(result.has(instance1));
  assert(result.has(instance2));
  assert(result.has(instance3));
  assert.equal(result.size, 3);
});

test('association events order', () => {
  const deep = new Deep();
  const events: DeepEvent[] = [];
  
  // Create an association
  const association = deep.new();
  association.on((event) => {
    events.push(event);
  });

  // Create nodes to use in the association
  const from = deep.new();
  const to = deep.new();
  const type = deep.new();
  const value = 'test-value';

  // Change all properties and verify events
  association.type = type;
  association.from = from;
  association.to = to;
  association.value = value;

  // Verify events occurred in correct order
  assert.equal(events.length, 4);

  // Check type event
  assert.equal(events[0].name, 'change');
  assert.equal(events[0].prev.type, deep);
  assert.equal(events[0].next.type, type);

  // Check from event
  assert.equal(events[1].name, 'change');
  assert.equal(events[1].prev.from, undefined);
  assert.equal(events[1].next.from, from);

  // Check to event
  assert.equal(events[2].name, 'change');
  assert.equal(events[2].prev.to, undefined);
  assert.equal(events[2].next.to, to);

  // Check value event
  assert.equal(events[3].name, 'change');
  assert.equal(events[3].prev.value, undefined);
  assert.equal(events[3].next.value, value);

  // Change values in reverse order
  events.length = 0; // Clear events array
  
  association.value = 'new-value';
  association.to = deep.new();
  association.from = deep.new();
  association.type = deep.new();

  // Verify events occurred in correct order for changes
  assert.equal(events.length, 4);
  
  // Check value event
  assert.equal(events[0].name, 'change');
  assert.equal(events[0].prev.value, value);
  assert.equal(events[0].next.value, 'new-value');

  // Check to event
  assert.equal(events[1].name, 'change');
  assert.equal(events[1].prev.to, to);
  assert(events[1].next.to instanceof Deep);

  // Check from event
  assert.equal(events[2].name, 'change');
  assert.equal(events[2].prev.from, from);
  assert(events[2].next.from instanceof Deep);

  // Check type event
  assert.equal(events[3].name, 'change');
  assert.equal(events[3].prev.type, type);
  assert(events[3].next.type instanceof Deep);

  // Check that deep reference is present in all events
  for (const event of events) {
    assert(event.deep instanceof Deep, 'Event should have reference to Deep instance');
    assert.equal(event.deep, association, 'Event deep should reference the association');
  }
});

test('inof and outof with multiple types', () => {
  const deep = new Deep();
  
  // Create types
  const A = deep.new();
  const B = deep.new();
  const C = deep.new();

  // Create instance a of type A
  const a = A.new();

  // Create 2 instances of B connected to a
  const b1 = B.new();
  const b2 = B.new();

  // Create 3 instances of C connected to a
  const c1 = C.new();
  const c2 = C.new();
  const c3 = C.new();

  // Create links from a to B instances
  const link1 = deep.new();
  link1.from = a;
  link1.to = b1;
  link1.type = B;

  const link2 = deep.new();
  link2.from = a;
  link2.to = b2;
  link2.type = B;

  // Create links from a to C instances
  const link3 = deep.new();
  link3.from = a;
  link3.to = c1;
  link3.type = C;

  const link4 = deep.new();
  link4.from = a;
  link4.to = c2;
  link4.type = C;

  const link5 = deep.new();
  link5.from = a;
  link5.to = c3;
  link5.type = C;

  // Test inof and outof
  const bLinks = a.outof(B);
  assert(bLinks instanceof Deep);
  assert.equal(bLinks.size, 2);

  const cLinks = a.outof(C);
  assert(cLinks instanceof Deep);
  assert.equal(cLinks.size, 3);

  // Test total in and out
  const allOut = a.out;
  assert(allOut instanceof Deep);
  assert.equal(allOut.size, 5);
});

test('collection getters (types, froms, tos, typeds, outs, ins)', () => {
  const deep = new Deep();

  // Create test instances
  const Type1 = deep.new();
  const Type2 = deep.new();
  const instance1 = deep.new();
  const instance2 = deep.new();
  const instance3 = deep.new();

  // Set up relationships
  instance1.type = Type1;
  instance2.type = Type2;
  instance3.type = Type1;

  instance1.from = instance2;
  instance2.to = instance3;
  instance3.from = instance1;

  // Create a collection to test the getters
  const instances = deep.wrap([instance1, instance2, instance3]);
  const typing = deep.wrap([Type1, Type2]);

  // Test types getter
  const types = instances.types;
  assert(types.has(Type1));
  assert(types.has(Type2));
  assert.equal(types.size, 2);

  // Test froms getter
  const froms = instances.froms;
  assert(froms.call instanceof Set);
  assert(froms.has(instance2));
  assert(froms.has(instance1));
  assert.equal(froms.size, 2);

  // Test tos getter
  const tos = instances.tos;
  assert(tos.call instanceof Set);
  assert(tos.has(instance3));
  assert.equal(tos.size, 1);

  // Test typeds getter
  const typeds = typing.typeds;
  assert(typeds.call instanceof Set);
  assert(typeds.has(instance1));
  assert(typeds.has(instance2));
  assert(typeds.has(instance3));
  assert.equal(typeds.size, 3);

  // Test outs getter
  const outs = instances.outs;
  assert(outs.call instanceof Set);
  for (const deep of instances) {
    for (const out of deep.out) {
      assert(outs.has(out));
    }
  }

  // Test ins getter
  const ins = instances.ins;
  assert(ins.call instanceof Set);
  for (const deep of instances) {
    for (const inRef of deep.in) {
      assert(ins.has(inRef));
    }
  }
});

test('go method', () => {
  const deep = new Deep();
  
  const a = deep.new();
  deep.contains.a = a;
  const b = deep.new();
  a.contains.b = b;
  const c = deep.new();
  b.contains.c = c;
  
  assert.equal(deep.go('a', 'b', 'c'), c);
  assert.equal(deep.go('a', 'b'), b);
  assert.equal(deep.go('a'), a);
  
  assert.equal(deep.go('x'), undefined);
  assert.equal(deep.go('a', 'x'), undefined);
  assert.equal(deep.go('a', 'b', 'x'), undefined);
});

test('path method', () => {
  const deep = new Deep();

  const a = deep.new();
  deep.contains.a = a;
  const b = deep.new();
  a.contains.b = b;
  const c = deep.new();
  b.contains.c = c;

  assert.deepEqual(c.path(), ['a', 'b', 'c']);
  assert.deepEqual(b.path(), ['a', 'b']);
  assert.deepEqual(a.path(), ['a']);
  assert.deepEqual(deep.path(), ['deep']);

  const x = deep.new();
  deep.contains.x = x;
  const y = deep.new();
  x.contains.y = y;
  y.contains.c = c;

  assert.deepEqual(c.path(), ['a', 'b', 'c']);
});
