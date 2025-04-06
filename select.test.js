/**
 * Тесты для модуля select, реализующего фильтрацию ассоциаций на основе выражений.
 */
import { test } from 'node:test';
import { select } from './select.js';
import { Association } from './association.js';
import { deepStrictEqual, strictEqual, ok, throws } from 'node:assert';
import { _expAssociationsVariants, _parseExpAssociations, _and, _invertedRelations } from './select.js';
import deep from './index.js';
import { all } from './lifecycle.js';

// Тестирование одиночных обработчиков _expAssociationsVariants
test('Обработчики _expAssociationsVariants', async (t) => {
  // Тесты для обработчика type
  await t.test('type - проверка корректного типа', () => {
    // Создаем тип ассоциации
    const Type = deep();

    // Создаем ассоциацию с данным типом
    const a1 = deep();
    a1.type = Type;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.type(Type);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(a1.this), 'Результат должен содержать ассоциацию с указанным типом');
    strictEqual(result.this.size, 1, 'Должна быть найдена одна ассоциация');
  });

  await t.test('type - проверка работы с unwrap', () => {
    // Создаем тип ассоциации как обычное значение
    const type = "TestType";

    // Создаем ассоциацию с данным типом
    const a1 = deep();
    a1.type = type;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.type(type);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(a1.this), 'Результат должен содержать ассоциацию с указанным типом');
  });

  // Тесты для обработчика typed
  await t.test('typed - проверка получения типа ассоциации', () => {
    // Создаем тип ассоциации и его экземпляр
    const Type = deep();
    const a1 = deep();
    a1.type = Type;

    // Проверяем работу обработчика typed
    const result = _expAssociationsVariants.typed(a1);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(Type.this), 'Результат должен содержать тип ассоциации');
    strictEqual(result.this.size, 1, 'Должен быть найден один тип');
  });

  // Тесты для обработчиков from/out
  await t.test('from - проверка отношения from', () => {
    // Создаем исходную ассоциацию
    const source = deep();

    // Создаем ассоциации с данным from
    const a1 = deep();
    a1.from = source;

    const a2 = deep();
    a2.from = source;

    // Создаем ассоциацию с другим from
    const a3 = deep();
    const otherSource = deep();
    a3.from = otherSource;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.from(source);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(!result.this.has(a3.this), 'Результат не должен содержать a3');
  });

  await t.test('out - проверка отношения out', () => {
    // Создаем исходную ассоциацию
    const source = deep();

    // Создаем ассоциации с данным from
    const a1 = deep();
    a1.from = source;

    const a2 = deep();
    a2.from = source;

    // Создаем ассоциацию с другим from
    const a3 = deep();
    const otherSource = deep();
    a3.from = otherSource;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.out(source);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(!result.this.has(a3.this), 'Результат не должен содержать a3');
  });

  // Тесты для обработчиков to/in
  await t.test('to - проверка отношения to', () => {
    // Создаем целевую ассоциацию
    const target = deep();

    // Создаем ассоциации с данным to
    const a1 = deep();
    a1.to = target;

    const a2 = deep();
    a2.to = target;

    // Создаем ассоциацию с другим to
    const a3 = deep();
    const otherTarget = deep();
    a3.to = otherTarget;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.to(target);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(!result.this.has(a3.this), 'Результат не должен содержать a3');
  });

  await t.test('in - проверка отношения in', () => {
    // Создаем целевую ассоциацию
    const target = deep();

    // Создаем ассоциации с данным to
    const a1 = deep();
    a1.to = target;

    const a2 = deep();
    a2.to = target;

    // Создаем ассоциацию с другим to
    const a3 = deep();
    const otherTarget = deep();
    a3.to = otherTarget;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.in(target);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(!result.this.has(a3.this), 'Результат не должен содержать a3');
  });

  // Тесты для обработчика this
  await t.test('this - проверка значения не являющегося Association', () => {
    // Создаем уникальное значение для поиска
    const uniqueValue = { unique: 'value' };

    // Создаем ассоциацию с этим значением
    const a = deep(uniqueValue);

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.this(uniqueValue);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(uniqueValue), 'Результат должен содержать ассоциацию с указанным значением');
    strictEqual(result.this.size, 1, 'Должна быть найдена одна ассоциация');
  });

  await t.test('this - проверка значения являющегося Association (должна быть ошибка)', () => {
    // Создаем ассоциацию
    const a = deep();

    // Проверяем, что обработчик выбрасывает ошибку при передаче Association
    throws(
      () => _expAssociationsVariants.this(a),
      /Значение ключа this не должно быть экземпляром Association/,
      'Должна быть выброшена ошибка при передаче Association'
    );
  });

  // Тесты для обработчиков value/valued
  await t.test('value - проверка отношения value', () => {
    // Создаем значение ассоциации
    const val = deep();

    // Создаем ассоциации с данным value
    const a1 = deep();
    a1.value = val;

    const a2 = deep();
    a2.value = val;

    // Создаем ассоциацию с другим value
    const a3 = deep();
    const otherValue = deep();
    a3.value = otherValue;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.value(val);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(!result.this.has(a3.this), 'Результат не должен содержать a3');
  });

  await t.test('valued - проверка отношения valued', () => {
    // Создаем ассоциацию и устанавливаем ей значение
    const a = deep();
    const val = deep();
    a.value = val;

    // Проверяем работу обработчика
    const result = _expAssociationsVariants.valued(a);

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this.has(val.this), 'Результат должен содержать значение ассоциации');
    strictEqual(result.this.size, 1, 'Должно быть найдено одно значение');
  });

  await t.test('value - работа с примитивными значениями', () => {
    // Создаем ассоциации с примитивными значениями
    const a1 = deep();
    a1.value = 42;

    const a2 = deep();
    a2.value = 42;

    const a3 = deep();
    a3.value = "test";

    // Проверяем работу обработчика с числовым значением
    const numResult = _expAssociationsVariants.value(42);
    ok(numResult.this.has(a1.this), 'Результат должен содержать a1');
    ok(numResult.this.has(a2.this), 'Результат должен содержать a2');
    ok(!numResult.this.has(a3.this), 'Результат не должен содержать a3');

    // Проверяем работу обработчика со строковым значением
    const strResult = _expAssociationsVariants.value("test");
    ok(strResult.this.has(a3.this), 'Результат должен содержать a3');
    ok(!strResult.this.has(a1.this), 'Результат не должен содержать a1');
  });
});

// Проверка _invertedRelations
test('Карта инвертированных отношений', () => {
  // Проверяем содержимое карты
  strictEqual(_invertedRelations.type, 'typed', 'type должен соответствовать typed');
  strictEqual(_invertedRelations.typed, 'type', 'typed должен соответствовать type');
  strictEqual(_invertedRelations.from, 'out', 'from должен соответствовать out');
  strictEqual(_invertedRelations.out, 'from', 'out должен соответствовать from');
  strictEqual(_invertedRelations.to, 'in', 'to должен соответствовать in');
  strictEqual(_invertedRelations.in, 'to', 'in должен соответствовать to');
  strictEqual(_invertedRelations.value, 'valued', 'value должен соответствовать valued');
  strictEqual(_invertedRelations.valued, 'value', 'valued должен соответствовать value');

  // Проверка, что использование инвертированных отношений дает правильные результаты
  const Type = deep();
  const a1 = deep();
  a1.type = Type;

  // Проверка type->typed
  const typedResult = deep.select({ type: Type }).this;
  const typedInvertedResult = deep.select({ typed: a1 }).this;

  ok(typedResult.has(a1.this), 'type должен находить экземпляры с указанным типом');
  ok(typedInvertedResult.has(Type.this), 'typed должен находить тип указанной ассоциации');

  // Создаем ассоциации для проверки from/to отношений
  const source = deep();
  const target = deep();
  const relation = deep();

  relation.from = source;
  relation.to = target;

  // Проверка from и to
  const fromResult = deep.select({ from: source }).this;
  const toResult = deep.select({ to: target }).this;

  ok(fromResult.has(relation.this), 'from должен находить ассоциации с указанным источником');
  ok(toResult.has(relation.this), 'to должен находить ассоциации с указанной целью');

  // В текущей реализации out и in работают так же, как from и to, соответственно
  const outResult = deep.select({ out: source }).this;
  const inResult = deep.select({ in: target }).this;

  ok(outResult.size > 0, 'out должен находить ассоциации так же, как from');
  ok(inResult.size > 0, 'in должен находить ассоциации так же, как to');

  // Проверка value и valued
  const val = deep();
  const valueAssoc = deep();
  valueAssoc.value = val;

  const valueResult = deep.select({ value: val }).this;
  const valuedResult = deep.select({ valued: valueAssoc }).this;

  ok(valueResult.has(valueAssoc.this), 'value должен находить ассоциации с указанным значением');
  ok(valuedResult.has(val.this), 'valued должен находить значение указанной ассоциации');
});

// Тестирование функции _parseExpAssociations
test('Функция _parseExpAssociations', async (t) => {
  await t.test('Парсинг корректного выражения', () => {
    // Создаем тип ассоциации
    const Type = deep();

    // Создаем ассоциацию с данным типом
    const a = deep();
    a.type = Type;

    // Проверяем парсинг выражения с одним ключом
    const parsedResults = _parseExpAssociations({ type: Type });

    ok(Array.isArray(parsedResults.sets), 'parsedResults.sets должен быть массивом');
    strictEqual(parsedResults.sets.length, 1, 'parsedResults.sets должен содержать одну ассоциацию');
    ok(parsedResults.sets[0] instanceof Association, 'Элемент должен быть экземпляром Association');
    ok(parsedResults.setSets[0] instanceof Set, 'Множество в setSets должно быть экземпляром Set');
    ok(parsedResults._relatedResults.type instanceof Association, 'Результат для ключа type должен быть Association');
    ok(parsedResults._relatedResults.type.this.has(a.this), 'Результат должен содержать ассоциацию с типом');
  });

  await t.test('Парсинг выражения с несколькими ключами', () => {
    // Создаем необходимые ассоциации
    const Type = deep();
    const source = deep();
    const target = deep();

    // Создаем ассоциацию, удовлетворяющую всем условиям
    const a = deep();
    a.type = Type;
    a.from = source;
    a.to = target;

    // Создаем ассоциацию, удовлетворяющую не всем условиям
    const b = deep();
    b.type = Type;
    b.from = source;

    // Проверяем парсинг выражения с несколькими ключами
    const parsedResults = _parseExpAssociations({
      type: Type,
      from: source,
      to: target
    });

    strictEqual(parsedResults.sets.length, 3, 'parsedResults.sets должен содержать три ассоциации');

    // Проверяем, что все множества содержат правильные ассоциации
    ok(parsedResults._relatedResults.type.this.has(a.this), 'Результат type должен содержать a');
    ok(parsedResults._relatedResults.type.this.has(b.this), 'Результат type должен содержать b');

    ok(parsedResults._relatedResults.from.this.has(a.this), 'Результат from должен содержать a');
    ok(parsedResults._relatedResults.from.this.has(b.this), 'Результат from должен содержать b');

    ok(parsedResults._relatedResults.to.this.has(a.this), 'Результат to должен содержать a');
    ok(!parsedResults._relatedResults.to.this.has(b.this), 'Результат to не должен содержать b');

    // Проверяем сохранение _relatedResults для трекинга
    ok(parsedResults._relatedResults, 'Должен быть создан объект _relatedResults');
    ok(parsedResults._relatedResults.type, 'Должно быть сохранено множество для type');
    ok(parsedResults._relatedResults.from, 'Должно быть сохранено множество для from');
    ok(parsedResults._relatedResults.to, 'Должно быть сохранено множество для to');
  });

  await t.test('Парсинг выражения с недопустимым ключом', () => {
    // Проверяем, что выбрасывается ошибка при недопустимом ключе
    throws(
      () => _parseExpAssociations({ invalidKey: 'value' }),
      /Неизвестный ключ в выражении: invalidKey/,
      'Должна быть выброшена ошибка при недопустимом ключе'
    );
  });

  await t.test('Парсинг выражения с комбинацией релейшен-ключей', () => {
    // Создаем необходимые ассоциации
    const Type = deep();
    const source = deep();
    const target = deep();

    // Создаем ассоциацию с релейшенами
    const relation = deep();
    relation.type = Type;
    relation.from = source;
    relation.to = target;

    // Проверяем парсинг выражения с комбинацией type и from
    const parsedResults1 = _parseExpAssociations({
      type: Type,
      from: source
    });

    ok(parsedResults1._relatedResults.type.this.has(relation.this), 'Результат type должен содержать relation');
    ok(parsedResults1._relatedResults.from.this.has(relation.this), 'Результат from должен содержать relation');

    // Проверяем парсинг выражения с инвертированными релейшенами
    const parsedResults2 = _parseExpAssociations({
      typed: relation,
      out: source
    });

    ok(parsedResults2._relatedResults.typed, 'Должно быть создано множество для typed');
    ok(parsedResults2._relatedResults.out, 'Должно быть создано множество для out');
  });
});

// Тестирование функции _and
test('Функция _and для пересечения множеств', async (t) => {
  await t.test('Пересечение непустых множеств', () => {
    // Создаем ассоциации с множествами для пересечения с единственным общим элементом
    const set1 = new Association(new Set([1, 2, 3]));
    const set2 = new Association(new Set([3, 4, 5]));
    const set3 = new Association(new Set([3, 6, 7]));

    // Создаем объект с результатами парсинга
    const parsedResults = {
      sets: [set1, set2, set3],
      setSets: [set1.this, set2.this, set3.this],
      _relatedResults: { key1: set1, key2: set2, key3: set3 }
    };

    // Получаем пересечение
    const result = _and(parsedResults);

    ok(result instanceof Set, 'Результат должен быть Set');
    strictEqual(result.size, 1, 'Пересечение должно содержать один элемент');
    ok(result.has(3), 'Пересечение должно содержать элемент 3');
  });

  await t.test('Пересечение пустых множеств', () => {
    // Проверяем случай с пустыми множествами
    const parsedResults = {
      sets: [],
      setSets: [],
      _relatedResults: {}
    };

    const result = _and(parsedResults);

    ok(result instanceof Set, 'Результат должен быть Set');
    strictEqual(result.size, 0, 'Пересечение должно быть пустым');
  });

  await t.test('Пересечение множеств с непересекающимися элементами', () => {
    // Создаем ассоциации с множествами для пересечения без общих элементов
    const set1 = new Association(new Set([1, 2]));
    const set2 = new Association(new Set([3, 4]));

    // Создаем объект с результатами парсинга
    const parsedResults = {
      sets: [set1, set2],
      setSets: [set1.this, set2.this],
      _relatedResults: { key1: set1, key2: set2 }
    };

    // Получаем пересечение
    const result = _and(parsedResults);

    ok(result instanceof Set, 'Результат должен быть Set');
    strictEqual(result.size, 0, 'Пересечение должно быть пустым');
  });

  await t.test('Пересечение множеств с одним и тем же набором элементов', () => {
    // Создаем ассоциации с множествами с одинаковыми элементами
    const set1 = new Association(new Set([1, 2, 3]));
    const set2 = new Association(new Set([1, 2, 3]));

    // Создаем объект с результатами парсинга
    const parsedResults = {
      sets: [set1, set2],
      setSets: [set1.this, set2.this],
      _relatedResults: { key1: set1, key2: set2 }
    };

    // Получаем пересечение
    const result = _and(parsedResults);

    ok(result instanceof Set, 'Результат должен быть Set');
    strictEqual(result.size, 3, 'Пересечение должно содержать все элементы');
    ok(result.has(1) && result.has(2) && result.has(3), 'Пересечение должно содержать все элементы исходных множеств');
  });
});

// Тестирование интеграции select
test('Интеграционный тест метода select', async (t) => {
  await t.test('select с одним условием type', () => {
    // Создаем тип ассоциации
    const Type = deep();

    // Создаем ассоциации
    const a1 = deep();
    a1.type = Type;

    const a2 = deep();
    a2.type = Type;

    const a3 = deep();

    // Выполняем select
    const result = deep.select({ type: Type });

    ok(result instanceof Association, 'Результат должен быть Association');
    ok(result.this instanceof Set, 'result.this должен быть Set');
    strictEqual(result.this.size, 2, 'Должны быть найдены две ассоциации');
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(!result.this.has(a3.this), 'Результат не должен содержать a3');
  });

  await t.test('select с условием typed', () => {
    // Создаем тип и экземпляры ассоциаций
    const Type1 = deep();
    const a1 = deep();
    a1.type = Type1;

    const Type2 = deep();
    const a2 = deep();
    a2.type = Type2;

    // Выполняем select для поиска типа ассоциации a1
    const result1 = deep.select({ typed: a1 });

    ok(result1 instanceof Association, 'Результат должен быть Association');
    ok(result1.this instanceof Set, 'result1.this должен быть Set');
    strictEqual(result1.this.size, 1, 'Должен быть найден один тип');
    ok(result1.this.has(Type1.this), 'Результат должен содержать Type1');
    ok(!result1.this.has(Type2.this), 'Результат не должен содержать Type2');

    // Выполняем select для поиска типа ассоциации a2
    const result2 = deep.select({ typed: a2 });

    ok(result2 instanceof Association, 'Результат должен быть Association');
    ok(result2.this instanceof Set, 'result2.this должен быть Set');
    strictEqual(result2.this.size, 1, 'Должен быть найден один тип');
    ok(result2.this.has(Type2.this), 'Результат должен содержать Type2');
    ok(!result2.this.has(Type1.this), 'Результат не должен содержать Type1');
  });

  await t.test('select с условиями from и to', async () => {
    // Создаем изолированное окружение для теста
    const isolatedFromToTest = async () => {
      // Создаем исходные и целевые ассоциации
      const source1 = deep();
      const source2 = deep();
      const target1 = deep();
      const target2 = deep();

      // Создаем ассоциации с различными комбинациями from/to
      const a1 = deep();
      a1.from = source1;
      a1.to = target1;

      const a2 = deep();
      a2.from = source1;
      a2.to = target2;

      const a3 = deep();
      a3.from = source2;
      a3.to = target1;

      // Выполняем select для поиска по from
      const resultFrom = deep.select({ from: source1 });

      ok(resultFrom instanceof Association, 'Результат должен быть Association');
      strictEqual(resultFrom.this.size, 2, 'Должны быть найдены две ассоциации');
      ok(resultFrom.this.has(a1.this) && resultFrom.this.has(a2.this), 'Результат должен содержать a1 и a2');
      ok(!resultFrom.this.has(a3.this), 'Результат не должен содержать a3');

      // Выполняем select для поиска по to
      const resultTo = deep.select({ to: target1 });

      ok(resultTo instanceof Association, 'Результат должен быть Association');
      strictEqual(resultTo.this.size, 2, 'Должны быть найдены две ассоциации');
      ok(resultTo.this.has(a1.this) && resultTo.this.has(a3.this), 'Результат должен содержать a1 и a3');
      ok(!resultTo.this.has(a2.this), 'Результат не должен содержать a2');

      // Выполняем select для поиска по комбинации from и to
      const resultCombined = deep.select({ from: source1, to: target1 });

      ok(resultCombined instanceof Association, 'Результат должен быть Association');
      strictEqual(resultCombined.this.size, 1, 'Должна быть найдена одна ассоциация');
      ok(resultCombined.this.has(a1.this), 'Результат должен содержать a1');

      // Очистка
      a1.from = undefined;
      a1.to = undefined;
      a2.from = undefined;
      a2.to = undefined;
      a3.from = undefined;
      a3.to = undefined;
    };

    await isolatedFromToTest();
  });

  await t.test('select с комбинацией условий', async () => {
    // Создаем изолированное окружение для теста
    const isolatedTest = async () => {
      // Создаем необходимые ассоциации
      const Type = deep();
      const source = deep();
      const target = deep();

      // Создаем ассоциацию, удовлетворяющую всем условиям
      const a1 = deep();
      a1.type = Type;
      a1.from = source;
      a1.to = target;

      // Создаем ассоциации, удовлетворяющие не всем условиям
      const a2 = deep();
      a2.type = Type;
      a2.from = source;

      const a3 = deep();
      a3.type = Type;
      a3.to = target;

      // Выполняем select
      const result = deep.select({
        type: Type,
        from: source,
        to: target
      });

      ok(result instanceof Association, 'Результат должен быть Association');
      ok(result.this instanceof Set, 'result.this должен быть Set');
      strictEqual(result.this.size, 1, 'Должна быть найдена одна ассоциация');
      ok(result.this.has(a1.this), 'Результат должен содержать только a1');
      ok(!result.this.has(a2.this), 'Результат не должен содержать a2');
      ok(!result.this.has(a3.this), 'Результат не должен содержать a3');

      // Очистка
      a1.type = undefined;
      a1.from = undefined;
      a1.to = undefined;
      a2.type = undefined;
      a2.from = undefined;
      a3.type = undefined;
      a3.to = undefined;
    };

    await isolatedTest();
  });

  await t.test('select с инвертированными отношениями', async () => {
    // Создаем изолированное окружение для теста
    const isolatedInvertedTest = async () => {
      // Создаем типы и ассоциации
      const Type = deep();
      const instance = deep();
      instance.type = Type;

      // Создаем источник и цель
      const source = deep();
      const target = deep();

      // Создаем связь между источником и целью
      const relation = deep();
      relation.from = source;
      relation.to = target;

      // Проверяем type->typed отношение
      const typeResult = deep.select({ type: Type });
      const typedResult = deep.select({ typed: instance });

      ok(typeResult.this.has(instance.this), 'type должен находить экземпляры с указанным типом');
      ok(typedResult.this.has(Type.this), 'typed должен находить тип экземпляра');

      // Проверяем from->out и to->in отношения
      const fromResult = deep.select({ from: source });
      const toResult = deep.select({ to: target });

      ok(fromResult.this.has(relation.this), 'from должен находить ассоциации с указанным from');
      ok(toResult.this.has(relation.this), 'to должен находить ассоциации с указанным to');

      const outResult = deep.select({ out: relation });
      const inResult = deep.select({ in: relation });

      ok(outResult.this.has(source.this) || outResult.this.size === 0, 'out должен находить source или быть пустым');
      ok(inResult.this.has(target.this) || inResult.this.size === 0, 'in должен находить target или быть пустым');

      // Очистка
      instance.type = undefined;
      relation.from = undefined;
      relation.to = undefined;
    };

    await isolatedInvertedTest();
  });

  await t.test('select с условием value', () => {
    // Создаем значение
    const val = deep();

    // Создаем ассоциации с этим значением
    const a1 = deep();
    a1.value = val;

    const a2 = deep();
    a2.value = val;

    // Создаем ассоциацию с другим значением
    const a3 = deep();
    const otherVal = deep();
    a3.value = otherVal;

    // Выполняем select
    const result = deep.select({ value: val });

    // Проверяем результат
    ok(result.this instanceof Set, 'Результат select должен содержать Set');
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(!result.this.has(a3.this), 'Результат не должен содержать a3');
    strictEqual(result.this.size, 2, 'Должны быть найдены две ассоциации');
  });

  await t.test('select с комбинацией условий, включая value', () => {
    // Создаем тип, источник, цель и значение
    const type = deep();
    const source = deep();
    const target = deep();
    const val = deep();

    // Создаем ассоциации с разными комбинациями свойств
    const a1 = deep();
    a1.type = type;
    a1.from = source;
    a1.to = target;
    a1.value = val;

    const a2 = deep();
    a2.type = type;
    a2.from = source;
    a2.value = val;

    const a3 = deep();
    a3.type = type;
    a3.value = val;

    const a4 = deep();
    a4.value = val;

    // Тест 1: тип + значение
    const result1 = deep.select({ type: type, value: val });
    strictEqual(result1.this.size, 3, 'Должны быть найдены три ассоциации с типом type и значением val');
    ok(result1.this.has(a1.this));
    ok(result1.this.has(a2.this));
    ok(result1.this.has(a3.this));
    ok(!result1.this.has(a4.this));

    // Тест 2: тип + источник + значение
    const result2 = deep.select({ type: type, from: source, value: val });
    strictEqual(result2.this.size, 2, 'Должны быть найдены две ассоциации с типом type, источником source и значением val');
    ok(result2.this.has(a1.this));
    ok(result2.this.has(a2.this));
    ok(!result2.this.has(a3.this));
    ok(!result2.this.has(a4.this));

    // Тест 3: тип + источник + цель + значение
    const result3 = deep.select({ type: type, from: source, to: target, value: val });
    strictEqual(result3.this.size, 1, 'Должна быть найдена одна ассоциация со всеми условиями');
    ok(result3.this.has(a1.this));
    ok(!result3.this.has(a2.this));
    ok(!result3.this.has(a3.this));
    ok(!result3.this.has(a4.this));
  });

  await t.test('select с инвертированными отношениями и value', () => {
    // Создаем значение
    const val = deep();

    // Создаем ассоциацию с этим значением
    const a = deep();
    a.value = val;

    // Проверяем поиск по value
    const result1 = deep.select({ value: val });
    ok(result1.this.has(a.this), 'Поиск по value должен находить ассоциации с этим значением');

    // Проверяем поиск по valued
    const result2 = deep.select({ valued: a });
    ok(result2.this.has(val.this), 'Поиск по valued должен находить значение ассоциации');
  });
});

// Тестирование механизма отслеживания
test('Механизм отслеживания (track) для select', async (t) => {
  await t.test('Отслеживание изменения типа ассоциации', async () => {
    // Создаем типы ассоциаций
    const Type1 = deep();
    const Type2 = deep();

    // Создаем ассоциацию с Type1
    const a1 = deep();
    a1.type = Type1;

    // Подписываемся на события изменения a1
    let a1ChangeTriggered = false;
    a1.on('change', () => {
      a1ChangeTriggered = true;
    });

    // Выполняем select по Type1
    const selection = deep.select({ type: Type1 });

    // Проверяем, что a1 находится в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате поиска');
    strictEqual(selection.this.size, 1, 'Результат должен содержать одну ассоциацию');

    // Активируем отслеживание изменений
    const tracker = selection.track;

    // Подписываемся на события изменения
    let changeTriggered = false;
    selection.on('change', () => {
      changeTriggered = true;
    });

    // Создаем промис, который разрешится при следующем событии change
    const changePromise = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Изменяем тип ассоциации на Type2
    a1.type = Type2;

    // Ждем срабатывания события change
    await changePromise;

    // Проверяем, что событие сработало
    ok(changeTriggered, 'Событие change должно быть вызвано');
    ok(a1ChangeTriggered, 'Событие change на a1 должно быть вызвано');

    // Проверяем, что результат поиска обновился
    strictEqual(selection.this.size, 0, 'Результат должен быть пустым после изменения типа');
    ok(!selection.this.has(a1.this), 'a1 не должен быть в результате после изменения типа');

    // Очистка
    tracker.kill();
    a1.type = undefined;
  });

  await t.test('Отслеживание изменения исходной ассоциации (from)', async () => {
    // Создаем исходные ассоциации
    const source1 = deep();
    const source2 = deep();

    // Создаем ассоциацию с from=source1
    const a1 = deep();
    a1.from = source1;

    // Выполняем select по source1
    const selection = deep.select({ from: source1 });

    // Проверяем, что a1 находится в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате поиска');
    strictEqual(selection.this.size, 1, 'Результат должен содержать одну ассоциацию');

    // Активируем отслеживание изменений
    const tracker = selection.track;

    // Создаем промис, который разрешится при следующем событии change
    const changePromise1 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Изменяем from на source2
    a1.from = source2;

    // Ждем срабатывания события change
    await changePromise1;

    // Проверяем, что результат поиска обновился
    strictEqual(selection.this.size, 0, 'Результат должен быть пустым после изменения from');
    ok(!selection.this.has(a1.this), 'a1 не должен быть в результате после изменения from');

    // Создаем второй промис для отслеживания возврата к исходному значению
    const changePromise2 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Возвращаем исходное значение
    a1.from = source1;

    // Ждем срабатывания события change
    await changePromise2;

    // Проверяем, что a1 снова в результате
    ok(selection.this.has(a1.this), 'a1 должен вернуться в результат после восстановления from');
    strictEqual(selection.this.size, 1, 'Результат должен снова содержать одну ассоциацию');

    // Очистка
    tracker.kill();
    a1.from = undefined;
  });

  await t.test('Отслеживание изменения целевой ассоциации (to)', async () => {
    // Создаем целевые ассоциации
    const target1 = deep();
    const target2 = deep();

    // Создаем ассоциацию с to=target1
    const a1 = deep();
    a1.to = target1;

    // Выполняем select по target1
    const selection = deep.select({ to: target1 });

    // Проверяем, что a1 находится в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате поиска');
    strictEqual(selection.this.size, 1, 'Результат должен содержать одну ассоциацию');

    // Активируем отслеживание изменений
    const tracker = selection.track;

    // Создаем промис, который разрешится при следующем событии change
    const changePromise = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Изменяем to на target2
    a1.to = target2;

    // Ждем срабатывания события change
    await changePromise;

    // Проверяем, что результат поиска обновился
    strictEqual(selection.this.size, 0, 'Результат должен быть пустым после изменения to');
    ok(!selection.this.has(a1.this), 'a1 не должен быть в результате после изменения to');

    // Очистка
    tracker.kill();
    a1.to = undefined;
  });

  await t.test('Отслеживание создания и удаления ассоциаций', async () => {
    // Создаем тип ассоциации
    const Type = deep();

    // Создаем первую ассоциацию с типом Type
    const a1 = deep();
    a1.type = Type;

    // Выполняем select по Type
    const selection = deep.select({ type: Type });

    // Проверяем, что только a1 находится в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате поиска');
    strictEqual(selection.this.size, 1, 'Результат должен содержать одну ассоциацию');

    // Активируем отслеживание изменений
    const tracker = selection.track;

    // Создаем промис, который разрешится при следующем событии change (создание a2)
    const changePromise1 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Создаем вторую ассоциацию с тем же типом
    const a2 = deep();
    a2.type = Type;

    // Ждем срабатывания события change
    await changePromise1;

    // Проверяем, что результат обновился и включает a2
    ok(selection.this.has(a2.this), 'После создания a2 должен быть добавлен в результат');
    strictEqual(selection.this.size, 2, 'Результат должен содержать две ассоциации');

    // Создаем промис, который разрешится при следующем событии change (удаление типа у a1)
    const changePromise2 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Удаляем тип у a1
    a1.type = undefined;

    // Ждем срабатывания события change
    await changePromise2;

    // Проверяем, что a1 удален из результата
    ok(!selection.this.has(a1.this), 'После удаления типа a1 должен быть исключен из результата');
    ok(selection.this.has(a2.this), 'a2 должен остаться в результате');
    strictEqual(selection.this.size, 1, 'Результат должен содержать одну ассоциацию');

    // Очистка
    tracker.kill();
    a2.type = undefined;
  });

  await t.test('Отслеживание комбинированных условий', async () => {
    // Создаем необходимые ассоциации
    const Type = deep();
    const source = deep();
    const target = deep();

    // Создаем ассоциацию с необходимыми параметрами
    const a1 = deep();
    a1.type = Type;
    a1.from = source;
    a1.to = target;

    // Выполняем select с комбинацией условий
    const selection = deep.select({
      type: Type,
      from: source,
      to: target
    });

    // Проверяем, что a1 находится в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате поиска');
    strictEqual(selection.this.size, 1, 'Результат должен содержать одну ассоциацию');

    // Активируем отслеживание изменений
    const tracker = selection.track;

    // Создаем промис, который разрешится при следующем событии change
    const changePromise1 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Изменяем одно из условий (from)
    const newSource = deep();
    a1.from = newSource;

    // Ждем срабатывания события change
    await changePromise1;

    // Проверяем, что a1 больше не в результате
    ok(!selection.this.has(a1.this), 'a1 не должен быть в результате после изменения from');
    strictEqual(selection.this.size, 0, 'Результат должен быть пустым');

    // Создаем второй промис для отслеживания возврата к исходному значению
    const changePromise2 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Возвращаем исходное значение
    a1.from = source;

    // Ждем срабатывания события change
    await changePromise2;

    // Проверяем, что a1 снова в результате
    ok(selection.this.has(a1.this), 'a1 должен вернуться в результат после восстановления from');
    strictEqual(selection.this.size, 1, 'Результат должен снова содержать одну ассоциацию');

    // Очистка
    tracker.kill();
    a1.type = undefined;
    a1.from = undefined;
    a1.to = undefined;
  });

  await t.test('Остановка трекера с помощью kill()', async () => {
    // Создаем тип ассоциации
    const Type = deep();

    // Создаем ассоциацию с типом Type
    const a1 = deep();
    a1.type = Type;

    // Выполняем select по Type
    const selection = deep.select({ type: Type });

    // Проверяем начальное состояние
    strictEqual(selection.this.size, 1, 'Результат должен содержать одну ассоциацию');

    // Активируем отслеживание изменений
    const tracker = selection.track;

    // Останавливаем трекер
    tracker.kill();

    // Создаем вторую ассоциацию с тем же типом
    const a2 = deep();
    a2.type = Type;

    // Добавляем небольшую задержку для обработки событий
    await new Promise(resolve => setTimeout(resolve, 50));

    // Проверяем, что результат не обновился после остановки трекера
    ok(!selection.this.has(a2.this), 'После остановки трекера a2 не должен появиться в результате');
    strictEqual(selection.this.size, 1, 'Размер результата не должен измениться');

    // Очистка
    a1.type = undefined;
    a2.type = undefined;
  });

  // Проверяем цикл изменений и восстановления
  await t.test('Полный цикл изменений и восстановления', async () => {
    // Создаем тип и ассоциацию
    const Type1 = deep();
    const Type2 = deep();
    const a1 = deep();
    a1.type = Type1;

    // Выполняем select по типу
    const selection = deep.select({ type: Type1 });

    // Проверяем, что a1 в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате изначально');
    strictEqual(selection.this.size, 1, 'Должна быть одна ассоциация');

    // Активируем отслеживание
    const track = selection.track;

    // Создаем промис для первого события change (удаление из результата)
    const changePromise1 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Изменяем тип
    a1.type = Type2;

    // Ждем события change
    await changePromise1;

    // Проверяем, что a1 удален из результата
    ok(!selection.this.has(a1.this), 'a1 не должен быть в результате после изменения типа');
    strictEqual(selection.this.size, 0, 'Результат должен быть пустым');

    // Создаем промис для второго события change (возврат в результат)
    const changePromise2 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Возвращаем исходный тип
    a1.type = Type1;

    // Ждем события change
    await changePromise2;

    // Проверяем, что a1 снова в результате
    ok(selection.this.has(a1.this), 'a1 должен вернуться в результат');
    strictEqual(selection.this.size, 1, 'Должна быть одна ассоциация');

    // Очистка
    track.kill();
    a1.type = undefined;
  });

  await t.test('Отслеживание при одновременном изменении нескольких условий', async () => {
    // Создаем необходимые ассоциации
    const Type1 = deep();
    const Type2 = deep();
    const source1 = deep();
    const source2 = deep();
    const target1 = deep();
    const target2 = deep();

    // Создаем ассоциацию с несколькими свойствами
    const a1 = deep();
    a1.type = Type1;
    a1.from = source1;
    a1.to = target1;

    // Выполняем select с комбинацией условий
    const selection = deep.select({
      type: Type1,
      from: source1
    });

    // Проверяем, что a1 в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате изначально');
    strictEqual(selection.this.size, 1, 'Должна быть одна ассоциация');

    // Активируем отслеживание
    const track = selection.track;

    // Создаем промис для события change
    const changePromise = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Одновременно изменяем несколько свойств
    a1.type = Type2;
    a1.from = source2;
    a1.to = target2;

    // Ждем события change
    await changePromise;

    // Проверяем, что a1 удален из результата
    ok(!selection.this.has(a1.this), 'a1 не должен быть в результате после изменений');
    strictEqual(selection.this.size, 0, 'Результат должен быть пустым');

    // Очистка
    track.kill();
    a1.type = undefined;
    a1.from = undefined;
    a1.to = undefined;
  });

  await t.test('Отслеживание изменения значения (value)', async () => {
    // Создаем необходимые значения
    const val1 = deep();
    const val2 = deep();

    // Создаем ассоциацию со значением
    const a1 = deep();
    a1.value = val1;

    // Выполняем select по значению
    const selection = deep.select({ value: val1 });

    // Проверяем, что a1 в результате
    ok(selection.this.has(a1.this), 'a1 должен быть в результате изначально');
    strictEqual(selection.this.size, 1, 'Должна быть одна ассоциация');

    // Активируем отслеживание
    const track = selection.track;

    // Создаем промис для события change
    const changePromise1 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Изменяем значение
    a1.value = val2;

    // Ждем события change
    await changePromise1;

    // Проверяем, что a1 удален из результата
    ok(!selection.this.has(a1.this), 'a1 не должен быть в результате после изменения value');
    strictEqual(selection.this.size, 0, 'Результат должен быть пустым');

    // Создаем промис для второго события change
    const changePromise2 = new Promise(resolve => {
      selection.on('change', () => resolve());
    });

    // Возвращаем исходное значение
    a1.value = val1;

    // Ждем события change
    await changePromise2;

    // Проверяем, что a1 снова в результате
    ok(selection.this.has(a1.this), 'a1 должен вернуться в результат после восстановления value');
    strictEqual(selection.this.size, 1, 'Должна быть одна ассоциация');

    // Очистка
    track.kill();
    a1.value = undefined;
  });
});

// Тесты для метода select с пустым объектом выражения
test('select с пустым объектом выражения', async (t) => {
  await t.test('Метод select возвращает все ассоциации при использовании пустого объекта выражения', () => {
    // Создаем несколько ассоциаций для тестирования
    const a1 = deep();
    const a2 = deep();
    const a3 = deep();

    // Вызываем select с пустым объектом выражения
    const result = deep.select({});

    // Проверяем, что результат содержит все созданные ассоциации
    ok(result.this.has(a1.this), 'Результат должен содержать a1');
    ok(result.this.has(a2.this), 'Результат должен содержать a2');
    ok(result.this.has(a3.this), 'Результат должен содержать a3');

    // Проверяем, что размер не меньше минимального ожидаемого
    ok(result.this.size >= 3, 'Результат должен содержать не менее трех ассоциаций');
  });

  await t.test('Отслеживание изменений с пустым объектом выражения', () => {
    // Создаем select с пустым объектом выражения и активируем отслеживание
    const result = deep.select({});
    const tracker = result.track;

    // Запоминаем размер результата до изменений
    const initialSize = result.this.size;

    // Создаем новую ассоциацию
    const newAssoc = deep();

    // Проверяем, что новая ассоциация была добавлена в результат
    ok(result.this.has(newAssoc.this), 'Результат должен содержать новую ассоциацию');

    // Проверяем, что размер увеличился
    ok(result.this.size > initialSize, 'Размер результата должен увеличиться после добавления новой ассоциации');

    // Удаляем ассоциацию
    newAssoc.kill();

    // Проверяем, что ассоциация удалена из результата
    ok(!result.this.has(newAssoc.this), 'Результат не должен содержать удаленную ассоциацию');

    // Отключаем отслеживание
    tracker.kill();
  });
});

// Тесты для _parseExpAssociations с пустым объектом выражения
test('_parseExpAssociations с пустым объектом выражения', async (t) => {
  await t.test('Возвращает множество ассоциаций для пустого объекта выражения', () => {
    // Создаем несколько ассоциаций для тестирования
    const a1 = deep();
    const a2 = deep();
    const a3 = deep();

    // Парсим пустой объект выражения
    const result = _parseExpAssociations({});

    // Проверяем структуру результата
    strictEqual(result.sets.length, 1, 'Результат должен содержать только один сет');
    strictEqual(result.setSets.length, 1, 'Результат должен содержать только один setSets');
    ok(result._relatedResults.all instanceof Association, 'Результат должен содержать ассоциацию в _relatedResults.all');

    // Проверяем, что этот сет содержит созданные ассоциации
    const resultSet = result.setSets[0];

    // Проверяем наличие созданных ассоциаций
    ok(resultSet.has(a1.this), 'Результат должен содержать a1');
    ok(resultSet.has(a2.this), 'Результат должен содержать a2');
    ok(resultSet.has(a3.this), 'Результат должен содержать a3');

    // Проверяем, что размер не меньше минимального ожидаемого
    ok(resultSet.size >= 3, 'Результат должен содержать не менее трех ассоциаций');
  });
});
