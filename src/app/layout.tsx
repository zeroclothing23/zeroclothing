import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { Toaster } from "sonner";
import { BRAND } from "@/lib/constants";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  verification: {
  google: "KFdWrHJIUVqklYt0Rc5dmXy37zM4DF6yjMHe-I9Rk_g",
},
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    "streetwear sri lanka",
    "premium t-shirts",
    "acid wash tee",
    "oversized t-shirt",
    "custom design shirt",
    "ZERO Clothing",
  ],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
    locale: "en_LK",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${bodoni.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid #242424",
              color: "#f5f5f5",
            },
          }}
        />
      </body>
    </html>
  );
}
