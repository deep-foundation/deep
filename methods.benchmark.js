import Benchmark from 'benchmark';
import { Deep } from "./deep.js";

const suite = new Benchmark.Suite;

// Подготовка тестовых данных разного размера
const symbol = Symbol('test');
const str1 = 'a';
const str1k = 'a'.repeat(1000);
const str1m = 'a'.repeat(1000000);

const arr1 = [1];
const arr1k = Array.from({length: 1000}, (_, i) => i);
const arr1m = Array.from({length: 1000000}, (_, i) => i);

const set1 = new Set([1]);
const set1k = new Set(arr1k);
const set1m = new Set(arr1m);

const map1 = new Map([['a', 1]]);
const map1k = new Map(arr1k.map(i => [i, i]));
const map1m = new Map(arr1m.map(i => [i, i]));

const obj1 = { a: 1 };
const obj1k = Object.fromEntries(arr1k.map(i => [i, i]));
const obj1m = Object.fromEntries(arr1m.map(i => [i, i]));

// Бенчмарки для метода has с разными типами и размерами данных
suite
// Symbol (размер не имеет значения)
.add('has.Symbol', () => {
  const deep = Deep.new(symbol);
  deep.has(symbol);
})

// Boolean (размер не имеет значения)
.add('has.Boolean', () => {
  const deep = Deep.new(true);
  deep.has(true);
})

// String разных размеров - проверка наличия первого символа
.add('has.String.1.first', () => {
  const deep = Deep.new(str1);
  deep.has(0);
})
.add('has.String.1k.first', () => {
  const deep = Deep.new(str1k);
  deep.has(0);
})
.add('has.String.1m.first', () => {
  const deep = Deep.new(str1m);
  deep.has(0);
})

// String разных размеров - проверка наличия последнего символа
.add('has.String.1.last', () => {
  const deep = Deep.new(str1);
  deep.has(str1.length - 1);
})
.add('has.String.1k.last', () => {
  const deep = Deep.new(str1k);
  deep.has(str1k.length - 1);
})
.add('has.String.1m.last', () => {
  const deep = Deep.new(str1m);
  deep.has(str1m.length - 1);
})

// Set разных размеров - проверка наличия первого элемента
.add('has.Set.1.first', () => {
  const deep = Deep.new(set1);
  deep.has(1);
})
.add('has.Set.1k.first', () => {
  const deep = Deep.new(set1k);
  deep.has(0);
})
.add('has.Set.1m.first', () => {
  const deep = Deep.new(set1m);
  deep.has(0);
})

// Set разных размеров - проверка наличия последнего элемента
.add('has.Set.1.last', () => {
  const deep = Deep.new(set1);
  deep.has(1);
})
.add('has.Set.1k.last', () => {
  const deep = Deep.new(set1k);
  deep.has(999);
})
.add('has.Set.1m.last', () => {
  const deep = Deep.new(set1m);
  deep.has(999999);
})

// Map разных размеров - проверка наличия первого ключа
.add('has.Map.1.first', () => {
  const deep = Deep.new(map1);
  deep.has('a');
})
.add('has.Map.1k.first', () => {
  const deep = Deep.new(map1k);
  deep.has(0);
})
.add('has.Map.1m.first', () => {
  const deep = Deep.new(map1m);
  deep.has(0);
})

// Map разных размеров - проверка наличия последнего ключа
.add('has.Map.1.last', () => {
  const deep = Deep.new(map1);
  deep.has('a');
})
.add('has.Map.1k.last', () => {
  const deep = Deep.new(map1k);
  deep.has(999);
})
.add('has.Map.1m.last', () => {
  const deep = Deep.new(map1m);
  deep.has(999999);
})

// Array разных размеров - проверка наличия первого индекса
.add('has.Array.1.first', () => {
  const deep = Deep.new(arr1);
  deep.has(0);
})
.add('has.Array.1k.first', () => {
  const deep = Deep.new(arr1k);
  deep.has(0);
})
.add('has.Array.1m.first', () => {
  const deep = Deep.new(arr1m);
  deep.has(0);
})

// Array разных размеров - проверка наличия последнего индекса
.add('has.Array.1.last', () => {
  const deep = Deep.new(arr1);
  deep.has(0);
})
.add('has.Array.1k.last', () => {
  const deep = Deep.new(arr1k);
  deep.has(999);
})
.add('has.Array.1m.last', () => {
  const deep = Deep.new(arr1m);
  deep.has(999999);
})

// Бенчмарки для метода get с разными типами и размерами данных
.add('get.String.1.first', () => {
  const deep = Deep.new(str1);
  deep.get(0);
})
.add('get.String.1k.first', () => {
  const deep = Deep.new(str1k);
  deep.get(0);
})
.add('get.String.1m.first', () => {
  const deep = Deep.new(str1m);
  deep.get(0);
})
.add('get.String.1.last', () => {
  const deep = Deep.new(str1);
  deep.get(str1.length - 1);
})
.add('get.String.1k.last', () => {
  const deep = Deep.new(str1k);
  deep.get(str1k.length - 1);
})
.add('get.String.1m.last', () => {
  const deep = Deep.new(str1m);
  deep.get(str1m.length - 1);
})

.add('get.Set.1.exists', () => {
  const deep = Deep.new(set1);
  deep.get(1);
})
.add('get.Set.1k.exists', () => {
  const deep = Deep.new(set1k);
  deep.get(500);
})
.add('get.Set.1m.exists', () => {
  const deep = Deep.new(set1m);
  deep.get(500000);
})
.add('get.Set.1.notExists', () => {
  const deep = Deep.new(set1);
  deep.get(2);
})
.add('get.Set.1k.notExists', () => {
  const deep = Deep.new(set1k);
  deep.get(1001);
})
.add('get.Set.1m.notExists', () => {
  const deep = Deep.new(set1m);
  deep.get(1000001);
})

.add('get.Map.1.exists', () => {
  const deep = Deep.new(map1);
  deep.get('a');
})
.add('get.Map.1k.exists', () => {
  const deep = Deep.new(map1k);
  deep.get(500);
})
.add('get.Map.1m.exists', () => {
  const deep = Deep.new(map1m);
  deep.get(500000);
})
.add('get.Map.1.notExists', () => {
  const deep = Deep.new(map1);
  deep.get('b');
})
.add('get.Map.1k.notExists', () => {
  const deep = Deep.new(map1k);
  deep.get(1001);
})
.add('get.Map.1m.notExists', () => {
  const deep = Deep.new(map1m);
  deep.get(1000001);
})

.add('get.Array.1.first', () => {
  const deep = Deep.new(arr1);
  deep.get(0);
})
.add('get.Array.1k.first', () => {
  const deep = Deep.new(arr1k);
  deep.get(0);
})
.add('get.Array.1m.first', () => {
  const deep = Deep.new(arr1m);
  deep.get(0);
})
.add('get.Array.1.last', () => {
  const deep = Deep.new(arr1);
  deep.get(arr1.length - 1);
})
.add('get.Array.1k.last', () => {
  const deep = Deep.new(arr1k);
  deep.get(arr1k.length - 1);
})
.add('get.Array.1m.last', () => {
  const deep = Deep.new(arr1m);
  deep.get(arr1m.length - 1);
})

.add('get.Object.1.exists', () => {
  const deep = Deep.new(obj1);
  deep.get('a');
})
.add('get.Object.1k.exists', () => {
  const deep = Deep.new(obj1k);
  deep.get('500');
})
.add('get.Object.1m.exists', () => {
  const deep = Deep.new(obj1m);
  deep.get('500000');
})
.add('get.Object.1.notExists', () => {
  const deep = Deep.new(obj1);
  deep.get('b');
})
.add('get.Object.1k.notExists', () => {
  const deep = Deep.new(obj1k);
  deep.get('1001');
})
.add('get.Object.1m.notExists', () => {
  const deep = Deep.new(obj1m);
  deep.get('1000001');
})

// Бенчмарки для метода size
.add('size.Set', () => {
  const deep = Deep.new(set1);
  deep.size;
})
.add('size.Map', () => {
  const deep = Deep.new(map1);
  deep.size;
})
.add('size.Array', () => {
  const deep = Deep.new(arr1);
  deep.size;
})

// Бенчмарки для метода map
.add('map.Set', () => {
  const deep = Deep.new(set1);
  deep.map(v => v * 2);
})
.add('map.Map', () => {
  const deep = Deep.new(map1);
  deep.map(v => v * 2);
})
.add('map.Array', () => {
  const deep = Deep.new(arr1);
  deep.map(v => v * 2);
})

// Бенчмарки для метода filter
.add('filter.Set', () => {
  const deep = Deep.new(set1);
  deep.filter(v => v > 1);
})
.add('filter.Map', () => {
  const deep = Deep.new(map1);
  deep.filter(v => v > 1);
})
.add('filter.Array', () => {
  const deep = Deep.new(arr1);
  deep.filter(v => v > 1);
})

// Бенчмарки для метода reduce
.add('reduce.Set', () => {
  const deep = Deep.new(set1);
  deep.reduce((acc, cur) => acc + cur, 0);
})
.add('reduce.Map', () => {
  const deep = Deep.new(map1);
  deep.reduce((acc, cur) => acc + cur, 0);
})
.add('reduce.Array', () => {
  const deep = Deep.new(arr1);
  deep.reduce((acc, cur) => acc + cur, 0);
})

// Бенчмарки для методов first/last
.add('first.Set', () => {
  const deep = Deep.new(set1);
  deep.first;
})
.add('first.Map', () => {
  const deep = Deep.new(map1);
  deep.first;
})
.add('last.Set', () => {
  const deep = Deep.new(set1);
  deep.last;
})
.add('last.Map', () => {
  const deep = Deep.new(map1);
  deep.last;
})

// Бенчмарки для методов keys/values
.add('keys.Map', () => {
  const deep = Deep.new(map1);
  deep.keys();
})
.add('values.Map', () => {
  const deep = Deep.new(map1);
  deep.values();
})

// Бенчмарки для методов set/unset
.add('set.Map', () => {
  const deep = Deep.new(new Map(map1));
  deep.set('c', 3);
})
.add('unset.Map', () => {
  const deep = Deep.new(new Map(map1));
  deep.unset('a');
})

// Запускаем бенчмарки
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': true });
