/*
 * Ametller Origen — Salesforce Commerce API (SCAPI) behind the shop's own PWA proxy.
 *
 * A guest token is obtained with the public SLAS PKCE flow the storefront itself uses.
 * The proxy path (`/mobify/proxy/api`) is used instead of the direct
 * `*.api.commercecloud.salesforce.com` host, which is not reachable from every network.
 */
import { createHash, randomBytes } from 'node:crypto';
import { getJson, request } from '../lib/http.mjs';
import { isEcoName, parseSize, round } from '../lib/units.mjs';

const SITE = 'https://www.ametllerorigen.com';
const API = `${SITE}/mobify/proxy/api`;
const ORG = 'f_ecom_blzv_prd';
const CLIENT_ID = 'fd3c9db8-2a0d-4f4b-9e74-294e068f9ae4';
const SITE_ID = 'ametller';
const REDIRECT = `${SITE}/callback`;

const b64url = (b) => b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function guestToken() {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const auth = await request(
    `${API}/shopper/auth/v1/organizations/${ORG}/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT)}&code_challenge=${challenge}&hint=guest&channel_id=${SITE_ID}`,
    { redirect: 'manual' },
  );
  const loc = auth.headers.get('location');
  if (!loc) throw new Error(`ametller: authorize returned ${auth.status} without a redirect`);
  const u = new URL(loc);
  const body = new URLSearchParams({
    grant_type: 'authorization_code_pkce',
    code: u.searchParams.get('code') ?? '',
    code_verifier: verifier,
    client_id: CLIENT_ID,
    channel_id: SITE_ID,
    redirect_uri: REDIRECT,
    usid: u.searchParams.get('usid') ?? '',
  });
  const res = await request(`${API}/shopper/auth/v1/organizations/${ORG}/oauth2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('ametller: no access_token in SLAS response');
  return j.access_token;
}

async function token(ctx) {
  ctx.cache.ametllerToken ??= await guestToken();
  return ctx.cache.ametllerToken;
}

const UNIT = { KG: ['kg', 1], G: ['kg', 1 / 1000], L: ['l', 1], ML: ['l', 1 / 1000], UN: ['unit', 1], U: ['unit', 1] };

export function normalise(h) {
  const il = h.c_instaleapHit ?? {};
  const name = h.productName ?? h.name;
  const packPrice = Number(h.price);
  let packQty;
  let unit;
  const u = UNIT[String(il.unit ?? '').toUpperCase()];
  if (u && Number(il.quantity) > 0) {
    unit = u[0];
    packQty = round(Number(il.quantity) * u[1]);
  } else {
    const s = parseSize(name);
    if (!s) throw new Error(`ametller ${h.productId ?? h.id}: cannot derive pack size`);
    ({ qty: packQty, unit } = s);
  }
  const id = String(h.productId ?? h.id);
  return {
    productId: id,
    name,
    brand: h.brand ?? '',
    url: h.slugUrl ? (h.slugUrl.startsWith('http') ? h.slugUrl : `${SITE}${h.slugUrl}`) : `${SITE}/ca/${id}.html`,
    image: h.image?.link ?? h.imageGroups?.[0]?.images?.[0]?.link ?? il.photo_url ?? null,
    packPrice,
    packQty,
    unit,
    eco: isEcoName(name),
    warn: null,
  };
}

export default {
  id: 'ametller',
  async find(query, ctx) {
    const t = await token(ctx);
    const j = await getJson(
      `${API}/search/shopper-search/v1/organizations/${ORG}/product-search?q=${encodeURIComponent(query)}&limit=12&siteId=${SITE_ID}&locale=ca`,
      { headers: { authorization: `Bearer ${t}` } },
    );
    return (j.hits ?? []).map((h) => {
      try {
        return normalise(h);
      } catch {
        return { productId: String(h.productId), name: h.productName, packPrice: NaN, packQty: NaN, unit: '?' };
      }
    });
  },
  async fetchItem(cfg, ctx) {
    const t = await token(ctx);
    const p = await getJson(
      `${API}/product/shopper-products/v1/organizations/${ORG}/products/${cfg.productId}?siteId=${SITE_ID}&locale=ca`,
      { headers: { authorization: `Bearer ${t}` } },
    );
    return normalise(p);
  },
};
