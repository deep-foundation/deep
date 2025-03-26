# Методы доступа к данным

В данном документе описывается функциональность модуля `gets.js`, который предоставляет универсальные методы для работы с различными типами данных в библиотеке deep.

Методы доступа позволяют работать с различными типами данных (массивы, объекты, строки, Map, Set) единообразным способом, не изменяя исходные данные.

## Производительность

**Информация о системе:**

- clk: ~0.46 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Array.forEach (нативный) | 9.85 µs/итер | 101 522,843 опер/сек |
| deep(Array).forEach | 14.77 µs/итер | 67 704,807 опер/сек |
| Object.values + forEach (нативный) | 5.48 µs/итер | 182 481,752 опер/сек |
| deep(Object).forEach | 12.35 µs/итер | 80 971,66 опер/сек |
| String[Symbol.iterator] (нативный) | 5.76 µs/итер | 173 611,111 опер/сек |
| deep(String).forEach | 5.09 µs/итер | 196 463,654 опер/сек |
| Map.forEach (нативный) | 7.48 µs/итер | 133 689,84 опер/сек |
| deep(Map).forEach | 5.03 µs/итер | 198 807,157 опер/сек |
| Set.forEach (нативный) | 2.04 µs/итер | 490 196,078 опер/сек |
| deep(Set).forEach | 4.70 µs/итер | 212 765,957 опер/сек |
| Array.map (нативный) | 13.40 µs/итер | 74 626,866 опер/сек |
| deep(Array).map | 7.71 µs/итер | 129 701,686 опер/сек |
| Object.values + map (нативный) | 1.29 µs/итер | 775 193,798 опер/сек |
| deep(Object).map | 5.49 µs/итер | 182 149,362 опер/сек |
| String.split + map + join (нативный) | 9.28 µs/итер | 107 758,621 опер/сек |
| deep(String).map | 6.55 µs/итер | 152 671,756 опер/сек |
| Array.filter (нативный) | 6.99 µs/итер | 143 061,516 опер/сек |
| deep(Array).filter | 7.39 µs/итер | 135 317,997 опер/сек |
| Object.values + filter (нативный) | 1.48 µs/итер | 675 675,676 опер/сек |
| deep(Object).filter | 9.16 µs/итер | 109 170,306 опер/сек |
| Array.reduce (нативный) | 3.86 µs/итер | 259 067,358 опер/сек |
| deep(Array).reduce | 5.42 µs/итер | 184 501,845 опер/сек |
| Object.values + reduce (нативный) | 944.92 ns/итер | 1 058 290,649 опер/сек |
| deep(Object).reduce | 4.74 µs/итер | 210 970,464 опер/сек |
| Array.find (нативный) | 491.01 ns/итер | 2 036 618,399 опер/сек |
| deep(Array).find | 1.19 µs/итер | 840 336,134 опер/сек |
| Object.values + find (нативный) | 757.96 ns/итер | 1 319 330,835 опер/сек |
| deep(Object).find | 2.56 µs/итер | 390 625 опер/сек |
| Array.every (нативный) | 1.56 µs/итер | 641 025,641 опер/сек |
| deep(Array).every | 2.09 µs/итер | 478 468,9 опер/сек |
| Array.some (нативный) | 570.81 ns/итер | 1 751 896,428 опер/сек |
| deep(Array).some | 1.11 µs/итер | 900 900,901 опер/сек |
| Object.keys (нативный) | 121.83 ns/итер | 8 208 158,91 опер/сек |
| deep(Object).keys | 1.12 µs/итер | 892 857,143 опер/сек |
| Object.values (нативный) | 711.30 ns/итер | 1 405 876,564 опер/сек |
| deep(Object).values | 1.36 µs/итер | 735 294,118 опер/сек |
| Object.entries (нативный) | 2.11 µs/итер | 473 933,649 опер/сек |
| deep(Object).entries | 1.91 µs/итер | 523 560,209 опер/сек |
| Array.join (нативный) | 55.21 µs/итер | 18 112,661 опер/сек |
| deep(Array).join | 59.34 µs/итер | 16 852,039 опер/сек |
| Object.values + join (нативный) | 5.39 µs/итер | 185 528,757 опер/сек |
| deep(Object).join | 6.10 µs/итер | 163 934,426 опер/сек |

## Основные особенности

1. Все методы доступа работают с `this.this` внутри Association
2. Методы не изменяют исходные данные (неизменяемые операции)
3. Методы преобразования (map, filter) возвращают новые ассоциации (не примитивы)
4. Методы анализа (every, some, find) возвращают примитивные значения
5. Поддерживаются все основные типы коллекций
6. Интеграция с системой отслеживания изменений (track)

## Поддерживаемые типы данных

Методы доступа работают со следующими типами данных:
- Массивы (`Array`)
- Объекты (`Object`)
- Строки (`String`)
- Map
- Set
- Примитивы (с соответствующими преобразованиями)

## Система отслеживания изменений (Track)

Методы, создающие новые коллекции (map, filter), возвращают ассоциации, которые автоматически отслеживают изменения в исходных данных. Связь между исходной и производной ассоциацией поддерживается с помощью механизма отслеживания:

1. Производная ассоциация хранит ссылку на исходную в своем объекте `temp.origin`
2. Производная ассоциация подписывается на события `change` исходной
3. При изменении исходной ассоциации, производная автоматически обновляет свои данные

```js
// Создаем исходную ассоциацию
const source = deep([1, 2, 3, 4]);

// Создаем производную ассоциацию с помощью map
const doubled = source.map(x => x * 2);
console.log(doubled.this); // [2, 4, 6, 8]

// Проверяем связь
console.log(doubled.origin === source); // true

// При изменении исходной ассоциации, производная автоматически обновляется
source.push(5);
console.log(doubled.this); // [2, 4, 6, 8, 10]
```

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

Преобразует элементы коллекции с помощью callback-функции и возвращает новую ассоциацию.

```js
const doubled = deep([1, 2, 3]).map(x => x * 2);
console.log(doubled.this); // [2, 4, 6]

const upperKeys = deep({ a: 1, b: 2 }).map((value, key) => key.toUpperCase());
console.log(upperKeys.this); // ['A', 'B']
```

### filter(callback)

Фильтрует элементы коллекции с помощью callback-функции и возвращает новую ассоциацию.

```js
const even = deep([1, 2, 3, 4]).filter(x => x % 2 === 0);
console.log(even.this); // [2, 4]

const bigValues = deep({ a: 1, b: 10 }).filter(value => value > 5);
console.log(bigValues.this); // [10]
```

### reduce(callback, initialValue)

Сворачивает коллекцию в одно значение с помощью callback-функции.

```js
const sum = deep([1, 2, 3, 4]).reduce((acc, x) => acc + x, 0);
console.log(sum); // 10

const concat = deep(['a', 'b', 'c']).reduce((acc, x) => acc + x, '');
console.log(concat); // 'abc'
```

### every(callback)

Проверяет, удовлетворяют ли все элементы условию.

```js
const allPositive = deep([1, 2, 3]).every(x => x > 0);
console.log(allPositive); // true

const allEven = deep([2, 4, 5]).every(x => x % 2 === 0);
console.log(allEven); // false
```

### some(callback)

Проверяет, удовлетворяет ли хотя бы один элемент условию.

```js
const hasEven = deep([1, 2, 3]).some(x => x % 2 === 0);
console.log(hasEven); // true

const hasNegative = deep([1, 2, 3]).some(x => x < 0);
console.log(hasNegative); // false
```

### find(callback)

Находит первый элемент, удовлетворяющий условию.

```js
const found = deep([1, 2, 3, 4]).find(x => x > 2);
console.log(found); // 3

const notFound = deep([1, 2, 3]).find(x => x > 5);
console.log(notFound); // undefined
```

### findKey(callback)

Находит ключ первого элемента, удовлетворяющего условию.

```js
const key = deep({ a: 1, b: 2, c: 3 }).findKey(x => x > 2);
console.log(key); // 'c'

const arrayIndex = deep([10, 20, 30]).findKey(x => x > 15);
console.log(arrayIndex); // 1
```

### keys()

Возвращает ассоциацию с массивом ключей коллекции.

```js
const objKeys = deep({ a: 1, b: 2 }).keys();
console.log(objKeys.this); // ['a', 'b']

const arrKeys = deep([10, 20, 30]).keys();
console.log(arrKeys.this); // [0, 1, 2]
```

### values()

Возвращает ассоциацию с массивом значений коллекции.

```js
const objValues = deep({ a: 1, b: 2 }).values();
console.log(objValues.this); // [1, 2]

const arrValues = deep([10, 20, 30]).values();
console.log(arrValues.this); // [10, 20, 30]
```

### entries()

Возвращает ассоциацию с массивом пар [ключ, значение] коллекции.

```js
const objEntries = deep({ a: 1, b: 2 }).entries();
console.log(objEntries.this); // [['a', 1], ['b', 2]]

const arrEntries = deep([10, 20]).entries();
console.log(arrEntries.this); // [[0, 10], [1, 20]]
```

### join(separator)

Объединяет элементы коллекции в строку с указанным разделителем.

```js
const joined = deep([1, 2, 3]).join('-');
console.log(joined); // '1-2-3'

const objJoined = deep({ a: 1, b: 2 }).join(',');
console.log(objJoined); // '1,2'
```

## Пример использования с отслеживанием изменений

```js
import deep from 'deep7';

// Создаем исходный массив и его модификации
const source = deep([1, 2, 3, 4, 5]);

// Цепочка трансформаций
const doubled = source.map(x => x * 2);
const filtered = doubled.filter(x => x > 5);

// Проверяем начальные значения
console.log(source.this);   // [1, 2, 3, 4, 5]
console.log(doubled.this);  // [2, 4, 6, 8, 10]
console.log(filtered.this); // [6, 8, 10]

// Изменяем исходный массив
source.push(6);

// Проверяем, как изменения распространились по цепочке
console.log(source.this);   // [1, 2, 3, 4, 5, 6]
console.log(doubled.this);  // [2, 4, 6, 8, 10, 12]
console.log(filtered.this); // [6, 8, 10, 12]

// Удаляем элемент из исходного массива
source.delete(2); // Удаляем элемент с индексом 2 (значение 3)

// Проверяем, как изменения распространились
console.log(source.this);   // [1, 2, 4, 5, 6]
console.log(doubled.this);  // [2, 4, 8, 10, 12]
console.log(filtered.this); // [8, 10, 12]

// Можно также подписаться на события изменения
filtered.on('change', (event, data) => {
  console.log('Отфильтрованный массив изменился:', filtered.this);
  console.log('Причина:', data.detail?.operation);
});

// Теперь при изменении исходного массива будет выводиться сообщение
source.set(0, 10);
// Выведет: "Отфильтрованный массив изменился: [8, 10, 12, 20]"
// "Причина: set"
```

## Сложные цепочки трансформаций

Методы доступа поддерживают создание сложных цепочек трансформаций с автоматическим распространением изменений.

```js
import deep from 'deep7';

// Создаем исходные данные
const users = deep([
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 }
]);

// Создаем цепочку трансформаций
const adults = users.filter(user => user.age >= 30);
const names = adults.map(user => user.name);
const upperNames = names.map(name => name.toUpperCase());

console.log(adults.this);     // [{id: 2, name: 'Bob', age: 30}, {id: 3, name: 'Charlie', age: 35}]
console.log(names.this);      // ['Bob', 'Charlie']
console.log(upperNames.this); // ['BOB', 'CHARLIE']

// Добавляем нового пользователя в исходный массив
users.push({ id: 4, name: 'Dave', age: 40 });

// Все производные массивы обновляются автоматически
console.log(adults.this);     // [{id: 2, name: 'Bob', age: 30}, {id: 3, name: 'Charlie', age: 35}, {id: 4, name: 'Dave', age: 40}]
console.log(names.this);      // ['Bob', 'Charlie', 'Dave']
console.log(upperNames.this); // ['BOB', 'CHARLIE', 'DAVE']
```

## Производительность

**Информация о системе:**

- clk: ~1.31 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Array.forEach (нативный) | 4.63 µs/итер | 215 982,721 опер/сек |
| deep(Array).forEach | 6.42 µs/итер | 155 763,24 опер/сек |
| Object.values + forEach (нативный) | 2.96 µs/итер | 337 837,838 опер/сек |
| deep(Object).forEach | 5.19 µs/итер | 192 678,227 опер/сек |
| String[Symbol.iterator] (нативный) | 2.53 µs/итер | 395 256,917 опер/сек |
| deep(String).forEach | 2.30 µs/итер | 434 782,609 опер/сек |
| Map.forEach (нативный) | 1.54 µs/итер | 649 350,649 опер/сек |
| deep(Map).forEach | 2.39 µs/итер | 418 410,042 опер/сек |
| Set.forEach (нативный) | 1.11 µs/итер | 900 900,901 опер/сек |
| deep(Set).forEach | 1.60 µs/итер | 625 000 опер/сек |
| Array.map (нативный) | 5.87 µs/итер | 170 357,751 опер/сек |
| deep(Array).map | 12.68 µs/итер | 78 864,353 опер/сек |
| Object.values + map (нативный) | 1.18 µs/итер | 847 457,627 опер/сек |
| deep(Object).map | 5.87 µs/итер | 170 357,751 опер/сек |
| String.split + map + join (нативный) | 7.69 µs/итер | 130 039,012 опер/сек |
| deep(String).map | 8.42 µs/итер | 118 764,846 опер/сек |
| Array.filter (нативный) | 5.63 µs/итер | 177 619,893 опер/сек |
| deep(Array).filter | 4.65 µs/итер | 215 053,763 опер/сек |
| Object.values + filter (нативный) | 1.27 µs/итер | 787 401,575 опер/сек |
| deep(Object).filter | 7.34 µs/итер | 136 239,782 опер/сек |
| Array.reduce (нативный) | 2.68 µs/итер | 373 134,328 опер/сек |
| deep(Array).reduce | 8.80 µs/итер | 113 636,364 опер/сек |
| Object.values + reduce (нативный) | 3.17 µs/итер | 315 457,413 опер/сек |
| deep(Object).reduce | 34.25 µs/итер | 29 197,08 опер/сек |
| Array.find (нативный) | 2.24 µs/итер | 446 428,571 опер/сек |
| deep(Array).find | 2.41 µs/итер | 414 937,759 опер/сек |
| Object.values + find (нативный) | 2.05 µs/итер | 487 804,878 опер/сек |
| deep(Object).find | 5.60 µs/итер | 178 571,429 опер/сек |
| Array.every (нативный) | 3.82 µs/итер | 261 780,105 опер/сек |
| deep(Array).every | 3.26 µs/итер | 306 748,466 опер/сек |
| Array.some (нативный) | 5.37 µs/итер | 186 219,739 опер/сек |
| deep(Array).some | 2.77 µs/итер | 361 010,83 опер/сек |
| Object.keys (нативный) | 560.23 ns/итер | 1 784 981,168 опер/сек |
| deep(Object).keys | 615.87 ns/итер | 1 623 719,291 опер/сек |
| Object.values (нативный) | 707.77 ns/итер | 1 412 888,368 опер/сек |
| deep(Object).values | 988.15 ns/итер | 1 011 992,106 опер/сек |
| Object.entries (нативный) | 1.36 µs/итер | 735 294,118 опер/сек |
| deep(Object).entries | 1.86 µs/итер | 537 634,409 опер/сек |
| Array.join (нативный) | 62.64 µs/итер | 15 964,24 опер/сек |
| deep(Array).join | 226.54 µs/итер | 4 414,231 опер/сек |
| Object.values + join (нативный) | 12.97 µs/итер | 77 101,002 опер/сек |
| deep(Object).join | 5.45 µs/итер | 183 486,239 опер/сек |
