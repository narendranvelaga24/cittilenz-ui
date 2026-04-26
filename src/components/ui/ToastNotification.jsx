import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export function ToastNotification({
  message,
  tone,
  role = "status",
  ariaLive = "polite",
  className,
}) {
  if (!message || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn("toast-message", tone && `toast-${tone}`, className)}
      role={role}
      aria-live={ariaLive}
    >
      {message}
    </div>,
    document.body,
  );
}
