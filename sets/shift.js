/**
 * Универсальный метод shift для удаления первого элемента массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function shift(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const type = ass.detect;
    const prev = ass.this;

    if (type !== 'array') {
      throw new Error(`shift method is not applicable to ${type} type`);
    }

    // Проверяем, пуст ли массив
    if (ass.this.length === 0) {
      // Для пустого массива просто возвращаем undefined, не генерируя события
      return undefined;
    }

    // Сохраняем значение удаляемого элемента
    const removedValue = ass.this[0];
    const initialLength = ass.this.length;

    // Применяем метод shift
    const result = ass.this.shift();

    // Генерируем события
    // Событие delete для удаленного элемента
    ass.emit('delete', { key: 0, value: removedValue });

    // Создаем массив индексов для элементов, которые сдвинулись
    const affectedIndices = Array.from({ length: initialLength - 1 }, (_, i) => i + 1);

    // Генерируем события set для сдвинутых элементов
    for (let i = 0; i < ass.this.length; i++) {
      ass.emit('set', { key: i, value: ass.this[i], prevKey: i + 1 });
    }

    // Событие shift
    ass.emit('shift', { value: removedValue });

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
        operation: 'shift',
        prevLength: initialLength,
        currentLength: ass.this.length,
        value: removedValue,
        // Индексы элементов, которые сдвинулись
        affectedIndices: affectedIndices,
        position: 0
      }
    }, {
      method: 'shift',
      arguments: []
    });

    return removedValue;
  };
}
