import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
} from "lucide-react";

import type { SpecStatus } from "@/types/spec.types";
import { cn } from "@/lib/utils";

type SpecStatusBadgeProps = {
  status: SpecStatus;
  className?: string;
};

const base =
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium";

export function SpecStatusBadge({ status, className }: Readonly<SpecStatusBadgeProps>) {
  switch (status) {
    case "PROCESSING":
      return (
        <span
          className={cn(
            base,
            "bg-blue-100 text-blue-700",
            className,
          )}
        >
          <Loader2 aria-hidden className="size-3.5 animate-spin" />
          PROCESSING
        </span>
      );
    case "COMPLETED":
      return (
        <span className={cn(base, "bg-green-100 text-green-800", className)}>
          COMPLETED
        </span>
      );
    case "REVIEWED":
      return (
        <span className={cn(base, "bg-green-100 text-green-800", className)}>
          <CheckCircle aria-hidden className="size-3.5" />
          REVIEWED
        </span>
      );
    case "FAILED":
      return (
        <span className={cn(base, "bg-red-100 text-red-800", className)}>
          <AlertCircle aria-hidden className="size-3.5" />
          FAILED
        </span>
      );
    case "EXPORTED":
      return (
        <span className={cn(base, "bg-purple-100 text-purple-800", className)}>
          <Download aria-hidden className="size-3.5" />
          EXPORTED
        </span>
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
