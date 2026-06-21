import type { Metadata } from "next";
import { Sparkles, Upload, Palette, Truck } from "lucide-react";
import { CustomDesignForm } from "@/components/custom/custom-design-form";

export const metadata: Metadata = {
  title: "Custom Design",
  description: "Upload your artwork and we'll print it on premium ZERØ blanks. Custom streetwear, made in Sri Lanka.",
};

export default function CustomDesignPage() {
  const steps = [
    { icon: Upload, title: "Upload", desc: "Send us your artwork or idea." },
    { icon: Palette, title: "We Craft", desc: "We mock it up & quote you." },
    { icon: Sparkles, title: "We Print", desc: "Premium plastisol on heavyweight cotton." },
    { icon: Truck, title: "We Deliver", desc: "Shipped island-wide." },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-2">Make it yours</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Custom Design Service
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          From a single statement piece to full team kits — upload your design and we&apos;ll bring it
          to life on premium ZERØ blanks.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Step {i + 1}</p>
            <h3 className="font-medium">{s.title}</h3>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <CustomDesignForm />
      </div>
    </div>
  );
}
