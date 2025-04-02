/**
 * Модуль для работы с типами ассоциаций.
 * Позволяет устанавливать и получать тип ассоциации.
 */
import { Association } from './association.js';
import { Memory } from './memory.js';
import { Events } from './events.js';

// Создаем экземпляр Memory для хранения типов ассоциаций
export const types = new Memory({
  name: 'Association.types',
  childSetFactory: () => new Association(new Set())
});

// Создаем экземпляр Memory для хранения исходящих связей (from/out)
export const froms = new Memory({
  name: 'Association.froms',
  childSetFactory: () => new Association(new Set())
});

// Создаем экземпляр Memory для хранения входящих связей (to/in)
export const tos = new Memory({
  name: 'Association.tos',
  childSetFactory: () => new Association(new Set())
});

/**
 * Функция для получения или установки типа ассоциации.
 * @param {string} op - Операция ('get' или 'set')
 * @param {...*} args - Аргументы операции
 * @returns {Association|void} - Ассоциация типа при 'get', ничего при 'set'
 */
export const type = function(ass, op, args) {
  // Операция 'get': возвращаем текущий тип ассоциации
  if (op === 'get') {
    const currentType = types.one(ass.this);
    // Возвращаем новую ассоциацию, связанную с типом
    if (currentType === undefined) return;
    return new Association(currentType);
  }

  // Операция 'set': устанавливаем тип ассоциации
  else if (op === 'set') {
    let newType = args[0];
    if (newType instanceof Association) newType = newType.this;

    // Получаем текущий тип для события
    const prevType = types.one(ass.this);

    // Если тип не изменился, ничего не делаем
    if (prevType === newType) return;

    // Если был установлен предыдущий тип, удаляем его
    if (prevType) {
      types.delete(ass.this, prevType);
    }

    // Если указан новый тип, устанавливаем его
    if (newType) {
      // Если новый тип является экземпляром Association, используем его this
      const typeToSet = newType instanceof Association ? newType.this : newType;
      types.set(ass.this, typeToSet);
    }

    // Событие 'type' с указанием предыдущего и нового типа
    ass.emit('type', prevType, newType instanceof Association ? newType.this : newType);

    // Событие 'change' с деталями изменения
    ass.emit('change', {
      prev: prevType,
      next: newType instanceof Association ? newType.this : newType
    }, {
      method: 'type',
      arguments: [newType]
    });

    return true;
  }

  else {
    throw new Error(`unexpected op=${op}`);
  }
};

/**
 * Функция для получения множества ассоциаций определенного типа.
 * @param {string} op - Операция ('get')
 * @returns {Association} - Ассоциация содержащая Set с ассоциациями указанного типа
 */
export const typed = function(ass, op) {
  // Операция 'get': возвращаем множество ассоциаций для типа
  if (op === 'get') {
    // Получаем множество из типов, создаем его, если оно не существует
    const result = types.many(ass.this);

    // Добавляем информацию для TRACK
    result.origins = [ass];
    result.temp.method = 'typed';

    // Создаем локальный track для отслеживания изменений
    result._proxy.set('track', (resultAss, op) => {
      if (op === 'get') {
        // Если track уже создан, возвращаем его
        if (resultAss.temp.track) {
          return resultAss.temp.track;
        }

        // Создаем track
        const track = Association._proxy.get('track').call(resultAss, resultAss, 'get');

        if (track) {
          // Функция для обновления результата при изменении типа
          const updateHandler = (origin, event, meta) => {
            // Перезапрашиваем актуальное состояние typed при изменении типа
            const newTyped = types.many(ass.this);
            resultAss.this = newTyped.this;

            // Генерируем событие изменения
            if (resultAss.emit) {
              resultAss.emit('change', {
                reason: 'type-update',
                prev: event.prev,
                next: event.next,
                detail: event.detail
              }, meta);
            }
          };

          // Подписываемся на изменение типа
          const offChanges = [];

          if (ass.on && ass.emit) {
            const offChange = ass.on('change', (event, meta) => {
              updateHandler(ass, event, meta);
            });
            offChanges.push(offChange);
          }

          // Сохраняем функции отписки
          track.temp.offChanges = offChanges;

          return track;
        }
      }

      return null;
    });

    return result;
  }
  else {
    throw new Error(`unexpected op=${op}`);
  }
};

/**
 * Функция для получения или установки исходящей связи ассоциации.
 * @param {string} op - Операция ('get' или 'set')
 * @param {...*} args - Аргументы операции
 * @returns {Association|void} - Ассоциация исходящей связи при 'get', ничего при 'set'
 */
export const from = function(ass, op, args) {
  // Операция 'get': возвращаем текущую исходящую связь ассоциации
  if (op === 'get') {
    const currentFrom = froms.one(ass.this);
    // Возвращаем новую ассоциацию, связанную с исходящей связью
    if (currentFrom === undefined) return;
    return new Association(currentFrom);
  }

  // Операция 'set': устанавливаем исходящую связь ассоциации
  else if (op === 'set') {
    let newFrom = args[0];
    if (newFrom instanceof Association) newFrom = newFrom.this;

    // Получаем текущую исходящую связь для события
    const prevFrom = froms.one(ass.this);

    // Если исходящая связь не изменилась, ничего не делаем
    if (prevFrom === newFrom) return;

    // Если была установлена предыдущая исходящая связь, удаляем её
    if (prevFrom) {
      froms.delete(ass.this, prevFrom);
    }

    // Если указана новая исходящая связь, устанавливаем её
    if (newFrom) {
      // Если новая исходящая связь является экземпляром Association, используем его this
      const fromToSet = newFrom instanceof Association ? newFrom.this : newFrom;
      froms.set(ass.this, fromToSet);
    }

    // Событие 'from' с указанием предыдущей и новой исходящей связи
    ass.emit('from', prevFrom, newFrom instanceof Association ? newFrom.this : newFrom);

    // Событие 'change' с деталями изменения
    ass.emit('change', {
      prev: prevFrom,
      next: newFrom instanceof Association ? newFrom.this : newFrom
    }, {
      method: 'from',
      arguments: [newFrom]
    });

    return true;
  }

  else {
    throw new Error(`unexpected op=${op}`);
  }
};

/**
 * Функция для получения множества ассоциаций с определенной исходящей связью.
 * @param {string} op - Операция ('get')
 * @returns {Association} - Ассоциация содержащая Set с ассоциациями с указанной исходящей связью
 */
export const out = function(ass, op) {
  // Операция 'get': возвращаем множество ассоциаций с исходящей связью
  if (op === 'get') {
    // Получаем множество из froms, создаем его, если оно не существует
    const result = froms.many(ass.this);

    // Добавляем информацию для TRACK
    result.origins = [ass];
    result.temp.method = 'out';

    // Создаем локальный track для отслеживания изменений
    result._proxy.set('track', (resultAss, op) => {
      if (op === 'get') {
        // Если track уже создан, возвращаем его
        if (resultAss.temp.track) {
          return resultAss.temp.track;
        }

        // Создаем track
        const track = Association._proxy.get('track').call(resultAss, resultAss, 'get');

        if (track) {
          // Функция для обновления результата при изменении исходящей связи
          const updateHandler = (origin, event, meta) => {
            // Перезапрашиваем актуальное состояние out при изменении исходящей связи
            const newOut = froms.many(ass.this);
            resultAss.this = newOut.this;

            // Генерируем событие изменения
            if (resultAss.emit) {
              resultAss.emit('change', {
                reason: 'from-update',
                prev: event.prev,
                next: event.next,
                detail: event.detail
              }, meta);
            }
          };

          // Подписываемся на изменение исходящей связи
          const offChanges = [];

          if (ass.on && ass.emit) {
            const offChange = ass.on('change', (event, meta) => {
              updateHandler(ass, event, meta);
            });
            offChanges.push(offChange);
          }

          // Сохраняем функции отписки
          track.temp.offChanges = offChanges;

          return track;
        }
      }

      return null;
    });

    return result;
  }
  else {
    throw new Error(`unexpected op=${op}`);
  }
};

/**
 * Функция для получения или установки входящей связи ассоциации.
 * @param {string} op - Операция ('get' или 'set')
 * @param {...*} args - Аргументы операции
 * @returns {Association|void} - Ассоциация входящей связи при 'get', ничего при 'set'
 */
export const to = function(ass, op, args) {
  // Операция 'get': возвращаем текущую входящую связь ассоциации
  if (op === 'get') {
    const currentTo = tos.one(ass.this);
    // Возвращаем новую ассоциацию, связанную с входящей связью
    if (currentTo === undefined) return;
    return new Association(currentTo);
  }

  // Операция 'set': устанавливаем входящую связь ассоциации
  else if (op === 'set') {
    let newTo = args[0];
    if (newTo instanceof Association) newTo = newTo.this;

    // Получаем текущую входящую связь для события
    const prevTo = tos.one(ass.this);

    // Если входящая связь не изменилась, ничего не делаем
    if (prevTo === newTo) return;

    // Если была установлена предыдущая входящая связь, удаляем её
    if (prevTo) {
      tos.delete(ass.this, prevTo);
    }

    // Если указана новая входящая связь, устанавливаем её
    if (newTo) {
      // Если новая входящая связь является экземпляром Association, используем его this
      const toToSet = newTo instanceof Association ? newTo.this : newTo;
      tos.set(ass.this, toToSet);
    }

    // Событие 'to' с указанием предыдущей и новой входящей связи
    ass.emit('to', prevTo, newTo instanceof Association ? newTo.this : newTo);

    // Событие 'change' с деталями изменения
    ass.emit('change', {
      prev: prevTo,
      next: newTo instanceof Association ? newTo.this : newTo
    }, {
      method: 'to',
      arguments: [newTo]
    });

    return true;
  }

  else {
    throw new Error(`unexpected op=${op}`);
  }
};

/**
 * Функция для получения множества ассоциаций с определенной входящей связью.
 * @param {string} op - Операция ('get')
 * @returns {Association} - Ассоциация содержащая Set с ассоциациями с указанной входящей связью
 */
export const into = function(ass, op) {
  // Операция 'get': возвращаем множество ассоциаций с входящей связью
  if (op === 'get') {
    // Получаем множество из tos, создаем его, если оно не существует
    const result = tos.many(ass.this);

    // Добавляем информацию для TRACK
    result.origins = [ass];
    result.temp.method = 'in';

    // Создаем локальный track для отслеживания изменений
    result._proxy.set('track', (resultAss, op) => {
      if (op === 'get') {
        // Если track уже создан, возвращаем его
        if (resultAss.temp.track) {
          return resultAss.temp.track;
        }

        // Создаем track
        const track = Association._proxy.get('track').call(resultAss, resultAss, 'get');

        if (track) {
          // Функция для обновления результата при изменении входящей связи
          const updateHandler = (origin, event, meta) => {
            // Перезапрашиваем актуальное состояние in при изменении входящей связи
            const newIn = tos.many(ass.this);
            resultAss.this = newIn.this;

            // Генерируем событие изменения
            if (resultAss.emit) {
              resultAss.emit('change', {
                reason: 'to-update',
                prev: event.prev,
                next: event.next,
                detail: event.detail
              }, meta);
            }
          };

          // Подписываемся на изменение входящей связи
          const offChanges = [];

          if (ass.on && ass.emit) {
            const offChange = ass.on('change', (event, meta) => {
              updateHandler(ass, event, meta);
            });
            offChanges.push(offChange);
          }

          // Сохраняем функции отписки
          track.temp.offChanges = offChanges;

          return track;
        }
      }

      return null;
    });

    return result;
  }
  else {
    throw new Error(`unexpected op=${op}`);
  }
};

// Добавляем метод type в статические методы Association
Association._proxy.set('type', type);

// Добавляем метод typed в статические методы Association
Association._proxy.set('typed', typed);

// Добавляем метод from в статические методы Association
Association._proxy.set('from', from);

// Добавляем метод out в статические методы Association
Association._proxy.set('out', out);

// Добавляем метод to в статические методы Association
Association._proxy.set('to', to);

// Добавляем метод in в статические методы Association
Association._proxy.set('in', into);


