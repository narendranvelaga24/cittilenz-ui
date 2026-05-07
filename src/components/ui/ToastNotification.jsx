import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export function ToastNotification({
  message,
  tone,
  role,
  ariaLive,
  className,
}) {
  if (!message || typeof document === "undefined") return null;
  const resolvedRole = role ?? (tone === "danger" ? "alert" : "status");
  const resolvedAriaLive = ariaLive ?? (tone === "danger" ? "assertive" : "polite");

  return createPortal(
    <div
      className={cn("toast-message", tone && `toast-${tone}`, className)}
      role={resolvedRole}
      aria-live={resolvedAriaLive}
    >
      {message}
    </div>,
    document.body,
  );
}
