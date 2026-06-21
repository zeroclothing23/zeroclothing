import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PROCESSING: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  PRINTING: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  PACKED: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  SHIPPED: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DELIVERED: "bg-green-500/15 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function OrderStatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        STYLES[status] ?? "bg-secondary text-muted-foreground border-border",
      )}
    >
      {status}
    </span>
  );
}
