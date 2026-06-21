import { z } from "zod";
import { PROVINCES, SIZES } from "@/lib/constants";

// Sri Lankan mobile: 07XXXXXXXX (10 digits) or +947XXXXXXXX
const slPhone = z
  .string()
  .trim()
  .regex(/^(?:\+?94|0)?7\d{8}$/, "Enter a valid Sri Lankan mobile number");

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(120),
  email: z.string().email("Enter a valid email"),
  phone: slPhone,
  province: z.enum(PROVINCES as [string, ...string[]], {
    errorMap: () => ({ message: "Select a province" }),
  }),
  district: z.string().min(2, "Select a district"),
  addressLine: z.string().min(5, "Enter your full delivery address").max(300),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits"),
  notes: z.string().max(500).optional().or(z.literal("")),
  couponCode: z.string().max(40).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const customDesignSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(120),
  email: z.string().email("Enter a valid email"),
  phone: slPhone,
  shirtType: z.string().min(2, "Choose a shirt type"),
  color: z.string().min(2, "Choose a color"),
  size: z.enum(SIZES),
  description: z.string().min(10, "Tell us about your design").max(2000),
  fileUrls: z.array(z.string().url()).max(8).default([]),
});

export type CustomDesignInput = z.infer<typeof customDesignSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
