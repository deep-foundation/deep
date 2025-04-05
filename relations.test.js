/**
 * Тесты для модуля relations, реализующего ассоциативные связи.
 */
import { describe, it } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { Association } from './association.js';
import { type, types, typed, from, froms, out, to, tos, into, value, values, valued } from './relations.js';
import deep from './index.js';
import { kill } from './lifecycle.js';
import { strict as assert } from 'node:assert';

describe('Association type', () => {
  it('ass.type must be Association or undefined', () => {
    const A = deep();
    const a = deep();
    a.type = A;
    strictEqual(a.type.this, A.this);
    ok(a.type instanceof Association);
    strictEqual(A.type, undefined);
    strictEqual(a.type.this, A.this);
  });
});

describe('Association typed', () => {
  it('A.typed should return Association containing Set of instances of this type', () => {
    const A = deep();
    const a1 = deep();
    a1.type = A;
    const a2 = deep();
    a2.type = A;
    const B = deep();
    const b1 = deep();
    b1.type = B;

    // Проверяем что typed возвращает Association
    ok(A.typed instanceof Association);

    // Проверяем что A.typed.this - это Set
    ok(A.typed.this instanceof Set);

    // Проверяем что в множестве есть наши объекты
    ok(A.typed.this.has(a1.this));
    ok(A.typed.this.has(a2.this));

    // Проверяем что нет объектов с другим типом
    ok(!A.typed.this.has(b1.this));

    // Проверяем размер множества
    strictEqual(A.typed.this.size, 2);
    strictEqual(B.typed.this.size, 1);

    // Изменяем тип одного объекта
    a1.type = B;

    // Проверяем что множество обновилось
    ok(!A.typed.this.has(a1.this));
    ok(A.typed.this.has(a2.this));
    strictEqual(A.typed.this.size, 1);

    // Проверяем, что объект появился в множестве нового типа
    ok(B.typed.this.has(a1.this));
    strictEqual(B.typed.this.size, 2);
  });
});

describe('Association from', () => {
  it('ass.from must be Association or undefined', () => {
    const Source = deep();
    const element = deep();
    element.from = Source;
    strictEqual(element.from.this, Source.this);
    ok(element.from instanceof Association);
    strictEqual(Source.from, undefined);
    strictEqual(element.from.this, Source.this);
  });
});

describe('Association out', () => {
  it('Source.out should return Association containing Set of instances with this source', () => {
    const Source1 = deep();
    const element1 = deep();
    element1.from = Source1;
    const element2 = deep();
    element2.from = Source1;
    const Source2 = deep();
    const element3 = deep();
    element3.from = Source2;

    // Проверяем что out возвращает Association
    ok(Source1.out instanceof Association);

    // Проверяем что Source1.out.this - это Set
    ok(Source1.out.this instanceof Set);

    // Проверяем что в множестве есть наши объекты
    ok(Source1.out.this.has(element1.this));
    ok(Source1.out.this.has(element2.this));

    // Проверяем что нет объектов с другим источником
    ok(!Source1.out.this.has(element3.this));

    // Проверяем размер множества
    strictEqual(Source1.out.this.size, 2);
    strictEqual(Source2.out.this.size, 1);

    // Изменяем источник одного объекта
    element1.from = Source2;

    // Проверяем что множество обновилось
    ok(!Source1.out.this.has(element1.this));
    ok(Source1.out.this.has(element2.this));
    strictEqual(Source1.out.this.size, 1);

    // Проверяем, что объект появился в множестве нового источника
    ok(Source2.out.this.has(element1.this));
    strictEqual(Source2.out.this.size, 2);
  });
});

describe('Association to', () => {
  it('ass.to must be Association or undefined', () => {
    const Target = deep();
    const element = deep();
    element.to = Target;
    strictEqual(element.to.this, Target.this);
    ok(element.to instanceof Association);
    strictEqual(Target.to, undefined);
    strictEqual(element.to.this, Target.this);
  });
});

describe('Association in', () => {
  it('Target.in should return Association containing Set of instances pointing to this target', () => {
    const Target1 = deep();
    const element1 = deep();
    element1.to = Target1;
    const element2 = deep();
    element2.to = Target1;
    const Target2 = deep();
    const element3 = deep();
    element3.to = Target2;

    // Проверяем что in возвращает Association
    ok(Target1.in instanceof Association);

    // Проверяем что Target1.in.this - это Set
    ok(Target1.in.this instanceof Set);

    // Проверяем что в множестве есть наши объекты
    ok(Target1.in.this.has(element1.this));
    ok(Target1.in.this.has(element2.this));

    // Проверяем что нет объектов с другим целевым узлом
    ok(!Target1.in.this.has(element3.this));

    // Проверяем размер множества
    strictEqual(Target1.in.this.size, 2);
    strictEqual(Target2.in.this.size, 1);

    // Изменяем цель одного объекта
    element1.to = Target2;

    // Проверяем что множество обновилось
    ok(!Target1.in.this.has(element1.this));
    ok(Target1.in.this.has(element2.this));
    strictEqual(Target1.in.this.size, 1);

    // Проверяем, что объект появился в множестве новой цели
    ok(Target2.in.this.has(element1.this));
    strictEqual(Target2.in.this.size, 2);
  });
});

// Тестирование совместного использования разных типов отношений
describe('Combined Relations', () => {
  it('should be possible to use multiple relation types together', () => {
    const Type = deep();
    const Source = deep();
    const Target = deep();
    const element = deep();

    // Устанавливаем разные типы отношений для одного объекта
    element.type = Type;
    element.from = Source;
    element.to = Target;

    // Проверяем что все отношения установлены правильно
    strictEqual(element.type.this, Type.this);
    strictEqual(element.from.this, Source.this);
    strictEqual(element.to.this, Target.this);

    // Проверяем обратные отношения
    ok(Type.typed.this.has(element.this));
    ok(Source.out.this.has(element.this));
    ok(Target.in.this.has(element.this));

    // Проверяем размеры множеств
    strictEqual(Type.typed.this.size, 1);
    strictEqual(Source.out.this.size, 1);
    strictEqual(Target.in.this.size, 1);

    // Создаем еще один элемент с теми же отношениями
    const element2 = deep();
    element2.type = Type;
    element2.from = Source;
    element2.to = Target;

    // Проверяем размеры множеств после добавления
    strictEqual(Type.typed.this.size, 2);
    strictEqual(Source.out.this.size, 2);
    strictEqual(Target.in.this.size, 2);

    // Изменяем все отношения первого элемента
    const NewType = deep();
    const NewSource = deep();
    const NewTarget = deep();

    element.type = NewType;
    element.from = NewSource;
    element.to = NewTarget;

    // Проверяем, что старые множества обновились
    strictEqual(Type.typed.this.size, 1);
    strictEqual(Source.out.this.size, 1);
    strictEqual(Target.in.this.size, 1);

    // Проверяем, что новые множества содержат элемент
    ok(NewType.typed.this.has(element.this));
    ok(NewSource.out.this.has(element.this));
    ok(NewTarget.in.this.has(element.this));
  });
});

// Тестирование новых релейшенов value и valued
describe('Association value', () => {
  it('ass.value must be Association or undefined', () => {
    const Value = deep();
    const element = deep();
    element.value = Value;
    strictEqual(element.value.this, Value.this);
    ok(element.value instanceof Association);
    strictEqual(Value.value, undefined);
    strictEqual(element.value.this, Value.this);
  });

  it('should handle primitive values correctly', () => {
    const element = deep();

    // Проверка с числовым значением
    element.value = 42;
    strictEqual(element.value.this, 42);

    // Проверка с строковым значением
    element.value = 'test';
    strictEqual(element.value.this, 'test');

    // Проверка с boolean значением
    element.value = true;
    strictEqual(element.value.this, true);

    // Проверка с null - value должен отсутствовать
    element.value = null;
    strictEqual(element.value, undefined);
  });

  it('should emit events when value changes', () => {
    const element = deep();
    let eventFired = false;
    let eventType, oldValue, newValue;

    // Нужно подписаться на событие 'value'
    element.on('value', (type, prev, next) => {
      eventFired = true;
      eventType = type;
      oldValue = prev;
      newValue = next;
    });

    // Проверяем первоначальную установку значения
    element.value = 'initial';
    ok(eventFired, 'Событие должно быть вызвано');
    strictEqual(eventType, 'value', 'Тип события должен быть "value"');
    strictEqual(oldValue, undefined, 'Старое значение должно быть undefined');
    strictEqual(newValue, 'initial', 'Новое значение должно быть установлено');

    // Сбрасываем флаг и проверяем изменение значения
    eventFired = false;
    element.value = 'updated';
    ok(eventFired, 'Событие должно быть вызвано при изменении');
    strictEqual(eventType, 'value', 'Тип события должен быть "value"');
    strictEqual(oldValue, 'initial', 'Старое значение должно соответствовать предыдущему');
    strictEqual(newValue, 'updated', 'Новое значение должно быть обновлено');
  });
});

describe('Association valued', () => {
  it('Value.valued should return Association containing Set of instances with this value', () => {
    const Value1 = deep();
    const element1 = deep();
    element1.value = Value1;
    const element2 = deep();
    element2.value = Value1;
    const Value2 = deep();
    const element3 = deep();
    element3.value = Value2;

    // Проверяем что valued возвращает Association
    ok(Value1.valued instanceof Association);

    // Проверяем что Value1.valued.this - это Set
    ok(Value1.valued.this instanceof Set);

    // Проверяем что в множестве есть наши объекты
    ok(Value1.valued.this.has(element1.this));
    ok(Value1.valued.this.has(element2.this));

    // Проверяем что нет объектов с другим значением
    ok(!Value1.valued.this.has(element3.this));

    // Проверяем размер множества
    strictEqual(Value1.valued.this.size, 2);
    strictEqual(Value2.valued.this.size, 1);

    // Изменяем значение одного объекта
    element1.value = Value2;

    // Проверяем что множество обновилось
    ok(!Value1.valued.this.has(element1.this));
    ok(Value1.valued.this.has(element2.this));
    strictEqual(Value1.valued.this.size, 1);

    // Проверяем, что объект появился в множестве нового значения
    ok(Value2.valued.this.has(element1.this));
    strictEqual(Value2.valued.this.size, 2);
  });

  it('should work with primitive values', () => {
    const numberValue = 42;
    const stringValue = 'test';

    const element1 = deep();
    element1.value = numberValue;

    const element2 = deep();
    element2.value = numberValue;

    const element3 = deep();
    element3.value = stringValue;

    // Получаем ассоциацию для обертки примитива
    const wrappedNumber = deep(numberValue);
    const wrappedString = deep(stringValue);

    // Проверяем что valued работает с примитивами
    ok(wrappedNumber.valued instanceof Association);
    ok(wrappedNumber.valued.this instanceof Set);

    // Проверяем наличие элементов с нужным значением
    ok(wrappedNumber.valued.this.has(element1.this));
    ok(wrappedNumber.valued.this.has(element2.this));
    ok(!wrappedNumber.valued.this.has(element3.this));

    // Проверяем строковое значение
    ok(wrappedString.valued.this.has(element3.this));
    strictEqual(wrappedString.valued.this.size, 1);
  });
});

// Тестирование комбинации value с другими релейшенами
describe('Combined Relations with value', () => {
  it('should be possible to use value with other relation types', () => {
    const Type = deep();
    const Source = deep();
    const Target = deep();
    const Value = deep();
    const element = deep();

    // Устанавливаем разные типы отношений для одного объекта
    element.type = Type;
    element.from = Source;
    element.to = Target;
    element.value = Value;

    // Проверяем что все отношения установлены правильно
    strictEqual(element.type.this, Type.this);
    strictEqual(element.from.this, Source.this);
    strictEqual(element.to.this, Target.this);
    strictEqual(element.value.this, Value.this);

    // Проверяем обратные отношения
    ok(Type.typed.this.has(element.this));
    ok(Source.out.this.has(element.this));
    ok(Target.in.this.has(element.this));
    ok(Value.valued.this.has(element.this));

    // Проверяем размеры множеств
    strictEqual(Type.typed.this.size, 1);
    strictEqual(Source.out.this.size, 1);
    strictEqual(Target.in.this.size, 1);
    strictEqual(Value.valued.this.size, 1);

    // Создаем еще один элемент с теми же отношениями
    const element2 = deep();
    element2.type = Type;
    element2.from = Source;
    element2.to = Target;
    element2.value = Value;

    // Проверяем размеры множеств после добавления
    strictEqual(Type.typed.this.size, 2);
    strictEqual(Source.out.this.size, 2);
    strictEqual(Target.in.this.size, 2);
    strictEqual(Value.valued.this.size, 2);

    // Изменяем все отношения первого элемента
    const NewType = deep();
    const NewSource = deep();
    const NewTarget = deep();
    const NewValue = deep();

    element.type = NewType;
    element.from = NewSource;
    element.to = NewTarget;
    element.value = NewValue;

    // Проверяем, что старые множества обновились
    strictEqual(Type.typed.this.size, 1);
    strictEqual(Source.out.this.size, 1);
    strictEqual(Target.in.this.size, 1);
    strictEqual(Value.valued.this.size, 1);

    // Проверяем, что новые множества содержат элемент
    ok(NewType.typed.this.has(element.this));
    ok(NewSource.out.this.has(element.this));
    ok(NewTarget.in.this.has(element.this));
    ok(NewValue.valued.this.has(element.this));
  });
});

describe('Value event proxying', () => {
  it('should proxy events from value target to source', () => {
    // Создаем две ассоциации
    const source = deep({ name: 'Source' });
    const target = deep({ name: 'Target' });

    // События, которые должны быть проксированы
    let proxyEvents = [];

    // Выводим информацию об объектах
    console.log('Source is Association?', source instanceof Association);
    console.log('Target is Association?', target instanceof Association);
    console.log('Source has on method?', typeof source.on === 'function');
    console.log('Target has emit method?', typeof target.emit === 'function');

    // Подписываемся на все события с префиксом 'value:'
    source.on('*', (eventType, ...args) => {
      console.log('Source received event:', eventType);
      if (eventType.startsWith('value:')) {
        proxyEvents.push({
          type: eventType,
          args
        });
      }
    });

    // Устанавливаем target как значение source
    console.log('Setting source.value = target');
    source.value = target;
    console.log('Value set. Current value:', source.value ? source.value.this : 'undefined');

    // Генерируем разные события в target
    console.log('Emitting test event from target');
    target.emit('test', { data: 'test data' });
    console.log('Emitting change event from target');
    target.emit('change', { data: 'change data' });
    console.log('Emitting custom event from target');
    target.emit('custom', 1, 2, 3);

    // Проверяем, что события были проксированы
    console.log('Proxy events captured:', proxyEvents.length);
    assert.equal(proxyEvents.length, 3, 'Должны быть проксированы 3 события');
    assert.equal(proxyEvents[0].type, 'value:test', 'Первое событие должно быть value:test');
    assert.equal(proxyEvents[1].type, 'value:change', 'Второе событие должно быть value:change');
    assert.equal(proxyEvents[2].type, 'value:custom', 'Третье событие должно быть value:custom');

    // Проверяем, что аргументы были переданы корректно
    assert.deepEqual(proxyEvents[0].args[0], { data: 'test data' }, 'Аргументы события test должны быть переданы');
    assert.deepEqual(proxyEvents[1].args[0], { data: 'change data' }, 'Аргументы события change должны быть переданы');
    assert.deepEqual(proxyEvents[2].args, [1, 2, 3], 'Аргументы события custom должны быть переданы');

    // Сбрасываем массив событий
    proxyEvents = [];

    // Заменяем значение на новое
    const newTarget = deep({ name: 'NewTarget' });
    console.log('Setting source.value = newTarget');
    source.value = newTarget;

    // Генерируем событие в старом значении
    console.log('Emitting ignored event from old target');
    target.emit('ignored', 'old value');

    // Генерируем событие в новом значении
    console.log('Emitting detected event from new target');
    newTarget.emit('detected', 'new value');

    // Проверяем, что событие от старого значения не проксировано, а от нового - проксировано
    console.log('Proxy events after value change:', proxyEvents.length);
    assert.equal(proxyEvents.length, 1, 'Должно быть проксировано только 1 событие от нового значения');
    assert.equal(proxyEvents[0].type, 'value:detected', 'Событие должно быть value:detected');
    assert.deepEqual(proxyEvents[0].args[0], 'new value', 'Аргументы события должны быть переданы');

    // Сбрасываем массив событий
    proxyEvents = [];

    // Удаляем значение
    console.log('Setting source.value = null');
    source.value = null;

    // Генерируем событие в предыдущем значении
    console.log('Emitting after-remove event from previous target');
    newTarget.emit('after-remove', 'removed');

    // Проверяем, что событие не проксировано
    console.log('Proxy events after value removal:', proxyEvents.length);
    assert.equal(proxyEvents.length, 0, 'Не должно быть проксированных событий после удаления значения');
  });

  it('should unsubscribe from value events when source is killed', () => {
    // Создаем две ассоциации
    const source = deep({ name: 'Source' });
    const target = deep({ name: 'Target' });

    // События, которые должны быть проксированы
    let proxyEvents = [];

    // Подписываемся на все события с префиксом 'value:'
    source.on('*', (eventType, ...args) => {
      if (eventType.startsWith('value:')) {
        proxyEvents.push({
          type: eventType,
          args
        });
      }
    });

    // Устанавливаем target как значение source
    source.value = target;

    // Генерируем событие в target
    target.emit('before-kill', 'alive');

    // Проверяем, что событие проксировано
    assert.equal(proxyEvents.length, 1, 'Должно быть проксировано событие до kill');
    assert.equal(proxyEvents[0].type, 'value:before-kill', 'Событие до kill должно быть проксировано');

    // Сбрасываем массив событий
    proxyEvents = [];

    // Убиваем source
    kill(source);

    // Генерируем событие в target после kill
    target.emit('after-kill', 'dead');

    // Проверяем, что событие не проксировано
    assert.equal(proxyEvents.length, 0, 'Не должно быть проксированных событий после kill');
  });

  it('should correctly proxy complex event data', () => {
    // Создаем две ассоциации
    const source = deep({ name: 'Source' });
    const target = deep({ name: 'Target' });

    // Проксированные события
    let proxyEvents = [];

    // Подписываемся на все события с префиксом 'value:'
    source.on('*', (eventType, ...args) => {
      if (eventType.startsWith('value:')) {
        proxyEvents.push({
          type: eventType,
          args
        });
      }
    });

    // Устанавливаем target как значение source
    source.value = target;

    // Создаем сложный объект данных
    const complexData = {
      id: 123,
      nested: {
        value: 'nested value',
        array: [1, 2, { key: 'value' }]
      },
      fn: () => 'test'
    };

    // Генерируем событие с сложными данными
    target.emit('complex', complexData, [1, 2, 3], new Map([['key', 'value']]));

    // Проверяем, что событие проксировано с правильными данными
    assert.equal(proxyEvents.length, 1, 'Должно быть проксировано событие с сложными данными');
    assert.equal(proxyEvents[0].type, 'value:complex', 'Тип события должен быть value:complex');

    // Проверяем сложный объект
    const passedComplexData = proxyEvents[0].args[0];
    assert.equal(passedComplexData.id, 123, 'ID должен быть передан');
    assert.equal(passedComplexData.nested.value, 'nested value', 'Вложенное значение должно быть передано');
    assert.deepEqual(passedComplexData.nested.array, [1, 2, { key: 'value' }], 'Вложенный массив должен быть передан');
    assert.equal(typeof passedComplexData.fn, 'function', 'Функция должна быть передана');

    // Проверяем второй аргумент - массив
    assert.deepEqual(proxyEvents[0].args[1], [1, 2, 3], 'Массив должен быть передан корректно');

    // Проверяем третий аргумент - Map
    const passedMap = proxyEvents[0].args[2];
    assert.ok(passedMap instanceof Map, 'Map должен быть передан как Map');
    assert.equal(passedMap.get('key'), 'value', 'Значение в Map должно быть доступно');
  });
});
