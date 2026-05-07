import { createElement } from "react";
import { cn } from "../../lib/utils";

export function Skeleton({ as: Component = "span", className, ...props }) {
  return createElement(Component, {
    "aria-hidden": "true",
    className: cn("skeleton", className),
    ...props,
  });
}
