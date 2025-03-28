# Sets

Модуль `sets.js` предоставляет универсальные методы для модификации данных, работающие с различными типами в JavaScript. Методы этого модуля позволяют манипулировать коллекциями, объектами и примитивами с единым API и интегрируются с системой отслеживания изменений.

## Производительность

**Информация о системе:**

- Darwin 23.2.0 x64
- Node.JS: 23.4.0
- V8: 12.9.202.28-node.11
- CPU: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz × 6
- Memory: 16 GB

### set (4 elements)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| array.set(index, value) | 373.41 µs/итер | 2 678 опер/сек |
| object.set(key, value) | 404.69 µs/итер | 2 471 опер/сек |
| map.set(key, value) | 366.57 µs/итер | 2 728 опер/сек |

### add (4 elements)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| array.add(value) | 326.48 µs/итер | 3 063 опер/сек |
| object.add(key, value) | 349.65 µs/итер | 2 860 опер/сек |
| map.add(key, value) | 279.72 µs/итер | 3 575 опер/сек |
| set.add(value) | 362.45 µs/итер | 2 759 опер/сек |

### delete (4 elements)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| array.delete(index) | 361.01 µs/итер | 2 770 опер/сек |
| object.delete(key) | 269.47 µs/итер | 3 711 опер/сек |
| map.delete(key) | 227.89 µs/итер | 4 388 опер/сек |
| set.delete(value) | 309.98 µs/итер | 3 226 опер/сек |


## Основные особенности

1. Все методы модификации **возвращают ассоциации** (объекты Association), а не примитивные значения
2. Созданные ассоциации интегрированы с системой отслеживания изменений
3. При изменении исходных данных, производные ассоциации автоматически обновляются
4. Поддержка цепочек вызовов методов
5. Универсальный доступ к различным типам данных

## Совместимость методов с типами данных

| Метод | undefined | null | array | set | map | weakmap | weakset | date | object | string | number | boolean | symbol | bigint | function |
|-------|-----------|------|-------|-----|-----|---------|---------|------|---------|---------|---------|----------|---------|---------|-----------|
| set | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| add | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| delete | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| remove | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| push | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| pop | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| shift | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| unshift | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Поддерживаемые типы данных

## Основные методы

Модуль позволяет выполнять стандартные операции с массивами, объектами и другими коллекциями данных:

### add

Добавляет элемент в коллекцию.

```js
import deep from 'deep7';

// Добавить элемент в массив
const arr = deep([1, 2, 3]);
arr.add(4);
console.log(arr.this); // [1, 2, 3, 4]

// Добавить свойство в объект
const obj = deep({a: 1, b: 2});
obj.add('c', 3);
console.log(obj.this); // {a: 1, b: 2, c: 3}

// Добавить элемент в Set
const set = deep(new Set([1, 2, 3]));
set.add(4);
console.log([...set.this]); // [1, 2, 3, 4]

// Добавить пару в Map
const map = deep(new Map([['a', 1], ['b', 2]]));
map.add('c', 3);
console.log([...map.this.entries()]); // [['a', 1], ['b', 2], ['c', 3]]
```

### remove

Удаляет элемент из коллекции.

```js
import deep from 'deep7';

// Удалить элемент из массива
const arr = deep([1, 2, 3, 4]);
arr.remove(2);
console.log(arr.this); // [1, 3, 4]

// Удалить свойство из объекта
const obj = deep({a: 1, b: 2, c: 3});
obj.remove('b');
console.log(obj.this); // {a: 1, c: 3}

// Удалить элемент из Set
const set = deep(new Set([1, 2, 3, 4]));
set.remove(2);
console.log([...set.this]); // [1, 3, 4]

// Удалить пару из Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
map.remove('b');
console.log([...map.this.entries()]); // [['a', 1], ['c', 3]]
```

### clear

Очищает коллекцию, удаляя все элементы.

```js
import deep from 'deep7';

// Очистить массив
const arr = deep([1, 2, 3, 4]);
arr.clear();
console.log(arr.this); // []

// Очистить объект
const obj = deep({a: 1, b: 2, c: 3});
obj.clear();
console.log(obj.this); // {}

// Очистить Set
const set = deep(new Set([1, 2, 3, 4]));
set.clear();
console.log([...set.this]); // []

// Очистить Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
map.clear();
console.log([...map.this.entries()]); // []
```

### has

Проверяет наличие элемента в коллекции.

```js
import deep from 'deep7';

// Проверить наличие элемента в массиве
const arr = deep([1, 2, 3, 4]);
console.log(arr.has(2)); // true
console.log(arr.has(5)); // false

// Проверить наличие свойства в объекте
const obj = deep({a: 1, b: 2, c: 3});
console.log(obj.has('b')); // true
console.log(obj.has('d')); // false

// Проверить наличие элемента в Set
const set = deep(new Set([1, 2, 3, 4]));
console.log(set.has(2)); // true
console.log(set.has(5)); // false

// Проверить наличие ключа в Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
console.log(map.has('b')); // true
console.log(map.has('d')); // false
```

### get

Получает элемент из коллекции по ключу/индексу.

```js
import deep from 'deep7';

// Получить элемент массива по индексу
const arr = deep([1, 2, 3, 4]);
console.log(arr.get(2)); // 3

// Получить свойство объекта по ключу
const obj = deep({a: 1, b: 2, c: 3});
console.log(obj.get('b')); // 2

// Получить элемент из Map по ключу
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
console.log(map.get('b')); // 2
```

### set

Устанавливает значение элемента по ключу/индексу.

```js
import deep from 'deep7';

// Установить элемент массива по индексу
const arr = deep([1, 2, 3, 4]);
arr.set(2, 30);
console.log(arr.this); // [1, 2, 30, 4]

// Установить свойство объекта по ключу
const obj = deep({a: 1, b: 2, c: 3});
obj.set('b', 20);
console.log(obj.this); // {a: 1, b: 20, c: 3}

// Установить значение в Map по ключу
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
map.set('b', 20);
console.log([...map.this.entries()]); // [['a', 1], ['b', 20], ['c', 3]]
```

### size

Возвращает размер (количество элементов) коллекции.

```js
import deep from 'deep7';

// Размер массива
const arr = deep([1, 2, 3, 4]);
console.log(arr.size()); // 4

// Количество свойств объекта
const obj = deep({a: 1, b: 2, c: 3});
console.log(obj.size()); // 3

// Размер Set
const set = deep(new Set([1, 2, 3, 4]));
console.log(set.size()); // 4

// Размер Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
console.log(map.size()); // 3
```

## Дополнительные методы

### isEmpty

Проверяет, пуста ли коллекция.

```js
import deep from 'deep7';

// Проверка пустоты массива
const arr1 = deep([1, 2, 3]);
const arr2 = deep([]);
console.log(arr1.isEmpty()); // false
console.log(arr2.isEmpty()); // true

// Проверка пустоты объекта
const obj1 = deep({a: 1, b: 2});
const obj2 = deep({});
console.log(obj1.isEmpty()); // false
console.log(obj2.isEmpty()); // true

// Проверка пустоты Set
const set1 = deep(new Set([1, 2, 3]));
const set2 = deep(new Set());
console.log(set1.isEmpty()); // false
console.log(set2.isEmpty()); // true

// Проверка пустоты Map
const map1 = deep(new Map([['a', 1], ['b', 2]]));
const map2 = deep(new Map());
console.log(map1.isEmpty()); // false
console.log(map2.isEmpty()); // true
```

### clone

Создает глубокую копию коллекции.

```js
import deep from 'deep7';

// Клонирование массива
const arr = deep([1, 2, {a: 3}]);
const arrClone = arr.clone();
arrClone.this[2].a = 4;
console.log(arr.this[2].a); // 3 (оригинал не изменился)

// Клонирование объекта
const obj = deep({a: 1, b: {c: 2}});
const objClone = obj.clone();
objClone.this.b.c = 3;
console.log(obj.this.b.c); // 2 (оригинал не изменился)
```

### forEach

Выполняет функцию для каждого элемента коллекции.

```js
import deep from 'deep7';

// forEach для массива
const arr = deep([1, 2, 3]);
arr.forEach((value, index) => {
  console.log(`arr[${index}] = ${value}`);
});
// Выведет:
// arr[0] = 1
// arr[1] = 2
// arr[2] = 3

// forEach для объекта
const obj = deep({a: 1, b: 2, c: 3});
obj.forEach((value, key) => {
  console.log(`obj[${key}] = ${value}`);
});
// Выведет:
// obj[a] = 1
// obj[b] = 2
// obj[c] = 3

// forEach для Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
map.forEach((value, key) => {
  console.log(`map[${key}] = ${value}`);
});
// Выведет:
// map[a] = 1
// map[b] = 2
// map[c] = 3
```

## Интеграция с системой отслеживания

Все методы работы с наборами данных интегрированы с системой отслеживания изменений. При изменении коллекции через методы `add`, `remove`, `set`, `clear` и другие, генерируются соответствующие события `change`, которые позволяют обновлять связанные ассоциации.

```js
import deep from 'deep7';

// Создаем исходную ассоциацию
const numbers = deep([1, 2, 3, 4, 5]);

// Создаем отображение, которое отслеживает изменения
const doubled = numbers.map(x => x * 2);
console.log(doubled.this); // [2, 4, 6, 8, 10]

// Добавляем элемент в исходную коллекцию
numbers.add(6);

// Отображение автоматически обновится
console.log(doubled.this); // [2, 4, 6, 8, 10, 12]

// Удаляем элемент из исходной коллекции
numbers.remove(3);

// Отображение снова обновится
console.log(doubled.this); // [2, 4, 6, 10, 12]
```
