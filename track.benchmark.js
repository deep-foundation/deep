/**
 * Бенчмарк для системы отслеживания (track)
 */
import Benchmarkify from 'benchmarkify';
import deep from './index.js';

const benchmark = new Benchmarkify("Deep Methods Benchmark - Track").printHeader();

// Создание бенчмарка
const bench = benchmark.createSuite("Система отслеживания изменений (Track)");

// Количество элементов для тестов
const arraySize = 1000;
const testArray = Array.from({ length: arraySize }, (_, i) => i);

// Простое отслеживание изменений
bench.add("map - создание производного массива", () => {
  const sourceArray = deep(testArray.slice());
  const mapped = sourceArray.map(x => x * 2);
  return mapped.this.length === arraySize;
});

bench.add("map - создание производного массива + изменение исходного", () => {
  const sourceArray = deep(testArray.slice());
  const mapped = sourceArray.map(x => x * 2);
  sourceArray.push(arraySize);
  return mapped.this.length === arraySize + 1;
});

bench.add("filter - создание отфильтрованного массива", () => {
  const sourceArray = deep(testArray.slice());
  const filtered = sourceArray.filter(x => x % 2 === 0);
  return filtered.this.length === arraySize / 2;
});

bench.add("filter - создание отфильтрованного массива + изменение исходного", () => {
  const sourceArray = deep(testArray.slice());
  const filtered = sourceArray.filter(x => x % 2 === 0);
  sourceArray.push(arraySize);
  return filtered.this.length === arraySize / 2 + 1;
});

// Цепочки преобразований
bench.add("цепочка map -> filter", () => {
  const sourceArray = deep(testArray.slice());
  const mapped = sourceArray.map(x => x * 2);
  const filtered = mapped.filter(x => x % 4 === 0);
  return filtered.this.length === arraySize / 2;
});

bench.add("цепочка map -> filter + изменение исходного", () => {
  const sourceArray = deep(testArray.slice());
  const mapped = sourceArray.map(x => x * 2);
  const filtered = mapped.filter(x => x % 4 === 0);
  sourceArray.push(arraySize);
  return filtered.this.length === arraySize / 2 + (arraySize % 2 === 0 ? 1 : 0);
});

bench.add("цепочка map -> filter -> map", () => {
  const sourceArray = deep(testArray.slice());
  const mapped = sourceArray.map(x => x * 2);
  const filtered = mapped.filter(x => x % 4 === 0);
  const divided = filtered.map(x => x / 2);
  return divided.this.length === arraySize / 2;
});

bench.add("цепочка map -> filter -> map + изменение исходного", () => {
  const sourceArray = deep(testArray.slice());
  const mapped = sourceArray.map(x => x * 2);
  const filtered = mapped.filter(x => x % 4 === 0);
  const divided = filtered.map(x => x / 2);
  sourceArray.push(arraySize);
  return divided.this.length === arraySize / 2 + (arraySize % 2 === 0 ? 1 : 0);
});

// Сложные операции с объектами
bench.add("отслеживание объектов - map", () => {
  const users = deep([
    { id: 1, name: 'User 1', age: 20 },
    { id: 2, name: 'User 2', age: 30 },
    { id: 3, name: 'User 3', age: 25 },
    { id: 4, name: 'User 4', age: 40 }
  ]);

  const names = users.map(user => user.name);
  users.push({ id: 5, name: 'User 5', age: 35 });

  return names.this.length === 5 && names.this[4] === 'User 5';
});

bench.add("отслеживание объектов - filter", () => {
  const users = deep([
    { id: 1, name: 'User 1', age: 20 },
    { id: 2, name: 'User 2', age: 30 },
    { id: 3, name: 'User 3', age: 25 },
    { id: 4, name: 'User 4', age: 40 }
  ]);

  const adults = users.filter(user => user.age >= 30);
  users.push({ id: 5, name: 'User 5', age: 35 });

  return adults.this.length === 3 && adults.this[2].id === 5;
});

bench.add("отслеживание объектов - filter -> map", () => {
  const users = deep([
    { id: 1, name: 'User 1', age: 20 },
    { id: 2, name: 'User 2', age: 30 },
    { id: 3, name: 'User 3', age: 25 },
    { id: 4, name: 'User 4', age: 40 }
  ]);

  const adults = users.filter(user => user.age >= 30);
  const adultNames = adults.map(user => user.name);
  users.push({ id: 5, name: 'User 5', age: 35 });

  return adultNames.this.length === 3 && adultNames.this[2] === 'User 5';
});

// Многоуровневые преобразования
bench.add("многоуровневые преобразования - 5 уровней", () => {
  const source = deep(testArray.slice());

  const level1 = source.map(x => x + 1);
  const level2 = level1.filter(x => x % 2 === 0);
  const level3 = level2.map(x => x * 2);
  const level4 = level3.filter(x => x % 4 === 0);
  const level5 = level4.map(x => x / 4);

  source.push(arraySize);

  return level5.this.length > 0;
});

// Производительность при больших изменениях
bench.add("множественные изменения - 10 push", () => {
  const source = deep(testArray.slice());
  const mapped = source.map(x => x * 2);

  for (let i = 0; i < 10; i++) {
    source.push(arraySize + i);
  }

  return mapped.this.length === arraySize + 10;
});

bench.add("множественные изменения - 100 push", () => {
  const source = deep(testArray.slice());
  const mapped = source.map(x => x * 2);

  for (let i = 0; i < 100; i++) {
    source.push(arraySize + i);
  }

  return mapped.this.length === arraySize + 100;
});

// События и обработчики
bench.add("подписка на события", () => {
  const source = deep(testArray.slice());
  const mapped = source.map(x => x * 2);

  let changeCount = 0;
  mapped.on('change', () => {
    changeCount++;
  });

  source.push(arraySize);
  source.push(arraySize + 1);

  return changeCount === 2;
});

// Бенчмарк сравнения с нативными методами
bench.add("нативный map + ручное обновление", () => {
  const originalArray = testArray.slice();
  let mappedArray = originalArray.map(x => x * 2);

  originalArray.push(arraySize);
  mappedArray = originalArray.map(x => x * 2);

  return mappedArray.length === arraySize + 1;
});

bench.add("deep map с автоматическим обновлением", () => {
  const originalArray = deep(testArray.slice());
  const mappedArray = originalArray.map(x => x * 2);

  originalArray.push(arraySize);

  return mappedArray.this.length === arraySize + 1;
});

// Запуск бенчмарка
benchmark.run();
