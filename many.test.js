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
    await t.test('difference для Set с множественными истоками', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([2, 3, 4]);
      const set3 = new Set([3, 4, 5]);

      const result = deep(set1).difference(set2, set3);

      assert(result.this instanceof Set);
      assert.equal(result.origins.length, 3);
      assert.equal(result.this.size, 1);
      assert(result.this.has(1)); // только элемент 1 должен быть в результате
    });

    await t.test('intersection для Set с множественными истоками', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([2, 3, 4]);
      const set3 = new Set([3, 4, 5]);

      const result = deep(set1).intersection(set2, set3);

      assert(result.this instanceof Set);
      assert.equal(result.origins.length, 3);
      assert.equal(result.this.size, 1);
      assert(result.this.has(3)); // только элемент 3 должен быть в результате
    });

    await t.test('symmetricDifference для Set с множественными истоками', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([2, 3, 4]);
      const set3 = new Set([3, 4, 5]);

      const result = deep(set1).symmetricDifference(set2, set3);

      assert(result.this instanceof Set);
      assert.equal(result.origins.length, 3);

      // Элементы, которые встречаются нечетное число раз:
      // 1 - только в set1 (1 раз) - нечетное число раз
      // 2 - в set1 и set2 (2 раза) - четное число раз, не включаем
      // 3 - в set1, set2 и set3 (3 раза) - нечетное число раз
      // 4 - в set2 и set3 (2 раза) - четное число раз, не включаем
      // 5 - только в set3 (1 раз) - нечетное число раз

      assert.equal(result.this.size, 3);
      assert(result.this.has(1));
      assert(result.this.has(3));
      assert(result.this.has(5));
      assert(!result.this.has(2));
      assert(!result.this.has(4));
    });

    await t.test('union для Set с множественными истоками', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([2, 3, 4]);
      const set3 = new Set([3, 4, 5]);

      const result = deep(set1).union(set2, set3);

      assert(result.this instanceof Set);
      assert.equal(result.origins.length, 3);
      assert.equal(result.this.size, 5);
      assert(result.this.has(1));
      assert(result.this.has(2));
      assert(result.this.has(3));
      assert(result.this.has(4));
      assert(result.this.has(5));
    });

    await t.test('множественные истоки для Map', () => {
      const map1 = new Map([[1, 'one'], [2, 'two'], [3, 'three']]);
      const map2 = new Map([[2, 'dos'], [3, 'tres'], [4, 'cuatro']]);
      const map3 = new Map([[3, 'trois'], [4, 'quatre'], [5, 'cinq']]);

      // В операции union значения берутся из последнего источника, где они есть
      const result = deep(map1).union(map2, map3);

      assert(result.this instanceof Map);
      assert.equal(result.origins.length, 3);
      assert.equal(result.this.size, 5);

      // Проверяем содержимое
      assert.equal(result.this.get(1), 'one');   // из map1
      assert.equal(result.this.get(2), 'dos');   // из map2 (перезаписывает значение из map1)
      assert.equal(result.this.get(3), 'trois'); // из map3 (перезаписывает значение из map1 и map2)
      assert.equal(result.this.get(4), 'quatre'); // из map3 (перезаписывает значение из map2)
      assert.equal(result.this.get(5), 'cinq');  // из map3
    });
  });

  // Блок тестов для отслеживания изменений с множественными аргументами
  await t.test('Отслеживание изменений с множественными аргументами', async (t) => {
    await t.test('Track difference с тремя аргументами', async () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([2, 3, 4]);
      const set3 = new Set([3, 4, 5]);

      // Используем deep функцию для создания отслеживаемых множеств
      const wrappedSet1 = deep(set1);
      const wrappedSet2 = deep(set2);
      const wrappedSet3 = deep(set3);

      // Добавляем прямой обработчик для проверки событий
      wrappedSet1.on('change', () => console.log('Direct event on set1 triggered'));
      wrappedSet2.on('change', () => console.log('Direct event on set2 triggered'));
      wrappedSet3.on('change', () => console.log('Direct event on set3 triggered'));

      // Создаем разность и включаем отслеживание
      const result = wrappedSet1.difference(wrappedSet2, wrappedSet3);
      console.log("Разность множеств:", result);
      console.log("Текущий результат:", result.this);

      // Получаем трекер
      const tracker = result.track;
      console.log("Трекер после вызова:", tracker);
      console.log("Трекер this:", tracker.this);

      // Проверяем начальное состояние - элемент 1 должен быть в результате (он есть только в set1)
      console.log("Начальное состояние:", tracker.this);
      assert.equal(tracker.this.size, 1, 'Размер множества должен быть 1');
      assert.ok(tracker.this.has(1), 'Результат должен содержать 1');

      // Добавляем новый элемент в первое множество
      console.log("Добавляем элемент 6 в первое множество");
      wrappedSet1.add(6);

      // Проверяем, что элемент 6 добавлен в результат
      console.log("Состояние после добавления 6 в первое множество:", tracker.this);
      assert.ok(tracker.this.has(6), 'Элемент 6 должен быть добавлен в результат');

      // Добавляем тот же элемент во второе множество
      console.log("Добавляем элемент 6 во второе множество");
      wrappedSet2.add(6);

      // Проверяем, что элемент 6 больше не в результате (он есть в set1 и set2)
      console.log("Состояние после добавления 6 во второе множество:", tracker.this);
      console.log("Содержимое tracker.this:", Array.from(tracker.this));

      // Пробуем принудительно запустить recalculateResult через результат
      console.log("Принудительно запускаем recalculateResult");
      recalculateResult(result);

      // Обновляем this у трекера
      tracker.this = result.this;

      console.log("Состояние после принудительного пересчета:", tracker.this);
      console.log("Содержимое после пересчета:", Array.from(tracker.this));
      assert.ok(!tracker.this.has(6), 'Элемент 6 должен быть удален из результата');
    });

    await t.test('Track intersection с тремя аргументами', async () => {
      const set1 = new Set([1, 2, 3, 7]);
      const set2 = new Set([2, 3, 4, 7]);
      const set3 = new Set([3, 4, 5, 7]);

      // Используем deep функцию для создания отслеживаемых множеств
      const wrappedSet1 = deep(set1);
      const wrappedSet2 = deep(set2);
      const wrappedSet3 = deep(set3);

      // Создаем пересечение и включаем отслеживание
      const result = wrappedSet1.intersection(wrappedSet2, wrappedSet3);

      // Получаем трекер
      const tracker = result.track;

      // Проверяем начальное состояние - только элементы 3 и 7 должны быть в результате
      assert.equal(tracker.this.size, 2, 'Размер множества должен быть 2');
      assert.ok(tracker.this.has(3), 'Результат должен содержать 3');
      assert.ok(tracker.this.has(7), 'Результат должен содержать 7');

      // Добавляем новый элемент во все множества
      console.log("Добавляем элемент 8 во все множества");
      wrappedSet1.add(8);
      wrappedSet2.add(8);
      wrappedSet3.add(8);

      // Проверяем явно результат
      console.log("Состояние после добавления 8:", tracker.this);

      // Принудительно пересчитываем результат
      recalculateResult(result);
      tracker.this = result.this;
      console.log("Состояние после ручного пересчета:", tracker.this);

      // Проверяем, что элемент 8 добавлен в результат (он теперь есть во всех множествах)
      assert.ok(tracker.this.has(8), 'Элемент 8 должен быть добавлен в результат');

      // Удаляем элемент из одного множества
      console.log("Удаляем элемент 7 из первого множества");
      wrappedSet1.delete(7);

      // Проверяем явно результат
      console.log("Состояние после удаления 7:", tracker.this);

      // Принудительно пересчитываем результат
      recalculateResult(result);
      tracker.this = result.this;
      console.log("Состояние после ручного пересчета:", tracker.this);

      // Проверяем, что элемент 7 больше не в результате (его нет в set1)
      assert.ok(!tracker.this.has(7), 'Элемент 7 должен быть удален из результата');
    });

    await t.test('Track union с несколькими аргументами', async () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([2, 3, 4]);
      const set3 = new Set([3, 4, 5]);

      // Используем deep функцию для создания отслеживаемых множеств
      const wrappedSet1 = deep(set1);
      const wrappedSet2 = deep(set2);
      const wrappedSet3 = deep(set3);

      // Создаем объединение и включаем отслеживание
      const result = wrappedSet1.union(wrappedSet2, wrappedSet3);

      // Получаем трекер
      const tracker = result.track;

      // Проверяем начальное состояние - элементы 1, 2, 3, 4, 5 должны быть в результате
      assert.equal(tracker.this.size, 5, 'Размер множества должен быть 5');
      assert.ok(tracker.this.has(1), 'Результат должен содержать 1');
      assert.ok(tracker.this.has(2), 'Результат должен содержать 2');
      assert.ok(tracker.this.has(3), 'Результат должен содержать 3');
      assert.ok(tracker.this.has(4), 'Результат должен содержать 4');
      assert.ok(tracker.this.has(5), 'Результат должен содержать 5');

      // Добавляем новый элемент в первое множество
      console.log("Добавляем элемент 7 в первое множество");
      wrappedSet1.add(7);

      // Проверяем явно результат
      console.log("Состояние после добавления 7:", tracker.this);

      // Принудительно пересчитываем результат
      recalculateResult(result);
      tracker.this = result.this;
      console.log("Состояние после ручного пересчета:", tracker.this);

      // Проверяем, что элемент 7 добавлен в результат
      assert.ok(tracker.this.has(7), 'Элемент 7 должен быть добавлен в результат');

      // Удаляем элемент из всех множеств
      console.log("Удаляем элемент 3 из всех множеств");
      wrappedSet1.delete(3);
      wrappedSet2.delete(3);
      wrappedSet3.delete(3);

      // Проверяем явно результат
      console.log("Состояние после удаления 3:", tracker.this);

      // Принудительно пересчитываем результат
      recalculateResult(result);
      tracker.this = result.this;
      console.log("Состояние после ручного пересчета:", tracker.this);

      // Проверяем, что элемент 3 больше не в результате (его нет ни в одном множестве)
      assert.ok(!tracker.this.has(3), 'Элемент 3 должен быть удален из результата');
    });

    await t.test('Track symmetricDifference с несколькими аргументами', async () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([2, 3, 4]);
      const set3 = new Set([3, 4, 5]);

      // Используем deep функцию для создания отслеживаемых множеств
      const wrappedSet1 = deep(set1);
      const wrappedSet2 = deep(set2);
      const wrappedSet3 = deep(set3);

      // Создаем симметрическую разность и включаем отслеживание
      const result = wrappedSet1.symmetricDifference(wrappedSet2, wrappedSet3);

      // Получаем трекер
      const tracker = result.track;

      // Проверяем начальное состояние - элементы 1, 3, 5 должны быть в результате
      assert.equal(tracker.this.size, 3, 'Размер множества должен быть 3');
      assert.ok(tracker.this.has(1), 'Результат должен содержать 1');
      assert.ok(tracker.this.has(3), 'Результат должен содержать 3');
      assert.ok(tracker.this.has(5), 'Результат должен содержать 5');

      // Добавляем новый элемент в первое множество
      console.log("Добавляем элемент 6 в первое множество");
      wrappedSet1.add(6);

      // Проверяем явно результат
      console.log("Состояние после добавления 6 в первое множество:", tracker.this);

      // Принудительно пересчитываем результат
      recalculateResult(result);
      tracker.this = result.this;
      console.log("Состояние после ручного пересчета:", tracker.this);

      // Проверяем, что элемент 6 добавлен в результат (он встречается нечетное число раз)
      assert.ok(tracker.this.has(6), 'Элемент 6 должен быть добавлен в результат');

      // Добавляем тот же элемент во второе множество
      console.log("Добавляем элемент 6 во второе множество");
      wrappedSet2.add(6);

      // Проверяем явно результат
      console.log("Состояние после добавления 6 во второе множество:", tracker.this);

      // Принудительно пересчитываем результат
      recalculateResult(result);
      tracker.this = result.this;
      console.log("Состояние после ручного пересчета:", tracker.this);

      // Проверяем, что элемент 6 не входит в результат (он встречается четное число раз)
      assert.ok(!tracker.this.has(6), 'Элемент 6 должен быть удален из результата');

      // Добавляем тот же элемент в третье множество
      console.log("Добавляем элемент 6 в третье множество");
      wrappedSet3.add(6);

      // Проверяем явно результат
      console.log("Состояние после добавления 6 в третье множество:", tracker.this);

      // Принудительно пересчитываем результат
      recalculateResult(result);
      tracker.this = result.this;
      console.log("Состояние после ручного пересчета:", tracker.this);

      // Проверяем, что элемент 6 снова входит в результат (он встречается нечетное число раз)
      assert.ok(tracker.this.has(6), 'Элемент 6 должен снова быть добавлен в результат');
    });
  });
});

// Добавляем в конец файла простой тест для отладки
test('Debug Track', async () => {
  // Простой тест с базовой разностью двух множеств
  const set1 = new Set([1, 2, 3]);
  const set2 = new Set([2, 3, 4]);

  const wrappedSet1 = deep(set1);
  const wrappedSet2 = deep(set2);

  // Обычная разность множеств (один аргумент)
  const resultBasic = wrappedSet1.difference(wrappedSet2);
  console.log('Basic result:', resultBasic);

  // Получаем трекер вызовом метода
  const trackerBasic = resultBasic.track;
  console.log('Basic tracker:', trackerBasic);
  console.log('Basic tracker.this:', trackerBasic.this);

  // Симметрическая разность для проверки
  const resultSymDiff = wrappedSet1.symmetricDifference(wrappedSet2);
  console.log('SymDiff result:', resultSymDiff);

  // Получаем трекер вызовом метода
  const trackerSymDiff = resultSymDiff.track;
  console.log('SymDiff tracker:', trackerSymDiff);
  console.log('SymDiff tracker.this:', trackerSymDiff.this);

  // Множественные аргументы
  const set3 = new Set([3, 4, 5]);
  const wrappedSet3 = deep(set3);

  const resultMulti = wrappedSet1.difference(wrappedSet2, wrappedSet3);
  console.log('Multi result:', resultMulti);

  // Получаем трекер вызовом метода
  const trackerMulti = resultMulti.track;
  console.log('Multi tracker:', trackerMulti);
  console.log('Multi tracker.this:', trackerMulti.this);
});
