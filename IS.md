# Модуль проверки типов

Модуль `is.js` предоставляет набор функций для определения типа значений и интегрируется с классом `Association` для удобной проверки типов в цепочке вызовов.



## Производительность

**Информация о системе:**

- clk: ~1.50 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| value instanceof Error | 2.45 ns/итер | 408 163 265,306 опер/сек |
| deep(string).isString | 243.09 ns/итер | 4 113 702,744 опер/сек |
| deep(number).isNumber | 196.55 ns/итер | 5 087 763,928 опер/сек |
| deep(boolean).isBoolean | 187.73 ns/итер | 5 326 799,126 опер/сек |
| deep(symbol).isSymbol | 179.85 ns/итер | 5 560 189,046 опер/сек |
| deep(bigint).isBigInt | 182.34 ns/итер | 5 484 260,173 опер/сек |
| deep(function).isFunction | 190.50 ns/итер | 5 249 343,832 опер/сек |
| deep(undefined).isUndefined | 218.13 ns/итер | 4 584 422,134 опер/сек |
| deep(null).isNull | 177.05 ns/итер | 5 648 121,999 опер/сек |
| deep(array).isArray | 202.44 ns/итер | 4 939 735,23 опер/сек |
| deep(object).isObject | 243.14 ns/итер | 4 112 856,79 опер/сек |
| deep(plainObject).isPlainObject | 223.75 ns/итер | 4 469 273,743 опер/сек |
| deep(date).isDate | 192.82 ns/итер | 5 186 184,006 опер/сек |
| deep(regexp).isRegExp | 186.60 ns/итер | 5 359 056,806 опер/сек |
| deep(set).isSet | 211.21 ns/итер | 4 734 624,308 опер/сек |
| deep(map).isMap | 229.23 ns/итер | 4 362 430,746 опер/сек |
| deep(promise).isPromise | 182.87 ns/итер | 5 468 365,506 опер/сек |
| deep(error).isError | 166.73 ns/итер | 5 997 720,866 опер/сек |
| deep(json).isJSON | 599.41 ns/итер | 1 668 307,169 опер/сек |
| deep(empty).isEmpty | 175.43 ns/итер | 5 700 279,314 опер/сек |
| deep(array).isMany | 183.22 ns/итер | 5 457 919,441 опер/сек |
| deep(object).isMany | 252.91 ns/итер | 3 953 975,723 опер/сек |
| deep(set).isMany | 176.49 ns/итер | 5 666 043,402 опер/сек |
| deep(map).isMany | 186.80 ns/итер | 5 353 319,058 опер/сек |
| deep(string).isMany | 186.29 ns/итер | 5 367 974,663 опер/сек |
| deep(number).isMany | 185.80 ns/итер | 5 382 131,324 опер/сек |
| deep(string).isString | 209.75 ns/итер | 4 767 580,453 опер/сек |
| deep(number).isNumber | 188.41 ns/итер | 5 307 573,908 опер/сек |
| deep(array).isArray | 197.11 ns/итер | 5 073 309,32 опер/сек |
| deep(array).isMany | 202.17 ns/итер | 4 946 332,295 опер/сек |

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
