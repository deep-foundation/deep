# Many

Модуль `many.js` предоставляет универсальные операции над множествами, работающие с различными типами данных в JavaScript. Он расширяет функциональность стандартных структур данных, обеспечивая единый интерфейс для выполнения теоретико-множественных операций.

## Производительность

**Информация о системе:**

- Darwin 23.2.0 x64
- Node.JS: 23.4.0
- V8: 12.9.202.28-node.11
- CPU: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz × 6
- Memory: 16 GB

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| difference (4 elements): set.difference(set) | 5128.21 µs/итер | 195 опер/сек |
| difference (4 elements): array.difference(set) | 1831.50 µs/итер | 546 опер/сек |
| difference (4 elements): set.difference(array) | 1092.90 µs/итер | 915 опер/сек |
| difference (4 elements): array.difference(array) | 759.30 µs/итер | 1 317 опер/сек |
| difference (4 elements): map.difference(map) | 604.59 µs/итер | 1 654 опер/сек |
| difference (4 elements): object.difference(map) | 727.80 µs/итер | 1 374 опер/сек |
| difference (4 elements): map.difference(object) | 764.53 µs/итер | 1 308 опер/сек |
| difference (4 elements): object.difference(object) | 877.96 µs/итер | 1 139 опер/сек |
| difference (1000 elements): set.difference(set) | 5128.21 µs/итер | 195 опер/сек |
| difference (1000 elements): array.difference(set) | 1831.50 µs/итер | 546 опер/сек |
| difference (1000 elements): set.difference(array) | 1092.90 µs/итер | 915 опер/сек |
| difference (1000 elements): array.difference(array) | 759.30 µs/итер | 1 317 опер/сек |
| difference (1000 elements): map.difference(map) | 604.59 µs/итер | 1 654 опер/сек |
| difference (1000 elements): object.difference(map) | 727.80 µs/итер | 1 374 опер/сек |
| difference (1000 elements): map.difference(object) | 764.53 µs/итер | 1 308 опер/сек |
| difference (1000 elements): object.difference(object) | 877.96 µs/итер | 1 139 опер/сек |

## Интеграция с Association

Все методы модуля `many.js` автоматически добавляются в `Association._proxy`, что делает их доступными через свойства экземпляров `Association`:

```javascript
import { deep } from 'deep7';
const result = deep(set1).difference(set2);
```

## Основные особенности

1. Методы работают с разными типами данных:
   - Set и Array (результат всегда Set)
   - Map и Object (результат всегда Map)
2. Методы возвращают новые экземпляры Set или Map
3. Методы не модифицируют исходные данные
4. Методы поддерживают цепочки вызовов
5. Методы интегрированы с системой отслеживания изменений

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

### difference(otherSet)

Возвращает новое множество, содержащее элементы из текущего множества, которые отсутствуют в `otherSet`.

**Аргументы:**
- `otherSet` - другое множество (Set, Array, Map, Object)

**Возвращает:**
- Для Set/Array: новый Set, содержащий только элементы из исходного множества
- Для Map/Object: новый Map, содержащий только пары ключ-значение из исходного объекта

**Примеры:**
```javascript
// Для Set
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const diffSet = deep(set1).difference(set2);
// diffSet.this = Set { 1, 2 }

// Для Array
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];
const diffArr = deep(arr1).difference(arr2);
// diffArr.this = Set { 1, 2 }

// Для Map
const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);
const diffMap = deep(map1).difference(map2);
// diffMap.this = Map { 'a' => 1 }

// Для Object
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 2, c: 3, d: 4 };
const diffObj = deep(obj1).difference(obj2);
// diffObj.this = Map { 'a' => 1 }
```

### intersection(otherSet)

Возвращает новое множество, содержащее элементы, которые присутствуют как в текущем множестве, так и в `otherSet`.

**Аргументы:**
- `otherSet` - другое множество (Set, Array, Map, Object) или примитивное значение

**Возвращает:**
- Новое множество того же типа, что и исходное, содержащее только элементы, которые присутствуют и в исходном множестве, и в `otherSet`

**Примеры:**
```javascript
// Для Set
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const interSet = deep(set1).intersection(set2);
// interSet.this = Set { 3, 4 }

// Для Array
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];
const interArr = deep(arr1).intersection(arr2);
// interArr.this = [3, 4]

// Для Map
const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);
const interMap = deep(map1).intersection(map2);
// interMap.this = Map { 'b' => 2, 'c' => 3 }

// Для Object
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 5, c: 6, d: 7 };
const interObj = deep(obj1).intersection(obj2);
// interObj.this = { b: 2, c: 3 }
```

### symmetricDifference(otherSet)

Возвращает новое множество, содержащее элементы, которые присутствуют только в одном из множеств, но не в обоих. Это объединение разностей множеств A-B и B-A.

**Аргументы:**
- `otherSet` - другое множество (Set, Array, Map, Object) или примитивное значение

**Возвращает:**
- Новое множество того же типа, что и исходное, содержащее только элементы, которые присутствуют в одном из множеств, но не в обоих одновременно

**Примеры:**
```javascript
// Для Set
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const symDiffSet = deep(set1).symmetricDifference(set2);
// symDiffSet.this = Set { 1, 2, 5, 6 }

// Для Array
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];
const symDiffArr = deep(arr1).symmetricDifference(arr2);
// symDiffArr.this = [1, 2, 5, 6]

// Для Map
const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);
const symDiffMap = deep(map1).symmetricDifference(map2);
// symDiffMap.this = Map { 'a' => 1, 'd' => 4 }

// Для Object
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 2, c: 3, d: 4 };
const symDiffObj = deep(obj1).symmetricDifference(obj2);
// symDiffObj.this = { a: 1, d: 4 }
```

### union(otherSet)

Возвращает новое множество, содержащее все элементы из обоих множеств.

**Аргументы:**
- `otherSet` - другое множество (Set, Array, Map, Object)

**Возвращает:**
- Для Set/Array: новый Set, содержащий все элементы из обоих множеств
- Для Map/Object: новый Map, содержащий все пары ключ-значение из обоих объектов

**Примеры:**
```javascript
// Для Set
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const unionSet = deep(set1).union(set2);
// unionSet.this = Set { 1, 2, 3, 4, 5, 6 }

// Для Array
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];
const unionArr = deep(arr1).union(arr2);
// unionArr.this = Set { 1, 2, 3, 4, 5, 6 }

// Для Map
const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
const map2 = new Map([['b', 2], ['c', 3], ['d', 4]]);
const unionMap = deep(map1).union(map2);
// unionMap.this = Map { 'a' => 1, 'b' => 2, 'c' => 3, 'd' => 4 }

// Для Object
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 2, c: 3, d: 4 };
const unionObj = deep(obj1).union(obj2);
// unionObj.this = Map { 'a' => 1, 'b' => 2, 'c' => 3, 'd' => 4 }
```
