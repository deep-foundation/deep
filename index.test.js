import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { deep } from './index.js';

test('deep should be a Symbol', () => {
  assert.equal(typeof deep, 'symbol');
  assert.equal(deep.toString(), 'Symbol(deep)');
}); 