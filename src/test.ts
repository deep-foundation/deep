import assert from "node:assert";
import { test } from "node:test";
import { Deep, DeepEvent } from './deep';
import benchmarks from "./benchmark";

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
  assert.equal(counter, 7);
  a2.kill();
  assert.equal(selection1.call().size, 0);
  assert.equal(counter, 10);
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

test('benchmark', async () => {
  const deep = new Deep();
  const { Benchmark, Benchmarked } = benchmarks(deep);

  // Function that creates new Deep instances
  const testFn = () => {
    const d = deep.new();
    const d2 = deep.new();
    d.from = d2;
    return d;
  };

  // Run benchmark
  const benchmarked = await Benchmark.call(testFn);

  // Check that result is a Deep instance
  assert(benchmarked.typeof(Benchmarked));
  
  // Check that from contains the test function
  assert(deep.isDeep(benchmarked.from));
  assert.equal(benchmarked.from.value, testFn);

  // Check that to contains benchmark results
  assert(deep.isDeep(benchmarked.to));
  const result = benchmarked.to.value;
  assert(result.target);
  assert(typeof result.hz === 'number');
  assert(result.stats);
  assert(result.times);

  // Check that value contains hz
  assert(typeof benchmarked.call, 'number');
  assert.equal(benchmarked.value, result.hz);
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
  const collection = deep.wrap([instance1, instance2, instance3]);

  // Test types getter
  const types = collection.types;
  assert(types.call instanceof Set);
  assert(types.call.has(Type1));
  assert(types.call.has(Type2));
  assert.equal(types.call.size, 2);

  // Test froms getter
  const froms = collection.froms;
  assert(froms.call instanceof Set);
  assert(froms.call.has(instance2));
  assert(froms.call.has(instance1));
  assert.equal(froms.call.size, 2);

  // Test tos getter
  const tos = collection.tos;
  assert(tos.call instanceof Set);
  assert(tos.call.has(instance3));
  assert.equal(tos.call.size, 1);

  // Test typeds getter
  const typeds = collection.typeds;
  assert(typeds.call instanceof Set);
  assert(typeds.call.has(instance1));
  assert(typeds.call.has(instance2));
  assert(typeds.call.has(instance3));
  assert.equal(typeds.call.size, 3);

  // Test outs getter
  const outs = collection.outs;
  assert(outs.call instanceof Set);
  for (const deep of collection) {
    for (const out of deep.out) {
      assert(outs.call.has(out));
    }
  }

  // Test ins getter
  const ins = collection.ins;
  assert(ins.call instanceof Set);
  for (const deep of collection) {
    for (const inRef of deep.in) {
      assert(ins.call.has(inRef));
    }
  }
});