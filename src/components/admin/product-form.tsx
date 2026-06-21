"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SIZES } from "@/lib/constants";
import { saveProduct } from "@/server/actions/admin";

type Category = { id: string; name: string };

export function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      const res = await saveProduct(formData);
      if (res.ok) {
        toast.success(res.message);
        router.push("/admin/products");
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <Field label="Product Name">
        <Input name="name" required />
      </Field>

      <Field label="Category">
        <select
          name="categoryId"
          required
          className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Description">
        <Textarea name="description" rows={4} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (LKR)">
          <Input name="price" type="number" min="0" step="1" required />
        </Field>
        <Field label="Discount Price (optional)">
          <Input name="discountPrice" type="number" min="0" step="1" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Weight (grams)">
          <Input name="weightGrams" type="number" min="50" defaultValue={250} required />
        </Field>
        <Field label="Material">
          <Input name="material" placeholder="240gsm Combed Cotton" />
        </Field>
      </div>

      <Field label="Tags (comma separated)">
        <Input name="tags" placeholder="cotton, printed, essential" />
      </Field>

      <Field label="Colors (comma separated)">
        <Input name="colors" placeholder="Black, Bone, White" required />
      </Field>

      <div>
        <Label>Sizes</Label>
        <div className="mt-2 flex flex-wrap gap-3">
          {SIZES.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="sizes" value={s} defaultChecked className="accent-[#c9a86a]" />
              {s}
            </label>
          ))}
        </div>
      </div>

      <Field label="Image URLs (one per line)">
        <Textarea name="images" rows={3} placeholder="https://res.cloudinary.com/..." />
      </Field>

      <div className="flex flex-wrap gap-4">
        {[
          ["isActive", "Active", true],
          ["isFeatured", "Featured", false],
          ["isNewArrival", "New Arrival", true],
          ["isBestSeller", "Best Seller", false],
        ].map(([name, label, def]) => (
          <label key={name as string} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name={name as string} defaultChecked={def as boolean} className="accent-[#c9a86a]" />
            {label as string}
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
