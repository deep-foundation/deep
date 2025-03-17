# События (Events)

Класс `Events` предоставляет эффективный механизм для работы с событиями, оптимизированный для обработки большого количества различных типов событий.

## Основные особенности

- Эффективная группировка обработчиков по типам событий
- Поддержка wildcard-подписок (`user.*`, `*.login`)
- Одноразовые подписки (метод `once`)
- Управление контекстом выполнения (`this`)
- Защита от ошибок в обработчиках
- Методы для удаления всех обработчиков

## API

### Конструктор

```javascript
const events = new Events();
```

### Методы

#### on(eventType, handler, context)

Подписка на событие.

**Параметры:**
- `eventType` (string): Тип события (может содержать `*` для подписки на группу событий)
- `handler` (Function): Функция-обработчик
- `context` (object, опционально): Контекст (`this`) для вызова обработчика

**Возвращает:** Функцию для отписки от события

**Пример:**
```javascript
// Обычная подписка
events.on('user.login', (eventType, data) => {
  console.log(`Событие ${eventType}:`, data);
});

// Подписка с контекстом
const user = {
  name: 'Пользователь',
  greet() {
    console.log(`Привет от ${this.name}!`);
  }
};

events.on('greeting', function() {
  this.greet();
}, user);
```

#### once(eventType, handler, context)

Подписка на событие с автоматической отпиской после первого вызова.

**Параметры:**
- `eventType` (string): Тип события (может содержать `*` для подписки на группу событий)
- `handler` (Function): Функция-обработчик
- `context` (object, опционально): Контекст (`this`) для вызова обработчика

**Возвращает:** Функцию для отписки от события

**Пример:**
```javascript
// Обработчик будет вызван только один раз
events.once('user.login', (eventType, data) => {
  console.log('Первый вход пользователя:', data);
});
```

#### off(eventType, handler)

Отписка от события.

**Параметры:**
- `eventType` (string): Тип события
- `handler` (Function): Функция-обработчик для удаления

**Возвращает:** `true`, если отписка была успешной, иначе `false`

**Пример:**
```javascript
const handler = (eventType, data) => {
  console.log(`Событие ${eventType}:`, data);
};

// Подписка
events.on('user.login', handler);

// Отписка
events.off('user.login', handler);
```

#### removeAllListeners(eventType)

Удаляет все обработчики для указанного типа события. Если тип события не указан, удаляет все обработчики всех событий.

**Параметры:**
- `eventType` (string, опционально): Тип события (если не указан, удаляются все обработчики)

**Возвращает:** `true`, если удаление было успешным, иначе `false`

**Пример:**
```javascript
// Удаление всех обработчиков конкретного события
events.removeAllListeners('user.login');

// Удаление всех обработчиков всех событий
events.removeAllListeners();
```

#### emit(eventType, ...args)

Генерация события.

**Параметры:**
- `eventType` (string): Тип события
- `...args` (любые): Аргументы, передаваемые обработчикам

**Возвращает:** `true`, если были вызваны обработчики, иначе `false`

**Пример:**
```javascript
// Генерация события с данными
events.emit('user.login', { userId: 1, username: 'admin' });
```

## Примеры использования

### Базовое использование

```javascript
import { Events } from './events.js';

const events = new Events();

// Подписка на событие
events.on('user.login', (eventType, user) => {
  console.log(`Пользователь ${user.username} вошёл в систему`);
});

// Генерация события
events.emit('user.login', { username: 'admin', id: 1 });
```

### Wildcard-подписки

```javascript
// Подписка на все события пользователя
events.on('user.*', (eventType, data) => {
  console.log(`Событие пользователя: ${eventType}`, data);
});

// Подписка на все события входа в систему
events.on('*.login', (eventType, data) => {
  console.log(`Вход в систему: ${eventType}`, data);
});

// События будут обработаны соответствующими обработчиками
events.emit('user.login', { username: 'admin' });  // Вызовет оба обработчика
events.emit('user.logout', { username: 'admin' }); // Только первый обработчик
events.emit('admin.login', { username: 'root' });  // Только второй обработчик
```

### Управление контекстом

```javascript
const user = {
  name: 'Пользователь',
  id: 1,
  logInfo() {
    console.log(`Пользователь ${this.name} (ID: ${this.id})`);
  }
};

// Передаем user как контекст для this внутри обработчика
events.on('user.action', function(eventType, action) {
  console.log(`Действие: ${action}`);
  this.logInfo(); // this указывает на объект user
}, user);

events.emit('user.action', 'клик по кнопке');
```

### Обработка ошибок

```javascript
// Первый обработчик с ошибкой
events.on('important.event', () => {
  throw new Error('Что-то пошло не так!');
});

// Второй обработчик всё равно выполнится
events.on('important.event', () => {
  console.log('Этот код будет выполнен, несмотря на ошибку в первом обработчике');
});

// Генерация события
events.emit('important.event');
``` 