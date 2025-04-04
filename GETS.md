# Gets

Модуль `gets.js` предоставляет универсальные методы доступа к данным, работающие с различными типами данных в JavaScript. Он дополняет стандартные возможности языка, предоставляя единый интерфейс для работы с коллекциями независимо от их типа.

[Результаты бенчмарков →](./GETS.benchmark.md)

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
| map | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
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
| count/size/length | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Поддерживаемые типы данных

Методы доступа работают со следующими типами данных:
- Массивы (`Array`)
- Объекты (`Object`)
- Строки (`String`)
- Map
- Set
- WeakMap
- WeakSet
- Числа (`Number`) - только для метода map
- Булевы значения (`Boolean`) - только для метода map
- Символы (`Symbol`) - только для метода map
- BigInt - только для метода map
- Функции - только для метода map

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

### count / size / length

Возвращает количество элементов в коллекции. Этот метод имеет три алиаса: `count`, `size` и `length`, которые работают одинаково.

```js
// Массивы
const array = deep([1, 2, 3, 4, 5]);
console.log(array.count.this); // 5
console.log(array.size.this);  // 5
console.log(array.length.this); // 5

// Объекты
const obj = deep({ a: 1, b: 2, c: 3 });
console.log(obj.count.this); // 3

// Строки
const str = deep('hello');
console.log(str.count.this); // 5

// Map
const map = deep(new Map([['a', 1], ['b', 2], ['c', 3]]));
console.log(map.count.this); // 3

// Set
const set = deep(new Set([1, 2, 3, 4]));
console.log(set.count.this); // 4

// Примитивные типы
const num = deep(42);
console.log(num.count.this); // 1 (примитивные типы считаются как один элемент)

const bool = deep(true);
console.log(bool.count.this); // 1

// null и undefined
console.log(deep(null).count.this); // 0
console.log(deep(undefined).count.this); // 0
```

Методы `count`, `size` и `length` также поддерживают отслеживание изменений. При изменении исходной коллекции, значение count автоматически обновляется.

```js
const array = deep([1, 2, 3]);
const count = array.count;
console.log(count.this); // 3

// При добавлении элемента count автоматически обновляется
array.push(4);
console.log(count.this); // 4

// При удалении элемента count также обновляется
array.pop();
console.log(count.this); // 3

// Работает с любыми изменениями коллекции
array.set(0, 10); // Замена элемента не меняет count
console.log(count.this); // 3
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

// Примитивные типы
const num = deep(123);
const doubledNum = num.map(x => x * 2);
console.log(doubledNum.this); // [246]

const bool = deep(true);
const invertedBool = bool.map(b => !b);
console.log(invertedBool.this); // [false]

// С константным возвратом
const constResult = deep(123).map(() => 2);
console.log(constResult.this); // [2]
```

При использовании метода `map` с примитивными типами данных (число, булево значение, символ и т.д.), примитив рассматривается как один элемент, который передается в функцию обратного вызова, а результат помещается в массив. Такой подход обеспечивает единообразие работы метода `map` для всех типов данных.

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
