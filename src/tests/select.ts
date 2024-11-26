import assert from "node:assert";
import { test } from "node:test";
import { Deep } from '../deep.js';

test('select type, type.type', () => {
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

test('select contain typed size', () => {
  const deep = new Deep();
  
  // Запоминаем начальное количество deep.Contain.typed
  const initialContainTypedSize = deep.Contain.typed.size;
  
  // Делаем два разных запроса, которые должны дать одинаковый результат
  const selection1 = deep.select({ type: deep.Contain });
  const selection2 = deep.select({ in: { type: deep.Contain } });
  
  // Проверяем что количество найденных элементов совпадает
  assert.equal(selection1.to.size, selection2.to.size);
  assert.equal(initialContainTypedSize, selection1.to.size);
});

test('select out out', () => {
  const deep = new Deep();

  const A = deep.new();
  const a = A.new();
  const B = deep.new();
  const b = B.new();
  b.from = a;
  const C = deep.new();
  const c = C.new();
  c.from = b;
  const D = deep.new();
  const d = D.new();
  d.from = b;
  
  const selection1 = deep.select({ out: { out: { type: C } } });
  assert(selection1.to.has(a));
  assert.equal(selection1.to.size, 1);
});
