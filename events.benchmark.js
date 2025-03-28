/**
 * Бенчмарки для сравнения Events с нативным Node.js EventEmitter
 */
import { Events } from './events.js';
import { EventEmitter } from 'node:events';
import Benchmarkify from 'benchmarkify';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Events Benchmarks');
benchmark.printHeader();

// Бенчмарк 1: Подписка большого количества обработчиков
function setupSubscriptionBenchmarks() {
  const suite = benchmark.createSuite('Подписка обработчиков');

  // 1000 обработчиков
  suite.add('Events: подписка 1000 обработчиков', () => {
    const events = new Events();
    for (let i = 0; i < 1000; i++) {
      events.on(`event-${i % 100}`, () => {});
    }
  });

  suite.add('EventEmitter: подписка 1000 обработчиков', () => {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0); // Отключаем предупреждения о большом количестве слушателей
    for (let i = 0; i < 1000; i++) {
      emitter.on(`event-${i % 100}`, () => {});
    }
  });

  // 10000 обработчиков
  suite.add('Events: подписка 10000 обработчиков', () => {
    const events = new Events();
    for (let i = 0; i < 10000; i++) {
      events.on(`event-${i % 100}`, () => {});
    }
  });

  suite.add('EventEmitter: подписка 10000 обработчиков', () => {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    for (let i = 0; i < 10000; i++) {
      emitter.on(`event-${i % 100}`, () => {});
    }
  });
}

// Бенчмарк 2: Эмиссия событий с разным количеством подписчиков
function setupEmissionBenchmarks() {
  const suite = benchmark.createSuite('Эмиссия событий');

  // Подготовка для эмиссии с 100 слушателями
  const events100 = new Events();
  const emitter100 = new EventEmitter();
  emitter100.setMaxListeners(0);

  for (let i = 0; i < 100; i++) {
    events100.on('test-event', () => {});
    emitter100.on('test-event', () => {});
  }

  suite.add('Events: эмиссия события со 100 подписчиками', () => {
    events100.emit('test-event', { data: 'test' });
  });

  suite.add('EventEmitter: эмиссия события со 100 подписчиками', () => {
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

  suite.add('Events: эмиссия события с 1000 подписчиками', () => {
    events1000.emit('test-event', { data: 'test' });
  });

  suite.add('EventEmitter: эмиссия события с 1000 подписчиками', () => {
    emitter1000.emit('test-event', { data: 'test' });
  });
}

// Бенчмарк 3: Подписка/отписка обработчиков в цикле
function setupSubscriptionUnsubscriptionBenchmarks() {
  const suite = benchmark.createSuite('Подписка и отписка');

  suite.add('Events: подписка и отписка 1000 обработчиков', () => {
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

  suite.add('EventEmitter: подписка и отписка 1000 обработчиков', () => {
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

// Настройка всех бенчмарков
setupSubscriptionBenchmarks();
setupEmissionBenchmarks();
setupSubscriptionUnsubscriptionBenchmarks();

// Запуск бенчмарков
benchmark.run();
