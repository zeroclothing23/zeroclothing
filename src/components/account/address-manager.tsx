"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Star, Trash2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCES, SL_PROVINCES } from "@/lib/constants";
import { addressSchema, type AddressInput } from "@/lib/validations/address";
import { saveAddress, deleteAddress, setDefaultAddress } from "@/server/actions/address";

export type SavedAddress = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  addressLine: string;
  postalCode: string;
  isDefault: boolean;
};

export function AddressManager({ addresses }: { addresses: SavedAddress[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { province: "", district: "" },
  });
  const province = watch("province");

  function onSubmit(values: AddressInput) {
    startTransition(async () => {
      const res = await saveAddress(values);
      if (res.ok) {
        toast.success(res.message);
        reset();
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteAddress(id);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  function onSetDefault(id: string) {
    startTransition(async () => {
      const res = await setDefaultAddress(id);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <MapPin className="h-5 w-5 text-primary" /> Saved Addresses
        </h2>
        <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
          <Plus className="h-4 w-4" /> {open ? "Close" : "Add"}
        </Button>
      </div>

      {addresses.length === 0 && !open && (
        <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
      )}

      <ul className="space-y-3">
        {addresses.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div className="text-sm">
              <p className="flex items-center gap-2 font-medium">
                {a.label || a.fullName}
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                    <Star className="h-3 w-3 fill-primary" /> Default
                  </span>
                )}
              </p>
              <p className="text-muted-foreground">{a.fullName} · {a.phone}</p>
              <p className="text-muted-foreground">{a.addressLine}, {a.district}, {a.province} {a.postalCode}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!a.isDefault && (
                <button
                  onClick={() => onSetDefault(a.id)}
                  disabled={pending}
                  className="rounded p-2 text-muted-foreground hover:text-primary cursor-pointer"
                  aria-label="Set as default"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(a.id)}
                disabled={pending}
                className="rounded p-2 text-muted-foreground hover:text-destructive cursor-pointer"
                aria-label="Delete address"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {open && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4 border-t border-border pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label (optional)" error={errors.label?.message}>
              <Input {...register("label")} placeholder="Home, Work…" />
            </Field>
            <Field label="Full Name" error={errors.fullName?.message}>
              <Input {...register("fullName")} />
            </Field>
            <Field label="Mobile" error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="07XXXXXXXX" />
            </Field>
            <Field label="Postal Code" error={errors.postalCode?.message}>
              <Input {...register("postalCode")} inputMode="numeric" />
            </Field>
            <Field label="Province" error={errors.province?.message}>
              <Select
                value={province}
                onValueChange={(v) => {
                  setValue("province", v, { shouldValidate: true });
                  setValue("district", "");
                }}
              >
                <SelectTrigger><SelectValue placeholder="Province" /></SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="District" error={errors.district?.message}>
              <Select
                value={watch("district")}
                onValueChange={(v) => setValue("district", v, { shouldValidate: true })}
                disabled={!province}
              >
                <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
                <SelectContent>
                  {(SL_PROVINCES[province] ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Full Address" error={errors.addressLine?.message}>
            <Input {...register("addressLine")} placeholder="House no, street, area" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isDefault")} className="accent-[#c9a86a]" /> Set as default
          </label>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save Address
          </Button>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
