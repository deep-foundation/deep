# Методы доступа к данным

В данном документе описывается функциональность модуля `gets.js`, который предоставляет универсальные методы доступа к данным различных типов.

## Производительность

**Информация о системе:**

- clk: ~1.65 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Array.forEach (нативный) | 3.60 µs/итер | 277 777,778 опер/сек |
| deep(Array).forEach | 5.49 µs/итер | 182 149,362 опер/сек |
| Object.values + forEach (нативный) | 2.34 µs/итер | 427 350,427 опер/сек |
| deep(Object).forEach | 5.00 µs/итер | 200 000 опер/сек |
| String[Symbol.iterator] (нативный) | 1.80 µs/итер | 555 555,556 опер/сек |
| deep(String).forEach | 2.04 µs/итер | 490 196,078 опер/сек |
| Map.forEach (нативный) | 1.27 µs/итер | 787 401,575 опер/сек |
| deep(Map).forEach | 1.66 µs/итер | 602 409,639 опер/сек |
| Set.forEach (нативный) | 1.13 µs/итер | 884 955,752 опер/сек |
| deep(Set).forEach | 1.89 µs/итер | 529 100,529 опер/сек |
| Array.map (нативный) | 6.02 µs/итер | 166 112,957 опер/сек |
| deep(Array).map | 129.65 µs/итер | 7 713,074 опер/сек |
| Object.values + map (нативный) | 1.24 µs/итер | 806 451,613 опер/сек |
| deep(Object).map | 129.02 µs/итер | 7 750,736 опер/сек |
| String.split + map + join (нативный) | 9.05 µs/итер | 110 497,238 опер/сек |
| deep(String).map | 142.65 µs/итер | 7 010,165 опер/сек |
| Array.filter (нативный) | 5.53 µs/итер | 180 831,826 опер/сек |
| deep(Array).filter | 69.44 µs/итер | 14 400,922 опер/сек |
| Object.values + filter (нативный) | 1.44 µs/итер | 694 444,444 опер/сек |
| deep(Object).filter | 86.41 µs/итер | 11 572,735 опер/сек |
| Array.reduce (нативный) | 2.10 µs/итер | 476 190,476 опер/сек |
| deep(Array).reduce | 99.62 µs/итер | 10 038,145 опер/сек |
| Object.values + reduce (нативный) | 922.17 ns/итер | 1 084 398,755 опер/сек |
| deep(Object).reduce | 79.10 µs/итер | 12 642,225 опер/сек |
| Array.find (нативный) | 501.09 ns/итер | 1 995 649,484 опер/сек |
| deep(Array).find | 740.27 ns/итер | 1 350 858,471 опер/сек |
| Object.values + find (нативный) | 760.07 ns/итер | 1 315 668,294 опер/сек |
| deep(Object).find | 2.37 µs/итер | 421 940,928 опер/сек |
| Array.every (нативный) | 1.08 µs/итер | 925 925,926 опер/сек |
| deep(Array).every | 83.31 µs/итер | 12 003,361 опер/сек |
| Array.some (нативный) | 531.23 ns/итер | 1 882 423,809 опер/сек |
| deep(Array).some | 1.37 µs/итер | 729 927,007 опер/сек |
| Object.keys (нативный) | 114.55 ns/итер | 8 729 812,309 опер/сек |
| deep(Object).keys | 293.39 ns/итер | 3 408 432,462 опер/сек |
| Object.values (нативный) | 679.17 ns/итер | 1 472 385,412 опер/сек |
| deep(Object).values | 891.22 ns/итер | 1 122 057,404 опер/сек |
| Object.entries (нативный) | 1.65 µs/итер | 606 060,606 опер/сек |
| deep(Object).entries | 1.54 µs/итер | 649 350,649 опер/сек |
| Array.join (нативный) | 47.67 µs/итер | 20 977,554 опер/сек |
| deep(Array).join | 129.27 µs/итер | 7 735,747 опер/сек |
| Object.values + join (нативный) | 6.10 µs/итер | 163 934,426 опер/сек |
| deep(Object).join | 61.14 µs/итер | 16 355,904 опер/сек |

## Основные особенности

1. Все методы доступа **возвращают ассоциации** (объекты Association), а не примитивные значения
2. Созданные ассоциации интегрированы с системой отслеживания изменений
3. При изменении исходных данных, производные ассоциации автоматически обновляются
4. Поддержка цепочек вызовов методов
5. Универсальный доступ к различным типам данных

## Совместимость методов с типами данных

| Метод | undefined | null | array | set | map | weakmap | weakset | date | object | string | number | boolean | symbol | bigint | function |
|-------|-----------|------|-------|-----|-----|---------|---------|------|---------|---------|---------|----------|---------|---------|-----------|
| forEach | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| map | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| filter | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| reduce | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| every | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| some | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| find | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| findKey | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| keys | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| values | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| entries | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| join | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Поддерживаемые типы данных

Методы доступа работают со следующими типами данных:
- Массивы (`Array`)
- Объекты (`Object`)
- Строки (`String`)
- Map
- Set
- WeakMap
- WeakSet
- Числа (ограниченно)

## Базовые методы доступа

### get(key)

Получает значение по ключу. Универсальный метод, работающий с разными типами данных.

```js
// Массивы
const array = deep([1, 2, 3]);
const secondItem = array.get(1); // Возвращает ассоциацию, содержащую 2
console.log(secondItem.this); // 2

// Объекты
const obj = deep({ a: 1, b: 2 });
const valueB = obj.get('b'); // Возвращает ассоциацию, содержащую 2
console.log(valueB.this); // 2

// Map
const map = deep(new Map([['a', 1], ['b', 2]]));
const valueFromMap = map.get('b'); // Возвращает ассоциацию, содержащую 2
console.log(valueFromMap.this); // 2

// Set (получает элемент по индексу итерации)
const set = deep(new Set([1, 2, 3]));
const itemFromSet = set.get(1); // Возвращает ассоциацию, содержащую 2
console.log(itemFromSet.this); // 2

// Строки
const str = deep('hello');
const char = str.get(1); // Возвращает ассоциацию, содержащую 'e'
console.log(char.this); // 'e'
```

### has(key)

Проверяет наличие ключа или значения.

```js
// Массивы (проверяет, есть ли элемент с таким индексом)
const array = deep([1, 2, 3]);
console.log(array.has(1)); // true
console.log(array.has(5)); // false

// Объекты (проверяет, есть ли свойство)
const obj = deep({ a: 1, b: 2 });
console.log(obj.has('b')); // true
console.log(obj.has('c')); // false

// Map (проверяет, есть ли ключ)
const map = deep(new Map([['a', 1], ['b', 2]]));
console.log(map.has('b')); // true
console.log(map.has('c')); // false

// Set (проверяет, есть ли значение)
const set = deep(new Set([1, 2, 3]));
console.log(set.has(2)); // true
console.log(set.has(4)); // false
```

## Методы преобразования

### map(callback)

Создает новую ассоциацию, в которой каждый элемент является результатом вызова функции обратного вызова для соответствующего элемента исходной ассоциации.

```js
// Массивы
const array = deep([1, 2, 3]);
const doubled = array.map(x => x * 2);
console.log(doubled.this); // [2, 4, 6]

// Объекты
const obj = deep({ a: 1, b: 2, c: 3 });
const objValues = obj.map((value, key) => `${key}:${value}`);
console.log(objValues.this); // ['a:1', 'b:2', 'c:3']

// Map
const map = deep(new Map([['a', 1], ['b', 2]]));
const mapValues = map.map((value, key) => value * 2);
console.log(mapValues.this); // [2, 4]
```

**Важно**: Все ассоциации, созданные методом `map`, связаны с исходной ассоциацией. При изменении исходной ассоциации, результат `map` автоматически обновляется.

```js
const array = deep([1, 2, 3]);
const doubled = array.map(x => x * 2);
console.log(doubled.this); // [2, 4, 6]

// Изменяем исходный массив
array.push(4);

// Производная ассоциация автоматически обновляется
console.log(doubled.this); // [2, 4, 6, 8]
```

### filter(callback)

Создает новую ассоциацию, содержащую только те элементы исходной ассоциации, для которых функция обратного вызова возвращает `true`.

```js
// Массивы
const array = deep([1, 2, 3, 4, 5]);
const evens = array.filter(x => x % 2 === 0);
console.log(evens.this); // [2, 4]

// Объекты
const obj = deep({ a: 1, b: 2, c: 3, d: 4 });
const evensObj = obj.filter(value => value % 2 === 0);
console.log(evensObj.this); // { b: 2, d: 4 }

// Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4]]));
const evensMap = map.filter((value, key) => value % 2 === 0);
console.log([...evensMap.this.entries()]); // [['b', 2], ['d', 4]]
```

Как и в случае с `map`, ассоциация, созданная методом `filter`, автоматически обновляется при изменении исходной ассоциации.

```js
const array = deep([1, 2, 3, 4, 5]);
const evens = array.filter(x => x % 2 === 0);
console.log(evens.this); // [2, 4]

// Изменяем исходный массив
array.push(6);

// Производная ассоциация автоматически обновляется
console.log(evens.this); // [2, 4, 6]
```

### keys()

Возвращает новую ассоциацию, содержащую все ключи исходной ассоциации.

```js
// Массивы (возвращает индексы)
const array = deep([10, 20, 30]);
const arrayKeys = array.keys();
console.log(arrayKeys.this); // [0, 1, 2]

// Объекты (возвращает имена свойств)
const obj = deep({ a: 1, b: 2, c: 3 });
const objKeys = obj.keys();
console.log(objKeys.this); // ['a', 'b', 'c']

// Map (возвращает ключи)
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
const mapKeys = map.keys();
console.log(mapKeys.this); // ['a', 'b', 'c']
```

### values()

Возвращает новую ассоциацию, содержащую все значения исходной ассоциации.

```js
// Массивы (то же самое, что и сам массив)
const array = deep([10, 20, 30]);
const arrayValues = array.values();
console.log(arrayValues.this); // [10, 20, 30]

// Объекты (возвращает значения свойств)
const obj = deep({ a: 1, b: 2, c: 3 });
const objValues = obj.values();
console.log(objValues.this); // [1, 2, 3]

// Map (возвращает значения)
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
const mapValues = map.values();
console.log(mapValues.this); // [1, 2, 3]
```

### entries()

Возвращает новую ассоциацию, содержащую все пары [ключ, значение] исходной ассоциации.

```js
// Массивы
const array = deep([10, 20, 30]);
const arrayEntries = array.entries();
console.log(arrayEntries.this); // [[0, 10], [1, 20], [2, 30]]

// Объекты
const obj = deep({ a: 1, b: 2, c: 3 });
const objEntries = obj.entries();
console.log(objEntries.this); // [['a', 1], ['b', 2], ['c', 3]]

// Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
const mapEntries = map.entries();
console.log(mapEntries.this); // [['a', 1], ['b', 2], ['c', 3]]
```

## Подключение системы отслеживания изменений

Все методы доступа (map, filter, keys, values, entries) создают ассоциации, которые автоматически отслеживают изменения в исходных данных. Это позволяет создавать сложные цепочки преобразований данных, которые автоматически обновляются при изменении исходных данных.

### Цепочки преобразований

```js
import deep from 'deep7';

// Создаем исходную ассоциацию
const numbers = deep([1, 2, 3, 4, 5]);

// Создаем цепочку преобразований
const doubled = numbers.map(x => x * 2);
const evenDoubled = doubled.filter(x => x % 2 === 0);
const squaredEvenDoubled = evenDoubled.map(x => x * x);

console.log(doubled.this);             // [2, 4, 6, 8, 10]
console.log(evenDoubled.this);         // [2, 4, 6, 8, 10]
console.log(squaredEvenDoubled.this);  // [4, 16, 36, 64, 100]

// Изменяем исходный массив
numbers.push(6);

// Все цепочка автоматически обновляется
console.log(doubled.this);             // [2, 4, 6, 8, 10, 12]
console.log(evenDoubled.this);         // [2, 4, 6, 8, 10, 12]
console.log(squaredEvenDoubled.this);  // [4, 16, 36, 64, 100, 144]
```

### Отслеживание изменений в объектах

```js
import deep from 'deep7';

// Создаем исходный объект
const user = deep({
  name: 'John',
  age: 30,
  address: {
    city: 'New York',
    zip: 10001
  }
});

// Создаем производные ассоциации
const userInfo = user.map((value, key) => {
  if (key === 'address') return `${value.city}, ${value.zip}`;
  return value;
});

console.log(userInfo.this); // ['John', 30, 'New York, 10001']

// Изменяем исходный объект
user.set('address', { city: 'Boston', zip: 20001 });

// Производная ассоциация автоматически обновляется
console.log(userInfo.this); // ['John', 30, 'Boston, 20001']
```

### Отслеживание сложных структур данных

```js
import deep from 'deep7';

// Создаем структуру данных с пользователями и их задачами
const data = deep({
  users: [
    { id: 1, name: 'Alice', tasks: [1, 3] },
    { id: 2, name: 'Bob', tasks: [2] },
    { id: 3, name: 'Charlie', tasks: [] }
  ],
  tasks: [
    { id: 1, title: 'Задача 1', completed: false },
    { id: 2, title: 'Задача 2', completed: true },
    { id: 3, title: 'Задача 3', completed: false }
  ]
});

// Получаем список пользователей
const users = data.get('users');

// Получаем список задач
const tasks = data.get('tasks');

// Создаем список активных задач
const activeTasks = tasks.filter(task => !task.completed);
console.log(activeTasks.this); // [{ id: 1, title: 'Задача 1', completed: false }, { id: 3, title: 'Задача 3', completed: false }]

// Изменяем статус задачи
const taskIndex = tasks.findKey(task => task.id === 1);
if (taskIndex !== undefined) {
  const task = tasks.get(taskIndex);
  task.set('completed', true);
}

// Список активных задач автоматически обновляется
console.log(activeTasks.this); // [{ id: 3, title: 'Задача 3', completed: false }]
```

## Реактивные обновления

Преимущество возвращения ассоциаций вместо простых значений заключается в том, что все изменения в исходных данных автоматически отражаются на производных данных. Это позволяет создавать реактивные пользовательские интерфейсы и сложные системы обработки данных без необходимости ручного обновления.

При изменении исходных данных происходит следующее:
1. Исходная ассоциация генерирует событие `change`
2. Все производные ассоциации, созданные методами `map`, `filter`, `keys`, `values`, `entries`, получают это событие
3. Производные ассоциации обновляют свои данные и генерируют собственные события `change`
4. Изменения распространяются по всей цепочке связанных ассоциаций

Это позволяет значительно упростить код и избежать проблем с синхронизацией данных.

**Информация о системе:**
Данные бенчмарков будут добавлены после проведения тестов.
