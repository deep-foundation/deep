import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Association } from './association.js';

test('Association - создание экземпляра', () => {
  const assoc = new Association();
  assert.ok(assoc instanceof Association);
});

test('Association - поддержка начальных методов', () => {
  const assoc = new Association({
    add: (a, b) => a + b,
    multiply: (a, b) => a * b
  });
  
  assert.equal(assoc.add(2, 3), 5);
  assert.equal(assoc.multiply(2, 3), 6);
});

test('Association - добавление методов после создания', () => {
  const assoc = new Association();
  
  assoc.subtract = (a, b) => a - b;
  assoc.divide = (a, b) => a / b;
  
  assert.equal(assoc.subtract(5, 3), 2);
  assert.equal(assoc.divide(6, 3), 2);
});

test('Association - добавление обычных свойств', () => {
  const assoc = new Association();
  
  assoc.name = 'Test';
  assoc.value = 42;
  
  assert.equal(assoc.name, 'Test');
  assert.equal(assoc.value, 42);
});

test('Association - получение несуществующего свойства', () => {
  const assoc = new Association();
  
  assert.equal(assoc.nonExistent, undefined);
});

test('Association - оператор in и перечисление свойств', () => {
  const assoc = new Association({
    method1: () => 'test1',
    method2: () => 'test2',
    prop: 'value'
  });
  
  assert.ok('method1' in assoc);
  assert.ok('method2' in assoc);
  assert.ok('prop' in assoc);
  assert.ok(!('nonExistent' in assoc));
  
  const keys = Object.keys(assoc);
  assert.deepEqual(keys.sort(), ['method1', 'method2', 'prop'].sort());
});

test('Association - защита внутреннего _proxy', () => {
  const assoc = new Association();
  
  // Можно получить _proxy
  assert.ok(assoc._proxy instanceof Map);
  
  // Но нельзя перезаписать
  const oldProxy = assoc._proxy;
  assoc._proxy = new Map();
  
  assert.strictEqual(assoc._proxy, oldProxy);
});
