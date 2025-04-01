/**
 * Тесты производительности для sets.js
 */

import { deep } from './index.js';
import { Association } from './association.js';
import sets from './sets.js';
import Benchmarkify from 'benchmarkify';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';

// Создаем бенчмарк
const benchmark = new Benchmarkify("Sets.js Benchmarks", {
  description: 'Тесты производительности для операций с множествами'
}).printHeader();

// Подготавливаем данные для тестов
const smallArray = [1, 2, 3, 4];
const smallObject = { a: 1, b: 2, c: 3 };
const smallMap = new Map([['a', 1], ['b', 2], ['c', 3]]);
const smallSet = new Set([1, 2, 3, 4]);

const bigArray = Array.from({ length: 1000 }, (_, i) => i);
const bigObject = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));
const bigMap = new Map(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));
const bigSet = new Set(Array.from({ length: 1000 }, (_, i) => i));

// Бенчмарк для set (4 элемента)
benchmark.createSuite('set (4 elements)')
  .add('array.set(index, value)', () => {
    deep([...smallArray]).set(0, 999);
  })
  .add('object.set(key, value)', () => {
    deep({ ...smallObject }).set('a', 999);
  })
  .add('map.set(key, value)', () => {
    deep(new Map(smallMap)).set('a', 999);
  });

// Бенчмарк для set (1000 элементов)
benchmark.createSuite('set (1000 elements)')
  .add('array.set(index, value)', () => {
    deep([...bigArray]).set(0, 999);
  })
  .add('object.set(key, value)', () => {
    deep({ ...bigObject }).set('key0', 999);
  })
  .add('map.set(key, value)', () => {
    deep(new Map(bigMap)).set('key0', 999);
  });

// Бенчмарк для add (4 элемента)
benchmark.createSuite('add (4 elements)')
  .add('array.add(value)', () => {
    deep([...smallArray]).add(999);
  })
  .add('object.add(key, value)', () => {
    deep({ ...smallObject }).add('d', 999);
  })
  .add('map.add(key, value)', () => {
    deep(new Map(smallMap)).add('d', 999);
  })
  .add('set.add(value)', () => {
    deep(new Set(smallSet)).add(999);
  });

// Бенчмарк для add (1000 элементов)
benchmark.createSuite('add (1000 elements)')
  .add('array.add(value)', () => {
    deep([...bigArray]).add(999);
  })
  .add('object.add(key, value)', () => {
    deep({ ...bigObject }).add('key999', 999);
  })
  .add('map.add(key, value)', () => {
    deep(new Map(bigMap)).add('key999', 999);
  })
  .add('set.add(value)', () => {
    deep(new Set(bigSet)).add(999);
  });

// Бенчмарк для delete (4 элемента)
benchmark.createSuite('delete (4 elements)')
  .add('array.delete(index)', () => {
    deep([...smallArray]).delete(0);
  })
  .add('object.delete(key)', () => {
    deep({ ...smallObject }).delete('a');
  })
  .add('map.delete(key)', () => {
    deep(new Map(smallMap)).delete('a');
  })
  .add('set.delete(value)', () => {
    deep(new Set(smallSet)).delete(1);
  });

// Бенчмарк для delete (1000 элементов)
benchmark.createSuite('delete (1000 elements)')
  .add('array.delete(index)', () => {
    deep([...bigArray]).delete(0);
  })
  .add('object.delete(key)', () => {
    deep({ ...bigObject }).delete('key0');
  })
  .add('map.delete(key)', () => {
    deep(new Map(bigMap)).delete('key0');
  })
  .add('set.delete(value)', () => {
    deep(new Set(bigSet)).delete(0);
  });

// Бенчмарк для remove (4 элемента)
benchmark.createSuite('remove (4 elements)')
  .add('array.remove(value)', () => {
    deep([...smallArray]).remove(1);
  })
  .add('object.remove(value)', () => {
    deep({ ...smallObject }).remove(1);
  })
  .add('map.remove(value)', () => {
    deep(new Map(smallMap)).remove(1);
  })
  .add('set.remove(value)', () => {
    deep(new Set(smallSet)).remove(1);
  });

// Бенчмарк для remove (1000 элементов)
benchmark.createSuite('remove (1000 elements)')
  .add('array.remove(value)', () => {
    deep([...bigArray]).remove(0);
  })
  .add('object.remove(value)', () => {
    deep({ ...bigObject }).remove(0);
  })
  .add('map.remove(value)', () => {
    deep(new Map(bigMap)).remove(0);
  })
  .add('set.remove(value)', () => {
    deep(new Set(bigSet)).remove(0);
  });

// Бенчмарк для push (4 элемента)
benchmark.createSuite('push (4 elements)')
  .add('array.push(value)', () => {
    deep([...smallArray]).push(999);
  });

// Бенчмарк для push (1000 элементов)
benchmark.createSuite('push (1000 elements)')
  .add('array.push(value)', () => {
    deep([...bigArray]).push(999);
  });

// Бенчмарк для pop (4 элемента)
benchmark.createSuite('pop (4 elements)')
  .add('array.pop()', () => {
    deep([...smallArray]).pop();
  });

// Бенчмарк для pop (1000 элементов)
benchmark.createSuite('pop (1000 elements)')
  .add('array.pop()', () => {
    deep([...bigArray]).pop();
  });

// Бенчмарк для shift (4 элемента)
benchmark.createSuite('shift (4 elements)')
  .add('array.shift()', () => {
    deep([...smallArray]).shift();
  });

// Бенчмарк для shift (1000 элементов)
benchmark.createSuite('shift (1000 elements)')
  .add('array.shift()', () => {
    deep([...bigArray]).shift();
  });

// Бенчмарк для unshift (4 элемента)
benchmark.createSuite('unshift (4 elements)')
  .add('array.unshift(value)', () => {
    deep([...smallArray]).unshift(999);
  });

// Бенчмарк для unshift (1000 элементов)
benchmark.createSuite('unshift (1000 elements)')
  .add('array.unshift(value)', () => {
    deep([...bigArray]).unshift(999);
  });

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для sets.js...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'SETS.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();
