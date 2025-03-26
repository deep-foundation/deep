# Методы модификации данных

В данном документе описывается функциональность модуля `sets.js`, который предоставляет универсальные методы для модификации различных типов данных в библиотеке deep.

Методы модификации позволяют изменять различные типы данных (массивы, объекты, строки, Map, Set, WeakMap, WeakSet) единообразным способом, с генерацией событий и интеграцией с системой отслеживания изменений.

## Производительность

Данные о производительности будут добавлены после проведения бенчмарков.

## Основные особенности

1. Все методы модификации работают в контексте Association
2. Методы генерируют события при изменении данных
3. Методы поддерживают цепочки вызовов
4. Интеграция с системой отслеживания изменений
5. Автоматическая синхронизация связанных ассоциаций

## Поддерживаемые типы данных

Методы модификации работают со следующими типами данных:
- Массивы (`Array`)
- Объекты (`Object`)
- Строки (`String`)
- Map
- Set
- WeakMap
- WeakSet
- Числа (ограниченно)

## Базовые методы модификации

### set(key, value)

Устанавливает значение по ключу. Универсальный метод, работающий с разными типами данных.

```js
// Массивы
const array = deep([1, 2, 3]);
array.set(1, 10); // [1, 10, 3]

// Объекты
const obj = deep({ a: 1, b: 2 });
obj.set('c', 3); // { a: 1, b: 2, c: 3 }

// Map
const map = deep(new Map([['a', 1], ['b', 2]]));
map.set('c', 3); // Map { 'a' => 1, 'b' => 2, 'c' => 3 }

// Set (добавляет элемент в множество)
const set = deep(new Set([1, 2]));
set.set(3); // Set { 1, 2, 3 }

// Строки
const str = deep('hello');
str.set(1, 'a'); // 'hallo'
```

### delete(key)

Удаляет элемент по ключу или индексу.

```js
// Массивы (удаляет элемент по индексу)
const array = deep([1, 2, 3]);
array.delete(1); // [1, 3]

// Объекты (удаляет свойство)
const obj = deep({ a: 1, b: 2, c: 3 });
obj.delete('b'); // { a: 1, c: 3 }

// Map (удаляет элемент по ключу)
const map = deep(new Map([['a', 1], ['b', 2]]));
map.delete('a'); // Map { 'b' => 2 }

// Set (удаляет элемент из множества)
const set = deep(new Set([1, 2, 3]));
set.delete(2); // Set { 1, 3 }

// Строки (удаляет символ по индексу)
const str = deep('hello');
str.delete(1); // 'hllo'
```

### add(value, key)

Добавляет значение. Для индексированных коллекций (массивы, строки) добавляет по индексу, для ключевых (объекты, Map) по ключу, для множеств просто добавляет значение.

```js
// Массивы (добавляет элемент в конец массива)
const array = deep([1, 2]);
array.add(3); // [1, 2, 3]

// Объекты (добавляет свойство)
const obj = deep({ a: 1 });
obj.add(2, 'b'); // { a: 1, b: 2 }

// Map (добавляет элемент)
const map = deep(new Map([['a', 1]]));
map.add(2, 'b'); // Map { 'a' => 1, 'b' => 2 }

// Set (добавляет значение в множество)
const set = deep(new Set([1, 2]));
set.add(3); // Set { 1, 2, 3 }

// Строки (конкатенирует строки)
const str = deep('hello');
str.add(' world'); // 'hello world'
```

### remove(value)

Удаляет элемент по значению (для массивов и множеств).

```js
// Массивы (удаляет первое вхождение значения)
const array = deep([1, 2, 3, 2]);
array.remove(2); // [1, 3, 2]

// Set (удаляет значение из множества)
const set = deep(new Set([1, 2, 3]));
set.remove(2); // Set { 1, 3 }

// Для других типов работает аналогично delete, если возможно найти ключ по значению
```

## Методы для работы с массивами

### push(...items)

Добавляет один или несколько элементов в конец массива и возвращает новую длину массива.

```js
const array = deep([1, 2, 3]);
array.push(4, 5); // [1, 2, 3, 4, 5], возвращает 5 (новая длина)
```

При вызове `push` генерируются следующие события:
- `set` с объектом detail, содержащим индекс и значение для каждого добавляемого элемента
- `push` с объектом detail, содержащим список добавленных элементов
- `length` с объектом detail, содержащим информацию об изменении длины
- `change` с общей информацией о произведенном изменении

### pop()

Удаляет последний элемент из массива и возвращает его.

```js
const array = deep([1, 2, 3]);
const lastElement = array.pop(); // lastElement = 3, array.this = [1, 2]
```

### shift()

Удаляет первый элемент из массива и возвращает его.

```js
const array = deep([1, 2, 3]);
const firstElement = array.shift(); // firstElement = 1, array.this = [2, 3]
```

### unshift(...items)

Добавляет один или несколько элементов в начало массива и возвращает новую длину массива.

```js
const array = deep([3, 4]);
array.unshift(1, 2); // [1, 2, 3, 4], возвращает 4 (новая длина)
```

## Отслеживание изменений и события

Все методы модификации генерируют события, которые позволяют отслеживать изменения в реальном времени. Для подписки на события используется метод `.on()`.

```js
const array = deep([1, 2, 3]);

// Подписываемся на событие изменения
array.on('change', (event, data) => {
  console.log('Массив изменился!');
  console.log('Операция:', data.detail?.operation);
  console.log('Предыдущее состояние:', data.prev?.this);
  console.log('Новое состояние:', data.next?.this);
});

// Добавляем элемент
array.push(4);
// Выведет:
// Массив изменился!
// Операция: push
// Предыдущее состояние: [1, 2, 3]
// Новое состояние: [1, 2, 3, 4]
```

## Интеграция с системой отслеживания

При изменении ассоциации все связанные с ней производные ассоциации (созданные через `map`, `filter`, и т.д.) автоматически обновляются. Это позволяет создавать сложные цепочки обработки данных с автоматической синхронизацией.

```js
import deep from 'deep7';

// Создаем исходный массив
const numbers = deep([1, 2, 3, 4, 5]);

// Создаем производные массивы
const doubled = numbers.map(x => x * 2);
const evenDoubled = doubled.filter(x => x % 2 === 0);

console.log(numbers.this);   // [1, 2, 3, 4, 5]
console.log(doubled.this);   // [2, 4, 6, 8, 10]
console.log(evenDoubled.this); // [2, 4, 6, 8, 10]

// Изменяем исходный массив
numbers.push(6);

// Все связанные массивы автоматически обновляются
console.log(numbers.this);   // [1, 2, 3, 4, 5, 6]
console.log(doubled.this);   // [2, 4, 6, 8, 10, 12]
console.log(evenDoubled.this); // [2, 4, 6, 8, 10, 12]
```

## Примеры использования

### Работа с массивами

```js
import deep from 'deep7';

const tasks = deep([
  { id: 1, title: 'Задача 1', completed: false },
  { id: 2, title: 'Задача 2', completed: true }
]);

// Добавляем новую задачу
tasks.push({ id: 3, title: 'Задача 3', completed: false });

// Обновляем статус задачи
const taskIndex = tasks.findKey(task => task.id === 1);
if (taskIndex !== undefined) {
  tasks.set(taskIndex, { ...tasks.this[taskIndex], completed: true });
}

// Удаляем завершенные задачи
const pendingTasks = tasks.filter(task => !task.completed);
console.log(pendingTasks.this); // [{ id: 3, title: 'Задача 3', completed: false }]

// При изменении статуса задачи в исходном массиве,
// фильтрованный список обновится автоматически
tasks.set(2, { ...tasks.this[2], completed: true });
console.log(pendingTasks.this); // []
```

### Работа с объектами

```js
import deep from 'deep7';

const user = deep({
  name: 'John',
  age: 30,
  address: {
    city: 'New York',
    street: 'Broadway'
  }
});

// Обновляем свойство
user.set('age', 31);

// Добавляем новое свойство
user.set('email', 'john@example.com');

// Удаляем свойство
user.delete('address');

console.log(user.this);
// { name: 'John', age: 31, email: 'john@example.com' }
```

### Работа со строками

```js
import deep from 'deep7';

const text = deep('Hello world');

// Заменяем символ
text.set(0, 'h');

// Добавляем к строке
text.add('!');

console.log(text.this); // 'hello world!'
```

### Работа с Map и Set

```js
import deep from 'deep7';

// Map
const userRoles = deep(new Map());

// Добавляем записи
userRoles.set('user1', 'admin');
userRoles.set('user2', 'editor');

// Удаляем запись
userRoles.delete('user1');

console.log(userRoles.this); // Map { 'user2' => 'editor' }

// Set
const uniqueIds = deep(new Set([1, 2, 3]));

// Добавляем значения
uniqueIds.add(4);
uniqueIds.add(2); // Значение 2 уже существует, поэтому не будет добавлено

console.log(uniqueIds.this); // Set { 1, 2, 3, 4 }
```

## Сложные примеры с отслеживанием

### Связанные списки

```js
import deep from 'deep7';

// Пользователи и их роли
const users = deep([
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'editor' }
]);

// Создаем производные списки по ролям
const admins = users.filter(user => user.role === 'admin');
const editors = users.filter(user => user.role === 'editor');
const allNames = users.map(user => user.name);

// Подписываемся на изменения списков
admins.on('change', () => {
  console.log('Список администраторов изменился:', admins.this.map(a => a.name));
});

// Добавляем нового пользователя
users.push({ id: 4, name: 'Dave', role: 'admin' });
// Выведет: "Список администраторов изменился: ['Alice', 'Dave']"

// Изменяем роль пользователя
const bobIndex = users.findKey(user => user.id === 2);
if (bobIndex !== undefined) {
  users.set(bobIndex, { ...users.this[bobIndex], role: 'admin' });
}
// Выведет: "Список администраторов изменился: ['Alice', 'Bob', 'Dave']"

// Удаляем пользователя
const charlieIndex = users.findKey(user => user.id === 3);
if (charlieIndex !== undefined) {
  users.delete(charlieIndex);
}

// Проверяем все производные списки
console.log('Все пользователи:', users.this.map(u => u.name)); // ['Alice', 'Bob', 'Dave']
console.log('Администраторы:', admins.this.map(a => a.name)); // ['Alice', 'Bob', 'Dave']
console.log('Редакторы:', editors.this.map(e => e.name)); // []
console.log('Все имена:', allNames.this); // ['Alice', 'Bob', 'Dave']
```
