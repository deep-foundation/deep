# Relations

Модуль `Relations` предоставляет механизмы для установки и получения ассоциативных связей между объектами. Ключевой особенностью этого модуля является реализация отношений `type`/`typed`, `from`/`out` и `to`/`in`, которые позволяют устанавливать различные типы связей между ассоциациями и получать коллекции связанных объектов.

[Результаты бенчмарков →](./RELATIONS.benchmark.md)

## Компоненты модуля

### Memory для хранения связей

Центральным компонентом модуля являются экземпляры Memory, которые используются для хранения различных типов отношений между ассоциациями:

```javascript
// Хранилище для типов ассоциаций
export const types = new Memory({
  childSetFactory: (type) => {
    // Создает ассоциативное множество при вызове types.many(type)
  }
});

// Хранилище для исходящих связей
export const froms = new Memory({
  childSetFactory: (source) => {
    // Создает ассоциативное множество при вызове froms.many(source)
  }
});

// Хранилище для входящих связей
export const tos = new Memory({
  childSetFactory: (target) => {
    // Создает ассоциативное множество при вызове tos.many(target)
  }
});
```

Особенностью реализации является использование `childSetFactory`, который создает ассоциативные множества при обратном доступе. Это позволяет множествам, возвращаемым через `typed`, `out` и `in`, генерировать события при изменениях состава множества.

### Отношения типов (type/typed)

#### Релейшен type

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

#### Релейшен typed

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

### Отношения исходящих связей (from/out)

#### Релейшен from

Релейшен `from` позволяет устанавливать и получать исходящую связь ассоциации:

```javascript
// Получение исходящей связи ассоциации
const mySource = myAssociation.from;

// Установка исходящей связи ассоциации
myAssociation.from = sourceAssociation;
```

При установке исходящей связи генерируются следующие события:
- `from` - с аргументами (prevFrom, newFrom)
- `change` - с аргументами ({ prevFrom, newFrom }, { method: 'from', arguments: [newFrom] })

#### Релейшен out

Релейшен `out` позволяет получить множество всех ассоциаций, имеющих указанную исходящую связь:

```javascript
// Получение множества ассоциаций, исходящих из sourceAssociation
const outgoingAssociations = sourceAssociation.out;

// Итерация по ассоциациям с указанным источником
for (const associationThis of sourceAssociation.out) {
  // associationThis - это ass.this, а не сама ассоциация
  console.log(associationThis);
}
```

### Отношения входящих связей (to/in)

#### Релейшен to

Релейшен `to` позволяет устанавливать и получать входящую связь ассоциации:

```javascript
// Получение входящей связи ассоциации
const myTarget = myAssociation.to;

// Установка входящей связи ассоциации
myAssociation.to = targetAssociation;
```

При установке входящей связи генерируются следующие события:
- `to` - с аргументами (prevTo, newTo)
- `change` - с аргументами ({ prevTo, newTo }, { method: 'to', arguments: [newTo] })

#### Релейшен in

Релейшен `in` позволяет получить множество всех ассоциаций, имеющих указанную входящую связь:

```javascript
// Получение множества ассоциаций, входящих в targetAssociation
const incomingAssociations = targetAssociation.in;

// Итерация по ассоциациям с указанной целью
for (const associationThis of targetAssociation.in) {
  // associationThis - это ass.this, а не сама ассоциация
  console.log(associationThis);
}
```

Множества, возвращаемые через `typed`, `out` и `in`, являются ассоциативными и поддерживают события. При изменении состава множества (когда ассоциации добавляются или удаляются) генерируются события:
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

### Базовое использование типов

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

### Использование from/out и to/in для моделирования графов

```javascript
import { Association } from 'deep7';

// Создаем узлы графа
const nodeA = new Association({ name: 'A' });
const nodeB = new Association({ name: 'B' });
const nodeC = new Association({ name: 'C' });

// Создаем связи (рёбра) между узлами
const edgeAB = new Association();
edgeAB.from = nodeA;  // Исходящий узел
edgeAB.to = nodeB;    // Входящий узел
edgeAB.weight = 5;    // Вес ребра

const edgeBC = new Association();
edgeBC.from = nodeB;
edgeBC.to = nodeC;
edgeBC.weight = 3;

const edgeAC = new Association();
edgeAC.from = nodeA;
edgeAC.to = nodeC;
edgeAC.weight = 7;

// Получаем все исходящие связи из узла A
console.log(`Исходящих связей из A: ${nodeA.out.size}`); // 2

// Получаем все входящие связи в узел C
console.log(`Входящих связей в C: ${nodeC.in.size}`); // 2

// Находим все узлы, связанные с A
console.log("Узлы, связанные с A:");
for (const edge of nodeA.out) {
  console.log(`A -> ${edge.to.name} (вес: ${edge.weight})`);
}
```

### Комбинирование разных типов отношений

```javascript
import { Association } from 'deep7';

// Создаем тип для задач
const Task = new Association({ name: 'Task' });

// Создаем пользователей
const alice = new Association({ name: 'Alice' });
const bob = new Association({ name: 'Bob' });

// Создаем проекты
const projectX = new Association({ name: 'Project X' });
const projectY = new Association({ name: 'Project Y' });

// Создаем задачи с типом, автором и проектом
const task1 = new Association(Task);
task1.title = "Разработать API";
task1.from = alice; // Автор задачи
task1.to = projectX; // Проект, к которому относится задача

const task2 = new Association(Task);
task2.title = "Написать тесты";
task2.from = bob;
task2.to = projectX;

const task3 = new Association(Task);
task3.title = "Обновить документацию";
task3.from = alice;
task3.to = projectY;

// Получаем все задачи
console.log(`Всего задач: ${Task.typed.size}`); // 3

// Получаем задачи, созданные Alice
console.log(`Задачи от Alice: ${alice.out.size}`); // 2
for (const taskThis of alice.out) {
  console.log(`- ${taskThis.title} в проекте ${taskThis.to.name}`);
}

// Получаем задачи по проекту X
console.log(`Задачи в проекте X: ${projectX.in.size}`); // 2
for (const taskThis of projectX.in) {
  console.log(`- ${taskThis.title} от ${taskThis.from.name}`);
}
```

### Использование событий

```javascript
import { Association } from 'deep7';

// Создаем тип ассоциации
const Task = new Association({ name: 'Task' });
const user = new Association({ name: 'User' });

// Подписываемся на изменения в множестве задач
Task.typed.on('change', (event) => {
  console.log(`Изменение в типе задачи: ${event.prev} -> ${event.next}`);
});

// Подписываемся на изменения в исходящих задачах
user.out.on('change', (event) => {
  console.log(`Изменение в задачах пользователя: ${event.reason}`);
});

// Создаем новую задачу и связываем с пользователем
const task1 = new Association(Task);
task1.title = 'Изучить релейшены';
task1.from = user; // Сгенерирует событие в user.out

// Изменяем автора задачи
const anotherUser = new Association({ name: 'AnotherUser' });
task1.from = anotherUser; // Сгенерирует событие в user.out (удаление)
```

## Интеграция с Memory

Внутренняя реализация модуля основана на Memory с расширенной функциональностью:

```javascript
// Получение данных непосредственно через Memory
const typeOfAssociation = types.one(myAssociation.this);
const associationsOfType = types.many(myType);

const sourceOfAssociation = froms.one(myAssociation.this);
const associationsFromSource = froms.many(mySource);

const targetOfAssociation = tos.one(myAssociation.this);
const associationsToTarget = tos.many(myTarget);
```

Memory использует childSetFactory для создания ассоциативных множеств при обратном доступе, что позволяет интегрировать события в множества.

## Взаимодействие с событиями

Модуль глубоко интегрирован с системой событий Deep:

1. При изменении типа или связей ассоциации генерируются события `type`, `from`, `to` и `change`
2. Множества, возвращаемые через `typed`, `out` и `in`, генерируют события `change` при изменении состава
3. События распространяются через всю цепочку зависимостей

Это позволяет строить реактивные системы, которые автоматически реагируют на изменения в связях между объектами.

## Поддержка TRACK

Все типы отношений (`typed`, `out` и `in`) поддерживают механизм TRACK, который позволяет автоматически отслеживать изменения в множествах:

```javascript
// Получаем множество и его трекер
const typedAss = myType.typed;
const track = typedAss.track;

// Множество будет автоматически обновляться при изменении типов ассоциаций
```

## Советы по использованию

1. Используйте автоматическую установку типа через конструктор для упрощения кода
2. Подписывайтесь на события `change` у множеств для реагирования на изменения состава
3. Помните, что множества содержат `ass.this`, а не сами ассоциации
4. Для графовых структур данных используйте комбинацию `from`/`out` и `to`/`in`
5. Для моделирования иерархических отношений можно использовать `from` как родительскую связь и `out` для получения дочерних элементов
6. Комбинируйте различные типы отношений для построения сложных моделей данных
