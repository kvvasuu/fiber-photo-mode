import { useEffect, useRef } from "react";

/**
 * Disposes an object when the instance changes or the component unmounts.
 */
export function useDispose<T extends { dispose?: () => void }>(instance: T | null | undefined): void {
  const disposed = useRef<WeakSet<object>>(new WeakSet());

  useEffect(() => {
    return () => {
      if (instance && typeof instance === "object" && !disposed.current.has(instance)) {
        disposed.current.add(instance);
        instance.dispose?.();
      }
    };
  }, [instance]);
}
