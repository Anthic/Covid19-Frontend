import type { ToastItem } from "../../types/toast.types";
import { SmsToast } from "./SmsToast";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="sms-toast-portal">
      {toasts.map((t) => (
        <SmsToast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
