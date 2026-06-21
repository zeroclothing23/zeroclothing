"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { formatLKR } from "@/lib/utils";
import { PROVINCES, SL_PROVINCES, BRAND } from "@/lib/constants";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { createOrder } from "@/server/actions/checkout";
import { quoteShipping } from "@/server/actions/shipping-quote";

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const weight = useCart((s) => s.totalWeight());

  const [shipping, setShipping] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { province: "", district: "" },
  });

  const province = watch("province");

  // live shipping quote
  useEffect(() => {
    if (weight > 0) quoteShipping(weight).then(setShipping);
  }, [weight]);

  useEffect(() => {
    if (mounted && items.length === 0 && !submitting) router.replace("/cart");
  }, [mounted, items.length, router, submitting]);

  async function onSubmit(values: CheckoutInput) {
    setSubmitting(true);
    const cart = items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }));
    const res = await createOrder(values, cart);

    if (!res.ok) {
      toast.error(res.message);
      setSubmitting(false);
      return;
    }

    if (res.checkout) {
      // Auto-submit to PayHere hosted checkout
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.checkout.actionUrl;
      Object.entries(res.checkout.fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      return;
    }

    // Gateway not configured → WhatsApp-assisted payment fallback
    router.push(`/checkout/pending?order=${res.orderNumber}`);
  }

  if (!mounted) return <div className="min-h-[60vh]" />;

  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Delivery details */}
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold">Delivery Details</h2>

          <Field label="Full Name" error={errors.fullName?.message}>
            <Input {...register("fullName")} autoComplete="name" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mobile Number" error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="07XXXXXXXX" inputMode="tel" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input {...register("email")} type="email" autoComplete="email" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Province" error={errors.province?.message}>
              <Select
                value={province}
                onValueChange={(v) => {
                  setValue("province", v, { shouldValidate: true });
                  setValue("district", "", { shouldValidate: false });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="District" error={errors.district?.message}>
              <Select
                value={watch("district")}
                onValueChange={(v) => setValue("district", v, { shouldValidate: true })}
                disabled={!province}
              >
                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                <SelectContent>
                  {(SL_PROVINCES[province] ?? []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Full Delivery Address" error={errors.addressLine?.message}>
            <Textarea {...register("addressLine")} placeholder="House no, street, area" />
          </Field>

          <Field label="Postal Code" error={errors.postalCode?.message}>
            <Input {...register("postalCode")} inputMode="numeric" placeholder="e.g. 10100" className="sm:max-w-[200px]" />
          </Field>

          <Field label="Additional Notes (optional)" error={errors.notes?.message}>
            <Textarea {...register("notes")} placeholder="Delivery instructions, landmarks…" />
          </Field>
        </div>

        {/* Order summary */}
        <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Your Order</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {i.name} <span className="text-xs">({i.size}/{i.color}) ×{i.quantity}</span>
                </span>
                <span>{formatLKR(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1.5">
            <Label htmlFor="couponCode" className="text-xs">Coupon code</Label>
            <Input id="couponCode" {...register("couponCode")} placeholder="Optional" className="uppercase" />
          </div>

          <Separator />
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatLKR(subtotal)} />
            <Row label={`Shipping (${(weight / 1000).toFixed(2)}kg)`} value={shipping ? formatLKR(shipping) : "—"} />
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatLKR(total)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Pay {formatLKR(total)}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Secure payment via PayHere · Visa & MasterCard. Need help?{" "}
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              WhatsApp us
            </a>
            .
          </p>
          <Link href="/cart" className="block text-center text-xs text-muted-foreground hover:text-primary">
            ← Back to bag
          </Link>
        </aside>
      </form>
    </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
