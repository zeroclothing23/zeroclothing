"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SIZES } from "@/lib/constants";
import { saveProduct } from "@/server/actions/admin";

type Category = { id: string; name: string };

export type EditProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  weightGrams: number;
  material: string | null;
  tags: string[];
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: string[];
};

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: EditProduct;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!product;

  function action(formData: FormData) {
    startTransition(async () => {
      const res = await saveProduct(formData);
      if (res.ok) {
        toast.success(res.message);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {isEdit && <input type="hidden" name="id" value={product.id} />}

      <Field label="Product Name">
        <Input name="name" required defaultValue={product?.name} />
      </Field>

      <Field label="Category">
        <select
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? ""}
          className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Description">
        <Textarea name="description" rows={4} defaultValue={product?.description} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (LKR)">
          <Input name="price" type="number" min="0" step="1" required defaultValue={product?.price} />
        </Field>
        <Field label="Discount Price (optional)">
          <Input name="discountPrice" type="number" min="0" step="1" defaultValue={product?.discountPrice ?? ""} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Weight (grams)">
          <Input name="weightGrams" type="number" min="50" defaultValue={product?.weightGrams ?? 250} required />
        </Field>
        <Field label="Material">
          <Input name="material" placeholder="240gsm Combed Cotton" defaultValue={product?.material ?? ""} />
        </Field>
      </div>

      <Field label="Tags (comma separated)">
        <Input name="tags" placeholder="cotton, printed, essential" defaultValue={product?.tags.join(", ")} />
      </Field>

      {!isEdit && (
        <>
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
        </>
      )}

      <Field label="Product Images">
        <ImageUploader name="images" initial={product?.images ?? []} max={6} />
      </Field>

      <div className="flex flex-wrap gap-4">
        {([
          ["isActive", "Active", product?.isActive ?? true],
          ["isFeatured", "Featured", product?.isFeatured ?? false],
          ["isNewArrival", "New Arrival", product?.isNewArrival ?? true],
          ["isBestSeller", "Best Seller", product?.isBestSeller ?? false],
        ] as const).map(([name, label, def]) => (
          <label key={name} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name={name} defaultChecked={def} className="accent-[#c9a86a]" />
            {label}
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
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
