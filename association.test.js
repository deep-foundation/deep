import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Association } from './association.js';
import util from 'node:util';
import { deep } from './index.js';

test('Association - создание экземпляра', () => {
  const a = deep();
  assert.ok(a instanceof Association);
});

test('Association - добавление обычных свойств', () => {
  const a = deep();

  a.name = 'Test';
  a.value = 42;

  assert.equal(a.name, 'Test');
  assert.equal(a.value, 42);
});

test('Association - получение несуществующего свойства', () => {
  const a = deep();

  assert.equal(a.nonExistent, undefined);
});

test('Association - оператор in и перечисление свойств', () => {
  const a = deep(null, {
    method1: () => 'test1',
    method2: () => 'test2',
  });

  assert.equal('method1' in a, true);
  assert.equal('method2' in a, true);
  assert.equal('nonExistent' in a, false);

  const keys = Object.keys(a);
  assert.ok(keys.includes('method1'), 'Keys should include method1');
  assert.ok(keys.includes('method2'), 'Keys should include method2');
});

test('Association - новая модель динамического проксирования', () => {
  const a = deep();

  // Определяем новый метод с использованием модели (ass, op, args)
  a.doIt = (ass, op, args) => {
    if (op === 'get') {
      // При операции 'get' создаем функцию в temp, если её ещё нет
      return ass.temp.doIt = ass.temp.doIt || ((...args) => ass._proxy.get('doIt')(ass, 'apply', args));
    } else if (op === 'apply') {
      // При операции 'apply' выполняем сложение аргументов
      return args[0] + args[1];
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  };

  // Вызываем метод с аргументами
  const result = a.doIt(2, 3);

  // Проверяем результат
  assert.equal(result, 5);

  // Проверяем, что объект temp содержит кешированную функцию
  assert.ok(typeof a.temp.doIt === 'function');
});

test('Association - повторный вызов метода через прокси', () => {
  const a = deep();
  let getCallCount = 0;
  let applyCallCount = 0;

  // Определяем метод с поддержкой подсчета вызовов
  a.calculate = (ass, op, args) => {
    if (op === 'get') {
      getCallCount++;
      return ass.temp.calculate = ass.temp.calculate || ((...args) =>
        ass._proxy.get('calculate')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      applyCallCount++;
      return args.reduce((sum, val) => sum + val, 0);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  };

  // Первый вызов
  const result1 = a.calculate(1, 2, 3);
  assert.equal(result1, 6);
  assert.equal(getCallCount, 1);
  assert.equal(applyCallCount, 1);

  // Второй вызов
  const result2 = a.calculate(4, 5, 6);
  assert.equal(result2, 15);
  assert.equal(getCallCount, 2); // Увеличивается, так как get вызывается при каждом доступе
  assert.equal(applyCallCount, 2);
});

test('Association - статический _proxy содержит ссылку на себя', () => {
  // Проверяем, что статический _proxy содержит ссылку на себя
  assert.strictEqual(Association._proxy.get('_proxy'), Association._proxy);
});

test('Association - вызов метода из статического _proxy', () => {
  // Добавляем метод в статический _proxy
  Association._proxy.set('staticMethod', (ass, op, args) => {
    if (op === 'get') {
      return ass.temp.staticMethod = ass.temp.staticMethod || ((...args) =>
        Association._proxy.get('staticMethod')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      return `Static: ${args.join(', ')}`;
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  });

  // Создаем экземпляр и вызываем метод
  const a = deep();
  const result = a.staticMethod('hello', 'world');

  // Проверяем результат
  assert.equal(result, 'Static: hello, world');
});

test('Association - поддержка операции set в методе', () => {
  const a = deep();
  let lastValue = null;

  // Метод с поддержкой операции 'set'
  a.configurable = (ass, op, value) => {
    if (op === 'get') {
      return ass.temp.configurable = ass.temp.configurable || ((...args) =>
        ass._proxy.get('configurable')(ass, 'apply', args)
      );
    } else if (op === 'set') {
      lastValue = value;
      return true;
    } else if (op === 'apply') {
      return lastValue;
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  };

  // Устанавливаем значение
  a.configurable = 'newValue';

  // Проверяем, что метод перехватил операцию 'set'
  assert.equal(lastValue, 'newValue');

  const conf = a.configurable;

  // Проверяем, что метод возвращает установленное значение
  assert.equal(conf(), 'newValue');
});
