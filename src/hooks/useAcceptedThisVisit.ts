import { useSyncExternalStore } from "react";

/*
 * Whether the guest accepted the invitation during this visit. Not stored anywhere: a refresh
 * starts again with no falling flowers until they accept.
 */
let accepted = false;
const subs = new Set<() => void>();

export function markAcceptedThisVisit() {
  if (accepted) return;
  accepted = true;
  subs.forEach((f) => f());
}

export function useAcceptedThisVisit(): boolean {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => void subs.delete(cb);
    },
    () => accepted,
    () => false,
  );
}
