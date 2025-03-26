/**
 * Бенчмарк для методов модификации (sets.js)
 */
import Benchmarkify from 'benchmarkify';
import { deep } from './index.js';

// Инициализация бенчмарка
const benchmark = new Benchmarkify('Deep Sets Methods', { minSamples: 200 });

// Печать информации о системе
benchmark.printHeader();

// Настройка тестов

// 1. Тест set
const setBenchmark = benchmark.createSuite('set(key, value)');

// Подготовка данных для set
const setArray = [1, 2, 3, 4, 5];
const setObject = { a: 1, b: 2, c: 3, d: 4, e: 5 };
const setMap = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
const setSet = new Set([1, 2, 3, 4, 5]);
const setString = 'abcde';

// Тесты нативных методов для set
setBenchmark.add('Array[index] (нативный)', () => {
  const arr = [...setArray];
  arr[2] = 10;
  return arr;
});

setBenchmark.add('Object[key] (нативный)', () => {
  const obj = { ...setObject };
  obj.c = 10;
  return obj;
});

setBenchmark.add('Map.set (нативный)', () => {
  const map = new Map(setMap);
  map.set('c', 10);
  return map;
});

setBenchmark.add('String replace (нативный)', () => {
  return setString.substring(0, 2) + 'X' + setString.substring(3);
});

// Тесты deep методов для set
setBenchmark.add('deep(Array).set', () => {
  const arr = deep([...setArray]);
  arr.set(2, 10);
  return arr.this;
});

setBenchmark.add('deep(Object).set', () => {
  const obj = deep({ ...setObject });
  obj.set('c', 10);
  return obj.this;
});

setBenchmark.add('deep(Map).set', () => {
  const map = deep(new Map(setMap));
  map.set('c', 10);
  return map.this;
});

setBenchmark.add('deep(Set).set', () => {
  const set = deep(new Set(setSet));
  set.set(10);
  return set.this;
});

setBenchmark.add('deep(String).set', () => {
  const str = deep(setString);
  str.set(2, 'X');
  return str.this;
});

// 2. Тест delete
const deleteBenchmark = benchmark.createSuite('delete(key)');

// Подготовка данных для delete
const deleteArray = [1, 2, 3, 4, 5];
const deleteObject = { a: 1, b: 2, c: 3, d: 4, e: 5 };
const deleteMap = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
const deleteSet = new Set([1, 2, 3, 4, 5]);
const deleteString = 'abcde';

// Тесты нативных методов для delete
deleteBenchmark.add('Array.splice (нативный)', () => {
  const arr = [...deleteArray];
  arr.splice(2, 1);
  return arr;
});

deleteBenchmark.add('Object delete (нативный)', () => {
  const obj = { ...deleteObject };
  delete obj.c;
  return obj;
});

deleteBenchmark.add('Map.delete (нативный)', () => {
  const map = new Map(deleteMap);
  map.delete('c');
  return map;
});

deleteBenchmark.add('Set.delete (нативный)', () => {
  const set = new Set(deleteSet);
  set.delete(3);
  return set;
});

deleteBenchmark.add('String slice (нативный)', () => {
  return deleteString.slice(0, 2) + deleteString.slice(3);
});

// Тесты deep методов для delete
deleteBenchmark.add('deep(Array).delete', () => {
  const arr = deep([...deleteArray]);
  arr.delete(2);
  return arr.this;
});

deleteBenchmark.add('deep(Object).delete', () => {
  const obj = deep({ ...deleteObject });
  obj.delete('c');
  return obj.this;
});

deleteBenchmark.add('deep(Map).delete', () => {
  const map = deep(new Map(deleteMap));
  map.delete('c');
  return map.this;
});

deleteBenchmark.add('deep(Set).delete', () => {
  const set = deep(new Set(deleteSet));
  set.delete(3);
  return set.this;
});

deleteBenchmark.add('deep(String).delete', () => {
  const str = deep(deleteString);
  str.delete(2);
  return str.this;
});

// 3. Тест add
const addBenchmark = benchmark.createSuite('add(value)');

// Подготовка данных для add
const addArray = [1, 2, 3, 4, 5];
const addObject = { a: 1, b: 2, c: 3, d: 4, e: 5 };
const addMap = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
const addSet = new Set([1, 2, 3, 4, 5]);
const addString = 'abcde';

// Тесты нативных методов для add
addBenchmark.add('Array.push (нативный)', () => {
  const arr = [...addArray];
  arr.push(6);
  return arr;
});

addBenchmark.add('Object assign (нативный)', () => {
  const obj = { ...addObject };
  obj.f = 6;
  return obj;
});

addBenchmark.add('Map.set (нативный для add)', () => {
  const map = new Map(addMap);
  map.set('f', 6);
  return map;
});

addBenchmark.add('Set.add (нативный)', () => {
  const set = new Set(addSet);
  set.add(6);
  return set;
});

addBenchmark.add('String concat (нативный)', () => {
  return addString + 'f';
});

// Тесты deep методов для add
addBenchmark.add('deep(Array).add', () => {
  const arr = deep([...addArray]);
  arr.add(6);
  return arr.this;
});

addBenchmark.add('deep(Object).add', () => {
  const obj = deep({ ...addObject });
  obj.add(6, 'f');
  return obj.this;
});

addBenchmark.add('deep(Map).add', () => {
  const map = deep(new Map(addMap));
  map.add(6, 'f');
  return map.this;
});

addBenchmark.add('deep(Set).add', () => {
  const set = deep(new Set(addSet));
  set.add(6);
  return set.this;
});

addBenchmark.add('deep(String).add', () => {
  const str = deep(addString);
  str.add('f');
  return str.this;
});

// 4. Тест remove
const removeBenchmark = benchmark.createSuite('remove(value)');

// Подготовка данных для remove
const removeArray = [1, 2, 3, 4, 5, 3];
const removeObject = { a: 1, b: 2, c: 3, d: 4, e: 3 };
const removeMap = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 3]]);
const removeSet = new Set([1, 2, 3, 4, 5]);

// Тесты нативных методов для remove
removeBenchmark.add('Array.indexOf + splice (нативный)', () => {
  const arr = [...removeArray];
  const index = arr.indexOf(3);
  if (index !== -1) {
    arr.splice(index, 1);
  }
  return arr;
});

removeBenchmark.add('Object.entries + delete (нативный)', () => {
  const obj = { ...removeObject };
  const entries = Object.entries(obj);
  const entry = entries.find(([key, value]) => value === 3);
  if (entry) {
    delete obj[entry[0]];
  }
  return obj;
});

removeBenchmark.add('Map entries + delete (нативный)', () => {
  const map = new Map(removeMap);
  for (const [key, value] of map.entries()) {
    if (value === 3) {
      map.delete(key);
      break;
    }
  }
  return map;
});

removeBenchmark.add('Set.delete (нативный для remove)', () => {
  const set = new Set(removeSet);
  set.delete(3);
  return set;
});

// Тесты deep методов для remove
removeBenchmark.add('deep(Array).remove', () => {
  const arr = deep([...removeArray]);
  arr.remove(3);
  return arr.this;
});

removeBenchmark.add('deep(Object).remove', () => {
  const obj = deep({ ...removeObject });
  obj.remove(3);
  return obj.this;
});

removeBenchmark.add('deep(Map).remove', () => {
  const map = deep(new Map(removeMap));
  map.remove(3);
  return map.this;
});

removeBenchmark.add('deep(Set).remove', () => {
  const set = deep(new Set(removeSet));
  set.remove(3);
  return set.this;
});

// 5. Тесты методов массива
const arrayMethodsBenchmark = benchmark.createSuite('Методы массива');

// Подготовка данных для методов массива
const arrayBase = [1, 2, 3, 4, 5];

// Тесты нативных методов массива
arrayMethodsBenchmark.add('Array.push (нативный)', () => {
  const arr = [...arrayBase];
  arr.push(6, 7);
  return arr;
});

arrayMethodsBenchmark.add('Array.pop (нативный)', () => {
  const arr = [...arrayBase];
  arr.pop();
  return arr;
});

arrayMethodsBenchmark.add('Array.shift (нативный)', () => {
  const arr = [...arrayBase];
  arr.shift();
  return arr;
});

arrayMethodsBenchmark.add('Array.unshift (нативный)', () => {
  const arr = [...arrayBase];
  arr.unshift(0, -1);
  return arr;
});

// Тесты deep методов массива
arrayMethodsBenchmark.add('deep(Array).push', () => {
  const arr = deep([...arrayBase]);
  arr.push(6, 7);
  return arr.this;
});

arrayMethodsBenchmark.add('deep(Array).pop', () => {
  const arr = deep([...arrayBase]);
  arr.pop();
  return arr.this;
});

arrayMethodsBenchmark.add('deep(Array).shift', () => {
  const arr = deep([...arrayBase]);
  arr.shift();
  return arr.this;
});

arrayMethodsBenchmark.add('deep(Array).unshift', () => {
  const arr = deep([...arrayBase]);
  arr.unshift(0, -1);
  return arr.this;
});

// Запуск всех тестов
setBenchmark.run();
deleteBenchmark.run();
addBenchmark.run();
removeBenchmark.run();
arrayMethodsBenchmark.run();
