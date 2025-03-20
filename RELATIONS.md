# Relations - Документация

## Обзор

Модуль `Relations` предоставляет механизмы для установки и получения ассоциативных связей между объектами. Ключевой особенностью этого модуля является реализация релейшенов `type` и `typed`, которые позволяют устанавливать тип ассоциации и получать все ассоциации указанного типа.

## Производительность

**Информация о системе:**

- clk: ~1.21 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Установка типа для ассоциации | ~ µs/итер | ~ опер/сек |
| Получение типа ассоциации | ~ µs/итер | ~ опер/сек |
| Получение множества typed для типа | ~ µs/итер | ~ опер/сек |
| Итерация по множеству typed с 100 ассоциациями | ~ µs/итер | ~ опер/сек |
| Создание 1000 ассоциаций с 10 типами | ~ µs/итер | ~ опер/сек |

## Компоненты модуля

### Memory для хранения типов

Центральным компонентом модуля является экземпляр Memory, который используется для хранения отношений между ассоциациями и их типами:

```javascript
export const types = new Memory({
  childSetFactory: (type) => {
    // Создает ассоциативное множество при вызове types.many(type)
  }
});
```

Особенностью реализации является использование `childSetFactory`, который создает ассоциативные множества при обратном доступе через `types.many()`. Это позволяет множествам, возвращаемым через `typed`, генерировать события при изменениях состава множества.

### Релейшен type

Релейшен `type` позволяет устанавливать и получать тип ассоциации:

```javascript
// Получение типа ассоциации
const myType = myAssociation.type;

// Установка типа ассоциации
myAssociation.type = typeAssociation;
```

При установке типа генерируются следующие события:
- `type` - с аргументами (prevType, newType)
- `change` - с аргументами ({ prevType, newType }, { method: 'type', arguments: [newType] })

### Релейшен typed

Релейшен `typed` позволяет получить множество всех ассоциаций указанного типа:

```javascript
// Получение множества ассоциаций типа typeAssociation
const associationsOfType = typeAssociation.typed;

// Итерация по ассоциациям указанного типа
for (const associationThis of typeAssociation.typed) {
  // associationThis - это ass.this, а не сама ассоциация
  console.log(associationThis);
}
```

Множество, возвращаемое через `typed`, является ассоциативным и поддерживает события. При изменении состава множества (когда ассоциации добавляются или удаляются из типа) генерируются события:
- `change` - с аргументами (prevValue, newValue)

## Автоматическая установка типа в конструкторе

Модуль расширяет функциональность конструктора Association, добавляя автоматическую установку типа, если первый аргумент конструктора является экземпляром Association:

```javascript
// Автоматическая установка типа при создании ассоциации
const typeAssociation = new Association({ name: 'MyType' });
const myAssociation = new Association(typeAssociation);

// Теперь myAssociation.type === typeAssociation
```

## Примеры использования

### Базовое использование

```javascript
import { Association } from 'deep7';

// Создаем тип ассоциации
const Person = new Association({ name: 'Person' });

// Создаем экземпляры с указанным типом
const john = new Association(Person);
john.name = 'John';
john.age = 30;

const mary = new Association(Person);
mary.name = 'Mary';
mary.age = 25;

// Получаем всех людей через typed
const people = Person.typed;
console.log(`Всего людей: ${people.size}`); // "Всего людей: 2"

// Итерируем по всем людям
for (const personData of people) {
  console.log(`Имя: ${personData.name}, Возраст: ${personData.age}`);
}
```

### Использование событий

```javascript
import { Association } from 'deep7';

// Создаем тип ассоциации
const Task = new Association({ name: 'Task' });

// Подписываемся на изменения в множестве задач
Task.typed.on('change', (event, prevValue, newValue) => {
  if (prevValue === null && newValue !== null) {
    console.log(`Добавлена новая задача: ${newValue.title}`);
  } else if (prevValue !== null && newValue === null) {
    console.log(`Удалена задача: ${prevValue.title}`);
  }
});

// Создаем новую задачу (сгенерирует событие)
const task1 = new Association(Task);
task1.title = 'Изучить релейшены';
task1.completed = false;

// Создаем еще одну задачу
const task2 = new Association(Task);
task2.title = 'Написать тесты';
task2.completed = false;

// Изменяем тип задачи (сгенерирует событие удаления из typed)
const CompletedTask = new Association({ name: 'CompletedTask' });
task1.type = CompletedTask;
```

### Комбинирование с другими компонентами Deep

```javascript
import { Association, types } from 'deep7';

// Создаем типы для нашей системы
const User = new Association({ name: 'User' });
const Role = new Association({ name: 'Role' });
const Permission = new Association({ name: 'Permission' });

// Создаем роли
const adminRole = new Association(Role);
adminRole.name = 'Admin';

const editorRole = new Association(Role);
editorRole.name = 'Editor';

// Создаем пользователей
const user1 = new Association(User);
user1.name = 'John';
user1.role = adminRole;

const user2 = new Association(User);
user2.name = 'Mary';
user2.role = editorRole;

// Получаем всех пользователей и всех админов
const allUsers = User.typed;
const admins = [];

for (const userData of allUsers) {
  if (userData.role === adminRole) {
    admins.push(userData);
  }
}

console.log(`Всего пользователей: ${allUsers.size}`);
console.log(`Админов: ${admins.length}`);
```

## Интеграция с Memory

Внутренняя реализация модуля основана на Memory с расширенной функциональностью:

```javascript
// Получение данных непосредственно через Memory
const typeOfAssociation = types.one(myAssociation.this);
const associationsOfType = types.many(myType);
```

Memory использует childSetFactory для создания ассоциативных множеств при обратном доступе, что позволяет интегрировать события в типизированные множества.

## Взаимодействие с событиями

Модуль глубоко интегрирован с системой событий Deep:

1. При изменении типа ассоциации генерируются события `type` и `change`
2. Множества, возвращаемые через `typed`, генерируют события `change` при изменении состава
3. События распространяются через всю цепочку зависимостей

Это позволяет строить реактивные системы, которые автоматически реагируют на изменения в типизации объектов.

## Советы по использованию

1. Используйте автоматическую установку типа через конструктор для упрощения кода
2. Подписывайтесь на события `change` у множеств `typed` для реагирования на изменения состава
3. Помните, что множества `typed` содержат `ass.this`, а не сами ассоциации
4. Для сложных отношений комбинируйте различные релейшены в последовательные цепочки
