import { useEffect } from "react";

export function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    function handlePointerDown(event) {
      const node = ref.current;
      if (!node || node.contains(event.target)) return;
      handler(event);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [enabled, handler, ref]);
}
