# Методы модификации данных (sets.js)

Модуль `sets.js` содержит набор универсальных методов для внесения изменений в данные разных типов, оптимизированных для использования с классом Association. Все методы генерируют события change и специфические события для каждой операции.

## Производительность

**Информация о системе:**

- clk: ~1.47 GHz
- cpu: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- runtime: node 23.4.0 (x64-darwin)

| Тест | Среднее время выполнения | Операций в секунду |
|------|--------------------------|--------------------|
| Object.property = value (нативный) | 342.37 ns/итер | 2 920 816,66 опер/сек |
| deep(Object).set | 6.26 µs/итер | 159 744,409 опер/сек |
| Array[index] = value (нативный) | 1.13 µs/итер | 884 955,752 опер/сек |
| deep(Array).set | 3.15 µs/итер | 317 460,317 опер/сек |
| Map.set (нативный) | 9.71 µs/итер | 102 986,612 опер/сек |
| deep(Map).mapSet | 23.43 µs/итер | 42 680,324 опер/сек |
| delete Object.property (нативный) | 5.26 µs/итер | 190 114,068 опер/сек |
| deep(Object).delete | 13.02 µs/итер | 76 804,916 опер/сек |
| Map.delete (нативный) | 13.36 µs/итер | 74 850,299 опер/сек |
| deep(Map).mapDelete | 29.83 µs/итер | 33 523,299 опер/сек |
| Set.delete (нативный) | 1.41 µs/итер | 709 219,858 опер/сек |
| deep(Set).setDelete | 6.70 µs/итер | 149 253,731 опер/сек |
| Array.push (нативный) | 3.12 µs/итер | 320 512,821 опер/сек |
| deep(Array).push | 8.08 µs/итер | 123 762,376 опер/сек |
| Array.pop (нативный) | 822.24 ns/итер | 1 216 189,92 опер/сек |
| deep(Array).pop | 6.11 µs/итер | 163 666,121 опер/сек |
| Array.splice (нативный) | 1.06 µs/итер | 943 396,226 опер/сек |
| deep(Array).splice | 4.26 µs/итер | 234 741,784 опер/сек |
| Array.reverse (нативный) | 2.18 µs/итер | 458 715,596 опер/сек |
| deep(Array).reverse | 5.54 µs/итер | 180 505,415 опер/сек |
| Object.keys().forEach(key => delete) (нативный) | 9.03 µs/итер | 110 741,971 опер/сек |
| deep(Object).clear | 11.55 µs/итер | 86 580,087 опер/сек |
| Array.length = 0 (нативный) | 784.21 ns/итер | 1 275 168,641 опер/сек |
| deep(Array).clear | 2.81 µs/итер | 355 871,886 опер/сек |
| Map.clear (нативный) | 9.18 µs/итер | 108 932,462 опер/сек |
| deep(Map).clear | 11.89 µs/итер | 84 104,289 опер/сек |
| Set.clear (нативный) | 1.16 µs/итер | 862 068,966 опер/сек |
| deep(Set).clear | 3.14 µs/итер | 318 471,338 опер/сек |
| Object.assign (нативный) | 5.24 µs/итер | 190 839,695 опер/сек |
| deep(Object).assign | 9.06 µs/итер | 110 375,276 опер/сек |
| deep(Object).merge | 10.99 µs/итер | 90 991,811 опер/сек |
| deep(Array).merge с массивом | 6.29 µs/итер | 158 982,512 опер/сек |
| Object.defineProperty (нативный) | 753.79 ns/итер | 1 326 629,433 опер/сек |
| deep(Object).defineProperty | 2.94 µs/итер | 340 136,054 опер/сек |
| Object.create (нативный) | 870.72 ns/итер | 1 148 474,825 опер/сек |
| deep.create | 501.65 ns/итер | 1 993 421,708 опер/сек |
| Object.create c дескрипторами (нативный) | 2.71 µs/итер | 369 003,69 опер/сек |
| deep.create c свойствами | 566.11 ns/итер | 1 766 441,151 опер/сек |
| Object spread {...obj} (нативный) | 438.53 ns/итер | 2 280 345,7 опер/сек |
| deep(Object).clone | 3.21 µs/итер | 311 526,48 опер/сек |
| Array slice (нативный) | 2.10 µs/итер | 476 190,476 опер/сек |
| deep(Array).clone | 4.30 µs/итер | 232 558,14 опер/сек |
| new Map(map) (нативный) | 18.96 µs/итер | 52 742,616 опер/сек |
| deep(Map).clone | 21.46 µs/итер | 46 598,322 опер/сек |
| Array.push (нативный) | 2.01 µs/итер | 497 512,438 опер/сек |
| deep(Array).add | 4.58 µs/итер | 218 340,611 опер/сек |
| Array.splice для удаления (нативный) | 846.32 ns/итер | 1 181 586,161 опер/сек |
| deep(Array).remove | 3.01 µs/итер | 332 225,914 опер/сек |
| Array.includes (нативный) | 772.26 ns/итер | 1 294 900,681 опер/сек |
| deep(Array).has | 2.65 µs/итер | 377 358,491 опер/сек |
| Array[index] (нативный) | 836.20 ns/итер | 1 195 886,152 опер/сек |
| deep(Array).get | 3.62 µs/итер | 276 243,094 опер/сек |
| Object.keys (нативный) | 144.10 ns/итер | 6 939 625,26 опер/сек |
| deep(Object).keys | 2.36 µs/итер | 423 728,814 опер/сек |
| Object.values (нативный) | 913.62 ns/итер | 1 094 546,967 опер/сек |
| deep(Object).values | 4.26 µs/итер | 234 741,784 опер/сек |
| Object.entries (нативный) | 1.34 µs/итер | 746 268,657 опер/сек |
| deep(Object).entries | 3.45 µs/итер | 289 855,072 опер/сек |
| Array.from(map.entries()) (нативный) | 619.90 ns/итер | 1 613 163,413 опер/сек |
| deep(Map).convert("array") | 7.24 µs/итер | 138 121,547 опер/сек |
| Object.fromEntries(map) (нативный) | 495.94 ns/итер | 2 016 372,948 опер/сек |
| deep(Map).convert("object") | 19.84 µs/итер | 50 403,226 опер/сек |
| new Set(array) (нативный) | 116.37 ns/итер | 8 593 280,055 опер/сек |
| deep(Array).convert("set") | 46.80 µs/итер | 21 367,521 опер/сек |
| JSON.stringify(obj) (нативный) | 280.97 ns/итер | 3 559 098,836 опер/сек |
| deep(Object).convert("json") | 8.36 µs/итер | 119 617,225 опер/сек |
| Первый доступ к глубокому методу | 1.71 µs/итер | 584 795,322 опер/сек |
| Второй доступ к глубокому методу (кеширование) | 1.94 µs/итер | 515 463,918 опер/сек |
| Многократный вызов метода | 8.45 µs/итер | 118 343,195 опер/сек |

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
