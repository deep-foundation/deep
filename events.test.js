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

test('События: подписка на события по wildcard', async (t) => {
  const events = new Events();
  const receivedEvents = [];
  
  // Подписка на все события, начинающиеся с "user."
  events.on('user.*', (eventType, data) => {
    receivedEvents.push({ eventType, data });
  });
  
  // Генерация событий
  events.emit('user.login', { userId: 1 });
  events.emit('user.logout', { userId: 1 });
  events.emit('system.error', { code: 500 }); // Не должно обрабатываться
  
  // Проверка
  assert.equal(receivedEvents.length, 2, 'Обработчик должен получить только события, соответствующие шаблону');
  assert.equal(receivedEvents[0].eventType, 'user.login', 'Первое событие должно быть user.login');
  assert.equal(receivedEvents[1].eventType, 'user.logout', 'Второе событие должно быть user.logout');
  assert.deepEqual(receivedEvents[0].data, { userId: 1 }, 'Данные первого события должны быть корректны');
  assert.deepEqual(receivedEvents[1].data, { userId: 1 }, 'Данные второго события должны быть корректны');
});

test('События: подписка на события по нескольким wildcard-шаблонам', async (t) => {
  const events = new Events();
  const userEvents = [];
  const loginEvents = [];
  
  // Подписка на все события пользователя
  events.on('user.*', (eventType) => {
    userEvents.push(eventType);
  });
  
  // Подписка на все события входа в систему
  events.on('*.login', (eventType) => {
    loginEvents.push(eventType);
  });
  
  // Генерация событий
  events.emit('user.login', { userId: 1 });  // Должно срабатывать оба обработчика
  events.emit('user.logout', { userId: 1 }); // Только первый обработчик
  events.emit('admin.login', { adminId: 1 }); // Только второй обработчик
  events.emit('system.error', { code: 500 }); // Ни один из обработчиков
  
  // Проверка
  assert.equal(userEvents.length, 2, 'Обработчик user.* должен получить два события');
  assert.equal(loginEvents.length, 2, 'Обработчик *.login должен получить два события');
  assert.deepEqual(userEvents, ['user.login', 'user.logout'], 'Обработчик user.* должен получить корректные события');
  assert.deepEqual(loginEvents, ['user.login', 'admin.login'], 'Обработчик *.login должен получить корректные события');
});

test('События: отписка от wildcard-обработчика', async (t) => {
  const events = new Events();
  let callCount = 0;
  
  // Создаем обработчик для wildcard-события
  const handler = () => {
    callCount++;
  };
  
  // Подписываемся
  events.on('user.*', handler);
  
  // Генерация события
  events.emit('user.login');
  assert.equal(callCount, 1, 'Обработчик должен быть вызван');
  
  // Отписываемся
  events.off('user.*', handler);
  
  // Повторная генерация события
  events.emit('user.login');
  assert.equal(callCount, 1, 'Обработчик не должен быть вызван после отписки');
});

test('События: одноразовая подписка на wildcard-события', async (t) => {
  const events = new Events();
  let callCount = 0;
  
  // Подписываемся один раз
  events.once('user.*', () => {
    callCount++;
  });
  
  // Генерация события
  events.emit('user.login');
  assert.equal(callCount, 1, 'Обработчик должен быть вызван один раз');
  
  // Повторная генерация события
  events.emit('user.login');
  assert.equal(callCount, 1, 'Обработчик не должен быть вызван повторно');
  
  // Генерация другого события, попадающего под шаблон
  events.emit('user.logout');
  assert.equal(callCount, 1, 'Обработчик не должен быть вызван для другого события после отписки');
});

test('События: removeAllListeners для конкретного события', async (t) => {
  const events = new Events();
  let callCount1 = 0;
  let callCount2 = 0;
  
  // Подписываемся на два разных события
  events.on('event1', () => {
    callCount1++;
  });
  
  events.on('event2', () => {
    callCount2++;
  });
  
  // Генерация событий
  events.emit('event1');
  events.emit('event2');
  assert.equal(callCount1, 1, 'Обработчик event1 должен быть вызван');
  assert.equal(callCount2, 1, 'Обработчик event2 должен быть вызван');
  
  // Удаляем все обработчики для event1
  events.removeAllListeners('event1');
  
  // Повторная генерация событий
  events.emit('event1');
  events.emit('event2');
  assert.equal(callCount1, 1, 'Обработчик event1 не должен быть вызван после удаления');
  assert.equal(callCount2, 2, 'Обработчик event2 должен быть вызван снова');
});

test('События: removeAllListeners для всех событий', async (t) => {
  const events = new Events();
  let callCount1 = 0;
  let callCount2 = 0;
  let wildcardCallCount = 0;
  
  // Подписываемся на разные события
  events.on('event1', () => {
    callCount1++;
  });
  
  events.on('event2', () => {
    callCount2++;
  });
  
  events.on('event*', () => {
    wildcardCallCount++;
  });
  
  // Генерация событий
  events.emit('event1');
  events.emit('event2');
  assert.equal(callCount1, 1, 'Обработчик event1 должен быть вызван');
  assert.equal(callCount2, 1, 'Обработчик event2 должен быть вызван');
  assert.equal(wildcardCallCount, 2, 'Wildcard обработчик должен быть вызван дважды');
  
  // Удаляем все обработчики
  events.removeAllListeners();
  
  // Повторная генерация событий
  events.emit('event1');
  events.emit('event2');
  assert.equal(callCount1, 1, 'Обработчик event1 не должен быть вызван после удаления');
  assert.equal(callCount2, 1, 'Обработчик event2 не должен быть вызван после удаления');
  assert.equal(wildcardCallCount, 2, 'Wildcard обработчик не должен быть вызван после удаления');
});

test('События: управление контекстом (this)', async (t) => {
  const events = new Events();
  
  // Создаем объект с данными и методом
  const context = {
    name: 'Тестовый объект',
    value: 42,
    getValue() {
      return this.value;
    }
  };
  
  let receivedValue = null;
  let receivedName = null;
  let receivedContext = null;
  
  // Функция-обработчик, использующая this
  function handler(eventType, data) {
    receivedValue = this.getValue();
    receivedName = this.name;
    receivedContext = this;
  }
  
  // Подписываемся с указанием контекста
  events.on('testEvent', handler, context);
  
  // Генерация события
  events.emit('testEvent', { test: true });
  
  // Проверка, что контекст был правильно передан
  assert.equal(receivedValue, 42, 'Должно быть получено значение из контекста');
  assert.equal(receivedName, 'Тестовый объект', 'Должно быть получено имя из контекста');
  assert.strictEqual(receivedContext, context, 'Контекст this должен быть передан корректно');
  
  // Проверка для wildcard событий
  receivedValue = null;
  receivedName = null;
  
  // Подписка на wildcard событие с контекстом
  events.on('test.*', handler, context);
  
  // Генерация wildcard события
  events.emit('test.wildcard', { wild: true });
  
  // Проверка
  assert.equal(receivedValue, 42, 'Должно быть получено значение из контекста для wildcard');
  assert.equal(receivedName, 'Тестовый объект', 'Должно быть получено имя из контекста для wildcard');
  
  // Проверка для одноразовых обработчиков
  receivedValue = null;
  
  // Одноразовая подписка с контекстом
  events.once('onceEvent', handler, context);
  
  // Генерация события
  events.emit('onceEvent');
  
  // Проверка
  assert.equal(receivedValue, 42, 'Должно быть получено значение из контекста для once');
}); 