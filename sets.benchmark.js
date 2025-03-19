/**
 * Тесты производительности для методов модификации sets.js
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
const deepArray = deep(testArray.slice());
const deepObject = deep({...testObject});
const deepMap = deep(new Map(testMap));
const deepSet = deep(new Set(testSet));

// Добавим специальный флаг для вывода в JSON
const isJsonOutput = process.argv.includes('--json');

// Группа тестов set
group('set', () => {
  bench('Object.property = value (нативный)', () => {
    const obj = {...testObject};
    obj.newKey = 'newValue';
    return obj;
  });

  bench('deep(Object).set', () => {
    const obj = {...testObject};
    deep(obj).set('newKey', 'newValue');
    return obj;
  });

  bench('Array[index] = value (нативный)', () => {
    const arr = testArray.slice();
    arr[500] = 'newValue';
    return arr;
  });

  bench('deep(Array).set', () => {
    const arr = testArray.slice();
    deep(arr).set(500, 'newValue');
    return arr;
  });

  bench('Map.set (нативный)', () => {
    const map = new Map(testMap);
    map.set('newKey', 'newValue');
    return map;
  });

  bench('deep(Map).mapSet', () => {
    const map = new Map(testMap);
    deep(map).mapSet('newKey', 'newValue');
    return map;
  });
});

// Группа тестов delete
group('delete', () => {
  bench('delete Object.property (нативный)', () => {
    const obj = {...testObject};
    delete obj.key50;
    return obj;
  });

  bench('deep(Object).delete', () => {
    const obj = {...testObject};
    deep(obj).delete('key50');
    return obj;
  });

  bench('Map.delete (нативный)', () => {
    const map = new Map(testMap);
    map.delete('key50');
    return map;
  });

  bench('deep(Map).mapDelete', () => {
    const map = new Map(testMap);
    deep(map).mapDelete('key50');
    return map;
  });

  bench('Set.delete (нативный)', () => {
    const set = new Set(testSet);
    set.delete(50);
    return set;
  });

  bench('deep(Set).setDelete', () => {
    const set = new Set(testSet);
    deep(set).setDelete(50);
    return set;
  });
});

// Группа тестов для методов массивов
group('Array.methods', () => {
  bench('Array.push (нативный)', () => {
    const arr = testArray.slice();
    arr.push(1000, 1001);
    return arr;
  });

  bench('deep(Array).push', () => {
    const arr = testArray.slice();
    deep(arr).push(1000, 1001);
    return arr;
  });

  bench('Array.pop (нативный)', () => {
    const arr = testArray.slice();
    arr.pop();
    return arr;
  });

  bench('deep(Array).pop', () => {
    const arr = testArray.slice();
    deep(arr).pop();
    return arr;
  });

  bench('Array.splice (нативный)', () => {
    const arr = testArray.slice();
    arr.splice(50, 2, 'a', 'b');
    return arr;
  });

  bench('deep(Array).splice', () => {
    const arr = testArray.slice();
    deep(arr).splice(50, 2, 'a', 'b');
    return arr;
  });

  bench('Array.reverse (нативный)', () => {
    const arr = testArray.slice();
    arr.reverse();
    return arr;
  });

  bench('deep(Array).reverse', () => {
    const arr = testArray.slice();
    deep(arr).reverse();
    return arr;
  });
});

// Группа тестов для clear
group('clear', () => {
  bench('Object.keys().forEach(key => delete) (нативный)', () => {
    const obj = {...testObject};
    Object.keys(obj).forEach(key => delete obj[key]);
    return obj;
  });

  bench('deep(Object).clear', () => {
    const obj = {...testObject};
    deep(obj).clear();
    return obj;
  });

  bench('Array.length = 0 (нативный)', () => {
    const arr = testArray.slice();
    arr.length = 0;
    return arr;
  });

  bench('deep(Array).clear', () => {
    const arr = testArray.slice();
    deep(arr).clear();
    return arr;
  });

  bench('Map.clear (нативный)', () => {
    const map = new Map(testMap);
    map.clear();
    return map;
  });

  bench('deep(Map).clear', () => {
    const map = new Map(testMap);
    deep(map).clear();
    return map;
  });

  bench('Set.clear (нативный)', () => {
    const set = new Set(testSet);
    set.clear();
    return set;
  });

  bench('deep(Set).clear', () => {
    const set = new Set(testSet);
    deep(set).clear();
    return set;
  });
});

// Группа тестов для композитных методов
group('Composite', () => {
  bench('Object.assign (нативный)', () => {
    const obj = {...testObject};
    Object.assign(obj, { newKey1: 'value1', newKey2: 'value2' });
    return obj;
  });

  bench('deep(Object).assign', () => {
    const obj = {...testObject};
    deep(obj).assign({ newKey1: 'value1', newKey2: 'value2' });
    return obj;
  });

  bench('deep(Object).merge', () => {
    const obj = {...testObject};
    deep(obj).merge({ newKey1: 'value1', newKey2: 'value2' });
    return obj;
  });

  bench('deep(Array).merge с массивом', () => {
    const arr = testArray.slice();
    deep(arr).merge([1000, 1001, 1002]);
    return arr;
  });
});

// Тесты для defineProperty
group('defineProperty', () => {
  bench('Object.defineProperty (нативный)', () => {
    const obj = {...testObject};
    Object.defineProperty(obj, 'newProp', {
      value: 42,
      writable: false,
      enumerable: true
    });
    return obj;
  });

  bench('deep(Object).defineProperty', () => {
    const obj = {...testObject};
    deep(obj).defineProperty('newProp', {
      value: 42,
      writable: false,
      enumerable: true
    });
    return obj;
  });
});

// Тесты для create
group('create', () => {
  bench('Object.create (нативный)', () => {
    const proto = { commonMethod() { return 'test'; } };
    return Object.create(proto);
  });

  bench('deep.create', () => {
    const proto = { commonMethod() { return 'test'; } };
    return deep.create(proto);
  });

  bench('Object.create c дескрипторами (нативный)', () => {
    const proto = { commonMethod() { return 'test'; } };
    return Object.create(proto, {
      prop1: { value: 1, enumerable: true },
      prop2: { value: 2, enumerable: true }
    });
  });

  bench('deep.create c свойствами', () => {
    const proto = { commonMethod() { return 'test'; } };
    return deep.create(proto, { prop1: 1, prop2: 2 });
  });
});

// Тесты для clone
group('clone', () => {
  bench('Object spread {...obj} (нативный)', () => {
    const obj = {...testObject};
    return {...obj};
  });

  bench('deep(Object).clone', () => {
    const obj = {...testObject};
    return deep(obj).clone();
  });

  bench('Array slice (нативный)', () => {
    const arr = testArray.slice();
    return arr.slice();
  });

  bench('deep(Array).clone', () => {
    const arr = testArray.slice();
    return deep(arr).clone();
  });

  bench('new Map(map) (нативный)', () => {
    const map = new Map(testMap);
    return new Map(map);
  });

  bench('deep(Map).clone', () => {
    const map = new Map(testMap);
    return deep(map).clone();
  });
});

// Тесты для базовых методов из sets/basic.js
group('add/remove/has/get', () => {
  bench('Array.push (нативный)', () => {
    const arr = testArray.slice();
    arr.push(1000);
    return arr;
  });

  bench('deep(Array).add', () => {
    const arr = testArray.slice();
    deep(arr).add(1000);
    return arr;
  });

  bench('Array.splice для удаления (нативный)', () => {
    const arr = testArray.slice();
    arr.splice(50, 1);
    return arr;
  });

  bench('deep(Array).remove', () => {
    const arr = testArray.slice();
    deep(arr).remove(50);
    return arr;
  });

  bench('Array.includes (нативный)', () => {
    const arr = testArray.slice();
    return arr.includes(500);
  });

  bench('deep(Array).has', () => {
    const arr = testArray.slice();
    return deep(arr).has(500);
  });

  bench('Array[index] (нативный)', () => {
    const arr = testArray.slice();
    return arr[500];
  });

  bench('deep(Array).get', () => {
    const arr = testArray.slice();
    return deep(arr).get(500);
  });
});

// Тесты для keys, values, entries
group('keys/values/entries', () => {
  bench('Object.keys (нативный)', () => {
    return Object.keys(testObject);
  });

  bench('deep(Object).keys', () => {
    return deep(testObject).keys();
  });

  bench('Object.values (нативный)', () => {
    return Object.values(testObject);
  });

  bench('deep(Object).values', () => {
    return deep(testObject).values();
  });

  bench('Object.entries (нативный)', () => {
    return Object.entries(testObject);
  });

  bench('deep(Object).entries', () => {
    return deep(testObject).entries();
  });
});

// Тесты для convert
group('convert', () => {
  const testMapSmall = new Map([['a', 1], ['b', 2], ['c', 3]]);
  const testArraySmall = [1, 2, 3, 4, 5];
  const testObjectSmall = { a: 1, b: 2, c: 3 };

  bench('Array.from(map.entries()) (нативный)', () => {
    return Array.from(testMapSmall.entries());
  });

  bench('deep(Map).convert("array")', () => {
    return deep(testMap).convert('array');
  });

  bench('Object.fromEntries(map) (нативный)', () => {
    return Object.fromEntries(testMapSmall);
  });

  bench('deep(Map).convert("object")', () => {
    return deep(testMap).convert('object');
  });

  bench('new Set(array) (нативный)', () => {
    return new Set(testArraySmall);
  });

  bench('deep(Array).convert("set")', () => {
    return deep(testArray).convert('set');
  });

  bench('JSON.stringify(obj) (нативный)', () => {
    return JSON.stringify(testObjectSmall);
  });

  bench('deep(Object).convert("json")', () => {
    return deep(testObject).convert('json');
  });
});

// Тесты для кеширования функций
group('Function caching', () => {
  bench('Первый доступ к глубокому методу', () => {
    const a = deep({});
    return a.set;
  });

  bench('Второй доступ к глубокому методу (кеширование)', () => {
    const a = deep({});
    const f1 = a.set;  // Первый доступ
    return a.set;      // Второй доступ (должен быть кеширован)
  });

  bench('Многократный вызов метода', () => {
    const a = deep({});
    for (let i = 0; i < 10; i++) {
      a.set(`key${i}`, i);
    }
    return a;
  });
});

// Запускаем все бенчмарки
run({
  avg: true,
  json: isJsonOutput
});
