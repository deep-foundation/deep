/**
 * Association - класс для создания универсальной ассоциативной системы
 * с улучшенным механизмом проксирования.
 */
export class Association {
  /**
   * Хранилище функций и значений для проксирования
   * @type {Map<string|symbol, any>}
   * @private
   */
  _proxy = new Map();

  /**
   * Создает экземпляр Association с опциональными начальными методами.
   * 
   * @param {Object} [methods] - Начальные методы для проксирования
   */
  constructor(methods = {}) {
    // Добавляем начальные методы в прокси
    for (const [key, value] of Object.entries(methods)) {
      this._proxy.set(key, value);
    }

    // Создаем прокси для данного экземпляра
    return new Proxy(this, {
      // При получении свойства
      get: (target, key, receiver) => {
        if (key === '_proxy') return target._proxy;
        
        const value = target._proxy.get(key);
        
        // Если значение есть, но это не функция - возвращаем его как есть
        if (value !== undefined && typeof value !== 'function') {
          return value;
        }
        
        // Если это функция - вызываем её в контексте target
        if (typeof value === 'function') {
          return function(...args) {
            return value.apply(target, args);
          };
        }
        
        // Если значения нет - возвращаем undefined
        return undefined;
      },
      
      // При установке свойства
      set: (target, key, value, receiver) => {
        // Если ключ не существует в прокси или он не является защищенным - устанавливаем его
        if (key !== '_proxy') {
          target._proxy.set(key, value);
        }
        return true;
      },
      
      // Поддержка оператора in
      has: (target, key) => {
        return key === '_proxy' || target._proxy.has(key);
      },
      
      // Поддержка Object.keys() и других итераций по ключам
      ownKeys: (target) => {
        return Array.from(target._proxy.keys());
      },
      
      // Поддержка getOwnPropertyDescriptor
      getOwnPropertyDescriptor: (target, key) => {
        if (target._proxy.has(key)) {
          return {
            enumerable: true,
            configurable: true,
            value: target._proxy.get(key)
          };
        }
        return undefined;
      }
    });
  }
}
