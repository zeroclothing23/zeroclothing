import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, Sparkles, RotateCcw, Star, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

/* --- Scrolling trust marquee --- */
export function Marquee() {
  const items = [
    "ISLAND-WIDE DELIVERY",
    "PREMIUM HEAVYWEIGHT COTTON",
    "SECURE CARD PAYMENTS",
    "LIMITED DROPS",
    "MADE FOR SRI LANKA",
  ];
  const row = [...items, ...items];
  return (
    <div className="border-y border-border bg-secondary/30 py-3 overflow-hidden">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            {t} <span className="ml-10 text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --- Category collection banner --- */
export function CollectionBanner({
  title,
  subtitle,
  href,
  image,
  align = "left",
}: {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[3/2]"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div
        className={`relative z-10 flex w-full flex-col justify-end p-6 sm:p-8 ${
          align === "right" ? "items-end text-right" : "items-start"
        }`}
      >
        <p className="eyebrow mb-1">{subtitle}</p>
        <h3 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h3>
        <span className="mt-3 inline-flex items-center gap-1 border-b border-primary pb-0.5 text-xs uppercase tracking-wider text-primary">
          Explore
        </span>
      </div>
    </Link>
  );
}

/* --- Why choose us --- */
export function WhyChooseUs() {
  const features = [
    { icon: Sparkles, title: "Premium Fabric", desc: "240–300gsm combed & heavyweight cotton built to last." },
    { icon: Truck, title: "Island-Wide Delivery", desc: "Fast Speed Post delivery to every district in Sri Lanka." },
    { icon: ShieldCheck, title: "Secure Payments", desc: "Encrypted Visa & MasterCard payments via PayHere." },
    { icon: RotateCcw, title: "Easy Returns", desc: "7-day hassle-free returns on unworn items." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{f.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- Customer reviews --- */
export function Reviews() {
  const reviews = [
    { name: "Dinuka P.", text: "The heavyweight feel is unreal. Better than brands I've ordered from abroad.", role: "Colombo" },
    { name: "Sahan R.", text: "Acid wash tee is a statement piece. Delivery to Kandy was quick.", role: "Kandy" },
    { name: "Ishara F.", text: "Custom design service nailed my idea exactly. 10/10.", role: "Galle" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-2">Loved by the streets</p>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">What Our Customers Say</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.name} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-sm leading-relaxed text-foreground/90">
              “{r.text}”
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-medium">{r.name}</span>
              <span className="text-muted-foreground"> · {r.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* --- Custom design CTA --- */
export function CustomCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-secondary/40 p-8 sm:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-xl">
          <p className="eyebrow mb-2">Make it yours</p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Custom Design Service
          </h2>
          <p className="mt-4 text-muted-foreground">
            Upload your artwork, pick your blank and let us print it on premium cotton.
            From one-off pieces to full team kits — we handle it end to end.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/custom-design">Start Your Design</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* --- Instagram feed (placeholder grid) --- */
export function InstagramFeed({ handle }: { handle?: string }) {
  const tiles = Array.from({ length: 6 });
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <p className="eyebrow mb-2 flex items-center justify-center gap-2">
          <Instagram className="h-4 w-4" /> @zeroclothing.lk
        </p>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Follow the Movement</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {tiles.map((_, i) => (
          <a
            key={i}
            href={handle || "https://instagram.com/zeroclothing.lk"}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-md bg-secondary"
          >
            <Image
              src={`https://placehold.co/400x400/111111/c9a86a/png?text=ZER%C3%98+0${i + 1}`}
              alt={`Instagram post ${i + 1}`}
              fill
              sizes="(max-width: 640px) 33vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
