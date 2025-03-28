/**
 * Тесты производительности для методов доступа к данным gets.js
 */

import { deep } from './index.js';
import Benchmarkify from 'benchmarkify';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Gets.js Benchmarks');
benchmark.printHeader();

// Подготавливаем тестовые данные
const testArray = Array.from({ length: 1000 }, (_, i) => i);
const testObject = Object.fromEntries(testArray.slice(0, 100).map(i => [`key${i}`, i]));
const testString = 'a'.repeat(100);
const testMap = new Map(testArray.slice(0, 100).map(i => [`key${i}`, i]));
const testSet = new Set(testArray.slice(0, 100));

// Упаковываем тестовые данные в deep
const deepArray = deep(testArray);
const deepObject = deep(testObject);
const deepString = deep(testString);
const deepMap = deep(testMap);
const deepSet = deep(testSet);

// Создаем сьют для методов forEach
const forEachSuite = benchmark.createSuite('forEach', {
  spinner: false
});

forEachSuite
  .add('Array.forEach (нативный)', () => {
    let sum = 0;
    testArray.forEach(i => sum += i);
    return sum;
  })
  .add('deep(Array).forEach', () => {
    let sum = 0;
    deepArray.forEach(i => sum += i);
    return sum;
  })
  .add('Object.values + forEach (нативный)', () => {
    let sum = 0;
    Object.values(testObject).forEach(i => sum += i);
    return sum;
  })
  .add('deep(Object).forEach', () => {
    let sum = 0;
    deepObject.forEach(i => sum += i);
    return sum;
  })
  .add('String[Symbol.iterator] (нативный)', () => {
    let result = '';
    for (const char of testString) {
      result += char;
    }
    return result;
  })
  .add('deep(String).forEach', () => {
    let result = '';
    deepString.forEach(char => {
      result += char;
    });
    return result;
  })
  .add('Map.forEach (нативный)', () => {
    let sum = 0;
    testMap.forEach(i => sum += i);
    return sum;
  })
  .add('deep(Map).forEach', () => {
    let sum = 0;
    deepMap.forEach(i => sum += i);
    return sum;
  })
  .add('Set.forEach (нативный)', () => {
    let sum = 0;
    testSet.forEach(i => sum += i);
    return sum;
  })
  .add('deep(Set).forEach', () => {
    let sum = 0;
    deepSet.forEach(i => sum += i);
    return sum;
  });

// Создаем сьют для методов map
const mapSuite = benchmark.createSuite('map', {
  spinner: false
});

mapSuite
  .add('Array.map (нативный)', () => {
    return testArray.map(i => i * 2);
  })
  .add('deep(Array).map', () => {
    return deepArray.map(i => i * 2);
  })
  .add('Object.values + map (нативный)', () => {
    return Object.values(testObject).map(i => i * 2);
  })
  .add('deep(Object).map', () => {
    return deepObject.map(i => i * 2);
  })
  .add('String.split + map + join (нативный)', () => {
    return testString.split('').map(c => c.toUpperCase()).join('');
  })
  .add('deep(String).map', () => {
    return deepString.map(c => c.toUpperCase());
  });

// Создаем сьют для методов filter
const filterSuite = benchmark.createSuite('filter', {
  spinner: false
});

filterSuite
  .add('Array.filter (нативный)', () => {
    return testArray.filter(i => i % 2 === 0);
  })
  .add('deep(Array).filter', () => {
    return deepArray.filter(i => i % 2 === 0);
  })
  .add('Object.values + filter (нативный)', () => {
    return Object.values(testObject).filter(i => i % 2 === 0);
  })
  .add('deep(Object).filter', () => {
    return deepObject.filter(i => i % 2 === 0);
  });

// Создаем сьют для методов reduce
const reduceSuite = benchmark.createSuite('reduce', {
  spinner: false
});

reduceSuite
  .add('Array.reduce (нативный)', () => {
    return testArray.reduce((acc, i) => acc + i, 0);
  })
  .add('deep(Array).reduce', () => {
    return deepArray.reduce((acc, i) => acc + i, 0);
  })
  .add('Object.values + reduce (нативный)', () => {
    return Object.values(testObject).reduce((acc, i) => acc + i, 0);
  })
  .add('deep(Object).reduce', () => {
    return deepObject.reduce((acc, i) => acc + i, 0);
  });

// Создаем сьют для методов find
const findSuite = benchmark.createSuite('find', {
  spinner: false
});

findSuite
  .add('Array.find (нативный)', () => {
    return testArray.find(i => i === 500);
  })
  .add('deep(Array).find', () => {
    return deepArray.find(i => i === 500);
  })
  .add('Object.values + find (нативный)', () => {
    return Object.values(testObject).find(i => i === 50);
  })
  .add('deep(Object).find', () => {
    return deepObject.find(i => i === 50);
  });

// Создаем сьют для методов every/some
const everySomeSuite = benchmark.createSuite('every/some', {
  spinner: false
});

everySomeSuite
  .add('Array.every (нативный)', () => {
    return testArray.every(i => i >= 0);
  })
  .add('deep(Array).every', () => {
    return deepArray.every(i => i >= 0);
  })
  .add('Array.some (нативный)', () => {
    return testArray.some(i => i === 500);
  })
  .add('deep(Array).some', () => {
    return deepArray.some(i => i === 500);
  });

// Создаем сьют для методов keys/values/entries
const keysSuite = benchmark.createSuite('keys/values/entries', {
  spinner: false
});

keysSuite
  .add('Object.keys (нативный)', () => {
    return Object.keys(testObject);
  })
  .add('deep(Object).keys', () => {
    return deepObject.keys();
  })
  .add('Object.values (нативный)', () => {
    return Object.values(testObject);
  })
  .add('deep(Object).values', () => {
    return deepObject.values();
  })
  .add('Object.entries (нативный)', () => {
    return Object.entries(testObject);
  })
  .add('deep(Object).entries', () => {
    return deepObject.entries();
  });

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('');
  console.log('🚀 Запуск бенчмарков...');
  console.log('');

  await benchmark.run();

  console.log('');
  console.log('Все бенчмарки завершены.');
}

runBenchmarks().catch(err => {
  console.error('Ошибка при выполнении бенчмарков:', err);
  process.exit(1);
});
