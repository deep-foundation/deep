/**
 * Тесты для модуля many.js
 */

import { deep } from './index.js';
import assert from 'node:assert';
import test from 'node:test';

test('Операции над множествами', async (t) => {
  await t.test('difference - разность множеств', async (t) => {
    // Тест для Set
    await t.test('difference для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Разность множеств
      const result = deep(set1).difference(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [1, 2], 'Должны остаться только элементы из первого множества');
    });

    // Тест для Array
    await t.test('difference для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Разность массивов
      const result = deep(arr1).difference(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [1, 2], 'Должны остаться только элементы из первого массива');
    });

    // Тест для Map
    await t.test('difference для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Разность карт
      const result = deep(map1).difference(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1]], 'Должны остаться только элементы из первой карты');
    });

    // Тест для Object
    await t.test('difference для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };

      // Разность объектов
      const result = deep(obj1).difference(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1]], 'Должны остаться только элементы из первого объекта');
    });

    // Тест несовместимости типов
    await t.test('difference для несовместимых типов', () => {
      const set = new Set([1, 2, 3]);
      const obj = { a: 1, b: 2 };
      const map = new Map([['a', 1]]);
      const arr = [1, 2, 3];

      // Проверка смешивания Set с Object
      assert.throws(
        () => deep(set).difference(obj),
        { message: 'difference метод не поддерживает смешивание массивов/множеств с объектами/картами' }
      );

      // Проверка смешивания Map с Array
      assert.throws(
        () => deep(map).difference(arr),
        { message: 'difference метод не поддерживает смешивание массивов/множеств с объектами/картами' }
      );
    });
  });

  await t.test('intersection - пересечение множеств', async (t) => {
    // Тест для Set
    await t.test('intersection для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Пересечение множеств
      const result = deep(set1).intersection(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [3, 4], 'Должны остаться только общие элементы');
    });

    // Тест для Array
    await t.test('intersection для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Пересечение массивов
      const result = deep(arr1).intersection(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this), [3, 4], 'Должны остаться только общие элементы');
    });

    // Тест для Map
    await t.test('intersection для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Пересечение карт
      const result = deep(map1).intersection(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3]], 'Должны остаться только общие элементы');
    });

    // Тест для Object
    await t.test('intersection для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };

      // Пересечение объектов
      const result = deep(obj1).intersection(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['b', 2], ['c', 3]], 'Должны остаться только общие элементы');
    });
  });

  await t.test('symmetricDifference - симметрическая разность множеств', async (t) => {
    // Тест для Set
    await t.test('symmetricDifference для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);

      // Симметрическая разность множеств
      const result = deep(set1).symmetricDifference(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      const resultArray = Array.from(result.this);
      assert.ok(resultArray.includes(1), 'Должен содержать 1');
      assert.ok(resultArray.includes(2), 'Должен содержать 2');
      assert.ok(resultArray.includes(5), 'Должен содержать 5');
      assert.ok(resultArray.includes(6), 'Должен содержать 6');
      assert.ok(!resultArray.includes(3), 'Не должен содержать 3');
      assert.ok(!resultArray.includes(4), 'Не должен содержать 4');
    });

    // Тест для Array
    await t.test('symmetricDifference для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];

      // Симметрическая разность массивов
      const result = deep(arr1).symmetricDifference(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      const resultArray = Array.from(result.this);
      assert.ok(resultArray.includes(1), 'Должен содержать 1');
      assert.ok(resultArray.includes(2), 'Должен содержать 2');
      assert.ok(resultArray.includes(5), 'Должен содержать 5');
      assert.ok(resultArray.includes(6), 'Должен содержать 6');
      assert.ok(!resultArray.includes(3), 'Не должен содержать 3');
      assert.ok(!resultArray.includes(4), 'Не должен содержать 4');
    });

    // Тест для Map
    await t.test('symmetricDifference для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);

      // Симметрическая разность карт
      const result = deep(map1).symmetricDifference(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['d', 4]], 'Должны остаться только уникальные элементы');
    });

    // Тест для Object
    await t.test('symmetricDifference для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };

      // Симметрическая разность объектов
      const result = deep(obj1).symmetricDifference(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['d', 4]], 'Должны остаться только уникальные элементы');
    });
  });

  await t.test('union', async (t) => {
    // Тест для Set
    await t.test('union для Set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);
      const result = deep(set1).union(set2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual([...result.this], [1, 2, 3, 4, 5, 6], 'Должны быть все элементы из обоих множеств');
    });

    // Тест для Array
    await t.test('union для Array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];
      const result = deep(arr1).union(arr2);
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual([...result.this], [1, 2, 3, 4, 5, 6], 'Должны быть все элементы из обоих массивов');
    });

    // Тест для Map
    await t.test('union для Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);
      const result = deep(map1).union(map2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['b', 2], ['c', 3], ['d', 4]], 'Должны быть все элементы из обеих карт');
    });

    // Тест для Object
    await t.test('union для Object', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 2, c: 3, d: 4 };
      const result = deep(obj1).union(obj2);
      assert(result.this instanceof Map, 'Результат должен быть Map');
      assert.deepStrictEqual(Array.from(result.this.entries()), [['a', 1], ['b', 2], ['c', 3], ['d', 4]], 'Должны быть все элементы из обоих объектов');
    });

    // Тест несовместимости типов
    await t.test('union для несовместимых типов', () => {
      const set = new Set([1, 2, 3]);
      const obj = { a: 1, b: 2 };
      const map = new Map([['a', 1]]);
      const arr = [1, 2, 3];

      // Проверка смешивания Set с Object
      assert.throws(
        () => deep(set).union(obj),
        { message: 'union метод не поддерживает смешивание массивов/множеств с объектами/картами' }
      );

      // Проверка смешивания Map с Array
      assert.throws(
        () => deep(map).union(arr),
        { message: 'union метод не поддерживает смешивание массивов/множеств с объектами/картами' }
      );
    });
  });

  // Тесты для множественных истоков
  await t.test('Множественные истоки (origins)', async (t) => {
    // Тесты для Set и Array (совместимые типы)
    await t.test('difference для Set с множественными истоками', async () => {
      // Создаем два множества
      const set1 = deep(new Set([1, 2, 3, 4]));
      const set2 = deep(new Set([3, 4, 5, 6]));

      // Разность множеств
      const result = set1.difference(set2);

      // Проверяем начальное состояние
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this).sort(), [1, 2].sort(), 'Должны остаться только элементы из первого множества');

      // Проверяем что в origins есть оба истока
      assert.strictEqual(result.origins.length, 2, 'Origins должен содержать два истока');
      assert.strictEqual(result.origins[0], set1, 'Первый исток должен быть set1');

      // Проверяем, что set1.difference(set2) === [1, 2]
      assert.deepStrictEqual(Array.from(result.this).sort(), [1, 2].sort(), 'Начальное состояние - разность [1, 2, 3, 4] и [3, 4, 5, 6] равна [1, 2]');

      // Добавляем элемент 7 в set1
      set1.add(7);

      // Ручной расчет ожидаемой разности
      const expected = new Set();
      for (const item of set1.this) {
        if (!set2.this.has(item)) {
          expected.add(item);
        }
      }

      // Проверяем ручной расчет
      assert.deepStrictEqual(Array.from(expected).sort(), [1, 2, 7].sort(), 'После добавления 7 в первый исток, при ручном расчете должно быть [1, 2, 7]');
    });

    await t.test('intersection для Set с множественными истоками', async () => {
      // Создаем два множества
      const set1 = deep(new Set([1, 2, 3, 4]));
      const set2 = deep(new Set([3, 4, 5, 6]));

      // Пересечение множеств
      const result = set1.intersection(set2);

      // Проверяем начальное состояние
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this).sort(), [3, 4].sort(), 'Должны остаться только общие элементы');

      // Проверяем что в origins есть оба истока
      assert.strictEqual(result.origins.length, 2, 'Origins должен содержать два истока');
      assert.strictEqual(result.origins[0], set1, 'Первый исток должен быть set1');

      // Добавляем элемент в первый исток
      set1.add(6);

      // Ручной расчет ожидаемого пересечения
      const expected = new Set();
      for (const item of set1.this) {
        if (set2.this.has(item)) {
          expected.add(item);
        }
      }

      // Проверяем ручной расчет
      assert.deepStrictEqual(Array.from(expected).sort(), [3, 4, 6].sort(), 'После добавления в первый исток элемента, при ручном расчете должно быть [3, 4, 6]');
    });

    await t.test('symmetricDifference для Set с множественными истоками', async () => {
      // Создаем два множества
      const set1 = deep(new Set([1, 2, 3]));
      const set2 = deep(new Set([2, 3, 4]));

      // Симметрическая разность множеств
      const result = set1.symmetricDifference(set2);

      // Проверяем начальное состояние: (set1 △ set2) = {1, 4}
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this).sort(), [1, 4].sort(), 'Должны быть только уникальные элементы');

      // Проверяем что в origins есть оба истока
      assert.strictEqual(result.origins.length, 2, 'Origins должен содержать два истока');
      assert.strictEqual(result.origins[0], set1, 'Первый исток должен быть set1');

      // Добавляем элемент, которого нет в других истоках
      set1.add(6);

      // Ручной расчет ожидаемой симметрической разности
      const symDiff = new Set();

      for (const item of set1.this) {
        if (!set2.this.has(item)) {
          symDiff.add(item);
        }
      }

      for (const item of set2.this) {
        if (!set1.this.has(item)) {
          symDiff.add(item);
        }
      }

      // Проверяем ручной расчет
      assert.deepStrictEqual(Array.from(symDiff).sort(), [1, 4, 6].sort(), 'После добавления 6 при ручном расчете должно получиться [1, 4, 6]');
    });

    await t.test('union для Set с множественными истоками', async () => {
      // Создаем два множества
      const set1 = deep(new Set([1, 2]));
      const set2 = deep(new Set([3, 4]));

      // Объединение множеств
      const result = set1.union(set2);

      // Проверяем начальное состояние: (set1 ∪ set2) = {1, 2, 3, 4}
      assert(result.this instanceof Set, 'Результат должен быть Set');
      assert.deepStrictEqual(Array.from(result.this).sort(), [1, 2, 3, 4].sort(), 'Должны быть все элементы из обоих множеств');

      // Проверяем что в origins есть оба истока
      assert.strictEqual(result.origins.length, 2, 'Origins должен содержать два истока');
      assert.strictEqual(result.origins[0], set1, 'Первый исток должен быть set1');

      // Добавляем новый элемент в один из истоков
      set1.add(7);

      // Ручной расчет ожидаемого объединения
      const expected = new Set();
      for (const item of set1.this) expected.add(item);
      for (const item of set2.this) expected.add(item);

      // Проверяем ручной расчет
      assert.deepStrictEqual(Array.from(expected).sort(), [1, 2, 3, 4, 7].sort(), 'При ручном расчете должны быть все элементы включая новый');
    });

    // Тесты для Map (отдельный набор совместимых типов)
    await t.test('множественные истоки для Map', async () => {
      // Создаем две карты
      const map1 = deep(new Map([['a', 1], ['b', 2]]));
      const map2 = deep(new Map([['b', 3], ['c', 4]]));

      // Разность карт
      const diff = map1.difference(map2);
      // Проверяем что в разности только ключи из первой карты, которых нет во второй
      assert.deepStrictEqual(Array.from(diff.this.entries()), [['a', 1]], 'difference должен содержать только уникальные ключи из первой карты');

      // Проверяем что в origins есть оба истока
      assert.strictEqual(diff.origins.length, 2, 'Origins должен содержать два истока');
      assert.strictEqual(diff.origins[0], map1, 'Первый исток должен быть map1');

      // Изменяем первый исток - добавляем новый ключ
      map1.set('d', 5);

      // Ручной расчет ожидаемой разности
      const diffMap = new Map();
      for (const [key, value] of map1.this.entries()) {
        if (!map2.this.has(key)) {
          diffMap.set(key, value);
        }
      }

      // Проверяем ручной расчет
      const diffEntries = Array.from(diffMap.entries());
      const expectedEntries = [['a', 1], ['d', 5]];
      assert.strictEqual(diffEntries.length, expectedEntries.length, 'При ручном расчете должно быть 2 ключа');
      assert(diffEntries.some(([k, v]) => k === 'a' && v === 1), 'При ручном расчете должен быть ключ a=1');
      assert(diffEntries.some(([k, v]) => k === 'd' && v === 5), 'При ручном расчете должен быть ключ d=5');
    });
  });
});
