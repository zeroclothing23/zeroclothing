"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Category = { name: string; slug: string };

export function ShopFilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeCategory = params.get("category") ?? "";
  const activeSort = params.get("sort") ?? "newest";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const chips = [{ name: "All", slug: "" }, ...categories];

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = activeCategory === c.slug;
          return (
            <button
              key={c.slug || "all"}
              onClick={() => setParam("category", c.slug || null)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="w-full sm:w-48">
        <Select value={activeSort} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger aria-label="Sort products">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
