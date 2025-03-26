/**
 * Тестовый файл для отладки цепочки методов и событий
 */

import { deep } from './index.js';
import fs from 'fs';

// Включаем детальное логирование
const log = (text) => fs.appendFileSync('debug-log.txt', text + '\n');
log('\n\n=== NEW TEST RUN ===');

// Создаем исходную ассоциацию
const source = deep([1, 2, 3, 4]);

// Отслеживаем события на всех уровнях
source.on('change', (event) => {
  log('SOURCE EVENT: ' + (event?.detail?.operation || 'unknown'));
});

// Применяем метод map
const result1 = source.map(x => x * 2);
log('result1.temp.origin === source: ' + (result1.temp.origin === source));

result1.on('change', (event) => {
  log('RESULT1 EVENT: ' + (event?.detail?.operation || 'unknown'));
});

// Применяем метод filter к результату map
const result2 = result1.filter(x => x > 4);
log('result2.temp.origin === result1: ' + (result2.temp.origin === result1));

result2.on('change', (event) => {
  log('RESULT2 EVENT: ' + (event?.detail?.operation || 'unknown'));
});

// Выполняем операции и проверяем распространение событий
log('\n=== Initial state ===');
log('source: ' + JSON.stringify(source.this));
log('result1: ' + JSON.stringify(result1.this));
log('result2: ' + JSON.stringify(result2.this));

// Проверим работу трекера и его свойства
const track2 = result2.track;
log('\nTracker properties:');
log('track2.temp.origin === result1: ' + (track2.temp.origin === result1));
log('track2.temp.result === result2: ' + (track2.temp.result === result2));
log('track2.temp keys: ' + JSON.stringify(Object.keys(track2.temp || {})));

log('\n=== Adding 5 to source ===');
source.add(5);
log('source: ' + JSON.stringify(source.this));
log('result1: ' + JSON.stringify(result1.this));
log('result2: ' + JSON.stringify(result2.this));

log('\n=== Using push(6) on source ===');
source.push(6);
log('source: ' + JSON.stringify(source.this));
log('result1: ' + JSON.stringify(result1.this));
log('result2: ' + JSON.stringify(result2.this));

log('\n=== Setting result1[0] = 10 ===');
result1.set(0, 10);
log('source: ' + JSON.stringify(source.this));
log('result1: ' + JSON.stringify(result1.this));
log('result2: ' + JSON.stringify(result2.this));

log('\n=== Setting source[0] = 5 ===');
source.set(0, 5);
log('source: ' + JSON.stringify(source.this));
log('result1: ' + JSON.stringify(result1.this));
log('result2: ' + JSON.stringify(result2.this));
