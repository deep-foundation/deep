/**
 * Тесты производительности для модуля many.js
 */

import { bench, run, group } from 'mitata';
import { deep } from './index.js';
import { difference, intersection, symmetricDifference } from './many.js';

// Подготавливаем тестовые данные разных типов
// Небольшие коллекции для простых тестов
const smallSet1 = new Set([1, 2, 3, 4, 5]);
const smallSet2 = new Set([4, 5, 6, 7, 8]);
const smallArray1 = [1, 2, 3, 4, 5];
const smallArray2 = [4, 5, 6, 7, 8];
const smallMap1 = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
const smallMap2 = new Map([['d', 4], ['e', 5], ['f', 6], ['g', 7], ['h', 8]]);
const smallObject1 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
const smallObject2 = { d: 4, e: 5, f: 6, g: 7, h: 8 };

// Большие коллекции для тестов производительности
const largeSet1 = new Set(Array.from({ length: 1000 }, (_, i) => i));
const largeSet2 = new Set(Array.from({ length: 1000 }, (_, i) => i + 500));
const largeArray1 = Array.from({ length: 1000 }, (_, i) => i);
const largeArray2 = Array.from({ length: 1000 }, (_, i) => i + 500);

// Добавим специальный флаг для вывода в JSON
const isJsonOutput = process.argv.includes('--json');

// Реализуем нативный метод разности множеств для сравнения
function nativeSetDifference(set1, set2) {
  const result = new Set();
  for (const item of set1) {
    if (!set2.has(item)) {
      result.add(item);
    }
  }
  return result;
}

// Реализуем нативный метод разности массивов для сравнения
function nativeArrayDifference(array1, array2) {
  return array1.filter(item => !array2.includes(item));
}

// Добавляем функции для вычисления пересечения множеств
const nativeSetIntersection = (setA, setB) => {
  const result = new Set();
  for (const item of setA) {
    if (setB.has(item)) {
      result.add(item);
    }
  }
  return result;
};

const nativeArrayIntersection = (arrA, arrB) => {
  return arrA.filter(item => arrB.includes(item));
};

// Нативная функция для симметрической разности множеств
function nativeSetSymmetricDifference(set1, set2) {
  const result = new Set(set1);

  // Для элементов из второго множества:
  // - Если элемент уже есть в результате, удаляем его
  // - Если элемента нет в результате, добавляем его
  for (const item of set2) {
    if (result.has(item)) {
      result.delete(item);
    } else {
      result.add(item);
    }
  }

  return result;
}

// Нативная функция для симметрической разности массивов
function nativeArraySymmetricDifference(array1, array2) {
  const temp = new Set();

  // Добавляем все элементы из первого массива
  for (const item of array1) {
    temp.add(item);
  }

  // Для элементов из второго массива:
  // - Если элемент уже есть в результате, удаляем его
  // - Если элемента нет в результате, добавляем его
  for (const item of array2) {
    if (temp.has(item)) {
      temp.delete(item);
    } else {
      temp.add(item);
    }
  }

  return Array.from(temp);
}

// Группа тестов для сравнения difference с нативными методами на небольших коллекциях
group('difference vs нативные методы (небольшие коллекции)', () => {
  // Set
  bench('deep(set1).difference(set2) - маленькие множества', () => {
    return deep(smallSet1).difference(smallSet2).this;
  });

  bench('Нативная разность множеств (Set) - маленькие множества', () => {
    nativeSetDifference(smallSet1, smallSet2);
  });

  // Array
  bench('deep(array1).difference(array2) - маленькие массивы', () => {
    return deep(smallArray1).difference(smallArray2).this;
  });

  bench('Нативная разность массивов (Array) - маленькие массивы', () => {
    nativeArrayDifference(smallArray1, smallArray2);
  });

  // Map
  bench('deep(map1).difference(map2) - маленькие Map', () => {
    return deep(smallMap1).difference(smallMap2).this;
  });

  // Object
  bench('deep(object1).difference(object2) - маленькие объекты', () => {
    return deep(smallObject1).difference(smallObject2).this;
  });
});

// Группа тестов для сравнения difference с нативными методами на больших коллекциях
group('difference vs нативные методы (большие коллекции)', () => {
  // Set
  bench('deep(set1).difference(set2) - большие множества', () => {
    return deep(largeSet1).difference(largeSet2).this;
  });

  bench('Нативная разность множеств (Set) - большие множества', () => {
    nativeSetDifference(largeSet1, largeSet2);
  });

  // Array
  bench('deep(array1).difference(array2) - большие массивы', () => {
    return deep(largeArray1).difference(largeArray2).this;
  });

  bench('Нативная разность массивов (Array) - большие массивы', () => {
    nativeArrayDifference(largeArray1, largeArray2);
  });
});

// Группа тестов для сравнения difference между разными типами
group('difference между разными типами данных', () => {
  // Set с разными типами
  bench('deep(set).difference(array)', () => {
    return deep(smallSet1).difference(smallArray2).this;
  });

  bench('deep(set).difference(map)', () => {
    return deep(smallSet1).difference(smallMap2).this;
  });

  bench('deep(set).difference(object)', () => {
    return deep(smallSet1).difference(smallObject2).this;
  });

  // Array с разными типами
  bench('deep(array).difference(set)', () => {
    return deep(smallArray1).difference(smallSet2).this;
  });

  bench('deep(array).difference(map)', () => {
    return deep(smallArray1).difference(smallMap2).this;
  });

  bench('deep(array).difference(object)', () => {
    return deep(smallArray1).difference(smallObject2).this;
  });
});

// Группа тестов для сравнения примитивов и singleton значений
group('difference с примитивами', () => {
  bench('deep(5).difference(10)', () => {
    return deep(5).difference(10).this;
  });

  bench('deep(5).difference(5)', () => {
    return deep(5).difference(5).this;
  });

  bench('deep(5).difference([1,2,3])', () => {
    return deep(5).difference([1,2,3]).this;
  });

  bench('deep(5).difference([1,5,10])', () => {
    return deep(5).difference([1,5,10]).this;
  });
});

// Группа тестов для сравнения intersection для небольших коллекций
group('Малые коллекции', () => {
  bench('Пересечение Set-Set (нативный метод)', () => {
    nativeSetIntersection(smallSet1, smallSet2);
  });

  bench('Пересечение Set-Set (deep метод)', () => {
    deep(smallSet1).intersection(smallSet2);
  });

  bench('Пересечение Array-Array (нативный метод)', () => {
    nativeArrayIntersection(smallArray1, smallArray2);
  });

  bench('Пересечение Array-Array (deep метод)', () => {
    deep(smallArray1).intersection(smallArray2);
  });
});

// Группа тестов для сравнения intersection для больших коллекций
group('Большие коллекции', () => {
  bench('Пересечение Set-Set (нативный метод)', () => {
    nativeSetIntersection(largeSet1, largeSet2);
  });

  bench('Пересечение Set-Set (deep метод)', () => {
    deep(largeSet1).intersection(largeSet2);
  });

  bench('Пересечение Array-Array (нативный метод)', () => {
    nativeArrayIntersection(largeArray1, largeArray2);
  });

  bench('Пересечение Array-Array (deep метод)', () => {
    deep(largeArray1).intersection(largeArray2);
  });
});

// Группа тестов для сравнения пересечения между разными типами данных
group('Пересечение разных типов данных', () => {
  bench('Пересечение Set-Array', () => {
    deep(smallSet1).intersection(smallArray2);
  });

  bench('Пересечение Array-Set', () => {
    deep(smallArray1).intersection(smallSet2);
  });

  bench('Пересечение Map-Object', () => {
    deep(smallMap1).intersection(smallObject2);
  });

  bench('Пересечение Object-Map', () => {
    deep(smallObject1).intersection(smallMap2);
  });
});

// Группа тестов для сравнения симметрической разности на небольших коллекциях
group('• Симметрическая разность vs нативные методы (небольшие коллекции)', () => {
  bench('deep(set1).symmetricDifference(set2) - маленькие множества', () => {
    deep(smallSet1).symmetricDifference(smallSet2);
  });

  bench('Нативная симметрическая разность множеств (Set) - маленькие множества', () => {
    nativeSetSymmetricDifference(smallSet1, smallSet2);
  });

  bench('deep(array1).symmetricDifference(array2) - маленькие массивы', () => {
    deep(smallArray1).symmetricDifference(smallArray2);
  });

  bench('Нативная симметрическая разность массивов (Array) - маленькие массивы', () => {
    nativeArraySymmetricDifference(smallArray1, smallArray2);
  });

  bench('deep(map1).symmetricDifference(map2) - маленькие Map', () => {
    deep(smallMap1).symmetricDifference(smallMap2);
  });

  bench('deep(object1).symmetricDifference(object2) - маленькие объекты', () => {
    deep(smallObject1).symmetricDifference(smallObject2);
  });
});

// Группа тестов для сравнения симметрической разности на больших коллекциях
group('• Симметрическая разность vs нативные методы (большие коллекции)', () => {
  bench('deep(set1).symmetricDifference(set2) - большие множества', () => {
    deep(largeSet1).symmetricDifference(largeSet2);
  });

  bench('Нативная симметрическая разность множеств (Set) - большие множества', () => {
    nativeSetSymmetricDifference(largeSet1, largeSet2);
  });

  bench('deep(array1).symmetricDifference(array2) - большие массивы', () => {
    deep(largeArray1).symmetricDifference(largeArray2);
  });

  bench('Нативная симметрическая разность массивов (Array) - большие массивы', () => {
    nativeArraySymmetricDifference(largeArray1, largeArray2);
  });
});

// Группа тестов для сравнения симметрической разности между разными типами данных
group('• Симметрическая разность между разными типами данных', () => {
  bench('deep(set).symmetricDifference(array)', () => {
    deep(smallSet1).symmetricDifference(smallArray2);
  });

  bench('deep(set).symmetricDifference(map)', () => {
    deep(smallSet1).symmetricDifference(smallMap2);
  });

  bench('deep(set).symmetricDifference(object)', () => {
    deep(smallSet1).symmetricDifference(smallObject2);
  });

  bench('deep(array).symmetricDifference(set)', () => {
    deep(smallArray1).symmetricDifference(smallSet2);
  });

  bench('deep(array).symmetricDifference(map)', () => {
    deep(smallArray1).symmetricDifference(smallMap2);
  });

  bench('deep(array).symmetricDifference(object)', () => {
    deep(smallArray1).symmetricDifference(smallObject2);
  });
});

// Группа тестов для сравнения симметрической разности с примитивами
group('• Симметрическая разность с примитивами', () => {
  bench('deep(5).symmetricDifference(10)', () => {
    deep(5).symmetricDifference(10);
  });

  bench('deep(5).symmetricDifference(5)', () => {
    deep(5).symmetricDifference(5);
  });

  bench('deep(5).symmetricDifference([1,2,3])', () => {
    deep(5).symmetricDifference([1,2,3]);
  });

  bench('deep(5).symmetricDifference([1,5,10])', () => {
    deep(5).symmetricDifference([1,5,10]);
  });
});

// Запуск тестов производительности
run({
  avg: true,
  json: isJsonOutput,
});
