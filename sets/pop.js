/**
 * Универсальный метод pop для удаления последнего элемента массива
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы метода
 * @returns {*} - Результат операции
 */
export function pop(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const type = ass.detect;
    const prev = ass.this;

    if (type !== 'array') {
      throw new Error(`pop method is not applicable to ${type} type`);
    }

    // Проверяем, пуст ли массив
    if (ass.this.length === 0) {
      // Для пустого массива просто возвращаем undefined, не генерируя события
      return undefined;
    }

    // Сохраняем индекс и значение удаляемого элемента
    const initialLength = ass.this.length;
    const removedIndex = initialLength - 1;
    const removedValue = ass.this[removedIndex];

    // Применяем метод pop
    const result = ass.this.pop();

    // Генерируем события
    // Событие delete для удаленного элемента
    ass.emit('delete', { key: removedIndex, value: removedValue });

    // Событие pop
    ass.emit('pop', { value: removedValue });

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
        operation: 'pop',
        prevLength: initialLength,
        currentLength: ass.this.length,
        index: removedIndex,
        value: removedValue,
        position: removedIndex
      }
    }, {
      method: 'pop',
      arguments: []
    });

    return removedValue;
  };
}
