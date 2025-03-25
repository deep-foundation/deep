/**
 * Скрипт для проверки механизма отслеживания
 */

import { Association } from './association.js';
import { deep } from './index.js';
import { createTracker } from './track.js';

// Убедимся, что origin и track зарегистрированы
console.log('Association._proxy имеет origin:', Association._proxy.has('origin'));
console.log('Association._proxy имеет track:', Association._proxy.has('track'));

// Создаем исходную ассоциацию
const source = deep([1, 2, 3, 4]);

// Применяем метод map
const result = source.map(x => x * 2);

// Проверяем связь origin
console.log('\nПроверка связи origin:');
console.log('Исходная ассоциация:', source.this);
console.log('Результат map:', result.this);
console.log('result.origin === source:', result.origin === source);
console.log('Метод трансформации:', result.temp.method);
console.log('Функция трансформации присутствует:', typeof result.temp.transformer === 'function');

// Получаем трекер
const tracker = result.track;
console.log('\nПроверка трекера:');
console.log('Трекер создан:', tracker instanceof Association);
console.log('Трекер хранит ссылку на origin:', tracker.this.origin === source);
console.log('Трекер хранит ссылку на result:', tracker.this.result === result);

// Модифицируем исходную ассоциацию и обновляем результат вручную
console.log('\nМодифицируем исходную ассоциацию:');
source.this.push(5);
console.log('Исходная ассоциация после изменения:', source.this);
console.log('Результат до обновления:', result.this);

// Применяем трансформер вручную для демонстрации
console.log('\nОбновляем результат вручную:');
result.this = source.this.map(result.temp.transformer);
console.log('Результат после обновления:', result.this);
