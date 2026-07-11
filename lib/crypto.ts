/** Payment details encrypted client-side; never sent to the server in plaintext. */
export type PaymentDetails = {
  /** PayPal email, @username, or paypal.me link */
  paypal?: string;
  iban?: string;
};

export type EncryptedPayment = {
  payment_enc: string;
  payment_iv: string;
  payment_salt: string;
  kdf_iterations: number;
};

export const DEFAULT_KDF_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is not available");
  }
  return subtle;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function copyBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(bytes);
}

async function deriveAesKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: copyBytes(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPaymentDetails(
  password: string,
  details: PaymentDetails,
  iterations = DEFAULT_KDF_ITERATIONS,
): Promise<EncryptedPayment> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveAesKey(password, salt, iterations);
  const plaintext = new TextEncoder().encode(JSON.stringify(details));

  const ciphertext = await getSubtle().encrypt(
    { name: "AES-GCM", iv: copyBytes(iv) },
    key,
    plaintext,
  );

  return {
    payment_enc: bytesToBase64(new Uint8Array(ciphertext)),
    payment_iv: bytesToBase64(iv),
    payment_salt: bytesToBase64(salt),
    kdf_iterations: iterations,
  };
}

export async function decryptPaymentDetails(
  password: string,
  ciphertext: string,
  iv: string,
  salt: string,
  iterations: number,
): Promise<PaymentDetails> {
  const key = await deriveAesKey(password, base64ToBytes(salt), iterations);
  const decrypted = await getSubtle().decrypt(
    {
      name: "AES-GCM",
      iv: copyBytes(base64ToBytes(iv)),
    },
    key,
    copyBytes(base64ToBytes(ciphertext)),
  );

  return JSON.parse(new TextDecoder().decode(decrypted)) as PaymentDetails;
}
