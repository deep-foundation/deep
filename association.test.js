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
  a.num = 42;

  assert.equal(a.name, 'Test');
  assert.equal(a.num, 42);
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
  const originalValue = { value: 10 };

  // Получаем функции wrap и unwrap
  const wrapFn1 = a.wrap;
  const unwrapFn1 = a.unwrap;

  // Получаем функции еще раз
  const wrapFn2 = a.wrap;
  const unwrapFn2 = a.unwrap;

  // Проверяем, что функции кешируются
  assert.strictEqual(wrapFn1, wrapFn2, 'Функция wrap должна кешироваться');
  assert.strictEqual(unwrapFn1, unwrapFn2, 'Функция unwrap должна кешироваться');

  // Проверяем работу функций
  const wrapped = a.wrap(originalValue);
  const rewrapped = a.wrap(wrapped);
  const unwrapped = a.unwrap(rewrapped);

  assert.strictEqual(rewrapped, wrapped, 'Повторное оборачивание должно вернуть тот же объект');
  assert.strictEqual(unwrapped, originalValue, 'Разворачивание должно вернуть исходное значение');
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
  obj.num = 20;

  // Проверяем, что изменения отражаются в обернутом объекте
  assert.strictEqual(wrapped2.this.num, 20, 'Изменения в оригинальном объекте должны отражаться в обернутом');
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
  assert.equal(+obj.length, 3, 'свойства объекта должны быть доступны');
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

test('Методы работы со строками в Association', async (t) => {
  await t.test('toUpperCase - преобразование к верхнему регистру', () => {
    // Для строкового значения
    const str = deep('hello').toUpperCase();
    assert.ok(str instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(str.this, 'HELLO');

    // Для числового значения
    const num = deep(123).toUpperCase();
    assert.ok(num instanceof Association);
    assert.strictEqual(num.this, '123');

    // Для объекта
    const obj = { name: 'Alice' };
    const objUpper = deep(obj).toUpperCase();
    assert.ok(objUpper instanceof Association);
    assert.strictEqual(objUpper.this.toUpperCase(), '{"NAME":"ALICE"}'.toUpperCase());

    // Для null и undefined
    assert.strictEqual(deep(null).toUpperCase().this, 'NULL');
    assert.strictEqual(deep(undefined).toUpperCase().this, 'UNDEFINED');
  });

  await t.test('toLowerCase - преобразование к нижнему регистру', () => {
    // Для строкового значения
    const str = deep('HELLO').toLowerCase();
    assert.ok(str instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(str.this, 'hello');

    // Для числового значения
    const num = deep(123).toLowerCase();
    assert.ok(num instanceof Association);
    assert.strictEqual(num.this, '123');

    // Для объекта
    const obj = { NAME: 'ALICE' };
    const objLower = deep(obj).toLowerCase();
    assert.ok(objLower instanceof Association);
    assert.strictEqual(objLower.this.toLowerCase(), '{"name":"alice"}'.toLowerCase());

    // Для null и undefined
    assert.strictEqual(deep(null).toLowerCase().this, 'null');
    assert.strictEqual(deep(undefined).toLowerCase().this, 'undefined');
  });

  await t.test('toLowerCaseFirst - первый символ в нижнем регистре', () => {
    // Для строкового значения
    const str1 = deep('Hello').toLowerCaseFirst();
    assert.ok(str1 instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(str1.this, 'hello');

    const str2 = deep('HELLO').toLowerCaseFirst();
    assert.ok(str2 instanceof Association);
    assert.strictEqual(str2.this, 'hELLO');

    // Для пустой строки
    const empty = deep('').toLowerCaseFirst();
    assert.ok(empty instanceof Association);
    assert.strictEqual(empty.this, '');

    // Для числового значения
    assert.strictEqual(deep(123).toLowerCaseFirst().this, '123');

    // Для null и undefined
    assert.strictEqual(deep(null).toLowerCaseFirst().this, 'null');
    assert.strictEqual(deep(undefined).toLowerCaseFirst().this, 'undefined');
  });

  await t.test('toUpperCaseFirst - первый символ в верхнем регистре', () => {
    // Для строкового значения
    const str1 = deep('hello').toUpperCaseFirst();
    assert.ok(str1 instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(str1.this, 'Hello');

    const str2 = deep('hello world').toUpperCaseFirst();
    assert.ok(str2 instanceof Association);
    assert.strictEqual(str2.this, 'Hello world');

    // Для пустой строки
    const empty = deep('').toUpperCaseFirst();
    assert.ok(empty instanceof Association);
    assert.strictEqual(empty.this, '');

    // Для числового значения
    assert.strictEqual(deep(123).toUpperCaseFirst().this, '123');

    // Для null и undefined
    assert.strictEqual(deep(null).toUpperCaseFirst().this, 'Null');
    assert.strictEqual(deep(undefined).toUpperCaseFirst().this, 'Undefined');
  });

  await t.test('toPaddedString - добавление отступов', () => {
    // Дополнение строки в начале
    const padded1 = deep('123').toPaddedString(5, '0');
    assert.ok(padded1 instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(padded1.this, '00123');

    // Дополнение строки в конце
    const padded2 = deep('123').toPaddedString(5, '0', true);
    assert.ok(padded2 instanceof Association);
    assert.strictEqual(padded2.this, '12300');

    // Дополнение строки пробелами по умолчанию
    const padded3 = deep('123').toPaddedString(5);
    assert.ok(padded3 instanceof Association);
    assert.strictEqual(padded3.this, '  123');

    // Строка длиннее запрошенной длины
    const padded4 = deep('12345').toPaddedString(3);
    assert.ok(padded4 instanceof Association);
    assert.strictEqual(padded4.this, '12345');

    // Для числового значения
    const padded5 = deep(123).toPaddedString(5, '0');
    assert.ok(padded5 instanceof Association);
    assert.strictEqual(padded5.this, '00123');

    // Для null и undefined
    const padded6 = deep(null).toPaddedString(5, '0');
    assert.ok(padded6 instanceof Association);
    assert.strictEqual(padded6.this, '0null');

    const padded7 = deep(undefined).toPaddedString(12, ' ');
    assert.ok(padded7 instanceof Association);
    assert.strictEqual(padded7.this, '   undefined');
  });

  await t.test('toFixed - форматирование числа', () => {
    // Для числового значения
    const fixed1 = deep(123.456).toFixed(2);
    assert.ok(fixed1 instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(fixed1.this, '123.46');

    const fixed2 = deep(123).toFixed(2);
    assert.ok(fixed2 instanceof Association);
    assert.strictEqual(fixed2.this, '123.00');

    // Для строки, содержащей число
    const fixed3 = deep('123.456').toFixed(2);
    assert.ok(fixed3 instanceof Association);
    assert.strictEqual(fixed3.this, '123.46');

    // Для строки, не содержащей число
    const fixed4 = deep('hello').toFixed(2);
    assert.ok(fixed4 instanceof Association);
    assert.strictEqual(fixed4.this, '0.00');

    // Для null и undefined
    const fixed5 = deep(null).toFixed(2);
    assert.ok(fixed5 instanceof Association);
    assert.strictEqual(fixed5.this, '0.00');

    const fixed6 = deep(undefined).toFixed(2);
    assert.ok(fixed6 instanceof Association);
    assert.strictEqual(fixed6.this, '0.00');
  });

  await t.test('toJSON - преобразование в JSON-строку', () => {
    // Для объекта
    const obj = { name: 'Alice', age: 30 };
    const json1 = deep(obj).toJSON();
    assert.ok(json1 instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(json1.this, '{"name":"Alice","age":30}');

    // Для массива
    const json2 = deep([1, 2, 3]).toJSON();
    assert.ok(json2 instanceof Association);
    assert.strictEqual(json2.this, '[1,2,3]');

    // С отступами
    const json3 = deep({ a: 1 }).toJSON(2);
    assert.ok(json3 instanceof Association);
    assert.strictEqual(json3.this, '{\n  "a": 1\n}');

    // Для строки
    const json4 = deep('hello').toJSON();
    assert.ok(json4 instanceof Association);
    assert.strictEqual(json4.this, '"hello"');

    // Для числа
    const json5 = deep(123).toJSON();
    assert.ok(json5 instanceof Association);
    assert.strictEqual(json5.this, '123');

    // Для null и undefined
    const json6 = deep(null).toJSON();
    assert.ok(json6 instanceof Association);
    assert.strictEqual(json6.this, 'null');

    const json7 = deep(undefined).toJSON();
    assert.ok(json7 instanceof Association);
    assert.strictEqual(json7.this, undefined);

    // Для объекта с циклической ссылкой
    const cyclical = {};
    cyclical.self = cyclical;
    const json8 = deep(cyclical).toJSON();
    assert.ok(json8 instanceof Association);
    assert.strictEqual(json8.this, '{}');
  });

  await t.test('Комбинированное использование методов', () => {
    // toLowerCase + toUpperCaseFirst
    const combined1 = deep('HELLO WORLD').toLowerCase().toUpperCaseFirst();
    assert.ok(combined1 instanceof Association, 'Результат должен быть экземпляром Association');
    assert.strictEqual(combined1.this, 'Hello world');

    // toUpperCase + toPaddedString
    const combined2 = deep('abc').toUpperCase().toPaddedString(5, '*');
    assert.ok(combined2 instanceof Association);
    assert.strictEqual(combined2.this, '**ABC');

    // Использование в шаблонных строках
    const name = deep('john');
    const greeting = `Hello, ${name.toUpperCaseFirst()}!`;
    assert.strictEqual(greeting, 'Hello, John!');
  });
});
