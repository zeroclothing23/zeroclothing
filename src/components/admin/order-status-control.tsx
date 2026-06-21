"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/server/actions/admin";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "PRINTING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [status, setStatus] = useState(current);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={save} disabled={pending || status === current}>
        {pending ? "Saving…" : "Update"}
      </Button>
    </div>
  );
}
