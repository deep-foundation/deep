/**
 * Тесты для модуля relations, реализующего ассоциативные связи.
 */
import { describe, it } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { Association } from './association.js';
import { type, types, typed, from, froms, out, to, tos, into } from './relations.js';
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

describe('Association from', () => {
  it('ass.from must be Association or undefined', () => {
    const Source = deep();
    const element = deep();
    element.from = Source;
    strictEqual(element.from.this, Source.this);
    ok(element.from instanceof Association);
    strictEqual(Source.from, undefined);
    strictEqual(element.from.this, Source.this);
  });
});

describe('Association out', () => {
  it('Source.out should return Association containing Set of instances with this source', () => {
    const Source1 = deep();
    const element1 = deep();
    element1.from = Source1;
    const element2 = deep();
    element2.from = Source1;
    const Source2 = deep();
    const element3 = deep();
    element3.from = Source2;

    // Проверяем что out возвращает Association
    ok(Source1.out instanceof Association);

    // Проверяем что Source1.out.this - это Set
    ok(Source1.out.this instanceof Set);

    // Проверяем что в множестве есть наши объекты
    ok(Source1.out.this.has(element1.this));
    ok(Source1.out.this.has(element2.this));

    // Проверяем что нет объектов с другим источником
    ok(!Source1.out.this.has(element3.this));

    // Проверяем размер множества
    strictEqual(Source1.out.this.size, 2);
    strictEqual(Source2.out.this.size, 1);

    // Изменяем источник одного объекта
    element1.from = Source2;

    // Проверяем что множество обновилось
    ok(!Source1.out.this.has(element1.this));
    ok(Source1.out.this.has(element2.this));
    strictEqual(Source1.out.this.size, 1);

    // Проверяем, что объект появился в множестве нового источника
    ok(Source2.out.this.has(element1.this));
    strictEqual(Source2.out.this.size, 2);
  });
});

describe('Association to', () => {
  it('ass.to must be Association or undefined', () => {
    const Target = deep();
    const element = deep();
    element.to = Target;
    strictEqual(element.to.this, Target.this);
    ok(element.to instanceof Association);
    strictEqual(Target.to, undefined);
    strictEqual(element.to.this, Target.this);
  });
});

describe('Association in', () => {
  it('Target.in should return Association containing Set of instances pointing to this target', () => {
    const Target1 = deep();
    const element1 = deep();
    element1.to = Target1;
    const element2 = deep();
    element2.to = Target1;
    const Target2 = deep();
    const element3 = deep();
    element3.to = Target2;

    // Проверяем что in возвращает Association
    ok(Target1.in instanceof Association);

    // Проверяем что Target1.in.this - это Set
    ok(Target1.in.this instanceof Set);

    // Проверяем что в множестве есть наши объекты
    ok(Target1.in.this.has(element1.this));
    ok(Target1.in.this.has(element2.this));

    // Проверяем что нет объектов с другим целевым узлом
    ok(!Target1.in.this.has(element3.this));

    // Проверяем размер множества
    strictEqual(Target1.in.this.size, 2);
    strictEqual(Target2.in.this.size, 1);

    // Изменяем цель одного объекта
    element1.to = Target2;

    // Проверяем что множество обновилось
    ok(!Target1.in.this.has(element1.this));
    ok(Target1.in.this.has(element2.this));
    strictEqual(Target1.in.this.size, 1);

    // Проверяем, что объект появился в множестве новой цели
    ok(Target2.in.this.has(element1.this));
    strictEqual(Target2.in.this.size, 2);
  });
});

// Тестирование совместного использования разных типов отношений
describe('Combined Relations', () => {
  it('should be possible to use multiple relation types together', () => {
    const Type = deep();
    const Source = deep();
    const Target = deep();
    const element = deep();

    // Устанавливаем разные типы отношений для одного объекта
    element.type = Type;
    element.from = Source;
    element.to = Target;

    // Проверяем что все отношения установлены правильно
    strictEqual(element.type.this, Type.this);
    strictEqual(element.from.this, Source.this);
    strictEqual(element.to.this, Target.this);

    // Проверяем обратные отношения
    ok(Type.typed.this.has(element.this));
    ok(Source.out.this.has(element.this));
    ok(Target.in.this.has(element.this));

    // Проверяем размеры множеств
    strictEqual(Type.typed.this.size, 1);
    strictEqual(Source.out.this.size, 1);
    strictEqual(Target.in.this.size, 1);

    // Создаем еще один элемент с теми же отношениями
    const element2 = deep();
    element2.type = Type;
    element2.from = Source;
    element2.to = Target;

    // Проверяем размеры множеств после добавления
    strictEqual(Type.typed.this.size, 2);
    strictEqual(Source.out.this.size, 2);
    strictEqual(Target.in.this.size, 2);

    // Изменяем все отношения первого элемента
    const NewType = deep();
    const NewSource = deep();
    const NewTarget = deep();

    element.type = NewType;
    element.from = NewSource;
    element.to = NewTarget;

    // Проверяем, что старые множества обновились
    strictEqual(Type.typed.this.size, 1);
    strictEqual(Source.out.this.size, 1);
    strictEqual(Target.in.this.size, 1);

    // Проверяем, что новые множества содержат элемент
    ok(NewType.typed.this.has(element.this));
    ok(NewSource.out.this.has(element.this));
    ok(NewTarget.in.this.has(element.this));
  });
});
