import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

export interface FABProps extends ButtonProps {
  position?: "bottom-right" | "bottom-center" | "bottom-left";
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, position = "bottom-right", size = "lg", ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "bottom-20 right-6 md:bottom-6",
      "bottom-center": "bottom-20 left-1/2 -translate-x-1/2 md:bottom-6",
      "bottom-left": "bottom-20 left-6 md:bottom-6",
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          "fixed z-40 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105",
          positionClasses[position],
          className
        )}
        {...props}
      />
    );
  }
);
FAB.displayName = "FAB";

export { FAB };
