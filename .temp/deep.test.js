import { Deep } from "./deep.js";
import test from 'node:test';
import assert from 'node:assert';

Deep.DEBUG = true;

test('Proxy', () => {
  const events = [];
  Deep.fields.test = function (instance, op, args) {
    if (op === Deep.proxy.get) return 'getted';
    else if (op === Deep.proxy.set) {
      events.push('set');
      return true;
    }
    else if (op === Deep.proxy.delete) {
      events.push('delete');
      return true;
    }
    else throw new Error('unexpected');
  };
  const deep = Deep.new(() => 'called');
  deep.test = 'value';
  assert.equal(deep.test, 'getted');
  assert(delete deep.test);
  assert.deepEqual(events, ['set', 'delete']);
  assert(deep(), 'called');
  assert(deep.call(), 'called');
  assert(deep.apply(), 'called');
  delete Deep.fields.test;
});

test('Deep', () => {
  const events = { a1: [], many: [] };
  const deep = Deep.new();
  assert(deep instanceof Deep);
  const A = new deep();
  const B = new deep();
  assert(A.type.this == deep.this);
  const a1 = new A();
  a1.on(e => events.a1.push(e));
  const a2 = new A();
  assert(A.typed.size == 2);
  assert(A.typed.has(a1.this));
  assert(A.typed.has(a2.this));
  assert(a1.type.many.this.has(A.this));
  const many = a1.type.many;
  many.on(e => events.many.push(e));
  assert(many.has(A));
  assert.equal(many.size, 1);
  assert.equal(A.typed.size, 2);
  assert(A.typed.has(a1));
  assert(A.typed.has(a2));
  a1.type = B;
  assert.equal(A.typed.size, 1);
  assert(!A.typed.has(a1));
  assert(A.typed.has(a2));
  assert(!many.has(A));
  assert(many.has(B));
  assert.equal(many.size, 1);
  a2.type = B;
  assert.equal(A.typed.size, 0);
  assert(!A.typed.has(a1));
  assert(!A.typed.has(a2));
  assert(B.typed.has(a1));
  assert(B.typed.has(a2));
  const C = new deep();
  const D = new deep();
  const E = new deep();
  assert.equal(C.out.size, 0);
  a1.from = C;
  assert.equal(C.out.size, 1);
  assert(C.out.has(a1));
  assert.equal(D.in.size, 0);
  a1.to = D;
  assert.equal(D.in.size, 1);
  assert(D.in.has(a1));
});
