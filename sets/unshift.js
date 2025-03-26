/**
 * Универсальный метод unshift для добавления элементов в начало массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function unshift(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function(...items) {
    const type = ass.detect;
    const prev = ass.this;

    if (type !== 'array') {
      throw new Error(`unshift method is not applicable to ${type} type`);
    }

    // Сохраняем начальную длину массива
    const initialLength = ass.this.length;

    // Применяем метод unshift
    const result = ass.this.unshift(...items);

    // Генерируем события

    // Создаем массив индексов для сдвинутых элементов
    const affectedIndices = Array.from({ length: initialLength }, (_, i) => i);

    // Генерируем события set для добавленных элементов
    items.forEach((value, index) => {
      ass.emit('set', { key: index, value });
    });

    // Генерируем события set для сдвинутых элементов
    for (let i = items.length; i < ass.this.length; i++) {
      ass.emit('set', { key: i, value: ass.this[i], prevKey: i - items.length });
    }

    // Событие unshift
    ass.emit('unshift', { items: items });

    // Событие length
    ass.emit('length', {
      prev: initialLength,
      next: ass.this.length
    });

    // Событие change
    ass.emit('change', {
      prev: prev,
      next: ass.this,
      // Добавляем расширенную информацию
      detail: {
        type: type,
        operation: 'unshift',
        prevLength: initialLength,
        currentLength: ass.this.length,
        items: items,
        // Индексы добавленных элементов
        addedIndices: Array.from({ length: items.length }, (_, i) => i),
        // Индексы сдвинутых элементов (до сдвига)
        affectedIndices: affectedIndices
      }
    }, {
      method: 'unshift',
      arguments: items
    });

    return ass.this.length;
  };
}
