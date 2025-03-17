import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Events } from './events.js';

test('События: базовая подписка и генерация событий', async (t) => {
  const events = new Events();
  let callCount = 0;
  const payload = { data: 'test data' };

  // Подписка на событие
  events.on('testEvent', (eventType, data) => {
    callCount++;
    assert.equal(eventType, 'testEvent');
    assert.deepEqual(data, payload);
  });

  // Генерация события
  events.emit('testEvent', payload);
  assert.equal(callCount, 1, 'Обработчик должен быть вызван один раз');

  // Генерация другого события не должна вызывать обработчик
  events.emit('otherEvent', payload);
  assert.equal(callCount, 1, 'Обработчик не должен вызываться для других событий');

  // Повторная генерация того же события
  events.emit('testEvent', payload);
  assert.equal(callCount, 2, 'Обработчик должен быть вызван снова');
});

test('События: отписка через возвращаемую функцию', async (t) => {
  const events = new Events();
  let callCount = 0;

  // Подписка на событие и сохранение функции отписки
  const unsubscribe = events.on('testEvent', () => {
    callCount++;
  });

  // Генерация события
  events.emit('testEvent');
  assert.equal(callCount, 1, 'Обработчик должен быть вызван');

  // Отписка через возвращаемую функцию
  unsubscribe();

  // Генерация события после отписки
  events.emit('testEvent');
  assert.equal(callCount, 1, 'Обработчик не должен быть вызван после отписки');
});

test('События: явный вызов метода off', async (t) => {
  const events = new Events();
  let callCount = 0;
  
  const handler = () => {
    callCount++;
  };

  // Подписка на событие
  events.on('testEvent', handler);

  // Генерация события
  events.emit('testEvent');
  assert.equal(callCount, 1, 'Обработчик должен быть вызван');

  // Отписка через метод off
  events.off('testEvent', handler);

  // Генерация события после отписки
  events.emit('testEvent');
  assert.equal(callCount, 1, 'Обработчик не должен быть вызван после отписки');
});

test('События: множественные обработчики', async (t) => {
  const events = new Events();
  let calls = [];
  
  // Создаем три обработчика
  const handler1 = () => { calls.push(1); };
  const handler2 = () => { calls.push(2); };
  const handler3 = () => { calls.push(3); };

  // Подписываем все три обработчика
  events.on('testEvent', handler1);
  events.on('testEvent', handler2);
  events.on('testEvent', handler3);

  // Генерация события
  events.emit('testEvent');
  assert.equal(calls.length, 3, 'Все обработчики должны быть вызваны');
  assert.deepEqual(calls, [1, 2, 3], 'Обработчики должны вызываться в порядке подписки');

  // Сбрасываем массив вызовов
  calls = [];

  // Отписываем средний обработчик
  events.off('testEvent', handler2);

  // Генерация события после отписки
  events.emit('testEvent');
  assert.equal(calls.length, 2, 'Должны быть вызваны только оставшиеся обработчики');
  assert.deepEqual(calls, [1, 3], 'Должны быть вызваны только обработчики 1 и 3');
});

test('События: обработка ошибок в обработчиках', async (t) => {
  const events = new Events();
  let handlerCalled = false;
  
  // Первый обработчик выбрасывает ошибку
  events.on('testEvent', () => {
    throw new Error('Тестовая ошибка');
  });
  
  // Второй обработчик должен выполниться несмотря на ошибку в первом
  events.on('testEvent', () => {
    handlerCalled = true;
  });

  // Перехватываем console.error, чтобы не засорять вывод теста
  const originalConsoleError = console.error;
  console.error = () => {}; // Заглушка
  
  // Генерация события
  events.emit('testEvent');
  
  // Восстанавливаем console.error
  console.error = originalConsoleError;
  
  assert.equal(handlerCalled, true, 'Второй обработчик должен быть вызван несмотря на ошибку в первом');
});

test('События: одноразовые обработчики (метод once)', async (t) => {
  const events = new Events();
  let callCount = 0;
  
  // Подписка на событие через once
  events.once('testEvent', () => {
    callCount++;
  });
  
  // Первая генерация события
  events.emit('testEvent');
  assert.equal(callCount, 1, 'Обработчик должен быть вызван один раз');
  
  // Вторая генерация события
  events.emit('testEvent');
  assert.equal(callCount, 1, 'Обработчик не должен быть вызван повторно');
  
  // Проверка с несколькими обработчиками
  let permanentCallCount = 0;
  let onceCallCount = 0;
  let anotherOnceCallCount = 0;
  
  // Постоянный обработчик
  events.on('mixedEvent', () => {
    permanentCallCount++;
  });
  
  // Первый одноразовый обработчик
  events.once('mixedEvent', () => {
    onceCallCount++;
  });
  
  // Второй одноразовый обработчик
  events.once('mixedEvent', () => {
    anotherOnceCallCount++;
  });
  
  // Генерация события
  events.emit('mixedEvent');
  
  assert.equal(onceCallCount, 1, 'Первый одноразовый обработчик должен быть вызван один раз');
  assert.equal(anotherOnceCallCount, 1, 'Второй одноразовый обработчик должен быть вызван один раз');
  
  // Повторная генерация события
  events.emit('mixedEvent');
  
  assert.equal(onceCallCount, 1, 'Первый одноразовый обработчик не должен быть вызван повторно');
  assert.equal(anotherOnceCallCount, 1, 'Второй одноразовый обработчик не должен быть вызван повторно');
});

test('События: отписка от одноразового обработчика по оригинальному обработчику', async (t) => {
  const events = new Events();
  let callCount = 0;
  
  // Создаем обработчик, который будем использовать с once
  const handler = () => {
    callCount++;
  };
  
  // Подписываемся через once
  events.once('testEvent', handler);
  
  // Отписываемся по оригинальному обработчику
  events.off('testEvent', handler);
  
  // Генерация события
  events.emit('testEvent');
  
  // Проверяем, что обработчик не был вызван
  assert.equal(callCount, 0, 'Обработчик не должен быть вызван после отписки по оригинальному обработчику');
});

test('События: контекст выполнения обработчика', async (t) => {
  const events = new Events();
  
  // Объект для использования в качестве контекста
  const context = {
    value: 'test',
    getValue() {
      return this.value;
    }
  };
  
  let contextValue = null;
  
  // Функция обработчика, использующая this
  function handler(eventType, data) {
    contextValue = this.getValue();
  }
  
  // Подписка с контекстом
  events.on('testEvent', handler, context);
  
  // Генерация события
  events.emit('testEvent');
  
  // Проверка
  assert.equal(contextValue, 'test', 'Обработчик должен выполняться с правильным контекстом');
}); 