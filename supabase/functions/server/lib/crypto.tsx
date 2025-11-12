import { encode as b64encode, decode as b64decode } from "jsr:@std/encoding/base64";

// Lightweight AES-GCM helpers for optionally encrypting sensitive KV values.
// If ENCRYPTION_KEY_BASE64 is not set, values are stored as-is.

async function getKey(): Promise<CryptoKey | null> {
  const raw = Deno.env.get('ENCRYPTION_KEY_BASE64');
  if (!raw) return null;
  try {
    const bytes = b64decode(raw);
    return await crypto.subtle.importKey(
      'raw',
      bytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (_) {
    return null;
  }
}

export async function encryptJson(value: any): Promise<{ ciphertext: string; iv: string } | any> {
  const key = await getKey();
  if (!key) return value;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(value));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return {
    ciphertext: b64encode(new Uint8Array(ct)),
    iv: b64encode(iv)
  };
}

export async function decryptJson(payload: { ciphertext: string; iv: string } | any): Promise<any> {
  const key = await getKey();
  if (!key || !payload?.ciphertext || !payload?.iv) return payload;
  const iv = b64decode(payload.iv);
  const ct = b64decode(payload.ciphertext);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(pt)));
}

export async function maybeEncryptKVValue(value: any): Promise<any> {
  return await encryptJson(value);
}