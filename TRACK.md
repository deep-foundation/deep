# Track

Система отслеживания изменений, которая позволяет автоматически синхронизировать связанные ассоциации и распространять изменения по цепочке преобразований. Отслеживание обеспечивает реактивное поведение для объектов, массивов и других структур данных.

[Результаты бенчмарков →](./TRACK.benchmark.md)

## Основные особенности

1. Автоматическое отслеживание изменений в исходных данных
2. Синхронизация связанных ассоциаций в реальном времени
3. Поддержка многоуровневых цепочек трансформаций
4. Оптимизация обновлений для максимальной производительности
5. Работа с различными методами доступа (map, filter и т.д.)

## Принцип работы

Система отслеживания основана на следующих принципах:

1. Каждая производная ассоциация (созданная через map, filter и т.д.) хранит ссылку на исходную ассоциацию в свойстве `temp.origin`
2. При создании производной ассоциации она подписывается на события `change` исходной ассоциации
3. Когда исходная ассоциация изменяется, она генерирует событие `change` со всей необходимой информацией
4. Все подписанные производные ассоциации получают это событие и обновляют свои данные соответствующим образом
5. После обновления производные ассоциации генерируют собственные события `change`, которые получают другие ассоциации в цепочке

## Поддерживаемые методы отслеживания

Следующие методы доступа поддерживают отслеживание изменений:

- **map(callback)** - отслеживание преобразований данных
- **filter(callback)** - отслеживание фильтрованных данных
- **keys()** - отслеживание списка ключей
- **values()** - отслеживание списка значений
- **entries()** - отслеживание пар [ключ, значение]

### Теоретико-множественные операции

Механизм отслеживания также поддерживает операции над множествами:

- **difference(otherSet)** - отслеживание разности множеств (A - B)
- **intersection(otherSet)** - отслеживание пересечения множеств (A ∩ B)
- **symmetricDifference(otherSet)** - отслеживание симметрической разности множеств (A △ B)
- **union(otherSet)** - отслеживание объединения множеств (A ∪ B)

Для этих операций отслеживание особенно важно, так как результат зависит от изменений в обоих исходных множествах. Механизм track обеспечивает:

1. Обновление результата при изменении любого из исходных множеств
2. Сохранение связей между исходными и результирующими ассоциациями
3. Передачу событий изменения по цепочке зависимостей

## Примеры использования

### Простая цепочка отслеживания

```js
import deep from 'deep7';

// Создаем исходную ассоциацию
const source = deep([1, 2, 3, 4, 5]);

// Создаем производную ассоциацию
const doubled = source.map(x => x * 2);
console.log(doubled.this); // [2, 4, 6, 8, 10]

// Модифицируем исходную ассоциацию
source.push(6);

// Производная ассоциация автоматически обновляется
console.log(doubled.this); // [2, 4, 6, 8, 10, 12]
```

### Многоуровневая цепочка отслеживания

```js
import deep from 'deep7';

// Создаем исходную ассоциацию
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

// Добавляем нового пользователя
users.push({ id: 4, name: 'Dave', age: 40 });

// Все ассоциации в цепочке автоматически обновляются
console.log(adults.this);     // [{id: 2, name: 'Bob', age: 30}, {id: 3, name: 'Charlie', age: 35}, {id: 4, name: 'Dave', age: 40}]
console.log(names.this);      // ['Bob', 'Charlie', 'Dave']
console.log(upperNames.this); // ['BOB', 'CHARLIE', 'DAVE']
```

### Отслеживание с объектами

```js
import deep from 'deep7';

// Создаем объект
const user = deep({
  name: 'John',
  contacts: {
    email: 'john@example.com',
    phone: '123-456-7890'
  },
  roles: ['user', 'editor']
});

// Создаем производные ассоциации
const roles = user.map((value, key) => key === 'roles' ? value : null).filter(Boolean)[0];
const adminRoles = roles.filter(role => role === 'admin' || role === 'editor');

console.log(roles.this);      // ['user', 'editor']
console.log(adminRoles.this); // ['editor']

// Изменяем исходные данные
user.this.roles.push('admin');
user.emit('change', { detail: { operation: 'push', key: 'roles' } });

// Производные ассоциации обновляются
console.log(roles.this);      // ['user', 'editor', 'admin']
console.log(adminRoles.this); // ['editor', 'admin']
```

### Отслеживание множественных операций

```js
import deep from 'deep7';

// Создаем два множества
const set1 = deep(new Set([1, 2, 3, 4]));
const set2 = deep(new Set([3, 4, 5, 6]));

// Создаем результаты множественных операций
const diff = set1.difference(set2.this);
const intersection = set1.intersection(set2.this);
const symDiff = set1.symmetricDifference(set2.this);
const union = set1.union(set2.this);

console.log(Array.from(diff.this));          // [1, 2]
console.log(Array.from(intersection.this));  // [3, 4]
console.log(Array.from(symDiff.this));       // [1, 2, 5, 6]
console.log(Array.from(union.this));         // [1, 2, 3, 4, 5, 6]

// Модифицируем первое множество
set1.add(7);

// Все результаты автоматически обновляются
console.log(Array.from(diff.this));          // [1, 2, 7]
console.log(Array.from(intersection.this));  // [3, 4]
console.log(Array.from(symDiff.this));       // [1, 2, 5, 6, 7]
console.log(Array.from(union.this));         // [1, 2, 3, 4, 5, 6, 7]

// Модифицируем второе множество
set2.add(7);

// Результаты снова обновляются
console.log(Array.from(diff.this));          // [1, 2]
console.log(Array.from(intersection.this));  // [3, 4, 7]
console.log(Array.from(symDiff.this));       // [1, 2, 5, 6]
console.log(Array.from(union.this));         // [1, 2, 3, 4, 5, 6, 7]
```

## Оптимизации отслеживания

Система отслеживания использует различные оптимизации для повышения производительности:

1. **Точечные обновления** - для определенных типов изменений (push, pop, shift, unshift и т.д.) используются точечные обновления вместо полного перерасчета
2. **Кэширование преобразований** - функции преобразования сохраняются в `temp.transformer` для повторного использования
3. **Умная регенерация** - обновляются только те части данных, которые реально изменились
4. **Эффективная передача событий** - события содержат всю необходимую информацию для минимизации повторных вычислений

## Работа с событиями

Вы можете подписаться на события `change` любой ассоциации, чтобы отслеживать изменения вручную:

```js
const numbers = deep([1, 2, 3]);
const doubled = numbers.map(x => x * 2);

doubled.on('change', (event, data) => {
  console.log('Обновлены удвоенные числа!');
  console.log('Предыдущее состояние:', data.prev?.this);
  console.log('Новое состояние:', data.next?.this);
  console.log('Операция:', data.detail?.operation);
});

numbers.push(4); // Это вызовет событие change в doubled
```

## Структура данных отслеживания

Каждая отслеживаемая ассоциация имеет следующую структуру внутренних данных:

```js
association.temp = {
  // Ссылка на исходную ассоциацию (для методов map, filter, keys, values, entries)
  origin: <Association>,

  // Массив исходных ассоциаций (для теоретико-множественных операций)
  origins: [<Association>, <Association>, ...],

  // Метод, используемый для создания этой ассоциации
  method: 'map' | 'filter' | 'keys' | 'values' | 'entries' | 'difference' | 'intersection' | 'symmetricDifference' | 'union',

  // Функция преобразования (для map, filter и теоретико-множественных операций)
  transformer: <Function>,

  // Обработчики событий для lifecycle управления
  offChange: <Function>,  // Отписка от событий change
  offKill: <Function>,    // Отписка при уничтожении ассоциации
  offChanges: [<Function>, ...], // Массив функций отписки для множественных истоков

  // Дополнительные метаданные для отслеживания
  // ...
}
```

## Жизненный цикл отслеживания

1. **Создание связи** - при создании производной ассоциации через map, filter и т.д.
2. **Отслеживание изменений** - подписка на события change исходной ассоциации
3. **Распространение изменений** - обновление данных при получении события change
4. **Очистка ресурсов** - отписка от событий при уничтожении ассоциации (событие kill)

