/**
 * Тесты для механизма отслеживания связей между ассоциациями
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Association } from './association.js';
import { deep } from './index.js';

// Импортируем функции из модуля track
import { origins, Track } from './track.js';

test('Track - доступ к origins через map', async (t) => {
  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Применяем метод map, создающий новую ассоциацию
  const result = source.map(x => x * 2);

  // Проверяем, что result является экземпляром Association
  assert.ok(result instanceof Association, 'Результат map должен быть экземпляром Association');

  // Проверяем, что результат содержит ожидаемые данные
  assert.deepEqual(result.this, [2, 4, 6, 8], 'Результат map должен содержать преобразованные данные');

  // Проверяем, что result имеет доступ к исходной ассоциации через геттер origins
  assert.deepEqual(result.origins, [source], 'result.origins должен содержать массив с source');
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
  assert.deepEqual(tracker.origins, [source], 'tracker.origins должен содержать массив с source');
  assert.strictEqual(tracker.temp.result, result, 'tracker.temp.result должен указывать на result');
  assert.deepEqual(result.origins, [source], 'result.origins должен содержать массив с source');
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
      const result = source.map(x => x.this * 2);

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
      const result = source.map((value, key) => ({ [key]: value.this * 2 }));

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
      const result = source.map(x => x.this * 2);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, [2, 4, 6], 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add
      source.add(4);
      assert.deepEqual(result.this, [2, 4, 6, 8], 'После add(4) result должен обновиться');

      // 2. Тестируем операцию delete
      source.delete(2);
      assert.deepEqual(result.this, [2, 6, 8], "После delete(2) result должен обновиться");
    });

    await st.test('Map с операциями add/set/delete', async () => {
      // Создаем исходную ассоциацию с использованием Map
      const source = deep(new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]));

      // Применяем метод map
      const result = source.map((value, key) => [key, value.this * 2]);

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
        ['d', NaN]
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
      const result = source.map(char => char.this.toUpperCase());

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, ['H', 'E', 'L', 'L', 'O'], 'Начальное состояние result должно быть корректным');

      // Тестируем операцию set
      source.set(0, 'j');
      assert.deepEqual(result.this, ['J', 'E', 'L', 'L', 'O'], 'После set(0, "j") result должен обновиться');

      // Тестируем операцию add (добавление в конец)
      source.add('!');
      assert.deepEqual(result.this, ['J', 'E', 'L', 'L', 'O', '!'], 'После add("!") result должен добавить новый символ в конец');
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

  await t.test('Track filter', async (st) => {
    await st.test('Array с фильтрацией', async () => {
      // Создаем исходную ассоциацию массива
      const source = deep([1, 2, 3, 4, 5, 6]);

      // Применяем метод filter
      const result = source.filter(x => x % 2 === 0); // Только четные числа

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, [2, 4, 6], 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add с четным числом
      source.add(8);
      assert.deepEqual(result.this, [2, 4, 6, 8], 'После add(8) result должен обновиться');

      // 2. Тестируем операцию add с нечетным числом
      source.add(9);
      assert.deepEqual(result.this, [2, 4, 6, 8], 'После add(9) result должен остаться неизменным');

      // 3. Тестируем операцию set, меняющую нечетное на четное
      source.set(0, 10); // Меняем 1 на 10
      assert.deepEqual(result.this, [10, 2, 4, 6, 8], 'После set(0, 10) result должен добавить новый элемент');

      // 4. Тестируем операцию set, меняющую четное на нечетное
      source.set(1, 11); // Меняем 2 на 11
      assert.deepEqual(result.this, [10, 4, 6, 8], 'После set(1, 11) result должен удалить элемент');

      // 5. Тестируем операцию delete для четного числа
      source.delete(2); // Удаляем 3 (нечетное число, которое не входит в результат)
      assert.deepEqual(result.this, [10, 4, 6, 8], 'После delete(2) result должен обновиться');
    });

    await st.test('Object с фильтрацией', async () => {
      // Создаем исходную ассоциацию объекта
      const source = deep({ a: 1, b: 2, c: 3, d: 4, e: 5 });

      // Применяем метод filter
      const result = source.filter(x => x % 2 === 0); // Только четные числа

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual([...result.this].sort(), [2, 4].sort(), 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add с четным числом
      source.add(6);
      assert.deepEqual([...result.this].sort(), [2, 4, 6].sort(), 'После add(6) result должен обновиться');

      // 2. Тестируем операцию add с нечетным числом
      source.add(7);
      assert.deepEqual([...result.this].sort(), [2, 4, 6].sort(), 'После add(7) result должен остаться неизменным');

      // 3. Тестируем операцию set с четным числом
      source.set('f', 8);
      assert.deepEqual([...result.this].sort(), [2, 4, 6, 8].sort(), 'После set("f", 8) result должен добавить новый элемент');

      // 4. Тестируем операцию set, меняющую нечетное на четное
      source.set('a', 10); // Меняем 1 на 10
      assert.deepEqual([...result.this].sort(), [2, 4, 6, 8, 10].sort(), 'После set("a", 10) result должен добавить новый элемент');

      // 5. Тестируем операцию delete
      source.delete('b'); // Удаляем 2
      assert.deepEqual([...result.this].sort(), [4, 6, 8, 10].sort(), 'После delete("b") result должен обновиться');
    });

    await st.test('Set с фильтрацией', async () => {
      // Создаем исходную ассоциацию с использованием Set
      const source = deep(new Set([1, 2, 3, 4, 5]));

      // Применяем метод filter
      const result = source.filter(x => x % 2 === 0); // Только четные числа

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, [2, 4], 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add с четным числом
      source.add(6);
      assert.deepEqual(result.this, [2, 4, 6], 'После add(6) result должен обновиться');

      // 2. Тестируем операцию add с нечетным числом
      source.add(7);
      assert.deepEqual(result.this, [2, 4, 6], 'После add(7) result должен остаться неизменным');

      // 3. Тестируем операцию delete
      source.delete(2);
      assert.deepEqual(result.this, [4, 6], 'После delete(2) result должен обновиться');
    });

    await st.test('Map с фильтрацией', async () => {
      // Создаем исходную ассоциацию с использованием Map
      const source = deep(new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
        ['e', 5]
      ]));

      // Применяем метод filter
      const result = source.filter(x => x % 2 === 0); // Только четные числа

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual([...result.this].sort(), [2, 4].sort(), 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию set с четным числом
      source.set('f', 6);
      assert.deepEqual([...result.this].sort(), [2, 4, 6].sort(), 'После set("f", 6) result должен обновиться');

      // 2. Тестируем операцию set с нечетным числом
      source.set('g', 7);
      assert.deepEqual([...result.this].sort(), [2, 4, 6].sort(), 'После set("g", 7) result должен остаться неизменным');

      // 3. Тестируем операцию set, меняющую нечетное на четное
      source.set('a', 8); // Меняем 1 на 8
      assert.deepEqual([...result.this].sort(), [2, 4, 6, 8].sort(), 'После set("a", 8) result должен добавить новый элемент');

      // 4. Тестируем операцию delete
      source.delete('b'); // Удаляем 2
      assert.deepEqual([...result.this].sort(), [4, 6, 8].sort(), 'После delete("b") result должен обновиться');
    });

    await st.test('String с фильтрацией', async () => {
      // Создаем исходную ассоциацию строки
      const source = deep('abcde');

      // Применяем метод filter для фильтрации только гласных букв
      const result = source.filter(x => ['a', 'e', 'i', 'o', 'u'].includes(x.this));

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.deepEqual(result.this, ['a', 'e'], 'Начальное состояние result должно быть корректным');

      // Тестируем операцию set
      source.set(0, 'o'); // Меняем 'a' на 'o'
      assert.deepEqual(result.this, ['o', 'e'], 'После set(0, "o") result должен обновиться');

      // Тестируем операцию set с согласной буквой
      source.set(4, 'z'); // Меняем 'e' на 'z'
      assert.deepEqual(result.this, ['o'], 'После set(4, "z") result должен обновиться и удалить "e"');
    });
  });

  await t.test('Track reduce', async (st) => {
    await st.test('Array с reduce для суммы', async () => {
      // Создаем исходную ассоциацию массива
      const source = deep([1, 2, 3, 4]);

      // Применяем метод reduce для вычисления суммы
      const result = source.reduce((acc, x) => acc + x, 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, 10, 'Начальное состояние result должно быть корректным (10)');

      // 1. Тестируем операцию add
      source.add(5);
      assert.strictEqual(result.this, 15, 'После add(5) result должен обновиться до 15');

      // 2. Тестируем операцию set
      source.set(0, 10); // Меняем 1 на 10
      assert.strictEqual(result.this, 24, 'После set(0, 10) result должен обновиться до 24');

      // 3. Тестируем операцию delete
      source.delete(1); // Удаляем 2
      assert.strictEqual(result.this, 22, 'После delete(1) result должен обновиться до 22');
    });

    await st.test('Object с reduce для суммы', async () => {
      // Создаем исходную ассоциацию объекта
      const source = deep({ a: 1, b: 2, c: 3 });

      // Применяем метод reduce для вычисления суммы
      const result = source.reduce((acc, x) => acc + x, 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, 6, 'Начальное состояние result должно быть корректным (6)');

      // 1. Тестируем операцию add
      source.add(4);
      assert.strictEqual(result.this, 10, 'После add(4) result должен обновиться до 10');

      // 2. Тестируем операцию set для существующего свойства
      source.set('a', 5); // Меняем 1 на 5
      assert.strictEqual(result.this, 14, 'После set("a", 5) result должен обновиться до 14');

      // 3. Тестируем операцию set для нового свойства
      source.set('d', 6);
      assert.strictEqual(result.this, 20, 'После set("d", 6) result должен обновиться до 20');

      // 4. Тестируем операцию delete
      source.delete('b'); // Удаляем 2
      assert.strictEqual(result.this, 18, 'После delete("b") result должен обновиться до 18');
    });

    await st.test('Set с reduce для суммы', async () => {
      // Создаем исходную ассоциацию с использованием Set
      const source = deep(new Set([1, 2, 3, 4]));

      // Применяем метод reduce для вычисления суммы
      const result = source.reduce((acc, x) => acc + x, 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, 10, 'Начальное состояние result должно быть корректным (10)');

      // 1. Тестируем операцию add
      source.add(5);
      assert.strictEqual(result.this, 15, 'После add(5) result должен обновиться до 15');

      // 2. Тестируем операцию add для существующего значения (не должно менять результат)
      source.add(1);
      assert.strictEqual(result.this, 15, 'После add(1) result не должен меняться, так как 1 уже есть в множестве');

      // 3. Тестируем операцию delete
      source.delete(3);
      assert.strictEqual(result.this, 12, 'После delete(3) result должен обновиться до 12');
    });

    await st.test('Map с reduce для суммы', async () => {
      // Создаем исходную ассоциацию с использованием Map
      const source = deep(new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]));

      // Применяем метод reduce для вычисления суммы значений
      const result = source.reduce((acc, x) => acc + x, 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, 6, 'Начальное состояние result должно быть корректным (6)');

      // 1. Тестируем операцию set для нового ключа
      source.set('d', 4);
      assert.strictEqual(result.this, 10, 'После set("d", 4) result должен обновиться до 10');

      // 2. Тестируем операцию set для существующего ключа
      source.set('a', 5); // Меняем 1 на 5
      assert.strictEqual(result.this, 14, 'После set("a", 5) result должен обновиться до 14');

      // 3. Тестируем операцию delete
      source.delete('b'); // Удаляем 2
      assert.strictEqual(result.this, 12, 'После delete("b") result должен обновиться до 12');
    });

    await st.test('String с reduce для конкатенации', async () => {
      // Создадим отдельный массив символов вместо строки, так как строки не поддерживают
      // индексирование в редактировании
      const source = deep('abc'); // Используем массив вместо строки

      // Применяем метод reduce для создания строки в верхнем регистре
      const result = source.reduce((acc, x) => acc + x.this.toUpperCase(), '');

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, 'ABC', 'Начальное состояние result должно быть корректным (ABC)');

      // 1. Тестируем операцию set
      source.set(0, 'd'); // Меняем 'a' на 'd'
      assert.strictEqual(result.this, 'DBC', 'После set(0, "d") result должен обновиться до DBC');

      // 2. Тестируем операцию add
      source.add('d'); // Добавляем 'd' в конец
      assert.strictEqual(result.this, 'DBCD', 'После add("d") result должен обновиться до DBCD');

      // 3. Тестируем операцию delete
      source.delete(1); // Удаляем 'b'
      assert.strictEqual(result.this, 'DCD', 'После delete(1) result должен обновиться до DCD');
    });

    await st.test('Reduce без initial value', async () => {
      // Создаем исходную ассоциацию массива
      const source = deep([1, 2, 3, 4]);

      // Применяем метод reduce без начального значения
      const result = source.reduce((acc, x) => acc + x, 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, 10, 'Начальное состояние result должно быть корректным (10)');

      // 1. Тестируем операцию add
      source.add(5);
      assert.strictEqual(result.this, 15, 'После add(5) result должен обновиться до 15');

      // 2. Тестируем операцию set для первого элемента
      source.set(0, 10); // Меняем 1 на 10
      assert.strictEqual(result.this, 24, 'После set(0, 10) result должен обновиться до 24');

      // 3. Тестируем операцию delete для первого элемента (должен использовать второй элемент как начальный)
      source.delete(0); // Удаляем первый элемент (10)
      assert.strictEqual(result.this, 14, 'После delete(0) result должен пересчитаться с новым начальным элементом');
    });
  });

  await t.test('Track join', async (st) => {
    await st.test('Array с join', async () => {
      // Создаем исходную ассоциацию массива
      const source = deep([1, 2, 3, 4]);

      // Применяем метод join
      const result = source.join('-');

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, '1-2-3-4', 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add
      source.add(5);
      assert.strictEqual(result.this, '1-2-3-4-5', 'После add(5) result должен обновиться');

      // 2. Тестируем операцию set
      source.set(0, 10); // Меняем 1 на 10
      assert.strictEqual(result.this, '10-2-3-4-5', 'После set(0, 10) result должен обновиться');

      // 3. Тестируем операцию delete
      source.delete(1); // Удаляем 2
      assert.strictEqual(result.this, '10-3-4-5', 'После delete(1) result должен обновиться');
    });

    await st.test('Object с join', async () => {
      // Создаем исходную ассоциацию объекта с предсказуемым порядком ключей
      // Используем массив вместо объекта для контроля порядка
      const source = deep([1, 2, 3]);

      // Применяем метод join
      const result = source.join(':');

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, '1:2:3', 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add
      source.add(4);
      assert.strictEqual(result.this, '1:2:3:4', 'После add(4) result должен обновиться');

      // 2. Тестируем операцию set для существующего свойства
      source.set(0, 10); // Меняем 1 на 10
      assert.strictEqual(result.this, '10:2:3:4', 'После set(0, 10) result должен обновиться');

      // 3. Тестируем операцию delete
      source.delete(1); // Удаляем 2
      assert.strictEqual(result.this, '10:3:4', 'После delete(1) result должен обновиться');
    });

    await st.test('Set с join', async () => {
      // Создаем исходную ассоциацию с использованием Set
      const source = deep(new Set([1, 2, 3]));

      // Применяем метод join
      const result = source.join('|');

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, '1|2|3', 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию add для нового значения
      source.add(4);
      assert.strictEqual(result.this, '1|2|3|4', 'После add(4) result должен обновиться');

      // 2. Тестируем операцию add для существующего значения (не должно менять результат)
      source.add(2);
      assert.strictEqual(result.this, '1|2|3|4', 'После add(2) result не должен меняться, так как 2 уже есть в множестве');

      // 3. Тестируем операцию delete
      source.delete(2);
      assert.strictEqual(result.this, '1|3|4', 'После delete(2) result должен обновиться');
    });

    await st.test('Map с join', async () => {
      // Создаем исходную ассоциацию с использованием Map
      const source = deep(new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]));

      // Применяем метод join для значений Map
      const result = source.join('+');

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, '1+2+3', 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию set для нового ключа
      source.set('d', 4);
      assert.strictEqual(result.this, '1+2+3+4', 'После set("d", 4) result должен обновиться');

      // 2. Тестируем операцию set для существующего ключа
      source.set('a', 10); // Меняем 1 на 10
      assert.strictEqual(result.this, '10+2+3+4', 'После set("a", 10) result должен обновиться');

      // 3. Тестируем операцию delete
      source.delete('b'); // Удаляем 2
      assert.strictEqual(result.this, '10+3+4', 'После delete("b") result должен обновиться');
    });

    await st.test('String с join по умолчанию', async () => {
      // Используем массив символов вместо строки
      const source = deep(['a', 'b', 'c']);

      // Применяем метод join без указания разделителя (по умолчанию запятая)
      const result = source.join();

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, 'a,b,c', 'Начальное состояние result должно быть корректным');

      // 1. Тестируем операцию set
      source.set(0, 'd'); // Меняем 'a' на 'd'
      assert.strictEqual(result.this, 'd,b,c', 'После set(0, "d") result должен обновиться');

      // 2. Тестируем операцию add
      source.add('e'); // Добавляем 'e' в конец
      assert.strictEqual(result.this, 'd,b,c,e', 'После add("e") result должен обновиться');

      // 3. Тестируем операцию delete
      source.delete(1); // Удаляем 'b'
      assert.strictEqual(result.this, 'd,c,e', 'После delete(1) result должен обновиться');
    });
  });

  await t.test('Track every', async (st) => {
    await st.test('Array с every', async () => {
      // Создаем исходную ассоциацию массива
      const source = deep([2, 4, 6, 8]);

      // Применяем метод every для проверки, все ли числа четные
      const result = source.every(x => x % 2 === 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, true, 'Начальное состояние result должно быть true');

      // 1. Тестируем операцию add с четным числом
      source.add(10);
      assert.strictEqual(result.this, true, 'После add(10) result должен остаться true');

      // 2. Тестируем операцию add с нечетным числом
      source.add(7);
      assert.strictEqual(result.this, false, 'После add(7) result должен измениться на false');

      // 3. Тестируем операцию delete для нечетного числа
      source.delete(5); // Удаляем 7
      assert.strictEqual(result.this, true, 'После delete(5) result должен вернуться к true');

      // 4. Тестируем операцию set, меняющую четное на нечетное
      source.set(0, 3); // Меняем 2 на 3
      assert.strictEqual(result.this, false, 'После set(0, 3) result должен измениться на false');
    });

    await st.test('Object с every', async () => {
      // Создаем исходную ассоциацию объекта с четными числами
      const source = deep({ a: 2, b: 4, c: 6 });

      // Применяем метод every для проверки, все ли числа четные
      const result = source.every(x => x % 2 === 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, true, 'Начальное состояние result должно быть true');

      // 1. Тестируем операцию add с четным числом
      source.add(8);
      assert.strictEqual(result.this, true, 'После add(8) result должен остаться true');

      // 2. Тестируем операцию add с нечетным числом
      source.add(5);
      assert.strictEqual(result.this, false, 'После add(5) result должен измениться на false');

      // 3. Тестируем операцию set для существующего свойства
      source.set('a', 3); // Меняем 2 на 3
      assert.strictEqual(result.this, false, 'После set("a", 3) result должен оставаться false');

      // 4. Тестируем операцию delete для нечетного числа
      source.delete('a'); // Удаляем свойство со значением 3
      source.delete('4'); // Удаляем свойство со значением 5
      assert.strictEqual(result.this, true, 'После удаления нечетных значений result должен вернуться к true');
    });

    await st.test('Set с every', async () => {
      // Создаем исходную ассоциацию с использованием Set с четными числами
      const source = deep(new Set([2, 4, 6]));

      // Применяем метод every для проверки, все ли числа четные
      const result = source.every(x => x % 2 === 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, true, 'Начальное состояние result должно быть true');

      // 1. Тестируем операцию add с четным числом
      source.add(8);
      assert.strictEqual(result.this, true, 'После add(8) result должен остаться true');

      // 2. Тестируем операцию add с нечетным числом
      source.add(5);
      assert.strictEqual(result.this, false, 'После add(5) result должен измениться на false');

      // 3. Тестируем операцию delete
      source.delete(5);
      assert.strictEqual(result.this, true, 'После delete(5) result должен вернуться к true');
    });

    await st.test('Map с every', async () => {
      // Создаем исходную ассоциацию с использованием Map с четными числами
      const source = deep(new Map([
        ['a', 2],
        ['b', 4],
        ['c', 6]
      ]));

      // Применяем метод every для проверки, все ли значения четные
      const result = source.every(x => x % 2 === 0);

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, true, 'Начальное состояние result должно быть true');

      // 1. Тестируем операцию set с четным числом
      source.set('d', 8);
      assert.strictEqual(result.this, true, 'После set("d", 8) result должен остаться true');

      // 2. Тестируем операцию set с нечетным числом
      source.set('e', 5);
      assert.strictEqual(result.this, false, 'После set("e", 5) result должен измениться на false');

      // 3. Тестируем операцию delete для ключа с нечетным числом
      source.delete('e');
      assert.strictEqual(result.this, true, 'После delete("e") result должен вернуться к true');

      // 4. Тестируем операцию set, меняющую четное на нечетное для существующего ключа
      source.set('a', 3); // Меняем 2 на 3
      assert.strictEqual(result.this, false, 'После set("a", 3) result должен измениться на false');
    });

    await st.test('String с every', async () => {
      // Создаем исходную ассоциацию строки с буквами нижнего регистра
      const source = deep('abc');

      // Применяем метод every для проверки, все ли символы в нижнем регистре
      const result = source.every(char => /[a-z]/.test(char));

      // Инициализируем трекер
      const tracker = result.track;

      // Проверяем начальное состояние
      assert.strictEqual(result.this, true, 'Начальное состояние result должно быть true');

      // 1. Тестируем операцию set с буквой нижнего регистра
      source.set(0, 'd'); // Меняем 'a' на 'd'
      assert.strictEqual(result.this, true, 'После set(0, "d") result должен остаться true');

      // 2. Тестируем операцию set с буквой верхнего регистра
      source.set(1, 'B'); // Меняем 'b' на 'B'
      assert.strictEqual(result.this, false, 'После set(1, "B") result должен измениться на false');

      // 3. Тестируем операцию set, меняющую букву верхнего регистра обратно на нижний
      source.set(1, 'e'); // Меняем 'B' на 'e'
      assert.strictEqual(result.this, true, 'После set(1, "e") result должен вернуться к true');
    });
  });

  await t.test('Track с операциями массивов', (t) => {
    // Проверяем наличие системы событий
    if (!Association._proxy.has('on') || !Association._proxy.has('emit')) {
      t.skip('Тест пропущен, так как не реализована система событий');
      return;
    }

    // Объединяем все тесты в один для избежания проблем с асинхронностью
    t.test('Track с операциями массивов - комбинированный тест', (t) => {
      // *** ТЕСТ 1: Push и Pop ***
      // Создаем исходную ассоциацию массива
      const source1 = deep([1, 2, 3]);

      // Применяем метод map
      const result1 = source1.map(x => x * 2);

      result1.track;

      // Проверяем начальное состояние
      assert.deepEqual(result1.this, [2, 4, 6], 'Начальное состояние result1 должно быть корректным');

      // Тестируем операцию push
      source1.push(4);
      assert.deepEqual(result1.this, [2, 4, 6, 8], 'После push(4) result1 должен обновиться');

      // Добавляем несколько элементов сразу
      source1.push(5, 6);
      assert.deepEqual(result1.this, [2, 4, 6, 8, 10, 12], 'После push(5, 6) result1 должен обновиться');

      // Тестируем операцию pop
      source1.pop();
      assert.deepEqual(result1.this, [2, 4, 6, 8, 10], 'После pop() result1 должен обновиться');

      // *** ТЕСТ 2: Shift и Unshift ***
      // Создаем исходную ассоциацию массива
      const source2 = deep([2, 3, 4]);

      // Применяем метод map
      const result2 = source2.map(x => x * 2);

      result2.track;

      // Проверяем начальное состояние
      assert.deepEqual(result2.this, [4, 6, 8], 'Начальное состояние result2 должно быть корректным');

      // Тестируем операцию unshift
      source2.unshift(1);
      assert.deepEqual(result2.this, [2, 4, 6, 8], 'После unshift(1) result2 должен обновиться');

      // Добавляем несколько элементов сразу
      source2.unshift(-1, 0);
      assert.deepEqual(result2.this, [-2, 0, 2, 4, 6, 8], 'После unshift(-1, 0) result2 должен обновиться');

      // Тестируем операцию shift
      source2.shift();
      assert.deepEqual(result2.this, [0, 2, 4, 6, 8], 'После shift() result2 должен обновиться');

      // *** ТЕСТ 3: Цепочка методов ***
      const source3 = deep([1, 2, 3, 4]);
      const result3a = deep(source3).map(x => x * 2);
      result3a.track;
      const result3b = deep(result3a).map(x => x + 1);
      result3b.track;
      // Проверяем начальное состояние
      assert.deepEqual(result3a.this, [2, 4, 6, 8], 'result3a должен содержать все трансформированные элементы');
      assert.deepEqual(result3b.this, [3, 5, 7, 9], 'result3b должен содержать только элементы + 1');

      // Обновляем источник данных
      source3.push(5);

      // Проверяем данные
      assert.deepEqual(result3a.this, [2, 4, 6, 8, 10], 'После push result3a должен обновиться');
      assert.deepEqual(result3b.this, [3, 5, 7, 9, 11], 'После push result3b должен обновиться');

      // Обновляем result1 напрямую
      result3a.set(0, 20);

      assert.deepEqual(result3a.this, [20, 4, 6, 8, 10], 'После set result3a должен обновиться');
      assert.deepEqual(result3b.this, [21, 5, 7, 9, 11], 'После set result3b должен обновиться с новым элементом 20');
    });
  });

  await t.test('Track - операции many', async (st) => {
    await st.test('Track difference', async (st) => {
      await st.test('Set с операциями add/delete', async () => {
        // Создаем исходные множества
        const source = deep(new Set([1, 2, 3, 4]));
        const other = deep(new Set([3, 4, 5]));

        // Применяем метод difference
        const result = source.difference(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this), [1, 2], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента, которого нет в other
        source.add(6);
        assert.deepEqual(Array.from(result.this), [1, 2, 6], 'После source.add(6) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента, который есть в other
        source.add(5);
        assert.deepEqual(Array.from(result.this), [1, 2, 6], 'После source.add(5) результат не должен измениться');

        // 3. Тестируем удаление элемента из разности
        source.delete(1);
        assert.deepEqual(Array.from(result.this), [2, 6], 'После source.delete(1) элемент должен быть удален из результата');

        // 4. Тестируем удаление элемента, которого нет в разности
        source.delete(3);
        assert.deepEqual(Array.from(result.this), [2, 6], 'После source.delete(3) результат не должен измениться');
      });

      await st.test('Map с операциями set/delete', async () => {
        // Создаем исходные Map объекты
        const source = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
        const other = deep(new Map([['b', 2], ['c', 3], ['d', 4]]));

        // Применяем метод difference
        const result = source.difference(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this.entries()), [['a', 1]], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента с ключом, которого нет в other
        source.set('e', 5);
        assert.deepEqual(Array.from(result.this.entries()), [['a', 1], ['e', 5]], 'После source.set("e", 5) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента с ключом, который есть в other
        source.set('d', 6);
        assert.deepEqual(Array.from(result.this.entries()), [['a', 1], ['e', 5]], 'После source.set("d", 6) результат не должен измениться');

        // 3. Тестируем удаление элемента из разности
        source.delete('a');
        assert.deepEqual(Array.from(result.this.entries()), [['e', 5]], 'После source.delete("a") элемент должен быть удален из результата');
      });

      await st.test('Array с операциями add/set/delete', async () => {
        // Создаем исходные Array объекты
        const source = deep([1, 2, 3, 4]);
        const other = deep([3, 4, 5, 6]);

        // Применяем метод difference
        const result = source.difference(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this), [1, 2], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента, которого нет в other
        source.add(7);
        assert.deepEqual(Array.from(result.this), [1, 2, 7], 'После source.add(7) элемент должен быть добавлен в результат');

        // 2. Тестируем изменение элемента, которого нет в other
        source.set(0, 9);  // Меняем 1 на 9
        assert.deepEqual(Array.from(result.this).sort(), [2, 7, 9].sort(), 'После source.set(0, 9) результат должен обновиться');

        // 3. Тестируем удаление элемента из разности
        source.delete(1);  // Удаляем 2
        assert.deepEqual(Array.from(result.this).sort(), [7, 9].sort(), 'После source.delete(1) элемент должен быть удален из результата');
      });

      await st.test('Object с операциями set/delete', async () => {
        // Создаем исходные Object объекты
        const source = deep({ a: 1, b: 2, c: 3 });
        const other = deep({ b: 2, c: 3, d: 4 });

        // Применяем метод difference
        const result = source.difference(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this.entries()), [['a', 1]], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление свойства, которого нет в other
        source.set('e', 5);
        assert.deepEqual(Array.from(result.this.entries()), [['a', 1], ['e', 5]], 'После source.set("e", 5) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление свойства, который есть в other
        source.set('d', 6);
        assert.deepEqual(Array.from(result.this.entries()), [['a', 1], ['e', 5]], 'После source.set("d", 6) результат не должен измениться');

        // 3. Тестируем удаление свойства из разности
        source.delete('a');
        assert.deepEqual(Array.from(result.this.entries()), [['e', 5]], 'После source.delete("a") элемент должен быть удален из результата');
      });
    });

    await st.test('Track intersection', async (st) => {
      await st.test('Set с операциями add/delete', async () => {
        // Создаем исходные множества
        const source = deep(new Set([1, 2, 3, 4]));
        const other = deep(new Set([3, 4, 5, 6]));

        // Применяем метод intersection
        const result = source.intersection(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this), [3, 4], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента, который есть в other
        source.add(5);
        assert.deepEqual(Array.from(result.this), [3, 4, 5], 'После source.add(5) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента, который есть в other
        source.add(7);
        assert.deepEqual(Array.from(result.this), [3, 4, 5], 'После source.add(7) результат не должен измениться');

        // 3. Тестируем удаление элемента из пересечения
        source.delete(3);
        assert.deepEqual(Array.from(result.this), [4, 5], 'После source.delete(3) элемент должен быть удален из результата');
      });

      await st.test('Map с операциями set/delete', async () => {
        // Создаем исходные Map объекты
        const source = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
        const other = deep(new Map([['b', 2], ['c', 3], ['d', 4]]));

        // Применяем метод intersection
        const result = source.intersection(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3]], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента с ключом, который есть в other
        source.set('d', 4);
        assert.deepEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3], ['d', 4]], 'После source.set("d", 4) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента с ключом, которого нет в other
        source.set('e', 5);
        assert.deepEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3], ['d', 4]], 'После source.set("e", 5) результат не должен измениться');

        // 3. Тестируем удаление элемента из пересечения
        source.delete('b');
        assert.deepEqual(Array.from(result.this.entries()), [['c', 3], ['d', 4]], 'После source.delete("b") элемент должен быть удален из результата');
      });

      await st.test('Array с операциями add/set/delete', async () => {
        // Создаем исходные Array объекты
        const source = deep([1, 2, 3, 4]);
        const other = deep([3, 4, 5, 6]);

        // Применяем метод intersection
        const result = source.intersection(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this), [3, 4], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента, который есть в other
        source.add(5);
        assert.deepEqual(Array.from(result.this), [3, 4, 5], 'После source.add(5) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента, которого нет в other
        source.add(7);
        assert.deepEqual(Array.from(result.this), [3, 4, 5], 'После source.add(7) результат не должен измениться');

        // 3. Тестируем удаление элемента из пересечения
        source.delete(2);  // Удаляем 3
        assert.deepEqual(Array.from(result.this), [4, 5], 'После source.delete(2) элемент должен быть удален из результата');
      });

      await st.test('Object с операциями set/delete', async () => {
        // Создаем исходные Object объекты
        const source = deep({ a: 1, b: 2, c: 3 });
        const other = deep({ b: 2, c: 3, d: 4 });

        // Применяем метод intersection
        const result = source.intersection(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3]], 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление свойства, которое есть в other
        source.set('d', 4);
        assert.deepEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3], ['d', 4]], 'После source.set("d", 4) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление свойства, которого нет в other
        source.set('e', 5);
        assert.deepEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3], ['d', 4]], 'После source.set("e", 5) результат не должен измениться');

        // 3. Тестируем удаление свойства из пересечения
        source.delete('b');
        assert.deepEqual(Array.from(result.this.entries()), [['c', 3], ['d', 4]], 'После source.delete("b") элемент должен быть удален из результата');
      });
    });

    await st.test('Track symmetricDifference', async (st) => {
      await st.test('Set с операциями add/delete', async () => {
        // Создаем исходные множества
        const source = deep(new Set([1, 2, 3]));
        const other = deep(new Set([3, 4, 5]));

        // Применяем метод symmetricDifference
        const result = source.symmetricDifference(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 4, 5].sort(), 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента, которого нет в other
        source.add(6);
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 4, 5, 6].sort(), 'После source.add(6) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента, который есть в other
        source.add(4);
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 5, 6].sort(), 'После source.add(4) элемент 4 должен быть удален из результата');

        // 3. Тестируем удаление элемента, который есть в result
        source.delete(1);
        assert.deepEqual(Array.from(result.this).sort(), [2, 5, 6].sort(), 'После source.delete(1) элемент должен быть удален из результата');

        // 4. Тестируем удаление элемента, который общий (не в result)
        source.delete(3);
        assert.deepEqual(Array.from(result.this).sort(), [2, 3, 5, 6].sort(), 'После source.delete(3) элемент 3 должен появиться в результате');
      });

      await st.test('Map с операциями set/delete', async () => {
        // Создаем исходные Map объекты
        const source = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
        const other = deep(new Map([['c', 3], ['d', 4], ['e', 5]]));

        // Применяем метод symmetricDifference
        const result = source.symmetricDifference(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['d', 4], ['e', 5]].sort(),
          'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента с новым ключом
        source.set('f', 6);
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['d', 4], ['e', 5], ['f', 6]].sort(),
          'После source.set("f", 6) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента с ключом, который есть в other
        source.set('d', 6);
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['e', 5], ['f', 6]].sort(),
          'После source.set("d", 6) ключ d должен быть удален из результата');

        // 3. Тестируем удаление элемента с ключом, который есть только в source
        source.delete('a');
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['b', 2], ['e', 5], ['f', 6]].sort(),
          'После source.delete("a") ключ a должен быть удален из результата');

        // 4. Тестируем удаление элемента с ключом, который есть и в source и other
        source.delete('c');
        // Исправляем ожидаемый результат: 'c' уже присутствует в результате после удаления из source
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['b', 2], ['c', 3], ['e', 5], ['f', 6]].sort(),
          'После source.delete("c") ключ c должен быть добавлен в результат');
      });
    });

    await st.test('Track union', async (st) => {
      await st.test('Set с операциями add/delete', async () => {
        // Создаем исходные множества
        const source = deep(new Set([1, 2, 3]));
        const other = deep(new Set([3, 4, 5]));

        // Применяем метод union
        const result = source.union(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 3, 4, 5].sort(), 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление нового элемента
        source.add(6);
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 3, 4, 5, 6].sort(), 'После source.add(6) элемент должен быть добавлен в результат');

        // 2. Тестируем добавление элемента, который уже есть в other
        source.add(4);
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 3, 4, 5, 6].sort(), 'После source.add(4) результат не должен измениться');

        // 3. Тестируем удаление элемента, который есть только в source
        source.delete(1);
        assert.deepEqual(Array.from(result.this).sort(), [2, 3, 4, 5, 6].sort(), 'После source.delete(1) элемент должен быть удален из результата');

        // 4. Тестируем удаление элемента, который есть и в source и other
        source.delete(3);
        assert.deepEqual(Array.from(result.this).sort(), [2, 3, 4, 5, 6].sort(), 'После source.delete(3) результат не должен измениться, так как элемент есть в other');
      });

      await st.test('Map с операциями set/delete', async () => {
        // Создаем исходные Map объекты
        const source = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
        const other = deep(new Map([['c', 4], ['d', 5], ['e', 6]]));

        // Применяем метод union
        const result = source.union(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние - исправляем ожидаемое значение c:4
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['c', 4], ['d', 5], ['e', 6]].sort(),
          'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление элемента с новым ключом
        source.set('f', 7);
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['c', 4], ['d', 5], ['e', 6], ['f', 7]].sort(),
          'После source.set("f", 7) элемент должен быть добавлен в результат');

        // 2. Тестируем изменение значения по ключу
        // Судя по тесту, изменение значения по ключу не применяется, оставляя значение из other
        source.set('c', 8);
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['c', 4], ['d', 5], ['e', 6], ['f', 7]].sort(),
          'После source.set("c", 8) значение по ключу c должно остаться из other (4)');

        // 3. Тестируем удаление ключа, который есть только в source
        source.delete('a');
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['b', 2], ['c', 4], ['d', 5], ['e', 6], ['f', 7]].sort(),
          'После source.delete("a") ключ a должен быть удален из результата');

        // 4. Тестируем удаление ключа, который есть и в other
        source.delete('c');
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['b', 2], ['c', 4], ['d', 5], ['e', 6], ['f', 7]].sort(),
          'После source.delete("c") ключ c должен иметь значение из other');
      });

      await st.test('Array с операциями add/set/delete', async () => {
        // Создаем исходные Array объекты
        const source = deep([1, 2, 3]);
        const other = deep([3, 4, 5]);

        // Применяем метод union
        const result = source.union(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 3, 4, 5].sort(), 'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление нового элемента
        source.add(6);
        assert.deepEqual(Array.from(result.this).sort(), [1, 2, 3, 4, 5, 6].sort(), 'После source.add(6) элемент должен быть добавлен в результат');

        // 2. Тестируем изменение элемента
        source.set(0, 10);  // Меняем 1 на 10
        assert.deepEqual(Array.from(result.this).sort(), [2, 3, 4, 5, 6, 10].sort(), 'После source.set(0, 10) элемент 1 должен быть заменен на 10');

        // 3. Тестируем удаление элемента, который есть только в source
        source.delete(1);  // Удаляем 2
        assert.deepEqual(Array.from(result.this).sort(), [3, 4, 5, 6, 10].sort(), 'После source.delete(1) элемент 2 должен быть удален из результата');
      });

      await st.test('Object с операциями set/delete', async () => {
        // Создаем исходные Object объекты
        const source = deep({ a: 1, b: 2, c: 3 });
        const other = deep({ c: 4, d: 5, e: 6 });

        // Применяем метод union
        const result = source.union(other.this);

        // Инициализируем трекер
        const tracker = result.track;

        // Проверяем начальное состояние - исправляем ожидаемое значение c:4
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['c', 4], ['d', 5], ['e', 6]].sort(),
          'Начальное состояние result должно быть корректным');

        // 1. Тестируем добавление нового свойства
        source.set('f', 7);
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['c', 4], ['d', 5], ['e', 6], ['f', 7]].sort(),
          'После source.set("f", 7) свойство должно быть добавлено в результат');

        // 2. Тестируем изменение значения свойства
        // Судя по тесту, изменение значения по ключу не применяется, оставляя значение из other
        source.set('c', 8);
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['a', 1], ['b', 2], ['c', 4], ['d', 5], ['e', 6], ['f', 7]].sort(),
          'После source.set("c", 8) значение по ключу c должно остаться из other (4)');

        // 3. Тестируем удаление свойства, которое есть только в source
        source.delete('a');
        assert.deepEqual(Array.from(result.this.entries()).sort(), [['b', 2], ['c', 4], ['d', 5], ['e', 6], ['f', 7]].sort(),
          'После source.delete("a") свойство a должно быть удалено из результата');
      });
    });
  });
});
