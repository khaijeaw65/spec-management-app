import { Card } from "@heroui/react";
import { AlertCircle, CheckCircle, FileText, Loader2 } from "lucide-react";

type DashboardStatsProps = {
  total: number;
  reviewed: number;
  processing: number;
  failed: number;
};

export function DashboardStats({
  total,
  reviewed,
  processing,
  failed,
}: Readonly<DashboardStatsProps>) {
  const cards = [
    {
      key: "total",
      label: "My specifications",
      value: total,
      icon: FileText,
      iconWrap: "bg-blue-50 text-blue-600",
    },
    {
      key: "reviewed",
      label: "Reviewed",
      value: reviewed,
      icon: CheckCircle,
      iconWrap: "bg-green-50 text-green-600",
    },
    {
      key: "processing",
      label: "Processing",
      value: processing,
      icon: Loader2,
      iconWrap: "bg-blue-50 text-blue-600",
      spin: processing > 0,
    },
    {
      key: "failed",
      label: "Failed",
      value: failed,
      icon: AlertCircle,
      iconWrap: "bg-red-50 text-red-600",
      emphasize: failed > 0,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Card.Root
          key={c.key}
          className="border border-zinc-200 bg-white shadow-sm"
        >
          <Card.Content className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                {c.label}
              </p>
              <p
                className={`text-2xl font-semibold tabular-nums leading-none ${
                  "emphasize" in c && c.emphasize ? "text-red-600" : "text-zinc-950"
                }`}
              >
                {c.value}
              </p>
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${c.iconWrap}`}
            >
              <c.icon
                className={`size-5 ${"spin" in c && c.spin ? "animate-spin" : ""}`}
                aria-hidden
              />
            </div>
          </Card.Content>
        </Card.Root>
      ))}
    </div>
  );
}
