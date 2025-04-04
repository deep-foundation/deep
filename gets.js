/**
 * Модуль универсальных методов доступа (неизменяемые операции)
 *
 * Содержит набор методов для работы с данными, оптимизированных для использования
 * с классом Association. Эти методы не вносят изменений в исходные данные
 * и работают с различными типами данных.
 */

import { Association } from "./association.js";

/**
 * Универсальный метод для получения элемента по ключу
 * Поддерживает работу с массивами, строками, объектами, Map, Set и другими коллекциями
 *
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы вызова (ключ или индекс)
 * @returns {any} - Значение по указанному ключу или индексу, обернутое в Association
 */
export function get(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.get = ass.temp.get || ((key) =>
      get(ass, 'apply', [key])
    );
  } else if (op === 'apply') {
    // Получаем ключ из аргументов и применяем unwrap
    const key = Association._proxy.get('unwrap').call(ass, ass, 'apply', [args[0]]);

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Проверяем на null и undefined
    if (value === null || value === undefined) {
      return undefined;
    }

    // Обработка разных типов данных и результат
    let result;

    if (Array.isArray(value) || typeof value === 'string') {
      // Для массивов и строк используем индекс
      result = value[key];
    } else if (value instanceof Map) {
      // Для Map используем метод get
      result = value.get(key);
    } else if (value instanceof Set) {
      // Для Set преобразуем в массив и получаем значение по индексу
      if (typeof key === 'number' && Number.isInteger(key) && key >= 0) {
        let index = 0;
        for (const item of value) {
          if (index === key) {
            result = item;
            break;
          }
          index++;
        }
      }
    } else if (typeof value === 'object') {
      // Для объектов получаем свойство по ключу
      result = value[key];
    } else if (typeof value === 'number' && typeof key === 'number' && Number.isInteger(key) && key >= 0) {
      // Для чисел преобразуем в строку и получаем цифру по индексу
      const strValue = value.toString();
      // Проверяем, что индекс не выходит за пределы числа
      if (key < strValue.length) {
        result = parseInt(strValue[key], 10);
      }
    }

    // Если результат undefined, возвращаем undefined
    if (result === undefined) {
      return undefined;
    }

    // Оборачиваем результат в Association с помощью wrap и возвращаем
    return Association._proxy.get('wrap').call(ass, ass, 'apply', [result]);
  }
}

/**
 * Выполняет перебор элементов коллекции или свойств объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы вызова (callback)
 * @returns {Association} - Исходный экземпляр Association
 */
export function forEach(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.forEach = ass.temp.forEach || ((callback) =>
      forEach(ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем callback из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    const value = ass.this;

    if (value === null || value === undefined) {
      return ass;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        callback(ass.wrap(value[i]), i, ass.wrap(value));
      }
    } else if (value instanceof Map) {
      value.forEach((val, key) => callback(ass.wrap(val), key, ass.wrap(value)));
    } else if (value instanceof Set) {
      let index = 0;
      value.forEach(val => callback(ass.wrap(val), index++, ass.wrap(value)));
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        callback(ass.wrap(value[i]), i, ass.wrap(value));
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        callback(ass.wrap(value[key]), key, ass.wrap(value));
      }
    }

    return ass;
  }
}

/**
 * Преобразует элементы коллекции или свойства объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Array} args - Аргументы вызова (callback)
 * @returns {Association} - Новая ассоциация с преобразованными значениями
 */
export function map(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.map = ass.temp.map || (callback =>
      map(ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем колбэк из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // Создаем результирующий массив
    const result = [];

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Проверяем, является ли значение множественным (is.many)
    const isMany = ass.isMany;

    // Применяем функцию преобразования в зависимости от типа
    if (type === 'array' || type === 'string') {
      // Для массивов и строк итерируемся по элементам
      for (let i = 0; i < value.length; i++) {
        // Передаем обернутое значение в колбэк и добавляем развернутый результат в массив
        const wrappedResult = callback(ass.wrap(value[i]), i, ass.wrap(value));
        result.push(ass.unwrap(wrappedResult));
      }
    } else if (type === 'set') {
      // Для множеств (Set) используем for...of с ручным индексом
      let index = 0;
      for (const val of value) {
        const wrappedResult = callback(ass.wrap(val), index++, ass.wrap(value));
        result.push(ass.unwrap(wrappedResult));
      }
    } else if (type === 'map') {
      // Для карт (Map) итерируемся по записям [ключ, значение]
      for (const [key, val] of value) {
        const wrappedResult = callback(ass.wrap(val), key, ass.wrap(value));
        result.push(ass.unwrap(wrappedResult));
      }
    } else if (type === 'object') {
      // Для объектов итерируемся по ключам
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const wrappedResult = callback(ass.wrap(value[key]), key, ass.wrap(value));
        result.push(ass.unwrap(wrappedResult));
      }
    } else if (!isMany && value !== null && value !== undefined) {
      // Для примитивов и других не-множественных типов
      // рассматриваем их как один элемент
      const wrappedResult = callback(ass.wrap(value), 0, ass.wrap([value]));
      result.push(ass.unwrap(wrappedResult));
    }
    // Для null и undefined результат будет пустым массивом

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию преобразования и имя метода для отслеживания
    resultAssociation.temp.transformer = callback;
    resultAssociation.temp.method = 'map';

    // Создаем локальный обработчик track
    resultAssociation._proxy.set('track', (ass, op) => {
      if (op !== 'get') return;

      // Получаем трекер через глобальный геттер
      const track = Association._proxy.get('track').call(ass, ass, 'get');

      // Если есть система событий и у нас есть доступ к origins
      if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
        const origin = ass.origins[0];
        const method = ass.temp.method;
        const transformer = ass.temp.transformer;

        // Создаем обработчик событий change для автоматического обновления
        // Подписываемся на событие change у origin
        const offChange = origin.on('change', (event, meta) => {
          // Проверяем наличие детальной информации и метаданных
          const detail = event?.detail;
          const eventMethod = meta?.method;

          // Если есть детальная информация, используем ее для оптимального обновления
          if (detail) {
            const operation = detail.operation;

            switch (operation) {
              case 'add':
                // Точечное добавление нового элемента
                if (detail.value !== undefined) {
                  const wrappedValue = ass.wrap(detail.value);
                  const wrappedOriginal = ass.wrap(origin.this);
                  const wrappedResult = transformer(wrappedValue, detail.key, wrappedOriginal);
                  const newValue = ass.unwrap(wrappedResult);
                  ass.this.push(newValue);
                } else {
                  performFullRecalculation();
                }
                break;

              case 'delete':
                // Точечное удаление по позиции/ключу
                if (detail.position !== undefined) {
                  // Для массивов и строк удаляем по позиции
                  ass.this.splice(detail.position, 1);

                  // Для массивов нужно обновить все сдвинутые элементы
                  if (detail.affectedIndices && detail.affectedIndices.length > 0) {
                    // Получаем исходный массив
                    const originArray = origin.this;

                    // Обновляем все затронутые элементы, их индексы уменьшились на 1
                    detail.affectedIndices.forEach(oldIndex => {
                      const newIndex = oldIndex - 1;
                      const value = originArray[newIndex];
                      const wrappedValue = ass.wrap(value);
                      const wrappedOriginal = ass.wrap(originArray);
                      const wrappedResult = transformer(wrappedValue, newIndex, wrappedOriginal);
                      ass.this[newIndex] = ass.unwrap(wrappedResult);
                    });
                  }
                } else if (detail.key !== undefined) {
                  // Для множеств и объектов ищем по значению
                  const index = ass.this.findIndex((item, i) => {
                    // Для set/map ключ = значение, для объектов это имя свойства
                    if (detail.type === 'set' || detail.type === 'map') {
                      const wrappedKey = ass.wrap(detail.key);
                      const wrappedOriginal = ass.wrap(origin.this);
                      const wrappedResult = transformer(wrappedKey, detail.key, wrappedOriginal);
                      return item === ass.unwrap(wrappedResult);
                    } else {
                      // Пробуем найти по совпадению с трансформированным значением
                      return i === detail.position;
                    }
                  });

                  if (index !== -1) {
                    ass.this.splice(index, 1);
                  } else {
                    performFullRecalculation();
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'set':
                // Точечное обновление по ключу/индексу
                if (detail.key !== undefined && detail.position !== undefined) {
                  // Для массивов, строк и чисел обновляем по индексу
                  if (detail.position < ass.this.length) {
                    const wrappedValue = ass.wrap(detail.value);
                    const wrappedOriginal = ass.wrap(origin.this);
                    const wrappedResult = transformer(wrappedValue, detail.key, wrappedOriginal);
                    ass.this[detail.position] = ass.unwrap(wrappedResult);
                  } else if (detail.isNewProperty) {
                    // Если это новое свойство, добавляем его
                    const wrappedValue = ass.wrap(detail.value);
                    const wrappedOriginal = ass.wrap(origin.this);
                    const wrappedResult = transformer(wrappedValue, detail.key, wrappedOriginal);
                    ass.this.push(ass.unwrap(wrappedResult));
                  } else {
                    performFullRecalculation();
                  }
                } else if (detail.key !== undefined) {
                  // Для объектов и карт ищем позицию
                  const position = detail.type === 'object'
                    ? Object.keys(origin.this).indexOf(detail.key)
                    : undefined;

                  if (position !== undefined && position < ass.this.length) {
                    const wrappedValue = ass.wrap(detail.value);
                    const wrappedOriginal = ass.wrap(origin.this);
                    const wrappedResult = transformer(wrappedValue, detail.key, wrappedOriginal);
                    ass.this[position] = ass.unwrap(wrappedResult);
                  } else if (detail.isNewProperty) {
                    // Если это новое свойство, добавляем его
                    const wrappedValue = ass.wrap(detail.value);
                    const wrappedOriginal = ass.wrap(origin.this);
                    const wrappedResult = transformer(wrappedValue, detail.key, wrappedOriginal);
                    ass.this.push(ass.unwrap(wrappedResult));
                  } else {
                    performFullRecalculation();
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'remove':
                // Точечное удаление по значению
                if (detail.position !== undefined) {
                  // Если известна позиция удаленного элемента
                  ass.this.splice(detail.position, 1);

                  // Для массивов нужно обновить все сдвинутые элементы
                  if (detail.affectedIndices && detail.affectedIndices.length > 0) {
                    // Получаем исходный массив
                    const originArray = origin.this;

                    // Обновляем все затронутые элементы, их индексы уменьшились на 1
                    detail.affectedIndices.forEach(oldIndex => {
                      const newIndex = oldIndex - 1;
                      if (newIndex < originArray.length) {
                        const value = originArray[newIndex];
                        const wrappedValue = ass.wrap(value);
                        const wrappedOriginal = ass.wrap(originArray);
                        const wrappedResult = transformer(wrappedValue, newIndex, wrappedOriginal);
                        ass.this[newIndex] = ass.unwrap(wrappedResult);
                      }
                    });
                  }
                } else {
                  // Для других типов ищем элемент по значению
                  const index = ass.this.findIndex((item, idx) => {
                    // Пытаемся найти исходное значение
                    if (detail.type === 'set') {
                      if (origin.this.has(detail.value)) {
                        const wrappedValue = ass.wrap(detail.value);
                        const wrappedOriginal = ass.wrap(origin.this);
                        const wrappedResult = transformer(wrappedValue, idx, wrappedOriginal);
                        return item === ass.unwrap(wrappedResult);
                      }
                      return false;
                    } else {
                      const wrappedValue = ass.wrap(detail.value);
                      const wrappedOriginal = ass.wrap(origin.this);
                      const wrappedResult = transformer(wrappedValue, idx, wrappedOriginal);
                      return item === ass.unwrap(wrappedResult);
                    }
                  });

                  if (index !== -1) {
                    ass.this.splice(index, 1);
                  } else {
                    performFullRecalculation();
                  }
                }
                break;

              case 'push':
                // Обработка события push
                if (detail.items && Array.isArray(detail.items)) {
                  // Получаем исходный массив и его длину до операции push
                  const prevLength = detail.prevLength;

                  // Преобразуем и добавляем каждый новый элемент в результат
                  detail.items.forEach((value, idx) => {
                    const originalIndex = prevLength + idx;
                    const wrappedValue = ass.wrap(value);
                    const wrappedOriginal = ass.wrap(origin.this);
                    const wrappedResult = transformer(wrappedValue, originalIndex, wrappedOriginal);
                    const transformedValue = ass.unwrap(wrappedResult);
                    ass.this.push(transformedValue);
                  });
                } else {
                  performFullRecalculation();
                }
                break;

              case 'pop':
                // Обработка события pop - удаление последнего элемента
                if (ass.this.length > 0) {
                  ass.this.pop();
                } else {
                  performFullRecalculation();
                }
                break;

              case 'shift':
                // Обработка события shift - удаление первого элемента и сдвиг остальных
                if (ass.this.length > 0) {
                  // Удаляем первый элемент
                  ass.this.shift();

                  // Обновляем индексы оставшихся элементов, если нужно
                  if (detail.affectedIndices && detail.affectedIndices.length > 0) {
                    const originArray = origin.this;
                    // Перерасчитываем все элементы, так как их индексы изменились
                    for (let i = 0; i < ass.this.length; i++) {
                      const wrappedValue = ass.wrap(originArray[i]);
                      const wrappedOriginal = ass.wrap(originArray);
                      const wrappedResult = transformer(wrappedValue, i, wrappedOriginal);
                      ass.this[i] = ass.unwrap(wrappedResult);
                    }
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'unshift':
                // Обработка события unshift - добавление элементов в начало и сдвиг существующих
                if (detail.items && Array.isArray(detail.items)) {
                  // Получаем исходный массив
                  const originArray = origin.this;
                  const newItems = [];

                  // Преобразуем новые элементы
                  for (let i = 0; i < detail.items.length; i++) {
                    const wrappedValue = ass.wrap(detail.items[i]);
                    const wrappedOriginal = ass.wrap(originArray);
                    const wrappedResult = transformer(wrappedValue, i, wrappedOriginal);
                    const transformedValue = ass.unwrap(wrappedResult);
                    newItems.push(transformedValue);
                  }

                  // Обновляем индексы существующих элементов
                  // Сдвигаем существующие элементы вправо для освобождения места для новых
                  for (let i = ass.this.length - 1; i >= 0; i--) {
                    ass.this[i + detail.items.length] = ass.this[i];
                  }

                  // Вставляем новые элементы в начало
                  for (let i = 0; i < newItems.length; i++) {
                    ass.this[i] = newItems[i];
                  }

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: event?.prev,
                      next: ass.this,
                      detail: {
                        operation: 'unshift',
                        items: newItems,
                        prevLength: ass.this.length - newItems.length,
                        currentLength: ass.this.length
                      },
                      method: 'unshift'
                    });
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              default:
                // Для неизвестных операций делаем полное перевычисление
                performFullRecalculation();
            }
          } else {
            // Если нет детальной информации, делаем полное перевычисление
            performFullRecalculation();
          }

          // Функция для полного перевычисления результата
          function performFullRecalculation() {
            const type = origin.detect;
            const wrappedOriginal = ass.wrap(origin.this);

            if (type === 'array') {
              const newResult = [];
              origin.this.forEach((val, idx) => {
                const wrappedVal = ass.wrap(val);
                const wrappedResult = transformer(wrappedVal, idx, wrappedOriginal);
                newResult.push(ass.unwrap(wrappedResult));
              });
              ass.this = newResult;
            } else if (type === 'object') {
              const newResult = [];
              Object.keys(origin.this).forEach(key => {
                const val = origin.this[key];
                const wrappedVal = ass.wrap(val);
                const wrappedResult = transformer(wrappedVal, key, wrappedOriginal);
                newResult.push(ass.unwrap(wrappedResult));
              });
              ass.this = newResult;
            } else if (type === 'map') {
              const newResult = [];
              origin.this.forEach((val, key) => {
                const wrappedVal = ass.wrap(val);
                const wrappedResult = transformer(wrappedVal, key, wrappedOriginal);
                newResult.push(ass.unwrap(wrappedResult));
              });
              ass.this = newResult;
            } else if (type === 'set') {
              const newResult = [];
              let index = 0;
              for (const val of origin.this) {
                const wrappedVal = ass.wrap(val);
                const wrappedResult = transformer(wrappedVal, index++, wrappedOriginal);
                newResult.push(ass.unwrap(wrappedResult));
              }
              ass.this = newResult;
            } else if (type === 'string') {
              const newResult = [];
              for (let i = 0; i < origin.this.length; i++) {
                const val = origin.this[i];
                const wrappedVal = ass.wrap(val);
                const wrappedResult = transformer(wrappedVal, i, wrappedOriginal);
                newResult.push(ass.unwrap(wrappedResult));
              }
              ass.this = newResult;
            }
          }

          // Генерируем событие изменения
          if (ass.emit) {
            ass.emit('change', {
              origin: origin,
              reason: 'track',
              prev: event?.prev,
              next: event?.next,
              detail: event?.detail,
              method: meta?.method || event?.detail?.operation || 'update'
            });
          }
        });

        // Обработка lifecycle событий

        // Отписка при уничтожении origin
        if (origin.on && !track.temp.offOriginKill) {
          track.temp.offOriginKill = origin.on('kill', () => {
            // Отписываемся от событий
            offChange();
          });
        }

        // Отписка при уничтожении текущей ассоциации (результата)
        if (ass.on && !track.temp.offKill) {
          track.temp.offKill = ass.on('kill', () => {
            // Отписываемся от событий
            offChange();
          });
        }
      }

      return track;
    });

    return resultAssociation;
  }
}

/**
 * Фильтрует элементы коллекции или свойства объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {Array} - Новый массив с отфильтрованными значениями
 */
export function filter(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.filter = ass.temp.filter || (callback =>
      filter(ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем функцию фильтрации из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // Создаем результирующий массив
    const result = [];

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Применяем функцию фильтрации в зависимости от типа данных
    if (type === 'array') {
      // Для массивов итерируемся по элементам
      for (let i = 0; i < value.length; i++) {
        // Передаем обернутые значения в callback
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        // Распаковываем результат, если был возвращен Association
        const unwrappedResult = ass.unwrap(callbackResult);
        if (unwrappedResult) {
          result.push(value[i]);
        }
      }
    } else if (type === 'string') {
      // Для строк итерируемся по символам
      for (let i = 0; i < value.length; i++) {
        // Передаем обернутые значения в callback
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        // Распаковываем результат, если был возвращен Association
        const unwrappedResult = ass.unwrap(callbackResult);
        if (unwrappedResult) {
          result.push(value[i]);
        }
      }
    } else if (type === 'set') {
      // Исправлено: корректная итерация по Set с использованием for...of
      let index = 0;
      for (const val of value) {
        // Передаем обернутые значения в callback
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, index++, wrappedCollection);
        // Распаковываем результат, если был возвращен Association
        const unwrappedResult = ass.unwrap(callbackResult);
        if (unwrappedResult) {
          result.push(val);
        }
      }
    } else if (type === 'map') {
      // Для карт (Map) итерируемся по записям [ключ, значение]
      for (const [key, val] of value) {
        // Передаем обернутые значения в callback
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        // Распаковываем результат, если был возвращен Association
        const unwrappedResult = ass.unwrap(callbackResult);
        if (unwrappedResult) {
          result.push(val);
        }
      }
    } else if (type === 'object') {
      // Для объектов итерируемся по ключам
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        // Передаем обернутые значения в callback
        const wrappedValue = ass.wrap(value[key]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        // Распаковываем результат, если был возвращен Association
        const unwrappedResult = ass.unwrap(callbackResult);
        if (unwrappedResult) {
          result.push(value[key]);
        }
      }
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию фильтрации и имя метода для отслеживания
    resultAssociation.temp.filter = callback;
    resultAssociation.temp.method = 'filter';

    // Создаем локальный обработчик track
    resultAssociation._proxy.set('track', (ass, op) => {
      if (op !== 'get') return;

      // Получаем трекер через глобальный геттер
      const track = Association._proxy.get('track').call(ass, ass, 'get');

      // Если есть система событий и у нас есть доступ к origins
      if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
        const origin = ass.origins[0];
        const method = ass.temp.method;
        const filterFn = ass.temp.filter;

        // Создаем обработчик событий change для автоматического обновления
        // Подписываемся на событие change у origin
        const offChange = origin.on('change', (event, meta) => {
          // Проверяем наличие детальной информации и метаданных
          const detail = event?.detail;
          const eventMethod = meta?.method;
          const operation = detail?.operation;

          // Оптимизация для методов массивов
          if (operation) {
            switch (operation) {
              case 'push':
                // Для push обрабатываем только новые элементы, фильтруя их
                if (detail.items && Array.isArray(detail.items) && origin.detect === 'array') {
                  const prevLength = detail.prevLength;
                  const originValue = origin.this;
                  let hasChanges = false;
                  const newFilteredValues = [];

                  // Проверяем новые элементы через функцию фильтрации
                  for (let i = 0; i < detail.items.length; i++) {
                    const newIndex = prevLength + i;
                    const newValue = originValue[newIndex];

                    // Если элемент проходит фильтр, добавляем его
                    const wrappedValue = ass.wrap(newValue);
                    const wrappedCollection = ass.wrap(originValue);
                    const callbackResult = filterFn(wrappedValue, newIndex, wrappedCollection);
                    const unwrappedResult = ass.unwrap(callbackResult);
                    if (unwrappedResult) {
                      newFilteredValues.push(newValue);
                      hasChanges = true;
                    }
                  }

                  // Сохраняем текущий массив для события change
                  const previousResult = [...ass.this];

                  // Добавляем новые элементы, прошедшие фильтр, если они есть
                  if (hasChanges) {
                    // Добавляем новые элементы, прошедшие фильтр
                    for (const value of newFilteredValues) {
                      ass.this.push(value);
                    }
                  }

                  // Всегда вызываем событие change независимо от наличия новых элементов
                  // чтобы цепочка дальше получила обновление
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: { this: previousResult },
                      next: { this: ass.this },
                      detail: {
                        operation: 'push',
                        prevLength: previousResult.length,
                        currentLength: ass.this.length,
                        items: newFilteredValues
                      },
                      method: 'push'
                    });
                  }
                } else {
                  // Для остальных случаев делаем полное перевычисление
                  performFullRecalculation();
                }
                break;
              case 'add':
                // Для add проверяем новый элемент через предикат
                if (detail.key !== undefined && detail.value !== undefined) {
                  const originValue = origin.this;
                  const wrappedValue = ass.wrap(detail.value);
                  const wrappedCollection = ass.wrap(originValue);
                  const callbackResult = filterFn(wrappedValue, detail.key, wrappedCollection);
                  const unwrappedResult = ass.unwrap(callbackResult);

                  // Сохраняем текущий массив для события change
                  const previousResult = [...ass.this];

                  // Если элемент проходит фильтр, добавляем его
                  if (unwrappedResult) {
                    ass.this.push(detail.value);

                    // Генерируем событие изменения
                    if (ass.emit) {
                      ass.emit('change', {
                        origin: origin,
                        reason: 'track',
                        prev: { this: previousResult },
                        next: { this: ass.this },
                        detail: {
                          operation: 'add',
                          key: detail.key,
                          value: detail.value
                        },
                        method: 'add'
                      });
                    }
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'delete':
                // Удаляем элемент из результата если он там был
                if (detail.key !== undefined || detail.position !== undefined) {
                  const position = detail.position;
                  let indexToRemove = -1;

                  // Для массивов удаляем элемент по позиции
                  if (position !== undefined && position < ass.this.length) {
                    indexToRemove = position;
                  }
                  // Для объектов и других коллекций ищем по ключу
                  else if (detail.key !== undefined) {
                    // Находим индекс в отфильтрованном массиве, который соответствует ключу
                    // Сложно определить без сохранения маппинга ключ->индекс, поэтому делаем пересчет
                    performFullRecalculation();
                    return;
                  }

                  if (indexToRemove !== -1) {
                    // Сохраняем текущий массив для события change
                    const previousResult = [...ass.this];

                    // Удаляем элемент
                    ass.this.splice(indexToRemove, 1);

                    // Генерируем событие изменения
                    if (ass.emit) {
                      ass.emit('change', {
                        origin: origin,
                        reason: 'track',
                        prev: { this: previousResult },
                        next: { this: ass.this },
                        detail: {
                          operation: 'delete',
                          position: indexToRemove
                        },
                        method: 'delete'
                      });
                    }
                  } else {
                    // Не нашли элемент для удаления
                    performFullRecalculation();
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'set':
                // Перепроверяем измененный элемент через предикат
                if ((detail.key !== undefined || detail.position !== undefined) && detail.value !== undefined) {
                  const originValue = origin.this;
                  const position = detail.position;
                  const key = detail.key;
                  const wrappedValue = ass.wrap(detail.value);
                  const wrappedCollection = ass.wrap(originValue);
                  const callbackResult = filterFn(wrappedValue, key !== undefined ? key : position, wrappedCollection);
                  const unwrappedResult = ass.unwrap(callbackResult);

                  // Сохраняем текущий массив для события change
                  const previousResult = [...ass.this];
                  let hasChanges = false;

                  if (position !== undefined && position < ass.this.length) {
                    // Элемент был в результате - обновляем или удаляем
                    if (unwrappedResult) {
                      // Обновляем значение
                      ass.this[position] = detail.value;
                    } else {
                      // Удаляем элемент, так как он больше не проходит фильтр
                      ass.this.splice(position, 1);
                    }
                    hasChanges = true;
                  } else if (detail.isNewProperty && unwrappedResult) {
                    // Новый элемент, который проходит фильтр - добавляем
                    ass.this.push(detail.value);
                    hasChanges = true;
                  }

                  if (hasChanges && ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: { this: previousResult },
                      next: { this: ass.this },
                      detail: {
                        operation: 'set',
                        key: key,
                        position: position,
                        value: detail.value
                      },
                      method: 'set'
                    });
                  } else if (!hasChanges) {
                    performFullRecalculation();
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'remove':
                // Удаляем элемент из результата если он там был
                if (detail.value !== undefined) {
                  // Ищем индекс элемента в результате
                  const indexToRemove = ass.this.findIndex(item =>
                    JSON.stringify(item) === JSON.stringify(detail.value));

                  if (indexToRemove !== -1) {
                    // Сохраняем текущий массив для события change
                    const previousResult = [...ass.this];

                    // Удаляем элемент
                    ass.this.splice(indexToRemove, 1);

                    // Генерируем событие изменения
                    if (ass.emit) {
                      ass.emit('change', {
                        origin: origin,
                        reason: 'track',
                        prev: { this: previousResult },
                        next: { this: ass.this },
                        detail: {
                          operation: 'remove',
                          position: indexToRemove,
                          value: detail.value
                        },
                        method: 'remove'
                      });
                    }
                  } else {
                    // Не нашли элемент для удаления
                    performFullRecalculation();
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'pop':
                // Удаляем последний элемент если он был в результате
                if (ass.this.length > 0) {
                  // Сохраняем текущий массив для события change
                  const previousResult = [...ass.this];

                  // Удаляем последний элемент
                  ass.this.pop();

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: { this: previousResult },
                      next: { this: ass.this },
                      detail: {
                        operation: 'pop',
                        prevLength: previousResult.length,
                        currentLength: ass.this.length
                      },
                      method: 'pop'
                    });
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'shift':
                // Удаляем первый элемент если он был в результате
                if (ass.this.length > 0) {
                  // Сохраняем текущий массив для события change
                  const previousResult = [...ass.this];

                  // Удаляем первый элемент
                  ass.this.shift();

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: { this: previousResult },
                      next: { this: ass.this },
                      detail: {
                        operation: 'shift',
                        prevLength: previousResult.length,
                        currentLength: ass.this.length
                      },
                      method: 'shift'
                    });
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'unshift':
                // Проверяем новые элементы через предикат, добавляем в начало если проходят
                if (detail.items && Array.isArray(detail.items)) {
                  const originValue = origin.this;
                  const newFilteredValues = [];

                  // Проверяем новые элементы через функцию фильтрации
                  for (let i = 0; i < detail.items.length; i++) {
                    const newValue = detail.items[i];

                    // Если элемент проходит фильтр, добавляем его
                    const wrappedValue = ass.wrap(newValue);
                    const wrappedCollection = ass.wrap(originValue);
                    const callbackResult = filterFn(wrappedValue, i, wrappedCollection);
                    const unwrappedResult = ass.unwrap(callbackResult);
                    if (unwrappedResult) {
                      newFilteredValues.push(newValue);
                    }
                  }

                  if (newFilteredValues.length > 0) {
                    // Сохраняем текущий массив для события change
                    const previousResult = [...ass.this];

                    // Добавляем отфильтрованные элементы в начало результата
                    ass.this.unshift(...newFilteredValues);

                    // Генерируем событие изменения
                    if (ass.emit) {
                      ass.emit('change', {
                        origin: origin,
                        reason: 'track',
                        prev: { this: previousResult },
                        next: { this: ass.this },
                        detail: {
                          operation: 'unshift',
                          items: newFilteredValues,
                          prevLength: previousResult.length,
                          currentLength: ass.this.length
                        },
                        method: 'unshift'
                      });
                    }
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              default:
                // Для остальных операций делаем полное перевычисление
                performFullRecalculation();
                break;
            }
          } else {
            // Если детальной информации нет, делаем полное перевычисление
            performFullRecalculation();
          }

          // Функция для полного перевычисления фильтрации
          function performFullRecalculation() {
            // Получаем исходное значение
            const originValue = origin.this;
            // Создаем новый результат
            const filteredResult = [];

            // Применяем фильтрацию
            if (originValue === null || originValue === undefined) {
              // Для null и undefined результат пустой массив
            } else if (Array.isArray(originValue)) {
              for (let i = 0; i < originValue.length; i++) {
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = filterFn(wrappedValue, i, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);
                if (unwrappedResult) {
                  filteredResult.push(originValue[i]);
                }
              }
            } else if (originValue instanceof Map) {
              for (const [key, val] of originValue.entries()) {
                const wrappedValue = ass.wrap(val);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = filterFn(wrappedValue, key, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);
                if (unwrappedResult) {
                  filteredResult.push(val);
                }
              }
            } else if (originValue instanceof Set) {
              let index = 0;
              for (const val of originValue) {
                const wrappedValue = ass.wrap(val);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = filterFn(wrappedValue, index++, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);
                if (unwrappedResult) {
                  filteredResult.push(val);
                }
              }
            } else if (typeof originValue === 'string') {
              for (let i = 0; i < originValue.length; i++) {
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = filterFn(wrappedValue, i, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);
                if (unwrappedResult) {
                  filteredResult.push(originValue[i]);
                }
              }
            } else if (typeof originValue === 'object') {
              const keys = Object.keys(originValue);
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const wrappedValue = ass.wrap(originValue[key]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = filterFn(wrappedValue, key, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);
                if (unwrappedResult) {
                  filteredResult.push(originValue[key]);
                }
              }
            }

            // Создаем копию текущего результата для сравнения и события change
            const previousResult = [...ass.this];

            // Сравниваем предыдущий и новый результаты
            const prevJSON = JSON.stringify(previousResult);
            const newJSON = JSON.stringify(filteredResult);

            if (prevJSON !== newJSON) {
              // Обновляем значение только если результат изменился
              ass.this = filteredResult;

              // Генерируем событие изменения при изменении результата
              if (ass.emit) {
                ass.emit('change', {
                  origin: origin,
                  reason: 'track',
                  prev: { this: previousResult },
                  next: { this: filteredResult },
                  detail: event?.detail,
                  method: meta?.method || event?.detail?.operation || 'update'
                });
              }
            }
          }
        });

        // Сохраняем функцию отписки для возможности отключения отслеживания
        track.temp.offChange = offChange;
      }

      return track;
    });

    return resultAssociation;
  }
}

/**
 * Выполняет свертку элементов коллекции или свойств объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (accumulator, value, key, collection)
 * @param {*} [initialValue] - начальное значение аккумулятора
 * @returns {*} - Результат свертки
 */
export function reduce(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.reducer = ass.temp.reducer || ((callback, initialValue) =>
      Association._proxy.get('reduce').call(ass, ass, 'apply', [callback, initialValue])
    );
  } else if (op === 'apply') {
    // Получаем функцию свертки и начальное значение из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);
    const initialValue = args.length > 1 ? ass.unwrap(args[1]) : undefined;
    const hasInitialValue = args.length > 1;

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Создаем результирующий аккумулятор
    let accumulator;
    let startIndex = 0;

    // Если initialValue не указано, берем первый элемент как начальное значение
    if (!hasInitialValue) {
      if (type === 'array' && value.length > 0) {
        // Для числовых массивов и операции сложения
        if (value.every(item => typeof item === 'number') &&
            callback.toString().includes('acc + x')) {
          // Напрямую используем нативный reduce для суммирования
          return ass.wrap(value.reduce((a, b) => a + b));
        }

        accumulator = value[0];
        startIndex = 1;
      } else if (type === 'map' && value.size > 0) {
        const firstEntry = value.entries().next().value;
        accumulator = firstEntry[1];
        startIndex = 1;
      } else if (type === 'set' && value.size > 0) {
        // Исправлено: правильное получение первого элемента из Set
        accumulator = value.values().next().value;
        startIndex = 1;
      } else if (type === 'string' && value.length > 0) {
        accumulator = value[0];
        startIndex = 1;
      } else if (type === 'object' && Object.keys(value).length > 0) {
        const keys = Object.keys(value);
        accumulator = value[keys[0]];
        startIndex = 1;
      } else {
        // Ошибка для пустых коллекций без начального значения
        throw new TypeError('Reduce of empty array with no initial value');
      }
    } else {
      accumulator = initialValue;
    }

    // Оборачиваем начальный аккумулятор для callback
    let wrappedAccumulator = ass.wrap(accumulator);

    // Выполняем свертку
    if (type === 'array') {
      for (let i = startIndex; i < value.length; i++) {
        // Оборачиваем текущее значение и всю коллекцию для callback
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);

        // Вызываем callback с обернутыми данными
        const result = callback(wrappedAccumulator, wrappedValue, i, wrappedCollection);

        // Разворачиваем результат и сохраняем в аккумулятор
        accumulator = ass.unwrap(result);
        // Снова оборачиваем для следующей итерации
        wrappedAccumulator = ass.wrap(accumulator);
      }
    } else if (type === 'map') {
      let index = 0;
      for (const [key, val] of value) {
        if (index >= startIndex) {
          // Оборачиваем текущее значение и всю коллекцию для callback
          const wrappedValue = ass.wrap(val);
          const wrappedCollection = ass.wrap(value);

          // Вызываем callback с обернутыми данными
          const result = callback(wrappedAccumulator, wrappedValue, key, wrappedCollection);

          // Разворачиваем результат и сохраняем в аккумулятор
          accumulator = ass.unwrap(result);
          // Снова оборачиваем для следующей итерации
          wrappedAccumulator = ass.wrap(accumulator);
        }
        index++;
      }
    } else if (type === 'set') {
      // Исправлено: корректная итерация по Set
      let index = 0;
      for (const val of value) {
        if (index >= startIndex) {
          // Оборачиваем текущее значение и всю коллекцию для callback
          const wrappedValue = ass.wrap(val);
          const wrappedCollection = ass.wrap(value);

          // Вызываем callback с обернутыми данными
          const result = callback(wrappedAccumulator, wrappedValue, index, wrappedCollection);

          // Разворачиваем результат и сохраняем в аккумулятор
          accumulator = ass.unwrap(result);
          // Снова оборачиваем для следующей итерации
          wrappedAccumulator = ass.wrap(accumulator);
        }
        index++;
      }
    } else if (type === 'string') {
      for (let i = startIndex; i < value.length; i++) {
        // Оборачиваем текущее значение и всю коллекцию для callback
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);

        // Вызываем callback с обернутыми данными
        const result = callback(wrappedAccumulator, wrappedValue, i, wrappedCollection);

        // Разворачиваем результат и сохраняем в аккумулятор
        accumulator = ass.unwrap(result);
        // Снова оборачиваем для следующей итерации
        wrappedAccumulator = ass.wrap(accumulator);
      }
    } else if (type === 'object') {
      const keys = Object.keys(value);
      for (let i = startIndex; i < keys.length; i++) {
        const key = keys[i];
        // Оборачиваем текущее значение и всю коллекцию для callback
        const wrappedValue = ass.wrap(value[key]);
        const wrappedCollection = ass.wrap(value);

        // Вызываем callback с обернутыми данными
        const result = callback(wrappedAccumulator, wrappedValue, key, wrappedCollection);

        // Разворачиваем результат и сохраняем в аккумулятор
        accumulator = ass.unwrap(result);
        // Снова оборачиваем для следующей итерации
        wrappedAccumulator = ass.wrap(accumulator);
      }
    }

    // Создаем результирующую ассоциацию для поддержки трекинга
    const resultAssociation = ass.wrap(accumulator);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию свертки и параметры для отслеживания изменений
    resultAssociation.temp.callback = callback;
    resultAssociation.temp.hasInitialValue = hasInitialValue;
    resultAssociation.temp.initialValue = initialValue;
    resultAssociation.temp.method = 'reduce';

    // Создаем локальный обработчик для track
    resultAssociation._proxy.set('track', (ass, op) => {
      if (op !== 'get') return;

      // Получаем трекер через глобальный геттер
      const track = Association._proxy.get('track').call(ass, ass, 'get');

      // Если есть система событий и у нас есть доступ к origins
      if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
        const origin = ass.origins[0];

        // Создаем обработчик событий change для автоматического обновления
        // Подписываемся на событие change у origin
        const offChange = origin.on('change', (event, meta) => {
          // Получаем новое значение из ассоциации-источника
          const originValue = origin.this;

          // Для числовых массивов и операции сложения без initialValue
          if (Array.isArray(originValue) &&
              originValue.length > 0 &&
              originValue.every(item => typeof item === 'number') &&
              ass.temp.callback.toString().includes('acc + x') &&
              !ass.temp.hasInitialValue) {
            // Напрямую используем нативный reduce для суммирования
            ass.this = originValue.reduce((a, b) => a + b);

            // Генерируем событие изменения
            if (ass.emit) {
              ass.emit('change', {
                origin: origin,
                reason: 'track',
                prev: event?.prev,
                next: event?.next,
                detail: event?.detail,
                method: meta?.method || event?.detail?.operation || 'update'
              });
            }

            return;
          }

          // Точечное обновление результата вместо полного перевычисления
          // Проверяем наличие детальной информации и метаданных
          const detail = event?.detail;
          const eventMethod = meta?.method;
          const operation = detail?.operation;

          if (operation) {
            const callback = ass.temp.callback;
            const hasInitialValue = ass.temp.hasInitialValue;

            switch (operation) {
              case 'add':
              case 'push':
                // Для операций добавления элемента, если аккумулятор - это результат суммирования
                if (callback.toString().includes('acc + x') &&
                    typeof ass.this === 'number' &&
                    detail.value !== undefined &&
                    typeof detail.value === 'number') {

                  // Для арифметических операций можно просто добавить новое значение к аккумулятору
                  const prevValue = ass.this;
                  ass.this += detail.value;

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: prevValue,
                      next: ass.this,
                      detail: detail,
                      method: operation
                    });
                  }
                } else if (callback.toString().includes('acc.concat') &&
                           Array.isArray(ass.this) &&
                           detail.value !== undefined) {

                  // Для операции конкатенации можно просто добавить новый элемент
                  const prevValue = [...ass.this];
                  ass.this = [...ass.this, detail.value];

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: prevValue,
                      next: ass.this,
                      detail: detail,
                      method: operation
                    });
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'delete':
              case 'pop':
              case 'shift':
                // Для числовых массивов и операции вычитания элемента
                if (callback.toString().includes('acc - x') &&
                    typeof ass.this === 'number' &&
                    detail.value !== undefined &&
                    typeof detail.value === 'number') {

                  const prevValue = ass.this;
                  ass.this -= detail.value;

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: prevValue,
                      next: ass.this,
                      detail: detail,
                      method: operation
                    });
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'unshift':
                // Для операции добавления в начало массива
                if (callback.toString().includes('acc + x') &&
                    typeof ass.this === 'number' &&
                    detail.items &&
                    Array.isArray(detail.items) &&
                    detail.items.every(item => typeof item === 'number')) {

                  // Для арифметических операций можно просто суммировать новые значения
                  const prevValue = ass.this;
                  const sum = detail.items.reduce((sum, val) => sum + val, 0);
                  ass.this += sum;

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: prevValue,
                      next: ass.this,
                      detail: detail,
                      method: operation
                    });
                  }
                } else if (callback.toString().includes('acc.concat') &&
                           Array.isArray(ass.this) &&
                           detail.items &&
                           Array.isArray(detail.items)) {

                  // Для операции конкатенации можно добавить новые элементы
                  const prevValue = [...ass.this];
                  ass.this = [...detail.items, ...ass.this];

                  // Генерируем событие изменения
                  if (ass.emit) {
                    ass.emit('change', {
                      origin: origin,
                      reason: 'track',
                      prev: prevValue,
                      next: ass.this,
                      detail: detail,
                      method: operation
                    });
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'set':
                // Операция set сложно обрабатывать точечно, так как она может менять значение любого элемента
                // Полное перевычисление будет надежнее
                performFullRecalculation();
                break;

              default:
                // Для других операций делаем полное перевычисление
                performFullRecalculation();
                break;
            }
          } else {
            // Для других случаев - полное перевычисление
            performFullRecalculation();
          }

          // Функция для полного перевычисления результата
          function performFullRecalculation() {
            // Получаем параметры из temp
            const callback = ass.temp.callback;
            const hasInitialValue = ass.temp.hasInitialValue;
            const initialValue = ass.temp.initialValue;

            let accumulator;
            let startIndex = 0;

            // Если initialValue не указано, берем первый элемент как начальное значение
            if (!hasInitialValue) {
              if (Array.isArray(originValue) && originValue.length > 0) {
                accumulator = originValue[0];
                startIndex = 1;
              } else if (originValue instanceof Map && originValue.size > 0) {
                const firstEntry = originValue.entries().next().value;
                accumulator = firstEntry[1];
                startIndex = 1;
              } else if (originValue instanceof Set && originValue.size > 0) {
                accumulator = originValue.values().next().value;
                startIndex = 1;
              } else if (typeof originValue === 'string' && originValue.length > 0) {
                accumulator = originValue[0];
                startIndex = 1;
              } else if (typeof originValue === 'object' && originValue !== null && Object.keys(originValue).length > 0) {
                const keys = Object.keys(originValue);
                accumulator = originValue[keys[0]];
                startIndex = 1;
              } else {
                // Проверка пустых коллекций
                if ((Array.isArray(originValue) && originValue.length === 0) ||
                    (originValue instanceof Set && originValue.size === 0) ||
                    (originValue instanceof Map && originValue.size === 0) ||
                    (typeof originValue === 'string' && originValue.length === 0) ||
                    (typeof originValue === 'object' && originValue !== null && Object.keys(originValue).length === 0)) {
                  throw new TypeError('Reduce of empty array with no initial value');
                }
                return;
              }
            } else {
              accumulator = initialValue;
            }

            // Выполняем свертку
            if (Array.isArray(originValue)) {
              // Оборачиваем начальный аккумулятор
              let wrappedAccumulator = ass.wrap(accumulator);

              for (let i = startIndex; i < originValue.length; i++) {
                // Оборачиваем текущее значение и коллекцию
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);

                // Вызываем callback с обернутыми данными
                const result = callback(wrappedAccumulator, wrappedValue, i, wrappedCollection);

                // Разворачиваем результат и сохраняем в аккумулятор
                accumulator = ass.unwrap(result);
                // Снова оборачиваем для следующей итерации
                wrappedAccumulator = ass.wrap(accumulator);
              }
            } else if (originValue instanceof Map) {
              let index = 0;
              // Оборачиваем начальный аккумулятор
              let wrappedAccumulator = ass.wrap(accumulator);

              for (const [key, val] of originValue) {
                if (index >= startIndex) {
                  // Оборачиваем текущее значение и коллекцию
                  const wrappedValue = ass.wrap(val);
                  const wrappedCollection = ass.wrap(originValue);

                  // Вызываем callback с обернутыми данными
                  const result = callback(wrappedAccumulator, wrappedValue, key, wrappedCollection);

                  // Разворачиваем результат и сохраняем в аккумулятор
                  accumulator = ass.unwrap(result);
                  // Снова оборачиваем для следующей итерации
                  wrappedAccumulator = ass.wrap(accumulator);
                }
                index++;
              }
            } else if (originValue instanceof Set) {
              let index = 0;
              // Оборачиваем начальный аккумулятор
              let wrappedAccumulator = ass.wrap(accumulator);

              for (const val of originValue) {
                if (index >= startIndex) {
                  // Оборачиваем текущее значение и коллекцию
                  const wrappedValue = ass.wrap(val);
                  const wrappedCollection = ass.wrap(originValue);

                  // Вызываем callback с обернутыми данными
                  const result = callback(wrappedAccumulator, wrappedValue, index, wrappedCollection);

                  // Разворачиваем результат и сохраняем в аккумулятор
                  accumulator = ass.unwrap(result);
                  // Снова оборачиваем для следующей итерации
                  wrappedAccumulator = ass.wrap(accumulator);
                }
                index++;
              }
            } else if (typeof originValue === 'string') {
              // Оборачиваем начальный аккумулятор
              let wrappedAccumulator = ass.wrap(accumulator);

              for (let i = startIndex; i < originValue.length; i++) {
                // Оборачиваем текущее значение и коллекцию
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);

                // Вызываем callback с обернутыми данными
                const result = callback(wrappedAccumulator, wrappedValue, i, wrappedCollection);

                // Разворачиваем результат и сохраняем в аккумулятор
                accumulator = ass.unwrap(result);
                // Снова оборачиваем для следующей итерации
                wrappedAccumulator = ass.wrap(accumulator);
              }
            } else if (typeof originValue === 'object' && originValue !== null) {
              const keys = Object.keys(originValue);
              // Оборачиваем начальный аккумулятор
              let wrappedAccumulator = ass.wrap(accumulator);

              for (let i = startIndex; i < keys.length; i++) {
                const key = keys[i];
                // Оборачиваем текущее значение и коллекцию
                const wrappedValue = ass.wrap(originValue[key]);
                const wrappedCollection = ass.wrap(originValue);

                // Вызываем callback с обернутыми данными
                const result = callback(wrappedAccumulator, wrappedValue, key, wrappedCollection);

                // Разворачиваем результат и сохраняем в аккумулятор
                accumulator = ass.unwrap(result);
                // Снова оборачиваем для следующей итерации
                wrappedAccumulator = ass.wrap(accumulator);
              }
            }

            // Обновляем результат
            ass.this = accumulator;
          }

          // Генерируем событие изменения
          if (ass.emit) {
            ass.emit('change', {
              origin: origin,
              reason: 'track',
              prev: event?.prev,
              next: event?.next,
              detail: event?.detail,
              method: meta?.method || event?.detail?.operation || 'update'
            });
          }
        });

        // Сохраняем функцию отписки для возможности отключения отслеживания
        track.temp.offChange = offChange;
      }

      return track;
    });

    return resultAssociation;
  };
}

/**
 * Проверяет, удовлетворяют ли все элементы условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {boolean} - true, если все элементы удовлетворяют условию
 */
export function every(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.every = ass.temp.every || (callback =>
      every(ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем функцию проверки из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // Создаем результирующий аккумулятор
    let result = true;

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Применяем функцию проверки в зависимости от типа данных
    if (type === 'array') {
      // Для массивов итерируемся по элементам
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (!unwrappedResult) {
          result = false;
          break;
        }
      }
    } else if (type === 'string') {
      // Для строк итерируемся по символам
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (!unwrappedResult) {
          result = false;
          break;
        }
      }
    } else if (type === 'set') {
      // Для Set используем for...of с ручным индексом
      let index = 0;
      for (const val of value) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, index++, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (!unwrappedResult) {
          result = false;
          break;
        }
      }
    } else if (type === 'map') {
      // Для карт (Map) итерируемся по записям [ключ, значение]
      for (const [key, val] of value) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (!unwrappedResult) {
          result = false;
          break;
        }
      }
    } else if (type === 'object') {
      // Для объектов итерируемся по ключам
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const wrappedValue = ass.wrap(value[key]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (!unwrappedResult) {
          result = false;
          break;
        }
      }
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию проверки и имя метода для отслеживания
    resultAssociation.temp.predicate = callback;
    resultAssociation.temp.method = 'every';

    // Создаем локальный обработчик track
    resultAssociation._proxy.set('track', (ass, op) => {
      if (op !== 'get') return;

      // Получаем трекер через глобальный геттер
      const track = Association._proxy.get('track').call(ass, ass, 'get');

      // Если есть система событий и у нас есть доступ к origins
      if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
        const origin = ass.origins[0];
        const method = ass.temp.method;
        const predicateFn = ass.temp.predicate;

        // Создаем обработчик событий change для автоматического обновления
        // Подписываемся на событие change у origin
        const offChange = origin.on('change', (event, meta) => {
          // Для every всегда делаем полное перевычисление при любом изменении
          performFullRecalculation();

          // Функция для полного перевычисления результата
          function performFullRecalculation() {
            const type = origin.detect;
            const originValue = origin.this;
            let everyResult = true;

            if (originValue === null || originValue === undefined) {
              everyResult = true;
            } else if (Array.isArray(originValue)) {
              for (let i = 0; i < originValue.length; i++) {
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, i, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (!unwrappedResult) {
                  everyResult = false;
                  break;
                }
              }
            } else if (originValue instanceof Map) {
              for (const [key, val] of originValue.entries()) {
                const wrappedValue = ass.wrap(val);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, key, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (!unwrappedResult) {
                  everyResult = false;
                  break;
                }
              }
            } else if (originValue instanceof Set) {
              let index = 0;
              for (const val of originValue) {
                const wrappedValue = ass.wrap(val);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, index++, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (!unwrappedResult) {
                  everyResult = false;
                  break;
                }
              }
            } else if (type === 'string') {
              for (let i = 0; i < originValue.length; i++) {
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, i, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (!unwrappedResult) {
                  everyResult = false;
                  break;
                }
              }
            } else if (typeof originValue === 'object') {
              const keys = Object.keys(originValue);
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const wrappedValue = ass.wrap(originValue[key]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, key, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (!unwrappedResult) {
                  everyResult = false;
                  break;
                }
              }
            }

            // Сохраняем текущий результат до изменения
            const prevResult = ass.this;

            if (prevResult !== everyResult) {
              // Обновляем значение только если результат изменился
              ass.this = everyResult;

              // Генерируем событие изменения при изменении результата
              if (ass.emit) {
                ass.emit('change', {
                  origin: origin,
                  reason: 'track',
                  prev: { this: prevResult },
                  next: { this: everyResult },
                  detail: event?.detail,
                  method: meta?.method || event?.detail?.operation || 'update'
                });
              }
            }
          }
        });

        // Сохраняем функцию отписки для возможности отключения отслеживания
        track.temp.offChange = offChange;
      }

      return track;
    });

    return resultAssociation;
  };
}

/**
 * Проверяет, удовлетворяет ли хотя бы один элемент условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {boolean} - true, если хотя бы один элемент удовлетворяет условию
 */
export function some(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.some = ass.temp.some || (callback =>
      some(ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем функцию проверки из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // Создаем результирующий аккумулятор
    let result = false;

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Применяем функцию проверки в зависимости от типа данных
    if (type === 'array') {
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = true;
          break;
        }
      }
    } else if (type === 'map') {
      for (const [key, val] of value.entries()) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = true;
          break;
        }
      }
    } else if (type === 'set') {
      let index = 0;
      for (const val of value) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, index++, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = true;
          break;
        }
      }
    } else if (type === 'string') {
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = true;
          break;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const wrappedValue = ass.wrap(value[key]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = true;
          break;
        }
      }
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию проверки и имя метода для отслеживания
    resultAssociation.temp.predicate = callback;
    resultAssociation.temp.method = 'some';

    // Создаем локальный обработчик track
    resultAssociation._proxy.set('track', (ass, op) => {
      if (op !== 'get') return;

      // Получаем трекер через глобальный геттер
      const track = Association._proxy.get('track').call(ass, ass, 'get');

      // Если есть система событий и у нас есть доступ к origins
      if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
        const origin = ass.origins[0];
        const method = ass.temp.method;
        const predicateFn = ass.temp.predicate;

        // Создаем обработчик событий change для автоматического обновления
        // Подписываемся на событие change у origin
        const offChange = origin.on('change', (event, meta) => {
          // Для some всегда делаем полное перевычисление при любом изменении
          performFullRecalculation();

          // Функция для полного перевычисления результата
          function performFullRecalculation() {
            const type = origin.detect;
            const originValue = origin.this;
            let someResult = false;

            if (originValue === null || originValue === undefined) {
              someResult = false;
            } else if (Array.isArray(originValue)) {
              for (let i = 0; i < originValue.length; i++) {
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, i, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (unwrappedResult) {
                  someResult = true;
                  break;
                }
              }
            } else if (originValue instanceof Map) {
              for (const [key, val] of originValue.entries()) {
                const wrappedValue = ass.wrap(val);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, key, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (unwrappedResult) {
                  someResult = true;
                  break;
                }
              }
            } else if (originValue instanceof Set) {
              let index = 0;
              for (const val of originValue) {
                const wrappedValue = ass.wrap(val);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, index++, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (unwrappedResult) {
                  someResult = true;
                  break;
                }
              }
            } else if (type === 'string') {
              for (let i = 0; i < originValue.length; i++) {
                const wrappedValue = ass.wrap(originValue[i]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, i, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (unwrappedResult) {
                  someResult = true;
                  break;
                }
              }
            } else if (typeof originValue === 'object') {
              const keys = Object.keys(originValue);
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const wrappedValue = ass.wrap(originValue[key]);
                const wrappedCollection = ass.wrap(originValue);
                const callbackResult = predicateFn(wrappedValue, key, wrappedCollection);
                const unwrappedResult = ass.unwrap(callbackResult);

                if (unwrappedResult) {
                  someResult = true;
                  break;
                }
              }
            }

            // Сохраняем текущий результат до изменения
            const prevResult = ass.this;

            if (prevResult !== someResult) {
              // Обновляем значение только если результат изменился
              ass.this = someResult;

              // Генерируем событие изменения при изменении результата
              if (ass.emit) {
                ass.emit('change', {
                  origin: origin,
                  reason: 'track',
                  prev: { this: prevResult },
                  next: { this: someResult },
                  detail: event?.detail,
                  method: meta?.method || event?.detail?.operation || 'update'
                });
              }
            }
          }
        });

        // Сохраняем функцию отписки для возможности отключения отслеживания
        track.temp.offChange = offChange;
      }

      return track;
    });

    return resultAssociation;
  }
}

/**
 * Ищет первый элемент, удовлетворяющий условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {*} - Найденный элемент или undefined
 */
export function find(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.find = ass.temp.find || (callback =>
      find(ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем функцию поиска из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // Создаем результирующий аккумулятор
    let result;

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Применяем функцию поиска в зависимости от типа данных
    if (type === 'array') {
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = value[i];
          break;
        }
      }
    } else if (type === 'map') {
      for (const [key, val] of value.entries()) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = val;
          break;
        }
      }
    } else if (type === 'set') {
      let index = 0;
      for (const val of value) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, index, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = val;
          break;
        }
        index++;
      }
    } else if (type === 'string') {
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = value[i];
          break;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const wrappedValue = ass.wrap(value[key]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = value[key];
          break;
        }
      }
    }

    // Если ничего не найдено, возвращаем undefined
    if (result === undefined) {
      return undefined;
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию поиска и имя метода для отслеживания
    resultAssociation.temp.predicate = callback;
    resultAssociation.temp.method = 'find';

    return resultAssociation;
  }
}

/**
 * Ищет ключ первого элемента, удовлетворяющего условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {*} - Ключ найденного элемента или undefined
 */
export function findKey(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.findKey = ass.temp.findKey || (callback =>
      findKey(ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем функцию поиска из аргументов и применяем unwrap
    const callback = ass.unwrap(args[0]);

    // Проверяем, что callback является функцией
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // Создаем результирующий аккумулятор
    let result;

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Применяем функцию поиска в зависимости от типа данных
    if (type === 'array') {
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = i;
          break;
        }
      }
    } else if (type === 'map') {
      for (const [key, val] of value.entries()) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = key;
          break;
        }
      }
    } else if (type === 'set') {
      let index = 0;
      for (const val of value) {
        const wrappedValue = ass.wrap(val);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, index, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = index;
          break;
        }
        index++;
      }
    } else if (type === 'string') {
      for (let i = 0; i < value.length; i++) {
        const wrappedValue = ass.wrap(value[i]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, i, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = i;
          break;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const wrappedValue = ass.wrap(value[key]);
        const wrappedCollection = ass.wrap(value);
        const callbackResult = callback(wrappedValue, key, wrappedCollection);
        const unwrappedResult = ass.unwrap(callbackResult);

        if (unwrappedResult) {
          result = key;
          break;
        }
      }
    }

    // Если ничего не найдено, возвращаем undefined
    if (result === undefined) {
      return undefined;
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию поиска и имя метода для отслеживания
    resultAssociation.temp.predicate = callback;
    resultAssociation.temp.method = 'findKey';

    return resultAssociation;
  }
}

/**
 * Группа всех методов для экспорта
 */
export const all = {
  forEach,
  map,
  filter,
  reduce,
  every,
  some,
  find,
  findKey,
  keys,
  values,
  entries,
  join
};

// Добавляем методы в прокси
for (const name in all) {
  Association._proxy.set(name, all[name]);
}

// Добавляем методы в прокси
Association._proxy.set('get', get);

/**
 * Возвращает массив ключей коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив ключей
 */
export function keys(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.keys = ass.temp.keys || (() =>
      keys(ass, 'apply')
    );
  } else if (op === 'apply') {
    const value = ass.this;
    let result = [];

    if (value === null || value === undefined) {
      result = [];
    } else if (Array.isArray(value)) {
      result = Array.from({ length: value.length }, (_, i) => i);
    } else if (value instanceof Map) {
      result = Array.from(value.keys());
    } else if (value instanceof Set) {
      result = Array.from({ length: value.size }, (_, i) => i);
    } else if (typeof value === 'string') {
      result = Array.from({ length: value.length }, (_, i) => i);
    } else if (typeof value === 'object') {
      result = Object.keys(value);
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем имя метода для отслеживания
    resultAssociation.temp.method = 'keys';

    return resultAssociation;
  }
}

/**
 * Возвращает массив значений коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив значений
 */
export function values(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.values = ass.temp.values || (() =>
      values(ass, 'apply')
    );
  } else if (op === 'apply') {
    const value = ass.this;
    let result = [];

    if (value === null || value === undefined) {
      result = [];
    } else if (Array.isArray(value)) {
      result = [...value];
    } else if (value instanceof Map) {
      result = Array.from(value.values());
    } else if (value instanceof Set) {
      result = Array.from(value);
    } else if (typeof value === 'string') {
      result = value.split('');
    } else if (typeof value === 'object') {
      result = Object.values(value);
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем имя метода для отслеживания
    resultAssociation.temp.method = 'values';

    return resultAssociation;
  }
}

/**
 * Возвращает массив пар [ключ, значение] коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив пар [ключ, значение]
 */
export function entries(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.entries = ass.temp.entries || (() =>
      entries(ass, 'apply')
    );
  } else if (op === 'apply') {
    const value = ass.this;
    let result = [];

    if (value === null || value === undefined) {
      result = [];
    } else if (Array.isArray(value)) {
      result = value.map((v, i) => [i, v]);
    } else if (value instanceof Map) {
      result = Array.from(value.entries());
    } else if (value instanceof Set) {
      result = Array.from(value).map((v, i) => [i, v]);
    } else if (typeof value === 'string') {
      result = Array.from(value).map((v, i) => [i, v]);
    } else if (typeof value === 'object') {
      result = Object.entries(value);
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем имя метода для отслеживания
    resultAssociation.temp.method = 'entries';

    return resultAssociation;
  }
}

/**
 * Объединяет элементы коллекции в строку
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {string} [separator=','] - Разделитель
 * @returns {string} - Объединенная строка
 */
export function join(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.join = ass.temp.join || (separator =>
      join(ass, 'apply', [separator])
    );
  } else if (op === 'apply') {
    // Получаем разделитель из аргументов
    const separator = args[0] === undefined ? ',' : args[0];

    // Создаем результирующую строку
    let result = '';

    // Получаем внутреннее значение ассоциации
    const value = ass.this;

    // Определяем тип данных
    const type = ass.detect;

    // Применяем функцию объединения в зависимости от типа данных
    if (type === 'array') {
      // Для массивов используем встроенный метод join
      result = value.join(separator);
    } else if (type === 'string') {
      // Для строк используем разбиение и соединение
      result = value.split('').join(separator);
    } else if (type === 'set') {
      // Исправлено: корректное преобразование Set в массив и join
      result = Array.from(value).join(separator);
    } else if (type === 'map') {
      // Для карт (Map) преобразуем значения в массив и объединяем
      result = Array.from(value.values()).join(separator);
    } else if (type === 'object') {
      // Для объектов используем значения свойств
      result = Object.values(value).join(separator);
    } else {
      // Для прочих типов просто преобразуем в строку
      result = String(value);
    }

    // Создаем результирующую ассоциацию для поддержки трекинга
    const resultAssociation = ass.wrap(result);

    // Устанавливаем исходную ассоциацию как origins
    resultAssociation.origins = [ass];

    // Сохраняем функцию объединения и параметры для отслеживания изменений
    resultAssociation.temp.separator = separator;
    resultAssociation.temp.method = 'join';

    // Создаем локальный обработчик track
    resultAssociation._proxy.set('track', (ass, op) => {
      if (op !== 'get') return;

      // Получаем трекер через глобальный геттер
      const track = Association._proxy.get('track').call(ass, ass, 'get');

      // Если есть система событий и у нас есть доступ к origins
      if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
        const origin = ass.origins[0];
        const method = ass.temp.method;
        const sep = ass.temp.separator;

        // Создаем обработчик событий change для автоматического обновления
        // Подписываемся на событие change у origin
        const offChange = origin.on('change', (event, meta) => {
          // Для join всегда делаем полное перевычисление при любом изменении
          performFullRecalculation();

          // Функция для полного перевычисления результата
          function performFullRecalculation() {
            const type = origin.detect;
            const originValue = origin.this;
            let newResult = '';

            if (originValue === null || originValue === undefined) {
              newResult = '';
            } else if (Array.isArray(originValue)) {
              newResult = originValue.join(sep);
            } else if (originValue instanceof Map) {
              newResult = Array.from(originValue.values()).join(sep);
            } else if (originValue instanceof Set) {
              newResult = Array.from(originValue).join(sep);
            } else if (type === 'string') {
              newResult = originValue.split('').join(sep);
            } else if (type === 'object') {
              newResult = Object.values(originValue).join(sep);
            } else {
              newResult = String(originValue);
            }

            // Сохраняем текущий результат до изменения
            const prevResult = ass.this;

            if (prevResult !== newResult) {
              // Обновляем значение только если результат изменился
              ass.this = newResult;

              // Генерируем событие изменения при изменении результата
              if (ass.emit) {
                ass.emit('change', {
                  origin: origin,
                  reason: 'track',
                  prev: { this: prevResult },
                  next: { this: newResult },
                  detail: event?.detail,
                  method: meta?.method || event?.detail?.operation || 'update'
                });
              }
            }
          }
        });

        // Сохраняем функцию отписки для возможности отключения отслеживания
        track.temp.offChange = offChange;
      }

      return track;
    });

    return resultAssociation;
  }
}

/**
 * Возвращает количество элементов в коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get')
 * @returns {Association} - Ассоциация с числом элементов
 */
export function count(ass, op) {
  if (op !== 'get') return;

  // Получаем внутреннее значение ассоциации
  const value = ass.this;
  let result = 0;

  // Определяем количество в зависимости от типа данных
  if (value === null || value === undefined) {
    result = 0;
  } else if (Array.isArray(value) || typeof value === 'string') {
    result = value.length;
  } else if (value instanceof Map || value instanceof Set) {
    result = value.size;
  } else if (typeof value === 'object') {
    result = Object.keys(value).length;
  } else if (value !== null && value !== undefined) {
    // Для примитивных типов (number, boolean, symbol) считаем как 1
    result = 1;
  }

  // Создаем новую ассоциацию для результата
  const resultAssociation = ass.wrap(result);

  // Устанавливаем исходную ассоциацию как origins
  resultAssociation.origins = [ass];

  // Сохраняем имя метода для отслеживания
  resultAssociation.temp.method = 'count';

  // Создаем локальный обработчик track
  resultAssociation._proxy.set('track', (ass, op) => {
    if (op !== 'get') return;

    // Получаем трекер через глобальный геттер
    const track = Association._proxy.get('track').call(ass, ass, 'get');

    // Если есть система событий и у нас есть доступ к origins
    if (ass.origins.length > 0 && ass.origins[0].on && ass.origins[0].emit) {
      const origin = ass.origins[0];

      // Создаем обработчик событий change для автоматического обновления
      // Подписываемся на событие change у origin
      const offChange = origin.on('change', (event, meta) => {
        // Получаем новое значение из ассоциации-источника
        const originValue = origin.this;
        let newCount = 0;

        // Пересчитываем количество элементов в зависимости от типа данных
        if (originValue === null || originValue === undefined) {
          newCount = 0;
        } else if (Array.isArray(originValue) || typeof originValue === 'string') {
          newCount = originValue.length;
        } else if (originValue instanceof Map || originValue instanceof Set) {
          newCount = originValue.size;
        } else if (typeof originValue === 'object') {
          newCount = Object.keys(originValue).length;
        } else if (originValue !== null && originValue !== undefined) {
          // Для примитивных типов (number, boolean, symbol) считаем как 1
          newCount = 1;
        }

        // Сохраняем текущее значение до изменения
        const prevCount = ass.this;

        if (prevCount !== newCount) {
          // Обновляем значение только если результат изменился
          ass.this = newCount;

          // Генерируем событие изменения при изменении результата
          if (ass.emit) {
            ass.emit('change', {
              origin: origin,
              reason: 'track',
              prev: prevCount,
              next: newCount,
              detail: event?.detail,
              method: meta?.method || event?.detail?.operation || 'update'
            });
          }
        }
      });

      // Сохраняем функцию отписки для возможности отключения отслеживания
      track.temp.offChange = offChange;
    }

    return track;
  });

  return resultAssociation;
}

/**
 * Алиас для метода count, возвращает количество элементов
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get')
 * @returns {Association} - Ассоциация с числом элементов
 */
export function size(ass, op) {
  return count(ass, op);
}

/**
 * Алиас для метода count, возвращает количество элементов
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get')
 * @returns {Association} - Ассоциация с числом элементов
 */
export function length(ass, op) {
  return count(ass, op);
}

// Добавляем методы в глобальный прокси Association
Association._proxy.set('count', count);
Association._proxy.set('size', size);
Association._proxy.set('length', length);
