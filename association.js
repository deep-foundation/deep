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
   * Метод для автоматического преобразования в примитив
   * Позволяет использовать объект Association в арифметических операциях и сравнениях
   * @param {string} hint - Подсказка о типе преобразования ('number', 'string', 'default')
   * @returns {any} - Примитивное значение
   */
  [Symbol.toPrimitive](hint) {
    // Для числовых операций и операций по умолчанию - возвращаем значение
    if (hint === 'number' || hint === 'default') {
      return this.valueOf();
    }
    // Для строковых операций - возвращаем строковое представление
    return this.toString();
  }

  /**
   * Метод для преобразования в примитивное значение
   * Вызывается автоматически при использовании объекта в числовых операциях
   * @returns {any} - Примитивное значение this.this
   */
  valueOf() {
    const value = this.this;
    if (value === null || value === undefined) return 0;

    // Если value имеет собственный valueOf, используем его
    if (typeof value === 'object' &&
        value !== null &&
        typeof value.valueOf === 'function' &&
        value.valueOf !== Object.prototype.valueOf) {
      return value.valueOf();
    }

    return value;
  }

  /**
   * Метод для преобразования в строку
   * Вызывается автоматически при использовании объекта в строковых операциях
   * @returns {string} - Строковое представление this.this
   */
  toString() {
    const value = this.this;
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    // Если value имеет собственный toString, используем его
    if (typeof value === 'object' &&
        value !== null &&
        typeof value.toString === 'function' &&
        value.toString !== Object.prototype.toString) {
      return value.toString();
    }

    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try {
        // Для объектов пытаемся использовать JSON.stringify
        return JSON.stringify(value);
      } catch {
        // В случае ошибки (циклические ссылки) используем стандартное преобразование
        return String(value);
      }
    }

    return String(value);
  }

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

        // Поддержка преобразования в примитивы
        if (key === Symbol.toPrimitive) return target[Symbol.toPrimitive].bind(target);
        if (key === 'valueOf') return target.valueOf.bind(target);
        if (key === 'toString') return target.toString.bind(target);

        // Для интеграции с отладчиками и утилитами печати
        if (key === 'inspect' || key === Symbol.for('nodejs.util.inspect.custom')) {
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
          return value.call(receiver, receiver, 'get');
        }

        // Если значения нет в прокси, пробуем получить его из обернутого объекта
        const thisValue = target.this;
        if (thisValue !== null && thisValue !== undefined &&
            (typeof thisValue === 'object' || typeof thisValue === 'function')) {
          // Если это свойство или метод обернутого объекта
          if (key in thisValue || (typeof thisValue === 'object' && thisValue[key] !== undefined)) {
            const propValue = thisValue[key];
            // Если это метод, сохраняем привязку к this
            if (typeof propValue === 'function') {
              return function(...args) {
                return propValue.apply(thisValue, args);
              };
            }
            return propValue;
          }
        }

        // Если значения нет - возвращаем undefined
        return undefined;
      },

      // При установке свойства
      set: (target, key, value, receiver) => {
        if (key === 'this') {
          const prev = target.this;
          target.this = value;
          return true;
        }
        // Если ключ не является защищенным - устанавливаем его
        else if (key !== '_proxy' && key !== 'temp') {
          // Если это существующая функция в _proxy и она поддерживает 'set' операцию
          const existingValue = target._proxy.get(key) || Association._proxy.get(key);
          if (typeof existingValue === 'function') {
            return existingValue.call(receiver, receiver, 'set', [value]);
          } else {
            target._proxy.set(key, value);
            return true;
          }
        }
        return false;
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

    // Создаём символ с адресом файла и позицией в нём
    const stack = new Error().stack;
    const stackLine = stack.split('\n')[4] || '';

    // Извлекаем только адрес файла и позицию из стека
    const locationMatch = stackLine.match(/\((.+):(\d+):(\d+)\)/) ||
                          stackLine.match(/at\s+(.+):(\d+):(\d+)/);

    // Формируем строку с адресом файла и позицией
    const location = locationMatch ? locationMatch[1] + ':' + locationMatch[2] + ':' + locationMatch[3] : 'unknown';

    // Создаём символ только с адресом файла
    this.temp.symbol = Symbol(location);

    // Устанавливаем оборачиваемый объект или символ из temp
    this.this = arguments.length > 0 ? self : this.temp.symbol;

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

/**
 * Оборачивает значение в Association, если оно не является Association
 * Если значение уже является Association, возвращает его как есть
 * @param {any} value - Значение для оборачивания
 * @returns {Association} - Значение, обернутое в Association
 */
function wrap(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.wrap = ass.temp.wrap || ((value) =>
      Association._proxy.get('wrap').call(ass, ass, 'apply', [value])
    );
  } else if (op === 'apply') {
    // Получаем значение из аргументов
    const value = args[0];

    // Проверяем, является ли значение экземпляром Association
    if (value instanceof Association) {
      // Если да, возвращаем его как есть
      return value;
    } else {
      // Иначе создаем новый экземпляр Association с этим значением
      return new Association(value);
    }
  }
}

/**
 * Разворачивает Association и возвращает внутреннее значение
 * Если значение не является Association, возвращает его как есть
 * @param {any} value - Значение для разворачивания
 * @returns {any} - Развернутое значение
 */
function unwrap(ass, op, args) {
  if (op !== 'get' && op !== 'apply') return;

  if (op === 'get') {
    // Возвращаем кешированную функцию из temp или создаем новую
    return ass.temp.unwrap = ass.temp.unwrap || ((value) =>
      Association._proxy.get('unwrap').call(ass, ass, 'apply', [value])
    );
  } else if (op === 'apply') {
    // Получаем значение из аргументов
    const value = args[0];

    // Проверяем, является ли значение экземпляром Association
    if (value instanceof Association) {
      // Если да, возвращаем внутреннее значение this
      return value.this;
    } else {
      // Иначе возвращаем значение как есть
      return value;
    }
  }
}

// Регистрируем методы в статическом хранилище
Association._proxy.set('wrap', wrap);
Association._proxy.set('unwrap', unwrap);

// Добавляем ссылку на себя в статический _proxy
Association._proxy.set('_proxy', Association._proxy);
