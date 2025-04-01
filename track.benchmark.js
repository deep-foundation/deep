/**
 * Performance tests for track.js
 */

import { deep } from './index.js';
import Benchmarkify from 'benchmarkify';
import path from 'node:path';
import fs from 'node:fs';
import { saveBenchmarkToMarkdown, generateMarkdownReport } from './utils/benchmark-to-markdown.js';
import { performance } from 'node:perf_hooks';

// Включаем режим отладки, если установлен флаг DEBUG
const isDebug = process.env.DEBUG === 'true';
if (isDebug) {
  console.log('🔍 Включен режим отладки');
}

// Создаем бенчмарк
const benchmark = new Benchmarkify('Track.js Benchmarks', {
  description: 'Тесты производительности для track.js - отслеживание зависимостей'
}).printHeader();

// Максимальное время выполнения бенчмарка (в секундах)
const MAX_EXECUTION_TIME = 40;
console.log(`Установлено максимальное время выполнения: ${MAX_EXECUTION_TIME} сек`);

// Функция для проверки времени выполнения сюита
function setupTimeLimit(suite) {
  const startTime = performance.now();
  let lastCheck = startTime;
  let checkInterval;

  // Проверка времени каждые 5 секунд
  checkInterval = setInterval(() => {
    const currentTime = performance.now();
    const elapsed = (currentTime - startTime) / 1000;

    if (elapsed > MAX_EXECUTION_TIME) {
      clearInterval(checkInterval);
      console.warn(`⚠️ Превышено максимальное время выполнения. Принудительное завершение.`);
      console.log(`Прошло ${elapsed.toFixed(3)} сек из ${MAX_EXECUTION_TIME} сек`);

      // Генерируем отчет перед выходом
      try {
        console.log(`🔄 Генерация Markdown отчета для: ${benchmark.name}`);
        const markdownReport = generateMarkdownReport(benchmark);
        const reportPath = path.join(process.cwd(), 'TRACK.benchmark.md');
        fs.writeFileSync(reportPath, markdownReport, 'utf8');
        console.log(`✅ Markdown отчет сохранен в: ${reportPath}`);
      } catch (error) {
        console.error('❌ Ошибка при создании отчета:', error);
      }

      // Принудительно останавливаем выполнение, так как в библиотеке нет метода cancel
      process.exit(0);
    }

    lastCheck = currentTime;
  }, 5000);

  // Перезаписываем метод run сюита, чтобы очистить интервал после завершения
  const originalRun = suite.run;
  suite.run = async function(...args) {
    try {
      return await originalRun.apply(this, args);
    } finally {
      clearInterval(checkInterval);
    }
  };

  return suite;
}

// Подготавливаем данные для тестов
const smallArray = Array.from({ length: 100 }, (_, i) => i);
const smallSet = new Set(smallArray);
const smallMap = new Map(smallArray.map((v, i) => [`key${i}`, v]));
const smallObj = Object.fromEntries(smallArray.map((v, i) => [`key${i}`, v]));

// Функция для создания цепочки зависимостей
function createChain(source, length) {
  let current = source;
  const chain = [current];

  for (let i = 0; i < length; i++) {
    current = current.map(x => x * 2);
    chain.push(current);
  }

  return chain;
}

// Функция для создания параллельных зависимостей
function createParallel(source, count) {
  const deps = [];
  for (let i = 0; i < count; i++) {
    deps.push(source.map(x => x * (i + 1)));
  }
  return deps;
}

// Создаем бенчмарки для каждого типа данных
const dataTypes = [
  {
    name: 'Array',
    source: smallArray,
    create: deep,
    modify: (source) => source.push(100),
    check: (dep) => {
      try {
        return dep.this.length === 101;
      } catch (error) {
        console.error('Ошибка в проверке Array:', error);
        return false;
      }
    }
  },
  {
    name: 'Set',
    source: smallSet,
    create: deep,
    modify: (source) => source.add(100),
    check: (dep) => {
      try {
        return dep.this.size === 101;
      } catch (error) {
        console.error('Ошибка в проверке Set:', error);
        return false;
      }
    }
  },
  {
    name: 'Map',
    source: smallMap,
    create: deep,
    modify: (source) => source.set('key100', 100),
    check: (dep) => {
      try {
        return dep.this.size === 101;
      } catch (error) {
        console.error('Ошибка в проверке Map:', error);
        return false;
      }
    }
  },
  {
    name: 'Object',
    source: smallObj,
    create: deep,
    modify: (source) => source.key100 = 100,
    check: (dep) => {
      try {
        return Object.keys(dep.this).length === 101;
      } catch (error) {
        console.error('Ошибка в проверке Object:', error);
        return false;
      }
    }
  }
];

// Добавляем тесты с логированием
const addTestWithLogging = (suite, testName, testFn) => {
  const wrappedFn = () => {
    if (isDebug) console.log(`Выполнение теста: ${testName}`);
    try {
      const result = testFn();
      if (isDebug) console.log(`Тест ${testName} завершен успешно`);
      return result;
    } catch (err) {
      console.error(`❌ Ошибка в тесте ${testName}:`, err);
      throw err;
    }
  };
  return suite.add(testName, wrappedFn);
};

// Создаем бенчмарки для каждого типа данных
dataTypes.forEach(({ name, source, create, modify, check }) => {
  // Бенчмарк для параллельных зависимостей
  const parallelSuite = benchmark.createSuite(`parallel dependencies (${name})`, {
    description: `Параллельные зависимости от одного источника данных типа ${name}`
  });
  setupTimeLimit(parallelSuite);

  // Добавляем тесты с параллельными зависимостями
  addTestWithLogging(parallelSuite, '1 dependency', () => {
    const src = create(source);
    const deps = createParallel(src, 1);
    modify(src);
    return check(deps[0]);
  });

  addTestWithLogging(parallelSuite, '2 dependencies', () => {
    const src = create(source);
    const deps = createParallel(src, 2);
    modify(src);
    return check(deps[0]);
  });

  addTestWithLogging(parallelSuite, '3 dependencies', () => {
    const src = create(source);
    const deps = createParallel(src, 3);
    modify(src);
    return check(deps[0]);
  });

  addTestWithLogging(parallelSuite, '4 dependencies', () => {
    const src = create(source);
    const deps = createParallel(src, 4);
    modify(src);
    return check(deps[0]);
  });

  addTestWithLogging(parallelSuite, '5 dependencies', () => {
    const src = create(source);
    const deps = createParallel(src, 5);
    modify(src);
    return check(deps[0]);
  });

  addTestWithLogging(parallelSuite, '6 dependencies', () => {
    const src = create(source);
    const deps = createParallel(src, 6);
    modify(src);
    return check(deps[0]);
  });

  addTestWithLogging(parallelSuite, '7 dependencies', () => {
    const src = create(source);
    const deps = createParallel(src, 7);
    modify(src);
    return check(deps[0]);
  });

  // Бенчмарк для цепочек зависимостей
  const chainSuite = benchmark.createSuite(`chain dependencies (${name})`, {
    description: `Цепочки зависимостей (каждая зависимость создается из предыдущей) для типа данных ${name}`
  });
  setupTimeLimit(chainSuite);

  // Добавляем тесты с цепочками зависимостей
  addTestWithLogging(chainSuite, 'chain length 1', () => {
    const src = create(source);
    const chain = createChain(src, 1);
    modify(src);
    return check(chain[1]);
  });

  addTestWithLogging(chainSuite, 'chain length 2', () => {
    const src = create(source);
    const chain = createChain(src, 2);
    modify(src);
    return check(chain[2]);
  });

  addTestWithLogging(chainSuite, 'chain length 3', () => {
    const src = create(source);
    const chain = createChain(src, 3);
    modify(src);
    return check(chain[3]);
  });

  addTestWithLogging(chainSuite, 'chain length 4', () => {
    const src = create(source);
    const chain = createChain(src, 4);
    modify(src);
    return check(chain[4]);
  });

  addTestWithLogging(chainSuite, 'chain length 5', () => {
    const src = create(source);
    const chain = createChain(src, 5);
    modify(src);
    return check(chain[5]);
  });
});

// Асинхронная функция для запуска бенчмарков
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для track.js...');
  const startTime = performance.now();

  try {
    // Запускаем все сюиты последовательно
    await benchmark.run();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Бенчмарки завершены за ${duration} секунд`);

    // Генерируем отчет в формате Markdown
    console.log(`🔄 Генерация Markdown отчета для: ${benchmark.name}`);
    const markdownReport = saveBenchmarkToMarkdown(benchmark);
    const reportPath = path.join(process.cwd(), 'TRACK.benchmark.md');
    await fs.promises.writeFile(reportPath, markdownReport, 'utf8');
    console.log(`✅ Markdown отчет сохранен в: ${reportPath}`);
  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
    process.exit(1);
  }
}

// Запускаем бенчмарки
runBenchmarks();
