import crypto from 'crypto'

/**
 * Portfolio Token Encryption Utility
 *
 * Uses AES-256-GCM for encrypting/decrypting OAuth tokens and sensitive broker credentials.
 * Requires PORTFOLIO_ENCRYPTION_KEY environment variable (32 bytes hex).
 *
 * Security considerations:
 * - Never log decrypted tokens
 * - Tokens are encrypted at rest in database
 * - Uses authenticated encryption (GCM mode) to prevent tampering
 * - IV (Initialization Vector) is generated randomly for each encryption
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits authentication tag
const ENCODING = 'hex'

/**
 * Get encryption key from environment variable
 * Key must be 32 bytes (64 hex characters) for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.PORTFOLIO_ENCRYPTION_KEY

  if (!key) {
    throw new Error(
      'PORTFOLIO_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    )
  }

  if (key.length !== 64) {
    throw new Error(
      'PORTFOLIO_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ' +
      'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    )
  }

  return Buffer.from(key, ENCODING)
}

/**
 * Encrypt a token or sensitive string
 *
 * @param plaintext - The token or string to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (all hex encoded)
 *
 * @example
 * const encrypted = encryptToken('my_secret_access_token_123')
 * // Returns: "a1b2c3d4....:e5f6g7h8....:i9j0k1l2...."
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Token to encrypt must be a non-empty string')
  }

  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING)
    encrypted += cipher.final(ENCODING)

    const authTag = cipher.getAuthTag()

    // Format: iv:authTag:ciphertext
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`
  } catch (error) {
    console.error('Token encryption failed:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error('Failed to encrypt token')
  }
}

/**
 * Decrypt an encrypted token
 *
 * @param encryptedToken - Encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext token
 *
 * @example
 * const decrypted = decryptToken('a1b2c3d4....:e5f6g7h8....:i9j0k1l2....')
 * // Returns: "my_secret_access_token_123"
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken || typeof encryptedToken !== 'string') {
    throw new Error('Encrypted token must be a non-empty string')
  }

  try {
    const key = getEncryptionKey()

    // Parse the encrypted token format: iv:authTag:ciphertext
    const parts = encryptedToken.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format')
    }

    const [ivHex, authTagHex, encryptedHex] = parts

    const iv = Buffer.from(ivHex, ENCODING)
    const authTag = Buffer.from(authTagHex, ENCODING)
    const encrypted = Buffer.from(encryptedHex, ENCODING)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Token decryption failed:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error('Failed to decrypt token - token may be corrupted or key may be invalid')
  }
}

/**
 * Generate a new encryption key (utility function for setup)
 * This should be run once and the result stored in .env.local
 *
 * @returns 64-character hex string (32 bytes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString(ENCODING)
}

/**
 * Validate that encryption/decryption is working correctly
 * Useful for testing configuration
 */
export function testEncryption(): boolean {
  try {
    const testToken = 'test_token_' + Date.now()
    const encrypted = encryptToken(testToken)
    const decrypted = decryptToken(encrypted)
    return decrypted === testToken
  } catch (error) {
    console.error('Encryption test failed:', error)
    return false
  }
}
