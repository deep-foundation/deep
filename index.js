/**
 * Deep project main export
 */
import { Association } from './association.js';
import { all } from './is.js';
import { types, type } from './relations.js';
import { initTrack } from './track.js';

export * from './events.js';
export * from './is.js';
export * from './track.js';
export * from './gets.js';
export * from './sets.js';
export * from './many.js';
export * from './relations.js';

// Экспортируем deep как вызываемый экземпляр Association с методами из is.js и gets.js
export const deep = new Association((...args) => new Association(...args));

// Инициализируем Track с использованием deep
initTrack(deep);

// Экспортируем саму Association для обратной совместимости
export { Association, all, types, type };

export default deep;
