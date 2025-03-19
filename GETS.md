# Методы доступа к данным

В данном документе описывается функциональность модуля `gets.js`, который предоставляет универсальные методы для работы с различными типами данных в библиотеке deep.

Методы доступа позволяют работать с различными типами данных (массивы, объекты, строки, Map, Set) единообразным способом, не изменяя исходные данные.

## Производительность

**Информация о системе:**

- clk: ~1.46 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Array.forEach (нативный) | 4.11 µs/итер | 243 309,002 опер/сек |
| deep(Array).forEach | 5.28 µs/итер | 189 393,939 опер/сек |
| Object.values + forEach (нативный) | 2.68 µs/итер | 373 134,328 опер/сек |
| deep(Object).forEach | 6.65 µs/итер | 150 375,94 опер/сек |
| String[Symbol.iterator] (нативный) | 3.31 µs/итер | 302 114,804 опер/сек |
| deep(String).forEach | 3.38 µs/итер | 295 857,988 опер/сек |
| Map.forEach (нативный) | 2.12 µs/итер | 471 698,113 опер/сек |
| deep(Map).forEach | 2.67 µs/итер | 374 531,835 опер/сек |
| Set.forEach (нативный) | 1.98 µs/итер | 505 050,505 опер/сек |
| deep(Set).forEach | 2.89 µs/итер | 346 020,761 опер/сек |
| Array.map (нативный) | 9.16 µs/итер | 109 170,306 опер/сек |
| deep(Array).map | 12.23 µs/итер | 81 766,149 опер/сек |
| Object.values + map (нативный) | 1.96 µs/итер | 510 204,082 опер/сек |
| deep(Object).map | 11.96 µs/итер | 83 612,04 опер/сек |
| String.split + map + join (нативный) | 15.07 µs/итер | 66 357,001 опер/сек |
| deep(String).map | 13.40 µs/итер | 74 626,866 опер/сек |
| Array.filter (нативный) | 4.36 µs/итер | 229 357,798 опер/сек |
| deep(Array).filter | 7.06 µs/итер | 141 643,059 опер/сек |
| Object.values + filter (нативный) | 2.00 µs/итер | 500 000 опер/сек |
| deep(Object).filter | 9.52 µs/итер | 105 042,017 опер/сек |
| Array.reduce (нативный) | 2.26 µs/итер | 442 477,876 опер/сек |
| deep(Array).reduce | 4.53 µs/итер | 220 750,552 опер/сек |
| Object.values + reduce (нативный) | 953.75 ns/итер | 1 048 492,792 опер/сек |
| deep(Object).reduce | 5.33 µs/итер | 187 617,261 опер/сек |
| Array.find (нативный) | 738.59 ns/итер | 1 353 931,139 опер/сек |
| deep(Array).find | 1.60 µs/итер | 625 000 опер/сек |
| Object.values + find (нативный) | 863.40 ns/итер | 1 158 211,721 опер/сек |
| deep(Object).find | 2.83 µs/итер | 353 356,89 опер/сек |
| Array.every (нативный) | 1.18 µs/итер | 847 457,627 опер/сек |
| deep(Array).every | 1.76 µs/итер | 568 181,818 опер/сек |
| Array.some (нативный) | 613.73 ns/итер | 1 629 380,998 опер/сек |
| deep(Array).some | 1.30 µs/итер | 769 230,769 опер/сек |
| Object.keys (нативный) | 116.46 ns/итер | 8 586 639,189 опер/сек |
| deep(Object).keys | 450.64 ns/итер | 2 219 066,217 опер/сек |
| Object.values (нативный) | 728.22 ns/итер | 1 373 211,392 опер/сек |
| deep(Object).values | 1.10 µs/итер | 909 090,909 опер/сек |
| Object.entries (нативный) | 1.65 µs/итер | 606 060,606 опер/сек |
| deep(Object).entries | 2.31 µs/итер | 432 900,433 опер/сек |
| Array.join (нативный) | 55.57 µs/итер | 17 995,321 опер/сек |
| deep(Array).join | 62.39 µs/итер | 16 028,21 опер/сек |
| Object.values + join (нативный) | 6.88 µs/итер | 145 348,837 опер/сек |
| deep(Object).join | 6.53 µs/итер | 153 139,357 опер/сек |

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
import deep from 'deep7';

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
