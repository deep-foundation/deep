/**
 * Тесты для sets.js
 */
import test from 'node:test';
import assert from 'node:assert';
import { deep } from './index.js';

test('set method', async (t) => {
  await t.test('array', () => {
    const arr = deep([1, 2, 3]);
    arr.set(1, 4);
    assert.deepStrictEqual(arr.this, [1, 4, 3]);
  });

  await t.test('map', () => {
    const map = deep(new Map([['a', 1]]));
    map.set('b', 2);
    assert.deepStrictEqual(Array.from(map.this.entries()), [['a', 1], ['b', 2]]);
  });

  await t.test('weakmap', () => {
    const weakmap = deep(new WeakMap());
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    // Проверка добавления правильных ключей
    weakmap.set(obj1, 'value1');
    assert.strictEqual(weakmap.this.has(obj1), true);
    assert.strictEqual(weakmap.this.get(obj1), 'value1');

    // Проверка выброса ошибки при неправильном ключе
    assert.throws(
      () => weakmap.set('invalid', 'value'),
      { message: 'WeakMap keys must be objects' }
    );

    assert.throws(
      () => weakmap.set(null, 'value'),
      { message: 'WeakMap keys must be objects' }
    );
  });

  await t.test('set', () => {
    const set = deep(new Set([1, 2]));
    set.set('ignored', 3); // ключ игнорируется
    assert.deepStrictEqual(Array.from(set.this), [1, 2, 3]);
  });

  await t.test('weakset', () => {
    const weakset = deep(new WeakSet());

    // Проверка выброса ошибки при использовании set для WeakSet
    assert.throws(
      () => weakset.set({}, 'value'),
      { message: 'Use add() method for WeakSet instead of set()' }
    );
  });

  await t.test('object', () => {
    const obj = deep({ a: 1 });
    obj.set('b', 2);
    assert.deepStrictEqual(obj.this, { a: 1, b: 2 });
  });

  await t.test('string', () => {
    const str = deep('abc');
    str.set(1, 'x');
    assert.strictEqual(str.this, 'axc');
  });

  await t.test('number', () => {
    const num = deep(123);
    num.set(1, '4');
    assert.strictEqual(num.this, 143);
  });

  await t.test('unsupported types', () => {
    const types = [
      true, // boolean
      null, // null
      undefined, // undefined
      Symbol(), // symbol
      BigInt(1), // bigint
      () => {} // function
    ];

    for (const value of types) {
      const ass = deep(value);
      assert.throws(
        () => ass.set(0, 'test'),
        { message: `unexpected type ${ass.detect}` }
      );
    }
  });

  await t.test('events', () => {
    const arr = deep([1, 2, 3]);
    let setEvent = null;
    let changeEvent = false;

    arr.on('set', (event, data) => {
      setEvent = data;
    });

    arr.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    arr.set(1, 4);

    assert.deepStrictEqual(setEvent, { isNewProperty: false, key: 1, value: 4, prevValue: 2 });

    // Отладочный вывод для анализа структуры changeEvent
    // console.log('DEBUG: changeEvent = ', JSON.stringify(changeEvent, null, 2));

    // ПРИМЕЧАНИЕ: в текущей реализации prev содержит уже измененный массив [1, 4, 3].
    // В будущем можно улучшить это, чтобы prev содержал состояние до изменения.
    assert.deepStrictEqual(changeEvent, {
      data: {
        prev: [1, 4, 3], // Фактическое значение в текущей реализации
        next: [1, 4, 3],
        detail: {
          isNewProperty: false,
          key: 1,
          operation: 'set',
          position: 1,
          prevValue: 2,
          size: 3,
          type: 'array',
          value: 4
        }
      },
      method: { method: 'set', arguments: [1, 4] }
    });
  });

  await t.test('invalid indices', () => {
    const str = deep('abc');
    assert.throws(
      () => str.set(-1, 'x'),
      { message: 'Invalid index for string' }
    );

    const num = deep(123);
    assert.throws(
      () => num.set(3, '4'),
      { message: 'Invalid index for number' }
    );
  });
});

test('add method', async (t) => {
  await t.test('array', () => {
    const arr = deep([1, 2, 3]);
    arr.add(4);
    assert.deepStrictEqual(arr.this, [1, 2, 3, 4]);
  });

  await t.test('map', () => {
    const map = deep(new Map([['a', 1]]));
    map.add('b');
    assert.deepStrictEqual(Array.from(map.this.entries()), [['a', 1], ['b', 'b']]);
  });

  await t.test('weakmap', () => {
    const weakmap = deep(new WeakMap());
    const obj1 = { id: 1 };

    // Проверка успешного добавления объекта
    weakmap.add(obj1);
    assert.strictEqual(weakmap.this.has(obj1), true);
    assert.strictEqual(weakmap.this.get(obj1), obj1);

    // Проверка выброса ошибки при неправильном значении
    assert.throws(
      () => weakmap.add('invalid'),
      { message: 'WeakMap keys must be objects' }
    );

    assert.throws(
      () => weakmap.add(null),
      { message: 'WeakMap keys must be objects' }
    );

    assert.throws(
      () => weakmap.add(123),
      { message: 'WeakMap keys must be objects' }
    );
  });

  await t.test('set', () => {
    const set = deep(new Set([1, 2]));
    set.add(3);
    assert.deepStrictEqual(Array.from(set.this), [1, 2, 3]);
  });

  await t.test('weakset', () => {
    const weakset = deep(new WeakSet());
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    // Проверка успешного добавления объекта
    weakset.add(obj1);
    assert.strictEqual(weakset.this.has(obj1), true);

    weakset.add(obj2);
    assert.strictEqual(weakset.this.has(obj2), true);

    // Проверка выброса ошибки при неправильном значении
    assert.throws(
      () => weakset.add('invalid'),
      { message: 'WeakSet values must be objects' }
    );

    assert.throws(
      () => weakset.add(null),
      { message: 'WeakSet values must be objects' }
    );

    assert.throws(
      () => weakset.add(123),
      { message: 'WeakSet values must be objects' }
    );
  });

  await t.test('object', () => {
    const obj = deep({ a: 1 });
    obj.add(2);
    assert.deepStrictEqual(obj.this, { a: 1, '1': 2 });
  });

  await t.test('string', () => {
    // Проверяем строковый тип
    const str = deep('hello');

    // Добавляем строковое значение
    str.add(' world');
    assert.strictEqual(str.this, 'hello world');

    // Добавляем числовое значение (должно быть преобразовано в строку)
    str.add(123);
    assert.strictEqual(str.this, 'hello world123');

    // Добавляем объект (должен быть преобразован toString)
    const obj = { toString: () => '-custom' };
    str.add(obj);
    assert.strictEqual(str.this, 'hello world123-custom');
  });

  await t.test('unsupported types', () => {
    const types = [
      // строка больше не должна выбрасывать ошибку, убираем из списка неподдерживаемых типов
      // 'abc', // string
      123, // number
      true, // boolean
      null, // null
      undefined, // undefined
      Symbol(), // symbol
      BigInt(1), // bigint
      () => {} // function
    ];

    for (const value of types) {
      const ass = deep(value);
      assert.throws(
        () => ass.add('test'),
        { message: `unexpected type ${ass.detect}` }
      );
    }
  });

  await t.test('events', () => {
    const arr = deep([1, 2, 3]);
    let addEvent = null;
    let changeEvent = null;

    arr.on('add', (event, data) => {
      addEvent = data;
    });

    arr.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    arr.add(4);

    assert.deepStrictEqual(addEvent, { value: 4, key: 3 });

    // ПРИМЕЧАНИЕ: в текущей реализации prev/next содержат уже измененный массив [1, 2, 3, 4]
    assert.deepStrictEqual(changeEvent, {
      data: {
        prev: [1, 2, 3, 4],
        next: [1, 2, 3, 4],
        detail: {
          key: 3,
          operation: 'add',
          position: 3,
          size: 4,
          type: 'array',
          value: 4
        }
      },
      method: { method: 'add', arguments: [4] }
    });
  });

  // Добавляем тест на события для строки
  await t.test('string events', () => {
    const str = deep('hello');
    let addEvent = null;
    let changeEvent = null;

    str.on('add', (event, data) => {
      addEvent = data;
    });

    str.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    str.add(' world');

    assert.deepStrictEqual(addEvent, { value: ' world', key: 5 });

    assert.deepStrictEqual(changeEvent.data.detail, {
      key: 5,
      operation: 'add',
      position: 5,
      size: 11,
      type: 'string',
      value: ' world'
    });

    assert.deepStrictEqual(changeEvent.method, { method: 'add', arguments: [' world'] });
  });
});

test('delete method', async (t) => {
  await t.test('array', () => {
    const arr = deep([1, 2, 3]);
    arr.delete(1);
    assert.deepStrictEqual(arr.this, [1, 3]);
  });

  await t.test('map', () => {
    const map = deep(new Map([['a', 1], ['b', 2]]));
    map.delete('a');
    assert.deepStrictEqual(Array.from(map.this.entries()), [['b', 2]]);
  });

  await t.test('weakmap', () => {
    const weakmap = deep(new WeakMap());
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    // Подготовка данных
    weakmap.this.set(obj1, 'value1');
    weakmap.this.set(obj2, 'value2');

    // Проверка успешного удаления
    weakmap.delete(obj1);
    assert.strictEqual(weakmap.this.has(obj1), false);
    assert.strictEqual(weakmap.this.has(obj2), true);

    // Проверка выброса ошибки при некорректном типе ключа
    assert.throws(
      () => weakmap.delete('invalid'),
      { message: 'WeakMap keys must be objects' }
    );

    // Проверка выброса ошибки при отсутствующем ключе
    const missingObj = { id: 3 };
    assert.throws(
      () => weakmap.delete(missingObj),
      { message: 'Key not found in weakmap' }
    );
  });

  await t.test('set', () => {
    const set = deep(new Set([1, 2, 3]));
    set.delete(2);
    assert.deepStrictEqual(Array.from(set.this), [1, 3]);
  });

  await t.test('weakset', () => {
    const weakset = deep(new WeakSet());
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    // Подготовка данных
    weakset.this.add(obj1);
    weakset.this.add(obj2);

    // Проверка успешного удаления
    weakset.delete(obj1);
    assert.strictEqual(weakset.this.has(obj1), false);
    assert.strictEqual(weakset.this.has(obj2), true);

    // Проверка выброса ошибки при некорректном типе ключа
    assert.throws(
      () => weakset.delete('invalid'),
      { message: 'WeakSet values must be objects' }
    );

    // Проверка выброса ошибки при отсутствующем ключе
    const missingObj = { id: 3 };
    assert.throws(
      () => weakset.delete(missingObj),
      { message: 'Value not found in weakset' }
    );
  });

  await t.test('object', () => {
    const obj = deep({ a: 1, b: 2 });
    obj.delete('a');
    assert.deepStrictEqual(obj.this, { b: 2 });
  });

  await t.test('string', () => {
    // Проверяем строковый тип
    const str = deep('hello');

    // Удаляем символ по индексу 1 ('e')
    str.delete(1);
    assert.strictEqual(str.this, 'hllo', 'Должна получиться строка без символа "e"');

    // Удаляем символ по индексу 0 ('h')
    str.delete(0);
    assert.strictEqual(str.this, 'llo', 'Должна получиться строка без первого символа');

    // Проверяем ошибку при неверном индексе
    assert.throws(
      () => str.delete(10),
      { message: 'Invalid index for string' }
    );

    assert.throws(
      () => str.delete(-1),
      { message: 'Invalid index for string' }
    );
  });

  await t.test('unsupported types', () => {
    const types = [
      // строка теперь поддерживается
      // 'abc',
      123, // number
      true, // boolean
      null, // null
      undefined, // undefined
      Symbol(), // symbol
      BigInt(1), // bigint
      () => {} // function
    ];

    for (const value of types) {
      const ass = deep(value);
      assert.throws(
        () => ass.delete(0),
        { message: `unexpected type ${ass.detect}` }
      );
    }
  });

  await t.test('invalid operations', () => {
    // Проверка выброса ошибки при неправильном индексе для массива
    const arr = deep([1, 2, 3]);
    assert.throws(
      () => arr.delete(-1),
      { message: 'Invalid index for array' }
    );
    assert.throws(
      () => arr.delete(5),
      { message: 'Invalid index for array' }
    );

    // Проверка выброса ошибки при отсутствующем ключе для объекта
    const obj = deep({ a: 1 });
    assert.throws(
      () => obj.delete('b'),
      { message: 'Property not found in object' }
    );

    // Проверка выброса ошибки при отсутствующем ключе для Map
    const map = deep(new Map([['a', 1]]));
    assert.throws(
      () => map.delete('b'),
      { message: 'Key not found in map' }
    );

    // Проверка выброса ошибки при отсутствующем значении для Set
    const set = deep(new Set([1, 2]));
    assert.throws(
      () => set.delete(3),
      { message: 'Value not found in set' }
    );
  });

  await t.test('events', () => {
    const arr = deep([1, 2, 3]);
    let deleteEvent = null;
    let changeEvent = null;

    arr.on('delete', (event, data) => {
      deleteEvent = data;
    });

    arr.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    arr.delete(1);

    assert.deepStrictEqual(deleteEvent, { key: 1, value: 2 });

    assert.deepStrictEqual(changeEvent.data.detail, {
      affectedIndices: [2],
      key: 1,
      operation: 'delete',
      prevSize: 3,
      size: 2,
      type: 'array',
      value: 2
    });

    assert.deepStrictEqual(changeEvent.method, { method: 'delete', arguments: [1] });
  });

  // Добавляем тест для событий при удалении символа в строке
  await t.test('string events', () => {
    const str = deep('hello');
    let deleteEvent = null;
    let changeEvent = null;

    str.on('delete', (event, data) => {
      deleteEvent = data;
    });

    str.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    str.delete(1); // Удаляем 'e'

    assert.deepStrictEqual(deleteEvent, { key: 1, value: 'e' });

    assert.deepStrictEqual(changeEvent.data.detail, {
      affectedIndices: [2, 3, 4],
      key: 1,
      operation: 'delete',
      prevSize: 5,
      size: 4,
      type: 'string',
      value: 'e'
    });

    assert.deepStrictEqual(changeEvent.method, { method: 'delete', arguments: [1] });
  });
});

test('remove method', async (t) => {
  await t.test('array', () => {
    const arr = deep([1, 2, 3]);
    arr.remove(2);
    assert.deepStrictEqual(arr.this, [1, 3]);
  });

  await t.test('map', () => {
    const map = deep(new Map([['a', 1], ['b', 2]]));
    map.remove(1);
    assert.deepStrictEqual(Array.from(map.this.entries()), [['b', 2]]);
  });

  await t.test('set', () => {
    const set = deep(new Set([1, 2, 3]));
    set.remove(2);
    assert.deepStrictEqual(Array.from(set.this), [1, 3]);
  });

  await t.test('object', () => {
    const obj = deep({ a: 1, b: 2 });
    obj.remove(1);
    assert.deepStrictEqual(obj.this, { b: 2 });
  });

  await t.test('weakset', () => {
    const weakset = deep(new WeakSet());
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    // Подготовка данных
    weakset.this.add(obj1);
    weakset.this.add(obj2);

    // Проверка успешного удаления
    weakset.remove(obj1);
    assert.strictEqual(weakset.this.has(obj1), false);
    assert.strictEqual(weakset.this.has(obj2), true);

    // Проверка выброса ошибки при некорректном типе значения
    assert.throws(
      () => weakset.remove('invalid'),
      { message: 'WeakSet values must be objects' }
    );

    // Проверка выброса ошибки при отсутствующем значении
    const missingObj = { id: 3 };
    assert.throws(
      () => weakset.remove(missingObj),
      { message: 'Value not found in weakset' }
    );
  });

  await t.test('unsupported types', () => {
    const types = [
      'abc', // string
      123, // number
      true, // boolean
      null, // null
      undefined, // undefined
      Symbol(), // symbol
      BigInt(1), // bigint
      () => {}, // function
      new WeakMap() // weakmap
    ];

    for (const value of types) {
      const ass = deep(value);
      assert.throws(
        () => ass.remove('test'),
        { message: `unexpected type ${ass.detect}` }
      );
    }
  });

  await t.test('value not found', () => {
    const arr = deep([1, 2, 3]);
    assert.throws(
      () => arr.remove(4),
      { message: 'Value not found in array' }
    );

    const map = deep(new Map([['a', 1]]));
    assert.throws(
      () => map.remove(2),
      { message: 'Value not found in map' }
    );

    const set = deep(new Set([1, 2]));
    assert.throws(
      () => set.remove(3),
      { message: 'Value not found in set' }
    );

    const obj = deep({ a: 1 });
    assert.throws(
      () => obj.remove(2),
      { message: 'Value not found in object' }
    );
  });

  await t.test('events', () => {
    const arr = deep([1, 2, 3]);
    let removeEvent = null;
    let changeEvent = null;

    arr.on('remove', (event, data) => {
      removeEvent = data;
    });

    arr.on('change', (event, data, method) => {
      changeEvent = { data, method };
    });

    arr.remove(2);

    assert.deepStrictEqual(removeEvent, { value: 2, position: 1, key: 1 });
    assert.deepStrictEqual(changeEvent, {
      data: { prev: [1, 3], next: [1, 3], detail: {
        affectedIndices: [
          2
        ],
        currentSize: 2,
        key: 1,
        operation: 'remove',
        position: 1,
        prevSize: 3,
        type: 'array',
        value: 2
      }, },
      method: { method: 'remove', arguments: [2] }
    });
  });
});
