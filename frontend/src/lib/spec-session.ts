import type { SpecificationListItem } from "@/types/spec.types";

const PENDING_SPEC_KEY = "spec-app-pending-specification";

export function queuePendingSpecification(item: SpecificationListItem): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_SPEC_KEY, JSON.stringify(item));
}

export function consumePendingSpecification(): SpecificationListItem | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_SPEC_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_SPEC_KEY);
  try {
    return JSON.parse(raw) as SpecificationListItem;
  } catch {
    return null;
  }
}
