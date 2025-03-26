/**
 * Универсальный метод push для добавления элементов в конец массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function push(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function(...items) {
    const type = ass.detect;
    const prev = ass.this;

    if (type !== 'array') {
      throw new Error(`push method is not applicable to ${type} type`);
    }

    // Сохраняем начальную длину массива для расчета индексов добавленных элементов
    const initialLength = ass.this.length;

    // Применяем метод push
    const result = ass.this.push(...items);

    // Генерируем события
    items.forEach((value, index) => {
      // Добавляем событие set для каждого элемента
      const addedIndex = initialLength + index;
      ass.emit('set', { key: addedIndex, value });
    });

    // Генерируем событие push
    ass.emit('push', { items: items });

    // Генерируем событие length, если были добавлены элементы
    if (items.length > 0) {
      ass.emit('length', {
        prev: initialLength,
        next: ass.this.length
      });
    }

    // Генерируем событие change
    ass.emit('change', {
      prev: prev,
      next: ass.this,
      // Добавляем расширенную информацию
      detail: {
        type: type,
        operation: 'push',
        prevLength: initialLength,
        currentLength: ass.this.length,
        items: items,
        // Для каждого добавленного элемента указываем его позицию
        addedIndices: items.map((_, index) => initialLength + index)
      }
    }, {
      method: 'push',
      arguments: items
    });

    return ass.this;
  };
}
