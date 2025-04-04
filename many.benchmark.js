/**
 * Тесты производительности для many.js
 */

import Benchmarkify from 'benchmarkify';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { deep } from './index.js';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Many.js Benchmarks', {
  description: 'Тесты производительности для работы с множественными структурами данных'
}).printHeader();

// Подготавливаем данные для тестов
const smallSet1 = new Set([1, 2, 3, 4]);
const smallSet2 = new Set([3, 4, 5, 6]);
const smallArr1 = [1, 2, 3, 4];
const smallArr2 = [3, 4, 5, 6];
const smallMap1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
const smallMap2 = new Map([['b', 2], ['c', 3], ['d', 4]]);
const smallObj1 = { a: 1, b: 2, c: 3 };
const smallObj2 = { b: 2, c: 3, d: 4 };

// Большие наборы данных
const bigSet1 = new Set(Array.from({ length: 1000 }, (_, i) => i));
const bigSet2 = new Set(Array.from({ length: 1000 }, (_, i) => i + 500));
const bigArr1 = Array.from({ length: 1000 }, (_, i) => i);
const bigArr2 = Array.from({ length: 1000 }, (_, i) => i + 500);
const bigMap1 = new Map(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));
const bigMap2 = new Map(Array.from({ length: 1000 }, (_, i) => [`key${i + 500}`, i + 500]));
const bigObj1 = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));
const bigObj2 = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i + 500}`, i + 500]));

// Данные для тестирования множественных аргументов
const multiSet1 = new Set([1, 2, 3, 4, 5]);
const multiSet2 = new Set([3, 4, 5, 6, 7]);
const multiSet3 = new Set([5, 6, 7, 8, 9]);
const multiSet4 = new Set([7, 8, 9, 10, 11]);

// Бенчмарк для тестирования операций с множественными аргументами
benchmark.createSuite('Методы с множественными аргументами')
  .add('difference с двумя аргументами', () => {
    deep(multiSet1).difference(multiSet2);
  })
  .add('difference с тремя аргументами', () => {
    deep(multiSet1).difference(multiSet2, multiSet3);
  })
  .add('difference с четырьмя аргументами', () => {
    deep(multiSet1).difference(multiSet2, multiSet3, multiSet4);
  })
  .add('intersection с двумя аргументами', () => {
    deep(multiSet1).intersection(multiSet2);
  })
  .add('intersection с тремя аргументами', () => {
    deep(multiSet1).intersection(multiSet2, multiSet3);
  })
  .add('intersection с четырьмя аргументами', () => {
    deep(multiSet1).intersection(multiSet2, multiSet3, multiSet4);
  })
  .add('symmetricDifference с двумя аргументами', () => {
    deep(multiSet1).symmetricDifference(multiSet2);
  })
  .add('symmetricDifference с тремя аргументами', () => {
    deep(multiSet1).symmetricDifference(multiSet2, multiSet3);
  })
  .add('symmetricDifference с четырьмя аргументами', () => {
    deep(multiSet1).symmetricDifference(multiSet2, multiSet3, multiSet4);
  })
  .add('union с двумя аргументами', () => {
    deep(multiSet1).union(multiSet2);
  })
  .add('union с тремя аргументами', () => {
    deep(multiSet1).union(multiSet2, multiSet3);
  })
  .add('union с четырьмя аргументами', () => {
    deep(multiSet1).union(multiSet2, multiSet3, multiSet4);
  });

// Бенчмарк для разности множеств (4 элемента)
benchmark.createSuite('difference (4 elements)')
  .add('set.difference(set)', () => {
    deep(smallSet1).difference(smallSet2);
  })
  .add('array.difference(set)', () => {
    deep(smallArr1).difference(smallSet2);
  })
  .add('set.difference(array)', () => {
    deep(smallSet1).difference(smallArr2);
  })
  .add('array.difference(array)', () => {
    deep(smallArr1).difference(smallArr2);
  })
  .add('map.difference(map)', () => {
    deep(smallMap1).difference(smallMap2);
  })
  .add('object.difference(map)', () => {
    deep(smallObj1).difference(smallMap2);
  })
  .add('map.difference(object)', () => {
    deep(smallMap1).difference(smallObj2);
  })
  .add('object.difference(object)', () => {
    deep(smallObj1).difference(smallObj2);
  });

// Бенчмарк для разности множеств (1000 элементов)
benchmark.createSuite('difference (1000 elements)')
  .add('set.difference(set)', () => {
    deep(bigSet1).difference(bigSet2);
  })
  .add('array.difference(set)', () => {
    deep(bigArr1).difference(bigSet2);
  })
  .add('set.difference(array)', () => {
    deep(bigSet1).difference(bigArr2);
  })
  .add('array.difference(array)', () => {
    deep(bigArr1).difference(bigArr2);
  })
  .add('map.difference(map)', () => {
    deep(bigMap1).difference(bigMap2);
  })
  .add('object.difference(map)', () => {
    deep(bigObj1).difference(bigMap2);
  })
  .add('map.difference(object)', () => {
    deep(bigMap1).difference(bigObj2);
  })
  .add('object.difference(object)', () => {
    deep(bigObj1).difference(bigObj2);
  });

// Бенчмарк для пересечения множеств (4 элемента)
benchmark.createSuite('intersection (4 elements)')
  .add('set.intersection(set)', () => {
    deep(smallSet1).intersection(smallSet2);
  })
  .add('array.intersection(set)', () => {
    deep(smallArr1).intersection(smallSet2);
  })
  .add('set.intersection(array)', () => {
    deep(smallSet1).intersection(smallArr2);
  })
  .add('array.intersection(array)', () => {
    deep(smallArr1).intersection(smallArr2);
  })
  .add('map.intersection(map)', () => {
    deep(smallMap1).intersection(smallMap2);
  })
  .add('object.intersection(map)', () => {
    deep(smallObj1).intersection(smallMap2);
  })
  .add('map.intersection(object)', () => {
    deep(smallMap1).intersection(smallObj2);
  })
  .add('object.intersection(object)', () => {
    deep(smallObj1).intersection(smallObj2);
  });

// Бенчмарк для пересечения множеств (1000 элементов)
benchmark.createSuite('intersection (1000 elements)')
  .add('set.intersection(set)', () => {
    deep(bigSet1).intersection(bigSet2);
  })
  .add('array.intersection(set)', () => {
    deep(bigArr1).intersection(bigSet2);
  })
  .add('set.intersection(array)', () => {
    deep(bigSet1).intersection(bigArr2);
  })
  .add('array.intersection(array)', () => {
    deep(bigArr1).intersection(bigArr2);
  })
  .add('map.intersection(map)', () => {
    deep(bigMap1).intersection(bigMap2);
  })
  .add('object.intersection(map)', () => {
    deep(bigObj1).intersection(bigMap2);
  })
  .add('map.intersection(object)', () => {
    deep(bigMap1).intersection(bigObj2);
  })
  .add('object.intersection(object)', () => {
    deep(bigObj1).intersection(bigObj2);
  });

// Бенчмарк для симметрической разности множеств (4 элемента)
benchmark.createSuite('symmetricDifference (4 elements)')
  .add('set.symmetricDifference(set)', () => {
    deep(smallSet1).symmetricDifference(smallSet2);
  })
  .add('array.symmetricDifference(set)', () => {
    deep(smallArr1).symmetricDifference(smallSet2);
  })
  .add('set.symmetricDifference(array)', () => {
    deep(smallSet1).symmetricDifference(smallArr2);
  })
  .add('array.symmetricDifference(array)', () => {
    deep(smallArr1).symmetricDifference(smallArr2);
  })
  .add('map.symmetricDifference(map)', () => {
    deep(smallMap1).symmetricDifference(smallMap2);
  })
  .add('object.symmetricDifference(map)', () => {
    deep(smallObj1).symmetricDifference(smallMap2);
  })
  .add('map.symmetricDifference(object)', () => {
    deep(smallMap1).symmetricDifference(smallObj2);
  })
  .add('object.symmetricDifference(object)', () => {
    deep(smallObj1).symmetricDifference(smallObj2);
  });

// Бенчмарк для симметрической разности множеств (1000 элементов)
benchmark.createSuite('symmetricDifference (1000 elements)')
  .add('set.symmetricDifference(set)', () => {
    deep(bigSet1).symmetricDifference(bigSet2);
  })
  .add('array.symmetricDifference(set)', () => {
    deep(bigArr1).symmetricDifference(bigSet2);
  })
  .add('set.symmetricDifference(array)', () => {
    deep(bigSet1).symmetricDifference(bigArr2);
  })
  .add('array.symmetricDifference(array)', () => {
    deep(bigArr1).symmetricDifference(bigArr2);
  })
  .add('map.symmetricDifference(map)', () => {
    deep(bigMap1).symmetricDifference(bigMap2);
  })
  .add('object.symmetricDifference(map)', () => {
    deep(bigObj1).symmetricDifference(bigMap2);
  })
  .add('map.symmetricDifference(object)', () => {
    deep(bigMap1).symmetricDifference(bigObj2);
  })
  .add('object.symmetricDifference(object)', () => {
    deep(bigObj1).symmetricDifference(bigObj2);
  });

// Бенчмарк для объединения множеств (4 элемента)
benchmark.createSuite('union (4 elements)')
  .add('set.union(set)', () => {
    deep(smallSet1).union(smallSet2);
  })
  .add('array.union(set)', () => {
    deep(smallArr1).union(smallSet2);
  })
  .add('set.union(array)', () => {
    deep(smallSet1).union(smallArr2);
  })
  .add('array.union(array)', () => {
    deep(smallArr1).union(smallArr2);
  })
  .add('map.union(map)', () => {
    deep(smallMap1).union(smallMap2);
  })
  .add('object.union(map)', () => {
    deep(smallObj1).union(smallMap2);
  })
  .add('map.union(object)', () => {
    deep(smallMap1).union(smallObj2);
  })
  .add('Map объединение с deep', () => {
    deep(smallMap1).union(smallMap2);

  })
  .add('Object объединение с deep', () => {
    deep(smallObj1).union(smallObj2);
  });

// Бенчмарк для объединения множеств (большие коллекции)
benchmark.createSuite('Объединение множеств (большие коллекции)')
  .add('Set объединение большой коллекции с deep', () => {
    deep(bigSet1).union(bigSet2);
  })
  .add('Set объединение большой коллекции с нативной реализацией', () => {
    new Set([...bigSet1, ...bigSet2]);
  })
  .add('Array объединение большой коллекции с deep', () => {
    deep(bigArr1).union(bigArr2);
  })
  .add('Array объединение большой коллекции с нативной реализацией', () => {
    new Set([...bigArr1, ...bigArr2]);
  })
  .add('Map объединение большой коллекции с deep', () => {
    deep(bigMap1).union(bigMap2);

  })
  .add('Object объединение большой коллекции с deep', () => {
    deep(bigObj1).union(bigObj2);
  });

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для many.js...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'MANY.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();


