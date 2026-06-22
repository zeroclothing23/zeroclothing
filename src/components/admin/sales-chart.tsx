import { formatLKR } from "@/lib/utils";

type Point = { date: string; revenue: number; orders: number };

/** Dependency-free revenue bar chart (last N days). */
export function SalesChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-medium">Revenue — last {data.length} days</h2>
          <p className="text-xs text-muted-foreground">Paid orders only</p>
        </div>
        <p className="text-lg font-semibold text-primary">{formatLKR(total)}</p>
      </div>

      <div className="flex h-40 items-end gap-1.5">
        {data.map((d) => {
          const h = Math.round((d.revenue / max) * 100);
          return (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
                style={{ height: `${Math.max(h, d.revenue > 0 ? 4 : 0)}%` }}
              />
              <span className="pointer-events-none absolute -top-7 z-10 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] text-foreground shadow group-hover:block">
                {formatLKR(d.revenue)} · {d.orders} order(s)
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{new Date(data[0]?.date).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}</span>
        <span>{new Date(data[data.length - 1]?.date).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}</span>
      </div>
    </div>
  );
}
