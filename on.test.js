import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Deep } from './deep.js';

test('on() should return a function that can be used for unsubscribing', () => {
  const deep = Deep.new();
  
  // Создаем счетчик вызовов обработчика
  let callCount = 0;
  
  // Подписываемся на события, сохраняя возвращаемую функцию
  const off = deep.on(event => {
    callCount++;
  });
  
  // Генерируем событие
  deep.emit({ event: 'test' });
  
  // Проверяем, что обработчик был вызван
  assert.equal(callCount, 1);
  
  // Используем возвращаемую функцию для отписки
  off();
  
  // Генерируем еще одно событие
  deep.emit({ event: 'test' });
  
  // Проверяем, что обработчик не был вызван второй раз
  assert.equal(callCount, 1);
  
  console.log('✓ on() returns a function that can be used for unsubscribing');
}); 