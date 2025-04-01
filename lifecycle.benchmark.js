/**
 * Тесты производительности для lifecycle.js
 */

import { deep } from './index.js';
import { all, kill, reload } from './lifecycle.js';
import Benchmarkify from 'benchmarkify';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Lifecycle Benchmarks', {
  description: 'Тесты производительности для управления жизненным циклом объектов'
});
benchmark.printHeader();

// Количество итераций
const ITERATIONS = 1000;

// Создаем сьют для тестов создания и убийства ассоциаций
const createKillSuite = benchmark.createSuite('create & kill', {
  description: 'Тесты создания и удаления ассоциаций'
});

// Подготавливаем тестовые данные
function prepareTestData(count) {
  const associations = [];
  for (let i = 0; i < count; i++) {
    associations.push(deep({ id: i }));
  }
  return associations;
}

// Тесты с разным количеством ассоциаций
createKillSuite.add('create 10 associations', () => {
  return prepareTestData(10);
});

createKillSuite.add('create 100 associations', () => {
  return prepareTestData(100);
});

createKillSuite.add('create 1000 associations', () => {
  return prepareTestData(1000);
});

createKillSuite.add('kill 10 associations', () => {
  const associations = prepareTestData(10);
  for (const ass of associations) {
    kill(ass);
  }
});

createKillSuite.add('kill 100 associations', () => {
  const associations = prepareTestData(100);
  for (const ass of associations) {
    kill(ass);
  }
});

createKillSuite.add('kill 1000 associations', () => {
  const associations = prepareTestData(1000);
  for (const ass of associations) {
    kill(ass);
  }
});

// Создаем сьют для тестов all.get и all.count
const allSuite = benchmark.createSuite('all lifecycle', {
  description: 'Тесты работы с глобальным хранилищем ассоциаций'
});

allSuite.add('all.count() with 10 associations', () => {
  const associations = prepareTestData(10);
  return all.count();
});

allSuite.add('all.count() with 100 associations', () => {
  const associations = prepareTestData(100);
  return all.count();
});

allSuite.add('all.count() with 1000 associations', () => {
  const associations = prepareTestData(1000);
  return all.count();
});

allSuite.add('all.get() with 10 associations', () => {
  const associations = prepareTestData(10);
  return all.get();
});

allSuite.add('all.get() with 100 associations', () => {
  const associations = prepareTestData(100);
  return all.get();
});

allSuite.add('all.get() with 1000 associations', () => {
  const associations = prepareTestData(1000);
  return all.get();
});

// Создаем сьют для тестов перезагрузки (reload)
const reloadSuite = benchmark.createSuite('reload', {
  description: 'Тесты перезагрузки ассоциаций'
});

reloadSuite.add('reload single association', () => {
  const ass = deep({ test: 'value' });
  return reload(ass);
});

reloadSuite.add('reload 10 associations', () => {
  const associations = prepareTestData(10);
  for (const ass of associations) {
    reload(ass);
  }
});

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для lifecycle.js...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'LIFECYCLE.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();
