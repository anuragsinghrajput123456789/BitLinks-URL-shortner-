// Event-based state store for toasts to avoid React Context nesting issues in Server Layouts
let listeners = [];

export const toast = {
  success: (msg) => emit(msg, "success"),
  error: (msg) => emit(msg, "error"),
  warning: (msg) => emit(msg, "warning"),
  info: (msg) => emit(msg, "info"),
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

function emit(message, type) {
  listeners.forEach((l) => {
    try {
      l(message, type);
    } catch (err) {
      console.error("Error in toast subscriber:", err);
    }
  });
}
