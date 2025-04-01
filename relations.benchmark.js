/**
 * Тесты производительности для relations.js
 */

import { deep } from './index.js';
import { type, typed, types } from './relations.js';
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
  for (const item of typedSet) {
    sum += item.id;
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
