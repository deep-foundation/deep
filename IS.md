# Модуль проверки типов

Модуль `is.js` предоставляет набор функций для определения типа значений и интегрируется с классом `Association` для удобной проверки типов в цепочке вызовов.

## Использование

```javascript
import { deep } deep7;
import { isString, isNumber } deep7;

// Прямая проверка типов
isString('test'); // true
isNumber(42); // true

// Проверка через Association
const value = deep('test');
value.isString(); // true
value.isNumber(); // false
```

## API

### Функции проверки типов

#### Примитивные типы

| Функция | Описание | Пример |
|---------|----------|--------|
| `isString(value)` | Проверяет, является ли значение строкой | `isString('test') // true` |
| `isNumber(value)` | Проверяет, является ли значение числом | `isNumber(42) // true` |
| `isBoolean(value)` | Проверяет, является ли значение булевым | `isBoolean(true) // true` |
| `isSymbol(value)` | Проверяет, является ли значение символом | `isSymbol(Symbol()) // true` |
| `isBigInt(value)` | Проверяет, является ли значение BigInt | `isBigInt(BigInt(42)) // true` |
| `isUndefined(value)` | Проверяет, является ли значение undefined | `isUndefined(undefined) // true` |
| `isNull(value)` | Проверяет, является ли значение null | `isNull(null) // true` |
| `isPrimitive(value)` | Проверяет, является ли значение примитивным типом | `isPrimitive('test') // true` |

#### Объектные типы

| Функция | Описание | Пример |
|---------|----------|--------|
| `isObject(value)` | Проверяет, является ли значение объектом (не null) | `isObject({}) // true` |
| `isPlainObject(value)` | Проверяет, является ли значение простым объектом | `isPlainObject({}) // true` |
| `isArray(value)` | Проверяет, является ли значение массивом | `isArray([]) // true` |
| `isFunction(value)` | Проверяет, является ли значение функцией | `isFunction(() => {}) // true` |
| `isConstructor(value)` | Проверяет, является ли функция конструктором | `isConstructor(Date) // true` |
| `isDate(value)` | Проверяет, является ли значение датой | `isDate(new Date()) // true` |
| `isRegExp(value)` | Проверяет, является ли значение регулярным выражением | `isRegExp(/test/) // true` |
| `isError(value)` | Проверяет, является ли значение ошибкой | `isError(new Error()) // true` |

#### Коллекции

| Функция | Описание | Пример |
|---------|----------|--------|
| `isSet(value)` | Проверяет, является ли значение множеством Set | `isSet(new Set()) // true` |
| `isWeakSet(value)` | Проверяет, является ли значение WeakSet | `isWeakSet(new WeakSet()) // true` |
| `isMap(value)` | Проверяет, является ли значение отображением Map | `isMap(new Map()) // true` |
| `isWeakMap(value)` | Проверяет, является ли значение WeakMap | `isWeakMap(new WeakMap()) // true` |
| `isIterable(value)` | Проверяет, является ли значение итерируемым | `isIterable([]) // true` |

#### Асинхронные типы

| Функция | Описание | Пример |
|---------|----------|--------|
| `isPromise(value)` | Проверяет, является ли значение промисом | `isPromise(Promise.resolve()) // true` |
| `isPromiseLike(value)` | Проверяет, является ли значение похожим на промис | `isPromiseLike({then: () => {}}) // true` |

#### Другие проверки

| Функция | Описание | Пример |
|---------|----------|--------|
| `isEmpty(value)` | Проверяет, является ли значение пустым | `isEmpty('') // true` |
| `isJSON(value)` | Проверяет, является ли строка корректным JSON | `isJSON('{"a":1}') // true` |

### Вспомогательные структуры

#### types

Карта соответствия названий типов и функций проверки.

```javascript
// Пример использования
import { types } deep7;

const checkFn = types.get('string'); // Получение функции isString
checkFn('test'); // true
```

#### checks

Инвертированная карта от `types` - соответствие функций проверки и названий типов.

```javascript
// Пример использования
import { checks, isString } deep7;

const typeName = checks.get(isString); // 'string'
```

#### order

Массив, задающий последовательность проверки типов.

```javascript
// Пример использования
import { order } deep7;

// Проверка порядка типов
const isBeforeObject = order.indexOf('array') < order.indexOf('object'); // true
```

## Интеграция с Association

Модуль автоматически интегрируется с классом `Association`, добавляя методы проверки типов к экземплярам.

```javascript
// Пример использования
import { Association } deep7;

const str = deep('test');
str.isString(); // true
str.isNumber(); // false

const obj = deep({});
obj.isObject(); // true
obj.isPlainObject(); // true
obj.isArray(); // false
```

## Производительность

**Информация о системе:**

- clk: ~1.24 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| value instanceof Error | 4.09 ns/итер | 244 498 777,506 опер/сек |
| deep(string).isString | 179.46 ns/итер | 5 572 272,373 опер/сек |
| deep(number).isNumber | 170.28 ns/итер | 5 872 680,291 опер/сек |
| deep(boolean).isBoolean | 178.92 ns/итер | 5 589 090,096 опер/сек |
| deep(symbol).isSymbol | 167.42 ns/итер | 5 973 002,031 опер/сек |
| deep(bigint).isBigInt | 184.91 ns/итер | 5 408 036,342 опер/сек |
| deep(function).isFunction | 169.18 ns/итер | 5 910 864,168 опер/сек |
| deep(undefined).isUndefined | 160.52 ns/итер | 6 229 753,302 опер/сек |
| deep(null).isNull | 166.77 ns/итер | 5 996 282,305 опер/сек |
| deep(array).isArray | 166.82 ns/итер | 5 994 485,074 опер/сек |
| deep(object).isObject | 242.51 ns/итер | 4 123 541,297 опер/сек |
| deep(plainObject).isPlainObject | 189.86 ns/итер | 5 267 038,871 опер/сек |
| deep(date).isDate | 193.67 ns/итер | 5 163 422,316 опер/сек |
| deep(regexp).isRegExp | 172.36 ns/итер | 5 801 810,165 опер/сек |
| deep(set).isSet | 237.52 ns/итер | 4 210 171,775 опер/сек |
| deep(map).isMap | 252.43 ns/итер | 3 961 494,276 опер/сек |
| deep(promise).isPromise | 314.27 ns/итер | 3 181 977,281 опер/сек |
| deep(error).isError | 220.62 ns/итер | 4 532 680,627 опер/сек |
| deep(json).isJSON | 1.46 µs/итер | 684 931,507 опер/сек |
| deep(empty).isEmpty | 305.70 ns/итер | 3 271 180,896 опер/сек |
| deep(string).isString | 300.91 ns/итер | 3 323 252,8 опер/сек |
| deep(number).isNumber | 282.92 ns/итер | 3 534 568,076 опер/сек |
| deep(array).isArray | 177.35 ns/итер | 5 638 567,804 опер/сек |

## Примеры

### Объединение проверок типов

```javascript
import { isString, isNumber } deep7;

function isStringOrNumber(value) {
  return isString(value) || isNumber(value);
}

isStringOrNumber('test'); // true
isStringOrNumber(42); // true
isStringOrNumber({}); // false
```

### Определение типа значения

```javascript
import { types, order } deep7;

function getTypeOf(value) {
  for (const typeName of order) {
    const checkFn = types.get(typeName);
    if (checkFn(value)) {
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
import { isString, isNumber, isFunction } deep7;

function executeWithValidation(callback, param1, param2) {
  if (!isFunction(callback)) {
    throw new TypeError('callback должен быть функцией');
  }

  if (!isString(param1)) {
    throw new TypeError('param1 должен быть строкой');
  }

  if (!isNumber(param2)) {
    throw new TypeError('param2 должен быть числом');
  }

  return callback(param1, param2);
}
```
