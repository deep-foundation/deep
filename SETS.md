# Методы модификации данных (sets.js)

Модуль `sets.js` содержит набор универсальных методов для внесения изменений в данные разных типов, оптимизированных для использования с классом Association. Все методы генерируют события change и специфические события для каждой операции.

## Производительность

**Информация о системе:**

- clk: ~1.47 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Object.property = value (нативный) | 383.25 ns/итер | 2 609 262,883 опер/сек |
| deep(Object).set | 184.63 µs/итер | 5 416,238 опер/сек |
| Array[index] = value (нативный) | 1.14 µs/итер | 877 192,982 опер/сек |
| deep(Array).set | 174.07 µs/итер | 5 744,815 опер/сек |
| Map.set (нативный) | 11.85 µs/итер | 84 388,186 опер/сек |
| deep(Map).mapSet | 209.35 µs/итер | 4 776,69 опер/сек |
| delete Object.property (нативный) | 5.73 µs/итер | 174 520,07 опер/сек |
| deep(Object).delete | 250.98 µs/итер | 3 984,381 опер/сек |
| Map.delete (нативный) | 11.19 µs/итер | 89 365,505 опер/сек |
| deep(Map).mapDelete | 177.42 µs/итер | 5 636,343 опер/сек |
| Set.delete (нативный) | 1.47 µs/итер | 680 272,109 опер/сек |
| deep(Set).setDelete | 154.90 µs/итер | 6 455,778 опер/сек |
| Array.push (нативный) | 2.49 µs/итер | 401 606,426 опер/сек |
| deep(Array).push | 242.11 µs/итер | 4 130,354 опер/сек |
| Array.pop (нативный) | 1.05 µs/итер | 952 380,952 опер/сек |
| deep(Array).pop | 300.72 µs/итер | 3 325,352 опер/сек |
| Array.splice (нативный) | 1.15 µs/итер | 869 565,217 опер/сек |
| deep(Array).splice | 304.38 µs/итер | 3 285,367 опер/сек |
| Array.reverse (нативный) | 3.04 µs/итер | 328 947,368 опер/сек |
| deep(Array).reverse | 296.34 µs/итер | 3 374,502 опер/сек |
| Object.keys().forEach(key => delete) (нативный) | 11.73 µs/итер | 85 251,492 опер/сек |
| deep(Object).clear | 205.40 µs/итер | 4 868,549 опер/сек |
| Array.length = 0 (нативный) | 1.23 µs/итер | 813 008,13 опер/сек |
| deep(Array).clear | 191.90 µs/итер | 5 211,047 опер/сек |
| Map.clear (нативный) | 10.36 µs/итер | 96 525,097 опер/сек |
| deep(Map).clear | 167.07 µs/итер | 5 985,515 опер/сек |
| Set.clear (нативный) | 2.31 µs/итер | 432 900,433 опер/сек |
| deep(Set).clear | 154.67 µs/итер | 6 465,378 опер/сек |
| Object.assign (нативный) | 7.17 µs/итер | 139 470,014 опер/сек |
| deep(Object).assign | 199.07 µs/итер | 5 023,359 опер/сек |
| deep(Object).merge | 203.26 µs/итер | 4 919,807 опер/сек |
| deep(Array).merge с массивом | 196.32 µs/итер | 5 093,725 опер/сек |
| Object.defineProperty (нативный) | 746.37 ns/итер | 1 339 818,053 опер/сек |
| deep(Object).defineProperty | 182.17 µs/итер | 5 489,378 опер/сек |
| Object.create (нативный) | 1.21 µs/итер | 826 446,281 опер/сек |
| deep.create | 738.47 ns/итер | 1 354 151,15 опер/сек |
| Object.create c дескрипторами (нативный) | 4.97 µs/итер | 201 207,243 опер/сек |
| deep.create c свойствами | 592.97 ns/итер | 1 686 425,957 опер/сек |
| Object spread {...obj} (нативный) | 630.84 ns/итер | 1 585 188,003 опер/сек |
| deep(Object).clone | 178.62 µs/итер | 5 598,477 опер/сек |
| Array slice (нативный) | 2.28 µs/итер | 438 596,491 опер/сек |
| deep(Array).clone | 216.34 µs/итер | 4 622,354 опер/сек |
| new Map(map) (нативный) | 21.72 µs/итер | 46 040,516 опер/сек |
| deep(Map).clone | 204.79 µs/итер | 4 883,051 опер/сек |
| Array.push (нативный) | 2.94 µs/итер | 340 136,054 опер/сек |
| deep(Array).add | 166.45 µs/итер | 6 007,81 опер/сек |
| Array.splice для удаления (нативный) | 1.35 µs/итер | 740 740,741 опер/сек |
| deep(Array).remove | 270.31 µs/итер | 3 699,456 опер/сек |
| Array.includes (нативный) | 2.00 µs/итер | 500 000 опер/сек |
| deep(Array).has | 255.56 µs/итер | 3 912,975 опер/сек |
| Array[index] (нативный) | 1.18 µs/итер | 847 457,627 опер/сек |
| deep(Array).get | 188.35 µs/итер | 5 309,265 опер/сек |
| Object.keys (нативный) | 142.06 ns/итер | 7 039 279,178 опер/сек |
| deep(Object).keys | 174.70 µs/итер | 5 724,098 опер/сек |
| Object.values (нативный) | 712.04 ns/итер | 1 404 415,482 опер/сек |
| deep(Object).values | 168.03 µs/итер | 5 951,318 опер/сек |
| Object.entries (нативный) | 1.72 µs/итер | 581 395,349 опер/сек |
| deep(Object).entries | 275.40 µs/итер | 3 631,082 опер/сек |
| Array.from(map.entries()) (нативный) | 1.57 µs/итер | 636 942,675 опер/сек |
| deep(Map).convert("array") | 304.37 µs/итер | 3 285,475 опер/сек |
| Object.fromEntries(map) (нативный) | 768.90 ns/итер | 1 300 559,24 опер/сек |
| deep(Map).convert("object") | 211.67 µs/итер | 4 724,335 опер/сек |
| new Set(array) (нативный) | 279.74 ns/итер | 3 574 747,98 опер/сек |
| deep(Array).convert("set") | 334.66 µs/итер | 2 988,107 опер/сек |
| JSON.stringify(obj) (нативный) | 545.87 ns/итер | 1 831 938,007 опер/сек |
| deep(Object).convert("json") | 190.69 µs/итер | 5 244,113 опер/сек |
| Первый доступ к глубокому методу | 304.97 µs/итер | 3 279,011 опер/сек |
| Второй доступ к глубокому методу (кеширование) | 219.54 µs/итер | 4 554,979 опер/сек |
| Многократный вызов метода | 227.54 µs/итер | 4 394,832 опер/сек |

## Базовые операции (`basic.js`)

### set(key, value)

Устанавливает значение свойства в объекте, элемента в массиве или записи в Map.

```javascript
// Для объектов
deep({a: 1}).set('b', 2); // {a: 1, b: 2}

// Для массивов
deep([1, 2]).set(2, 3); // [1, 2, 3]

// Для Map
const map = new Map([['a', 1]]);
deep(map).set('b', 2); // Map(2) {'a' => 1, 'b' => 2}
```

### delete(key)

Удаляет свойство из объекта, элемент из массива или запись из Map.

```javascript
// Для объектов
deep({a: 1, b: 2}).delete('b'); // {a: 1}

// Для массивов
deep([1, 2, 3]).delete(1); // [1, 3]

// Для Map
const map = new Map([['a', 1], ['b', 2]]);
deep(map).delete('b'); // Map(1) {'a' => 1}
```

### clear()

Очищает объект, массив, Map или Set.

```javascript
// Для объектов
deep({a: 1, b: 2}).clear(); // {}

// Для массивов
deep([1, 2, 3]).clear(); // []

// Для Map
const map = new Map([['a', 1], ['b', 2]]);
deep(map).clear(); // Map(0) {}

// Для Set
const set = new Set([1, 2, 3]);
deep(set).clear(); // Set(0) {}
```

### add(key, value)

Добавляет элемент в набор данных.

```javascript
// Для массивов
deep([1, 2]).add(3); // [1, 2, 3]
deep([1, 2]).add(5, 'x'); // [1, 2, undefined, undefined, undefined, 'x']

// Для Set
const set = new Set([1, 2]);
deep(set).add(3); // Set(3) {1, 2, 3}

// Для Map
const map = new Map([['a', 1]]);
deep(map).add('b', 2); // Map(2) {'a' => 1, 'b' => 2}

// Для объектов
deep({a: 1}).add('b', 2); // {a: 1, b: 2}
```

### remove(key)

Удаляет элемент из набора данных.

```javascript
// Для массивов
deep([1, 2, 3]).remove(1); // [1, 3]

// Для Set
const set = new Set([1, 2, 3]);
deep(set).remove(2); // Set(2) {1, 3}

// Для Map
const map = new Map([['a', 1], ['b', 2]]);
deep(map).remove('a'); // Map(1) {'b' => 2}

// Для объектов
deep({a: 1, b: 2}).remove('a'); // {b: 2}
```

### has(key)

Проверяет наличие элемента в наборе данных.

```javascript
// Для массивов
deep([1, 2, 3]).has(1); // true
deep([1, 2, 3]).has(5); // false

// Для Set
const set = new Set([1, 2, 3]);
deep(set).has(2); // true

// Для Map
const map = new Map([['a', 1], ['b', 2]]);
deep(map).has('a'); // true

// Для объектов
deep({a: 1, b: 2}).has('a'); // true
```

### get(key, defaultValue)

Получает значение элемента из набора данных или возвращает defaultValue, если элемент не найден.

```javascript
// Для массивов
deep([1, 2, 3]).get(1); // 2
deep([1, 2, 3]).get(5, 'не найдено'); // 'не найдено'

// Для Map
const map = new Map([['a', 1], ['b', 2]]);
deep(map).get('a'); // 1

// Для объектов
deep({a: 1, b: 2}).get('a'); // 1
deep({a: 1, b: 2}).get('c', 'не найдено'); // 'не найдено'
```

### size()

Возвращает размер набора данных.

```javascript
// Для массивов
deep([1, 2, 3]).size(); // 3

// Для Set
const set = new Set([1, 2, 3]);
deep(set).size(); // 3

// Для Map
const map = new Map([['a', 1], ['b', 2]]);
deep(map).size(); // 2

// Для объектов
deep({a: 1, b: 2, c: 3}).size(); // 3
```

### convert(type)

Преобразует данные в другой тип.

```javascript
// Объект в массив
deep({a: 1, b: 2}).convert('array'); // [['a', 1], ['b', 2]]

// Map в объект
const map = new Map([['a', 1], ['b', 2]]);
deep(map).convert('object'); // {a: 1, b: 2}

// Объект в Map
deep({a: 1, b: 2}).convert('map'); // Map(2) {'a' => 1, 'b' => 2}

// Массив в Set
deep([1, 2, 2, 3]).convert('set'); // Set(3) {1, 2, 3}

// Объект в JSON
deep({a: 1, b: {c: 2}}).convert('json'); // '{"a":1,"b":{"c":2}}'
```

### clone(deep)

Создает копию объекта.

```javascript
// Неглубокое клонирование
const obj = {a: 1, b: {c: 2}};
deep(obj).clone(); // {a: 1, b: {c: 2}} - но obj.b === result.b

// Глубокое клонирование
deep(obj).clone(true); // {a: 1, b: {c: 2}} - глубокая копия, obj.b !== result.b
```

### merge(source)

Объединяет данные с другим источником.

```javascript
// Объединение объектов
deep({a: 1, b: {d: 3}}).merge({b: {c: 2}}); // {a: 1, b: {c: 2}}

// Объединение массивов
deep([3, 4]).merge([1, 2]); // [1, 2]

// Объединение Map
const map = new Map([['a', 1]]);
deep(map).merge(new Map([['b', 2]])); // Map(2) {'a' => 1, 'b' => 2}
```

## Операции с объектами (`object.js`)

### create(proto, props)

Создает новый объект с указанным прототипом и свойствами.

```javascript
const proto = {method: () => 'test'};
deep.create(proto); // Object с proto как прототипом

deep.create(proto, {a: 1, b: 2}); // Object с proto как прототипом и свойствами a, b

deep.create(null); // Object без прототипа
```

### keys()

Возвращает массив ключей объекта.

```javascript
deep({a: 1, b: 2, c: 3}).keys(); // ['a', 'b', 'c']

deep([10, 20, 30]).keys(); // [0, 1, 2]

const map = new Map([['a', 1], ['b', 2]]);
deep(map).keys(); // ['a', 'b']
```

### values()

Возвращает массив значений объекта.

```javascript
deep({a: 1, b: 2, c: 3}).values(); // [1, 2, 3]

deep([10, 20, 30]).values(); // [10, 20, 30]

const map = new Map([['a', 1], ['b', 2]]);
deep(map).values(); // [1, 2]
```

### entries()

Возвращает массив пар [ключ, значение] объекта.

```javascript
deep({a: 1, b: 2}).entries(); // [['a', 1], ['b', 2]]

deep([10, 20]).entries(); // [[0, 10], [1, 20]]

const map = new Map([['a', 1], ['b', 2]]);
deep(map).entries(); // [['a', 1], ['b', 2]]
```

### assign(source)

Копирует свойства из источника в целевой объект.

```javascript
deep({a: 1}).assign({b: 2, c: 3}); // {a: 1, b: 2, c: 3}

deep({a: 1, b: 2}).assign({b: 3, c: 4}); // {a: 1, b: 3, c: 4}
```

### defineProperty(key, descriptor)

Определяет новое свойство объекта с указанным дескриптором.

```javascript
deep({}).defineProperty('a', {value: 1, writable: true, enumerable: true});
// Объект с свойством 'a' равным 1

deep({}).defineProperty('a', {value: 1, writable: false});
// Объект с свойством 'a' равным 1, которое нельзя изменить
```

## Операции с массивами (`arrays.js`)

### push(...items)

Добавляет элементы в конец массива.

```javascript
deep([1, 2]).push(3, 4); // [1, 2, 3, 4]
```

### pop()

Удаляет последний элемент из массива и возвращает его.

```javascript
deep([1, 2, 3]).pop(); // Возвращает 3, массив становится [1, 2]
```

### shift()

Удаляет первый элемент из массива и возвращает его.

```javascript
deep([1, 2, 3]).shift(); // Возвращает 1, массив становится [2, 3]
```

### unshift(...items)

Добавляет элементы в начало массива.

```javascript
deep([3, 4]).unshift(1, 2); // [1, 2, 3, 4]
```

### splice(start, deleteCount, ...items)

Изменяет содержимое массива, удаляя и/или добавляя элементы.

```javascript
deep([1, 2, 3, 4]).splice(1, 2, 'a', 'b'); // Возвращает [2, 3], массив становится [1, 'a', 'b', 4]
```

### reverse()

Обращает порядок элементов в массиве.

```javascript
deep([1, 2, 3]).reverse(); // [3, 2, 1]
```

### sort(compareFn)

Сортирует элементы массива.

```javascript
deep([3, 1, 2]).sort(); // [1, 2, 3]

deep([1, 2, 3]).sort((a, b) => b - a); // [3, 2, 1]
```

### fill(value, start, end)

Заполняет все элементы массива от start до end указанным значением.

```javascript
deep([1, 2, 3, 4, 5]).fill(0, 1, 4); // [1, 0, 0, 0, 5]
```

## Операции с коллекциями (`collections.js`)

### mapSet(key, value)

Устанавливает значение в Map.

```javascript
const map = new Map();
deep(map).mapSet('a', 1); // Map(1) {'a' => 1}
```

### mapDelete(key)

Удаляет запись из Map.

```javascript
const map = new Map([['a', 1], ['b', 2]]);
deep(map).mapDelete('a'); // Возвращает true, map становится Map(1) {'b' => 2}
```

### mapClear()

Очищает Map.

```javascript
const map = new Map([['a', 1], ['b', 2]]);
deep(map).mapClear(); // Map(0) {}
```

### setAdd(value)

Добавляет значение в Set.

```javascript
const set = new Set();
deep(set).setAdd(1); // Set(1) {1}
```

### setDelete(value)

Удаляет значение из Set.

```javascript
const set = new Set([1, 2]);
deep(set).setDelete(1); // Возвращает true, set становится Set(1) {2}
```

### setClear()

Очищает Set.

```javascript
const set = new Set([1, 2]);
deep(set).setClear(); // Set(0) {}
```

## Операции с WeakMap и WeakSet (`weak.js`)

### weakSet(key, value)

Устанавливает значение в WeakMap.

```javascript
const obj = {};
const weakMap = new WeakMap();
deep(weakMap).weakSet(obj, 'value'); // WeakMap {{} => 'value'}
```

### weakDelete(key)

Удаляет запись из WeakMap.

```javascript
const obj = {};
const weakMap = new WeakMap([[obj, 'value']]);
deep(weakMap).weakDelete(obj); // Возвращает true, weakMap становится пустым
```

### weakAdd(value)

Добавляет значение в WeakSet.

```javascript
const obj = {};
const weakSet = new WeakSet();
deep(weakSet).weakAdd(obj); // WeakSet {{}}
```

## Композитные операции (`composite.js`)

### replace(newValue)

Заменяет текущее значение на новое.

```javascript
const a = deep({a: 1});
a.replace({b: 2}); // a.this теперь {b: 2}
```

### transform(transformFn)

Трансформирует данные с помощью функции.

```javascript
deep({a: 1, b: 2}).transform(o => {
  o.a *= 2;
  o.c = 3;
}); // {a: 2, b: 2, c: 3}
```

## Продвинутые операции (`advanced.js`)

### upsert(key, value, defaultFn)

Обновляет или вставляет значение. Если ключ не существует, использует defaultFn для создания значения.

```javascript
deep({a: 1}).upsert('b', 2); // {a: 1, b: 2}

// Расширение массива с заполнителями
deep([1, 2, 3]).upsert(5, 'шесть', i => `пустое${i}`);
// [1, 2, 3, 'пустое3', 'пустое4', 'шесть']
```

### patch(operations)

Применяет набор операций к данным в стиле JSON Patch.

```javascript
deep({a: 1, b: {c: 2}}).patch([
  {op: 'replace', path: '/a', value: 10},
  {op: 'add', path: '/d', value: 3},
  {op: 'remove', path: '/b/c'}
]); // {a: 10, b: {}, d: 3}
```

### batch(operations, options)

Выполняет набор операций как единую транзакцию.

```javascript
deep({a: 1}).batch([
  {method: 'set', args: ['b', 2]},
  {method: 'set', args: ['c', 3]}
]); // {a: 1, b: 2, c: 3}

// С возвратом результатов
deep([1, 2, 3]).batch([
  {method: 'push', args: [4, 5]},
  {method: 'pop'}
], {returnResults: true});
// Возвращает [5, 5], массив становится [1, 2, 3, 4]
```

## Производительность

Бенчмарки показывают сравнение производительности методов deep с нативными методами JavaScript.

### Сравнение с нативными методами

| Метод | Нативный JavaScript | deep() | Разница |
|-------|-------------------|--------|---------|
| set   | `obj.prop = value` | `deep(obj).set('prop', value)` | ~450x slower |
| delete | `delete obj.prop` | `deep(obj).delete('prop')` | ~25x slower |
| add | `arr.push(value)` | `deep(arr).add(value)` | ~60x slower |
| keys | `Object.keys(obj)` | `deep(obj).keys()` | ~1300x slower |
| clone | `{...obj}` | `deep(obj).clone()` | ~425x slower |
| merge | `Object.assign(obj, src)` | `deep(obj).merge(src)` | ~26x slower |
| map.set | `map.set(key, value)` | `deep(map).mapSet(key, value)` | ~20x slower |

Производительность медленнее из-за дополнительных функций, таких как:
- Создание Association при вызове deep()
- Поддержка обработки различных типов в каждом методе
- Генерация событий для каждой операции
- Проверка типов и валидация данных

Для критичных по производительности операций рекомендуется использовать нативные методы JavaScript.

```javascript
// Примеры бенчмарков можно посмотреть в sets.benchmark.js
```

## Использование с событиями

Все методы модификации генерируют события через механизм Association.

```javascript
const obj = { a: 1 };
const a = deep(obj);

a.events.on('change', (prev, curr, prop, meta) => {
  console.log(`Объект изменен: ${JSON.stringify(prev)} -> ${JSON.stringify(curr)}`);
  console.log(`Метод: ${meta.method}, аргументы: ${JSON.stringify(meta.arguments)}`);
});

a.set('b', 2);
// Выведет:
// Объект изменен: {"a":1} -> {"a":1,"b":2}
// Метод: set, аргументы: ["b",2]
```
