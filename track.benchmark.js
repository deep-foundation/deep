/**
 * Бенчмарки для модуля track.js
 */

import { deep } from './index.js';
import Benchmarkify from 'benchmarkify';

// Включаем режим отладки, если установлен флаг DEBUG
const isDebug = process.env.DEBUG === 'true';
if (isDebug) {
  console.log('🔍 Включен режим отладки');
}

// Создаем бенчмарк с правильными настройками для единообразного вывода
const benchmark = new Benchmarkify('Track.js Benchmarks', {
  minTimes: isDebug ? 10 : 1000,  // Уменьшаем количество запусков для отладки
  reporter: 'console'  // Использовать консольный репортер
});

// Печатаем заголовок
benchmark.printHeader();

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

// Создаем бенчмарки для каждого типа данных
dataTypes.forEach(({ name, source, create, modify, check }) => {
  // Бенчмарк для параллельных зависимостей
  const parallelSuite = benchmark.createSuite(`parallel dependencies (${name})`, {
    spinner: false  // Отключаем spinner для лучшей совместимости
  });

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
    spinner: false  // Отключаем spinner для лучшей совместимости
  });

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

  addTestWithLogging(chainSuite, 'chain length 6', () => {
    const src = create(source);
    const chain = createChain(src, 6);
    modify(src);
    return check(chain[6]);
  });

  addTestWithLogging(chainSuite, 'chain length 7', () => {
    const src = create(source);
    const chain = createChain(src, 7);
    modify(src);
    return check(chain[7]);
  });
});

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('');  // Пустая строка перед запуском для единообразия
  console.log('🚀 Запуск бенчмарков...');
  console.log('');  // Еще одна пустая строка для формата

  // Логируем начало запуска
  console.log(`Начало запуска бенчмарков: ${new Date().toISOString()}`);
  console.log(`Количество сьютов: ${benchmark.suites.length}`);

  // Ограничиваем количество сьютов для быстрого выполнения, когда задан флаг QUICK=true
  if (process.env.QUICK === 'true') {
    console.log('⚡ Быстрый режим: ограничиваем количество сьютов до 2');

    // Оставляем только первые 2 сьюта для быстрого тестирования
    if (benchmark.suites.length > 2) {
      benchmark.suites = benchmark.suites.slice(0, 2);
      console.log(`Оставшиеся сьюты: ${benchmark.suites.map(s => s.name).join(', ')}`);
    }
  }

  // Переопределяем метод запуска сьюта для добавления логов
  const originalRunSuite = benchmark.runSuite;
  benchmark.runSuite = async function(suite) {
    console.log(`Запуск сьюта: ${suite.name} - ${new Date().toISOString()}`);
    console.log(`Количество тестов в сьюте: ${suite.tests.length}`);

    // Ограничиваем количество тестов для быстрого режима
    if (process.env.QUICK === 'true' && suite.tests.length > 2) {
      console.log(`⚡ Быстрый режим: ограничиваем количество тестов до 2`);
      suite.tests = suite.tests.slice(0, 2);
      console.log(`Оставшиеся тесты: ${suite.tests.map(t => t.name).join(', ')}`);
    }

    try {
      const result = await originalRunSuite.call(this, suite);
      console.log(`Сьют ${suite.name} завершен - ${new Date().toISOString()}`);
      return result;
    } catch (err) {
      console.error(`Ошибка в сьюте ${suite.name}:`, err);
      throw err;
    }
  };

  try {
    // Для более быстрого получения хоть каких-то результатов
    // устанавливаем максимальное время выполнения бенчмарков
    const startTime = Date.now();
    const maxDuration = process.env.MAX_DURATION
      ? parseInt(process.env.MAX_DURATION, 10) * 1000
      : (process.env.QUICK === 'true' ? 20 * 1000 : 60 * 1000);

    console.log(`Установлено максимальное время выполнения: ${maxDuration / 1000} сек`);

    // Запускаем таймер для прерывания бенчмарков после maxDuration
    const timeoutId = setTimeout(() => {
      console.log(`⚠️ Превышено максимальное время выполнения. Принудительное завершение.`);
      console.log(`Прошло ${(Date.now() - startTime) / 1000} сек из ${maxDuration / 1000} сек`);
      process.exit(0); // Выходим с кодом 0, чтобы обновить документацию с частичными результатами
    }, maxDuration);

    await benchmark.run();

    // Отменяем таймер, если бенчмарки успешно завершились
    clearTimeout(timeoutId);

    console.log(`Все сьюты завершены: ${new Date().toISOString()}`);
    console.log(`Общее время выполнения: ${(Date.now() - startTime) / 1000} сек`);
  } catch (err) {
    console.error(`Ошибка при запуске бенчмарка: ${err.message}`);
    console.error(err.stack);
  }

  console.log('');  // Пустая строка после выполнения
  console.log('Все бенчмарки завершены.');
}

runBenchmarks().catch(err => {
  console.error('Ошибка при выполнении бенчмарков:', err);
  process.exit(1);
});
