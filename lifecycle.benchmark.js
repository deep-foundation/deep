import { bench, group, run } from 'mitata';
import { deep } from './index.js';
import { all, kill, reload } from './lifecycle.js';

// Количество итераций
const ITERATIONS = 10000;
// Уменьшаем количество итераций для быстрого запуска и избежания таймаута
const QUICK_ITERATIONS = process.env.QUICK === 'true' || process.env.BENCHMARK ? 100 : ITERATIONS;

// Тестирование производительности жизненного цикла
group('Lifecycle', () => {
  bench('Создание ассоциации + onNew', () => {
    // Очищаем хранилище перед тестом
    all.this.clear();

    for (let i = 0; i < QUICK_ITERATIONS; i++) {
      const obj = { id: i };
      const a = deep(obj);
      a.onNew();
    }

    // Очищаем хранилище после теста
    all.this.clear();
  });

  bench('Создание и удаление ассоциации (onNew + onKill)', () => {
    // Очищаем хранилище перед тестом
    all.this.clear();

    for (let i = 0; i < QUICK_ITERATIONS; i++) {
      const obj = { id: i };
      const a = deep(obj);
      a.onNew();
      a.onKill();
    }
  });

  bench('Вызов функции kill', () => {
    // Создаем набор ассоциаций для теста
    const assocs = [];
    for (let i = 0; i < QUICK_ITERATIONS; i++) {
      const obj = { id: i };
      const a = deep(obj);
      a.onNew();
      assocs.push(a);
    }

    // Измеряем скорость удаления
    for (let i = 0; i < QUICK_ITERATIONS; i++) {
      kill(assocs[i]);
    }
  });

  bench('Перезагрузка ассоциации (reload)', () => {
    // Создаем набор ассоциаций для теста
    const assocs = [];
    for (let i = 0; i < QUICK_ITERATIONS / 100; i++) { // Делим на 100, так как reload выполняет 2 операции
      const obj = { id: i };
      const a = deep(obj);
      a.onNew();
      assocs.push(a);
    }

    // Измеряем скорость перезагрузки
    for (let i = 0; i < QUICK_ITERATIONS / 100; i++) {
      reload(assocs[i]);
    }

    // Очищаем хранилище после теста
    all.this.clear();
  });

  bench('Получение количества живых ассоциаций (all.this.size)', () => {
    // Создаем некоторое количество ассоциаций для теста
    all.this.clear();
    for (let i = 0; i < 100; i++) {
      const obj = { id: i };
      const a = deep(obj);
      a.onNew();
    }

    // Измеряем скорость получения количества
    for (let i = 0; i < QUICK_ITERATIONS; i++) {
      const size = all.this.size;
    }

    // Очищаем хранилище после теста
    all.this.clear();
  });

  bench('Пользовательский callback в onNew', () => {
    // Очищаем хранилище перед тестом
    all.this.clear();

    // Тестовый callback
    const callback = function(self) {
      self.initialized = true;
      return true;
    };

    for (let i = 0; i < QUICK_ITERATIONS / 10; i++) { // Делим на 10, чтобы избежать переполнения памяти
      const obj = { id: i, initialized: false };
      const a = deep(obj);
      a.onNew(callback);
    }

    // Очищаем хранилище после теста
    all.this.clear();
  });

  bench('Пользовательский callback в onKill', () => {
    // Очищаем хранилище перед тестом
    all.this.clear();

    // Создаем набор ассоциаций для теста
    const assocs = [];
    for (let i = 0; i < QUICK_ITERATIONS / 10; i++) {
      const obj = { id: i, disposed: false };
      const a = deep(obj);
      a.onNew();
      assocs.push(a);
    }

    // Тестовый callback
    const callback = function(self) {
      self.disposed = true;
      return true;
    };

    // Измеряем скорость удаления с callback
    for (let i = 0; i < QUICK_ITERATIONS / 10; i++) {
      assocs[i].onKill(callback);
    }
  });

  bench('Очистка хранилища ассоциаций (all.this.clear)', () => {
    for (let i = 0; i < QUICK_ITERATIONS / 100; i++) {
      // Создаем некоторое количество ассоциаций
      for (let j = 0; j < 100; j++) {
        const obj = { id: j };
        const a = deep(obj);
        a.onNew();
      }

      // Измеряем скорость очистки
      all.this.clear();
    }
  });
});

// Запускаем все бенчмарки асинхронно
async function runBenchmarks() {
  console.log('');
  console.log('🚀 Запуск бенчмарков...');
  console.log('');

  await run();

  console.log('');
  console.log('Все бенчмарки завершены.');
}

runBenchmarks().catch(err => {
  console.error('Ошибка при выполнении бенчмарков:', err);
  process.exit(1);
});
