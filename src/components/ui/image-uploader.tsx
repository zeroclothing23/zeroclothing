"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Reusable image uploader. Uploads to Cloudinary (unsigned preset) when
 * configured; otherwise falls back to manual URL entry so the form still works.
 * Submits the resulting URLs as a newline-joined hidden field named `name`.
 */
export function ImageUploader({
  name = "images",
  initial = [],
  max = 6,
  folder = "zero-clothing",
}: {
  name?: string;
  initial?: string[];
  max?: number;
  folder?: string;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [manual, setManual] = useState("");

  const configured = !!CLOUD && !!PRESET;

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !configured) return;
    setUploading(true);
    try {
      const out: string[] = [];
      for (const file of files.slice(0, max - urls.length)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", PRESET as string);
        fd.append("folder", folder);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
          method: "POST",
          body: fd,
        });
        const json = await res.json();
        if (json.secure_url) out.push(json.secure_url);
      }
      setUrls((u) => [...u, ...out].slice(0, max));
      toast.success(`${out.length} image(s) uploaded.`);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function addManual() {
    const v = manual.trim();
    if (!v) return;
    setUrls((u) => [...u, v].slice(0, max));
    setManual("");
  }

  function remove(url: string) {
    setUrls((u) => u.filter((x) => x !== url));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={urls.join("\n")} />

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url) => (
            <div key={url} className="relative h-24 w-20 overflow-hidden rounded-md border border-border bg-secondary">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" unoptimized />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground hover:text-destructive cursor-pointer"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {configured ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 py-6 text-center transition-colors hover:border-primary">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
          <span className="text-sm text-muted-foreground">Click to upload images ({urls.length}/{max})</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={uploading || urls.length >= max} />
        </label>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Cloudinary not configured — paste image URLs manually.
          </p>
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="https://…"
              className="flex h-10 flex-1 rounded-md border border-input bg-secondary/40 px-3 text-sm"
            />
            <button
              type="button"
              onClick={addManual}
              className="rounded-md border border-border px-4 text-sm hover:border-primary cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
