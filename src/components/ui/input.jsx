import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(function Input({ className, type, ...props }, ref) {
  return <input type={type} className={cn("ui-input", className)} ref={ref} {...props} />;
});

export { Input };
