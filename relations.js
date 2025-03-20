/**
 * Модуль для работы с типами ассоциаций.
 * Позволяет устанавливать и получать тип ассоциации.
 */
import { Association } from './association.js';
import { Memory } from './memory.js';
import { Events } from './events.js';

// Создаем экземпляр Memory для хранения типов ассоциаций
export const types = new Memory({
  name: 'Association.types',
  childSetFactory: () => new Set()
});

/**
 * Функция для получения или установки типа ассоциации.
 * @param {string} op - Операция ('get' или 'set')
 * @param {...*} args - Аргументы операции
 * @returns {Association|void} - Ассоциация типа при 'get', ничего при 'set'
 */
export const type = function(ass, op, args) {
  // Операция 'get': возвращаем текущий тип ассоциации
  if (op === 'get') {
    const currentType = types.one(ass.this);
    // Возвращаем новую ассоциацию, связанную с типом
    if (currentType === undefined) return;
    return new Association(currentType);
  }

  // Операция 'set': устанавливаем тип ассоциации
  else if (op === 'set') {
    let newType = args[0];
    if (newType instanceof Association) newType = newType.this;

    // Получаем текущий тип для события
    const prevType = types.one(ass.this);

    // Если тип не изменился, ничего не делаем
    if (prevType === newType) return;

    // Если был установлен предыдущий тип, удаляем его
    if (prevType) {
      types.delete(ass.this, prevType);
    }

    // Если указан новый тип, устанавливаем его
    if (newType) {
      // Если новый тип является экземпляром Association, используем его this
      const typeToSet = newType instanceof Association ? newType.this : newType;
      types.set(ass.this, typeToSet);
    }

    // Событие 'type' с указанием предыдущего и нового типа
    ass.emit('type', prevType, newType instanceof Association ? newType.this : newType);

    // Событие 'change' с деталями изменения
    ass.emit('change', {
      prevType,
      newType: newType instanceof Association ? newType.this : newType
    }, {
      method: 'type',
      arguments: [newType]
    });

    return true;
  }

  else {
    throw new Error(`unexpected op=${op}`);
  }
};

// Добавляем метод type в статические методы Association
Association._proxy.set('type', type);


