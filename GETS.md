# Методы доступа к данным

В данном документе описывается функциональность модуля `gets.js`, который предоставляет универсальные методы для работы с различными типами данных в библиотеке deep.

Методы доступа позволяют работать с различными типами данных (массивы, объекты, строки, Map, Set) единообразным способом, не изменяя исходные данные.

## Производительность

**Информация о системе:**

- clk: ~1.55 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Array.forEach (нативный) | 3.58 µs/итер | 279 329,609 опер/сек |
| deep(Array).forEach | 6.02 µs/итер | 166 112,957 опер/сек |
| Object.values + forEach (нативный) | 2.41 µs/итер | 414 937,759 опер/сек |
| deep(Object).forEach | 4.91 µs/итер | 203 665,988 опер/сек |
| String[Symbol.iterator] (нативный) | 1.94 µs/итер | 515 463,918 опер/сек |
| deep(String).forEach | 2.56 µs/итер | 390 625 опер/сек |
| Map.forEach (нативный) | 1.50 µs/итер | 666 666,667 опер/сек |
| deep(Map).forEach | 1.84 µs/итер | 543 478,261 опер/сек |
| Set.forEach (нативный) | 1.15 µs/итер | 869 565,217 опер/сек |
| deep(Set).forEach | 1.73 µs/итер | 578 034,682 опер/сек |
| Array.map (нативный) | 6.25 µs/итер | 160 000 опер/сек |
| deep(Array).map | 10.34 µs/итер | 96 711,799 опер/сек |
| Object.values + map (нативный) | 1.58 µs/итер | 632 911,392 опер/сек |
| deep(Object).map | 25.93 µs/итер | 38 565,368 опер/сек |
| String.split + map + join (нативный) | 15.84 µs/итер | 63 131,313 опер/сек |
| deep(String).map | 10.61 µs/итер | 94 250,707 опер/сек |
| Array.filter (нативный) | 6.32 µs/итер | 158 227,848 опер/сек |
| deep(Array).filter | 11.91 µs/итер | 83 963,056 опер/сек |
| Object.values + filter (нативный) | 2.22 µs/итер | 450 450,45 опер/сек |
| deep(Object).filter | 13.62 µs/итер | 73 421,439 опер/сек |
| Array.reduce (нативный) | 3.75 µs/итер | 266 666,667 опер/сек |
| deep(Array).reduce | 4.90 µs/итер | 204 081,633 опер/сек |
| Object.values + reduce (нативный) | 1.47 µs/итер | 680 272,109 опер/сек |
| deep(Object).reduce | 6.00 µs/итер | 166 666,667 опер/сек |
| Array.find (нативный) | 503.48 ns/итер | 1 986 176,214 опер/сек |
| deep(Array).find | 1.13 µs/итер | 884 955,752 опер/сек |
| Object.values + find (нативный) | 744.59 ns/итер | 1 343 020,991 опер/сек |
| deep(Object).find | 2.32 µs/итер | 431 034,483 опер/сек |
| Array.every (нативный) | 1.04 µs/итер | 961 538,462 опер/сек |
| deep(Array).every | 1.52 µs/итер | 657 894,737 опер/сек |
| Array.some (нативный) | 889.64 ns/итер | 1 124 050,178 опер/сек |
| deep(Array).some | 1.44 µs/итер | 694 444,444 опер/сек |
| Object.keys (нативный) | 127.95 ns/итер | 7 815 552,95 опер/сек |
| deep(Object).keys | 421.61 ns/итер | 2 371 860,25 опер/сек |
| Object.values (нативный) | 1.06 µs/итер | 943 396,226 опер/сек |
| deep(Object).values | 1.43 µs/итер | 699 300,699 опер/сек |
| Object.entries (нативный) | 3.99 µs/итер | 250 626,566 опер/сек |
| deep(Object).entries | 2.30 µs/итер | 434 782,609 опер/сек |
| Array.join (нативный) | 80.16 µs/итер | 12 475,05 опер/сек |
| deep(Array).join | 85.57 µs/итер | 11 686,339 опер/сек |
| Object.values + join (нативный) | 7.87 µs/итер | 127 064,803 опер/сек |
| deep(Object).join | 8.87 µs/итер | 112 739,572 опер/сек |

## Основные особенности

1. Все методы доступа работают с `this.this` внутри Association
2. Методы не изменяют исходные данные (неизменяемые операции)
3. Методы возвращают примитивы или новые массивы с данными
4. Поддерживаются все основные типы коллекций

## Поддерживаемые типы данных

Методы доступа работают со следующими типами данных:
- Массивы (`Array`)
- Объекты (`Object`)
- Строки (`String`)
- Map
- Set
- Примитивы (с соответствующими преобразованиями)

## Доступные методы

### forEach(callback)

Перебирает все элементы коллекции и вызывает для каждого callback-функцию.

```js
deep([1, 2, 3]).forEach((value, index, collection) => {
  console.log(value, index);
});

deep({ a: 1, b: 2 }).forEach((value, key, collection) => {
  console.log(key, value);
});
```

### map(callback)

Преобразует элементы коллекции с помощью callback-функции и возвращает новый массив.

```js
const doubled = deep([1, 2, 3]).map(x => x * 2); // [2, 4, 6]
const upperKeys = deep({ a: 1, b: 2 }).map((value, key) => key.toUpperCase());
```

### filter(callback)

Фильтрует элементы коллекции с помощью callback-функции и возвращает новый массив.

```js
const even = deep([1, 2, 3, 4]).filter(x => x % 2 === 0); // [2, 4]
const bigValues = deep({ a: 1, b: 10 }).filter(value => value > 5); // [10]
```

### reduce(callback, initialValue)

Сворачивает коллекцию в одно значение с помощью callback-функции.

```js
const sum = deep([1, 2, 3, 4]).reduce((acc, x) => acc + x, 0); // 10
const concat = deep(['a', 'b', 'c']).reduce((acc, x) => acc + x, ''); // 'abc'
```

### every(callback)

Проверяет, удовлетворяют ли все элементы условию.

```js
const allPositive = deep([1, 2, 3]).every(x => x > 0); // true
const allEven = deep([2, 4, 5]).every(x => x % 2 === 0); // false
```

### some(callback)

Проверяет, удовлетворяет ли хотя бы один элемент условию.

```js
const hasEven = deep([1, 2, 3]).some(x => x % 2 === 0); // true
const hasNegative = deep([1, 2, 3]).some(x => x < 0); // false
```

### find(callback)

Находит первый элемент, удовлетворяющий условию.

```js
const found = deep([1, 2, 3, 4]).find(x => x > 2); // 3
const notFound = deep([1, 2, 3]).find(x => x > 5); // undefined
```

### findKey(callback)

Находит ключ первого элемента, удовлетворяющего условию.

```js
const key = deep({ a: 1, b: 2, c: 3 }).findKey(x => x > 2); // 'c'
const arrayIndex = deep([10, 20, 30]).findKey(x => x > 15); // 1
```

### keys()

Возвращает массив ключей коллекции.

```js
const objKeys = deep({ a: 1, b: 2 }).keys(); // ['a', 'b']
const arrKeys = deep([10, 20, 30]).keys(); // [0, 1, 2]
```

### values()

Возвращает массив значений коллекции.

```js
const objValues = deep({ a: 1, b: 2 }).values(); // [1, 2]
const arrValues = deep([10, 20, 30]).values(); // [10, 20, 30]
```

### entries()

Возвращает массив пар [ключ, значение] коллекции.

```js
const objEntries = deep({ a: 1, b: 2 }).entries(); // [['a', 1], ['b', 2]]
const arrEntries = deep([10, 20]).entries(); // [[0, 10], [1, 20]]
```

### join(separator)

Объединяет элементы коллекции в строку с указанным разделителем.

```js
const joined = deep([1, 2, 3]).join('-'); // '1-2-3'
const objJoined = deep({ a: 1, b: 2 }).join(','); // '1,2'
```

## Пример использования

```js
import { deep } deep7;

// Работа с массивом
const arr = [1, 2, 3, 4, 5];
const sum = deep(arr)
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((acc, x) => acc + x, 0);

console.log(sum); // 12 (2*2 + 4*2)

// Работа с объектом
const obj = { a: 1, b: 2, c: 3 };
const keys = deep(obj)
  .filter(val => val > 1)
  .map((val, key) => key.toUpperCase());

console.log(keys); // ['B', 'C']

// Работа со строкой
const str = 'hello';
const chars = deep(str)
  .filter(char => char !== 'l')
  .join('');

console.log(chars); // 'heo'
```

## Производительность

**Информация о системе:**

- clk: ~1.31 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Array.forEach (нативный) | 4.63 µs/итер | 215 982,721 опер/сек |
| deep(Array).forEach | 6.42 µs/итер | 155 763,24 опер/сек |
| Object.values + forEach (нативный) | 2.96 µs/итер | 337 837,838 опер/сек |
| deep(Object).forEach | 5.19 µs/итер | 192 678,227 опер/сек |
| String[Symbol.iterator] (нативный) | 2.53 µs/итер | 395 256,917 опер/сек |
| deep(String).forEach | 2.30 µs/итер | 434 782,609 опер/сек |
| Map.forEach (нативный) | 1.54 µs/итер | 649 350,649 опер/сек |
| deep(Map).forEach | 2.39 µs/итер | 418 410,042 опер/сек |
| Set.forEach (нативный) | 1.11 µs/итер | 900 900,901 опер/сек |
| deep(Set).forEach | 1.60 µs/итер | 625 000 опер/сек |
| Array.map (нативный) | 5.87 µs/итер | 170 357,751 опер/сек |
| deep(Array).map | 12.68 µs/итер | 78 864,353 опер/сек |
| Object.values + map (нативный) | 1.18 µs/итер | 847 457,627 опер/сек |
| deep(Object).map | 5.87 µs/итер | 170 357,751 опер/сек |
| String.split + map + join (нативный) | 7.69 µs/итер | 130 039,012 опер/сек |
| deep(String).map | 8.42 µs/итер | 118 764,846 опер/сек |
| Array.filter (нативный) | 5.63 µs/итер | 177 619,893 опер/сек |
| deep(Array).filter | 4.65 µs/итер | 215 053,763 опер/сек |
| Object.values + filter (нативный) | 1.27 µs/итер | 787 401,575 опер/сек |
| deep(Object).filter | 7.34 µs/итер | 136 239,782 опер/сек |
| Array.reduce (нативный) | 2.68 µs/итер | 373 134,328 опер/сек |
| deep(Array).reduce | 8.80 µs/итер | 113 636,364 опер/сек |
| Object.values + reduce (нативный) | 3.17 µs/итер | 315 457,413 опер/сек |
| deep(Object).reduce | 34.25 µs/итер | 29 197,08 опер/сек |
| Array.find (нативный) | 2.24 µs/итер | 446 428,571 опер/сек |
| deep(Array).find | 2.41 µs/итер | 414 937,759 опер/сек |
| Object.values + find (нативный) | 2.05 µs/итер | 487 804,878 опер/сек |
| deep(Object).find | 5.60 µs/итер | 178 571,429 опер/сек |
| Array.every (нативный) | 3.82 µs/итер | 261 780,105 опер/сек |
| deep(Array).every | 3.26 µs/итер | 306 748,466 опер/сек |
| Array.some (нативный) | 5.37 µs/итер | 186 219,739 опер/сек |
| deep(Array).some | 2.77 µs/итер | 361 010,83 опер/сек |
| Object.keys (нативный) | 560.23 ns/итер | 1 784 981,168 опер/сек |
| deep(Object).keys | 615.87 ns/итер | 1 623 719,291 опер/сек |
| Object.values (нативный) | 707.77 ns/итер | 1 412 888,368 опер/сек |
| deep(Object).values | 988.15 ns/итер | 1 011 992,106 опер/сек |
| Object.entries (нативный) | 1.36 µs/итер | 735 294,118 опер/сек |
| deep(Object).entries | 1.86 µs/итер | 537 634,409 опер/сек |
| Array.join (нативный) | 62.64 µs/итер | 15 964,24 опер/сек |
| deep(Array).join | 226.54 µs/итер | 4 414,231 опер/сек |
| Object.values + join (нативный) | 12.97 µs/итер | 77 101,002 опер/сек |
| deep(Object).join | 5.45 µs/итер | 183 486,239 опер/сек |
