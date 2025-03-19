# Модуль проверки типов

Модуль `is.js` предоставляет набор функций для определения типа значений и интегрируется с классом `Association` для удобной проверки типов в цепочке вызовов.



## Производительность

**Информация о системе:**

- clk: ~1.19 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| value instanceof RegExp | 2.38 ns/итер | 420 168 067,227 опер/сек |
| value instanceof Promise | 2.40 ns/итер | 416 666 666,667 опер/сек |
| value instanceof Error | 2.49 ns/итер | 401 606 425,703 опер/сек |
| deep(string).isString | 207.21 ns/итер | 4 826 021,91 опер/сек |
| deep(number).isNumber | 257.75 ns/итер | 3 879 728,419 опер/сек |
| deep(boolean).isBoolean | 252.00 ns/итер | 3 968 253,968 опер/сек |
| deep(symbol).isSymbol | 232.16 ns/итер | 4 307 374,225 опер/сек |
| deep(bigint).isBigInt | 202.15 ns/итер | 4 946 821,667 опер/сек |
| deep(function).isFunction | 238.73 ns/итер | 4 188 832,572 опер/сек |
| deep(undefined).isUndefined | 220.81 ns/итер | 4 528 780,399 опер/сек |
| deep(null).isNull | 200.03 ns/итер | 4 999 250,112 опер/сек |
| deep(array).isArray | 192.52 ns/итер | 5 194 265,531 опер/сек |
| deep(object).isObject | 279.71 ns/итер | 3 575 131,386 опер/сек |
| deep(plainObject).isPlainObject | 254.36 ns/итер | 3 931 435,76 опер/сек |
| deep(date).isDate | 277.38 ns/итер | 3 605 162,593 опер/сек |
| deep(regexp).isRegExp | 536.59 ns/итер | 1 863 620,269 опер/сек |
| deep(set).isSet | 335.99 ns/итер | 2 976 279,056 опер/сек |
| deep(map).isMap | 353.08 ns/итер | 2 832 219,327 опер/сек |
| deep(promise).isPromise | 214.39 ns/итер | 4 664 396,66 опер/сек |
| deep(error).isError | 240.50 ns/итер | 4 158 004,158 опер/сек |
| deep(json).isJSON | 884.69 ns/итер | 1 130 339,441 опер/сек |
| deep(empty).isEmpty | 212.18 ns/итер | 4 712 979,546 опер/сек |
| deep(string).isString | 233.35 ns/итер | 4 285 408,185 опер/сек |
| deep(number).isNumber | 225.41 ns/итер | 4 436 360,41 опер/сек |
| deep(array).isArray | 190.45 ns/итер | 5 250 721,974 опер/сек |

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
