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
import { updateCustomRequestStatus } from "@/server/actions/admin";

const STATUSES = ["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "REJECTED", "COMPLETED"];

export function CustomRequestStatus({ id, current }: { id: string; current: string }) {
  const [status, setStatus] = useState(current);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    setStatus(next);
    startTransition(async () => {
      const res = await updateCustomRequestStatus(id, next);
      if (res.ok) toast.success(res.message);
      else {
        toast.error(res.message);
        setStatus(current);
      }
    });
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
