import { Deep } from "./deep.js";
import test from 'node:test';
import assert from 'node:assert';

Deep.DEBUG = true;

test('select', () => {
  const deep = Deep.new();
  const A = new deep();
  const B = new deep();
  const C = new deep();
  const a1 = new A();
  const a2 = new A();
  const b1 = new B();
  const b2 = new B();
  const c1 = new C();
  const c2 = new C();
  a1.from = c2;
  b1.from = c2;
  c1.from = c2;
  a2.to = c1;
  b2.to = c1;
  c2.to = c1;
  const events = {
    as: [],
    bs: [],
    cs: [],
    fromc2: [],
    toc1: [],
    comb: [],
  };
  const as = deep.select({ type: A });
  as.on(e => events.as.push(e));
  const bs = deep.select({ type: B });
  bs.on(e => events.bs.push(e));
  const cs = deep.select({ type: C });
  cs.on(e => events.cs.push(e));
  const fromc2 = deep.select({ from: c2 });
  fromc2.on(e => events.fromc2.push(e));
  const toc1 = deep.select({ to: c1 });
  toc1.on(e => events.toc1.push(e));
  const comb = deep.select({ type: B, to: c1 });
  comb.on(e => events.comb.push(e));
  assert.equal(as.size, 2);
  assert(as.has(a1));
  assert(as.has(a2));
  assert.equal(bs.size, 2);
  assert(bs.has(b1));
  assert(bs.has(b2));
  assert.equal(cs.size, 2);
  assert(cs.has(c1));
  assert(cs.has(c2));
  assert.equal(fromc2.size, 3);
  assert(fromc2.has(a1));
  assert(fromc2.has(b1));
  assert(fromc2.has(c1));
  assert.equal(toc1.size, 3);
  assert(toc1.has(a2));
  assert(toc1.has(b2));
  assert(toc1.has(c2));
  assert.equal(comb.size, 1);
  assert(!comb.has(b1));
  assert(comb.has(b2));
  const a3 = new A();
  const b3 = new B();
  const c3 = new C();
  a3.from = c2;
  b3.from = c2;
  c3.from = c2;
  a3.to = c1;
  b3.to = c1;
  c3.to = c1;
  console.log('done');
});
