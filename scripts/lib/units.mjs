/*
 * Unit handling shared by every store adapter.
 *
 * Every product is reduced to `{ packPrice, packQty, unit }` where `unit` is one of
 * 'l', 'kg' or 'unit' and `packQty` is the whole pack expressed in that unit
 * (a 6×125 g yogurt pack is packQty 0.75 kg). The site then rescales to the basket
 * quantity, so a half-dozen and a dozen of eggs compare on the same basis.
 */

export const UNITS = ['l', 'kg', 'unit'];

export const round = (n, dp = 3) => Math.round(n * 10 ** dp) / 10 ** dp;

const UNIT_ALIASES = {
  l: ['l', 'lt', 'litre', 'litres', 'litro', 'litros', 'liter'],
  ml: ['ml'],
  cl: ['cl'],
  kg: ['kg', 'kilo', 'kilos', 'quilo', 'quilos'],
  g: ['g', 'gr', 'grs', 'gram', 'grams', 'gramo', 'gramos'],
  unit: ['u', 'ud', 'uds', 'un', 'unit', 'unitat', 'unitats', 'unidad', 'unidades', 'ous', 'huevos', 'pcs'],
};

/** Normalise a raw unit token to l | kg | unit plus the factor to apply to the quantity. */
export function normaliseUnit(raw) {
  const t = String(raw ?? '').trim().toLowerCase().replace(/\.$/, '');
  for (const [canon, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.includes(t)) {
      if (canon === 'ml') return { unit: 'l', factor: 1 / 1000 };
      if (canon === 'cl') return { unit: 'l', factor: 1 / 100 };
      if (canon === 'g') return { unit: 'kg', factor: 1 / 1000 };
      return { unit: canon, factor: 1 };
    }
  }
  return null;
}

const num = (s) => Number(String(s).replace(',', '.'));

/**
 * Extract a pack size from free text such as "Llet sencera 1l", "6x1L", "125g - 4u.",
 * "Pack-6 750 g", "mitja dotzena", "12 u". Returns { qty, unit } or null.
 * Multipliers ("6x1L", "125 g - 4 u") are folded into qty.
 */
export function parseSize(text) {
  const s = String(text ?? '').toLowerCase().replace(/ /g, ' ');
  if (/mitja\s+dotzena|media\s+docena/.test(s)) return { qty: 6, unit: 'unit' };
  if (/\bdotzena\b|\bdocena\b/.test(s)) return { qty: 12, unit: 'unit' };

  // "6x1l", "4 x 125 g"
  const mult = s.match(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(ml|cl|kg|g|l|u|ud|uds)\b/);
  if (mult) {
    const n = normaliseUnit(mult[3]);
    if (n) return { qty: round(Number(mult[1]) * num(mult[2]) * n.factor), unit: n.unit };
  }
  // "125 g - 4 u", "125g 4un"
  const packOf = s.match(/(\d+(?:[.,]\d+)?)\s*(ml|cl|kg|g|l)\b[^0-9]{0,6}(\d+)\s*(u|ud|uds|un|unitats|unidades)\b/);
  if (packOf) {
    const n = normaliseUnit(packOf[2]);
    if (n) return { qty: round(num(packOf[1]) * n.factor * Number(packOf[3])), unit: n.unit };
  }
  // plain "1 l", "500 g", "1,5l", "12 u", "6 ous"
  const plain = [...s.matchAll(/(\d+(?:[.,]\d+)?)\s*(ml|cl|kg|g|l|u|ud|uds|un|ous|huevos)\b/g)];
  for (const m of plain) {
    const n = normaliseUnit(m[2]);
    if (n) return { qty: round(num(m[1]) * n.factor), unit: n.unit };
  }
  return null;
}

/** Detects an eco/organic claim in a product name (any of the four languages seen). */
export const isEcoName = (name) =>
  /\b(eco|bio|ecol[òoó]gic[oa]?s?|org[àa]nic[oa]?)\b/i.test(String(name ?? ''));

