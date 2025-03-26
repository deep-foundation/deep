/**
 * Бенчмарк для методов модификации (sets.js)
 */
import Benchmarkify from 'benchmarkify';
import deep from './index.js';

const benchmark = new Benchmarkify("Deep Methods Benchmark - Sets").printHeader();

// Создание бенчмарка
const bench = benchmark.createSuite("Методы работы с наборами (sets.js)");

// Начальные данные для тестов
const arraySize = 1000;
const testArray = Array.from({ length: arraySize }, (_, i) => i);
const testObject = Object.fromEntries(testArray.map((val, i) => [`key${i}`, val]));
const testMap = new Map(testArray.map((val, i) => [`key${i}`, val]));
const testSet = new Set(testArray);

// Оборачиваем в deep
const deepArray = deep(testArray.slice());
const deepObject = deep({ ...testObject });
const deepMap = deep(new Map(testMap));
const deepSet = deep(new Set(testSet));

// Бенчмарк метода add
bench.add("add в массив", () => {
  const arr = deep(testArray.slice());
  arr.add(arraySize);
  return arr.this.length === arraySize + 1;
});

bench.add("push в обычный массив (нативный)", () => {
  const arr = testArray.slice();
  arr.push(arraySize);
  return arr.length === arraySize + 1;
});

bench.add("add в объект", () => {
  const obj = deep({ ...testObject });
  obj.add(`newKey`, arraySize);
  return obj.this.newKey === arraySize;
});

bench.add("add в Map", () => {
  const map = deep(new Map(testMap));
  map.add(`newKey`, arraySize);
  return map.this.get('newKey') === arraySize;
});

bench.add("add в Set", () => {
  const set = deep(new Set(testSet));
  set.add(arraySize);
  return set.this.has(arraySize);
});

// Бенчмарк метода remove
bench.add("remove из массива", () => {
  const arr = deep(testArray.slice());
  arr.remove(50);
  return arr.this.length === arraySize - 1;
});

bench.add("splice из обычного массива (нативный)", () => {
  const arr = testArray.slice();
  const index = arr.indexOf(50);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr.length === arraySize - 1;
});

bench.add("remove из объекта", () => {
  const obj = deep({ ...testObject });
  obj.remove('key50');
  return obj.this.key50 === undefined;
});

bench.add("remove из Map", () => {
  const map = deep(new Map(testMap));
  map.remove('key50');
  return !map.this.has('key50');
});

bench.add("remove из Set", () => {
  const set = deep(new Set(testSet));
  set.remove(50);
  return !set.this.has(50);
});

// Бенчмарк метода clear
bench.add("clear для массива", () => {
  const arr = deep(testArray.slice());
  arr.clear();
  return arr.this.length === 0;
});

bench.add("length = 0 для обычного массива (нативный)", () => {
  const arr = testArray.slice();
  arr.length = 0;
  return arr.length === 0;
});

bench.add("clear для объекта", () => {
  const obj = deep({ ...testObject });
  obj.clear();
  return Object.keys(obj.this).length === 0;
});

bench.add("clear для Map", () => {
  const map = deep(new Map(testMap));
  map.clear();
  return map.this.size === 0;
});

bench.add("clear для Set", () => {
  const set = deep(new Set(testSet));
  set.clear();
  return set.this.size === 0;
});

// Бенчмарк метода has
bench.add("has для массива", () => {
  return deepArray.has(50);
});

bench.add("includes для обычного массива (нативный)", () => {
  return testArray.includes(50);
});

bench.add("has для объекта", () => {
  return deepObject.has('key50');
});

bench.add("hasOwnProperty для обычного объекта (нативный)", () => {
  return testObject.hasOwnProperty('key50');
});

bench.add("has для Map", () => {
  return deepMap.has('key50');
});

bench.add("has для Set", () => {
  return deepSet.has(50);
});

// Бенчмарк метода get
bench.add("get для массива", () => {
  return deepArray.get(50).this === 50;
});

bench.add("индексный доступ для обычного массива (нативный)", () => {
  return testArray[50] === 50;
});

bench.add("get для объекта", () => {
  return deepObject.get('key50').this === 50;
});

bench.add("прямой доступ для обычного объекта (нативный)", () => {
  return testObject.key50 === 50;
});

bench.add("get для Map", () => {
  return deepMap.get('key50').this === 50;
});

bench.add("get для Set", () => {
  return deepSet.get(50).this === 50;
});

// Бенчмарк метода set
bench.add("set для массива", () => {
  const arr = deep(testArray.slice());
  arr.set(50, 999);
  return arr.this[50] === 999;
});

bench.add("индексное присваивание для обычного массива (нативный)", () => {
  const arr = testArray.slice();
  arr[50] = 999;
  return arr[50] === 999;
});

bench.add("set для объекта", () => {
  const obj = deep({ ...testObject });
  obj.set('key50', 999);
  return obj.this.key50 === 999;
});

bench.add("прямое присваивание для обычного объекта (нативный)", () => {
  const obj = { ...testObject };
  obj.key50 = 999;
  return obj.key50 === 999;
});

bench.add("set для Map", () => {
  const map = deep(new Map(testMap));
  map.set('key50', 999);
  return map.this.get('key50') === 999;
});

bench.add("set для Set", () => {
  // Для Set нет прямого эквивалента, поэтому тестируем удаление и добавление
  const set = deep(new Set(testSet));
  set.remove(50);
  set.add(999);
  return !set.this.has(50) && set.this.has(999);
});

// Бенчмарк метода size
bench.add("size для массива", () => {
  return deepArray.size() === arraySize;
});

bench.add("length для обычного массива (нативный)", () => {
  return testArray.length === arraySize;
});

bench.add("size для объекта", () => {
  return deepObject.size() === arraySize;
});

bench.add("Object.keys().length для обычного объекта (нативный)", () => {
  return Object.keys(testObject).length === arraySize;
});

bench.add("size для Map", () => {
  return deepMap.size() === arraySize;
});

bench.add("size для Set", () => {
  return deepSet.size() === arraySize;
});

// Запуск бенчмарка
benchmark.run();
