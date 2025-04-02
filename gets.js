/**
 * Модуль универсальных методов доступа (неизменяемые операции)
 *
 * Содержит набор методов для работы с данными, оптимизированных для использования
 * с классом Association. Эти методы не вносят изменений в исходные данные
 * и работают с различными типами данных.
 */

import { Association } from "./association.js";

/**
 * Выполняет перебор элементов коллекции или свойств объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {Association} - Исходный экземпляр Association
 */
export function forEach(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return ass;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        callback(value[i], i, value);
      }
    } else if (value instanceof Map) {
      value.forEach((val, key) => callback(val, key, value));
    } else if (value instanceof Set) {
      let index = 0;
      value.forEach(val => callback(val, index++, value));
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        callback(value[i], i, value);
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        callback(value[key], key, value);
      }
    }

    return ass;
  };
}

/**
 * Преобразует элементы коллекции или свойства объекта
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {Association} - Новая ассоциация с преобразованными значениями
 */
export function map(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.map = ass.temp.map || (callback =>
      Association._proxy.get('map').call(ass, ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем колбэк из аргументов
    const callback = args[0];

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

    // Применяем функцию преобразования в зависимости от типа
    if (type === 'array' || type === 'string') {
      // Для массивов и строк итерируемся по элементам
      for (let i = 0; i < value.length; i++) {
        result.push(callback(value[i], i, value));
      }
    } else if (type === 'set') {
      // Для множеств (Set) используем for...of с ручным индексом
      let index = 0;
      for (const val of value) {
        result.push(callback(val, index++, value));
      }
    } else if (type === 'map') {
      // Для карт (Map) итерируемся по записям [ключ, значение]
      for (const [key, val] of value) {
        result.push(callback(val, key, value));
      }
    } else if (type === 'object') {
      // Для объектов итерируемся по ключам
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        result.push(callback(value[key], key, value));
      }
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = new Association(result);

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
                  const newValue = transformer(detail.value, detail.key, origin.this);
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
                      ass.this[newIndex] = transformer(value, newIndex, originArray);
                    });
                  }
                } else if (detail.key !== undefined) {
                  // Для множеств и объектов ищем по значению
                  const index = ass.this.findIndex((item, i) => {
                    // Для set/map ключ = значение, для объектов это имя свойства
                    if (detail.type === 'set' || detail.type === 'map') {
                      return item === transformer(detail.key, detail.key, origin.this);
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
                    ass.this[detail.position] = transformer(detail.value, detail.key, origin.this);
                  } else if (detail.isNewProperty) {
                    // Если это новое свойство, добавляем его
                    ass.this.push(transformer(detail.value, detail.key, origin.this));
                  } else {
                    performFullRecalculation();
                  }
                } else if (detail.key !== undefined) {
                  // Для объектов и карт ищем позицию
                  const position = detail.type === 'object'
                    ? Object.keys(origin.this).indexOf(detail.key)
                    : undefined;

                  if (position !== undefined && position < ass.this.length) {
                    ass.this[position] = transformer(detail.value, detail.key, origin.this);
                  } else if (detail.isNewProperty) {
                    // Если это новое свойство, добавляем его
                    ass.this.push(transformer(detail.value, detail.key, origin.this));
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
                        ass.this[newIndex] = transformer(value, newIndex, originArray);
                      }
                    });
                  }
                } else {
                  // Для других типов ищем элемент по значению
                  const index = ass.this.findIndex((item, idx) => {
                    // Пытаемся найти исходное значение
                    if (detail.type === 'set') {
                      return origin.this.has(detail.value) &&
                             item === transformer(detail.value, idx, origin.this);
                    } else {
                      return item === transformer(detail.value, idx, origin.this);
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
                    const transformedValue = transformer(value, originalIndex, origin.this);
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
                      ass.this[i] = transformer(originArray[i], i, originArray);
                    }
                  }
                } else {
                  performFullRecalculation();
                }
                break;

              case 'unshift':
                // Обработка события unshift - добавление элементов в начало и сдвиг существующих
                if (detail.items && Array.isArray(detail.items)) {
                  // Для простоты делаем полное перевычисление, так как все индексы меняются
                  performFullRecalculation();
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

            if (type === 'array') {
              ass.this = origin.this.map(transformer);
            } else if (type === 'object') {
              const newResult = [];
              Object.keys(origin.this).forEach(key => {
                newResult.push(transformer(origin.this[key], key, origin.this));
              });
              ass.this = newResult;
            } else if (type === 'map') {
              const newResult = [];
              origin.this.forEach((val, key) => {
                newResult.push(transformer(val, key, origin.this));
              });
              ass.this = newResult;
            } else if (type === 'set') {
              const newResult = [];
              let index = 0;
              for (const val of origin.this) {
                newResult.push(transformer(val, index++, origin.this));
              }
              ass.this = newResult;
            } else if (type === 'string') {
              const newResult = [];
              for (let i = 0; i < origin.this.length; i++) {
                newResult.push(transformer(origin.this[i], i, origin.this));
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
  };
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
      Association._proxy.get('filter').call(ass, ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем функцию фильтрации из аргументов
    const callback = args[0];

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
    if (type === 'array' || type === 'string') {
      // Для массивов и строк итерируемся по элементам
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          result.push(value[i]);
        }
      }
    } else if (type === 'set') {
      // Исправлено: корректная итерация по Set с использованием for...of
      for (const val of value) {
        if (callback(val, val, value)) {
          result.push(val);
        }
      }
    } else if (type === 'map') {
      // Для карт (Map) итерируемся по записям [ключ, значение]
      for (const [key, val] of value) {
        if (callback(val, key, value)) {
          result.push(val);
        }
      }
    } else if (type === 'object') {
      // Для объектов итерируемся по ключам
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          result.push(value[key]);
        }
      }
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = new Association(result);

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
                    if (filterFn(newValue, newIndex, originValue)) {
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

                  return; // Избегаем полного перерасчета
                }
                break;

              case 'pop':
                // Для pop, если последний элемент в результате такой же как pop-нутый, удаляем его
                if (origin.detect === 'array' && detail.value !== undefined) {
                  // Если последний элемент нашего результата совпадает с удаляемым
                  if (ass.this.length > 0 && ass.this[ass.this.length - 1] === detail.value) {
                    ass.this.pop();
                    return; // Избегаем полного перерасчета
                  }
                }
                break;

              case 'shift':
                // Для shift, если первый элемент в результате такой же как shift-нутый, удаляем его
                if (origin.detect === 'array' && detail.value !== undefined) {
                  // Если первый элемент нашего результата совпадает с удаляемым
                  if (ass.this.length > 0 && ass.this[0] === detail.value) {
                    ass.this.shift();
                  }

                  // В любом случае нужно сделать полный перерасчет, так как индексы меняются
                }
                break;

              case 'unshift':
                // Для unshift всегда делаем полный перерасчет, так как все индексы меняются
                break;
            }
          }

          // Для фильтра оптимальнее всего делать полное перевычисление при любом изменении
          // поскольку нам нужно заново проверить все элементы через функцию фильтрации
          performFullRecalculation();

          // Функция для полного перевычисления результата
          function performFullRecalculation() {
            const type = origin.detect;
            const originValue = origin.this;
            const filteredResult = [];
            const previousResult = [...ass.this]; // Сохраняем текущий результат

            if (type === 'array') {
              for (let i = 0; i < originValue.length; i++) {
                if (filterFn(originValue[i], i, originValue)) {
                  filteredResult.push(originValue[i]);
                }
              }
            } else if (type === 'map') {
              originValue.forEach((val, key) => {
                if (filterFn(val, key, originValue)) {
                  filteredResult.push(val);
                }
              });
            } else if (type === 'set') {
              let index = 0;
              originValue.forEach(val => {
                if (filterFn(val, index++, originValue)) {
                  filteredResult.push(val);
                }
              });
            } else if (type === 'string') {
              for (let i = 0; i < originValue.length; i++) {
                if (filterFn(originValue[i], i, originValue)) {
                  filteredResult.push(originValue[i]);
                }
              }
            } else if (type === 'object') {
              const keys = Object.keys(originValue);
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (filterFn(originValue[key], key, originValue)) {
                  filteredResult.push(originValue[key]);
                }
              }
            }

            // Проверяем, изменился ли результат
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
  };
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
    // Получаем функцию свертки и начальное значение из аргументов
    const callback = args[0];
    const initialValue = args[1];
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
          return new Association(value.reduce((a, b) => a + b));
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

    // Выполняем свертку
    if (type === 'array') {
      for (let i = startIndex; i < value.length; i++) {
        accumulator = callback(accumulator, value[i], i, value);
      }
    } else if (type === 'map') {
      let index = 0;
      for (const [key, val] of value) {
        if (index >= startIndex) {
          accumulator = callback(accumulator, val, key, value);
        }
        index++;
      }
    } else if (type === 'set') {
      // Исправлено: корректная итерация по Set
      let index = 0;
      for (const val of value) {
        if (index >= startIndex) {
          accumulator = callback(accumulator, val, index, value);
        }
        index++;
      }
    } else if (type === 'string') {
      for (let i = startIndex; i < value.length; i++) {
        accumulator = callback(accumulator, value[i], i, value);
      }
    } else if (type === 'object') {
      const keys = Object.keys(value);
      for (let i = startIndex; i < keys.length; i++) {
        const key = keys[i];
        accumulator = callback(accumulator, value[key], key, value);
      }
    }

    // Создаем результирующую ассоциацию для поддержки трекинга
    const resultAssociation = new Association(accumulator);

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

          // Для других случаев - полное перевычисление
          performFullRecalculation();

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
              for (let i = startIndex; i < originValue.length; i++) {
                accumulator = callback(accumulator, originValue[i], i, originValue);
              }
            } else if (originValue instanceof Map) {
              let index = 0;
              for (const [key, val] of originValue) {
                if (index >= startIndex) {
                  accumulator = callback(accumulator, val, key, originValue);
                }
                index++;
              }
            } else if (originValue instanceof Set) {
              let index = 0;
              for (const val of originValue) {
                if (index >= startIndex) {
                  accumulator = callback(accumulator, val, index, originValue);
                }
                index++;
              }
            } else if (typeof originValue === 'string') {
              for (let i = startIndex; i < originValue.length; i++) {
                accumulator = callback(accumulator, originValue[i], i, originValue);
              }
            } else if (typeof originValue === 'object' && originValue !== null) {
              const keys = Object.keys(originValue);
              for (let i = startIndex; i < keys.length; i++) {
                const key = keys[i];
                accumulator = callback(accumulator, originValue[key], key, originValue);
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
      Association._proxy.get('every').call(ass, ass, 'apply', [callback])
    );
  } else if (op === 'apply') {
    // Получаем функцию проверки из аргументов
    const callback = args[0];

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
    if (type === 'array' || type === 'string' || type === 'set') {
      // Для массивов, строк и множеств итерируемся по элементам
      for (let i = 0; i < value.length; i++) {
        if (!callback(value[i], i, value)) {
          result = false;
          break;
        }
      }
    } else if (type === 'map') {
      // Для карт (Map) итерируемся по записям [ключ, значение]
      for (const [key, val] of value) {
        if (!callback(val, key, value)) {
          result = false;
          break;
        }
      }
    } else if (type === 'object') {
      // Для объектов итерируемся по ключам
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!callback(value[key], key, value)) {
          result = false;
          break;
        }
      }
    }

    // Создаем новую ассоциацию для результата
    const resultAssociation = new Association(result);

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
                if (!predicateFn(originValue[i], i, originValue)) {
                  everyResult = false;
                  break;
                }
              }
            } else if (originValue instanceof Map) {
              for (const [key, val] of originValue.entries()) {
                if (!predicateFn(val, key, originValue)) {
                  everyResult = false;
                  break;
                }
              }
            } else if (originValue instanceof Set) {
              let index = 0;
              for (const val of originValue) {
                if (!predicateFn(val, index++, originValue)) {
                  everyResult = false;
                  break;
                }
              }
            } else if (typeof originValue === 'string') {
              for (let i = 0; i < originValue.length; i++) {
                if (!predicateFn(originValue[i], i, originValue)) {
                  everyResult = false;
                  break;
                }
              }
            } else if (typeof originValue === 'object') {
              const keys = Object.keys(originValue);
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!predicateFn(originValue[key], key, originValue)) {
                  everyResult = false;
                  break;
                }
              }
            }

            // Обновляем результат
            ass.this = everyResult;
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
 * Проверяет, удовлетворяет ли хотя бы один элемент условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {boolean} - true, если хотя бы один элемент удовлетворяет условию
 */
export function some(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return false;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return true;
        }
      }
    } else if (value instanceof Map) {
      for (const [key, val] of value.entries()) {
        if (callback(val, key, value)) {
          return true;
        }
      }
    } else if (value instanceof Set) {
      let index = 0;
      for (const val of value) {
        if (callback(val, index++, value)) {
          return true;
        }
      }
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return true;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          return true;
        }
      }
    }

    return false;
  };
}

/**
 * Ищет первый элемент, удовлетворяющий условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {*} - Найденный элемент или undefined
 */
export function find(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return value[i];
        }
      }
    } else if (value instanceof Map) {
      for (const [key, val] of value.entries()) {
        if (callback(val, key, value)) {
          return val;
        }
      }
    } else if (value instanceof Set) {
      let index = 0;
      for (const val of value) {
        if (callback(val, index++, value)) {
          return val;
        }
      }
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return value[i];
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          return value[key];
        }
      }
    }

    return undefined;
  };
}

/**
 * Ищет ключ первого элемента, удовлетворяющего условию
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @param {Function} [callback] - функция обратного вызова (value, key, collection)
 * @returns {string|number|symbol} - Найденный ключ или undefined
 */
export function findKey(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function(callback) {
    const value = ass.this;

    if (value === null || value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return i;
        }
      }
    } else if (value instanceof Map) {
      for (const [key, val] of value.entries()) {
        if (callback(val, key, value)) {
          return key;
        }
      }
    } else if (value instanceof Set) {
      let index = 0;
      for (const val of value) {
        if (callback(val, index, value)) {
          return index;
        }
        index++;
      }
    } else if (typeof value === 'string') {
      for (let i = 0; i < value.length; i++) {
        if (callback(value[i], i, value)) {
          return i;
        }
      }
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (callback(value[key], key, value)) {
          return key;
        }
      }
    }

    return undefined;
  };
}

/**
 * Возвращает массив ключей коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив ключей
 */
export function keys(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const value = ass.this;

    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return Array.from({ length: value.length }, (_, i) => i);
    } else if (value instanceof Map) {
      return Array.from(value.keys());
    } else if (value instanceof Set) {
      return Array.from({ length: value.size }, (_, i) => i);
    } else if (typeof value === 'string') {
      return Array.from({ length: value.length }, (_, i) => i);
    } else if (typeof value === 'object') {
      return Object.keys(value);
    }

    return [];
  };
}

/**
 * Возвращает массив значений коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив значений
 */
export function values(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const value = ass.this;

    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return [...value];
    } else if (value instanceof Map) {
      return Array.from(value.values());
    } else if (value instanceof Set) {
      return Array.from(value);
    } else if (typeof value === 'string') {
      return value.split('');
    } else if (typeof value === 'object') {
      return Object.values(value);
    }

    return [];
  };
}

/**
 * Возвращает массив пар [ключ, значение] коллекции
 * @param {Association} ass - Экземпляр Association
 * @param {string} op - Операция ('get', 'apply')
 * @returns {Array} - Массив пар [ключ, значение]
 */
export function entries(ass, op) {
  if (op !== 'get' && op !== 'apply') return;

  return function() {
    const value = ass.this;

    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((v, i) => [i, v]);
    } else if (value instanceof Map) {
      return Array.from(value.entries());
    } else if (value instanceof Set) {
      return Array.from(value).map((v, i) => [i, v]);
    } else if (typeof value === 'string') {
      return Array.from(value).map((v, i) => [i, v]);
    } else if (typeof value === 'object') {
      return Object.entries(value);
    }

    return [];
  };
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
      Association._proxy.get('join').call(ass, ass, 'apply', [separator])
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
    const resultAssociation = new Association(result);

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
            } else if (typeof originValue === 'string') {
              newResult = originValue.split('').join(sep);
            } else if (typeof originValue === 'object') {
              newResult = Object.values(originValue).join(sep);
            } else {
              newResult = String(originValue);
            }

            // Обновляем результат
            ass.this = newResult;
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
