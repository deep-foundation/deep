import Benchmarkify from 'benchmarkify';
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';

// Импортируем только те функции, которые реально экспортируются из gets.js
import { forEach, map, filter, reduce, find, every, some, keys, values, entries, get, has } from './gets.js';
import { deep } from './index.js';

// Инициализируем бенчмарк
const benchmark = new Benchmarkify('Бенчмарк методов доступа данных в gets.js', {
  // Устанавливаем максимальную продолжительность бенчмарка (в секундах)
  maxTime: 60,
  description: 'Бенчмарк различных методов доступа к данным из различных структур данных (массивы, объекты, Map, Set)'
});

// Печатаем заголовок
benchmark.printHeader();

// Создаем тестовые данные
const maxItems = 1000;
const array = Array.from({ length: maxItems }, (_, i) => ({ id: i, value: `value${i}` }));
const object = {};
const mapData = new Map();
const setData = new Set();
array.forEach(item => {
  object[item.id] = item;
  mapData.set(item.id, item);
  setData.add(item);
});

// Глубокий объект для тестирования deep методов
const deepObject = {
  a: { value: 1 },
  b: { value: 2 },
  c: { value: 3 },
  d: { value: 4 },
  e: { value: 5 },
  nested: {
    a: { value: 10 },
    b: { value: 20 },
    c: { value: 30 }
  }
};

// Сьют: forEach
const forEachSuite = benchmark.createSuite('forEach', {
  description: 'Тесты производительности для перебора элементов различных структур данных'
});

// Добавляем тесты
forEachSuite.add('Array.forEach', () => {
  let sum = 0;
  array.forEach(item => sum += item.id);
  return sum;
});

forEachSuite.add('deep(Array).forEach', () => {
  let sum = 0;
  deep(array).forEach(item => sum += item.id);
  return sum;
});

forEachSuite.add('Object.values + forEach', () => {
  let sum = 0;
  Object.values(object).forEach(item => sum += item.id);
  return sum;
});

forEachSuite.add('deep(Object).forEach', () => {
  let sum = 0;
  deep(object).forEach(item => sum += item.id);
  return sum;
});

forEachSuite.add('Map.forEach', () => {
    let sum = 0;
  mapData.forEach(item => sum += item.id);
    return sum;
});

forEachSuite.add('deep(Map).forEach', () => {
    let sum = 0;
  deep(mapData).forEach(item => sum += item.id);
    return sum;
});

forEachSuite.add('Set.forEach', () => {
    let sum = 0;
  setData.forEach(item => sum += item.id);
    return sum;
});

forEachSuite.add('deep(Set).forEach', () => {
    let sum = 0;
  deep(setData).forEach(item => sum += item.id);
    return sum;
});

forEachSuite.add('Array forEach (универсальный метод)', () => {
    let sum = 0;
  forEach(array, item => sum += item.id);
    return sum;
});

forEachSuite.add('Object forEach (универсальный метод)', () => {
    let sum = 0;
  forEach(object, item => sum += item.id);
    return sum;
});

forEachSuite.add('Map forEach (универсальный метод)', () => {
    let sum = 0;
  forEach(mapData, item => sum += item.id);
    return sum;
});

forEachSuite.add('Set forEach (универсальный метод)', () => {
    let sum = 0;
  forEach(setData, item => sum += item.id);
    return sum;
  });

// Сьют: map
const mapSuite = benchmark.createSuite('map', {
  description: 'Тесты производительности для маппинга элементов из разных структур данных'
});

mapSuite.add('Array.map', () => {
  return array.map(item => item.id * 2);
});

mapSuite.add('deep(Array).map', () => {
  return deep(array).map(item => item.id * 2);
});

mapSuite.add('Object.values + map', () => {
  return Object.values(object).map(item => item.id * 2);
});

mapSuite.add('deep(Object).map', () => {
  return deep(object).map(item => item.id * 2);
});

// Универсальный map для разных типов
mapSuite.add('Array map (универсальный метод)', () => {
  return map(array, item => item.id * 2);
});

mapSuite.add('Object map (универсальный метод)', () => {
  return map(object, item => item.id * 2);
});

mapSuite.add('Map map (универсальный метод)', () => {
  return map(mapData, item => item.id * 2);
});

// Сьют: filter
const filterSuite = benchmark.createSuite('filter', {
  description: 'Тесты производительности для фильтрации элементов из разных структур данных'
});

// Функция фильтрации для всех тестов
const filterFn = item => item.id % 2 === 0;

filterSuite.add('Array.filter', () => {
  return array.filter(filterFn);
});

filterSuite.add('deep(Array).filter', () => {
  return deep(array).filter(filterFn);
});

filterSuite.add('Object.values + filter', () => {
  return Object.values(object).filter(filterFn);
});

filterSuite.add('deep(Object).filter', () => {
  return deep(object).filter(filterFn);
});

filterSuite.add('Set + filter', () => {
  const result = [];
  setData.forEach(item => {
    if (filterFn(item)) result.push(item);
  });
  return result;
});

filterSuite.add('deep(Set).filter', () => {
  return deep(setData).filter(filterFn);
});

filterSuite.add('Map + filter', () => {
  const result = [];
  mapData.forEach((value) => {
    if (filterFn(value)) result.push(value);
  });
  return result;
});

filterSuite.add('deep(Map).filter', () => {
  return deep(mapData).filter(filterFn);
});

// Универсальный фильтр
filterSuite.add('Array filter (универсальный метод)', () => {
  return filter(array, filterFn);
});

filterSuite.add('Object filter (универсальный метод)', () => {
  return filter(object, filterFn);
});

filterSuite.add('Map filter (универсальный метод)', () => {
  return filter(mapData, filterFn);
});

filterSuite.add('Set filter (универсальный метод)', () => {
  return filter(setData, filterFn);
});

// Сьют: reduce
const reduceSuite = benchmark.createSuite('reduce', {
  description: 'Тесты производительности для свертки элементов из разных структур данных'
});

const reduceFn = (acc, item) => acc + item.id;

reduceSuite.add('Array.reduce', () => {
  return array.reduce(reduceFn, 0);
});

reduceSuite.add('deep(Array).reduce', () => {
  return deep(array).reduce(reduceFn, 0);
});

reduceSuite.add('Object.values + reduce', () => {
  return Object.values(object).reduce(reduceFn, 0);
});

reduceSuite.add('deep(Object).reduce', () => {
  return deep(object).reduce(reduceFn, 0);
});

// Универсальный reduce
reduceSuite.add('Array reduce (универсальный метод)', () => {
  return reduce(array, reduceFn, 0);
});

reduceSuite.add('Object reduce (универсальный метод)', () => {
  return reduce(object, reduceFn, 0);
});

reduceSuite.add('Map reduce (универсальный метод)', () => {
  return reduce(mapData, reduceFn, 0);
});

reduceSuite.add('Set reduce (универсальный метод)', () => {
  return reduce(setData, reduceFn, 0);
});

// Сьют: find
const findSuite = benchmark.createSuite('find', {
  description: 'Тесты производительности для поиска элементов в разных структурах данных'
});

const findFn = item => item.id === maxItems / 2;

findSuite.add('Array.find', () => {
  return array.find(findFn);
});

findSuite.add('deep(Array).find', () => {
  return deep(array).find(findFn);
});

findSuite.add('Object.values + find', () => {
  return Object.values(object).find(findFn);
});

findSuite.add('deep(Object).find', () => {
  return deep(object).find(findFn);
});

findSuite.add('Map + find', () => {
  let result = null;
  mapData.forEach(value => {
    if (result) return;
    if (findFn(value)) result = value;
  });
  return result;
});

findSuite.add('deep(Map).find', () => {
  return deep(mapData).find(findFn);
});

findSuite.add('Set + find', () => {
  let result = null;
  setData.forEach(item => {
    if (result) return;
    if (findFn(item)) result = item;
  });
  return result;
});

findSuite.add('deep(Set).find', () => {
  return deep(setData).find(findFn);
});

// Универсальный find
findSuite.add('Array find (универсальный метод)', () => {
  return find(array, findFn);
});

findSuite.add('Object find (универсальный метод)', () => {
  return find(object, findFn);
});

findSuite.add('Map find (универсальный метод)', () => {
  return find(mapData, findFn);
});

findSuite.add('Set find (универсальный метод)', () => {
  return find(setData, findFn);
});

// Сьют: every/some
const everySomeSuite = benchmark.createSuite('every/some', {
  description: 'Тесты производительности для проверки условий every/some для разных структур данных'
});

const everyFn = item => item.id !== -1;
const someFn = item => item.id === maxItems / 2;

everySomeSuite.add('Array.every', () => {
  return array.every(everyFn);
});

everySomeSuite.add('deep(Array).every', () => {
  return deep(array).every(everyFn);
});

everySomeSuite.add('Object.values + every', () => {
  return Object.values(object).every(everyFn);
});

everySomeSuite.add('deep(Object).every', () => {
  return deep(object).every(everyFn);
});

everySomeSuite.add('Array.some', () => {
  return array.some(someFn);
});

everySomeSuite.add('deep(Array).some', () => {
  return deep(array).some(someFn);
});

everySomeSuite.add('Object.values + some', () => {
  return Object.values(object).some(someFn);
});

everySomeSuite.add('deep(Object).some', () => {
  return deep(object).some(someFn);
});

// Универсальные методы every/some
everySomeSuite.add('Array every (универсальный метод)', () => {
  return every(array, everyFn);
});

everySomeSuite.add('Object every (универсальный метод)', () => {
  return every(object, everyFn);
});

everySomeSuite.add('Map every (универсальный метод)', () => {
  return every(mapData, everyFn);
});

everySomeSuite.add('Set every (универсальный метод)', () => {
  return every(setData, everyFn);
});

everySomeSuite.add('Array some (универсальный метод)', () => {
  return some(array, someFn);
});

everySomeSuite.add('Object some (универсальный метод)', () => {
  return some(object, someFn);
});

everySomeSuite.add('Map some (универсальный метод)', () => {
  return some(mapData, someFn);
});

everySomeSuite.add('Set some (универсальный метод)', () => {
  return some(setData, someFn);
});

// Сьют: keys/values/entries
const keysValuesSuite = benchmark.createSuite('keys/values/entries', {
  description: 'Тесты производительности для получения ключей, значений и пар ключ-значение для разных структур данных'
});

keysValuesSuite.add('Object.keys', () => {
  return Object.keys(object);
});

keysValuesSuite.add('deep(Object).keys', () => {
  return deep(object).keys();
});

keysValuesSuite.add('Object.values', () => {
  return Object.values(object);
});

keysValuesSuite.add('deep(Object).values', () => {
  return deep(object).values();
});

keysValuesSuite.add('Object.entries', () => {
  return Object.entries(object);
});

keysValuesSuite.add('deep(Object).entries', () => {
  return deep(object).entries();
});

// Тесты для глубоких объектов
keysValuesSuite.add('Object.keys (глубокий объект)', () => {
  return Object.keys(deepObject);
});

keysValuesSuite.add('deep(Object).keys (глубокий объект)', () => {
  return deep(deepObject).keys();
});

keysValuesSuite.add('Object.values (глубокий объект)', () => {
  return Object.values(deepObject);
});

keysValuesSuite.add('deep(Object).values (глубокий объект)', () => {
  return deep(deepObject).values();
});

keysValuesSuite.add('Object.entries (глубокий объект)', () => {
  return Object.entries(deepObject);
});

keysValuesSuite.add('deep(Object).entries (глубокий объект)', () => {
  return deep(deepObject).entries();
});

// Универсальные методы keys/values/entries
keysValuesSuite.add('Array keys (универсальный метод)', () => {
  return keys(array);
});

keysValuesSuite.add('Object keys (универсальный метод)', () => {
  return keys(object);
});

keysValuesSuite.add('Map keys (универсальный метод)', () => {
  return keys(mapData);
});

keysValuesSuite.add('Set keys (универсальный метод)', () => {
  return keys(setData);
});

keysValuesSuite.add('Array values (универсальный метод)', () => {
  return values(array);
});

keysValuesSuite.add('Object values (универсальный метод)', () => {
  return values(object);
});

keysValuesSuite.add('Map values (универсальный метод)', () => {
  return values(mapData);
});

keysValuesSuite.add('Set values (универсальный метод)', () => {
  return values(setData);
});

keysValuesSuite.add('Array entries (универсальный метод)', () => {
  return entries(array);
});

keysValuesSuite.add('Object entries (универсальный метод)', () => {
  return entries(object);
});

keysValuesSuite.add('Map entries (универсальный метод)', () => {
  return entries(mapData);
});

keysValuesSuite.add('Set entries (универсальный метод)', () => {
  return entries(setData);
});

// Сьют: get
const getSuite = benchmark.createSuite('get', {
  description: 'Тесты производительности для доступа к элементам различных структур данных'
});

// Добавляем тесты для get
getSuite.add('Array[index]', () => {
  return array[500];
});

getSuite.add('deep(Array).get(index)', () => {
  return deep(array).get(500);
});

getSuite.add('Object.property', () => {
  return object[500];
});

getSuite.add('deep(Object).get(key)', () => {
  return deep(object).get(500);
});

getSuite.add('Map.get(key)', () => {
  return mapData.get(500);
});

getSuite.add('deep(Map).get(key)', () => {
  return deep(mapData).get(500);
});

getSuite.add('String[index]', () => {
  const str = "Hello World";
  return str[5];
});

getSuite.add('deep(String).get(index)', () => {
  const str = "Hello World";
  return deep(str).get(5);
});

getSuite.add('Set (iterate to index)', () => {
  let result;
  let index = 0;
  for (const item of setData) {
    if (index === 500) {
      result = item;
      break;
    }
    index++;
  }
  return result;
});

getSuite.add('deep(Set).get(index)', () => {
  return deep(setData).get(500);
});

// Сьют: has
const hasSuite = benchmark.createSuite('has', {
  description: 'Тесты производительности для проверки наличия элементов в различных структурах данных'
});

// Добавляем тесты для has
hasSuite.add('Array.includes', () => {
  return array.includes(array[500]);
});

hasSuite.add('Array (check index)', () => {
  return 500 >= 0 && 500 < array.length;
});

hasSuite.add('deep(Array).has', () => {
  return deep(array).has(500);
});

hasSuite.add('Object.hasOwnProperty', () => {
  return Object.prototype.hasOwnProperty.call(object, 500);
});

hasSuite.add('deep(Object).has', () => {
  return deep(object).has(500);
});

hasSuite.add('Map.has', () => {
  return mapData.has(500);
});

hasSuite.add('deep(Map).has', () => {
  return deep(mapData).has(500);
});

hasSuite.add('Set.has', () => {
  return setData.has(array[500]);
});

hasSuite.add('deep(Set).has', () => {
  return deep(setData).has(array[500]);
});

hasSuite.add('String (check index)', () => {
  const str = "Hello World";
  return 5 >= 0 && 5 < str.length;
});

hasSuite.add('String.includes', () => {
  const str = "Hello World";
  return str.includes("World");
});

hasSuite.add('deep(String).has', () => {
  const str = "Hello World";
  return deep(str).has("World");
});

/**
 * Запускает все бенчмарки и логирует результаты
 */
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для методов gets.js...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'GETS.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();
