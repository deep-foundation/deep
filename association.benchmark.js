/**
 * Тесты производительности для Association
 */

import { Association } from './association.js';
import { deep } from './index.js';
import Benchmarkify from 'benchmarkify';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Association Benchmarks', {
  description: 'Тесты производительности для ассоциаций и сравнение с обычными объектами и Map'
});
benchmark.printHeader();

// Количество итераций
const ITERATIONS = 10000;

// Основной сьют тестов
const suite = benchmark.createSuite('Association', {
  description: 'Операции с экземплярами Association'
});

// Тестирование производительности Association
suite.add('Создание экземпляра с методами', () => {
  const a = deep(null, {
    method1: (a, b) => a + b,
    method2: (a, b) => a * b
  });
  return a;
});

suite.add('Вызов метода из Association', () => {
  const a = deep({
    add: (a, b) => a + b
  });
  return a.add(5, 10);
});

suite.add('Добавление свойств в Association', () => {
  const a = deep();
  a.prop1 = 'value1';
  a.prop2 = 'value2';
  a.prop3 = 'value3';
  return a;
});

suite.add('Получение свойств из Association', () => {
  const a = deep(null, {
    prop1: 'value1',
    prop2: 'value2',
    prop3: 'value3'
  });
  return a.prop1 + a.prop2 + a.prop3;
});

suite.add('Вызов динамического метода (ass, op, args)', () => {
  const a = deep();

  a.dynamicMethod = (ass, op, args) => {
    if (op === 'get') {
      return ass.temp.dynamicMethod = ass.temp.dynamicMethod || ((...args) =>
        ass._proxy.get('dynamicMethod')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      return args.reduce((sum, val) => sum + val, 0);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  };

  return a.dynamicMethod(1, 2, 3, 4, 5);
});

suite.add('Повторный вызов динамического метода', () => {
  const a = deep();

  a.dynamicMethod = (ass, op, args) => {
    if (op === 'get') {
      return ass.temp.dynamicMethod = ass.temp.dynamicMethod || ((...args) =>
        ass._proxy.get('dynamicMethod')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      return args.reduce((sum, val) => sum + val, 0);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  };

  // Первый вызов для создания кеша
  a.dynamicMethod(1, 2, 3);

  // Бенчмарк повторного вызова
  return a.dynamicMethod(4, 5, 6);
});

suite.add('Вызов статического метода', () => {
  // Добавляем метод в статический _proxy
  Association._proxy.set('staticBenchMethod', (ass, op, args) => {
    if (op === 'get') {
      return ass.temp.staticBenchMethod = ass.temp.staticBenchMethod || ((...args) =>
        Association._proxy.get('staticBenchMethod')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      return args.reduce((sum, val) => sum + val, 0);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  });

  const a = deep();
  return a.staticBenchMethod(1, 2, 3, 4, 5);
});

suite.add('Вызов прокси как функции', () => {
  const originalFn = (a, b) => a + b;
  const a = deep(originalFn);
  return a(5, 10);
});

// Бенчмарки для метода wrap
suite.add('wrap - оборачивание примитива', () => {
  const a = deep();
  return a.wrap(42);
});

suite.add('wrap - оборачивание объекта', () => {
  const a = deep();
  const obj = { test: 'value' };
  return a.wrap(obj);
});

suite.add('wrap - оборачивание уже обернутого значения', () => {
  const a = deep();
  const wrapped = deep('test');
  return a.wrap(wrapped);
});

// Бенчмарки для метода unwrap
suite.add('unwrap - разворачивание обернутого примитива', () => {
  const a = deep();
  const wrapped = a.wrap(42);
  return a.unwrap(wrapped);
});

suite.add('unwrap - разворачивание обернутого объекта', () => {
  const a = deep();
  const obj = { test: 'value' };
  const wrapped = a.wrap(obj);
  return a.unwrap(wrapped);
});

suite.add('unwrap - передача необернутого значения', () => {
  const a = deep();
  return a.unwrap({ test: 'value' });
});

// Бенчмарки для повторных вызовов с кешированием функций
suite.add('wrap - повторное использование кешированной функции', () => {
  const a = deep();
  // Получаем кешированную функцию
  const wrapFn = a.wrap;
  return wrapFn(42);
});

suite.add('unwrap - повторное использование кешированной функции', () => {
  const a = deep();
  // Получаем кешированную функцию
  const unwrapFn = a.unwrap;
  return unwrapFn(deep(42));
});

// Создаем сьют для обычных объектов для сравнения
const objectSuite = benchmark.createSuite('Object');

objectSuite.add('Создание объекта с методами', () => {
  const obj = {
    method1: (a, b) => a + b,
    method2: (a, b) => a * b
  };
  return obj;
});

objectSuite.add('Вызов метода из объекта', () => {
  const obj = {
    add: (a, b) => a + b
  };
  return obj.add(5, 10);
});

objectSuite.add('Добавление свойств в объект', () => {
  const obj = {};
  obj.prop1 = 'value1';
  obj.prop2 = 'value2';
  obj.prop3 = 'value3';
  return obj;
});

objectSuite.add('Получение свойств из объекта', () => {
  const obj = {
    prop1: 'value1',
    prop2: 'value2',
    prop3: 'value3'
  };
  return obj.prop1 + obj.prop2 + obj.prop3;
});

// Создаем сьют для Map для сравнения
const mapSuite = benchmark.createSuite('Map');

mapSuite.add('Создание Map с методами', () => {
  const map = new Map();
  map.set('method1', (a, b) => a + b);
  map.set('method2', (a, b) => a * b);
  return map;
});

mapSuite.add('Вызов метода из Map', () => {
  const map = new Map();
  map.set('add', (a, b) => a + b);
  return map.get('add')(5, 10);
});

mapSuite.add('Добавление свойств в Map', () => {
  const map = new Map();
  map.set('prop1', 'value1');
  map.set('prop2', 'value2');
  map.set('prop3', 'value3');
  return map;
});

mapSuite.add('Получение свойств из Map', () => {
  const map = new Map();
  map.set('prop1', 'value1');
  map.set('prop2', 'value2');
  map.set('prop3', 'value3');
  return map.get('prop1') + map.get('prop2') + map.get('prop3');
});

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для Association...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'ASSOCIATION.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();
