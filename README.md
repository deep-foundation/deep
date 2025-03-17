# Deep.js

## Документация

- [События (Events)](./EVENTS.md) 
- [Память (Memory)](./MEMORY.md)

Проект Deep версии 7.2.0 на чистом JavaScript

## Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd deep

# Не требует установки зависимостей
```

## Использование

```javascript
import { deep, Memory } from 'deep';

// Пример использования Memory
const memory = new Memory();
memory.set('key', 'value');
console.log(memory.one('key')); // value
```

## Тестирование

```bash
npm test
```

## Бенчмарки

```bash
# Запуск всех бенчмарков
npm run benchmark

# Запуск конкретных бенчмарков
npm run benchmark:events
npm run benchmark:memory
npm run benchmark:association
```