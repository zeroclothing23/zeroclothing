import { z } from "zod";
import { PROVINCES } from "@/lib/constants";

const slPhone = z
  .string()
  .trim()
  .regex(/^(?:\+?94|0)?7\d{8}$/, "Enter a valid Sri Lankan mobile number");

export const addressSchema = z.object({
  label: z.string().max(40).optional().or(z.literal("")),
  fullName: z.string().min(2, "Full name is required").max(120),
  phone: slPhone,
  province: z.enum(PROVINCES as [string, ...string[]], {
    errorMap: () => ({ message: "Select a province" }),
  }),
  district: z.string().min(2, "Select a district"),
  addressLine: z.string().min(5, "Enter your full address").max(300),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits"),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
