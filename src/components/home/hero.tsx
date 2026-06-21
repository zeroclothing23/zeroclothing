"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #c9a86a 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <motion.p
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="eyebrow"
        >
          Premium Streetwear · Sri Lanka
        </motion.p>

        <motion.h1
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
        >
          Wear the <span className="text-gradient-gold">Zero</span>.
          <br />
          Become the One.
        </motion.h1>

        <motion.p
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Heavyweight cotton, acid-wash finishes and oversized cuts —
          engineered for those who start from nothing and build everything.
        </motion.p>

        <motion.div
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-wrap gap-3"
        >
          <Button asChild size="lg">
            <Link href="/shop">
              Shop the Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/custom-design">Design Your Own</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
