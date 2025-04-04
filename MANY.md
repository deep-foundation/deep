# Many

Модуль `many.js` предоставляет универсальные операции над множествами, работающие с различными типами данных в JavaScript. Он расширяет функциональность стандартных структур данных, обеспечивая единый интерфейс для выполнения теоретико-множественных операций.

[Результаты бенчмарков →](./MANY.benchmark.md)

## Интеграция с Association

Все методы модуля `many.js` автоматически добавляются в `Association._proxy`, что делает их доступными через свойства экземпляров `Association`:

```javascript
import { deep } from 'deep7';
const result = deep(set1).difference(set2);
```

## Стандарт unwrap/wrap

Все методы в модуле `many.js` следуют стандарту unwrap/wrap:

1. **Входящие данные**: Все входящие аргументы предварительно разворачиваются через `ass.unwrap(something)`, что позволяет передавать как обычные значения, так и ассоциации.
2. **Возвращаемые данные**: Все возвращаемые значения оборачиваются через `ass.wrap(result)` перед возвратом, что гарантирует, что результат всегда является ассоциацией.

Это обеспечивает согласованный интерфейс и возможность цепочки вызовов методов:

```javascript
// Поддерживается передача как обычных значений, так и ассоциаций
const set1 = new Set([1, 2, 3, 4]);
const set2 = deep(new Set([3, 4, 5, 6]));

// Результат - ассоциация, что позволяет создавать цепочки вызовов
const result = deep(set1).difference(set2).union(new Set([7, 8]));
```

## Основные особенности

1. Методы работают с разными типами данных:
   - Set и Array (результат всегда Set)
   - Map и Object (результат всегда Map)
2. Методы возвращают новые экземпляры Set или Map, обернутые в Association
3. Методы не модифицируют исходные данные
4. Методы поддерживают цепочки вызовов
5. Методы интегрированы с системой отслеживания изменений
6. Методы поддерживают множественные аргументы, применяя операции последовательно

## Совместимость методов с типами данных

| Метод | undefined | null | array | set | map | weakmap | weakset | date | object | string | number | boolean | symbol | bigint | function |
|-------|-----------|------|-------|-----|-----|---------|---------|------|---------|---------|---------|----------|---------|---------|-----------|
| difference | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| intersection | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| symmetricDifference | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| union | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Поддерживаемые типы данных

Модуль работает со следующими типами данных:
- `Set` (результат операций - Set)
- `Array` (результат операций - Set)
- `Map` (результат операций - Map)
- `Object` (результат операций - Map)

Для определения типа данных используются геттеры `isSet`, `isArray`, `isObject`, `isMap`.

## Правила преобразования типов

1. Array/Set группа:
   - Array → Set (автоматическое преобразование)
   - Set → Set (без преобразования)

2. Object/Map группа:
   - Object → Map (автоматическое преобразование через Object.entries)
   - Map → Map (без преобразования)

## Операции над множествами

### difference(...otherSets)

Возвращает новое множество, содержащее элементы из текущего множества, которые отсутствуют во всех других множествах.

**Аргументы:**
- `...otherSets` - одно или несколько других множеств (Set, Array, Map, Object или их ассоциации)

**Возвращает:**
- Для Set/Array: новую ассоциацию с Set, содержащую только элементы из исходного множества, которых нет ни в одном из других множеств
- Для Map/Object: новую ассоциацию с Map, содержащую только пары ключ-значение из исходного объекта, ключи которых отсутствуют во всех других объектах

**Примеры:**
```javascript
// Для Set с одним аргументом
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const diffSet = deep(set1).difference(set2);
// diffSet.this = Set { 1, 2 }

// Для Set с несколькими аргументами
const set1 = new Set([1, 2, 3, 4, 5]);
const set2 = new Set([2, 3, 6]);
const set3 = new Set([1, 3, 7]);
const diffSet = deep(set1).difference(set2, set3);
// diffSet.this = Set { 4, 5 } - элементы из set1, которых нет ни в set2, ни в set3

// Пример с ассоциациями
const set1 = new Set([1, 2, 3, 4, 5]);
const set2 = deep(new Set([2, 3, 6]));
const diffSet = deep(set1).difference(set2);
// diffSet.this = Set { 1, 4, 5 }

// Для Array
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [3, 4, 6];
const arr3 = [1, 3, 7];
const diffArr = deep(arr1).difference(arr2, arr3);
// diffArr.this = Set { 2, 5 }

// Для Map
const map1 = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);
const map2 = new Map([['b', 2], ['c', 3], ['e', 5]]);
const map3 = new Map([['a', 10], ['f', 6]]);
const diffMap = deep(map1).difference(map2, map3);
// diffMap.this = Map { 'd' => 4 } - ключи из map1, которых нет ни в map2, ни в map3

// Для Object
const obj1 = { a: 1, b: 2, c: 3, d: 4 };
const obj2 = { b: 2, c: 3, e: 5 };
const obj3 = { a: 10, f: 6 };
const diffObj = deep(obj1).difference(obj2, obj3);
// diffObj.this = Map { 'd' => 4 }
```

### intersection(...otherSets)

Возвращает новое множество, содержащее элементы, которые присутствуют во всех множествах.

**Аргументы:**
- `...otherSets` - одно или несколько других множеств (Set, Array, Map, Object или их ассоциации)

**Возвращает:**
- Новую ассоциацию с множеством того же типа, что и исходное, содержащее только элементы, которые присутствуют во всех множествах

**Примеры:**
```javascript
// Для Set с одним аргументом
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const interSet = deep(set1).intersection(set2);
// interSet.this = Set { 3, 4 }

// Для Set с несколькими аргументами
const set1 = new Set([1, 2, 3, 4, 5]);
const set2 = new Set([2, 3, 4, 6]);
const set3 = new Set([3, 4, 7]);
const interSet = deep(set1).intersection(set2, set3);
// interSet.this = Set { 3, 4 } - элементы, которые есть во всех трех множествах

// Пример с ассоциациями
const set1 = new Set([1, 2, 3, 4]);
const set2 = deep(new Set([3, 4, 5, 6]));
const interSet = deep(set1).intersection(set2);
// interSet.this = Set { 3, 4 }

// Для Array
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [2, 3, 4, 6];
const arr3 = [3, 4, 7];
const interArr = deep(arr1).intersection(arr2, arr3);
// interArr.this = Set { 3, 4 }

// Для Map
const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
const map2 = new Map([['b', 5], ['c', 6], ['d', 4]]);
const map3 = new Map([['c', 10], ['e', 7]]);
const interMap = deep(map1).intersection(map2, map3);
// interMap.this = Map { 'c' => 3 } - только ключ 'c' присутствует во всех трех картах

// Для Object
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 5, c: 6, d: 4 };
const obj3 = { c: 10, e: 7 };
const interObj = deep(obj1).intersection(obj2, obj3);
// interObj.this = Map { 'c' => 3 }
```

### symmetricDifference(...otherSets)

Возвращает новое множество, содержащее элементы, которые присутствуют в нечетном числе множеств. Для двух множеств это элементы, которые присутствуют только в одном из множеств, но не в обоих.

**Аргументы:**
- `...otherSets` - одно или несколько других множеств (Set, Array, Map, Object или их ассоциации)

**Возвращает:**
- Новую ассоциацию с множеством того же типа, что и исходное, содержащее элементы, которые присутствуют в нечетном числе множеств

**Примеры:**
```javascript
// Для Set с одним аргументом
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const symDiffSet = deep(set1).symmetricDifference(set2);
// symDiffSet.this = Set { 1, 2, 5, 6 }

// Для Set с несколькими аргументами
const set1 = new Set([1, 2, 3]);
const set2 = new Set([2, 3, 4]);
const set3 = new Set([3, 4, 5]);
const symDiffSet = deep(set1).symmetricDifference(set2, set3);
// symDiffSet.this = Set { 1, 3, 5 }
// Элементы, встречающиеся нечетное число раз:
// 1 - только в set1 (1 раз) - нечетное число раз
// 2 - в set1 и set2 (2 раза) - четное число раз, не включается
// 3 - в set1, set2 и set3 (3 раза) - нечетное число раз, включается
// 4 - в set2 и set3 (2 раза) - четное число раз, не включается
// 5 - только в set3 (1 раз) - нечетное число раз, включается

// Пример с ассоциациями
const set1 = new Set([1, 2, 3, 4]);
const set2 = deep(new Set([3, 4, 5, 6]));
const symDiffSet = deep(set1).symmetricDifference(set2);
// symDiffSet.this = Set { 1, 2, 5, 6 }

// Для Array
const arr1 = [1, 2, 3];
const arr2 = [2, 3, 4];
const arr3 = [3, 4, 5];
const symDiffArr = deep(arr1).symmetricDifference(arr2, arr3);
// symDiffArr.this = Set { 1, 3, 5 }

// Для Map
const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
const map2 = new Map([['b', 5], ['c', 6], ['d', 4]]);
const map3 = new Map([['c', 10], ['e', 7]]);
const symDiffMap = deep(map1).symmetricDifference(map2, map3);
// symDiffMap.this = Map { 'a' => 1, 'd' => 4, 'e' => 7 }
// Ключи, встречающиеся нечетное число раз

// Для Object
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 5, c: 6, d: 4 };
const obj3 = { c: 10, e: 7 };
const symDiffObj = deep(obj1).symmetricDifference(obj2, obj3);
// symDiffObj.this = Map { 'a' => 1, 'd' => 4, 'e' => 7 }
```

### union(...otherSets)

Возвращает новое множество, содержащее все элементы из всех множеств.

**Аргументы:**
- `...otherSets` - одно или несколько других множеств (Set, Array, Map, Object или их ассоциации)

**Возвращает:**
- Новую ассоциацию с множеством, содержащим все элементы из всех множеств

**Особенности:**
- Для Map и Object последующие ключи перезаписывают предыдущие (приоритет у последних аргументов)

**Примеры:**
```javascript
// Для Set с одним аргументом
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const unionSet = deep(set1).union(set2);
// unionSet.this = Set { 1, 2, 3, 4, 5, 6 }

// Для Set с несколькими аргументами
const set1 = new Set([1, 2, 3]);
const set2 = new Set([3, 4, 5]);
const set3 = new Set([5, 6, 7]);
const unionSet = deep(set1).union(set2, set3);
// unionSet.this = Set { 1, 2, 3, 4, 5, 6, 7 }

// Пример с ассоциациями
const set1 = new Set([1, 2, 3, 4]);
const set2 = deep(new Set([3, 4, 5, 6]));
const unionSet = deep(set1).union(set2);
// unionSet.this = Set { 1, 2, 3, 4, 5, 6 }

// Для Array
const arr1 = [1, 2, 3];
const arr2 = [3, 4, 5];
const arr3 = [5, 6, 7];
const unionArr = deep(arr1).union(arr2, arr3);
// unionArr.this = Set { 1, 2, 3, 4, 5, 6, 7 }

// Для Map
const map1 = new Map([['a', 1], ['b', 2]]);
const map2 = new Map([['b', 5], ['c', 3]]);
const map3 = new Map([['d', 4]]);
const unionMap = deep(map1).union(map2, map3);
// unionMap.this = Map { 'a' => 1, 'b' => 5, 'c' => 3, 'd' => 4 }
// Обратите внимание, что при совпадении ключей сохраняется значение
// из последнего множества (map2.get('b') = 5 перезаписывает map1.get('b') = 2)

// Для Object
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 5, c: 3 };
const obj3 = { d: 4 };
const unionObj = deep(obj1).union(obj2, obj3);
// unionObj.this = Map { 'a' => 1, 'b' => 5, 'c' => 3, 'd' => 4 }
// Значение ключа 'b' берется из obj2, так как он указан позже obj1
```

## Производительность

[Результаты бенчмарков →](./MANY.benchmark.md)

Операции над множествами оптимизированы для работы с различными типами данных и размерами множеств. Производительность зависит от типа и размера данных, а также количества операций.

## Интеграция с отслеживанием изменений

Методы модуля интегрированы с системой отслеживания изменений, что позволяет автоматически обновлять результаты операций при изменении исходных данных:

```javascript
const set1 = deep(new Set([1, 2, 3]));
const set2 = deep(new Set([3, 4, 5]));
const union = set1.union(set2);

// Изменение исходного множества приведет к обновлению результата
set1.add(6);
console.log(union.this); // Set { 1, 2, 3, 4, 5, 6 }

set2.add(7);
console.log(union.this); // Set { 1, 2, 3, 4, 5, 6, 7 }
```
