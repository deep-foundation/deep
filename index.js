/**
 * Deep project main export
 */
import { Association } from './association.js';
export * from './is.js';
import { type, types } from './relations.js';

export * from './track.js';
export * from './events.js';
export * from './gets.js';
export * from './is.js';
export * from './many.js';
export * from './relations.js';
export * from './sets.js';
export * from './lifecycle.js';

// Экспортируем deep как вызываемый экземпляр Association с методами из is.js и gets.js
export const deep = new Association((...args) => {
  if (args[0] instanceof Association) return args[0];
  else return new Association(...args);
});

export * from './select.js';

// Экспортируем саму Association для обратной совместимости
export { Association, type, types };

export default deep;
