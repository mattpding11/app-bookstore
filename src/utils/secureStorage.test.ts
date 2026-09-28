import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decryptValue, encryptValue } from './secureStorage'

// jsdom does not implement SubtleCrypto, so we stub a deterministic fake AES-GCM/PBKDF2
// implementation. This isolates the test from real cryptography and only verifies this
// module's own orchestration logic: envelope shape, base64 encoding, and JSON round-tripping.

let randomByteSeed = 0

function fakeGetRandomValues(array: ArrayBufferView): ArrayBufferView {
  const view = new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
  for (let i = 0; i < view.length; i += 1) {
    view[i] = (randomByteSeed + i) % 256
  }
  randomByteSeed += view.length
  return array
}

// Identity "encryption": returns the input bytes unchanged, so encrypt -> decrypt round-trips
async function identityTransform(
  _algorithm: { name: string; iv: Uint8Array },
  _key: unknown,
  data: ArrayBuffer | ArrayBufferView,
): Promise<ArrayBuffer> {
  const view = ArrayBuffer.isView(data)
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : new Uint8Array(data)
  return view.slice().buffer
}

const fakeSubtle = {
  // Typed via vi.fn's generic (not named params) so the mock.calls tuple type is correct
  // without unused parameter names tripping @typescript-eslint/no-unused-vars.
  importKey: vi.fn<
    (
      format: string,
      keyData: Uint8Array,
      algorithm: string,
      extractable: boolean,
      keyUsages: string[],
    ) => Promise<string>
  >(async () => 'fake-key-material'),
  deriveKey: vi.fn<
    (
      algorithm: { name: string; salt: Uint8Array; iterations: number; hash: string },
      baseKey: unknown,
      derivedKeyAlgorithm: unknown,
      extractable: boolean,
      keyUsages: string[],
    ) => Promise<string>
  >(async () => 'fake-derived-key'),
  encrypt: vi.fn(identityTransform),
  decrypt: vi.fn(identityTransform),
}

beforeEach(() => {
  randomByteSeed = 0
  fakeSubtle.importKey.mockClear()
  fakeSubtle.deriveKey.mockClear()
  fakeSubtle.encrypt.mockClear()
  fakeSubtle.decrypt.mockClear()

  vi.stubGlobal('crypto', {
    getRandomValues: vi.fn(fakeGetRandomValues),
    subtle: fakeSubtle,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('encryptValue / decryptValue', () => {
  it('round-trips a JSON-serializable value back to an equal value', async () => {
    const original = { reference: 'txn-123', total: 4500000, items: ['a', 'b'] }

    const encrypted = await encryptValue(original, 'super-secret-passphrase')
    const decrypted = await decryptValue<typeof original>(encrypted, 'super-secret-passphrase')

    expect(decrypted).toEqual(original)
  })

  it('returns an envelope with base64-encoded salt, iv, and data fields', async () => {
    const encrypted = await encryptValue({ hello: 'world' }, 'passphrase')
    const envelope = JSON.parse(encrypted) as { salt: string; iv: string; data: string }

    expect(typeof envelope.salt).toBe('string')
    expect(typeof envelope.iv).toBe('string')
    expect(typeof envelope.data).toBe('string')
    expect(() => atob(envelope.salt)).not.toThrow()
    expect(() => atob(envelope.iv)).not.toThrow()
    expect(() => atob(envelope.data)).not.toThrow()
  })

  it('derives the key with PBKDF2 (16-byte salt) and encrypts with AES-GCM (12-byte iv)', async () => {
    await encryptValue({ a: 1 }, 'passphrase')

    const [algorithm, keyData, keyFormat, extractable, usages] = fakeSubtle.importKey.mock.calls[0]
    expect(algorithm).toBe('raw')
    // Use ArrayBuffer.isView instead of `instanceof Uint8Array`: coverage instrumentation can run
    // modules in a different realm, where cross-realm `instanceof` checks on typed arrays fail
    // even though the value is a genuine Uint8Array.
    expect(ArrayBuffer.isView(keyData)).toBe(true)
    expect(keyData).toHaveLength('passphrase'.length)
    expect(keyFormat).toBe('PBKDF2')
    expect(extractable).toBe(false)
    expect(usages).toEqual(['deriveKey'])

    const [pbkdf2Params] = fakeSubtle.deriveKey.mock.calls[0]
    expect(pbkdf2Params.name).toBe('PBKDF2')
    expect(pbkdf2Params.salt).toHaveLength(16)
    expect(pbkdf2Params.iterations).toBe(100_000)
    expect(pbkdf2Params.hash).toBe('SHA-256')

    const [aesGcmParams] = fakeSubtle.encrypt.mock.calls[0]
    expect(aesGcmParams.name).toBe('AES-GCM')
    expect(aesGcmParams.iv).toHaveLength(12)
  })

  it('uses a different salt and iv on every call', async () => {
    const first = JSON.parse(await encryptValue({ a: 1 }, 'passphrase')) as { salt: string; iv: string }
    const second = JSON.parse(await encryptValue({ a: 1 }, 'passphrase')) as { salt: string; iv: string }

    expect(first.salt).not.toBe(second.salt)
    expect(first.iv).not.toBe(second.iv)
  })

  it('rejects when the stored payload is not valid JSON', async () => {
    await expect(decryptValue('not-json', 'passphrase')).rejects.toThrow()
  })
})
