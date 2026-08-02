/**
 * AES-256-GCM Web Crypto Local Storage Security Module
 * Implements client-side Web Crypto API (crypto.subtle) zero-trust encryption
 * for field logs, Usufruct certificates, and survey forms.
 */

export interface EncryptedEnvelope {
  ciphertext: string;
  iv: string;
  algorithm: string;
  createdAt: number;
}

let cachedSessionKey: CryptoKey | null = null;

function getSubtleCrypto(): SubtleCrypto {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API (crypto.subtle) is unavailable in current runtime context.');
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto.getRandomValues(array);
  }
  // Fallback Node.js crypto if in non-browser env
  try {
    const cryptoNode = require('crypto');
    return cryptoNode.randomFillSync(array);
  } catch {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
}

/**
 * Generates a 256-bit AES-GCM CryptoKey.
 */
export async function generateAESKey(): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  return subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Retrieves or lazily creates a session-scoped 256-bit AES-GCM key.
 */
export async function getOrCreateSessionKey(): Promise<CryptoKey> {
  if (cachedSessionKey) {
    return cachedSessionKey;
  }

  // Attempt to load raw key from sessionStorage if available
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const storedHexKey = window.sessionStorage.getItem('wb_ifrap_aes_key');
    if (storedHexKey) {
      try {
        const rawBuffer = new Uint8Array(
          storedHexKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
        );
        const subtle = getSubtleCrypto();
        cachedSessionKey = await subtle.importKey(
          'raw',
          rawBuffer,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        return cachedSessionKey;
      } catch (err) {
        console.warn('[CryptoStorage] Failed importing cached session key:', err);
      }
    }
  }

  // Generate new AES-256 key
  cachedSessionKey = await generateAESKey();

  // Export raw key bytes and cache in sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const subtle = getSubtleCrypto();
      const rawKeyBuffer = await subtle.exportKey('raw', cachedSessionKey);
      const hexKey = Array.from(new Uint8Array(rawKeyBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      window.sessionStorage.setItem('wb_ifrap_aes_key', hexKey);
    } catch (err) {
      console.warn('[CryptoStorage] Could not persist session key:', err);
    }
  }

  return cachedSessionKey;
}

/**
 * Encrypts a JavaScript object using 256-bit AES-GCM with a random 12-byte IV.
 */
export async function encryptPayload<T>(
  data: T,
  key?: CryptoKey
): Promise<EncryptedEnvelope> {
  const subtle = getSubtleCrypto();
  const cryptoKey = key || (await getOrCreateSessionKey());

  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(jsonString);

  // Generate 12-byte IV for AES-GCM
  const iv = new Uint8Array(12);
  getRandomValues(iv);

  const encryptedBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cryptoKey,
    encodedData
  );

  // Convert ArrayBuffer and IV to Base64 strings
  const ciphertextBase64 = bufferToBase64(encryptedBuffer);
  const ivBase64 = bufferToBase64(iv.buffer);

  return {
    ciphertext: ciphertextBase64,
    iv: ivBase64,
    algorithm: 'AES-GCM-256',
    createdAt: Date.now(),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted envelope back to the original object.
 */
export async function decryptPayload<T>(
  envelope: EncryptedEnvelope | { ciphertext: string; iv: string },
  key?: CryptoKey
): Promise<T> {
  const subtle = getSubtleCrypto();
  const cryptoKey = key || (await getOrCreateSessionKey());

  const encryptedBuffer = base64ToBuffer(envelope.ciphertext);
  const ivBuffer = base64ToBuffer(envelope.iv);

  const decryptedBuffer = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer),
    },
    cryptoKey,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);

  return JSON.parse(jsonString) as T;
}

// Base64 helper functions
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

function base64ToBuffer(base64: string): ArrayBuffer {
  if (typeof atob !== 'undefined') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  const buf = Buffer.from(base64, 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
