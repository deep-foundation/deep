import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Association } from './association.js';
import { all, kill, reload } from './lifecycle.js';
import { deep } from './index.js';

test('Lifecycle - создание ассоциации автоматически добавляет её в all', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем новую ассоциацию и вызываем onNew
  const obj = { id: 1 };
  const a = deep(obj);
  a.onNew();

  // Проверяем, что ассоциация добавлена в all
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));
});

test('Lifecycle - создание нескольких ассоциаций', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем несколько ассоциаций
  const obj1 = { id: 1 };
  const obj2 = { id: 2 };
  const obj3 = { id: 3 };

  const assoc1 = deep(obj1);
  const assoc2 = deep(obj2);
  const assoc3 = deep(obj3);

  // Регистрируем их в системе жизненного цикла
  assoc1.onNew();
  assoc2.onNew();
  assoc3.onNew();

  // Проверяем, что все ассоциации добавлены в all
  assert.equal(all.this.size, 3);
  assert.ok(all.this.has(obj1));
  assert.ok(all.this.has(obj2));
  assert.ok(all.this.has(obj3));
});

test('Lifecycle - удаление ассоциации через onKill', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию и добавляем её в систему
  const obj = { id: 1 };
  const a = deep(obj);
  a.onNew();

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Удаляем ассоциацию
  a.onKill();

  // Проверяем, что ассоциация удалена
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - удаление ассоциации с помощью функции kill', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию и добавляем её в систему
  const obj = { id: 1 };
  const a = deep(obj);
  a.onNew();

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Удаляем ассоциацию через функцию kill
  kill(a);

  // Проверяем, что ассоциация удалена
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - перезагрузка ассоциации', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию и добавляем её в систему
  const obj = { id: 1 };
  const a = deep(obj);
  a.onNew();

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Перезагружаем ассоциацию
  reload(a);

  // Проверяем, что ассоциация всё ещё в системе (была удалена и добавлена заново)
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));
});

test('Lifecycle - пользовательский обработчик onNew', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию
  const obj = { id: 1, initialized: false };
  const a = deep(obj);

  // Устанавливаем пользовательский обработчик onNew
  let callbackCalled = false;
  a.onNew(function(self) {
    callbackCalled = true;
    self.initialized = true;
    return true;
  });

  // Проверяем, что callback был вызван и объект изменен
  assert.ok(callbackCalled);
  assert.ok(obj.initialized);

  // Проверяем, что ассоциация добавлена в all
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));
});

test('Lifecycle - пользовательский обработчик onKill', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию и добавляем её в систему
  const obj = { id: 1, disposed: false };
  const a = deep(obj);
  a.onNew();

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Устанавливаем пользовательский обработчик onKill
  let callbackCalled = false;
  a.onKill(function(self) {
    callbackCalled = true;
    self.disposed = true;
    return true;
  });

  // Проверяем, что callback был вызван и объект изменен
  assert.ok(callbackCalled);
  assert.ok(obj.disposed);

  // Проверяем, что ассоциация удалена из all
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - очистка хранилища всех ассоциаций', () => {
  // Создаем несколько ассоциаций
  const obj1 = { id: 1 };
  const obj2 = { id: 2 };
  const obj3 = { id: 3 };

  const assoc1 = deep(obj1);
  const assoc2 = deep(obj2);
  const assoc3 = deep(obj3);

  // Регистрируем их в системе жизненного цикла
  assoc1.onNew();
  assoc2.onNew();
  assoc3.onNew();

  // Проверяем, что все ассоциации добавлены
  assert.equal(all.this.size, 3);

  // Очищаем хранилище
  all.this.clear();

  // Проверяем, что хранилище пусто
  assert.equal(all.this.size, 0);
});
