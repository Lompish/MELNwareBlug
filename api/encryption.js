import crypto from "crypto"
import 'dotenv/config'

// Krypterings funktion
export default function hash(word) {
  const salt = process.env.HASH_SALT
  return crypto.pbkdf2Sync(word, salt, 1000, 64, `sha512`).toString(`hex`)
}