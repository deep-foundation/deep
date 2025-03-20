/**
 * Тесты для модуля relations, реализующего ассоциативные связи.
 */
import { describe, it } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { Association } from './association.js';
import { type, types } from './relations.js';
import deep from './index.js';

describe('Association type', () => {
  it('ass.type must be Association or undefined', () => {
    const A = deep();
    const a = deep();
    a.type = A;
    strictEqual(a.type.this, A.this);
    ok(a.type instanceof Association);
    strictEqual(A.type, undefined);
    strictEqual(a.type.this, A.this);
  });
});
