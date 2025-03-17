import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { deep, Association } from './index.js';

test('deep should be a Symbol', () => {
  assert.equal(typeof deep, 'symbol');
  assert.equal(deep.toString(), 'Symbol(deep)');
});

test('Association should be exported', () => {
  assert.ok(typeof Association === 'function');
  assert.ok(new Association() instanceof Association);
}); 