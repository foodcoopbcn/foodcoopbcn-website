/*
 * Shape of src/data/prices.json, validated both when the collector writes it and when the
 * site imports it, so a bad commit fails the build instead of rendering nonsense.
 */
import { z } from 'astro/zod';

const isoDate = z.string().datetime({ offset: true });

export const ProductSchema = z.object({
  fetchedAt: isoDate,
  productId: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().default(''),
  url: z.string().url(),
  image: z.string().url().nullable().default(null),
  packPrice: z.number().positive(),
  /*
   * FoodCoop only: the price from the shop's "Tarifa SÒCIA" list, read directly
   * rather than derived. Null everywhere else, and null here too if the member
   * list could not be read — the site then shows no member price at all instead
   * of computing one, which is how it previously came to publish figures the
   * co-op does not charge.
   */
  memberPackPrice: z.number().positive().nullable().default(null),
  packQty: z.number().positive(),
  unit: z.enum(['l', 'kg', 'unit']),
  eco: z.boolean(),
});

export const StoreSchema = z.object({
  fetchedAt: isoDate.nullable(),
  lastAttemptAt: isoDate.nullable(),
  lastError: z.string().nullable(),
  items: z.record(z.string(), ProductSchema),
});

export const PricesSchema = z.object({
  version: z.literal(1),
  generatedAt: isoDate,
  stores: z.record(z.string(), StoreSchema),
});

export const emptyPrices = () => ({ version: 1, generatedAt: new Date(0).toISOString(), stores: {} });
