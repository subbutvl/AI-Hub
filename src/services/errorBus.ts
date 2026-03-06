type ErrorCallback = (message: string) => void;
const listeners: ErrorCallback[] = [];

export const errorBus = {
  emit(message: string) {
    listeners.forEach(l => l(message));
  },
  subscribe(callback: ErrorCallback) {
    listeners.push(callback);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }
};
