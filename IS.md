# Модуль проверки типов

Модуль `is.js` предоставляет набор функций для определения типа значений и интегрируется с классом `Association` для удобной проверки типов в цепочке вызовов.



## Производительность

**Информация о системе:**

- clk: ~1.09 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| value instanceof RegExp | 2.60 ns/итер | 384 615 384,615 опер/сек |
| value instanceof Promise | 2.43 ns/итер | 411 522 633,745 опер/сек |
| value instanceof Error | 2.51 ns/итер | 398 406 374,502 опер/сек |
| deep(string).isString | 181.53 ns/итер | 5 508 731,339 опер/сек |
| deep(number).isNumber | 166.30 ns/итер | 6 013 229,104 опер/сек |
| deep(boolean).isBoolean | 222.19 ns/итер | 4 500 652,595 опер/сек |
| deep(symbol).isSymbol | 175.77 ns/итер | 5 689 253,001 опер/сек |
| deep(bigint).isBigInt | 208.89 ns/итер | 4 787 208,579 опер/сек |
| deep(function).isFunction | 163.84 ns/итер | 6 103 515,625 опер/сек |
| deep(undefined).isUndefined | 165.72 ns/итер | 6 034 274,68 опер/сек |
| deep(null).isNull | 175.41 ns/итер | 5 700 929,251 опер/сек |
| deep(array).isArray | 182.22 ns/итер | 5 487 871,803 опер/сек |
| deep(object).isObject | 224.94 ns/итер | 4 445 629,946 опер/сек |
| deep(plainObject).isPlainObject | 186.04 ns/итер | 5 375 188,132 опер/сек |
| deep(date).isDate | 168.08 ns/итер | 5 949 547,834 опер/сек |
| deep(regexp).isRegExp | 194.83 ns/итер | 5 132 679,772 опер/сек |
| deep(set).isSet | 198.26 ns/итер | 5 043 881,771 опер/сек |
| deep(map).isMap | 197.77 ns/итер | 5 056 378,622 опер/сек |
| deep(promise).isPromise | 170.49 ns/итер | 5 865 446,654 опер/сек |
| deep(error).isError | 172.59 ns/итер | 5 794 078,452 опер/сек |
| deep(json).isJSON | 585.57 ns/итер | 1 707 737,76 опер/сек |
| deep(empty).isEmpty | 166.21 ns/итер | 6 016 485,169 опер/сек |
| deep(array).isMany | 169.44 ns/итер | 5 901 794,145 опер/сек |
| deep(object).isMany | 236.61 ns/итер | 4 226 364,059 опер/сек |
| deep(set).isMany | 170.71 ns/итер | 5 857 887,646 опер/сек |
| deep(map).isMany | 172.86 ns/итер | 5 785 028,347 опер/сек |
| deep(string).isMany | 171.34 ns/итер | 5 836 348,78 опер/сек |
| deep(number).isMany | 167.63 ns/итер | 5 965 519,298 опер/сек |
| deep(string).isString | 171.68 ns/итер | 5 824 790,308 опер/сек |
| deep(number).isNumber | 167.55 ns/итер | 5 968 367,651 опер/сек |
| deep(array).isArray | 164.74 ns/итер | 6 070 171,179 опер/сек |
| deep(array).isMany | 164.86 ns/итер | 6 065 752,76 опер/сек |

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

## Производительность

Использование методов проверки через свойства `Association` практически не влияет на производительность по сравнению с прямыми проверками через встроенные в JavaScript механизмы (`typeof`, `instanceof` и т.д.).

## Общие методы проверки типов

### Примитивные типы

| Метод | Описание |
|-------|----------|
| `isString` | Проверяет, является ли значение строкой |
| `isNumber` | Проверяет, является ли значение числом |
| `isBoolean` | Проверяет, является ли значение логическим значением |
| `isSymbol` | Проверяет, является ли значение символом |
| `isBigInt` | Проверяет, является ли значение большим целым числом |
| `isUndefined` | Проверяет, является ли значение undefined |
| `isNull` | Проверяет, является ли значение null |
| `isPrimitive` | Проверяет, является ли значение примитивным типом |

### Объектные типы

| Метод | Описание |
|-------|----------|
| `isFunction` | Проверяет, является ли значение функцией |
| `isArray` | Проверяет, является ли значение массивом |
| `isObject` | Проверяет, является ли значение объектом (не null) |
| `isPlainObject` | Проверяет, является ли значение простым объектом |
| `isDate` | Проверяет, является ли значение экземпляром Date |
| `isRegExp` | Проверяет, является ли значение регулярным выражением |
| `isSet` | Проверяет, является ли значение экземпляром Set |
| `isMap` | Проверяет, является ли значение экземпляром Map |
| `isWeakMap` | Проверяет, является ли значение экземпляром WeakMap |
| `isWeakSet` | Проверяет, является ли значение экземпляром WeakSet |
| `isPromise` | Проверяет, является ли значение Promise |
| `isPromiseLike` | Проверяет, имеет ли значение метод .then() |
| `isError` | Проверяет, является ли значение ошибкой (Error) |
| `isConstructor` | Проверяет, является ли функция конструктором |

### Специальные проверки

| Метод | Описание |
|-------|----------|
| `isJSON` | Проверяет, является ли строка валидным JSON |
| `isEmpty` | Проверяет, является ли значение пустым |
| `isIterable` | Проверяет, является ли значение итерируемым |
| `isMany` | Проверяет, является ли значение множественным типом |

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
