const STORAGE_KEY_API = 'binance_api_key';
const STORAGE_KEY_SECRET = 'binance_secret_key';

export interface BinanceCredentials {
  apiKey: string;
  secretKey: string;
}

export function saveCredentials(apiKey: string, secretKey: string): void {
  localStorage.setItem(STORAGE_KEY_API, apiKey);
  localStorage.setItem(STORAGE_KEY_SECRET, secretKey);
}

export function getCredentials(): BinanceCredentials | null {
  const apiKey = localStorage.getItem(STORAGE_KEY_API);
  const secretKey = localStorage.getItem(STORAGE_KEY_SECRET);
  if (!apiKey || !secretKey) return null;
  return { apiKey, secretKey };
}

export function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEY_API);
  localStorage.removeItem(STORAGE_KEY_SECRET);
}

export function hasCredentials(): boolean {
  return !!(localStorage.getItem(STORAGE_KEY_API) && localStorage.getItem(STORAGE_KEY_SECRET));
}

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function signRequest(
  queryString: string,
  secretKey: string
): Promise<string> {
  return hmacSHA256(secretKey, queryString);
}

export async function buildSignedUrl(
  baseUrl: string,
  params: Record<string, string | number>,
  secretKey: string
): Promise<string> {
  const timestamp = Date.now();
  const allParams = { ...params, timestamp };
  const queryString = Object.entries(allParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const signature = await signRequest(queryString, secretKey);
  return `${baseUrl}?${queryString}&signature=${signature}`;
}
