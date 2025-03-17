import { run, bench, group } from 'mitata';
import { Association } from './association.js';

// Количество итераций
const ITERATIONS = 10000;

// Тестирование производительности Association
group('Association', () => {
  bench('Создание экземпляра с методами', () => {
    const assoc = new Association({
      method1: () => 1,
      method2: () => 2,
      method3: () => 3
    });
  });

  bench('Вызов метода из Association', () => {
    const assoc = new Association({
      method: (a, b) => a + b
    });
    for (let i = 0; i < ITERATIONS; i++) {
      assoc.method(i, i + 1);
    }
  });

  bench('Добавление свойств в Association', () => {
    const assoc = new Association();
    for (let i = 0; i < ITERATIONS; i++) {
      assoc[`prop${i}`] = i;
    }
  });

  bench('Получение свойств из Association', () => {
    const assoc = new Association();
    for (let i = 0; i < ITERATIONS; i++) {
      assoc[`prop${i}`] = i;
    }
    for (let i = 0; i < ITERATIONS; i++) {
      const value = assoc[`prop${i}`];
    }
  });
});

// Тестирование обычных объектов для сравнения
group('Обычный объект для сравнения', () => {
  bench('Создание объекта с методами', () => {
    const obj = {
      method1: () => 1,
      method2: () => 2,
      method3: () => 3
    };
  });

  bench('Вызов метода из объекта', () => {
    const obj = {
      method: (a, b) => a + b
    };
    for (let i = 0; i < ITERATIONS; i++) {
      obj.method(i, i + 1);
    }
  });

  bench('Добавление свойств в объект', () => {
    const obj = {};
    for (let i = 0; i < ITERATIONS; i++) {
      obj[`prop${i}`] = i;
    }
  });

  bench('Получение свойств из объекта', () => {
    const obj = {};
    for (let i = 0; i < ITERATIONS; i++) {
      obj[`prop${i}`] = i;
    }
    for (let i = 0; i < ITERATIONS; i++) {
      const value = obj[`prop${i}`];
    }
  });
});

// Тестирование Map для сравнения
group('Map для сравнения', () => {
  bench('Создание Map с методами', () => {
    const map = new Map();
    map.set('method1', () => 1);
    map.set('method2', () => 2);
    map.set('method3', () => 3);
  });

  bench('Вызов метода из Map', () => {
    const map = new Map();
    map.set('method', (a, b) => a + b);
    for (let i = 0; i < ITERATIONS; i++) {
      map.get('method')(i, i + 1);
    }
  });

  bench('Добавление свойств в Map', () => {
    const map = new Map();
    for (let i = 0; i < ITERATIONS; i++) {
      map.set(`prop${i}`, i);
    }
  });

  bench('Получение свойств из Map', () => {
    const map = new Map();
    for (let i = 0; i < ITERATIONS; i++) {
      map.set(`prop${i}`, i);
    }
    for (let i = 0; i < ITERATIONS; i++) {
      const value = map.get(`prop${i}`);
    }
  });
});

// Запуск бенчмарков
run();
