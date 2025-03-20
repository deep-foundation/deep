/**
 * Memory - класс для хранения ассоциативных связей с поддержкой двунаправленного доступа.
 */
export class Memory {
  /**
   * Хранилище связей "один-к-одному"
   * @type {Map<any, any>}
   * @private
   */
  _forward = new Map();

  /**
   * Хранилище связей "один-ко-многим" для обратного доступа
   * @type {Map<any, Set<any>>}
   * @private
   */
  _reverse = new Map();

  /**
   * Фабрика для создания дочерних множеств
   * @type {Function|null}
   * @private
   */
  _childSetFactory = null;

  /**
   * Создает экземпляр Memory с опциональной фабрикой для дочерних множеств.
   *
   * @param {Object} [options] - Опции инициализации
   * @param {Function} [options.childSetFactory] - Функция-фабрика для создания дочерних множеств
   */
  constructor(options = {}) {
    if (options.childSetFactory && typeof options.childSetFactory === 'function') {
      this._childSetFactory = options.childSetFactory;
    }
  }

  /**
   * Устанавливает связь между ключом и значением.
   *
   * @param {any} key - Ключ для связи
   * @param {any} value - Значение для связи
   * @returns {boolean} - true, если операция выполнена успешно
   */
  set(key, value) {
    // Получаем предыдущее значение, если оно было
    const prevValue = this._forward.get(key);

    // Если предыдущее значение существует и отличается от нового
    if (prevValue !== undefined && prevValue !== value) {
      // Удаляем обратную связь
      const reverseSet = this._reverse.get(prevValue);
      if (reverseSet) {
        reverseSet.delete(key);
        // Если множество пустое, удаляем его
        if (reverseSet.size === 0) {
          this._reverse.delete(prevValue);
        }
      }
    }

    // Устанавливаем новую прямую связь
    this._forward.set(key, value);

    // Обновляем обратную связь
    if (!this._reverse.has(value)) {
      // Создаем новое множество с помощью фабрики, если она задана
      const newSet = this._childSetFactory ? this._childSetFactory(value) : new Set();
      this._reverse.set(value, newSet);
    }

    // Добавляем ключ в множество обратных связей
    this._reverse.get(value).add(key);

    return true;
  }

  /**
   * Получает значение, связанное с указанным ключом.
   *
   * @param {any} key - Ключ для поиска
   * @returns {any} - Связанное значение или undefined, если связь не найдена
   */
  one(key) {
    return this._forward.get(key);
  }

  /**
   * Получает множество ключей, связанных с указанным значением.
   *
   * @param {any} value - Значение для поиска обратных связей
   * @returns {Set<any>} - Множество ключей, связанных с данным значением
   */
  many(value) {
    // Возвращаем существующее множество или создаем новое
    if (!this._reverse.has(value)) {
      const newSet = this._childSetFactory
        ? this._childSetFactory(value)
        : new Set();
      this._reverse.set(value, newSet);
    }

    return this._reverse.get(value);
  }

  /**
   * Удаляет связь для указанного ключа.
   *
   * @param {any} key - Ключ для удаления
   * @returns {boolean} - true, если операция выполнена успешно
   */
  delete(key) {
    // Проверяем, существует ли ключ
    if (!this._forward.has(key)) {
      return false;
    }

    // Получаем значение перед удалением
    const value = this._forward.get(key);

    // Удаляем прямую связь
    this._forward.delete(key);

    // Удаляем обратную связь
    if (this._reverse.has(value)) {
      const reverseSet = this._reverse.get(value);
      reverseSet.delete(key);

      // Если множество пустое, удаляем его
      if (reverseSet.size === 0) {
        this._reverse.delete(value);
      }
    }

    return true;
  }

  /**
   * Проверяет существование связи для указанного ключа.
   *
   * @param {any} key - Ключ для проверки
   * @returns {boolean} - true, если связь существует
   */
  has(key) {
    return this._forward.has(key);
  }

  /**
   * Очищает всю структуру данных, удаляя все связи.
   */
  clear() {
    this._forward.clear();
    this._reverse.clear();
  }

  /**
   * Возвращает количество хранимых one-связей.
   *
   * @returns {number} - Количество связей в структуре данных
   */
  size() {
    return this._forward.size;
  }
}
