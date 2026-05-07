import { cn } from "../../lib/utils";

export function Skeleton({ as: Component = "span", className, ...props }) {
  return <Component aria-hidden="true" className={cn("skeleton", className)} {...props} />;
}
