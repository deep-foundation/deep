/**
 * Тесты производительности для relations.js
 */

import { deep } from './index.js';
import { type, typed, types, from, froms, out, to, tos, into } from './relations.js';
import Benchmarkify from 'benchmarkify';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { saveBenchmarkToMarkdown } from './utils/benchmark-to-markdown.js';
import { Association } from './association.js';

// Создаем бенчмарк
const benchmark = new Benchmarkify('Relations Benchmark', {
  description: 'Тесты производительности для работы с отношениями между объектами'
}).printHeader();

// Вспомогательная функция для создания большого количества ассоциаций с типами
function createAssociations(count, typeCount) {
  const result = {
    types: [],
    instances: []
  };

  // Создаем типы
  for (let i = 0; i < typeCount; i++) {
    result.types.push(new Association({ name: `Type${i}` }));
  }

  // Создаем экземпляры ассоциаций и распределяем их по типам
  for (let i = 0; i < count; i++) {
    const ass = new Association({ id: i, data: `Data${i}` });
    // Распределяем равномерно по типам
    const typeIndex = i % typeCount;
    ass.type = result.types[typeIndex];
    result.instances.push(ass);
  }

  return result;
}

// Вспомогательная функция для создания ассоциаций с исходящими связями
function createFromAssociations(count, sourceCount) {
  const result = {
    sources: [],
    instances: []
  };

  // Создаем исходящие узлы
  for (let i = 0; i < sourceCount; i++) {
    result.sources.push(new Association({ name: `Source${i}` }));
  }

  // Создаем экземпляры ассоциаций и распределяем их по источникам
  for (let i = 0; i < count; i++) {
    const ass = new Association({ id: i, data: `Data${i}` });
    // Распределяем равномерно по источникам
    const sourceIndex = i % sourceCount;
    ass.from = result.sources[sourceIndex];
    result.instances.push(ass);
  }

  return result;
}

// Вспомогательная функция для создания ассоциаций с входящими связями
function createToAssociations(count, targetCount) {
  const result = {
    targets: [],
    instances: []
  };

  // Создаем целевые узлы
  for (let i = 0; i < targetCount; i++) {
    result.targets.push(new Association({ name: `Target${i}` }));
  }

  // Создаем экземпляры ассоциаций и распределяем их по целям
  for (let i = 0; i < count; i++) {
    const ass = new Association({ id: i, data: `Data${i}` });
    // Распределяем равномерно по целям
    const targetIndex = i % targetCount;
    ass.to = result.targets[targetIndex];
    result.instances.push(ass);
  }

  return result;
}

// Бенчмарк для операций с type
const typeBench = benchmark.createSuite('type - установка и получение типа');

typeBench.add('Создание новой ассоциации без типа', () => {
  new Association({ data: 'test' });
});

typeBench.add('Создание новой ассоциации с типом через конструктор', () => {
  const typeAss = new Association({ name: 'Type' });
  new Association(typeAss);
});

typeBench.add('Установка типа для ассоциации', () => {
  const typeAss = new Association({ name: 'Type' });
  const ass = new Association({ data: 'test' });
  ass.type = typeAss;
});

typeBench.add('Получение типа ассоциации', () => {
  const typeAss = new Association({ name: 'Type' });
  const ass = new Association({ data: 'test' });
  ass.type = typeAss;
  const type = ass.type;
});

typeBench.add('Изменение типа ассоциации', () => {
  const typeAss1 = new Association({ name: 'Type1' });
  const typeAss2 = new Association({ name: 'Type2' });
  const ass = new Association({ data: 'test' });
  ass.type = typeAss1;
  ass.type = typeAss2;
});

// Бенчмарк для операций с typed
const typedBench = benchmark.createSuite('typed - получение и работа с множеством ассоциаций');

typedBench.add('Получение множества typed для пустого типа', () => {
  const typeAss = new Association({ name: 'EmptyType' });
  const typedSet = typeAss.typed;
});

typedBench.add('Получение множества typed для типа с 10 ассоциациями', () => {
  const { types } = createAssociations(10, 1);
  const typedSet = types[0].typed;
});

typedBench.add('Итерация по множеству typed с 100 ассоциациями', () => {
  const { types } = createAssociations(100, 1);
  const typedSet = types[0].typed;
  let sum = 0;
  for (const item of typedSet.this) {
    sum += item.id || 0;
  }
});

// Бенчмарк для событий
const eventsBench = benchmark.createSuite('События в relations');

eventsBench.add('Подписка на события типа', () => {
  const typeAss = new Association({ name: 'EventType' });
  const ass = new Association({ data: 'test' });
  ass.on('type', () => {});
  ass.type = typeAss;
});

eventsBench.add('Подписка на события изменения множества typed', () => {
  const typeAss = new Association({ name: 'EventType' });
  const typedSet = typeAss.typed;
  typedSet.on('change', () => {});

  const ass = new Association({ data: 'test' });
  ass.type = typeAss;
});

// Бенчмарк для сценариев масштабирования
const scaleBench = benchmark.createSuite('Масштабирование модуля relations');

scaleBench.add('Создание 100 ассоциаций с 10 типами', () => {
  createAssociations(100, 10);
});

scaleBench.add('Создание 1000 ассоциаций с 10 типами', () => {
  createAssociations(1000, 10);
});

scaleBench.add('Получение всех ассоциаций типа (из 1000 ассоциаций)', () => {
  const { types } = createAssociations(1000, 10);
  // Все типы должны иметь примерно равное количество ассоциаций
  const typedSet = types[0].typed;
  const size = typedSet.size;
});

scaleBench.add('Изменение типа 100 ассоциаций', () => {
  const { instances, types } = createAssociations(100, 5);
  const newType = new Association({ name: 'NewType' });

  for (let i = 0; i < 20; i++) {
    instances[i].type = newType;
  }
});

// Бенчмарк для TRACK поддержки в relations
const trackBench = benchmark.createSuite('TRACK поддержка в relations');

trackBench.add('Получение track для typed', () => {
  const type = new Association({ name: 'TrackType' });
  const typedAss = type.typed;
  const track = typedAss.track;
});

trackBench.add('Изменение типа с отслеживанием через track (10 ассоциаций)', () => {
  const { instances, types } = createAssociations(10, 2);

  // Получаем typed для первого типа и его track
  const typedAss = types[0].typed;
  const track = typedAss.track;

  // Меняем тип у 5 ассоциаций, но делаем это через .this.type = ... вместо instance.type = ...
  for (let i = 0; i < 5; i++) {
    // Используем вместо directly setting .type, устанавливаем через прокси Association
    const instance = instances[i];
    instance.type = types[1];
  }
});

trackBench.add('Изменение типа с отслеживанием через track (100 ассоциаций)', () => {
  const { instances, types } = createAssociations(100, 2);

  // Получаем typed для обоих типов и их tracks
  const typedAss1 = types[0].typed;
  const typedAss2 = types[1].typed;
  const track1 = typedAss1.track;
  const track2 = typedAss2.track;

  // Меняем тип у 50 ассоциаций
  for (let i = 0; i < 50; i++) {
    const currentType = i % 2 === 0 ? types[0] : types[1];
    const newType = i % 2 === 0 ? types[1] : types[0];
    instances[i].type = newType;
  }
});

// Бенчмарк для сравнения с нативными структурами данных
const compareBench = benchmark.createSuite('Сравнение с нативными структурами данных');

compareBench.add('Memory.set для 1000 пар ключ-значение', () => {
  for (let i = 0; i < 1000; i++) {
    types.set({id: i}, {type: i % 10});
  }
});

compareBench.add('Map.set для 1000 пар ключ-значение', () => {
  const map = new Map();
  for (let i = 0; i < 1000; i++) {
    map.set({id: i}, {type: i % 10});
  }
});

compareBench.add('Memory.one для 1000 ключей', () => {
  const { instances } = createAssociations(1000, 10);

  for (let i = 0; i < 1000; i++) {
    types.one(instances[i].this);
  }
});

compareBench.add('Map.get для 1000 ключей', () => {
  const map = new Map();
  const objects = [];

  for (let i = 0; i < 1000; i++) {
    const obj = {id: i};
    objects.push(obj);
    map.set(obj, {type: i % 10});
  }

  for (let i = 0; i < 1000; i++) {
    map.get(objects[i]);
  }
});

compareBench.add('Memory.many для 10 значений с ~100 ключами каждое', () => {
  const { types: typeAsses } = createAssociations(1000, 10);

  for (let i = 0; i < 10; i++) {
    types.many(typeAsses[i]);
  }
});

compareBench.add('Map для обратного поиска значений (~100 ключей на значение)', () => {
  const map = new Map();
  const values = [];

  for (let i = 0; i < 10; i++) {
    values.push({type: i});
  }

  for (let i = 0; i < 1000; i++) {
    map.set({id: i}, values[i % 10]);
  }

  const reverseMaps = values.map(() => new Set());

  for (const [key, value] of map.entries()) {
    const index = values.indexOf(value);
    reverseMaps[index].add(key);
  }

  for (let i = 0; i < 10; i++) {
    const keys = reverseMaps[i];
    for (const key of keys) {
      // Делаем что-то с каждым ключом
    }
  }
});

// Бенчмарк для операций с from/out
const fromBench = benchmark.createSuite('from/out - установка и получение исходящих связей');

fromBench.add('Создание новой ассоциации без исходящей связи', () => {
  new Association({ data: 'test' });
});

fromBench.add('Установка исходящей связи для ассоциации', () => {
  const sourceAss = new Association({ name: 'Source' });
  const ass = new Association({ data: 'test' });
  ass.from = sourceAss;
});

fromBench.add('Получение исходящей связи ассоциации', () => {
  const sourceAss = new Association({ name: 'Source' });
  const ass = new Association({ data: 'test' });
  ass.from = sourceAss;
  const fromAsss = ass.from;
});

fromBench.add('Изменение исходящей связи ассоциации', () => {
  const sourceAss1 = new Association({ name: 'Source1' });
  const sourceAss2 = new Association({ name: 'Source2' });
  const ass = new Association({ data: 'test' });
  ass.from = sourceAss1;
  ass.from = sourceAss2;
});

fromBench.add('Получение множества out для исходящего узла', () => {
  const sourceAss = new Association({ name: 'Source' });
  const ass1 = new Association({ data: 'test1' });
  const ass2 = new Association({ data: 'test2' });
  ass1.from = sourceAss;
  ass2.from = sourceAss;
  const outSet = sourceAss.out;
});

// Добавим корректные бенчмарки для итерации по out и in
fromBench.add('Итерация по множеству out исходящего узла', () => {
  const { sources } = createFromAssociations(10, 1);
  const outSet = sources[0].out;
  let count = 0;
  for (const item of outSet.this) {
    count++;
  }
});

// Бенчмарк для операций с to/in
const toBench = benchmark.createSuite('to/in - установка и получение входящих связей');

toBench.add('Создание новой ассоциации без входящей связи', () => {
  new Association({ data: 'test' });
});

toBench.add('Установка входящей связи для ассоциации', () => {
  const targetAss = new Association({ name: 'Target' });
  const ass = new Association({ data: 'test' });
  ass.to = targetAss;
});

toBench.add('Получение входящей связи ассоциации', () => {
  const targetAss = new Association({ name: 'Target' });
  const ass = new Association({ data: 'test' });
  ass.to = targetAss;
  const toAsss = ass.to;
});

toBench.add('Изменение входящей связи ассоциации', () => {
  const targetAss1 = new Association({ name: 'Target1' });
  const targetAss2 = new Association({ name: 'Target2' });
  const ass = new Association({ data: 'test' });
  ass.to = targetAss1;
  ass.to = targetAss2;
});

toBench.add('Получение множества in для входящего узла', () => {
  const targetAss = new Association({ name: 'Target' });
  const ass1 = new Association({ data: 'test1' });
  const ass2 = new Association({ data: 'test2' });
  ass1.to = targetAss;
  ass2.to = targetAss;
  const inSet = targetAss.in;
});

// Добавляем оптимизированный бенчмарк с меньшим потреблением памяти
toBench.add('Итерация по множеству in входящего узла', () => {
  const { targets } = createToAssociations(10, 1);
  const inSet = targets[0].in;
  let count = 0;
  for (const item of inSet.this) {
    count++;
  }
});

// Бенчмарк для масштабирования from/out и to/in
const scaleRelationsBench = benchmark.createSuite('Масштабирование новых типов отношений');

scaleRelationsBench.add('Создание 100 ассоциаций с 10 исходящими узлами', () => {
  createFromAssociations(100, 10);
});

scaleRelationsBench.add('Создание 1000 ассоциаций с 10 исходящими узлами', () => {
  createFromAssociations(1000, 10);
});

scaleRelationsBench.add('Создание 100 ассоциаций с 10 входящими узлами (оптимизированный)', () => {
  // Уменьшаем нагрузку на память
  const result = {
    targets: [],
    instances: []
  };

  // Создаем целевые узлы
  for (let i = 0; i < 10; i++) {
    result.targets.push(new Association({ name: `Target${i}` }));
  }

  // Создаем экземпляры ассоциаций и распределяем их по целям
  // с меньшим потреблением памяти
  for (let i = 0; i < 100; i++) {
    const ass = new Association({ id: i });
    // Распределяем равномерно по целям
    const targetIndex = i % 10;
    ass.to = result.targets[targetIndex];

    // Сохраняем только ссылки на объекты
    if (i < 10) {
      result.instances.push(ass);
    }
  }
});

scaleRelationsBench.add('Создание 100 ассоциаций с низким потреблением памяти', () => {
  const sources = [];

  // Создаем исходящие узлы
  for (let i = 0; i < 5; i++) {
    sources.push(new Association({ name: `Source${i}` }));
  }

  // Создаем экземпляры ассоциаций с низким потреблением памяти
  for (let i = 0; i < 100; i++) {
    const ass = new Association();
    const sourceIndex = i % 5;
    ass.from = sources[sourceIndex];
    // Не сохраняем ассоциации - они будут доступны через sources[x].out
  }
});

scaleRelationsBench.add('Получение всех исходящих ассоциаций (из 1000)', () => {
  const { sources } = createFromAssociations(1000, 10);
  // Все источники должны иметь примерно равное количество ассоциаций
  const outSet = sources[0].out;
  const size = outSet.size;
});

scaleRelationsBench.add('Получение всех входящих ассоциаций (из 1000)', () => {
  const { targets } = createToAssociations(1000, 10);
  // Все цели должны иметь примерно равное количество ассоциаций
  const inSet = targets[0].in;
  const size = inSet.size;
});

// Бенчмарк для TRACK поддержки новых отношений
const trackRelationsBench = benchmark.createSuite('TRACK поддержка в новых отношениях');

trackRelationsBench.add('Получение track для out', () => {
  const source = new Association({ name: 'TrackSource' });
  const outAss = source.out;
  const track = outAss.track;
});

trackRelationsBench.add('Получение track для in', () => {
  const target = new Association({ name: 'TrackTarget' });
  const inAss = target.in;
  const track = inAss.track;
});

trackRelationsBench.add('Изменение исходящей связи с отслеживанием через track (100 ассоциаций)', () => {
  const { instances, sources } = createFromAssociations(100, 2);

  // Получаем out для обоих источников и их tracks
  const outAss1 = sources[0].out;
  const outAss2 = sources[1].out;
  const track1 = outAss1.track;
  const track2 = outAss2.track;

  // Меняем источник у 50 ассоциаций
  for (let i = 0; i < 50; i++) {
    const currentSource = i % 2 === 0 ? sources[0] : sources[1];
    const newSource = i % 2 === 0 ? sources[1] : sources[0];
    instances[i].from = newSource;
  }
});

trackRelationsBench.add('Изменение входящей связи с отслеживанием через track (100 ассоциаций)', () => {
  const { instances, targets } = createToAssociations(100, 2);

  // Получаем in для обоих целей и их tracks
  const inAss1 = targets[0].in;
  const inAss2 = targets[1].in;
  const track1 = inAss1.track;
  const track2 = inAss2.track;

  // Меняем цель у 50 ассоциаций
  for (let i = 0; i < 50; i++) {
    const currentTarget = i % 2 === 0 ? targets[0] : targets[1];
    const newTarget = i % 2 === 0 ? targets[1] : targets[0];
    instances[i].to = newTarget;
  }
});

// Бенчмарк для сравнения разных типов отношений
const compareRelationsBench = benchmark.createSuite('Сравнение разных типов отношений');

compareRelationsBench.add('Установка всех типов отношений (type, from, to) для 100 ассоциаций', () => {
  const types = [];
  const sources = [];
  const targets = [];

  // Создаем типы, источники и цели
  for (let i = 0; i < 10; i++) {
    types.push(new Association({ name: `Type${i}` }));
    sources.push(new Association({ name: `Source${i}` }));
    targets.push(new Association({ name: `Target${i}` }));
  }

  // Создаем экземпляры ассоциаций и устанавливаем все типы отношений
  for (let i = 0; i < 100; i++) {
    const ass = new Association({ id: i, data: `Data${i}` });
    const index = i % 10;
    ass.type = types[index];
    ass.from = sources[index];
    ass.to = targets[index];
  }
});

compareRelationsBench.add('Получение всех типов отношений (type, from, to) для 100 ассоциаций', () => {
  const types = [];
  const sources = [];
  const targets = [];
  const instances = [];

  // Создаем типы, источники и цели
  for (let i = 0; i < 10; i++) {
    types.push(new Association({ name: `Type${i}` }));
    sources.push(new Association({ name: `Source${i}` }));
    targets.push(new Association({ name: `Target${i}` }));
  }

  // Создаем экземпляры ассоциаций и устанавливаем все типы отношений
  for (let i = 0; i < 100; i++) {
    const ass = new Association({ id: i, data: `Data${i}` });
    const index = i % 10;
    ass.type = types[index];
    ass.from = sources[index];
    ass.to = targets[index];
    instances.push(ass);
  }

  // Получаем все типы отношений
  for (const ass of instances) {
    const type = ass.type;
    const fromAss = ass.from;
    const toAss = ass.to;
  }
});

// Запускаем все бенчмарки
async function runBenchmarks() {
  console.log('🏁 Запуск бенчмарков для relations.js...');

  const startTime = performance.now();

  try {
    // Запускаем бенчмаркинг и получаем результаты
    const results = await benchmark.run();

    // Записываем время выполнения
    const elapsedMs = performance.now() - startTime;
    results.elapsedMs = elapsedMs;

    console.log(`✅ Бенчмарки завершены за ${(elapsedMs / 1000).toFixed(2)} секунд`);

    // Создаем отчет в формате Markdown
    const markdownPath = path.join(process.cwd(), 'RELATIONS.benchmark.md');
    saveBenchmarkToMarkdown(results, markdownPath);

  } catch (error) {
    console.error('❌ Ошибка при выполнении бенчмарков:', error);
  }
}

// Запускаем бенчмарки
runBenchmarks();
