// Добавляем методы для работы с множествами в прототип Set, если они еще не определены
if (!Set.prototype.intersection) {
  Set.prototype.intersection = function(otherSet) {
    const result = new Set();
    for (const item of this) {
      if (otherSet.has(item)) {
        result.add(item);
      }
    }
    return result;
  };
}

if (!Set.prototype.union) {
  Set.prototype.union = function(otherSet) {
    const result = new Set(this);
    for (const item of otherSet) {
      result.add(item);
    }
    return result;
  };
}

if (!Set.prototype.difference) {
  Set.prototype.difference = function(otherSet) {
    const result = new Set(this);
    for (const item of otherSet) {
      result.delete(item);
    }
    return result;
  };
}

import { Memory } from './memory.js';
import { On } from './on.js';

export const isSymbol = it => typeof it === "symbol";
export const isBoolean = it => typeof it === "boolean";
export const isString = it => typeof it === "string";
export const isNumber = it => typeof it === "number";
export const isBigInt = it => typeof it === "bigint";
export const isFunction = it => typeof it === "function";
export const isNull = it => it === null;
export const isUndefined = it => it === undefined;
export const isPromise = it => it?.[Symbol.toStringTag] === 'Promise';
export const isPromiseLike = it => it && it.then && typeof it.then === 'function';
export const isConstructor = it => {
  try { new (it)(); return true; } catch (e) { return false; }
}
export const isSet = it => it instanceof Set;
export const isWeakSet = it => it instanceof WeakSet;
export const isMap = it => it instanceof Map;
export const isWeakMap = it => it instanceof WeakMap;
export const isArray = it => Array.isArray(it);
export const isRegExp = it => it instanceof RegExp;
export const isDate = it => it instanceof Date;
export const isObject = it => typeof it === "object" && it !== null;

/**
 * Проверяет, является ли объект экземпляром Deep
 * 
 * @param {*} it - Проверяемое значение
 * @returns {boolean} true, если значение является экземпляром Deep
 */
export const isDeep = it => it && (it instanceof Deep || (it.deep && it.deep instanceof Deep));

/**
 * Проверяет, является ли объект значением (не Deep и не undefined)
 * 
 * @param {*} it - Проверяемое значение
 * @returns {boolean} true, если значение не Deep и не undefined
 */
export const isValue = it => it !== undefined && it !== null && !isDeep(it);

// Deep - универсальная ассоциативная сущность восприятия.
// Класс Deep - ядро, требующее проксирования для полноценной работы.
export class Deep extends Function {
  static DEBUG = false;
  // Каждый Deep - исполняемый экземпляр, появляющийся и забывающийся согласно менеджеру памяти js.
  this; // Указывает не что-либо в контексте памяти js.
  // Универсальный способ получить this даже если это не Deep
  static this(it) {
    if (it instanceof Deep) return it.this;
    return it;
  }
  _prev; // Указывает опционально на другой this из которого он был получен.
  _by; // Указывает на отношение через которое он был получен, даже если сейчас это уже не актуально.
  // Создание экземпляра значит создание нового уникального символа, либо оборачивание существующей сущности.
  // Не безопасный метод, не должен использоваться напрямую, во избежания дублирования оберток.
  constructor() {
    const current = arguments.length ? arguments[0] : Symbol(Deep.DEBUG ? new Error().stack.split('\n').slice(4, 5)?.[0]?.split('(')?.[1]?.split(')')?.[0] : '');
    super();
    this.this = current;
  }
  // Создает универсальный итератор для любых сущностей.
  static iterator(it) {
    if (isSet(it) || isMap(it)) {
      const values = it.values();
      return {
        next: () => {
          const value = values.next();
          const primitive = value.value;
          return { value: typeof primitive === 'undefined' ? undefined : Deep.new(primitive), done: value.done };
        }
      };
    }
    if (isObject(it)) {
      let data = it;
      if (!isArray(data)) data = Object.values(data);
      var index = -1;
      const value = data[++index];
      return {
        next: () => ({ value: typeof value === 'undefined' ? undefined : Deep.new(value), done: !(index in data) })
      };
    } else {
      let data = it;
      return {
        next: () => {
          data = undefined;
          return { value: typeof data === 'undefined' ? undefined : Deep.new(data), done: !data };
        },
      };
    }
  }
  [Symbol.iterator]() { return Deep.iterator(this.this); };

  // Индексы пересечения ассоциаций
  static instances = new Set();
  static type = new Memory();
  static from = new Memory();
  static to = new Memory();
  static value = new Memory();

  // Хочу помнить про каждый this некоторое множество событий
  static events = new Map(); // Map<anyThis, On>
  // Корректное создание первого экземпляра Deep - возвращает проксированную версию без типа
  static new(current) {
    if (arguments.length && typeof(current) == 'undefined') return undefined;
    if (current instanceof Deep) return current;
    const deep = (new Deep(...arguments)).deep;
    Deep.instances.add(deep.this);
    deep.emit({ event: Deep.new, prev: undefined, next: deep.this });
    return deep;
  }
  
  /**
   * Проксирование класса Deep в ассоциативную ссылочную сущность Deep.
   * 
   * ВАЖНО: Этот метод ДОЛЖЕН возвращать объект, обернутый в Proxy,
   * чтобы обеспечить доступ к полям и методам Deep через проксирование.
   * Возвращение простого this приведет к ошибкам при вызове методов,
   * таких как emit, on, off и других, которые существуют только на 
   * проксированной версии объекта.
   *
   * @returns {Proxy} Проксированный экземпляр Deep с доступом ко всем методам Deep.fields
   */
  get deep() {
    return new Proxy(this, Deep.proxy);
  }
  // События ассоциативных множеств
  static changes = {
    added: Symbol('added'),
    updated: Symbol('updated'),
    removed: Symbol('removed'),
  }
  // Поле, хранящее описание ссылочной структуры Deep.
  static fields = {
    // Унификация
    this(instance, op /*get|set*/, args = []) { return instance.this; },
    deep(instance, op /*get|set*/, args = []) { return instance.deep; },
    [Symbol.iterator](instance) { return instance[Symbol.iterator]; },
    call(instance, op/*get|set*/, args = []) {
      if (typeof (instance.this) === 'function') return instance.this.call;
      else return () => instance.this;
    },
    apply(instance, op/*get|set*/, args = []) {
      if (typeof (instance.this) === 'function') return instance.this.apply;
      else return () => instance.this;
    },
    // Указывает опционально на другой this из которого он был получен.
    prev(instance, op/*get|set*/, args = []) {
      if (op == Deep.proxy.get) return Deep.new(instance._prev);
      else if (op == Deep.proxy.set) {
        instance._prev = args[0];
        return true;
      } else throw new Error('unexpected');
    },
    // Указывает на отношение через которое он был получен, даже если сейчас это уже не актуально.
    by(instance, op/*get|set*/, args = []) {
      if (op == Deep.proxy.get) return instance._by;
      else if (op == Deep.proxy.set) {
        instance._by = args[0];
        return true;
      } else throw new Error('unexpected');
    },

    // События

    /**
     * Подписка на события экземпляра Deep.
     * Регистрирует callback-функцию, которая будет вызываться при генерации события.
     * Возвращает функцию для отписки от события.
     * 
     * @example
     * // Подписка на события с сохранением функции отписки
     * const off = entity.on(event => {
     *   console.log('Событие:', event);
     * });
     * 
     * // Отписка от событий с использованием возвращаемой функции
     * off();
     * 
     * // Альтернативный способ отписки через метод off
     * const handler = event => {
     *   console.log('Событие:', event);
     * };
     * entity.on(handler);
     * entity.off(handler);
     * 
     * @param {object} instance - Текущий экземпляр Deep
     * @param {symbol} op - Операция (get)
     * @param {Array} args - Аргументы метода (не используются)
     * @returns {Function} Функция, принимающая callback для обработки событий и возвращающая функцию отписки
     */
    on(instance, op, args) {
      if (op == Deep.proxy.get) {
        return (callback) => {
          let on = Deep.events.get(instance.this);
          if (!on) Deep.events.set(instance.this, on = new On());
          return on.on(callback);
        };
      } else throw new Error('unexpected');
    },
    
    /**
     * Генерация события для экземпляра Deep.
     * 
     * @example
     * entity.emit({ event: Deep.changes.updated, prev: oldValue, next: newValue });
     * 
     * @param {object} instance - Текущий экземпляр Deep
     * @param {symbol} op - Операция (get)
     * @param {Array} args - Аргументы метода (не используются)
     * @returns {Function} Функция для генерации событий
     */
    emit(instance, op, args) {
      if (op == Deep.proxy.get) {
        return (...data) => {
          let on = Deep.events.get(instance.this);
          if (on) {
            on.emit(...data);
          }
        };
      } else throw new Error('unexpected');
    },
    
    /**
     * Отписка от событий экземпляра Deep.
     * Удаляет callback-функцию из списка обработчиков.
     * 
     * @example
     * // Отписка от событий
     * entity.off(handler);
     * 
     * @param {object} instance - Текущий экземпляр Deep
     * @param {symbol} op - Операция (get)
     * @param {Array} args - Аргументы метода (не используются)
     * @returns {Function} Функция, принимающая callback для удаления из обработчиков
     */
    off(instance, op, args) {
      if (op == Deep.proxy.get) {
        return (callback) => {
          let on = Deep.events.get(instance.this);
          if (on) {
            on.off(callback);
            if (!on?.callbacks?.length) {
              on.kill();
              Deep.events.delete(instance.this);
            }
          }
        };
      } else throw new Error('unexpected');
    },
    kill(instance, op, args) {
      if (op == Deep.proxy.get) {
        return () => {
          const deep = instance.deep;
          // Удалить отношения
          deep.emit({ event: Deep.fields.type, prev: deep.type, next: undefined, reason: Deep.fields.kill });
          Deep.type.delete(instance.this);
          deep.emit({ event: Deep.fields.from, prev: deep.from, next: undefined, reason: Deep.fields.kill });
          Deep.from.delete(instance.this);
          deep.emit({ event: Deep.fields.to, prev: deep.to, next: undefined, reason: Deep.fields.kill });
          Deep.to.delete(instance.this);
          deep.emit({ event: Deep.fields.value, prev: deep.value, next: undefined, reason: Deep.fields.kill });
          Deep.value.delete(instance.this);
          // Удалить из экземпляров
          Deep.instances.delete(instance.this);
          // Очистить подписки на ассоциацию
          let events = Deep.events.get(instance.this);
          if (events) {
            for (let [event, on] of events) {
              on.kill();
              events.delete(event);
            }
          }
        };
      } else throw new Error('unexpected');
    },

    // Ассоциативность
    // Всегда возвращает Deep
    // Оно всегда может быть воспринято как единица и как множество.

    // Отношения

    // Одиночные

    type(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.type.one(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.type;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = instance.deep;
        const prev = deep.type;
        Deep.type.set(instance.this, Deep.this(value));
        deep.emit({ event: Deep.fields.type, this: instance.this, prev: prev?.this, next: Deep.this(value) });
        return true;
      } else if (op == Deep.proxy.delete) {
        const deep = instance.deep;
        const prev = deep.type;
        Deep.type.delete(instance.this);
        deep.emit({ event: Deep.fields.type, this: instance.this, prev: prev?.this, next: undefined });
      } else throw new Error('unexpected');
    },
    from(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.from.one(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.from;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = instance.deep;
        const prev = deep.from;
        Deep.from.set(instance.this, Deep.this(value));
        deep.emit({ event: Deep.fields.from, this: instance.this, prev: prev?.this, next: Deep.this(value) });
        return true;
      } else if (op == Deep.proxy.delete) {
        const deep = instance.deep;
        const prev = deep.from;
        Deep.from.delete(instance.this);
        deep.emit({ event: Deep.fields.from, this: instance.this, prev: prev?.this, next: undefined });
      } else throw new Error('unexpected');
    },
    to(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.to.one(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.to;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = instance.deep;
        const prev = deep.to;
        Deep.to.set(instance.this, Deep.this(value));
        deep.emit({ event: Deep.fields.to, this: instance.this, prev: prev?.this, next: Deep.this(value) });
        return true;
      } else if (op == Deep.proxy.delete) {
        const deep = instance.deep;
        const prev = deep.to;
        Deep.to.delete(instance.this);
        deep.emit({ event: Deep.fields.to, this: instance.this, prev: prev?.this, next: undefined });
      } else throw new Error('unexpected');
    },
    value(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.value.one(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.value;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = instance.deep;
        const prev = deep.value;
        Deep.value.set(instance.this, Deep.this(value));
        deep.emit({ event: Deep.fields.value, this: instance.this, prev: prev?.this, next: Deep.this(value) });
        return true;
      } else if (op == Deep.proxy.delete) {
        const deep = instance.deep;
        const prev = deep.value;
        Deep.value.delete(instance.this);
        deep.emit({ event: Deep.fields.value, this: instance.this, prev: prev?.this, next: undefined });
      } else throw new Error('unexpected');
    },

    // Множественные

    typed(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.type.many(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.typed;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = Deep.new(value);
        deep.type = instance.this;
      } else if (op == Deep.proxy.delete) {
        const many = instance.deep.typed;
        for (let value of many) {
          delete value.type;
        }
      } else throw new Error('unexpected');
    },
    out(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.from.many(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.out;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = Deep.new(value);
        deep.from = instance.this;
      } else if (op == Deep.proxy.delete) {
        const many = instance.deep.out;
        for (let value of many) {
          delete value.from;
        }
      } else throw new Error('unexpected');
    },
    in(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.to.many(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.in;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = Deep.new(value);
        deep.to = instance.this;
      } else if (op == Deep.proxy.delete) {
        const many = instance.deep.in;
        for (let value of many) {
          delete value.to;
        }
      } else throw new Error('unexpected');
    },
    valued(instance, op/*get|set|delete*/, [value] = []) {
      if (op == Deep.proxy.get) {
        const deep = Deep.new(Deep.value.many(instance.this));
        if (deep) {
          deep.prev = instance.this;
          deep.by = Deep.fields.valued;
        }
        return deep;
      } else if (op == Deep.proxy.set) {
        const deep = Deep.new(value);
        deep.value = instance.this;
      } else if (op == Deep.proxy.delete) {
        const many = instance.deep.valued;
        for (let value of many) {
          delete value.value;
        }
      } else throw new Error('unexpected');
    },

    // Методы

    many(instance, op = Deep.proxy.get) {
      if (op == Deep.proxy.get) {
        const deep = instance.deep;
        const prev = deep.prev;
        const by = deep.by;
        if (!by || !prev) throw new Error('unexpected');
        const Many = Deep.new(Deep.fields.many);
        let many;
        if (isSet(deep.this)) many = deep;
        else many = new Many(new Set([deep.this]));
        many.prev = instance._prev;
        many.by = instance._by;
        const off = prev.on(e => {
          if (e.event == by) {
            many.unset(e.prev);
            many.emit({ event: Deep.changes.removed, value: e.prev, reason: e });
            if(e.next) {
              many.add(e.next);
              many.emit({ event: Deep.changes.added, value: e.next, reason: e });
            }
          }
        });
        many.on(e => e.event === Deep.fields.kill && off());
        return many;
      } else throw new Error('unexpected');
    },

    // Соединяет несколько Deep в единное множество с потоком событий
    // (...deeps) => true
    // Вызывается из Deep который включит в себя прочие
    concat(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) {
      } else throw new Error('unexpected');
    },

    // Операции над множествами

    /**
     * Создает экземпляр And для логического И условий в выражении 
     * 
     * @example
     * // Создать экземпляр And с условием
     * deep.And({ type: User })
     * 
     * // Использовать массив условий (эквивалентно And)
     * deep.And([{ type: User }, { from: someObject }])
     * 
     * @param {object} instance - Текущий экземпляр Deep
     * @param {symbol} op - Операция (get|set|apply)
     * @param {Array} args - Аргументы метода, первый аргумент - expression
     * @returns {Deep} Новый экземпляр Deep, содержащий результат операции И
     */
    And(instance, op/*get|set*/, args = []) {
      if (op == Deep.proxy.get) {
        return Deep.fields.And._apply || (Deep.fields.And._apply = function () { return Deep.fields.And(this, Deep.proxy.apply, arguments); });
      } else if (op == Deep.proxy.set) {
      } else if (op == Deep.proxy.delete) {
      } else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      
      const [expression] = args;
      const deep = Deep.new();
      
      // Если выражение - массив, каждый элемент обрабатываем как отдельное выражение And
      if (Array.isArray(expression)) {
        const subResults = [];
        for (const subExpr of expression) {
          subResults.push(deep.And(subExpr));
        }
        // Реализуем пересечение результатов
        let result;
        for (let subResult of subResults) {
          if (result) result = result.intersection(subResult.this);
          else result = subResult.this;
        }
        return Deep.new(result);
      }
      
      // Обработка обычного объекта выражения
      let and = new Set();
      for (let key in expression) {
        const inverted = Deep.invert.get(Deep.fields[key]);
        const many = inverted(Deep.new(expression[key]), Deep.proxy.get).many;
        and.add(many);
      }
      
      let result;
      for (let many of and) {
        if (result) result = result.intersection(many.this);
        else result = many.this;
      }
      
      // Сохраняем исходное выражение в поле from, а результат в поле to
      const andInstance = Deep.new(result);
      andInstance.from = expression;
      andInstance.to = result;
      
      return andInstance;
    },
    
    /**
     * Выборка элементов по заданным условиям.
     * Метод select является прослойкой для метода And.
     * 
     * @example
     * // Найти всех пользователей
     * deep.select({ type: User })
     * 
     * // Найти все экземпляры, исходящие от someObject
     * deep.select({ from: someObject })
     * 
     * // Найти все экземпляры, у которых есть отношение как to, так и type
     * deep.select({ to: someObject, type: SomeType })
     * 
     * @param {object} instance - Текущий экземпляр Deep
     * @param {symbol} op - Операция (get|set|apply)
     * @param {Array} args - Аргументы метода, первый аргумент - expression
     * @returns {Deep} Новый экземпляр Deep, содержащий результат выборки
     */
    select(instance, op/*get|set*/, args = []) {
      if (op == Deep.proxy.get) {
        return Deep.fields.select._apply || (Deep.fields.select._apply = function () { return Deep.fields.select(this, Deep.proxy.apply, arguments); });
      } else if (op == Deep.proxy.set) {
      } else if (op == Deep.proxy.delete) {
      } else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      
      // Используем метод And для создания экземпляра
      return instance.deep.And(...args);
    },
    // Обновление ассоциаций по expression 
    update(instance, op/*get*/, args = []) {
      if (op == Deep.proxy.get) {
      } else if (op == Deep.proxy.set) {
      } else if (op == Deep.proxy.delete) {
      } else throw new Error('unexpected');
    },

    // Нативные методы
    // Вызывают корректные события идентичные для ассоциативных множеств

    'has': function has(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.has._apply || (Deep.fields.has._apply = function () { return Deep.fields.has(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [_it] = args;
      const it = Deep.this(_it);
      let result;
      if (isSet(instance.this)) result = instance.this.has(it);
      else if (isMap(instance.this)) result = instance.this.has(it);
      else if (isPromise(instance.this)) result = instance.this == it;
      else if (isObject(instance.this)) result = instance.this.hasOwnProperty(it);
      else if (isArray(instance.this)) result = it >= 0 && it < instance.this.length;
      else if (isString(instance.this)) result = it >= 0 && it < instance.this.length;
      else result = instance.this == it;
      instance.deep.emit({ event: Deep.fields.has, args, result });
      return result;
    },

    'get': function get(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.get._apply || (Deep.fields.get._apply = function () { return Deep.fields.get(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [criteria] = args;
      const c = Deep.this(criteria);
      let result;
      if (isSet(instance.this)) result = instance.this.has(c) ? c : undefined;
      else if (isMap(instance.this)) result = instance.this.get(c);
      else if (isArray(instance.this)) result = instance.this[c];
      else if (isString(instance.this)) result = instance.this[c];
      else if (isObject(instance.this)) result = instance.this[c];
      else result = undefined;
      instance.deep.emit({ event: Deep.fields.get, args, result });
      return result;
    },

    'size': function size(instance, op = Deep.proxy.get, args = []) {
      if (op !== Deep.proxy.get) throw new Error('unexpected');
      let result;
      if (isSet(instance.this) || isMap(instance.this)) result = instance.this.size;
      else if (isArray(instance.this) || isString(instance.this)) result = instance.this.length;
      else if (isObject(instance.this)) result = Object.keys(instance.this).length;
      else if (isBoolean(instance.this) || isUndefined(instance.this) || isNull(instance.this)) result = instance.this ? 1 : 0;
      else if (isNumber(instance.this) || isBigInt(instance.this)) result = String(instance.this).length;
      else result = 1;
      instance.deep.emit({ event: Deep.fields.size, args, result });
      return result;
    },

    'map': function map(instance, op = Deep.proxy.get, args = [(v, k) => v]) {
      if (op == Deep.proxy.get) return Deep.fields.map._apply || (Deep.fields.map._apply = function () { return Deep.fields.map(this, Deep.proxy.apply, arguments); });
      else if (op == Deep.proxy.call) return instance.this.map(callback);
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [callback = (v, k) => v] = args;
      let result;
      if (isSet(instance.this)) result = Array.from(instance.this).map((v) => callback(v, v));
      else if (isMap(instance.this)) {
        result = Array.from(instance.this).map(([k, v]) => callback(v, k));
      }
      else if (isArray(instance.this)) result = instance.this.map(callback);
      else if (isObject(instance.this) && !isPromise(instance.this)) {
        result = Object.keys(instance.this).map((k) => callback(instance.this[k], k));
      }
      else if (isString(instance.this)) {
        result = instance.this.split('').map(callback);
      }
      else result = [callback(instance.this, instance.this)];
      instance.deep.emit({ event: Deep.fields.map, args, result });
      return result;
    },

    'add': function add(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.add._apply || (Deep.fields.add._apply = function () { return Deep.fields.add(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [value] = args;
      const v = Deep.this(value);
      let result;
      if (isUndefined(instance.this) || isSymbol(instance.this) || isBoolean(instance.this) || isNull(instance.this) || isNumber(instance.this) || isBigInt(instance.this) || isString(instance.this) || isFunction(instance.this) || isPromise(instance.this)) {
        result = false;
      } else if (isSet(instance.this) || isWeakSet(instance.this)) {
        const exists = instance.this.has(v);
        if (!exists) instance.this.add(v);
        result = !exists;
      } else if (isMap(instance.this) || isWeakMap(instance.this)) {
        const exists = instance.this.has(v);
        if (!exists) instance.this.set(v, v);
        result = !exists;
      } else if (isArray(instance.this)) {
        instance.this.push(v);
        result = true;
      } else if (isObject(instance.this)) {
        instance.this[v] = v;
        result = true;
      } else {
        result = false;
      }
      instance.deep.emit({ event: Deep.fields.add, args, result });
      return result;
    },

    'set': function set(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.set._apply || (Deep.fields.set._apply = function () { return Deep.fields.set(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [key, value] = args;
      const k = Deep.this(key);
      const v = Deep.this(value);
      let result;
      if (isSet(instance.this) || isWeakSet(instance.this)) {
        if (k !== v) throw new Error(`Can't set into Set when key != value`);
        instance.this.add(v);
        result = true;
      } else if (isMap(instance.this) || isWeakMap(instance.this)) {
        instance.this.set(k, v);
        result = true;
      } else if (isArray(instance.this) && !isNaN(k)) {
        instance.this[k] = v;
        result = true;
      } else if (isObject(instance.this) && !isPromise(instance.this) && !isNull(instance.this)) {
        instance.this[k] = v;
        result = true;
      } else {
        result = false;
      }
      instance.deep.emit({ event: Deep.fields.set, args, result });
      return result;
    },

    'unset': function unset(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.unset._apply || (Deep.fields.unset._apply = function () { return Deep.fields.unset(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [key] = args;
      const k = Deep.this(key);
      let result;
      if (isSet(instance.this) || isWeakSet(instance.this)) result = instance.this.delete(k);
      else if (isMap(instance.this) || isWeakMap(instance.this)) result = instance.this.delete(k);
      else if (isArray(instance.this) && !isNaN(k)) {
        if (k >= 0 && k < instance.this.length) {
          instance.this.splice(k, 1);
          result = true;
        } else {
          result = false;
        }
      }
      else if (isObject(instance.this) && !isPromise(instance.this) && !isNull(instance.this)) {
        result = delete instance.this[k];
      } else result = false;
      instance.deep.emit({ event: Deep.fields.unset, args, result });
      return result;
    },

    'keys': function keys(instance, op = Deep.proxy.get, args) {
      if (op == Deep.proxy.get) return Deep.fields.keys._apply || (Deep.fields.keys._apply = function () { return Deep.fields.keys(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      let result;
      if (isString(instance.this)) result = Array.from(instance.this).map((_, i) => i);
      else if (isSet(instance.this)) result = Array.from(instance.this.keys());
      else if (isMap(instance.this)) result = Array.from(instance.this.keys());
      else if (isArray(instance.this)) result = instance.this.map((_, i) => i);
      else if (isObject(instance.this)) result = Object.keys(instance.this);
      else result = [];
      instance.deep.emit({ event: Deep.fields.keys, args, result });
      return result;
    },

    'values': function values(instance, op = Deep.proxy.get, args) {
      if (op == Deep.proxy.get) return Deep.fields.values._apply || (Deep.fields.values._apply = function () { return Deep.fields.values(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      let result;
      if (isString(instance.this)) result = instance.this.split('');
      else if (isNumber(instance.this)) result = Array.from(instance.this.toString().split('')).map(v => +v);
      else if (isSet(instance.this)) result = Array.from(instance.this.values());
      else if (isMap(instance.this)) result = Array.from(instance.this.values());
      else if (isArray(instance.this)) result = [...instance.this];
      else if (isPromise(instance.this) || isNull(instance.this)) result = [instance.this];
      else if (isObject(instance.this)) result = Object.values(instance.this);
      else result = [instance.this];
      instance.deep.emit({ event: Deep.fields.values, args, result });
      return result;
    },

    'find': function find(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.find._apply || (Deep.fields.find._apply = function () { return Deep.fields.find(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [callback] = args;
      let result;
      if (isSet(instance.this)) {
        for (let value of instance.this) {
          if (callback(value, value)) result = value;
        }
      } else if (isMap(instance.this)) {
        for (let [key, value] of instance.this) {
          if (callback(value, key)) result = value;
        }
      } else if (isArray(instance.this)) {
        result = instance.this.find(callback);
      } else if (isPromise(instance.this)) {
        return instance.this;
      } else if (isObject(instance.this)) {
        for (let [key, value] of Object.entries(instance.this)) {
          if (callback(value, key)) result = value;
        }
      } else {
        result = callback(instance.this, instance.this) ? instance.this : undefined;
      }
      instance.deep.emit({ event: Deep.fields.find, args, result });
      return result;
    },

    'filter': function filter(instance, op = Deep.proxy.get, args = [(value, key) => true]) {
      if (op == Deep.proxy.get) return Deep.fields.filter._apply || (Deep.fields.filter._apply = function () { return Deep.fields.filter(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [callback = ((value, key) => true)] = args;
      let result = [];
      if (isWeakSet(instance.this)) result = [];
      else if (isSet(instance.this)) {
        for (let value of instance.this) {
          if (callback(value, value)) result.push(value);
        }
      } else if (isWeakMap(instance.this)) result = [];
      else if (isMap(instance.this)) {
        for (let [key, value] of instance.this) {
          if (callback(value, key)) result.push([key, value]);
        }
      }
      else if (isArray(instance.this)) result = instance.this.filter(callback);
      else if (isObject(instance.this) && !isPromise(instance.this) && !isNull(instance.this)) {
        for (let [key, value] of Object.entries(instance.this)) {
          if (callback(value, key)) result.push(value);
        }
      } else if (isString(instance.this)) result = instance.this.split('').filter(callback);
      else result = callback(instance.this, instance.this) ? [instance.this] : [];
      instance.deep.emit({ event: Deep.fields.filter, args, result });
      return result;
    },

    'each': function each(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.each._apply || (Deep.fields.each._apply = function () { return Deep.fields.each(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [callback] = args;
      if (isSet(instance.this)) {
        instance.this.forEach((value) => callback(value, value));
      } else if (isMap(instance.this)) {
        instance.this.forEach((value, key) => callback(value, key));
      } else if (isArray(instance.this)) {
        instance.this.forEach(callback);
      } else if (isObject(instance.this) && !isPromise(instance.this) && !isNull(instance.this)) {
        Object.entries(instance.this).forEach(([key, value]) => callback(value, key));
      } else {
        callback(instance.this, instance.this);
      }
      instance.deep.emit({ event: Deep.fields.each, args });
    }, 

    'sort': function sort(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.sort._apply || (Deep.fields.sort._apply = function () { return Deep.fields.sort(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [callback] = args;
      const result = Deep.fields.map(instance, op).sort(callback);
      instance.deep.emit({ event: Deep.fields.sort, args, result });
      return result;
    },

    'reduce': function reduce(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.reduce._apply || (Deep.fields.reduce._apply = function () { return Deep.fields.reduce(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [callback, initialValue] = args;
      const result = Deep.fields.map(instance, op).reduce((acc, cur) => callback(acc, cur), initialValue);
      instance.deep.emit({ event: Deep.fields.reduce, args, result });
      return result;
    },

    'first': function first(instance, op = Deep.proxy.get, args) {
      if (op != Deep.proxy.get) throw new Error('unexpected');
      let result;
      if (isSet(instance.this)) result = instance.this.values().next().value;
      else if (isMap(instance.this)) result = instance.this.values().next().value;
      else if (isWeakSet(instance.this)) result = undefined;
      else if (isWeakMap(instance.this)) result = undefined;
      else if (isFunction(instance.this)) result = instance.this;
      else if (isArray(instance.this) || isString(instance.this)) result = instance.this[0];
      else if (isPromise(instance.this)) result = instance.this;
      else if (isObject(instance.this) && !isPromise(instance.this) && !isNull(instance.this)) result = Object.values(instance.this)[0];
      else result = instance.this;
      instance.deep.emit({ event: Deep.fields.first, args, result });
      return Deep.new(result);
    },

    'last': function last(instance, op = Deep.proxy.get, args) {
      if (op != Deep.proxy.get) throw new Error('unexpected');
      let result;
      if (isSet(instance.this)) {
        let last;
        for (let value of instance.this) last = value;
        result = last;
      } else if (isMap(instance.this)) {
        let last;
        for (let value of instance.this.values()) last = value;
        result = last;
      } else if (isWeakSet(instance.this)) result = undefined;
      else if (isWeakMap(instance.this)) result = undefined;
      else if (isFunction(instance.this)) result = instance.this;
      else if (isArray(instance.this) || isString(instance.this)) result = instance.this[instance.this.length - 1];
      else if (isPromise(instance.this)) result = instance.this;
      else if (isObject(instance.this) && !isPromise(instance.this) && !isNull(instance.this)) {
        const values = Object.values(instance.this);
        result = values[values.length - 1];
      } else result = instance.this;
      instance.deep.emit({ event: Deep.fields.last, args, result });
      return Deep.new(result);
    },

    'join': function join(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.join._apply || (Deep.fields.join._apply = function () { return Deep.fields.join(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [separator = ','] = args;
      const result = Deep.fields.map(instance, op, [v => isPromise(v) ? 'await' : String(v)]).join(separator);
      instance.deep.emit({ event: Deep.fields.join, args, result });
      return result;
    },

    'toString': function toString(instance, op = Deep.proxy.get, args) {
      if (op == Deep.proxy.get) return Deep.fields.toString._apply || (Deep.fields.toString._apply = function () { return Deep.fields.toString(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const result = String(instance.this);
      instance.deep.emit({ event: Deep.fields.toString, args, result });
      return result;
    },

    'valueOf': function valueOf(instance, op = Deep.proxy.get, args = [new Set()]) {
      if (op == Deep.proxy.get) return Deep.fields.valueOf._apply || (Deep.fields.valueOf._apply = function () { return Deep.fields.valueOf(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      const [visited = new Set()] = args;
      let result;
      if (visited.has(instance.this)) result = instance.this; // Protection against cyclic dependencies
      else {
        visited.add(instance.this);
        const value = Deep.fields.value(instance, op);
        result = value === undefined ? instance.this : Deep.fields.valueOf(instance, op, [visited]);
      }
      instance.deep.emit({ event: Deep.fields.valueOf, args, result });
      return result;
    },

    /**
     * Проверяет, является ли объект экземпляром And
     * 
     * @param {*} value - Проверяемое значение
     * @returns {boolean} true, если значение является экземпляром And
     */
    'typeof': function typeof_(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.typeof._apply || (Deep.fields.typeof._apply = function () { return Deep.fields.typeof(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      
      const [check] = args;
      if (!check) return false;
      
      // Получаем this проверяемого типа
      const checkThis = Deep.this(check);
      
      // Безопасное получение типа текущего объекта
      let typeThis;
      try {
        typeThis = Deep.type.one(instance.this);
      } catch (e) {
        return false;
      }
      
      // Проверка прямого соответствия
      if (typeThis === checkThis) return true;
      
      // Проверка в иерархии типов
      if (typeThis && typeThis !== instance.this) {
        try {
          return Deep.fields.typeof(Deep.new(typeThis), Deep.proxy.apply, [checkThis]);
        } catch (e) {
          return false;
        }
      }
      
      return false;
    },
    
    /**
     * Получает массив всех типов в иерархии типов.
     * 
     * @example
     * // Получить все типы в иерархии
     * const types = deep.typeofs();
     * 
     * @param {object} instance - Текущий экземпляр Deep
     * @param {symbol} op - Операция (get|apply)
     * @param {Array} args - Аргументы метода, первый аргумент - опциональный массив для добавления типов
     * @returns {Array} Массив типов
     */
    'typeofs': function typeofs(instance, op = Deep.proxy.get, args = []) {
      if (op == Deep.proxy.get) return Deep.fields.typeofs._apply || (Deep.fields.typeofs._apply = function () { return Deep.fields.typeofs(this, Deep.proxy.apply, arguments); });
      else if (op !== Deep.proxy.apply) throw new Error('unexpected');
      
      const [array = []] = args;
      array.length = 0; // Очищаем существующий массив
      
      try {
        // Получаем тип текущего объекта
        let currentType = Deep.type.one(instance.this);
        
        // Проверяем, что это валидный тип - не относится к асинхронным хукам Node.js
        if (currentType && !String(currentType).includes('node:async_hooks')) {
          // Создаем объект типа и добавляем в массив
          array.push(Deep.new(currentType));
          
          // Получаем предка текущего типа
          let parentType = Deep.type.one(currentType);
          // Добавляем всех предков в цепочке
          while (parentType && !String(parentType).includes('node:async_hooks')) {
            array.push(Deep.new(parentType));
            parentType = Deep.type.one(parentType);
          }
        }
      } catch (e) {
        // Игнорируем ошибки
      }
      
      return array;
    },
  };
  // Правила проксирования.
  static proxy = (() => ({
    apply(instance, thisArg, args) {
      if (typeof (instance.this) === 'function') return instance.this.apply(this, args);
      else return () => instance.this;
    },
    construct(instance, args = []) {
      const deep = Deep.new(...args);
      deep.type = instance.this;
      return deep;
    },
    get(instance, key, thisArg) {
      if (Deep.fields[key]) return Deep.fields[key](instance, Deep.proxy.get);
      else return undefined;
    },
    set(instance, key, value, thisArg) {
      if (Deep.fields[key]) return Deep.fields[key](instance, Deep.proxy.set, [value]);
      else return false;
    },
    deleteProperty(instance, key) {
      if (Deep.fields[key]) return Deep.fields[key](instance, Deep.proxy.delete);
      else return false;
    },
    has(instance, key) {
      return Deep.fields.hasOwnProperty(key);
    },
    ownKeys(instance) {
      return [...new Set([...Object.keys(Deep.fields), ...Reflect.ownKeys(instance)])];
    }
  }))();

  static invert = new Map([
    [Deep.fields.type, Deep.fields.typed],
    [Deep.fields.typed, Deep.fields.type],
    [Deep.fields.from, Deep.fields.out],
    [Deep.fields.out, Deep.fields.from],
    [Deep.fields.to, Deep.fields.in],
    [Deep.fields.in, Deep.fields.to],
    [Deep.fields.value, Deep.fields.valued],
    [Deep.fields.valued, Deep.fields.value],
  ]);

  /**
   * Проверяет, является ли объект экземпляром Deep
   * 
   * @param {*} it - Проверяемое значение
   * @returns {boolean} true, если значение является экземпляром Deep
   */
  static isDeep(it) { return isDeep(it); }
  
  /**
   * Проверяет, является ли объект значением (не Deep и не undefined)
   * 
   * @param {*} it - Проверяемое значение
   * @returns {boolean} true, если значение не Deep и не undefined
   */
  static isValue(it) { return isValue(it); }
}
