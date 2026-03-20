import React, { createContext, useCallback, useState, useContext, useMemo } from "react";
import type {
  ToastAPI,
  ToastItem,
  ToastOptions,
  ToastType,
} from "../../types/toast.types";
import { ToastContainer } from "./ToastContainer";
import "./toast.css";

const ToastContext = createContext<ToastAPI | null>(null);

let _idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      options: ToastOptions = {},
    ): number => {
      const id = ++_idCounter;
      const entry: ToastItem = {
        id,
        type,
        title,
        message,
        duration: options.duration ?? 4000,
      };
      setToasts((prev) => [...prev, entry]);
      return id;
    },
    [],
  );

  const value = useMemo<ToastAPI>(() => ({
    success: (title, msg, opts) => addToast("success", title, msg, opts),
    error: (title, msg, opts) => addToast("error", title, msg, opts),
    warning: (title, msg, opts) => addToast("warning", title, msg, opts),
    info: (title, msg, opts) => addToast("info", title, msg, opts),
    badRequest: (title, msg, opts) => addToast("bad_request", title, msg, opts),
    loading: (title, msg) => addToast("loading", title, msg, { duration: 0 }),
    dismiss,
    resolve: (id, type, title, msg, opts) => {
      dismiss(id);
      setTimeout(() => addToast(type, title, msg, opts), 80);
    },
  }), [addToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function getToastContext() {
  return ToastContext;
}
