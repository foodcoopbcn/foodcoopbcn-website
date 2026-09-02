/*
 * Small fetch wrapper for the price collector: timeout, polite pacing, retries.
 *
 * Retries only on things that can plausibly succeed a moment later (network errors,
 * 5xx, 429). A 403 or 404 is a decision by the other side and is reported immediately
 * so the caller can keep the last good value.
 */
const PAUSE_MS = 400;
const TIMEOUT_MS = 15_000;
const BACKOFF_MS = [2_000, 6_000];

export const DEFAULT_UA = 'FoodCoopBCN-basket/1.0 (+https://foodcoopbcn.cat; hola@foodcoopbcn.cat)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class HttpError extends Error {
  constructor(status, url, body = '') {
    super(`HTTP ${status} for ${url}${body ? ` — ${body.slice(0, 200)}` : ''}`);
    this.status = status;
    this.url = url;
  }
}

let lastRequestAt = 0;

/** fetch() with pacing (`init.pace` ms between requests), timeout and bounded retries. */
export async function request(url, init = {}) {
  const { pace = PAUSE_MS, ...rest } = init;
  init = rest;
  const headers = { 'user-agent': DEFAULT_UA, ...(init.headers ?? {}) };
  let attempt = 0;
  for (;;) {
    const wait = pace - (Date.now() - lastRequestAt);
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    try {
      const res = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
      /* AWS WAF answers a suspected bot with 202 + an empty body and expects a JS challenge. */
      if (res.headers.get('x-amzn-waf-action') === 'challenge') {
        throw new HttpError(res.status, url, 'blocked by a WAF browser challenge');
      }
      if (res.ok || init.redirect === 'manual') return res;
      const retryable = res.status >= 500 || res.status === 429;
      if (!retryable || attempt >= BACKOFF_MS.length) {
        throw new HttpError(res.status, url, await res.text().catch(() => ''));
      }
    } catch (err) {
      if (err instanceof HttpError) throw err;
      if (attempt >= BACKOFF_MS.length) throw new Error(`${url}: ${err.message}`);
    }
    await sleep(BACKOFF_MS[attempt++]);
  }
}

export async function getJson(url, init) {
  const res = await request(url, { ...init, headers: { accept: 'application/json', ...(init?.headers ?? {}) } });
  return res.json();
}

export async function getText(url, init) {
  const res = await request(url, init);
  return res.text();
}
