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
  a.configurable = (ass, op, [value] = []) => {
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

test('Association - проверка символа в temp.symbol', () => {
  // Создаем экземпляр Association
  const a = deep();

  // Проверяем, что temp.symbol существует и является символом
  assert.equal(typeof a.temp.symbol, 'symbol', 'temp.symbol должен быть символом');

  // Проверяем, что символ установлен в this, когда нет аргументов
  assert.strictEqual(a.this, a.temp.symbol, 'this должен быть равен temp.symbol при создании без аргументов');

  // Проверяем, что строковое представление символа содержит адрес файла и позицию
  const symbolString = a.temp.symbol.toString();
  console.log('Строковое представление символа:', symbolString);

  // Проверяем формат символа - должен быть путь_к_файлу:строка:колонка
  const filePathRegex = /Symbol\((?:file:\/\/)?\/[^:]+:\d+:\d+\)/;
  assert.ok(filePathRegex.test(symbolString), 'Символ должен содержать только адрес файла и позицию в формате путь:строка:колонка');

  // Проверяем, что символ содержит имя файла
  assert.ok(
    symbolString.includes('index.js') ||
    symbolString.includes('association.test.js'),
    'Символ должен содержать имя файла'
  );
});

test('Association - this не равен символу при создании с аргументами', () => {
  const obj = { test: 'value' };
  const a = deep(obj);

  // Проверяем, что temp.symbol существует
  assert.equal(typeof a.temp.symbol, 'symbol', 'temp.symbol должен быть символом');

  // Проверяем, что this установлен в переданный объект, а не в символ
  assert.strictEqual(a.this, obj, 'this должен быть равен переданному объекту');
  assert.notStrictEqual(a.this, a.temp.symbol, 'this не должен быть равен temp.symbol при создании с аргументами');
});

test('Association - символы разных экземпляров уникальны', () => {
  // Создаем два экземпляра
  const a1 = deep();
  const a2 = deep();

  // Проверяем, что символы разные
  assert.notStrictEqual(a1.temp.symbol, a2.temp.symbol, 'Символы разных экземпляров должны быть разными');

  // Проверяем формат символов
  const filePathRegex = /Symbol\((?:file:\/\/)?\/[^:]+:\d+:\d+\)/;
  assert.ok(filePathRegex.test(a1.temp.symbol.toString()), 'Первый символ должен содержать только адрес файла и позицию');
  assert.ok(filePathRegex.test(a2.temp.symbol.toString()), 'Второй символ должен содержать только адрес файла и позицию');
});
