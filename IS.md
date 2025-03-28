# Is

Модуль `is.js` предоставляет набор функций для проверки типов и свойств данных. Функции интегрированы в `Association` класс, что позволяет проверять типы ассоциированных данных через удобный API.

## Производительность

**Информация о системе:**

- Darwin 23.2.0 x64
- Node.JS: 23.4.0
- V8: 12.9.202.28-node.11
- CPU: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz × 6
- Memory: 16 GB

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Обычные проверки типов: typeof string === "string" | 0.07 µs/итер | 14 984 821 опер/сек |
| Обычные проверки типов: typeof number === "number" | 0.10 µs/итер | 9 805 793 опер/сек |
| Обычные проверки типов: typeof boolean === "boolean" | 0.07 µs/итер | 14 270 120 опер/сек |
| Обычные проверки типов: typeof symbol === "symbol" | 0.07 µs/итер | 14 937 770 опер/сек |
| Обычные проверки типов: typeof bigint === "bigint" | 0.07 µs/итер | 14 114 097 опер/сек |
| Обычные проверки типов: typeof function === "function" | 0.07 µs/итер | 15 093 916 опер/сек |
| Обычные проверки типов: value === undefined | 0.12 µs/итер | 8 695 168 опер/сек |
| Обычные проверки типов: value === null | 0.08 µs/итер | 12 897 290 опер/сек |
| Обычные проверки типов: Array.isArray(array) | 0.09 µs/итер | 11 569 207 опер/сек |
| Обычные проверки типов: typeof object === "object" | 0.07 µs/итер | 13 528 472 опер/сек |
| Обычные проверки типов: value instanceof Date | 0.07 µs/итер | 14 339 096 опер/сек |
| Обычные проверки типов: value instanceof RegExp | 0.09 µs/итер | 10 729 698 опер/сек |
| Обычные проверки типов: value instanceof Set | 0.09 µs/итер | 10 621 050 опер/сек |
| Обычные проверки типов: value instanceof Map | 0.08 µs/итер | 12 054 673 опер/сек |
| Обычные проверки типов: value instanceof Promise | 0.09 µs/итер | 11 582 995 опер/сек |
| Обычные проверки типов: value instanceof Error | 0.08 µs/итер | 12 536 292 опер/сек |
| Обычные проверки типов: Array.isArray(array) || value instanceof Set/Map || typeof object === "object" | 0.07 µs/итер | 15 362 248 опер/сек |

## Использование

```javascript
import deep from 'deep7';

// Проверка через Association
const value = deep('test');
value.isString; // true
value.isNumber; // false

// Цепочки вызовов
deep('test').isString; // true
deep(42).isNumber; // true
```

## API

### Функции проверки типов

#### Примитивные типы

| Функция | Описание | Пример |
|---------|----------|--------|
| `isString` | Проверяет, является ли значение строкой | `deep('test').isString // true` |
| `isNumber` | Проверяет, является ли значение числом | `deep(42).isNumber // true` |
| `isBoolean` | Проверяет, является ли значение булевым | `deep(true).isBoolean // true` |
| `isSymbol` | Проверяет, является ли значение символом | `deep(Symbol()).isSymbol // true` |
| `isBigInt` | Проверяет, является ли значение BigInt | `deep(BigInt(42)).isBigInt // true` |
| `isUndefined` | Проверяет, является ли значение undefined | `deep(undefined).isUndefined // true` |
| `isNull` | Проверяет, является ли значение null | `deep(null).isNull // true` |
| `isPrimitive` | Проверяет, является ли значение примитивным типом | `deep('test').isPrimitive // true` |

#### Объектные типы

| Функция | Описание | Пример |
|---------|----------|--------|
| `isObject` | Проверяет, является ли значение объектом (не null) | `deep({}).isObject // true` |
| `isPlainObject` | Проверяет, является ли значение простым объектом | `deep({}).isPlainObject // true` |
| `isArray` | Проверяет, является ли значение массивом | `deep([]).isArray // true` |
| `isFunction` | Проверяет, является ли значение функцией | `deep(() => {}).isFunction // true` |
| `isConstructor` | Проверяет, является ли функция конструктором | `deep(Date).isConstructor // true` |
| `isDate` | Проверяет, является ли значение датой | `deep(new Date()).isDate // true` |
| `isRegExp` | Проверяет, является ли значение регулярным выражением | `deep(/test/).isRegExp // true` |
| `isError` | Проверяет, является ли значение ошибкой | `deep(new Error()).isError // true` |

#### Коллекции

| Функция | Описание | Пример |
|---------|----------|--------|
| `isSet` | Проверяет, является ли значение множеством Set | `deep(new Set()).isSet // true` |
| `isWeakSet` | Проверяет, является ли значение WeakSet | `deep(new WeakSet()).isWeakSet // true` |
| `isMap` | Проверяет, является ли значение отображением Map | `deep(new Map()).isMap // true` |
| `isWeakMap` | Проверяет, является ли значение WeakMap | `deep(new WeakMap()).isWeakMap // true` |
| `isIterable` | Проверяет, является ли значение итерируемым | `deep([]).isIterable // true` |

#### Асинхронные типы

| Функция | Описание | Пример |
|---------|----------|--------|
| `isPromise` | Проверяет, является ли значение промисом | `deep(Promise.resolve()).isPromise // true` |
| `isPromiseLike` | Проверяет, является ли значение похожим на промис | `deep({then: () => {}}).isPromiseLike // true` |

#### Другие проверки

| Функция | Описание | Пример |
|---------|----------|--------|
| `isEmpty` | Проверяет, является ли значение пустым | `deep('').isEmpty // true` |
| `isJSON` | Проверяет, является ли строка корректным JSON | `deep('{"a":1}').isJSON // true` |

### Вспомогательные структуры

#### types

Карта соответствия названий типов и функций проверки.

```javascript
// Пример использования
import { types } from 'deep7';

const checkFn = types.get('string'); // Получение функции isString
deep('test').isString; // true
```

#### checks

Инвертированная карта от `types` - соответствие функций проверки и названий типов.

```javascript
// Пример использования
import { checks } from 'deep7';
import deep from 'deep7';

// Получаем имя метода проверки
const typeName = checks.get(deep('test').isString); // 'string'
```

#### order

Массив, задающий последовательность проверки типов.

```javascript
// Пример использования
import { order } from 'deep7';

// Проверка порядка типов
const isBeforeObject = order.indexOf('array') < order.indexOf('object'); // true
```

## Интеграция с Association

Все методы модуля `is.js` автоматически добавляются в `Association._proxy`, что делает их доступными через свойства экземпляров `Association`:

```javascript
// Это устаревший подход, не рекомендуется
// import { isArray } from './is.js';
// console.log(isArray(new Association([1, 2, 3]))); // true

// Через ассоциативное свойство (рекомендуемый способ)
import { deep } from './index.js';
console.log(deep([1, 2, 3]).isArray); // true
```

## Примеры

### Объединение проверок типов

```javascript
import deep from 'deep7';

function isStringOrNumber(value) {
  return deep(value).isString || deep(value).isNumber;
}

isStringOrNumber('test'); // true
isStringOrNumber(42); // true
isStringOrNumber({}); // false
```

### Определение типа значения

```javascript
import deep from 'deep7';
import { types, order } from 'deep7';

function getTypeOf(value) {
  for (const typeName of order) {
    if (deep(value)[`is${typeName.charAt(0).toUpperCase() + typeName.slice(1)}`]) {
      return typeName;
    }
  }
  return 'unknown';
}

getTypeOf('test'); // 'string'
getTypeOf(42); // 'number'
getTypeOf({}); // 'plainObject' или 'object' в зависимости от порядка проверки
```

### Валидация параметров функций

```javascript
import deep from 'deep7';

function executeWithValidation(callback, param1, param2) {
  if (!deep(callback).isFunction) {
    throw new TypeError('callback должен быть функцией');
  }

  if (!deep(param1).isString) {
    throw new TypeError('param1 должен быть строкой');
  }

  if (!deep(param2).isNumber) {
    throw new TypeError('param2 должен быть числом');
  }

  return callback(param1, param2);
}
```

# Модуль типизации (is.js)

Модуль `is.js` предоставляет набор функций для проверки типов данных, оптимизированных для использования с классом `Association`. Все методы проверки типов доступны как через прямой вызов, так и через свойства экземпляра `Association`, что делает их использование более эргономичным.

## Функция isMany

Метод `isMany` определяет, является ли значение множественным типом данных, то есть может ли оно содержать несколько элементов. Множественными типами считаются:

- Массивы (`Array`)
- Множества (`Set`)
- Карты (`Map`)
- Объекты (`Object`)

Функция `isMany` возвращает `true` для всех перечисленных типов и `false` для всех остальных. Это особенно полезно при работе с методами, которые обрабатывают коллекции, такими как `forEach`, `map`, `filter` и другие.

### Пример использования

```javascript
import { deep } from './index.js';

// Проверка различных типов
console.log(deep([1, 2, 3]).isMany);         // true
console.log(deep({ a: 1, b: 2 }).isMany);    // true
console.log(deep(new Set([1, 2])).isMany);   // true
console.log(deep(new Map()).isMany);         // true

console.log(deep('строка').isMany);          // false
console.log(deep(42).isMany);                // false
console.log(deep(true).isMany);              // false
console.log(deep(null).isMany);              // false
console.log(deep(new Date()).isMany);        // false
```

## Вспомогательные структуры данных

Модуль `is.js` экспортирует несколько вспомогательных структур данных:

### types: Map<string, Function>

Карта, связывающая названия типов с соответствующими функциями проверки:

```javascript
// Пример структуры
Map {
  'string' => isString,
  'number' => isNumber,
  // ...
}
```

### checks: Map<Function, string>

Обратная карта от `types`, связывающая функции проверки с названиями типов:

```javascript
// Пример структуры
Map {
  isString => 'string',
  isNumber => 'number',
  // ...
}
```

### order: Array<string>

Массив, определяющий порядок проверки типов. Важен для корректной работы определения типа, когда значение может соответствовать нескольким типам (например, массив также является объектом, но должен определяться как массив):

```javascript
// Пример структуры
[
  'undefined',
  'null',
  'array',
  // ...
  'object' // Объект проверяется в последнюю очередь
]
```

## Интеграция с Association

Все методы модуля `is.js` автоматически добавляются в `Association._proxy`, что делает их доступными через свойства экземпляров `Association`:

```javascript
// Это устаревший подход, не рекомендуется
// import { isArray } from './is.js';
// console.log(isArray(new Association([1, 2, 3]))); // true

// Через ассоциативное свойство (рекомендуемый способ)
import { deep } from './index.js';
console.log(deep([1, 2, 3]).isArray); // true
```
