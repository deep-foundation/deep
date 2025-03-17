/**
 * Бенчмарки для сравнения Events с нативным Node.js EventEmitter
 */
import { bench, run, group } from 'mitata';
import { Events } from './events.js';
import { EventEmitter } from 'node:events';

// Добавим специальный флаг для вывода в JSON
const isJsonOutput = process.argv.includes('--json');

// Бенчмарк 1: Подписка большого количества обработчиков
function setupSubscriptionBenchmarks() {
  // 1000 обработчиков
  bench('Events: подписка 1000 обработчиков', () => {
    const events = new Events();
    for (let i = 0; i < 1000; i++) {
      events.on(`event-${i % 100}`, () => {});
    }
  });

  bench('EventEmitter: подписка 1000 обработчиков', () => {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0); // Отключаем предупреждения о большом количестве слушателей
    for (let i = 0; i < 1000; i++) {
      emitter.on(`event-${i % 100}`, () => {});
    }
  });

  // 10000 обработчиков
  bench('Events: подписка 10000 обработчиков', () => {
    const events = new Events();
    for (let i = 0; i < 10000; i++) {
      events.on(`event-${i % 100}`, () => {});
    }
  });

  bench('EventEmitter: подписка 10000 обработчиков', () => {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    for (let i = 0; i < 10000; i++) {
      emitter.on(`event-${i % 100}`, () => {});
    }
  });
}

// Бенчмарк 2: Эмиссия событий с разным количеством подписчиков
function setupEmissionBenchmarks() {
  // Подготовка для эмиссии с 100 слушателями
  const events100 = new Events();
  const emitter100 = new EventEmitter();
  emitter100.setMaxListeners(0);
  
  for (let i = 0; i < 100; i++) {
    events100.on('test-event', () => {});
    emitter100.on('test-event', () => {});
  }

  bench('Events: эмиссия события со 100 подписчиками', () => {
    events100.emit('test-event', { data: 'test' });
  });

  bench('EventEmitter: эмиссия события со 100 подписчиками', () => {
    emitter100.emit('test-event', { data: 'test' });
  });

  // Подготовка для эмиссии с 1000 слушателями
  const events1000 = new Events();
  const emitter1000 = new EventEmitter();
  emitter1000.setMaxListeners(0);
  
  for (let i = 0; i < 1000; i++) {
    events1000.on('test-event', () => {});
    emitter1000.on('test-event', () => {});
  }

  bench('Events: эмиссия события с 1000 подписчиками', () => {
    events1000.emit('test-event', { data: 'test' });
  });

  bench('EventEmitter: эмиссия события с 1000 подписчиками', () => {
    emitter1000.emit('test-event', { data: 'test' });
  });
}

// Бенчмарк 3: Подписка/отписка обработчиков в цикле
function setupSubscriptionUnsubscriptionBenchmarks() {
  bench('Events: подписка и отписка 1000 обработчиков', () => {
    const events = new Events();
    const handlers = [];
    
    // Подписка
    for (let i = 0; i < 1000; i++) {
      const handler = () => {};
      events.on('test-event', handler);
      handlers.push(handler);
    }
    
    // Отписка
    for (let i = 0; i < 1000; i++) {
      events.off('test-event', handlers[i]);
    }
  });

  bench('EventEmitter: подписка и отписка 1000 обработчиков', () => {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    const handlers = [];
    
    // Подписка
    for (let i = 0; i < 1000; i++) {
      const handler = () => {};
      emitter.on('test-event', handler);
      handlers.push(handler);
    }
    
    // Отписка
    for (let i = 0; i < 1000; i++) {
      emitter.off('test-event', handlers[i]);
    }
  });
}

// Бенчмарк 4: Wildcard подписки vs множественные подписки - закомментирован
/* 
function setupWildcardBenchmarks() {
  // Создаем 100 типов событий для тестирования
  const eventTypes = Array.from({ length: 100 }, (_, i) => `user.${i}`);
  
  // Events с wildcard
  const eventsWildcard = new Events();
  eventsWildcard.on('user.*', () => {});
  
  // EventEmitter с множественными подписками
  const emitterMultiple = new EventEmitter();
  for (const type of eventTypes) {
    emitterMultiple.on(type, () => {});
  }
  
  bench('Events: эмиссия 100 событий для wildcard подписки', () => {
    for (const type of eventTypes) {
      eventsWildcard.emit(type, { userId: 1 });
    }
  });
  
  bench('EventEmitter: эмиссия 100 событий для множественных подписок', () => {
    for (const type of eventTypes) {
      emitterMultiple.emit(type, { userId: 1 });
    }
  });
}
*/

// Бенчмарк 6: Wildcard подписки (много событий для одной подписки) - закомментирован
/*
bench('Events: эмиссия 100 событий для wildcard подписки', () => {
  const events = new Events();
  events.on('user.*', () => {});
  
  // Эмитируем 100 разных событий
  for (let i = 0; i < 100; i++) {
    events.emit(`user.${i}`);
  }
});
*/

// Стандартный EventEmitter не поддерживает wildcard подписки нативно
// Поэтому это нечестное сравнение - EventEmitter делает меньше работы
// Закомментировано, так как сравнение не корректно
/* 
bench('EventEmitter: эмиссия 100 событий для множественных подписок', () => {
  const emitter = new EventEmitter();
  
  // Подписка на 100 отдельных событий
  for (let i = 0; i < 100; i++) {
    emitter.on(`user.${i}`, () => {});
  }
  
  // Эмитируем 100 разных событий
  for (let i = 0; i < 100; i++) {
    emitter.emit(`user.${i}`);
  }
});
*/

// Настройка всех бенчмарков
setupSubscriptionBenchmarks();
setupEmissionBenchmarks();
setupSubscriptionUnsubscriptionBenchmarks();
// setupWildcardBenchmarks(); // Закомментировано

// Настройка и запуск бенчмарков
console.log('Запуск бенчмарков для сравнения Events с EventEmitter...');

if (isJsonOutput) {
  const results = await run({ json: true });
  console.log(JSON.stringify(results, null, 2));
} else {
  await run();
} 