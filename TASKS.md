# Задачи по проекту Deep

## Memory

### Основные задачи
- [x] Создать базовый класс Memory в memory.js
- [x] Реализовать базовые методы one/many/set/delete
- [x] Тест: сохранение и получение one-связи
- [x] Тест: получение many-связей для значения
- [x] Тест: удаление связи через delete
- [x] Тест: обновление существующей связи

### Дополнительные задачи
- [x] Реализовать метод has() для проверки существования связи
- [x] Тест: проверка существования связи
- [x] Реализовать метод clear() для полной очистки структуры
- [x] Тест: успешная очистка всех связей
- [x] Реализовать метод size() для получения количества связей
- [x] Тест: корректное отображение количества связей

### Производительность и оптимизация
- [x] Реализовать оптимизированное удаление обратных связей
- [x] Тест: удаление обратных связей не влияет на другие связи
- [x] Добавить защиту от некорректных значений ключей
- [x] Тест: обработка некорректных входных данных
- [x] Создать бенчмарк для сравнения с Map/Set

# Задачи по бенчмаркингу Memory

## Подготовка бенчмарков

- [x] Создание файла memory.benchmark.js
- [x] Адаптация общей функции для запуска бенчмарков с разными параметрами
- [x] Настройка среды для измерения памяти (--expose-gc)

## Создание сценариев тестирования

- [x] Сценарий 1: Создание большого количества one-связей (1000, 10000, 100000)
- [x] Сценарий 2: Получение many-связей с разным количеством ассоциаций (10, 100, 1000)
- [x] Сценарий 3: Создание/удаление связей в цикле
- [x] Сценарий 4: Сравнение с нативными Map+Set для аналогичных операций
- [x] Сценарий 5: Измерение использования памяти

## Визуализация результатов

- [x] Генерация отчета в формате Markdown
- [x] Добавление результатов в MEMORY.md
- [x] Обновление скрипта regenerate-benchmark-readme.js для поддержки Memory

## Черновики кода

### Пример измерения производительности:

```javascript
import { bench, run } from 'mitata';
import { Memory } from './memory.js';

// Бенчмарк для создания большого количества one-связей
bench('Memory: создание 1000 связей', () => {
  const memory = new Memory();
  for (let i = 0; i < 1000; i++) {
    memory.set(i, i % 100);
  }
});

// Сравнение с нативной Map
bench('Map: создание 1000 записей', () => {
  const map = new Map();
  for (let i = 0; i < 1000; i++) {
    map.set(i, i % 100);
  }
});

// Тест получения one-связей
bench('Memory: получение 1000 one-связей', () => {
  const memory = new Memory();
  // Предварительно заполняем память
  for (let i = 0; i < 1000; i++) {
    memory.set(i, i % 100);
  }
  
  // Бенчмарк получения
  let temp;
  for (let i = 0; i < 1000; i++) {
    temp = memory.one(i);
  }
});

// Тест получения many-связей
bench('Memory: получение 10 many-связей с 100 элементами каждая', () => {
  const memory = new Memory();
  // Создаем структуру где каждое значение связано со 100 ключами
  for (let v = 0; v < 10; v++) {
    const value = v;
    for (let k = 0; k < 100; k++) {
      memory.set(v * 1000 + k, value);
    }
  }
  
  // Бенчмарк получения
  let temp;
  for (let v = 0; v < 10; v++) {
    temp = memory.many(v);
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

// Пример использования:
measureMemory('Memory: 100_000 связей', () => {
  const memory = new Memory();
  for (let i = 0; i < 100000; i++) {
    memory.set(i, i % 1000);
  }
  return memory;
});

measureMemory('Map+Set: 100_000 связей', () => {
  const oneMap = new Map();
  const manyMap = new Map();
  
  for (let i = 0; i < 100000; i++) {
    const key = i;
    const value = i % 1000;
    
    oneMap.set(key, value);
    
    if (!manyMap.has(value)) {
      manyMap.set(value, new Set());
    }
    manyMap.get(value).add(key);
  }
  
  return { oneMap, manyMap };
});
```
