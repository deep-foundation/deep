// Один поток Deep событий
// Создается когда известно что на эту флуктуацию могут подписаться.
// Умирает когда Deep вычеркивается из памяти.
export class On {
  callbacks;
  constructor() {}
  on(callback) {
    if (!this.callbacks) this.callbacks = [];
    this.callbacks.push(callback);
    return () => this.off(callback);
  }
  off(callback) {
    if (this.callbacks) this.callbacks = this.callbacks.filter(c => c != callback);
  }
  emit(...args) {
    if (this.callbacks){
      for (const callback of this.callbacks) {
        callback(...args);
      }
    }
  }
  kill() {
    this.callbacks = undefined;
  };
}
