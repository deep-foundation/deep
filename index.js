/**
 * Deep project main export
 */
import { Association } from './association.js';
import { all } from './is.js';
export * from './is.js';
export * from './gets.js';
export * from './sets.js';
export * from './many.js';

// Экспортируем deep как вызываемый экземпляр Association с методами из is.js и gets.js
export const deep = new Association((...args) => new Association(...args));

// Экспортируем саму Association для обратной совместимости
export { Association, all };

export default deep;
