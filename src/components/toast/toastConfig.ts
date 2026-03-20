import type { ToastConfig, ToastType } from "../../types/toast.types";

export const TOAST_VARIANTS: Record<ToastType, ToastConfig> = {
  success:     { emoji: "✓",  tag: "200 OK",          label: "Success",      sender: "SYS" },
  error:       { emoji: "✕",  tag: "500 ERROR",        label: "Server Error", sender: "ERR" },
  warning:     { emoji: "⚠",  tag: "WARN",             label: "Warning",      sender: "WRN" },
  info:        { emoji: "i",  tag: "INFO",             label: "Info",         sender: "INF" },
  bad_request: { emoji: "✗",  tag: "400 BAD REQUEST",  label: "Bad Request",  sender: "400" },
  loading:     { emoji: null, tag: "PENDING…",         label: "Loading",      sender: "…"   },
};

export function nowStr(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
