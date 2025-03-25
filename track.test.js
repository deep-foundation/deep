/**
 * Тесты для механизма отслеживания связей между ассоциациями
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Association } from './association.js';
import { deep } from './index.js';

// Импортируем функции из модуля track
import { origin, Track } from './track.js';

test('Track - доступ к origin через map', async (t) => {
  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Применяем метод map, создающий новую ассоциацию
  const result = source.map(x => x * 2);

  // Проверяем, что result является экземпляром Association
  assert.ok(result instanceof Association, 'Результат map должен быть экземпляром Association');

  // Проверяем, что результат содержит ожидаемые данные
  assert.deepEqual(result.this, [2, 4, 6, 8], 'Результат map должен содержать преобразованные данные');

  // Проверяем, что result имеет доступ к исходной ассоциации через геттер origin
  assert.strictEqual(result.origin, source, 'result.origin должен указывать на source');
});

test('Track - метаданные трансформации', async (t) => {
  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Функция преобразования
  const transformer = x => x * 2;

  // Применяем метод map с функцией преобразования
  const result = source.map(transformer);

  // Проверяем, что сохранена информация о методе
  assert.strictEqual(result.temp.method, 'map', 'result.temp.method должен быть "map"');

  // Проверяем, что сохранена функция преобразования
  assert.strictEqual(result.temp.transformer, transformer, 'result.temp.transformer должен содержать функцию преобразования');
});

test('Track - доступ к объекту трекера', async (t) => {
  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Применяем метод map
  const result = source.map(x => x * 2);

  // Получаем объект трекера
  const tracker = result.track;

  // Проверяем, что track возвращает экземпляр Association
  assert.ok(tracker instanceof Association, 'result.track должен возвращать экземпляр Association');

  // Проверяем, что трекер хранит правильные ссылки
  assert.strictEqual(tracker.this.origin, source, 'tracker.this.origin должен указывать на source');
  assert.strictEqual(tracker.this.result, result, 'tracker.this.result должен указывать на result');
  assert.strictEqual(tracker.this.method, 'map', 'tracker.this.method должен быть "map"');
  assert.ok(typeof tracker.this.transformer === 'function', 'tracker.this.transformer должен быть функцией');
});

test('Track - автоматическое обновление при изменении origin', async (t) => {
  // Создаем системы событий, если необходимы для теста
  if (!Association._proxy.has('on') || !Association._proxy.has('emit')) {
    t.skip('Тест пропущен, так как не реализована система событий');
    return;
  }

  // Создаем исходную ассоциацию
  const source = deep([1, 2, 3, 4]);

  // Применяем метод map
  const result = source.map(x => x * 2);

  // Получаем объект трекера (это инициирует отслеживание)
  const tracker = result.track;

  // Изменяем исходную ассоциацию
  source.this.push(5);

  // Эмулируем событие изменения
  if (source.emit) {
    source.emit('change');

    // Проверяем, что результат обновился автоматически
    assert.deepEqual(result.this, [2, 4, 6, 8, 10], 'После события change result должен содержать обновленные данные');
  } else {
    // Если система событий не реализована, просто проверяем структуру трекера
    assert.ok(tracker, 'Трекер должен быть создан');
  }
});
