export interface OnI {
  (callback): void;
  off: (callback) => void;
  emit(...args): any[];
  kill(): void;
}

export function On(customOn?: any): OnI {
  let callbacks: any[] = []; // Deeps in future
  const on = function (callback) {
    callbacks.push(customOn ? customOn(...arguments) : callback);
    return () => on.off(callback);
  };
  on.off = (callback) => {
    callbacks = callbacks.filter(c => c != callback);
  };
  on.emit = (...args) => {
    const results: any[] = [];
    for (let callback of callbacks) {
      const result = callback(...args);
      results.push(result);
    }
    return results;
  };
  on.kill = () => {
    callbacks = [];
  };
  return on;
}

export default On;
