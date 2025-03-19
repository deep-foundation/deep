# Deep.js

## Документация

- [События (Events)](./EVENTS.md)
- [Память (Memory)](./MEMORY.md)
- [Ассоциации (Association)](./ASSOCIATION.md)
- [Жизненный цикл (Lifecycle)](./LIFECYCLE.md)
- [Проверка типов (Is)](./IS.md)
- [Методы доступа (Gets)](./GETS.md)
- [Методы изменений (Sets)](./SETS.md)
- [Работа с множествами (Many)](./MANY.md)

Проект Deep версии 7.2.0 на чистом JavaScript

## Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd deep

# Не требует установки зависимостей
```

## Подключение

```bash
npm install deep7
```

```js
import deep from 'deep7';
```

## Команды

### Запуск тестов

```bash
npm test
npm test events.test.js
npm test memory.test.js
npm test association.test.js
npm test lifecycle.test.js
npm test is.test.js
npm test gets.test.js
npm test sets.test.js
```

### Запуск бенчмарков

```bash
npm run benchmark
npm run benchmark:events
npm run benchmark:memory
npm run benchmark:association
npm run benchmark:lifecycle
npm run benchmark:is
npm run benchmark:gets
npm run benchmark:sets
```

> Пока мы не пишем продолжение файла, до особых распоряжений, только редактируем радел # Документация
