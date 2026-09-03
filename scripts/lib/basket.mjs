/*
 * The basket: which FoodCoop products are compared, against which product in each
 * supermarket. Everything is pinned by product id on purpose — a search that silently
 * drifts to a different product would put a wrong number on the site.
 *
 * Matching rule (agreed with the co-op): the closest equivalent in each shop, choosing the
 * organic version when the shop sells one. When it does not, the conventional product is
 * used and the site marks it "no eco" next to FoodCoop's ECO badge, so the reader sees
 * what is being compared. `eco` is only set here to override the automatic detection.
 *
 * `qty`/`unit` is the comparison basis: FoodCoop's own format, or 1 kg / 1 l for anything
 * sold in bulk. Every store price is rescaled to it from the product's pack size.
 * A store entry may override `packQty`/`unit` when the shop's own unit is not the useful
 * one (tea sold by weight but compared by bag; fuet compared by piece).
 *
 * What goes in the basket: everyday staples across the categories a real weekly shop
 * covers, including fresh produce, one product per category. Two entries for the same
 * thing (two milks, or pasta twice in a different shape) double-weight that category and
 * are not kept. Quantities are what a household actually buys, and each shop is matched
 * on its standard format rather than on whichever pack size happens to look best.
 *
 * Most items come from the co-op's C. BÀSICA range; fresh produce lives outside it, so
 * those entries carry their own `search`.
 *
 * A category drops out when the co-op stops selling anything the supermarkets also sell
 * in an equivalent form. Sliced bread went that way: the loaf this compared was
 * discontinued and what is left is artisan spelt at roughly four times the price of an
 * industrial sliced loaf, which measures the two products rather than the two shops.
 *
 * To pin a new product: `node scripts/find.mjs <store> "<query>"`.
 */

export const STORES = [
  { id: 'foodcoop', label: 'FoodCoop BCN', featured: true },
  { id: 'mercadona', label: 'Mercadona' },
  { id: 'bonpreu', label: 'Bonpreu / Esclat' },
  { id: 'ametller', label: 'Ametller Origen' },
  { id: 'condis', label: 'Condis' },
];

export const BASKET = [
  {
    id: 'llet-sencera',
    label: { ca: 'Llet sencera', es: 'Leche entera' },
    qty: 1,
    unit: 'l',
    stores: {
      foodcoop: { productId: '2969', brand: 'Campllong', packQty: 1, unit: 'l', nameMustInclude: 'llet sencera' },
      mercadona: { productId: '10380' },
      bonpreu: { productId: '81177', query: 'llet sencera' },
      ametller: { productId: '19157' },
      condis: { productId: '704049', query: 'leche entera' },
    },
  },
  {
    id: 'iogurt-natural',
    label: { ca: 'Iogurt natural', es: 'Yogur natural' },
    qty: 0.125,
    unit: 'kg',
    stores: {
      foodcoop: { productId: '3004', brand: 'La Torre', packQty: 0.125, unit: 'kg', nameMustInclude: 'iogurt natural' },
      mercadona: { productId: '22313' },
      bonpreu: { productId: '90813', query: 'iogurt natural' },
      ametller: { productId: '59069' },
      condis: { productId: '780231', query: 'yogur natural' },
    },
  },
  {
    id: 'ous',
    label: { ca: 'Ous', es: 'Huevos' },
    qty: 6,
    unit: 'unit',
    basis: { ca: '6 ous', es: '6 huevos' },
    stores: {
      /* La Tavella only sells certified organic eggs; the shop name omits the word. */
      foodcoop: { productId: '2207', brand: 'La Tavella', packQty: 6, unit: 'unit', nameMustInclude: 'ous', eco: true },
      /* Mercadona sells no organic eggs: free-range is the closest. */
      mercadona: { productId: '31310' },
      bonpreu: { productId: '04230', query: 'ous ecològics' },
      ametller: { productId: '53336' },
      condis: { productId: '170306', query: 'huevos ecológicos' },
    },
  },
  {
    id: 'patata',
    label: { ca: 'Patata', es: 'Patata' },
    qty: 1,
    unit: 'kg',
    stores: {
      /* Fresh produce sits outside the C. BÀSICA listing, so this one names its own search. */
      foodcoop: { productId: '2710', brand: '', packQty: 1, unit: 'kg', nameMustInclude: 'patata vermella', search: 'PATATA' },
      /* The bag a household actually buys, not the single loose potato. */
      mercadona: { productId: '69166' },
      bonpreu: { productId: '04657', query: 'patata' },
      /* Sold loose by the piece here, so the weight it is priced against is set explicitly. */
      ametller: { productId: '214', packQty: 0.2, unit: 'kg' },
      condis: { productId: '191640', query: 'patata' },
    },
  },
  {
    id: 'ceba',
    label: { ca: 'Ceba', es: 'Cebolla' },
    qty: 1,
    unit: 'kg',
    stores: {
      foodcoop: { productId: '1994', brand: '', packQty: 1, unit: 'kg', nameMustInclude: 'ceba seca', search: 'CEBA' },
      mercadona: { productId: '69089' },
      bonpreu: { productId: '07375', query: 'ceba' },
      ametller: { productId: '55893' },
      condis: { productId: '191095', query: 'cebolla' },
    },
  },
  {
    id: 'poma',
    label: { ca: 'Poma', es: 'Manzana' },
    qty: 1,
    unit: 'kg',
    stores: {
      /* Not certified organic at the co-op, so the conventional apple is the match everywhere. */
      foodcoop: { productId: '5182', brand: '', packQty: 1, unit: 'kg', nameMustInclude: 'poma gala', search: 'POMA' },
      mercadona: { productId: '3269' },
      bonpreu: { productId: '49235', query: 'poma golden' },
      ametller: { productId: '22', packQty: 0.2, unit: 'kg' },
      condis: { productId: '190530', query: 'manzana golden' },
    },
  },
  {
    id: 'beguda-civada',
    label: { ca: 'Beguda de civada', es: 'Bebida de avena' },
    qty: 1,
    unit: 'l',
    stores: {
      foodcoop: { productId: '2301', brand: 'Monsoy', packQty: 1, unit: 'l', nameMustInclude: 'civada' },
      mercadona: { productId: '23912' },
      bonpreu: { productId: '38328', query: 'beguda civada' },
      ametller: { productId: '56378' },
      condis: { productId: '704259', query: 'bebida de avena' },
    },
  },
  {
    id: 'macarrons',
    label: { ca: 'Macarrons', es: 'Macarrones' },
    qty: 0.5,
    unit: 'kg',
    stores: {
      foodcoop: { productId: '2177', brand: 'Castagno', packQty: 0.5, unit: 'kg', nameMustInclude: 'macarrons' },
      mercadona: { productId: '6326' },
      bonpreu: { productId: '36573', query: 'macarrons' },
      ametller: { productId: '56669' },
      condis: { productId: '121147', query: 'macarrones' },
    },
  },
  {
    id: 'arros-integral',
    label: { ca: 'Arròs integral', es: 'Arroz integral' },
    qty: 1,
    unit: 'kg',
    stores: {
      /* Sold in bulk at FoodCoop: the shop price is already per kg. */
      foodcoop: { productId: '1837', brand: '', packQty: 1, unit: 'kg', nameMustInclude: 'arròs rodó integral' },
      mercadona: { productId: '5184' },
      bonpreu: { productId: '85333', query: 'arròs integral' },
      ametller: { productId: '54807' },
      condis: { productId: '103066', query: 'arroz integral', eco: true },
    },
  },
  {
    id: 'flocs-civada',
    label: { ca: 'Flocs de civada', es: 'Copos de avena' },
    qty: 0.5,
    unit: 'kg',
    stores: {
      /* Sold in bulk at FoodCoop: the shop price is already per kg. */
      foodcoop: { productId: '2967', brand: '', packQty: 1, unit: 'kg', nameMustInclude: 'flocs civada' },
      mercadona: { productId: '86341' },
      bonpreu: { productId: '61882', query: 'flocs de civada' },
      ametller: { productId: '10864' },
      condis: { productId: '121877', query: 'copos de avena' },
    },
  },
  {
    id: 'ametlles',
    label: { ca: 'Ametlles', es: 'Almendras' },
    qty: 0.2,
    unit: 'kg',
    stores: {
      /* Raw and with the skin on at every shop: roasted or blanched is a different product. */
      foodcoop: { productId: '5090', brand: '', packQty: 1, unit: 'kg', nameMustInclude: 'ametlla amb pell' },
      mercadona: { productId: '34865' },
      bonpreu: { productId: '84174', query: 'ametlles crues' },
      ametller: { productId: '2312' },
      condis: { productId: '190301', query: 'almendra cruda' },
    },
  },
  {
    id: 'farina-blat',
    label: { ca: 'Farina de blat', es: 'Harina de trigo' },
    qty: 1,
    unit: 'kg',
    stores: {
      foodcoop: { productId: '5045', brand: 'El Granero', packQty: 1, unit: 'kg', nameMustInclude: 'farina de blat' },
      mercadona: { productId: '29100' },
      bonpreu: { productId: '55559', query: 'farina de blat' },
      ametller: { productId: '19418' },
      condis: { productId: '118010', query: 'harina de trigo' },
    },
  },
  {
    id: 'llenties-cuites',
    label: { ca: 'Llenties cuites', es: 'Lentejas cocidas' },
    qty: 0.7,
    unit: 'kg',
    stores: {
      /* Cal Valls 700 g is cheaper per kg than the 350 g jar. */
      foodcoop: { productId: '759', brand: 'Cal Valls', packQty: 0.7, unit: 'kg', nameMustInclude: 'llentia cuita' },
      mercadona: { productId: '26030' },
      bonpreu: { productId: '38455', query: 'llenties cuites ecològiques' },
      ametller: { productId: '54364' },
      condis: { productId: '122073', query: 'lentejas cocidas' },
    },
  },
  {
    id: 'oli-oliva',
    label: { ca: 'Oli d’oliva verge extra', es: 'Aceite de oliva virgen extra' },
    qty: 1,
    unit: 'l',
    stores: {
      foodcoop: { productId: '1799', brand: 'Degustus', packQty: 5, unit: 'l', nameMustInclude: 'oli degustus' },
      mercadona: { productId: '14727' },
      bonpreu: { productId: '45209', query: "oli d'oliva verge extra 5l" },
      ametller: { productId: '10220' },
      condis: { productId: '110452', query: 'aceite de oliva virgen extra' },
    },
  },
  {
    id: 'sal-marina',
    label: { ca: 'Sal marina', es: 'Sal marina' },
    qty: 1,
    unit: 'kg',
    stores: {
      /* Sold in bulk at FoodCoop: the shop price is per kg. */
      foodcoop: { productId: '2307', brand: "Terres de l'Ebre", packQty: 1, unit: 'kg', nameMustInclude: 'sal marina' },
      mercadona: { productId: '19731' },
      bonpreu: { productId: '24782', query: 'sal marina ecològica' },
      ametller: { productId: '3250' },
      condis: { productId: '121782', query: 'sal marina' },
    },
  },
  {
    id: 'cafe-molt',
    label: { ca: 'Cafè mòlt', es: 'Café molido' },
    qty: 0.25,
    unit: 'kg',
    stores: {
      foodcoop: { productId: '2668', brand: 'Oxfam', packQty: 0.25, unit: 'kg', nameMustInclude: 'cafè molt' },
      mercadona: { productId: '11172' },
      bonpreu: { productId: '18783', query: 'cafè molt' },
      ametller: { productId: '56937' },
      condis: { productId: '105046', query: 'café molido' },
    },
  },
  {
    id: 'te-verd',
    label: { ca: 'Te verd', es: 'Té verde' },
    qty: 20,
    unit: 'unit',
    basis: { ca: '20 bosses', es: '20 bolsitas' },
    stores: {
      foodcoop: { productId: '1268', brand: 'Artemís', packQty: 20, unit: 'unit', nameMustInclude: 'te verd' },
      /* Shops price tea by weight; these packs hold 20 bags each. */
      mercadona: { productId: '13651', packQty: 20, unit: 'unit' },
      bonpreu: { productId: '34667', query: 'te verd ecològic', packQty: 20, unit: 'unit' },
      ametller: { productId: '56039', packQty: 20, unit: 'unit' },
      condis: { productId: '107299', query: 'té verde', packQty: 20, unit: 'unit' },
    },
  },
  {
    id: 'fuet',
    label: { ca: 'Fuet', es: 'Fuet' },
    qty: 1,
    unit: 'unit',
    basis: { ca: '1 unitat', es: '1 unidad' },
    stores: {
      foodcoop: { productId: '2752', brand: "L'Esquiador", packQty: 1, unit: 'unit', nameMustInclude: 'fuet' },
      /* Compared by piece: the shops sell one fuet per pack (weight in the product name). */
      mercadona: { productId: '55108', packQty: 1, unit: 'unit' },
      bonpreu: { productId: '80046', query: 'fuet', packQty: 1, unit: 'unit' },
      ametller: { productId: '57100', packQty: 1, unit: 'unit' },
      condis: { productId: '426100', query: 'fuet', packQty: 1, unit: 'unit' },
    },
  },
  {
    id: 'rentavaixelles',
    label: { ca: 'Rentavaixelles a mà', es: 'Lavavajillas a mano' },
    qty: 1,
    unit: 'l',
    stores: {
      /* Bulk at FoodCoop, priced per kg; dish soap is close enough to 1 kg/l to compare per litre. */
      foodcoop: { productId: '4701', brand: 'GoodGranel', packQty: 1, unit: 'l', nameMustInclude: 'rentavaixelles manual' },
      mercadona: { productId: '42441' },
      bonpreu: { productId: '45489', query: 'sabó rentar plats ecològic' },
      ametller: { productId: '3375' },
      condis: { productId: '833003', query: 'lavavajillas mano' },
    },
  },
];
