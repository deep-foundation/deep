/**
 * Тесты для модуля relations, реализующего ассоциативные связи.
 */
import { describe, it } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { Association } from './association.js';
import { type, types, typed } from './relations.js';
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

describe('Association typed', () => {
  it('A.typed should return Association containing Set of instances of this type', () => {
    const A = deep();
    const a1 = deep();
    a1.type = A;
    const a2 = deep();
    a2.type = A;
    const B = deep();
    const b1 = deep();
    b1.type = B;

    // Проверяем что typed возвращает Association
    ok(A.typed instanceof Association);

    // Проверяем что A.typed.this - это Set
    ok(A.typed.this instanceof Set);

    // Проверяем что в множестве есть наши объекты
    ok(A.typed.this.has(a1.this));
    ok(A.typed.this.has(a2.this));

    // Проверяем что нет объектов с другим типом
    ok(!A.typed.this.has(b1.this));

    // Проверяем размер множества
    strictEqual(A.typed.this.size, 2);
    strictEqual(B.typed.this.size, 1);

    // Изменяем тип одного объекта
    a1.type = B;

    // Проверяем что множество обновилось
    ok(!A.typed.this.has(a1.this));
    ok(A.typed.this.has(a2.this));
    strictEqual(A.typed.this.size, 1);

    // Проверяем, что объект появился в множестве нового типа
    ok(B.typed.this.has(a1.this));
    strictEqual(B.typed.this.size, 2);
  });
});
