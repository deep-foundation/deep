/**
 * Бенчмарки для модуля track.js
 */

import { deep } from './index.js';
import Benchmarkify from 'benchmarkify';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Track.js Benchmarks').printHeader();

// Подготавливаем данные для тестов
const smallArray = Array.from({ length: 100 }, (_, i) => i);
const smallSet = new Set(smallArray);
const smallMap = new Map(smallArray.map((v, i) => [`key${i}`, v]));
const smallObj = Object.fromEntries(smallArray.map((v, i) => [`key${i}`, v]));

// Функция для создания цепочки зависимостей
function createChain(source, length) {
  let current = source;
  const chain = [current];

  for (let i = 0; i < length; i++) {
    current = current.map(x => x * 2);
    chain.push(current);
  }

  return chain;
}

// Функция для создания параллельных зависимостей
function createParallel(source, count) {
  const deps = [];
  for (let i = 0; i < count; i++) {
    deps.push(source.map(x => x * (i + 1)));
  }
  return deps;
}

// Создаем бенчмарки для каждого типа данных
const dataTypes = [
  {
    name: 'Array',
    source: smallArray,
    create: deep,
    modify: (source) => source.push(100),
    check: (dep) => dep.this.length === 101
  },
  {
    name: 'Set',
    source: smallSet,
    create: deep,
    modify: (source) => source.add(100),
    check: (dep) => dep.this.length === 101
  },
  {
    name: 'Map',
    source: smallMap,
    create: deep,
    modify: (source) => source.set('key100', 100),
    check: (dep) => dep.this.size === 101
  },
  {
    name: 'Object',
    source: smallObj,
    create: deep,
    modify: (source) => source.key100 = 100,
    check: (dep) => Object.keys(deps[0].this).length === 101
  }
];

// Создаем бенчмарки для каждого типа данных
dataTypes.forEach(({ name, source, create, modify, check }) => {
  // Бенчмарк для параллельных зависимостей
  benchmark.createSuite(`parallel dependencies (${name})`)
    .add('1 dependency', () => {
      const src = create(source);
      const deps = createParallel(src, 1);
      modify(src);
      return check(deps[0]);
    })
    .add('2 dependencies', () => {
      const src = create(source);
      const deps = createParallel(src, 2);
      modify(src);
      return check(deps[0]);
    })
    .add('3 dependencies', () => {
      const src = create(source);
      const deps = createParallel(src, 3);
      modify(src);
      return check(deps[0]);
    })
    .add('4 dependencies', () => {
      const src = create(source);
      const deps = createParallel(src, 4);
      modify(src);
      return check(deps[0]);
    })
    .add('5 dependencies', () => {
      const src = create(source);
      const deps = createParallel(src, 5);
      modify(src);
      return check(deps[0]);
    })
    .add('6 dependencies', () => {
      const src = create(source);
      const deps = createParallel(src, 6);
      modify(src);
      return check(deps[0]);
    })
    .add('7 dependencies', () => {
      const src = create(source);
      const deps = createParallel(src, 7);
      modify(src);
      return check(deps[0]);
    });

  // Бенчмарк для цепочек зависимостей
  benchmark.createSuite(`chain dependencies (${name})`)
    .add('chain length 1', () => {
      const src = create(source);
      const chain = createChain(src, 1);
      modify(src);
      return check(chain[1]);
    })
    .add('chain length 2', () => {
      const src = create(source);
      const chain = createChain(src, 2);
      modify(src);
      return check(chain[2]);
    })
    .add('chain length 3', () => {
      const src = create(source);
      const chain = createChain(src, 3);
      modify(src);
      return check(chain[3]);
    })
    .add('chain length 4', () => {
      const src = create(source);
      const chain = createChain(src, 4);
      modify(src);
      return check(chain[4]);
    })
    .add('chain length 5', () => {
      const src = create(source);
      const chain = createChain(src, 5);
      modify(src);
      return check(chain[5]);
    })
    .add('chain length 6', () => {
      const src = create(source);
      const chain = createChain(src, 6);
      modify(src);
      return check(chain[6]);
    })
    .add('chain length 7', () => {
      const src = create(source);
      const chain = createChain(src, 7);
      modify(src);
      return check(chain[7]);
    });
});

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🚀 Запуск бенчмарков...\n');
  await benchmark.run();
}

runBenchmarks();
