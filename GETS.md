# Методы доступа к данным

В данном документе описывается функциональность модуля `gets.js`, который предоставляет универсальные методы доступа к данным различных типов.

## Производительность

**Информация о системе:**

- clk: ~1.45 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Array.forEach (нативный) | 5.87 µs/итер | 170 357,751 опер/сек |
| deep(Array).forEach | 8.29 µs/итер | 120 627,262 опер/сек |
| Object.values + forEach (нативный) | 4.38 µs/итер | 228 310,502 опер/сек |
| deep(Object).forEach | 7.86 µs/итер | 127 226,463 опер/сек |
| String[Symbol.iterator] (нативный) | 3.98 µs/итер | 251 256,281 опер/сек |
| deep(String).forEach | 3.74 µs/итер | 267 379,679 опер/сек |
| Map.forEach (нативный) | 1.71 µs/итер | 584 795,322 опер/сек |
| deep(Map).forEach | 3.06 µs/итер | 326 797,386 опер/сек |
| Set.forEach (нативный) | 1.30 µs/итер | 769 230,769 опер/сек |
| deep(Set).forEach | 1.76 µs/итер | 568 181,818 опер/сек |
| Array.map (нативный) | 6.44 µs/итер | 155 279,503 опер/сек |
| deep(Array).map | 867.44 µs/итер | 1 152,817 опер/сек |
| Object.values + map (нативный) | 1.85 µs/итер | 540 540,541 опер/сек |
| deep(Object).map | 655.25 µs/итер | 1 526,135 опер/сек |
| String.split + map + join (нативный) | 9.38 µs/итер | 106 609,808 опер/сек |
| deep(String).map | 626.85 µs/итер | 1 595,278 опер/сек |
| Array.filter (нативный) | 4.70 µs/итер | 212 765,957 опер/сек |
| deep(Array).filter | 322.77 µs/итер | 3 098,181 опер/сек |
| Object.values + filter (нативный) | 1.38 µs/итер | 724 637,681 опер/сек |
| deep(Object).filter | 270.82 µs/итер | 3 692,489 опер/сек |
| Array.reduce (нативный) | 2.00 µs/итер | 500 000 опер/сек |
| deep(Array).reduce | 250.65 µs/итер | 3 989,627 опер/сек |
| Object.values + reduce (нативный) | 952.81 ns/итер | 1 049 527,188 опер/сек |
| deep(Object).reduce | 265.95 µs/итер | 3 760,105 опер/сек |
| Array.find (нативный) | 515.59 ns/итер | 1 939 525,592 опер/сек |
| deep(Array).find | 824.32 ns/итер | 1 213 121,118 опер/сек |
| Object.values + find (нативный) | 790.04 ns/итер | 1 265 758,696 опер/сек |
| deep(Object).find | 2.48 µs/итер | 403 225,806 опер/сек |
| Array.every (нативный) | 1.09 µs/итер | 917 431,193 опер/сек |
| deep(Array).every | 260.22 µs/итер | 3 842,902 опер/сек |
| Array.some (нативный) | 781.30 ns/итер | 1 279 918,085 опер/сек |
| deep(Array).some | 1.20 µs/итер | 833 333,333 опер/сек |
| Object.keys (нативный) | 126.67 ns/итер | 7 894 529,091 опер/сек |
| deep(Object).keys | 359.92 ns/итер | 2 778 395,199 опер/сек |
| Object.values (нативный) | 977.62 ns/итер | 1 022 892,33 опер/сек |
| deep(Object).values | 937.69 ns/итер | 1 066 450,533 опер/сек |
| Object.entries (нативный) | 1.63 µs/итер | 613 496,933 опер/сек |
| deep(Object).entries | 2.09 µs/итер | 478 468,9 опер/сек |
| Array.join (нативный) | 64.24 µs/итер | 15 566,625 опер/сек |
| deep(Array).join | 417.39 µs/итер | 2 395,841 опер/сек |
| Object.values + join (нативный) | 7.58 µs/итер | 131 926,121 опер/сек |
| deep(Object).join | 346.94 µs/итер | 2 882,343 опер/сек |

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
