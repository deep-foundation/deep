import assert from "node:assert";
import { after, before, test } from "node:test";
import { Deep } from '../deep.js';
import { syncJSONFile } from '../pckg.js';
import fs from 'fs';

// Create temporary file path
const tempPath = './temp.json';

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
  assert(packed.values.some(v => v.value.test === 'value1'));
  assert(packed.values.some(v => v.value.test === 'value2'));

  // Test error cases
  assert.throws(() => {
    deep.pack;
  });
});

test('selection to pckg, pckg to selection', () => {
  const deep1 = new Deep();
  
  // Create type associations
  const A = deep1.new();
  const B = deep1.new();
  const C = deep1.new();
  
  // Create instances with different value types
  const a = A.new('a1'); // String
  const b = B.new(123); // Number
  const c = C.new(() => 'test'); // Function
  const d = deep1.new(new Set([1,2,3])); // Set
  const e = deep1.new({ x: 1, y: 2 }); // Object
  const f = deep1.new([1,2,3]); // Array
  const g = deep1.new(Symbol()); // Symbol
  
  const selection1 = deep1.select({ or: [A,B,C,a,b,c,d,e,f,g] });
  const pckg = selection1.pack;
  
  // Check deep structure
  assert.deepEqual(pckg.deep[0], { id: A.id(), type: deep1.id() });
  assert.deepEqual(pckg.deep[1], { id: B.id(), type: deep1.id() });
  assert.deepEqual(pckg.deep[2], { id: C.id(), type: deep1.id() });
  assert.deepEqual(pckg.deep[3], { id: a.id(), type: a.type.id(), value: 0 });
  assert.deepEqual(pckg.deep[4], { id: b.id(), type: b.type.id(), value: 1 });
  assert.deepEqual(pckg.deep[5], { id: c.id(), type: c.type.id(), value: 2 });
  assert.deepEqual(pckg.deep[6], { id: d.id(), type: d.type.id(), value: 3 });
  assert.deepEqual(pckg.deep[7], { id: e.id(), type: e.type.id(), value: 4 });
  assert.deepEqual(pckg.deep[8], { id: f.id(), type: f.type.id(), value: 5 });
  assert.deepEqual(pckg.deep[9], { id: g.id(), type: g.type.id(), value: 6 });
  
  // Check values and their types
  assert.deepEqual(pckg.values[0], { value: 'a1', type: 'String' });
  assert.deepEqual(pckg.values[1], { value: 123, type: 'Number' });
  assert.equal(pckg.values[2].type, 'Function');
  assert(pckg.values[2].value.includes('() => \'test\'')); // Function converted to string
  assert.deepEqual(pckg.values[3], { value: [1,2,3], type: 'Set' }); // Set serialized as array
  assert.deepEqual(pckg.values[4], { value: { x: 1, y: 2 }, type: 'Object' });
  assert.deepEqual(pckg.values[5], { value: [1,2,3], type: 'Array' });
  assert.deepEqual(pckg.values[6], { type: 'Symbol' }); // Symbol has only type

  const deep2 = new Deep();
  const selection2 = deep2.unpack(pckg);

  // Check all deeps were created
  assert.equal(selection2.to.size, 10);

  // Get unpacked deeps by their ids
  const A2 = deep2.getById(A.id());
  const B2 = deep2.getById(B.id());
  const C2 = deep2.getById(C.id());
  const a2 = deep2.getById(a.id());
  const b2 = deep2.getById(b.id());
  const c2 = deep2.getById(c.id());
  const d2 = deep2.getById(d.id());
  const e2 = deep2.getById(e.id());
  const f2 = deep2.getById(f.id());
  const g2 = deep2.getById(g.id());

  // Check all deeps exist
  assert(A2 && B2 && C2 && a2 && b2 && c2 && d2 && e2 && f2 && g2);

  // Check types
  assert.equal(A2.type, deep2);
  assert.equal(B2.type, deep2);
  assert.equal(C2.type, deep2);
  assert.equal(a2.type, A2);
  assert.equal(b2.type, B2);
  assert.equal(c2.type, C2);

  // Check values and their types
  assert.equal(a2.call, 'a1');
  assert.equal(b2.call, 123);
  assert.equal(c2.call(), 'test'); // Function should work
  assert.deepEqual(Array.from(d2.call), [1,2,3]); // Set
  assert.deepEqual(e2.call, { x: 1, y: 2 }); // Object
  assert.deepEqual(f2.call, [1,2,3]); // Array
  assert.equal(typeof g2.call, 'symbol'); // Symbol

  // Check value types
  assert.equal(a2.value.type, deep2.String);
  assert.equal(b2.value.type, deep2.Number);
  assert.equal(c2.value.type, deep2.Function);
  assert.equal(d2.value.type, deep2.Set);
  assert.equal(e2.value.type, deep2.Object);
  assert.equal(f2.value.type, deep2.Array);
  assert.equal(g2.value.type, deep2.Symbol);

  // Check selection contains all deeps
  assert(selection2.to.call.has(A2));
  assert(selection2.to.call.has(B2));
  assert(selection2.to.call.has(C2));
  assert(selection2.to.call.has(a2));
  assert(selection2.to.call.has(b2));
  assert(selection2.to.call.has(c2));
  assert(selection2.to.call.has(d2));
  assert(selection2.to.call.has(e2));
  assert(selection2.to.call.has(f2));
  assert(selection2.to.call.has(g2));
});

test('sync json file', async () => {
  // Create first Deep instance and setup initial data
  const deep1 = new Deep();
  const minds1 = deep1.new();
  minds1.id('minds');
  
  // Create entities and store them in minds
  minds1.contains.A = deep1.new();
  minds1.contains.B = deep1.new();
  minds1.contains.C = deep1.new();
  minds1.contains.a = deep1.new();
  minds1.contains.b = deep1.new();
  minds1.contains.c = deep1.new();

  // Create selector for all entities contained in minds
  const items1 = { in: { type: deep1.Contain, from: minds1 } };
  const selection = deep1.select({
    or: [
      items1,
      items1.in,
    ],
  });

  // Start synchronization
  const sync1 = await syncJSONFile(selection, tempPath);

  // Kill the first Deep instance
  deep1.kill();

  // Create second Deep instance
  const deep2 = new Deep();
  const minds2 = deep2.new();
  minds2.id('minds');

  // Verify that all entities are restored
  const items2 = { in: { type: deep1.Contain, from: minds2 } };
  const restoredMinds = deep2.select({
    or: [
      items2,
      items2.in,
    ],
  });

  // Start synchronization with empty selection
  const sync2 = await syncJSONFile(restoredMinds, tempPath);

  assert(deep2.getById(minds1.contains.A.id()));
  assert(deep2.getById(minds1.contains.B.id()));
  assert(deep2.getById(minds1.contains.C.id()));
  assert(deep2.getById(minds1.contains.a.id()));
  assert(deep2.getById(minds1.contains.b.id()));
  assert(deep2.getById(minds1.contains.c.id()));
  // assert.equal(restoredMinds.call().size, 6); // A, B, C, a, b, c
  
  // Cleanup
  sync1.kill();
  sync2.kill();
});

before(() => {
  try { fs.unlinkSync(tempPath); } catch(e) {}
});
after(() => {
  try { fs.unlinkSync(tempPath); } catch(e) {}
});
