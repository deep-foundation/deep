# Memory

`Memory` - класс для управления ассоциациями, который обеспечивает эффективное хранение и доступ к связанным данным. Он значительно превосходит нативные структуры данных JavaScript, такие как `Map` и `WeakMap`, когда речь идет о скорости доступа и управлении памятью для сложных ассоциативных отношений.

[Результаты бенчмарков →](./MEMORY.benchmark.md)

## Особенности

- Хранение отношений типа "один-к-одному" (one-to-one)
- Обратный доступ через отношения "один-ко-многим" (one-to-many)
- Оптимизированная работа с большим количеством связей
- Минимальное использование памяти

## API

### Конструктор

```javascript
const memory = new Memory();
```

### Методы

#### set(key, value)

Устанавливает связь между ключом и значением. Если для ключа уже существовала связь, она обновляется.

**Параметры:**
- `key` (any): Ключ для связи
- `value` (any): Значение для связи

**Возвращает:** `boolean` - true, если операция выполнена успешно

**Пример:**
```javascript
memory.set('user-1', 'admin');
memory.set('user-2', 'editor');
memory.set('user-3', 'admin'); // Несколько ключей могут указывать на одно значение
```

#### one(key)

Получает значение, связанное с указанным ключом.

**Параметры:**
- `key` (any): Ключ для поиска

**Возвращает:** Связанное значение или undefined, если связь не найдена

**Пример:**
```javascript
const role = memory.one('user-1'); // 'admin'
```

#### many(value)

Получает множество ключей, связанных с указанным значением.

**Параметры:**
- `value` (any): Значение для поиска обратных связей

**Возвращает:** `Set` ключей, связанных с данным значением

**Пример:**
```javascript
const adminUsers = memory.many('admin'); // Set { 'user-1', 'user-3' }
```

#### delete(key)

Удаляет связь для указанного ключа.

**Параметры:**
- `key` (any): Ключ для удаления

**Возвращает:** `boolean` - true, если операция выполнена успешно

**Пример:**
```javascript
memory.delete('user-2'); // Удаляет связь для user-2
```

#### has(key)

Проверяет существование связи для указанного ключа.

**Параметры:**
- `key` (any): Ключ для проверки

**Возвращает:** `boolean` - true, если связь существует

**Пример:**
```javascript
if (memory.has('user-1')) {
  console.log('Пользователь существует');
}
```

#### clear()

Очищает всю структуру данных, удаляя все связи.

**Возвращает:** `void`

**Пример:**
```javascript
memory.clear(); // Удаляет все связи
```

#### size()

Возвращает количество хранимых one-связей.

**Возвращает:** `number` - Количество связей в структуре данных

**Пример:**
```javascript
const count = memory.size(); // Количество связей
```

## Примеры использования

### Базовое использование

```javascript
import { Memory } from './memory.js';

// Создаем структуру данных
const userRoles = new Memory();

// Устанавливаем связи
userRoles.set('user-1', 'admin');
userRoles.set('user-2', 'editor');
userRoles.set('user-3', 'viewer');
userRoles.set('user-4', 'admin');

// Получаем значение по ключу
console.log(userRoles.one('user-1')); // 'admin'

// Получаем множество ключей по значению
console.log([...userRoles.many('admin')]); // ['user-1', 'user-4']

// Обновляем связь
userRoles.set('user-3', 'editor');
console.log(userRoles.one('user-3')); // 'editor'

// Удаляем связь
userRoles.delete('user-2');
console.log(userRoles.one('user-2')); // undefined
```

### Использование с объектами

```javascript
// Создаем структуру данных
const userDepartments = new Memory();

// Объекты в качестве ключей и значений
const user1 = { id: 1, name: 'Иван' };
const user2 = { id: 2, name: 'Мария' };
const dept1 = { id: 1, name: 'Разработка' };
const dept2 = { id: 2, name: 'Маркетинг' };

// Устанавливаем связи
userDepartments.set(user1, dept1);
userDepartments.set(user2, dept2);

// Получаем отдел пользователя
const userDept = userDepartments.one(user1);
console.log(userDept.name); // 'Разработка'

// Получаем всех пользователей отдела
const deptUsers = userDepartments.many(dept1);
console.log([...deptUsers].length); // 1
```

