# Relations

Модуль `Relations` предоставляет механизмы для установки и получения ассоциативных связей между объектами. Ключевой особенностью этого модуля является реализация отношений `type`/`typed`, `from`/`out` и `to`/`in`, которые позволяют устанавливать различные типы связей между ассоциациями и получать коллекции связанных объектов.

[Результаты бенчмарков →](./RELATIONS.benchmark.md)
[Тест на пределы количества связей →](./RELATIONS.limits.md)

## Доступные типы отношений

Модуль предоставляет три основных типа отношений:

1. **Отношения типов** (`type`/`typed`) - связывают ассоциацию с её типом
2. **Отношения исходящих связей** (`from`/`out`) - определяют источник (откуда идет связь)
3. **Отношения входящих связей** (`to`/`in`) - определяют цель (куда идет связь)

Эти отношения могут комбинироваться для создания сложных структур данных, включая графы, иерархии и сети отношений.

## Практическое применение релейшенов

### Установка и получение типа ассоциации

```javascript
import deep from 'deep7';

// Создаем тип ассоциации
const Person = deep({ name: 'Person' });

// Устанавливаем тип при создании (рекомендуемый способ)
const john = deep(Person);
john.name = 'John';

// Или устанавливаем тип после создания
const mary = deep();
mary.name = 'Mary';
mary.type = Person;

// Получение типа ассоциации
console.log(john.type === Person); // true
console.log(mary.type === Person); // true

// Получение всех ассоциаций данного типа
const allPeople = Person.typed;
console.log(`Количество людей: ${allPeople.size}`); // 2
```

### Установка и получение исходящих/входящих связей

```javascript
import deep from 'deep7';

// Создаем узлы для графа отношений
const alice = deep({ name: 'Alice' });
const bob = deep({ name: 'Bob' });
const charlie = deep({ name: 'Charlie' });

// Создаем ассоциацию-связь "дружба"
const friendship1 = deep();
friendship1.from = alice;   // Устанавливаем источник (кто дружит)
friendship1.to = bob;       // Устанавливаем цель (с кем дружит)
friendship1.type = 'Дружба';

// Создаем еще одну связь
const friendship2 = deep();
friendship2.from = alice;
friendship2.to = charlie;
friendship2.type = 'Дружба';

// Получаем все исходящие связи от Alice
console.log(`Alice дружит с ${alice.out.size} людьми`); // 2

// Получаем все входящие связи к Bob
console.log(`С Bob дружат ${bob.in.size} человек`); // 1

// Перебираем всех, с кем дружит Alice
for (const rel of alice.out) {
  console.log(`Alice дружит с ${rel.to.name}`);
}

// Находим всех, кто дружит с Charlie
for (const rel of charlie.in) {
  console.log(`${rel.from.name} дружит с Charlie`);
}
```

### Комбинирование отношений для сложных структур данных

#### Пример: Система задач с проектами и исполнителями

```javascript
import deep from 'deep7';

// Создаем типы для сущностей
const TaskType = deep({ name: 'Task' });
const ProjectType = deep({ name: 'Project' });
const UserType = deep({ name: 'User' });

// Создаем проекты
const project1 = deep(ProjectType);
project1.name = 'Веб-приложение';

const project2 = deep(ProjectType);
project2.name = 'Мобильное приложение';

// Создаем пользователей
const dev1 = deep(UserType);
dev1.name = 'Иван';
dev1.role = 'Разработчик';

const dev2 = deep(UserType);
dev2.name = 'Мария';
dev2.role = 'Тестировщик';

// Создаем задачи с указанием типа, автора и проекта
const task1 = deep(TaskType);
task1.title = 'Создать API';
task1.from = dev1;          // Исполнитель задачи
task1.to = project1;        // Проект, к которому относится задача
task1.status = 'В процессе';

const task2 = deep(TaskType);
task2.title = 'Написать тесты';
task2.from = dev2;
task2.to = project1;
task2.status = 'Ожидает';

const task3 = deep(TaskType);
task3.title = 'Разработать интерфейс';
task3.from = dev1;
task3.to = project2;
task3.status = 'Новая';

// Получение всех задач в проекте "Веб-приложение"
console.log(`Задачи в проекте "${project1.name}":`);
for (const task of project1.in) {
  console.log(`- ${task.title} (${task.status}) - Исполнитель: ${task.from.name}`);
}

// Получение всех задач разработчика Иван
console.log(`Задачи разработчика ${dev1.name}:`);
for (const task of dev1.out) {
  console.log(`- ${task.title} в проекте "${task.to.name}"`);
}

// Задачи определенного типа
console.log(`Всего задач: ${TaskType.typed.size}`);
```

#### Пример: Моделирование иерархических структур

```javascript
import deep from 'deep7';

// Создаем категории товаров (дерево категорий)
const root = deep({ name: 'Все товары' });

const electronics = deep({ name: 'Электроника' });
electronics.from = root; // Родительская связь

const computers = deep({ name: 'Компьютеры' });
computers.from = electronics;

const phones = deep({ name: 'Смартфоны' });
phones.from = electronics;

const laptops = deep({ name: 'Ноутбуки' });
laptops.from = computers;

const desktops = deep({ name: 'Настольные ПК' });
desktops.from = computers;

// Получаем все подкатегории электроники (прямые потомки)
console.log(`Подкатегории электроники:`);
for (const subcategory of electronics.out) {
  console.log(`- ${subcategory.name}`);
}

// Получаем родительскую категорию для ноутбуков
console.log(`Родитель для категории "${laptops.name}": ${laptops.from.name}`);

// Функция для рекурсивного вывода всей иерархии
function printCategoryTree(category, level = 0) {
  console.log(`${'  '.repeat(level)}- ${category.name}`);

  for (const child of category.out) {
    printCategoryTree(child, level + 1);
  }
}

// Выводим все дерево категорий
console.log('Дерево категорий:');
printCategoryTree(root);
```

### Использование с методами gets для обработки наборов данных

Отношения `typed`, `out` и `in` возвращают наборы ассоциаций, которые можно обрабатывать с помощью методов `gets` для выполнения операций фильтрации, сортировки и трансформации. [Подробнее о методах gets →](./GETS.md)

```javascript
import deep from 'deep7';
import { gets } from 'deep7';

// Создаем тип "Товар"
const Product = deep({ name: 'Product' });

// Создаем несколько товаров
const prod1 = deep(Product);
prod1.name = 'Ноутбук';
prod1.price = 1200;
prod1.inStock = true;

const prod2 = deep(Product);
prod2.name = 'Смартфон';
prod2.price = 800;
prod2.inStock = true;

const prod3 = deep(Product);
prod3.name = 'Планшет';
prod3.price = 600;
prod3.inStock = false;

// Получаем все товары и используем gets для фильтрации и сортировки
const availableProducts = gets(Product.typed)
  .filter(product => product.inStock)   // только те, что в наличии
  .sort((a, b) => a.price - b.price)    // сортировка по возрастанию цены
  .value();

console.log('Товары в наличии (от дешевых к дорогим):');
for (const product of availableProducts) {
  console.log(`- ${product.name}: $${product.price}`);
}

// Используем gets для трансформации данных
const productList = gets(Product.typed)
  .map(product => ({
    name: product.name,
    priceWithTax: product.price * 1.2,
    status: product.inStock ? 'В наличии' : 'Отсутствует'
  }))
  .value();

console.log('Список товаров с ценой, включающей налог:');
console.log(productList);
```

## Использование событий с релейшенами

Все типы отношений поддерживают события, которые позволяют реагировать на изменения в связях:

```javascript
import deep from 'deep7';

// Создаем тип Книга
const Book = deep({ name: 'Book' });

// Создаем автора
const author = deep({ name: 'Александр Пушкин' });

// Подписываемся на изменения в коллекции книг этого автора
author.out.on('change', (event) => {
  console.log(`Изменение в списке книг автора ${author.name}:`);
  console.log(event);
});

// Добавляем книгу - сработает событие change
const book1 = deep(Book);
book1.title = 'Евгений Онегин';
book1.from = author;

// Еще одна книга - снова сработает событие
const book2 = deep(Book);
book2.title = 'Капитанская дочка';
book2.from = author;

// Изменяем автора книги - сработает событие "удаления" из коллекции
const anotherAuthor = deep({ name: 'Николай Гоголь' });
book1.from = anotherAuthor;
```

## Советы по использованию

1. **Используйте конструктор для установки типа** — Создавайте ассоциации с указанием типа в конструкторе (`deep(Type)`) для более чистого кода.

2. **Используйте говорящие имена для связей** — Например, для моделирования отношений между людьми и компаниями можно использовать `person.from = company` (человек работает в компании) и `company.out` (сотрудники компании).

3. **Комбинируйте отношения** — Сочетайте `type/typed`, `from/out` и `to/in` для создания разных аспектов отношений между объектами.

4. **Используйте события для реактивности** — Подписывайтесь на события изменений в коллекциях для автоматического обновления интерфейса или выполнения связанной логики.

5. **Используйте gets для обработки коллекций** — Применяйте методы gets для фильтрации, сортировки и преобразования коллекций ассоциаций.

6. **Моделируйте сложные структуры данных** — Используйте релейшены для представления графов, деревьев, сетей и других сложных структур данных.

7. **Помните о производительности** — При работе с большими наборами данных используйте вспомогательные индексы и следите за потреблением памяти.
