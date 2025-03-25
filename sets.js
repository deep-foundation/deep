/**
 * Модуль для работы с универсальными методами модификации
 */
import { Association } from './association.js';
import { set } from './sets/set.js';
import { add } from './sets/add.js';
import { deleteMethod } from './sets/delete.js';
import { remove } from './sets/remove.js';

// Создаем объект с методами для sets
const sets = {
  set,
  add,
  delete: deleteMethod,
  remove
};

// Добавляем методы в прокси Association
for (const [name, method] of Object.entries(sets)) {
  Association._proxy.set(name, method);
}

export default sets;
