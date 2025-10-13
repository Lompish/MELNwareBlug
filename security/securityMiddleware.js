// security/securityHeaders.js
import helmet from 'helmet'

// Konfigurerar säkerhetsheaders med helmet
export function setupSecurityHeaders(app) {
  // Helmet sätter många säkerhetsheaders automatiskt
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tillåt inline styles (kan begränsas mer)
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 år
      includeSubDomains: true,
      preload: true
    },
    noSniff: true, // X-Content-Type-Options: nosniff
    xssFilter: true, // X-XSS-Protection: 1; mode=block
    referrerPolicy: { policy: 'same-origin' }
  }))

  // Lägg till extra säkerhetsheaders
  app.use((req, res, next) => {
    // Förhindra clickjacking
    res.setHeader('X-Frame-Options', 'DENY')

    // Förhindra MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // Permissions Policy (tidigare Feature Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    next()
  })
}

// security/errorHandler.js
import winston from 'winston'

// Logger konfiguration
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Logga errors till fil
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Logga allt till combined fil
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
})

// I development, logga även till konsolen
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// Centralized error handler middleware
export function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.session?.user?.id,
    body: req.body,
    params: req.params,
    query: req.query
  })

  // Skicka generiskt error message till klient för att dölja känslig info)
  const statusCode = err.statusCode || 500

  // I development, skicka mer detaljer
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      message: err.message || 'Internal server error',
      stack: err.stack,
      error: err
    })
  }

  // I production, skicka bara generiska meddelanden
  res.status(statusCode).json({
    message: statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'An error occurred'
  })
}

// 404 handler
export function notFoundHandler(req, res) {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  })

  res.status(404).json({
    message: 'Route not found'
  })
}

// Async error wrapper - fångar errors i async route handlers
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// security/requestLogger.js
import { logger } from './errorHandler.js'

// Loggar alla requests
export function requestLogger(req, res, next) {
  const start = Date.now()

  // Logga när response är klar
  res.on('finish', () => {
    const duration = Date.now() - start

    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.session?.user?.id
    })
  })

  next()
}

// Loggar säkerhetsrelevanta events
export function logSecurityEvent(type, details, req) {
  logger.warn('Security event', {
    type,
    details,
    ip: req.ip,
    path: req.path,
    userId: req.session?.user?.id,
    timestamp: new Date().toISOString()
  })
}
