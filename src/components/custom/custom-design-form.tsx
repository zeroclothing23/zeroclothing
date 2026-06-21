"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
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
import { SIZES } from "@/lib/constants";
import { customDesignSchema, type CustomDesignInput } from "@/lib/validations/checkout";
import { submitCustomDesign } from "@/server/actions/custom-design";

const SHIRT_TYPES = ["Cotton Printed", "Acid Wash", "Oversized", "Other"];
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function CustomDesignForm() {
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomDesignInput>({
    resolver: zodResolver(customDesignSchema),
    defaultValues: { shirtType: "", color: "", size: undefined, fileUrls: [] },
  });

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    if (!CLOUD || !PRESET) {
      toast.error("File upload isn't configured yet — please describe your design instead.");
      return;
    }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected.slice(0, 8)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, {
          method: "POST",
          body: fd,
        });
        const json = await res.json();
        if (json.secure_url) uploaded.push(json.secure_url);
      }
      const next = [...files, ...uploaded].slice(0, 8);
      setFiles(next);
      setValue("fileUrls", next);
      toast.success(`${uploaded.length} file(s) uploaded.`);
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeFile(url: string) {
    const next = files.filter((f) => f !== url);
    setFiles(next);
    setValue("fileUrls", next);
  }

  async function onSubmit(values: CustomDesignInput) {
    setSubmitting(true);
    const res = await submitCustomDesign({ ...values, fileUrls: files });
    setSubmitting(false);
    if (res.ok) {
      toast.success(res.message);
      reset();
      setFiles([]);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" error={errors.fullName?.message}>
          <Input {...register("fullName")} />
        </Field>
        <Field label="Mobile Number" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="07XXXXXXXX" />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <Input {...register("email")} type="email" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Shirt Type" error={errors.shirtType?.message}>
          <Select value={watch("shirtType")} onValueChange={(v) => setValue("shirtType", v, { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
            <SelectContent>
              {SHIRT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Color" error={errors.color?.message}>
          <Input {...register("color")} placeholder="Black" />
        </Field>
        <Field label="Size" error={errors.size?.message}>
          <Select onValueChange={(v) => setValue("size", v as CustomDesignInput["size"], { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Describe Your Design" error={errors.description?.message}>
        <Textarea {...register("description")} rows={4} placeholder="Tell us about placement, colors, text, vibe…" />
      </Field>

      {/* Upload */}
      <div className="space-y-2">
        <Label>Upload Design Files {CLOUD ? "(optional)" : "(coming soon)"}</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 py-8 text-center transition-colors hover:border-primary">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {CLOUD ? "Click to upload artwork or photos" : "Describe your design above — uploads enabled once configured"}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} disabled={!CLOUD || uploading} />
        </label>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <span key={f} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
                file
                <button type="button" onClick={() => removeFile(f)} className="cursor-pointer text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting || uploading}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit Request
      </Button>
    </form>
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
