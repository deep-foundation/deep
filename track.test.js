/**
 * Тесты для механизма отслеживания связей между ассоциациями
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Association } from './association.js';
import { deep } from './index.js';

// Импортируем функции из модуля track
import { origin, Track } from './track.js';

test('Track - доступ к origin через map', async (t) => {
  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Применяем метод map, создающий новую ассоциацию
  const result = source.map(x => x * 2);

  // Проверяем, что result является экземпляром Association
  assert.ok(result instanceof Association, 'Результат map должен быть экземпляром Association');

  // Проверяем, что результат содержит ожидаемые данные
  assert.deepEqual(result.this, [2, 4, 6, 8], 'Результат map должен содержать преобразованные данные');

  // Проверяем, что result имеет доступ к исходной ассоциации через геттер origin
  assert.strictEqual(result.origin, source, 'result.origin должен указывать на source');
});

test('Track - метаданные трансформации', async (t) => {
  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Функция преобразования
  const transformer = x => x * 2;

  // Применяем метод map с функцией преобразования
  const result = source.map(transformer);

  // Проверяем, что сохранена информация о методе
  assert.strictEqual(result.temp.method, 'map', 'result.temp.method должен быть "map"');

  // Проверяем, что сохранена функция преобразования
  assert.strictEqual(result.temp.transformer, transformer, 'result.temp.transformer должен содержать функцию преобразования');
});

test('Track - доступ к объекту трекера', async (t) => {
  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Применяем метод map
  const result = source.map(x => x * 2);

  // Получаем объект трекера
  const tracker = result.track;

  // Проверяем, что track возвращает экземпляр Association
  assert.ok(tracker instanceof Association, 'result.track должен возвращать экземпляр Association');

  // Проверяем, что трекер хранит правильные ссылки
  assert.strictEqual(tracker.temp.origin, source, 'tracker.temp.origin должен указывать на source');
  assert.strictEqual(tracker.temp.result, result, 'tracker.temp.result должен указывать на result');
  assert.strictEqual(result.temp.origin, source, 'result.temp.origin должен указывать на source');
  assert.strictEqual(result.temp.method, 'map', 'result.temp.method должен быть "map"');
  assert.ok(typeof result.temp.transformer === 'function', 'result.temp.transformer должен быть функцией');
});

test('Track на разных типах данных и операциях', async (t) => {
  // Проверяем наличие системы событий
  if (!Association._proxy.has('on') || !Association._proxy.has('emit')) {
    t.skip('Тест пропущен, так как не реализована система событий');
    return;
  }

  await t.test('Track map', async (st) => {

    await st.test('Array с операциями add/set/delete', async () => {
      // Создаем исходную ассоциацию массива
      const source = deep([1, 2, 3, 4]);

      // Применяем метод map
      const result = source.map(x => x * 2);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, [2, 4, 6, 8], 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add
      source.add(5);
      assert.deepEqual(result.this, [2, 4, 6, 8, 10], 'После add(5) result должен обновиться');

      // 2. Тестируем операцию set
      source.set(2, 10);
      assert.deepEqual(result.this, [2, 4, 20, 8, 10], 'После set(2, 10) result должен обновиться');

      // 3. Тестируем операцию delete
      source.delete(1);
      assert.deepEqual(result.this, [2, 20, 8, 10], 'После delete(1) result должен обновиться');
    });

    await st.test('Object с операциями add/set/delete', async () => {
      // Создаем исходную ассоциацию объекта
      const source = deep({ a: 1, b: 2, c: 3 });

      // Применяем метод map
      const result = source.map((value, key) => ({ [key]: value * 2 }));

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, [
        { a: 2 },
        { b: 4 },
        { c: 6 }
      ], 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add
      source.add(4);

      // Мы не делаем предположений о точном порядке элементов в результирующем массиве,
      // но проверяем, что новый элемент добавлен и все старые элементы сохранены
      assert.strictEqual(result.this.length, 4, 'После add(4) длина result должна быть 4');
      assert.strictEqual(
        result.this.filter(item => Object.keys(item)[0] === 'a' && item.a === 2).length,
        1,
        'После add(4) должен сохраниться элемент { a: 2 }'
      );
      assert.strictEqual(
        result.this.filter(item => Object.keys(item)[0] === 'b' && item.b === 4).length,
        1,
        'После add(4) должен сохраниться элемент { b: 4 }'
      );
      assert.strictEqual(
        result.this.filter(item => Object.keys(item)[0] === 'c' && item.c === 6).length,
        1,
        'После add(4) должен сохраниться элемент { c: 6 }'
      );
      assert.strictEqual(
        result.this.filter(item => Object.keys(item)[0] === '3' && item['3'] === 8).length,
        1,
        'После add(4) должен добавиться элемент { 3: 8 }'
      );

      // 2. Тестируем операцию set
      source.set('d', 5);

      // Проверяем, что новый элемент d добавлен
      assert.strictEqual(result.this.length, 5, 'После set("d", 5) длина result должна быть 5');
      assert.strictEqual(
        result.this.filter(item => Object.keys(item)[0] === 'd' && item.d === 10).length,
        1,
        'После set("d", 5) должен добавиться элемент { d: 10 }'
      );

      // 3. Тестируем операцию delete
      source.delete('b');

      // Проверяем, что элемент b удален
      assert.strictEqual(result.this.length, 4, 'После delete("b") длина result должна быть 4');
      assert.strictEqual(
        result.this.filter(item => Object.keys(item)[0] === 'b').length,
        0,
        'После delete("b") элемент { b: 4 } должен быть удален'
      );
    });

    await st.test('Set с операциями add/delete', async () => {
      // Создаем исходную ассоциацию с использованием Set
      const source = deep(new Set([1, 2, 3]));

      // Применяем метод map
      const result = source.map(x => x * 2);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, [2, 4, 6], 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add
      source.add(4);
      assert.deepEqual(result.this, [2, 4, 6, 8], 'После add(4) result должен обновиться');

      // 2. Тестируем операцию delete
      source.delete(2);
      assert.deepEqual(result.this, [2, 6, 8], 'После delete(2) result должен обновиться');
    });

    await st.test('Map с операциями add/set/delete', async () => {
      // Создаем исходную ассоциацию с использованием Map
      const source = deep(new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]));

      // Применяем метод map
      const result = source.map((value, key) => [key, value * 2]);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, [
        ['a', 2],
        ['b', 4],
        ['c', 6]
      ], 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add
      source.add('d'); // add для Map добавляет пару ключ:ключ
      assert.deepEqual(result.this, [
        ['a', 2],
        ['b', 4],
        ['c', 6],
        ['d', 'd' * 2] // Результат NaN из-за умножения строки на число
      ], 'После add("d") result должен обновиться');

      // 2. Тестируем операцию set
      source.set('e', 5);
      assert.deepEqual(result.this, [
        ['a', 2],
        ['b', 4],
        ['c', 6],
        ['d', NaN],
        ['e', 10]
      ], 'После set("e", 5) result должен обновиться');

      // 3. Тестируем операцию delete
      source.delete('b');
      assert.deepEqual(result.this, [
        ['a', 2],
        ['c', 6],
        ['d', NaN],
        ['e', 10]
      ], 'После delete("b") result должен обновиться');
    });

    await st.test('String с операцией set', async () => {
      // Создаем исходную ассоциацию строки
      const source = deep('hello');

      // Применяем метод map
      const result = source.map(char => char.toUpperCase());

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, ['H', 'E', 'L', 'L', 'O'], 'Начальное состояние result должно быть корректным');

      // Тестируем операцию set
      source.set(0, 'j');
      assert.deepEqual(result.this, ['J', 'E', 'L', 'L', 'O'], 'После set(0, "j") result должен обновиться');
    });

    await st.test('Множественные преобразования - Array.map().map()', async () => {
      // Создаем исходную ассоциацию
      const source = deep([1, 2, 3, 4, 5, 6]);

      // Применяем цепочку трансформаций map
      const result1 = source.map(x => x * 2);

      // Инициализируем трекер для result1
      const tracker1 = result1.track;

      // Проверяем начальное состояние result1
      assert.deepEqual(result1.this, [2, 4, 6, 8, 10, 12], 'result1 начальное состояние должно быть корректным');

      // Создаем следующую трансформацию map вместо filter
      const result2 = result1.map(x => x * 10);

      // Инициализируем трекер для result2
      const tracker2 = result2.track;

      // Проверяем начальное состояние result2
      assert.deepEqual(result2.this, [20, 40, 60, 80, 100, 120], 'result2 начальное состояние должно быть корректным');

      // Проверяем обновление всех уровней при изменении источника
      source.add(7);

      assert.deepEqual(result1.this, [2, 4, 6, 8, 10, 12, 14], 'result1 должен обновиться при изменении source');
      assert.deepEqual(result2.this, [20, 40, 60, 80, 100, 120, 140], 'result2 должен обновиться при изменении source');

      // Проверяем обновление последнего уровня при изменении промежуточного результата
      result1.set(0, 20); // Меняем 2 на 20

      assert.deepEqual(result2.this, [200, 40, 60, 80, 100, 120, 140], 'result2 должен обновиться при изменении result1');
    });
  });

  // Можно добавить другие группы тестов для других методов отслеживания, например filter, reduce и т.д.
});
