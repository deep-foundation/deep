import assert from "node:assert";
import { test } from "node:test";
import { Deep } from '../deep.js';

test('pack function', () => {
  const deep = new Deep();

  // Create test instances
  const Type1 = deep.new();
  const instance1 = Type1.new();
  const instance2 = Type1.new();
  const instance3 = Type1.new();

  instance1.from = instance2;
  instance2.to = instance3;
  instance3.value = { test: 'value1' };
  instance1.value = { test: 'value2' };

  // Create a collection to test pack
  const selection = deep.select({ type: Type1 });

  // Test packing
  const packed = selection.pack;

  // Verify structure
  assert(Array.isArray(packed.deep));
  assert(Array.isArray(packed.values));
  assert.equal(packed.deep.length, 3);
  assert.equal(packed.values.length, 2);

  // Verify each packed item
  const packedInstance1 = packed.deep.find(d => d.id === instance1.id());
  const packedInstance2 = packed.deep.find(d => d.id === instance2.id());
  const packedInstance3 = packed.deep.find(d => d.id === instance3.id());

  assert(packedInstance1);
  assert(packedInstance2);
  assert(packedInstance3);

  // Check relationships
  assert.equal(packedInstance1?.type, Type1.id());
  assert.equal(packedInstance1?.from, instance2.id());
  assert.equal(packedInstance2?.type, Type1.id());
  assert.equal(packedInstance2?.to, instance3.id());
  assert.equal(packedInstance3?.type, Type1.id());

  // Check values
  assert(packed.values.some(v => v.test === 'value1'));
  assert(packed.values.some(v => v.test === 'value2'));

  // Test error cases
  assert.throws(() => {
    deep.pack;
  });
});

test('selection to pckg, pckg to selection', () => {
  const deep1 = new Deep();
  
  // Create type associations A, B, C
  const A = deep1.new();
  const B = deep1.new();
  const C = deep1.new();
  
  // Create instances of A, B, C
  const a = A.new('a1');
  const b = B.new('b1');
  const c = C.new('c1');
  
  const selection1 = deep1.select({ or: [A,B,C,a,b,c] });
  const pckg = selection1.pack;
  
  assert.deepEqual(pckg.deep[0], { id: A.id(), type: deep1.id() });
  assert.deepEqual(pckg.deep[1], { id: B.id(), type: deep1.id() });
  assert.deepEqual(pckg.deep[2], { id: C.id(), type: deep1.id() });
  assert.deepEqual(pckg.deep[3], { id: a.id(), type: A.id(), value: 0 });
  assert.deepEqual(pckg.deep[4], { id: b.id(), type: B.id(), value: 1 });
  assert.deepEqual(pckg.deep[5], { id: c.id(), type: C.id(), value: 2 });
  assert.equal(pckg.values[0], a.call);
  assert.equal(pckg.values[1], b.call);
  assert.equal(pckg.values[2], c.call);

  const deep2 = new Deep();
  const selection2 = deep2.unpack(pckg);

  // Проверяем что все deep были созданы
  assert.equal(selection2.to.size, 6);

  // Получаем распакованные deep по их id
  const A2 = deep2.getById(A.id());
  const B2 = deep2.getById(B.id());
  const C2 = deep2.getById(C.id());
  const a2 = deep2.getById(a.id());
  const b2 = deep2.getById(b.id());
  const c2 = deep2.getById(c.id());

  // Проверяем что все deep существуют
  assert(A2 && B2 && C2 && a2 && b2 && c2);

  // Проверяем типы
  assert.equal(A2.type, deep2);
  assert.equal(B2.type, deep2);
  assert.equal(C2.type, deep2);
  assert.equal(a2.type, A2);
  assert.equal(b2.type, B2);
  assert.equal(c2.type, C2);

  // Проверяем значения
  assert.equal(a2.call, a.call);
  assert.equal(b2.call, b.call);
  assert.equal(c2.call, c.call);
  assert.equal(a2.value, 'a1');
  assert.equal(b2.value, 'b1');
  assert.equal(c2.value, 'c1');

  // Проверяем что selection содержит все deep
  assert(selection2.to.call.has(A2));
  assert(selection2.to.call.has(B2));
  assert(selection2.to.call.has(C2));
  assert(selection2.to.call.has(a2));
  assert(selection2.to.call.has(b2));
  assert(selection2.to.call.has(c2));
});