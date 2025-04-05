import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Association } from './association.js';
import { all, kill, reload } from './lifecycle.js';
import { deep } from './index.js';

test('Lifecycle - автоматическое добавление в all при создании Association', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем новую ассоциацию - добавление в lifecycle происходит автоматически
  const obj = { id: 1 };
  const a = new Association(obj);

  // Проверяем, что ассоциация автоматически добавлена в all
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));
});

test('Lifecycle - несколько экземпляров Association с одинаковым this', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем общий объект
  const obj = { id: 999 };

  // Создаем несколько ассоциаций с одинаковым this - добавление в lifecycle происходит автоматически
  const a1 = new Association(obj);
  const a2 = new Association(obj);
  const a3 = new Association(obj);

  // Проверяем, что хотя есть 3 разных экземпляра, в all только одно значение
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));

  // Проверяем, что все ассоциации имеют одинаковый this
  assert.strictEqual(a1.this, obj);
  assert.strictEqual(a2.this, obj);
  assert.strictEqual(a3.this, obj);

  // Проверяем, что экземпляры разные
  assert.notStrictEqual(a1, a2);
  assert.notStrictEqual(a1, a3);
  assert.notStrictEqual(a2, a3);
});

test('Lifecycle - удаление одной из ассоциаций с общим this удаляет значение из all', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем общий объект
  const obj = { id: 999 };

  // Создаем несколько ассоциаций с одинаковым this - добавление в lifecycle происходит автоматически
  const a1 = new Association(obj);
  const a2 = new Association(obj);
  const a3 = new Association(obj);

  // Убеждаемся, что объект в all
  assert.equal(all.this.size, 1);

  // Удаляем только одну ассоциацию
  a2.kill();

  // Проверяем, что объект удален из all
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - генерация события add при добавлении в all', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Объект для добавления
  const obj = { id: 42 };

  // Отслеживаем событие add
  let eventReceived = false;

  all.on('add', () => {
    eventReceived = true;
  });

  // Создаем новую ассоциацию вместо прямого добавления
  const a = new Association(obj);

  // Проверяем, что событие add сработало
  assert.ok(eventReceived, 'Событие add должно быть вызвано');

  // Проверяем, что значение добавлено
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));
});

test('Lifecycle - создание нескольких ассоциаций', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем несколько ассоциаций - добавление в lifecycle происходит автоматически
  const obj1 = { id: 1 };
  const obj2 = { id: 2 };
  const obj3 = { id: 3 };

  const assoc1 = deep(obj1);
  const assoc2 = deep(obj2);
  const assoc3 = deep(obj3);

  // Проверяем, что все ассоциации автоматически добавлены в all
  assert.equal(all.this.size, 3);
  assert.ok(all.this.has(obj1));
  assert.ok(all.this.has(obj2));
  assert.ok(all.this.has(obj3));
});

test('Lifecycle - удаление ассоциации напрямую', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию - добавление в lifecycle происходит автоматически
  const obj = { id: 1 };
  const a = deep(obj);

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Удаляем ассоциацию
  a.kill();

  // Проверяем, что ассоциация удалена
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - удаление ассоциации с помощью метода kill()', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию - добавление в lifecycle происходит автоматически
  const obj = { id: 1 };
  const a = deep(obj);

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Удаляем ассоциацию через метод kill()
  a.kill();

  // Проверяем, что ассоциация удалена
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - удаление ассоциации с помощью функции kill', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию - добавление в lifecycle происходит автоматически
  const obj = { id: 1 };
  const a = deep(obj);

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Удаляем ассоциацию через функцию kill
  kill(a);

  // Проверяем, что ассоциация удалена
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - проверка isAlive', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию - добавление в lifecycle происходит автоматически
  const obj = { id: 1 };
  const a = deep(obj);

  // Проверяем, что ассоциация жива после автоматического создания
  assert.equal(a.isAlive(), true);

  // Удаляем ассоциацию
  a.kill();

  // Проверяем, что ассоциация не жива после удаления
  assert.equal(a.isAlive(), false);
});

test('Lifecycle - перезагрузка ассоциации', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию - добавление в lifecycle происходит автоматически
  const obj = { id: 1 };
  const a = deep(obj);

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Перезагружаем ассоциацию
  reload(a);

  // Проверяем, что ассоциация всё ещё в системе (была удалена и добавлена заново)
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));
});

test('Lifecycle - пользовательский обработчик _onNew', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Объект с возможностью отслеживания инициализации
  const obj = { id: 1, initialized: false };

  // Создаем ассоциацию
  const a = new Association(obj);

  // Вызываем _onNew с пользовательским обработчиком
  a._onNew(function(self) {
    self.initialized = true;
    return true;
  });

  // Проверяем, что объект изменен
  assert.ok(obj.initialized);

  // Проверяем, что ассоциация добавлена в all
  assert.equal(all.this.size, 1);
  assert.ok(all.this.has(obj));
});

test('Lifecycle - пользовательский обработчик _onKill', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем ассоциацию - добавление в lifecycle происходит автоматически
  const obj = { id: 1, disposed: false };
  const a = new Association(obj);

  // Проверяем, что ассоциация добавлена
  assert.equal(all.this.size, 1);

  // Вызываем _onKill с пользовательским обработчиком
  a._onKill(function(self) {
    self.disposed = true;
    return true;
  });

  // Проверяем, что объект был изменен
  assert.ok(obj.disposed);

  // Проверяем, что ассоциация удалена из all
  assert.equal(all.this.size, 0);
  assert.ok(!all.this.has(obj));
});

test('Lifecycle - очистка хранилища всех ассоциаций', () => {
  // Очищаем хранилище перед тестом
  all.this.clear();

  // Создаем несколько ассоциаций - добавление в lifecycle происходит автоматически
  const obj1 = { id: 1 };
  const obj2 = { id: 2 };
  const obj3 = { id: 3 };

  const assoc1 = deep(obj1);
  const assoc2 = deep(obj2);
  const assoc3 = deep(obj3);

  // Проверяем, что все ассоциации добавлены
  assert.equal(all.this.size, 3);

  // Очищаем хранилище
  all.this.clear();

  // Проверяем, что хранилище пусто
  assert.equal(all.this.size, 0);
});
