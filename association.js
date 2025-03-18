/**
 * Association - класс для создания универсальной ассоциативной системы
 * с улучшенным механизмом проксирования.
 */

export class Association extends Function {
  /**
   * Временное хранилище для кеширования результатов вычислений внутри функций
   * @type {Object}
   */
  temp = {};

  /**
   * Хранилище функций и значений для проксирования
   * @type {Map<string|symbol, any>}
   * @private
   */
  _proxy = new Map();

  /**
   * Статическое хранилище функций и значений для проксирования
   * Общие методы для всех экземпляров Association
   * @type {Map<string|symbol, any>}
   */
  static _proxy = new Map();

  /**
   * Оборачиваемый объект/значение
   * @type {any}
   */
  this;

  /**
   * Получение проксированной версии экземпляра Association
   * @returns {Proxy<Association>} Проксированная версия экземпляра
   */
  get proxy() {
    // Всегда создаем новый экземпляр прокси без кеширования
    return new Proxy(this, {
      // При вызове как функция
      apply(ass, thisArg, args) {
        if (typeof (ass.this) === 'function') return ass.this.apply(ass, args);
        else return ass.this;
      },
      // При создании экземпляра
      construct(ass, args = []) {
        const deep = new Association(...args);
        // deep.type = ass.this;
        return deep;
      },
      // При получении свойства
      get: (target, key, receiver) => {
        // Базовые свойства, необходимые для работы
        if (key === '_proxy') return target._proxy;
        if (key === 'temp') return target.temp;
        if (key === 'this') return target.this;
        if (key === 'proxy') return receiver; // Возвращаем текущий прокси
        if (key === Symbol.toStringTag) return 'Association';

        // Для интеграции с отладчиками и утилитами печати
        if (key === 'inspect' || key === 'toString' || key === Symbol.for('nodejs.util.inspect.custom')) {
          return function() {
            const entries = Array.from(target._proxy.entries());
            const props = Object.fromEntries(entries);
            return { Association: props };
          };
        }

        // Сначала ищем в экземпляре
        let value = target._proxy.get(key);

        // Если не нашли, ищем в статических свойствах класса
        if (value === undefined) {
          value = Association._proxy.get(key);
        }

        // Если значение есть, но это не функция и не дескриптор - возвращаем его как есть
        if (value !== undefined && typeof value !== 'function' &&
            !(value && typeof value === 'object' && ('get' in value || 'set' in value))) {
          return value;
        }

        // Обработка функций
        if (typeof value === 'function') {
          // Новый формат (ass, op, args)
          // Если еще нет кеша в temp - создаем функцию-обертку
          return value(receiver, 'get');
        }

        // Если значения нет - возвращаем undefined
        return undefined;
      },

      // При установке свойства
      set: (target, key, value, receiver) => {
        // Если ключ не является защищенным - устанавливаем его
        if (key !== '_proxy' && key !== 'temp' && key !== 'this') {
          // Если это функция и существует кеш в temp, очищаем его
          if (typeof value === 'function' && key in target.temp) {
            delete target.temp[key];
          }

          // Если это существующая функция в _proxy и она поддерживает 'set' операцию
          const existingValue = target._proxy.get(key);
          if (typeof existingValue === 'function') {
            // Определяем, использует ли функция формат (ass, op, args)
            const isNewFormat = existingValue.toString().includes('op') &&
                              (existingValue.toString().includes('apply') ||
                                existingValue.toString().includes('get'));

            if (isNewFormat) {
              try {
                existingValue(receiver, 'set', value);
                return true;
              } catch (e) {
                // Если операция 'set' не поддерживается, просто продолжаем
                if (!e.message.includes('unexpected op=set')) {
                  throw e;
                }
              }
            }
          }

          target._proxy.set(key, value);
        }
        return true;
      },

      // Поддержка оператора in
      has: (target, key) => {
        return key === '_proxy' || key === 'temp' || key === 'this' ||
              target._proxy.has(key) || Association._proxy.has(key);
      },

      // Поддержка Object.keys() и других итераций по ключам
      ownKeys: (target) => {
        // Получаем базовые свойства Function.prototype, которые необходимо включить
        const ownKeysOfTarget = Reflect.ownKeys(target);

        // Объединяем все ключи
        const keys = new Set([
          ...ownKeysOfTarget,
          ...target._proxy.keys(),
          ...Association._proxy.keys()
        ]);

        // Исключаем внутренние ключи из перечисления, если они конфигурируемые
        keys.delete('_proxy');
        keys.delete('temp');
        keys.delete('this');

        return [...keys];
      },

      // Поддержка getOwnPropertyDescriptor
      getOwnPropertyDescriptor: (target, key) => {
        // Проверяем сначала нативные дескрипторы самого объекта Function
        const targetDesc = Reflect.getOwnPropertyDescriptor(target, key);
        if (targetDesc) {
          return targetDesc;
        }

        // Далее проверяем свои хранилища
        if (target._proxy.has(key) || Association._proxy.has(key)) {
          return {
            enumerable: true,
            configurable: true,
            value: target._proxy.has(key) ? target._proxy.get(key) : Association._proxy.get(key)
          };
        }
        return undefined;
      }
    });
  }

  /**
   * Создает экземпляр Association с опциональным исходным объектом и методами.
   *
   * @param {any} [self] - Объект для оборачивания (становится this.this)
   * @param {Object} [methods] - Начальные методы для проксирования
   */
  constructor(self, methods = {}) {
    super();

    // Устанавливаем оборачиваемый объект
    this.this = self;

    // Добавляем начальные методы в прокси
    for (const [key, value] of Object.entries(methods)) {
      this._proxy.set(key, value);
    }

    // Улучшение отображения в отладчике - добавляем [Symbol.toStringTag]
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Association',
      writable: false,
      enumerable: false,
      configurable: true
    });

    // Используем геттер proxy для получения проксированного экземпляра
    return this.proxy;
  }
}

// Добавляем ссылку на себя в статический _proxy
Association._proxy.set('_proxy', Association._proxy);
