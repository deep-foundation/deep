/**
 * Тесты для основного экспорта модуля deep
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { deep, Association } from './index.js';

// Тесты для проверки базовой функциональности класса Association
test('Проверка что Association является функцией и конструктором', () => {
  assert.strictEqual(typeof Association, 'function');
  assert.ok(deep() instanceof Association);
});

test('Проверка функциональности deep.proxy', () => {
  const proxy = deep;
  assert.ok(proxy instanceof Association);
});

test('Проверка, что deep может обернуть функцию', () => {
  function createAssFn(value) {
    return deep(value);
  }

  const wrappedFn = deep(createAssFn);

  assert.strictEqual(typeof wrappedFn, 'function');

  // Вызываем функцию и проверяем, что она вернула ожидаемый результат
  const result = wrappedFn('test');
  assert.ok(result instanceof Association);
  assert.strictEqual(result.this, 'test');
});

test('Вызов с параметрами', () => {
  function createInstance(value) {
    return deep(value);
  }

  const deepFunction = deep(createInstance);

  const instance = deepFunction(42);
  assert.ok(instance instanceof Association);
  assert.strictEqual(instance.this, 42);
});

test('Работа с обычными значениями', () => {
  const stringDeep = deep('Hello');
  assert.strictEqual(stringDeep.this, 'Hello');

  const numberDeep = deep(123);
  assert.strictEqual(numberDeep.this, 123);

  const objectDeep = deep({ a: 1, b: 2 });
  assert.deepStrictEqual(objectDeep.this, { a: 1, b: 2 });

  const arrayDeep = deep([1, 2, 3]);
  assert.deepStrictEqual(arrayDeep.this, [1, 2, 3]);
});

test('Рекурсивный deep', () => {
  function selfRefFn(value) {
    return deep(value);
  }

  const selfDeep = deep(selfRefFn);

  // Вызов первого уровня
  const level1 = selfDeep('first');
  assert.ok(level1 instanceof Association);
  assert.strictEqual(level1.this, 'first');
});
