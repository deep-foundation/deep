/**
 * Тесты производительности для методов доступа к данным gets.js
 */

import { bench, run, group } from 'mitata';
import { deep } from './index.js';

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

// Добавим специальный флаг для вывода в JSON
const isJsonOutput = process.argv.includes('--json');

// Группа тестов forEach
group('forEach', () => {
  bench('Array.forEach (нативный)', () => {
    let sum = 0;
    testArray.forEach(i => sum += i);
    return sum;
  });

  bench('deep(Array).forEach', () => {
    let sum = 0;
    deepArray.forEach(i => sum += i);
    return sum;
  });

  bench('Object.values + forEach (нативный)', () => {
    let sum = 0;
    Object.values(testObject).forEach(i => sum += i);
    return sum;
  });

  bench('deep(Object).forEach', () => {
    let sum = 0;
    deepObject.forEach(i => sum += i);
    return sum;
  });

  bench('String[Symbol.iterator] (нативный)', () => {
    let result = '';
    for (const char of testString) {
      result += char;
    }
    return result;
  });

  bench('deep(String).forEach', () => {
    let result = '';
    deepString.forEach(char => {
      result += char;
    });
    return result;
  });

  bench('Map.forEach (нативный)', () => {
    let sum = 0;
    testMap.forEach(i => sum += i);
    return sum;
  });

  bench('deep(Map).forEach', () => {
    let sum = 0;
    deepMap.forEach(i => sum += i);
    return sum;
  });

  bench('Set.forEach (нативный)', () => {
    let sum = 0;
    testSet.forEach(i => sum += i);
    return sum;
  });

  bench('deep(Set).forEach', () => {
    let sum = 0;
    deepSet.forEach(i => sum += i);
    return sum;
  });
});

// Группа тестов map
group('map', () => {
  bench('Array.map (нативный)', () => {
    return testArray.map(i => i * 2);
  });

  bench('deep(Array).map', () => {
    return deepArray.map(i => i * 2);
  });

  bench('Object.values + map (нативный)', () => {
    return Object.values(testObject).map(i => i * 2);
  });

  bench('deep(Object).map', () => {
    return deepObject.map(i => i * 2);
  });

  bench('String.split + map + join (нативный)', () => {
    return testString.split('').map(c => c.toUpperCase()).join('');
  });

  bench('deep(String).map', () => {
    return deepString.map(c => c.toUpperCase());
  });
});

// Группа тестов filter
group('filter', () => {
  bench('Array.filter (нативный)', () => {
    return testArray.filter(i => i % 2 === 0);
  });

  bench('deep(Array).filter', () => {
    return deepArray.filter(i => i % 2 === 0);
  });

  bench('Object.values + filter (нативный)', () => {
    return Object.values(testObject).filter(i => i % 2 === 0);
  });

  bench('deep(Object).filter', () => {
    return deepObject.filter(i => i % 2 === 0);
  });
});

// Группа тестов reduce
group('reduce', () => {
  bench('Array.reduce (нативный)', () => {
    return testArray.reduce((acc, i) => acc + i, 0);
  });

  bench('deep(Array).reduce', () => {
    return deepArray.reduce((acc, i) => acc + i, 0);
  });

  bench('Object.values + reduce (нативный)', () => {
    return Object.values(testObject).reduce((acc, i) => acc + i, 0);
  });

  bench('deep(Object).reduce', () => {
    return deepObject.reduce((acc, i) => acc + i, 0);
  });
});

// Группа тестов для find
group('find', () => {
  bench('Array.find (нативный)', () => {
    return testArray.find(i => i === 500);
  });

  bench('deep(Array).find', () => {
    return deepArray.find(i => i === 500);
  });

  bench('Object.values + find (нативный)', () => {
    return Object.values(testObject).find(i => i === 50);
  });

  bench('deep(Object).find', () => {
    return deepObject.find(i => i === 50);
  });
});

// Группа тестов every/some
group('every/some', () => {
  bench('Array.every (нативный)', () => {
    return testArray.every(i => i >= 0);
  });

  bench('deep(Array).every', () => {
    return deepArray.every(i => i >= 0);
  });

  bench('Array.some (нативный)', () => {
    return testArray.some(i => i === 500);
  });

  bench('deep(Array).some', () => {
    return deepArray.some(i => i === 500);
  });
});

// Группа тестов keys/values/entries
group('keys/values/entries', () => {
  bench('Object.keys (нативный)', () => {
    return Object.keys(testObject);
  });

  bench('deep(Object).keys', () => {
    return deepObject.keys();
  });

  bench('Object.values (нативный)', () => {
    return Object.values(testObject);
  });

  bench('deep(Object).values', () => {
    return deepObject.values();
  });

  bench('Object.entries (нативный)', () => {
    return Object.entries(testObject);
  });

  bench('deep(Object).entries', () => {
    return deepObject.entries();
  });
});

// Группа тестов join
group('join', () => {
  bench('Array.join (нативный)', () => {
    return testArray.join(',');
  });

  bench('deep(Array).join', () => {
    return deepArray.join(',');
  });

  bench('Object.values + join (нативный)', () => {
    return Object.values(testObject).join(',');
  });

  bench('deep(Object).join', () => {
    return deepObject.join(',');
  });
});

// Запускаем бенчмарки
if (isJsonOutput) {
  const results = await run({ json: true });
  console.log(JSON.stringify(results, null, 2));
} else {
  await run();
}
