import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Label = forwardRef(function Label({ className, ...props }, ref) {
  return <label ref={ref} className={cn("ui-label", className)} {...props} />;
});

export { Label };
