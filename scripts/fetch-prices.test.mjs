/*
 * Offline tests for the price collector: unit parsing and each store's response parser,
 * fed with captured fragments of real responses. Run with `npm run prices:test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSize, normaliseUnit, isEcoName } from './lib/units.mjs';
import { normalise as mercadona } from './stores/mercadona.mjs';
import { normalise as bonpreu } from './stores/bonpreu.mjs';
import { normalise as condis } from './stores/condis.mjs';
import { normalise as ametller } from './stores/ametller.mjs';
import { CARD_RE } from './stores/foodcoop.mjs';
import { PricesSchema } from './lib/prices-schema.mjs';
import { BASKET, STORES } from './lib/basket.mjs';

const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg ?? ''} ${a} ≠ ${b}`);

test('parseSize understands the formats seen in the shops', () => {
  assert.deepEqual(parseSize('Llet sencera Llet nostra 1l'), { qty: 1, unit: 'l' });
  assert.deepEqual(parseSize('C. BÀSICA - MACARRONS BLAT ECO Castagno  500 g'), { qty: 0.5, unit: 'kg' });
  assert.deepEqual(parseSize('BONPREU Llet sencera 6x1L en cartró'), { qty: 6, unit: 'l' });
  assert.deepEqual(parseSize('Iogurt natural La Fageda 125g - 4u,'), { qty: 0.5, unit: 'kg' });
  assert.deepEqual(parseSize('OUS La Tavella (mitja dotzena)'), { qty: 6, unit: 'unit' });
  assert.deepEqual(parseSize('Ous frescos ecològics M Ametller Origen - 6u.'), { qty: 6, unit: 'unit' });
  assert.deepEqual(parseSize('Llet sencera ATO 200ml - 3u.'), { qty: 0.6, unit: 'l' });
  assert.equal(parseSize('Fuet Eski'), null);
  assert.deepEqual(normaliseUnit('ML'), { unit: 'l', factor: 0.001 });
});

test('eco detection is word-based', () => {
  assert.ok(isEcoName('Macarrons ecològics Km0'));
  assert.ok(isEcoName('GARBANZOS CONDIS ECO COCIDOS 330 G'));
  assert.ok(!isEcoName('Ecoiogurt de prova')); // no partial-word matches
  assert.ok(!isEcoName('Leche entera Hacendado'));
});

test('mercadona: pack quantity comes from unit_size, cross-checked with the shelf price', () => {
  const p = mercadona({
    id: '22313',
    display_name: 'Yogur natural Hacendado',
    slug: 'yogur-natural-hacendado',
    brand: 'Hacendado',
    thumbnail: 'https://prod-mercadona.imgix.net/x.jpg',
    price_instructions: { unit_price: '1.00', unit_size: 0.75, size_format: 'kg', reference_price: '1.333', reference_format: 'kg', is_pack: true, pack_size: 0.125 },
  });
  assert.equal(p.unit, 'kg');
  close(p.packQty, 0.75);
  close(p.packPrice, 1);
  assert.equal(p.warn, null);
  const eggs = mercadona({
    id: '31310', display_name: 'Huevos de gallinas camperas', slug: 'x',
    price_instructions: { unit_price: '1.95', unit_size: 6, size_format: 'ud', reference_price: '3.90', reference_format: 'dz' },
  });
  assert.equal(eggs.unit, 'unit');
  assert.equal(eggs.packQty, 6);
  assert.equal(eggs.warn, null);
});

test('bonpreu: pack quantity derives from the unit price', () => {
  const p = bonpreu({
    retailerProductId: '90813', name: 'BONPREU Iogurt natural', brand: 'BONPREU', packSizeDescription: '4 x 125g',
    price: { amount: 0.74 }, unitPrice: { price: { amount: 1.48 }, unitName: 'PER_KG' }, image: { src: 'https://x/y.jpg' },
  });
  assert.equal(p.unit, 'kg');
  close(p.packQty, 0.5);
  const eggs = bonpreu({
    retailerProductId: '04230', name: 'BONPREU Ous frescos ecològics classe M', packSizeDescription: '6 u', price: { amount: 2.95 },
    unitPrice: { price: { amount: 0.4917 }, unitName: 'PER_UNIT' },
  });
  assert.equal(eggs.unit, 'unit');
  close(Math.round(eggs.packQty), 6);
  assert.ok(eggs.eco);
  const tea = bonpreu({ retailerProductId: '34667', name: 'BONPREU Te verd ecològic', packSizeDescription: '20 per paquet', price: { amount: 1.35 }, unitPrice: { price: { amount: 0.07 }, unitName: 'EACH' } });
  assert.equal(tea.unit, 'unit');
  assert.equal(tea.packQty, 20);
});

test('condis: pack quantity derives from the "pum" string', () => {
  const p = condis({ id: '704049', description: 'LECHE CONDIS ENTERA 1 L', brand: 'CONDIS', pum: '0,99€/Litro', price: { current: 0.99, regular: 0.99 }, url: '/leche/p/704049/es_ES', isEco: false });
  assert.equal(p.unit, 'l');
  close(p.packQty, 1);
  const eggs = condis({ id: '170306', description: 'HUEVOS GRANJA MONTSENY ECOLÓGICOS 6 UNIDADES', pum: '0,615€/Unidad', price: { current: 3.69 }, url: '/x', isEco: true });
  assert.equal(eggs.unit, 'unit');
  close(eggs.packQty, 6);
  assert.ok(eggs.eco);
});

test('ametller: pack quantity comes from the instaleap hit', () => {
  const p = ametller({ productId: '59069', productName: 'Iogurt natural Essencials 125g - 4u.', price: 1, currency: 'EUR', pricePerUnit: 2, c_instaleapHit: { unit: 'KG', quantity: 0.5 }, image: { link: 'https://x/y.jpg' } });
  assert.equal(p.unit, 'kg');
  close(p.packQty, 0.5);
  const eggs = ametller({ productId: '53336', productName: 'Ous frescos ecològics M Ametller Origen - 6u.', price: 2.99, pricePerUnit: 1, c_instaleapHit: { unit: 'DZ', quantity: 1 } });
  assert.equal(eggs.unit, 'unit');
  assert.equal(eggs.packQty, 6);
  assert.ok(eggs.url.startsWith('https://www.ametllerorigen.com/'));
});

test('foodcoop: product cards are read from the shop microdata', () => {
  const html = `
    <a class="text-primary" itemprop="name" href="/shop/7002043-c-basica-llet-sencera-campllong-1-l-2969?page=2&amp;search=B%C3%80SICA" content="x">C. BÀSICA - LLET SENCERA Campllong 1 l</a>
    <div class="product_price" itemprop="offers"><span class="h6"><span class="oe_currency_value">1,35</span> €</span>
    <span itemprop="price" style="display:none;">1.35</span>
    <a itemprop="name" href="/shop/c-basica-ous-la-tavella-mitja-dotzena-2207">C. BÀSICA - OUS La Tavella (mitja dotzena)</a>
    <span itemprop="price" style="display:none;">2.8000000000000003</span>`;
  const cards = [...html.matchAll(CARD_RE)].map((m) => ({ id: m[3], name: m[4], price: Number(m[5]) }));
  assert.deepEqual(cards, [
    { id: '2969', name: 'C. BÀSICA - LLET SENCERA Campllong 1 l', price: 1.35 },
    { id: '2207', name: 'C. BÀSICA - OUS La Tavella (mitja dotzena)', price: 2.8000000000000003 },
  ]);
});

test('basket config is consistent with the schema and store list', () => {
  const ids = new Set(STORES.map((s) => s.id));
  for (const item of BASKET) {
    assert.ok(item.label.ca && item.label.es, `${item.id} needs both labels`);
    assert.ok(['l', 'kg', 'unit'].includes(item.unit));
    for (const store of Object.keys(item.stores)) assert.ok(ids.has(store), `${item.id}: unknown store ${store}`);
    assert.equal(item.stores.foodcoop.unit, item.unit, `${item.id}: foodcoop unit must equal the basis unit`);
  }
  PricesSchema.parse({
    version: 1,
    generatedAt: '2026-09-02T05:00:00.000Z',
    stores: {
      foodcoop: { fetchedAt: '2026-09-02T05:00:00.000Z', lastAttemptAt: '2026-09-02T05:00:00.000Z', lastError: null, items: {
        'llet-sencera': { fetchedAt: '2026-09-02T05:00:00.000Z', productId: '2969', name: 'LLET SENCERA', brand: 'Campllong', url: 'https://botiga.foodcoopbcn.cat/shop/x-2969', image: null, packPrice: 1.35, packQty: 1, unit: 'l', eco: false },
      } },
    },
  });
  assert.throws(() => PricesSchema.parse({ version: 1, generatedAt: 'nope', stores: {} }));
});
