/**
 * Deep project main export
 */
import { Association } from './association.js';
import { all } from './is.js';
import { type, types } from './relations.js';

export * from './track.js';
export * from './events.js';
export * from './gets.js';
export * from './is.js';
export * from './many.js';
export * from './relations.js';
export * from './sets.js';

// Экспортируем deep как вызываемый экземпляр Association с методами из is.js и gets.js
export const deep = new Association((...args) => new Association(...args));

// Экспортируем саму Association для обратной совместимости
export { all, Association, type, types };

export default deep;
