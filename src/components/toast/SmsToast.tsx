import React, { useState, useCallback, useEffect, useRef } from "react";
import type { ToastItem } from "../../types/toast.types";
import { TOAST_VARIANTS, nowStr } from "./toastConfig";

interface SmsToastProps extends ToastItem {
  onDismiss: (id: number) => void;
}

export function SmsToast({ id, type, title, message, duration, onDismiss }: SmsToastProps) {
  const cfg = TOAST_VARIANTS[type];
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onDismiss(id), 320);
  }, [exiting, id, onDismiss]);

  useEffect(() => {
    if (type === "loading") return;
    timerRef.current = setTimeout(dismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, duration, type]);

  return (
    <div className={`sms-toast sms-toast--${type}${exiting ? " exiting" : ""}`}>
      <div className="sms-avatar">{cfg.sender}</div>
      <div>
        <div
          className="sms-bubble"
          style={{ "--toast-dur": `${duration}ms` } as React.CSSProperties}
        >
          <button
            className="sms-close"
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
          >
            ✕
          </button>
          <div className="sms-header">
            <span className="sms-tag">{cfg.tag}</span>
            <span className="sms-time">{nowStr()}</span>
          </div>
          <div className="sms-title">
            {type === "loading" && <span className="sms-spinner" />}
            {title}
          </div>
          {message && <div className="sms-body">{message}</div>}
          {type !== "loading" && (
            <div
              className="sms-progress"
              style={{ "--toast-dur": `${duration}ms` } as React.CSSProperties}
            />
          )}
        </div>
        <div className="sms-receipt">Delivered · {nowStr()}</div>
      </div>
    </div>
  );
}
