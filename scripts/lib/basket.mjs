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
    id: 'llet-semidesnatada',
    label: { ca: 'Llet semidesnatada', es: 'Leche semidesnatada' },
    qty: 1,
    unit: 'l',
    stores: {
      foodcoop: { productId: '2970', brand: 'Campllong', packQty: 1, unit: 'l', nameMustInclude: 'llet semidesnatada' },
      mercadona: { productId: '10382' },
      bonpreu: { productId: '81178', query: 'llet semidesnatada' },
      ametller: { productId: '19156' },
      condis: { productId: '704048', query: 'leche semidesnatada' },
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
    id: 'pa-de-motlle',
    label: { ca: 'Pa de motlle integral', es: 'Pan de molde integral' },
    qty: 0.4,
    unit: 'kg',
    stores: {
      foodcoop: { productId: '5047', brand: 'Taho', packQty: 0.4, unit: 'kg', nameMustInclude: 'pa de motlle integral' },
      mercadona: { productId: '9369' },
      bonpreu: { productId: '83030', query: 'pa de motlle llavors' },
      ametller: { productId: '56489' },
      condis: { productId: '213154', query: 'pan de molde integral' },
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
    id: 'espaguetis',
    label: { ca: 'Espaguetis', es: 'Espaguetis' },
    qty: 0.5,
    unit: 'kg',
    stores: {
      foodcoop: { productId: '2171', brand: 'Castagno', packQty: 0.5, unit: 'kg', nameMustInclude: 'espaguetis blat eco' },
      mercadona: { productId: '6331' },
      bonpreu: { productId: '53554', query: 'espaguetis' },
      ametller: { productId: '56668' },
      condis: { productId: '122094', query: 'espaguetis' },
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
    id: 'cigrons-cuits',
    label: { ca: 'Cigrons cuits', es: 'Garbanzos cocidos' },
    qty: 0.66,
    unit: 'kg',
    stores: {
      /* Gumendi 660 g is cheaper per kg than Cal Valls 700 g (and organic). */
      foodcoop: { productId: '5205', brand: 'Gumendi', packQty: 0.66, unit: 'kg', nameMustInclude: 'cigrons cuits' },
      mercadona: { productId: '26029' },
      bonpreu: { productId: '61633', query: 'cigrons cuits' },
      ametller: { productId: '54363' },
      condis: { productId: '122063', query: 'garbanzos cocidos' },
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
