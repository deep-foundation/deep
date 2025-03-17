/**
 * События - класс для управления подпиской на события и их вызовом.
 * Оптимизирован для работы с большим количеством разных типов событий.
 */
export class Events {
  /**
   * Хранилище обработчиков событий, структурированное по типам событий.
   * @type {Map<string, Set<Function>>}
   * @private
   */
  _handlers = new Map();

  /**
   * Хранилище контекстов для обработчиков.
   * @type {WeakMap<Function, object>}
   * @private
   */
  _contexts = new WeakMap();

  /**
   * Подписка на событие.
   * 
   * @param {string} eventType - Тип события
   * @param {Function} handler - Функция-обработчик
   * @param {object} [context] - Контекст (this) для вызова обработчика
   * @returns {Function} Функция для отписки от события
   */
  on(eventType, handler, context) {
    // Если указан контекст, сохраняем его
    if (context !== undefined) {
      this._contexts.set(handler, context);
    }
    
    // Стандартная обработка для конкретных событий
    if (!this._handlers.has(eventType)) {
      this._handlers.set(eventType, new Set());
    }
    
    this._handlers.get(eventType).add(handler);
    
    // Возвращаем функцию для отписки
    return () => this.off(eventType, handler);
  }

  /**
   * Подписка на событие с автоматической отпиской после первого вызова.
   * 
   * @param {string} eventType - Тип события
   * @param {Function} handler - Функция-обработчик
   * @param {object} [context] - Контекст (this) для вызова обработчика
   * @returns {Function} Функция для отписки от события
   */
  once(eventType, handler, context) {
    // Создаем обертку, которая вызовет handler и отпишется
    const wrapper = (...args) => {
      // Сначала отписываемся
      this.off(eventType, wrapper);
      
      // Затем вызываем оригинальный обработчик с правильным контекстом
      if (context !== undefined) {
        return handler.call(context, ...args);
      } else {
        return handler(...args);
      }
    };
    
    // Сохраняем ссылку на оригинальный обработчик для возможности
    // явной отписки по оригинальному обработчику
    wrapper.originalHandler = handler;
    
    // Если был указан контекст, сохраняем его и для обертки
    if (context !== undefined) {
      this._contexts.set(wrapper, context);
    } else if (this._contexts.has(handler)) {
      // Переносим контекст с оригинального обработчика, если он был
      this._contexts.set(wrapper, this._contexts.get(handler));
    }
    
    // Подписываемся с оберткой
    return this.on(eventType, wrapper);
  }

  /**
   * Отписка от события.
   * 
   * @param {string} eventType - Тип события
   * @param {Function} handler - Функция-обработчик для удаления
   * @returns {boolean} Успешность операции
   */
  off(eventType, handler) {    
    // Обработка для конкретных событий
    const handlers = this._handlers.get(eventType);
    
    if (!handlers) return false;
    
    let result = handlers.delete(handler);
    
    // Если не удалось удалить напрямую, проверяем, есть ли обертки с этим обработчиком
    if (!result && handlers.size > 0) {
      // Ищем обертку с этим оригинальным обработчиком
      for (const wrapper of handlers) {
        if (wrapper.originalHandler === handler) {
          result = handlers.delete(wrapper);
          break;
        }
      }
    }
    
    // Удаляем Set, если он пустой
    if (handlers.size === 0) {
      this._handlers.delete(eventType);
    }
    
    return result;
  }

  /**
   * Удаляет все обработчики для указанного типа события.
   * Если тип события не указан, удаляет все обработчики всех событий.
   * 
   * @param {string} [eventType] - Тип события (если не указан, удаляются все обработчики)
   * @returns {boolean} Успешность операции
   */
  removeAllListeners(eventType) {
    // Если тип события не указан, очищаем все обработчики
    if (eventType === undefined) {
      this._handlers.clear();
      return true;
    }
    
    // Удаляем обработчики конкретного события
    if (this._handlers.has(eventType)) {
      this._handlers.delete(eventType);
      return true;
    }
    
    return false;
  }

  /**
   * Генерация события.
   * 
   * @param {string} eventType - Тип события
   * @param {...any} args - Аргументы, передаваемые обработчикам
   * @returns {boolean} true, если были вызваны обработчики
   */
  emit(eventType, ...args) {
    let hasHandlers = false;
    
    // Вызываем обработчики конкретного события
    const handlers = this._handlers.get(eventType);
    
    if (handlers && handlers.size > 0) {
      hasHandlers = true;
      
      // Копируем набор обработчиков для безопасного перебора
      [...handlers].forEach(handler => {
        try {
          // Используем сохраненный контекст, если он есть
          const context = this._contexts.has(handler) 
            ? this._contexts.get(handler) 
            : undefined;
          
          if (context !== undefined) {
            handler.call(context, eventType, ...args);
          } else {
            handler(eventType, ...args);
          }
        } catch (error) {
          // Предотвращаем прерывание цепочки вызовов при ошибке
          // в одном из обработчиков
          console.error(`Ошибка в обработчике события ${eventType}:`, error);
        }
      });
    }
    
    return hasHandlers;
  }

  /**
   * Получает список всех типов событий, на которые есть подписчики
   * 
   * @returns {string[]} Массив типов событий
   */
  eventNames() {
    return [...this._handlers.keys()];
  }

  /**
   * Возвращает количество слушателей для конкретного события
   * 
   * @param {string} eventType - Тип события
   * @returns {number} Количество обработчиков
   */
  listenerCount(eventType) {
    const handlers = this._handlers.get(eventType);
    return handlers ? handlers.size : 0;
  }

  /**
   * Возвращает массив обработчиков для указанного события
   * 
   * @param {string} eventType - Тип события
   * @returns {Function[]} Массив функций-обработчиков
   */
  listeners(eventType) {
    const handlers = this._handlers.get(eventType);
    return handlers ? [...handlers] : [];
  }
} 