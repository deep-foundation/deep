export interface OnI {
  (callback): void;
  off: (callback) => void;
  emit(event: DeepEvent): void;
  kill(): void;
}

export interface DeepEvent {
  name: string;
  deep: any;
  prev: any;
  next: any;
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

  on.emit = (event: DeepEvent) => {
    // Convert 'change' events to 'update' events for selections
    if (event.name === 'change' && event.deep.type === 'Selection') {
      const updateEvent = {
        name: 'update',
        deep: event.deep,
        prev: { value: event.prev.value },
        next: { value: event.next.value }
      };
      on.emitToListeners(updateEvent);
    } else {
      on.emitToListeners(event);
    }
  };

  on.emitToListeners = (event: DeepEvent) => {
    for (const callback of callbacks) {
      callback(event);
    }
  };

  on.kill = () => {
    callbacks = [];
  };
  return on;
}

export default On;
