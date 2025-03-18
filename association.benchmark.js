import { run, bench } from 'mitata';
import { Association } from './association.js';
import { deep } from './index.js';

// Количество итераций
const ITERATIONS = 10000;

// Тестирование производительности Association
bench('Создание экземпляра с методами', () => {
  const a = deep(null, {
    method1: (a, b) => a + b,
    method2: (a, b) => a * b
  });
  return a;
});

bench('Вызов метода из Association', () => {
  const a = deep(null, {
    add: (a, b) => a + b
  });
  return a.add(5, 10);
});

bench('Добавление свойств в Association', () => {
  const a = deep();
  a.prop1 = 'value1';
  a.prop2 = 'value2';
  a.prop3 = 'value3';
  return a;
});

bench('Получение свойств из Association', () => {
  const a = deep(null, {
    prop1: 'value1',
    prop2: 'value2',
    prop3: 'value3'
  });
  return a.prop1 + a.prop2 + a.prop3;
});

bench('Вызов динамического метода (ass, op, args)', () => {
  const a = deep();

  a.dynamicMethod = (ass, op, args) => {
    if (op === 'get') {
      return ass.temp.dynamicMethod = ass.temp.dynamicMethod || ((...args) =>
        ass._proxy.get('dynamicMethod')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      return args.reduce((sum, val) => sum + val, 0);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  };

  return a.dynamicMethod(1, 2, 3, 4, 5);
});

bench('Повторный вызов динамического метода', () => {
  const a = deep();

  a.dynamicMethod = (ass, op, args) => {
    if (op === 'get') {
      return ass.temp.dynamicMethod = ass.temp.dynamicMethod || ((...args) =>
        ass._proxy.get('dynamicMethod')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      return args.reduce((sum, val) => sum + val, 0);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  };

  // Первый вызов для создания кеша
  a.dynamicMethod(1, 2, 3);

  // Бенчмарк повторного вызова
  return a.dynamicMethod(4, 5, 6);
});

bench('Вызов статического метода', () => {
  // Добавляем метод в статический _proxy
  Association._proxy.set('staticBenchMethod', (ass, op, args) => {
    if (op === 'get') {
      return ass.temp.staticBenchMethod = ass.temp.staticBenchMethod || ((...args) =>
        Association._proxy.get('staticBenchMethod')(ass, 'apply', args)
      );
    } else if (op === 'apply') {
      return args.reduce((sum, val) => sum + val, 0);
    } else {
      throw new Error(`unexpected op=${op}`);
    }
  });

  const a = deep();
  return a.staticBenchMethod(1, 2, 3, 4, 5);
});

bench('Вызов прокси как функции', () => {
  const originalFn = (a, b) => a + b;
  const a = deep(originalFn);
  return a(5, 10);
});

// Тестирование обычных объектов для сравнения
bench('Создание объекта с методами', () => {
  const obj = {
    method1: (a, b) => a + b,
    method2: (a, b) => a * b
  };
  return obj;
});

bench('Вызов метода из объекта', () => {
  const obj = {
    add: (a, b) => a + b
  };
  return obj.add(5, 10);
});

bench('Добавление свойств в объект', () => {
  const obj = {};
  obj.prop1 = 'value1';
  obj.prop2 = 'value2';
  obj.prop3 = 'value3';
  return obj;
});

bench('Получение свойств из объекта', () => {
  const obj = {
    prop1: 'value1',
    prop2: 'value2',
    prop3: 'value3'
  };
  return obj.prop1 + obj.prop2 + obj.prop3;
});

// Тестирование Map для сравнения
bench('Создание Map с методами', () => {
  const map = new Map();
  map.set('method1', (a, b) => a + b);
  map.set('method2', (a, b) => a * b);
  return map;
});

bench('Вызов метода из Map', () => {
  const map = new Map();
  map.set('add', (a, b) => a + b);
  return map.get('add')(5, 10);
});

bench('Добавление свойств в Map', () => {
  const map = new Map();
  map.set('prop1', 'value1');
  map.set('prop2', 'value2');
  map.set('prop3', 'value3');
  return map;
});

bench('Получение свойств из Map', () => {
  const map = new Map();
  map.set('prop1', 'value1');
  map.set('prop2', 'value2');
  map.set('prop3', 'value3');
  return map.get('prop1') + map.get('prop2') + map.get('prop3');
});

// Запускаем все бенчмарки
run();
