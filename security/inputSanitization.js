import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

// Sanerar HTML

export function sanitizeHTML(dirty) {
  if (!dirty) return dirty

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Ingen HTML tillåts
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true // Behåll text men ta bort tags
  })
}
// Förhindra XSS
export function escapeHTML(text) {
  if (!text) return text

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

// Sanerar hela request.body
export function sanitizeRequestBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHTML(req.body[key])
      }
    }
  }
  next()
}

// Validerar och sanerar användarnamn
export function validateUsername(username) {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }

  // Ta bort whitespace
  username = username.trim()

  // Längd check
  if (username.length < 3 || username.length > 30) {
    return { valid: false, error: 'Username must be 3-30 characters' }
  }

  // Endast tillåtna tecken: bokstäver, siffror, understreck
  if (!/^[a-zA-Z0-9_åäöÅÄÖ]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers and underscore' }
  }

  return { valid: true, sanitized: sanitizeHTML(username) }
}

// Validerar email-format

export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }

  email = email.trim().toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

// Kontroll av maxlängd
  if (email.length > 254) {
    return { valid: false, error: 'Email too long' }
  }

  return { valid: true, sanitized: email }
}

// Validerar forum/thread-namn
export function validateName(name, type = 'name') {
  if (!name) {
    return { valid: false, error: `${type} is required` }
  }

  name = name.trim()

  if (name.length < 3 || name.length > 100) {
    return { valid: false, error: `${type} must be 3-100 characters` }
  }

  // Tillåt bokstäver, siffror, mellanslag och vissa specialtecken
  if (!/^[a-zA-Z0-9åäöÅÄÖ\s\-_.,!?]+$/.test(name)) {
    return { valid: false, error: `${type} contains invalid characters` }
  }

  return { valid: true, sanitized: sanitizeHTML(name) }
}

// Validerar beskrivningar
export function validateDescription(description, maxLength = 5000) {
  if (!description) {
    return { valid: true, sanitized: null }
  }

  description = description.trim()

  if (description.length > maxLength) {
    return { valid: false, error: `Description too long (max ${maxLength} characters)` }
  }

  return { valid: true, sanitized: sanitizeHTML(description) }
}
