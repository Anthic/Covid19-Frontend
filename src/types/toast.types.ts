export type ToastType = "success" | "error" | "warning" | "info" | "bad_request" | "loading";

export interface ToastConfig {
  emoji: string | null;
  tag: string;
  label: string;
  sender: string;
}

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

export interface ToastOptions {
  duration?: number;
}

export interface ToastAPI {
  success: (title: string, msg?: string, opts?: ToastOptions) => number;
  error: (title: string, msg?: string, opts?: ToastOptions) => number;
  warning: (title: string, msg?: string, opts?: ToastOptions) => number;
  info: (title: string, msg?: string, opts?: ToastOptions) => number;
  badRequest: (title: string, msg?: string, opts?: ToastOptions) => number;
  loading: (title: string, msg?: string) => number;
  dismiss: (id: number) => void;
  resolve: (id: number, type: ToastType, title: string, msg?: string, opts?: ToastOptions) => void;
}
