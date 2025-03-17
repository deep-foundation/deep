# Задачи по проекту Deep

## EventEmitter

### Основные задачи
- [x] Создать базовый класс Events в events.js
- [x] Реализовать базовые методы on/off/emit
- [x] Тест: подписка и получение события
- [x] Тест: отписка через возвращаемую функцию
- [x] Тест: подписка нескольких обработчиков на одно событие
- [x] Тест: отписка конкретного обработчика не влияет на другие

### Дополнительные задачи
- [x] Реализовать метод once() для одноразовых подписок
- [x] Тест: одноразовый обработчик вызывается только один раз
- [x] Реализовать поддержку wildcard событий (например, "user.*")
- [x] Тест: wildcard-обработчики получают все соответствующие события
- [x] Реализовать методы очистки всех обработчиков (removeAllListeners)
- [x] Тест: успешная очистка всех обработчиков для события и глобально

### Производительность и оптимизация
- [x] Реализовать управление контекстом выполнения (this)
- [x] Тест: контекст правильно передается в обработчик
- [x] Реализовать защиту от влияния ошибок одного обработчика на другие
- [x] Тест: ошибка в обработчике не препятствует вызову других
- [ ] Реализовать оптимизацию с использованием WeakRef для автоочистки
- [ ] Тест: обработчики удаляются, когда объект-контекст собирается GC
- [x] Создать бенчмарк для сравнения с Node.js EventEmitter

# Задачи по бенчмаркингу

## Подготовка бенчмарков

- [x] Выбор инструмента для бенчмаркинга (node:perf_hooks vs mitata vs tinybench)
- [x] Создание файла events.benchmark.js
- [x] Подготовка общей функции для запуска бенчмарков с разными параметрами
- [ ] Настройка среды для измерения памяти (--expose-gc)

## Создание сценариев тестирования

- [x] Сценарий 1: Подписка большого количества обработчиков (1000, 10000, 100000)
- [x] Сценарий 2: Эмиссия событий с разным количеством подписчиков (100, 1000)
- [x] Сценарий 3: Подписка/отписка обработчиков в цикле
- [x] Сценарий 4: Wildcard подписки vs множественные подписки
- [ ] Сценарий 5: Измерение использования памяти

## Визуализация результатов

- [x] Генерация отчета в формате Markdown
- [x] Добавление результатов в EVENTS.md
- [ ] Создание графиков сравнения (опционально)

## Черновики кода

### Пример с node:perf_hooks:

```javascript
import { performance } from 'node:perf_hooks';
import { Events } from './events.js';
import { EventEmitter } from 'node:events';

// Вспомогательная функция для бенчмаркинга
function runBenchmark(name, fn, iterations = 1, warmupIterations = 0) {
  // Прогрев (не учитывается в измерениях)
  for (let i = 0; i < warmupIterations; i++) {
    fn();
  }
  
  // Измерение
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  
  console.log(`Бенчмарк: ${name}`);
  console.log(`Общее время: ${totalTime.toFixed(2)}ms`);
  console.log(`Среднее время: ${avgTime.toFixed(4)}ms`);
  console.log('-'.repeat(40));
  
  return { name, totalTime, avgTime, iterations };
}

// Сценарий 1: Создание и подписка большого количества обработчиков
function benchmarkSubscription(count) {
  const eventsResult = runBenchmark(`Events: подписка ${count} обработчиков`, () => {
    const events = new Events();
    for (let i = 0; i < count; i++) {
      events.on(`event-${i % 100}`, () => {});
    }
    return events;
  });
  
  const emitterResult = runBenchmark(`EventEmitter: подписка ${count} обработчиков`, () => {
    const emitter = new EventEmitter();
    for (let i = 0; i < count; i++) {
      emitter.on(`event-${i % 100}`, () => {});
    }
    return emitter;
  });
  
  const ratio = emitterResult.avgTime / eventsResult.avgTime;
  console.log(`События быстрее в ${ratio.toFixed(2)} раз\n`);
}
```

### Пример с mitata:

```javascript
import { bench, run } from 'mitata';
import { Events } from './events.js';
import { EventEmitter } from 'node:events';

bench('Events: создание 1000 подписчиков', () => {
  const events = new Events();
  for (let i = 0; i < 1000; i++) {
    events.on(`event-${i}`, () => {});
  }
});

bench('EventEmitter: создание 1000 подписчиков', () => {
  const emitter = new EventEmitter();
  for (let i = 0; i < 1000; i++) {
    emitter.on(`event-${i}`, () => {});
  }
});

await run();
```

### Пример измерения памяти:

```javascript
import v8 from 'node:v8';

function getMemoryUsage() {
  const stats = v8.getHeapStatistics();
  return {
    used: stats.used_heap_size / (1024 * 1024),
    total: stats.total_heap_size / (1024 * 1024)
  };
}

function measureMemory(name, fn) {
  // Принудительный сбор мусора
  global.gc && global.gc();
  
  const before = getMemoryUsage();
  const result = fn();
  const after = getMemoryUsage();
  
  console.log(`Память [${name}]:`);
  console.log(`  До: ${before.used.toFixed(2)} MB`);
  console.log(`  После: ${after.used.toFixed(2)} MB`);
  console.log(`  Разница: ${(after.used - before.used).toFixed(2)} MB`);
  console.log('-'.repeat(40));
  
  return result;
}
```

### Пример сценария Wildcard vs Множественные подписки:

```javascript
function benchmarkWildcard() {
  const eventTypes = [];
  for (let i = 0; i < 100; i++) {
    eventTypes.push(`user.${i}`);
  }
  
  // Events с wildcard
  const events = new Events();
  events.on('user.*', () => {});
  
  // EventEmitter с множественными подписками
  const emitter = new EventEmitter();
  for (const type of eventTypes) {
    emitter.on(type, () => {});
  }
  
  const eventsResult = runBenchmark('Events: wildcard подписка', () => {
    for (const type of eventTypes) {
      events.emit(type, { userId: 1 });
    }
  }, 100);
  
  const emitterResult = runBenchmark('EventEmitter: множественные подписки', () => {
    for (const type of eventTypes) {
      emitter.emit(type, { userId: 1 });
    }
  }, 100);
  
  const ratio = emitterResult.avgTime / eventsResult.avgTime;
  console.log(`Wildcard в Events ${ratio > 1 ? 'быстрее' : 'медленнее'} в ${Math.abs(ratio).toFixed(2)} раз\n`);
}
```
