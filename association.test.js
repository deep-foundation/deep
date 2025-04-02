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

test('wrap - оборачивание различных значений в Association', () => {
  // Создаем экземпляр Association
  const a = deep();

  // 1. Проверка обычных значений
  const wrappedNumber = a.wrap(42);
  assert.ok(wrappedNumber instanceof Association, 'Число должно быть обернуто в Association');
  assert.strictEqual(wrappedNumber.this, 42, 'this обернутого числа должен быть 42');

  const wrappedString = a.wrap('test');
  assert.ok(wrappedString instanceof Association, 'Строка должна быть обернута в Association');
  assert.strictEqual(wrappedString.this, 'test', 'this обернутой строки должен быть "test"');

  const obj = { name: 'object' };
  const wrappedObject = a.wrap(obj);
  assert.ok(wrappedObject instanceof Association, 'Объект должен быть обернут в Association');
  assert.strictEqual(wrappedObject.this, obj, 'this обернутого объекта должен быть исходным объектом');

  // 2. Проверка значения null
  const wrappedNull = a.wrap(null);
  assert.ok(wrappedNull instanceof Association, 'null должен быть обернут в Association');
  assert.strictEqual(wrappedNull.this, null, 'this обернутого null должен быть null');

  // 3. Проверка значения undefined
  const wrappedUndefined = a.wrap(undefined);
  assert.ok(wrappedUndefined instanceof Association, 'undefined должен быть обернут в Association');
  assert.strictEqual(wrappedUndefined.this, undefined, 'this обернутого undefined должен быть undefined');

  // 4. Проверка на работу с уже обернутым значением
  const alreadyWrapped = deep('already wrapped');
  const reWrapped = a.wrap(alreadyWrapped);
  assert.strictEqual(reWrapped, alreadyWrapped, 'Повторное оборачивание должно вернуть исходный экземпляр Association');
});

test('unwrap - разворачивание Association в исходное значение', () => {
  // Создаем экземпляр Association
  const a = deep();

  // 1. Разворачивание обернутых значений
  const wrappedNumber = a.wrap(42);
  const unwrappedNumber = a.unwrap(wrappedNumber);
  assert.strictEqual(unwrappedNumber, 42, 'Развернутое число должно быть 42');

  const wrappedString = a.wrap('test');
  const unwrappedString = a.unwrap(wrappedString);
  assert.strictEqual(unwrappedString, 'test', 'Развернутая строка должна быть "test"');

  const obj = { name: 'object' };
  const wrappedObject = a.wrap(obj);
  const unwrappedObject = a.unwrap(wrappedObject);
  assert.strictEqual(unwrappedObject, obj, 'Развернутый объект должен быть исходным объектом');

  // 2. Проверка на возврат необернутых значений как есть
  assert.strictEqual(a.unwrap(123), 123, 'Необернутое число должно быть возвращено как есть');
  assert.strictEqual(a.unwrap('plain string'), 'plain string', 'Необернутая строка должна быть возвращена как есть');

  const plainObj = { plain: true };
  assert.strictEqual(a.unwrap(plainObj), plainObj, 'Необернутый объект должен быть возвращен как есть');

  // 3. Проверка на null и undefined
  assert.strictEqual(a.unwrap(null), null, 'null должен быть возвращен как есть');
  assert.strictEqual(a.unwrap(undefined), undefined, 'undefined должен быть возвращен как есть');
});

test('wrap и unwrap - проверка кеширования функций', () => {
  const a = deep();

  // Получаем ссылки на функции
  const wrap1 = a.wrap;
  const wrap2 = a.wrap;
  const unwrap1 = a.unwrap;
  const unwrap2 = a.unwrap;

  // Проверяем, что функции кешируются
  assert.strictEqual(wrap1, wrap2, 'wrap должен кешировать функцию');
  assert.strictEqual(unwrap1, unwrap2, 'unwrap должен кешировать функцию');
});

test('wrap и unwrap - проверка сложных сценариев использования', () => {
  const a = deep();

  // 1. Цепочка оборачивания и разворачивания
  const originalValue = { nested: { value: 42 } };
  const wrapped = a.wrap(originalValue);
  const rewrapped = a.wrap(wrapped);
  const unwrapped = a.unwrap(rewrapped);

  assert.strictEqual(rewrapped, wrapped, 'Повторное оборачивание должно вернуть тот же объект');
  assert.strictEqual(unwrapped, originalValue, 'Разворачивание должно вернуть исходное значение');

  // 2. Проверка на сохранение ссылок
  const obj = { value: 10 };
  const wrapped2 = a.wrap(obj);

  // Изменяем оригинальный объект
  obj.value = 20;

  // Проверяем, что изменения отражаются в обернутом объекте
  assert.strictEqual(wrapped2.this.value, 20, 'Изменения в оригинальном объекте должны отражаться в обернутом');
});

test('Association - автоматическая распаковка через valueOf', () => {
  const a = deep(5);
  const b = deep(3);

  // Проверка числовых операций
  assert.equal(a + 10, 15, 'valueOf должен автоматически распаковать значение в числовой операции');
  assert.equal(a * 2, 10, 'valueOf должен работать с умножением');
  assert.equal(a - b, 2, 'valueOf должен работать при операциях между двумя Association');

  // Проверка сравнений
  assert.equal(a > 3, true, 'valueOf должен работать при сравнении');
  assert.equal(a < b, false, 'valueOf должен работать при сравнении между двумя Association');

  // Проверка с другими типами данных
  const obj = deep([1, 2, 3]);
  assert.equal(obj.length, 3, 'свойства объекта должны быть доступны');
});

test('Association - автоматическая распаковка через toString', () => {
  const a = deep(42);
  const str = deep('hello');
  const obj = deep({name: 'test'});

  // Проверка строковых операций
  assert.equal(String(a), '42', 'toString должен преобразовать число в строку');
  assert.equal('' + a, '42', 'toString должен работать при конкатенации строк');
  assert.equal(`Value: ${a}`, 'Value: 42', 'toString должен работать в шаблонных строках');
  assert.equal(str + ' world', 'hello world', 'toString должен работать со строковыми значениями');

  // Проверка с объектами
  assert.equal(String(obj).includes('name'), true, 'toString должен корректно работать с объектами');
});

test('Association - автоматическая распаковка в функциях map и forEach', () => {
  const arr = deep([1, 2, 3]);

  // Проверка в map
  const mapped = arr.map(x => x * 2);
  assert.deepEqual(mapped.this, [2, 4, 6], 'map должен работать с автоматической распаковкой');

  // Проверка в forEach
  const result = [];
  arr.forEach(x => result.push(x * 2));
  assert.deepEqual(result, [2, 4, 6], 'forEach должен работать с автоматической распаковкой');
});

test('Association - сохранение типа при операциях с примитивами', () => {
  const a = deep(5);

  assert.equal(typeof a, 'function', 'Association должен сохранять тип функции');
  assert.ok(a instanceof Association, 'Association должен сохранять свой инстанс');

  // При этом должны работать примитивные операции
  const result = a + 5;
  assert.equal(result, 10, 'Примитивные операции должны работать');
  assert.equal(typeof result, 'number', 'Результат должен быть примитивом');
});

test('Association - wrap и unwrap', () => {
  const a = deep();
  const originalValue = { test: 'example' };

  const wrapped = a.wrap(originalValue);
  const rewrapped = a.wrap(wrapped);
  const unwrapped = a.unwrap(rewrapped);

  assert.strictEqual(rewrapped, wrapped, 'Повторное оборачивание должно вернуть тот же объект');
  assert.strictEqual(unwrapped, originalValue, 'Разворачивание должно вернуть исходное значение');

  // Проверка, что unwrap работает с undefined
  assert.strictEqual(a.unwrap(undefined), undefined);
  assert.strictEqual(a.unwrap(null), null);

  // Проверка сохранения ссылок
  const obj = { value: 10 };
  const wrapped2 = deep(obj);
  obj.value = 20;

  assert.strictEqual(wrapped2.this.value, 20, 'Изменения в оригинальном объекте должны отражаться в обернутом');
});
