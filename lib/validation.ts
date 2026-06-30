import { z } from "zod";

export * from "./validation/auth";
export * from "./validation/essay";
export * from "./validation/mechatura";
export * from "./validation/seminar";

export const requiredText = (field: string, max = 120) =>
  z.string()
    .trim()
    .min(1, `${field} wajib diisi.`)
    .max(max, `${field} terlalu panjang.`);

export const orderSchema = z.object({
  order_id: z.string().regex(/^FUTURA-\d{10,}-[a-zA-Z0-9-]+$/),
});

export const idParamSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9-]+$/),
});
