/**
 * Тесты производительности для memory.js
 */

import Benchmarkify from 'benchmarkify';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { deep } from './index.js';
import { Memory } from './memory.js';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';

// Создаем экземпляр Memory для тестирования
const memory = new Memory();

// Создаем бенчмарк
const benchmark = new Benchmarkify('Memory Benchmarks', {
  description: 'Тесты производительности для управления памятью в объектах'
});
benchmark.printHeader();

// Количество итераций для тестов
const ITERATIONS = 1000;

// Подготавливаем тестовые данные
function prepareTestData(count) {
  const objects = [];
  for (let i = 0; i < count; i++) {
    objects.push(deep({ id: i, data: `test-${i}` }));
  }
  return objects;
}

// Очистка памяти перед каждым тестом
function clearMemory() {
  memory.clear();
}

// Сьют для тестов memory.set и memory.delete
const memoryOperationsSuite = benchmark.createSuite('memory operations', {
  description: 'Тесты базовых операций с памятью (добавление/удаление)'
});

memoryOperationsSuite.add('memory.set single object', () => {
  const obj = deep({ test: 'value' });
  memory.set(obj, 'test-value');
}, { beforeEach: clearMemory });

memoryOperationsSuite.add('memory.set 10 objects', () => {
  const objects = prepareTestData(10);
  for (let i = 0; i < objects.length; i++) {
    memory.set(objects[i], `value-${i}`);
  }
}, { beforeEach: clearMemory });

memoryOperationsSuite.add('memory.set 100 objects', () => {
  const objects = prepareTestData(100);
  for (let i = 0; i < objects.length; i++) {
    memory.set(objects[i], `value-${i}`);
  }
}, { beforeEach: clearMemory });

memoryOperationsSuite.add('memory.delete single object', () => {
  const obj = deep({ test: 'value' });
  memory.set(obj, 'test-value');
  memory.delete(obj);
}, { beforeEach: clearMemory });

memoryOperationsSuite.add('memory.delete 10 objects', () => {
  const objects = prepareTestData(10);
  for (let i = 0; i < objects.length; i++) {
    memory.set(objects[i], `value-${i}`);
  }
  for (const obj of objects) {
    memory.delete(obj);
  }
}, { beforeEach: clearMemory });

// Сьют для тестов memory.size и memory.one/many
const memoryQuerySuite = benchmark.createSuite('memory queries', {
  description: 'Тесты запросов к памяти (получение и подсчет объектов)'
});

memoryQuerySuite.add('memory.size() with 10 objects', () => {
  const objects = prepareTestData(10);
  for (let i = 0; i < objects.length; i++) {
    memory.set(objects[i], `value-${i}`);
  }
  return memory.size();
}, { beforeEach: clearMemory });

memoryQuerySuite.add('memory.size() with 100 objects', () => {
  const objects = prepareTestData(100);
  for (let i = 0; i < objects.length; i++) {
    memory.set(objects[i], `value-${i}`);
  }
  return memory.size();
}, { beforeEach: clearMemory });

memoryQuerySuite.add('memory.one() for 10 objects', () => {
  const objects = prepareTestData(10);
  for (let i = 0; i < objects.length; i++) {
    memory.set(objects[i], `value-${i}`);
  }
  // Получаем значение для каждого ключа
  for (const obj of objects) {
    memory.one(obj);
  }
}, { beforeEach: clearMemory });

memoryQuerySuite.add('memory.many() for 10 values', () => {
  const objects = prepareTestData(10);
  const values = [];
  // Создаем 10 уникальных значений
  for (let i = 0; i < 10; i++) {
    values.push(`common-value-${i}`);
  }
  // Создаем 10 объектов с каждым значением
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      memory.set(deep({ id: `${i}-${j}` }), values[i]);
    }
  }
  // Получаем ключи для каждого значения
  for (const value of values) {
    memory.many(value);
  }
}, { beforeEach: clearMemory });

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для memory.js...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'MEMORY.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();
