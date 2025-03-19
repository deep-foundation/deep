/**
 * Модуль универсальных методов модификации
 *
 * Содержит набор методов для внесения изменений в данные, оптимизированных для использования
 * с классом Association. Все методы генерируют события change и специфические события для каждой операции.
 */

import { Association } from "./association.js";

// Импортируем функции из подмодулей
import { set, delete_, clear, add, remove, has, get, size, convert, clone, merge } from "./sets/basic.js";
import { create, keys, values, entries, assign, defineProperty } from "./sets/object.js";
import { push, pop, shift, unshift, splice, reverse, sort, fill } from "./sets/arrays.js";
import { mapSet, mapDelete, mapClear, setAdd, setDelete, setClear } from "./sets/collections.js";
import { weakSet, weakDelete, weakAdd } from "./sets/weak.js";
import { replace, transform } from "./sets/composite.js";
import { upsert, patch, batch } from "./sets/advanced.js";

// Объединение всех экспортируемых функций в один объект
export const all = {
  // Базовые операции с объектами
  set,
  'delete': delete_,
  clear,
  add,
  remove,
  has,
  get,
  size,
  convert,
  clone,
  merge,

  // Специфические операции с объектами
  create,
  keys,
  values,
  entries,
  assign,
  defineProperty,

  // Методы для массивов
  push,
  pop,
  shift,
  unshift,
  splice,
  reverse,
  sort,
  fill,

  // Методы для Map и Set
  mapSet,
  mapDelete,
  mapClear,
  setAdd,
  setDelete,
  setClear,

  // Методы для WeakMap и WeakSet
  weakSet,
  weakAdd,
  weakDelete,

  // Композитные операции
  replace,
  transform,

  // Комплексные операции
  upsert,
  patch,
  batch
};

// Экспортируем отдельные функции для удобства
export {
  set, delete_ as delete, clear, add, remove, has, get, size, convert, clone, merge,
  create, keys, values, entries, assign, defineProperty,
  push, pop, shift, unshift, splice, reverse, sort, fill,
  mapSet, mapDelete, mapClear, setAdd, setDelete, setClear,
  weakSet, weakAdd, weakDelete,
  replace, transform,
  upsert, patch, batch
};

// Добавляем методы в прокси
for (const name in all) {
  Association._proxy.set(name, all[name]);
}
