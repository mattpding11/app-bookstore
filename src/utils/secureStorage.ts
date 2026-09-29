import CryptoJS from 'crypto-js';

export async function encryptValue(value: unknown, passphrase: string): Promise<string> {
  // CryptoJS serializa, genera el salt y cifra usando AES automáticamente
  const plaintext = JSON.stringify(value);
  const ciphertext = CryptoJS.AES.encrypt(plaintext, passphrase).toString();
  return ciphertext;
}

export async function decryptValue<T>(payload: string, passphrase: string): Promise<T> {
  // Descifra y convierte los bytes de vuelta a texto UTF-8
  const bytes = CryptoJS.AES.decrypt(payload, passphrase);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  
  if (!decryptedText) {
    throw new Error('Fallo al descifrar el payload. Verifica la passphrase.');
  }

  return JSON.parse(decryptedText) as T;
}