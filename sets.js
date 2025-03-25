/**
 * Модуль для работы с универсальными методами модификации
 */
import { Association } from './association.js';
import { set } from './sets/set.js';

// Создаем объект с методами для sets
const sets = {
  set
};

// Добавляем методы в прокси Association
for (const [name, method] of Object.entries(sets)) {
  Association._proxy.set(name, method);
}

export default sets;
