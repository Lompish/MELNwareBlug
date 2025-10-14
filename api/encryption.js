import crypto from "crypto"
import 'dotenv/config'

// Generera ett unikt, slumpmässigt salt för varje användare
export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// Hash med användarspecifikt salt
export function hashWithSalt(password, userSalt) {
  const globalSalt = process.env.HASH_SALT; // Extra säkerhetslager (pepper)
  const combinedSalt = globalSalt + userSalt;
  return crypto.pbkdf2Sync(password, combinedSalt, 10000, 64, 'sha512').toString('hex');
}

// Backwards compatible: Gammal hash-funktion för befintliga användare
export default function hash(word) {
  const salt = process.env.HASH_SALT;
  return crypto.pbkdf2Sync(word, salt, 1000, 64, 'sha512').toString('hex');
}