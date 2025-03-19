# Модуль проверки типов

Модуль `is.js` предоставляет набор функций для определения типа значений и интегрируется с классом `Association` для удобной проверки типов в цепочке вызовов.



## Производительность

**Информация о системе:**

- clk: ~1.02 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| value instanceof Error | 2.20 ns/итер | 454 545 454,545 опер/сек |
| deep(string).isString | 161.28 ns/итер | 6 200 396,825 опер/сек |
| deep(number).isNumber | 160.41 ns/итер | 6 234 025,31 опер/сек |
| deep(boolean).isBoolean | 163.61 ns/итер | 6 112 095,838 опер/сек |
| deep(symbol).isSymbol | 161.66 ns/итер | 6 185 822,096 опер/сек |
| deep(bigint).isBigInt | 164.56 ns/итер | 6 076 810,89 опер/сек |
| deep(function).isFunction | 164.74 ns/итер | 6 070 171,179 опер/сек |
| deep(undefined).isUndefined | 164.39 ns/итер | 6 083 095,079 опер/сек |
| deep(null).isNull | 163.22 ns/итер | 6 126 700,159 опер/сек |
| deep(array).isArray | 167.90 ns/итер | 5 955 926,147 опер/сек |
| deep(object).isObject | 229.52 ns/итер | 4 356 918,787 опер/сек |
| deep(plainObject).isPlainObject | 187.74 ns/итер | 5 326 515,394 опер/сек |
| deep(date).isDate | 170.78 ns/итер | 5 855 486,591 опер/сек |
| deep(regexp).isRegExp | 173.28 ns/итер | 5 771 006,464 опер/сек |
| deep(set).isSet | 164.72 ns/итер | 6 070 908,208 опер/сек |
| deep(map).isMap | 165.06 ns/итер | 6 058 403,005 опер/сек |
| deep(promise).isPromise | 166.19 ns/итер | 6 017 209,218 опер/сек |
| deep(error).isError | 166.65 ns/итер | 6 000 600,06 опер/сек |
| deep(json).isJSON | 562.07 ns/итер | 1 779 137,83 опер/сек |
| deep(empty).isEmpty | 166.26 ns/итер | 6 014 675,809 опер/сек |
| deep(array).isMany | 163.38 ns/итер | 6 120 700,208 опер/сек |
| deep(object).isMany | 247.07 ns/итер | 4 047 435,949 опер/сек |
| deep(set).isMany | 204.19 ns/итер | 4 897 399,481 опер/сек |
| deep(map).isMany | 174.58 ns/итер | 5 728 032,993 опер/сек |
| deep(string).isMany | 176.46 ns/итер | 5 667 006,687 опер/сек |
| deep(number).isMany | 167.46 ns/итер | 5 971 575,302 опер/сек |
| deep(string).isString | 163.35 ns/итер | 6 121 824,304 опер/сек |
| deep(number).isNumber | 158.84 ns/итер | 6 295 643,415 опер/сек |
| deep(array).isArray | 162.60 ns/итер | 6 150 061,501 опер/сек |
| deep(array).isMany | 261.17 ns/итер | 3 828 923,69 опер/сек |

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

Модуль автоматически интегрируется с классом `Association`, добавляя методы проверки типов к экземплярам.

```javascript
// Пример использования
import deep from 'deep7';

const str = deep('test');
str.isString; // true
str.isNumber; // false

const obj = deep({});
obj.isObject; // true
obj.isPlainObject; // true
obj.isArray; // false
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
// Через функцию
import { isArray } from './is.js';
console.log(isArray(new Association([1, 2, 3]))); // true

// Через свойство (рекомендуемый способ)
import { deep } from './index.js';
console.log(deep([1, 2, 3]).isArray); // true
```
