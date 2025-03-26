/**
 * Бенчмарк для системы отслеживания (track)
 */
import Benchmarkify from 'benchmarkify';
import { deep } from './index.js';

// Инициализация бенчмарка
const benchmark = new Benchmarkify('Deep Track System', { minSamples: 200 });

// Печать информации о системе
benchmark.printHeader();

// Тест отслеживания массивов на разных уровнях вложенности
const arrayTrackBenchmark = benchmark.createSuite('Отслеживание массивов');

// Подготовка данных
const baseArray = [1, 2, 3, 4, 5];

// Базовый тест создания цепочки map-filter-map
arrayTrackBenchmark.add('Создание цепочки трансформаций', () => {
  const source = deep(baseArray);
  const level1 = source.map(x => x * 2);
  const level2 = level1.filter(x => x > 5);
  const level3 = level2.map(x => x + 1);

  return { source, level1, level2, level3 };
});

// Тест модификации на уровне 1 (source)
arrayTrackBenchmark.add('Модификация source -> 1 уровень (map)', () => {
  const source = deep([...baseArray]);
  const level1 = source.map(x => x * 2);

  // Модификация и отслеживание
  source.push(6);
  return level1.this;
});

// Тест модификации на уровне 1 -> уровень 2
arrayTrackBenchmark.add('Модификация source -> 2 уровня (map->filter)', () => {
  const source = deep([...baseArray]);
  const level1 = source.map(x => x * 2);
  const level2 = level1.filter(x => x > 5);

  // Модификация и отслеживание
  source.push(6);
  return level2.this;
});

// Тест модификации на уровне 1 -> уровень 3
arrayTrackBenchmark.add('Модификация source -> 3 уровня (map->filter->map)', () => {
  const source = deep([...baseArray]);
  const level1 = source.map(x => x * 2);
  const level2 = level1.filter(x => x > 5);
  const level3 = level2.map(x => x + 1);

  // Модификация и отслеживание
  source.push(6);
  return level3.this;
});

// Тест модификации сложной структуры на 3 уровнях
arrayTrackBenchmark.add('Сложная модификация source (set+delete+push)', () => {
  const source = deep([...baseArray]);
  const level1 = source.map(x => x * 2);
  const level2 = level1.filter(x => x > 5);
  const level3 = level2.map(x => x + 1);

  // Серия модификаций
  source.set(1, 10);   // Изменение существующего элемента
  source.delete(0);    // Удаление элемента
  source.push(6, 7);   // Добавление новых элементов

  return level3.this;
});

// Тестирование методов map
const mapTrackBenchmark = benchmark.createSuite('Отслеживание map трансформаций');

// Подготовка данных для map
const objects = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 },
  { id: 4, name: 'David', age: 40 },
  { id: 5, name: 'Eve', age: 45 }
];

// Тест map на уровне 1
mapTrackBenchmark.add('map: преобразование и push', () => {
  const source = deep([...objects]);
  const names = source.map(obj => obj.name);

  // Модификация и отслеживание
  source.push({ id: 6, name: 'Frank', age: 50 });
  return names.this;
});

// Тест map -> map (вложенные преобразования)
mapTrackBenchmark.add('map->map: вложенные преобразования с push', () => {
  const source = deep([...objects]);
  const names = source.map(obj => obj.name);
  const upperNames = names.map(name => name.toUpperCase());

  // Модификация и отслеживание
  source.push({ id: 6, name: 'Frank', age: 50 });
  return upperNames.this;
});

// Тест map -> map -> map (три уровня вложенности)
mapTrackBenchmark.add('map->map->map: три уровня с push', () => {
  const source = deep([...objects]);
  const names = source.map(obj => obj.name);
  const upperNames = names.map(name => name.toUpperCase());
  const withPrefix = upperNames.map(name => 'User-' + name);

  // Модификация и отслеживание
  source.push({ id: 6, name: 'Frank', age: 50 });
  return withPrefix.this;
});

// Тестирование методов filter
const filterTrackBenchmark = benchmark.createSuite('Отслеживание filter трансформаций');

// Тест filter на уровне 1
filterTrackBenchmark.add('filter: простая фильтрация и push', () => {
  const source = deep([...objects]);
  const adults = source.filter(obj => obj.age >= 30);

  // Модификация и отслеживание
  source.push({ id: 6, name: 'Frank', age: 50 });
  return adults.this;
});

// Тест filter -> map (фильтрация и преобразование)
filterTrackBenchmark.add('filter->map: фильтрация и преобразование с push', () => {
  const source = deep([...objects]);
  const adults = source.filter(obj => obj.age >= 30);
  const adultNames = adults.map(obj => obj.name);

  // Модификация и отслеживание
  source.push({ id: 6, name: 'Frank', age: 50 });
  return adultNames.this;
});

// Тест filter -> map -> filter (три уровня вложенности)
filterTrackBenchmark.add('filter->map->filter: три уровня с push', () => {
  const source = deep([...objects]);
  const adults = source.filter(obj => obj.age >= 30);
  const adultNames = adults.map(obj => obj.name);
  const longNames = adultNames.filter(name => name.length > 3);

  // Модификация и отслеживание
  source.push({ id: 6, name: 'Frank', age: 50 });
  return longNames.this;
});

// Тестирование комбинаций методов (сложные цепочки)
const complexTrackBenchmark = benchmark.createSuite('Отслеживание сложных цепочек');

// Тест map -> filter -> map -> filter
complexTrackBenchmark.add('map->filter->map->filter: сложная цепочка', () => {
  const source = deep([...objects]);
  const ages = source.map(obj => obj.age);
  const highAges = ages.filter(age => age > 30);
  const ageGroups = highAges.map(age => Math.floor(age / 10) * 10);
  const uniqueGroups = ageGroups.filter((group, index, array) => array.indexOf(group) === index);

  // Модификация и отслеживание
  source.push({ id: 6, name: 'Frank', age: 50 });
  return uniqueGroups.this;
});

// Тест с различными операциями модификации
complexTrackBenchmark.add('Различные операции модификации на сложной цепочке', () => {
  const source = deep([...objects]);
  const adults = source.filter(obj => obj.age >= 30);
  const adultNames = adults.map(obj => obj.name);
  const upperNames = adultNames.map(name => name.toUpperCase());

  // Различные модификации
  source.push({ id: 6, name: 'Frank', age: 50 });  // Добавление в конец
  source.set(0, { id: 1, name: 'Alice Updated', age: 26 });  // Обновление
  source.delete(2);  // Удаление

  return upperNames.this;
});

// Тест с объектами
const objectTrackBenchmark = benchmark.createSuite('Отслеживание объектов');

// Подготовка данных для объектов
const userObj = {
  user1: { name: 'Alice', age: 25 },
  user2: { name: 'Bob', age: 30 },
  user3: { name: 'Charlie', age: 35 },
  user4: { name: 'David', age: 40 },
  user5: { name: 'Eve', age: 45 }
};

// Тест отслеживания объектов на одном уровне
objectTrackBenchmark.add('Object: values->filter->map', () => {
  const source = deep({...userObj});
  const values = source.values();
  const adults = values.filter(user => user.age >= 30);
  const adultNames = adults.map(user => user.name);

  // Модификация и отслеживание
  source.set('user6', { name: 'Frank', age: 50 });
  return adultNames.this;
});

// Запуск тестов
arrayTrackBenchmark.run();
mapTrackBenchmark.run();
filterTrackBenchmark.run();
complexTrackBenchmark.run();
objectTrackBenchmark.run();
