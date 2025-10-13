// Express - Används för att skapa ett rest-api.
import express from "express";
import mysql from 'mysql2/promise';
import session from "express-session";
import apiRegister from "./api/apiRegister.js";
import 'dotenv/config';
import rateLimit from "express-rate-limit";
import acl from "./api/acl.js";

// Nya säkerhetsimporter
import helmet from "helmet";
import cors from "cors";
import cookieParser from 'cookie-parser';
import csrf from 'csurf';


// Databas konfiguration.
const database = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
})

// Testa databasuppkoppling
try {
    await database.ping()
    console.log('Database connected successfully')
} catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
}

// Skapar ett express-objekt.
const app = express()
// Vilken port vi ska lägga servern på.
const port = 3000

// Säkerhets-middleware
// HELMET - Säkerhetsheaders
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // ingen inline förhindrar XSS
            scriptSrc: ["'self'"], // ladda bara js från egen server
            imgSrc: ["'self'", "data:", "https:"], // ladda bara bilder från egen serber
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}))

// CORS - Kontrollera vilka domäner som får göra requests
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Tillåt cookies
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}))

// BODY PARSING med storleksbegränsning
app.use(express.json({
    limit: '10kb', // Begränsa request body storlek
    strict: true   // Acceptera bara arrays och objects
}))

// URL encoded body parsing
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))

// COOKIE PARSER(för CSRF)
app.use(cookieParser())

// RATE LIMITERS
// Generell limiter för alla API-anrop
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuter
    max: 200, // 200 requests per IP (höjt från 100)
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
})

// STRIKT limiter för autentisering (login)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuter
    max: 20, // Max 5 login-försök
    message: "Too many login attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true,
})

// Limiter för registrering (POST users)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 timme
    max: 20, // Max 3 nya användare per timme
    message: "Too many accounts created from this IP, please try again later.",
})

// Limiter för att skapa innehåll (POST threads, forums)
const createContentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 timme
    max: 20, // Max 20 nya threads/forums per timme
    message: "Too many posts created, please slow down.",
})

// Limiter för DELETE operationer
const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuter
    max: 20, // Max 10 deletions per 15 min
    message: "Too many delete operations, please try again later.",
})

// Limiter för PATCH/UPDATE operationer
const updateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuter
    max: 30, // Max 30 updates per 15 min
    message: "Too many update operations, please try again later.",
})

// SESSION
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Säkrare än true
    name: 'sid', // Generic name istället för default
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 timmar
        sameSite: 'strict' // CSRF protection
    },
    rolling: true, // Förnya cookie vid varje request
    proxy: process.env.NODE_ENV === 'production' // Trust proxy i production
}))

// CSRF PROTECTION
const csrfProtection = csrf({ cookie: true })

// Endpoint för att få CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})


// APPLICERA RATE LIMITERS + CSRF
// Generell limiter på ALLA routes
app.use('/api', generalLimiter)

// Specifika limiters för olika endpoints
app.use('/api/login', authLimiter)              // POST login
app.use('/api/users', registerLimiter)          // POST users (registrering)

// Skapa innehåll
app.post('/api/forums', csrfProtection, createContentLimiter)   // POST forum
app.post('/api/threads', csrfProtection, createContentLimiter)  // POST thread
app.post('/api/posts', csrfProtection, createContentLimiter) // POST post
app.post('/api/threads/:threadId/moderators', csrfProtection, createContentLimiter) // POST thread moderator

// Delete operationer
app.delete('/api/forums/:id', csrfProtection, deleteLimiter)    // DELETE forum
app.delete('/api/threads/:id', csrfProtection, deleteLimiter)   // DELETE thread
app.delete('/api/threads/:forumId/:threadId', csrfProtection, deleteLimiter)
app.delete('/api/posts/:id', csrfProtection, deleteLimiter) // DELETE post
app.delete('/api/threads/:threadId/moderators/:userId', csrfProtection, deleteLimiter) // DELETE moderator

// Update operationer
app.patch('/api/threads/:id', csrfProtection, updateLimiter)    // PATCH thread
app.patch('/api/users/:id', csrfProtection, updateLimiter)      // PATCH user
app.patch('/api/forums/:id', csrfProtection, updateLimiter)
app.patch('/api/posts/:id', csrfProtection, updateLimiter) // PATCH post
app.patch('/api/threads/:threadId/transfer-ownership', csrfProtection, updateLimiter) // PATCH thread owner

// HEALTH CHECK (SERVER)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    })
})

// ACCESS CONTROL LIST
app.use('/api', acl)

// Registrerar alla våra endpoints i api-mappen.
apiRegister(app, database)

// Gör så att vi kan komma åt filerna i mappen "dist" (vår frontend).
app.use(express.static("./server/dist"))

// Startar servern när vi kör server.js-filen.
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
        console.log(`Security features enabled: ACL, Rate Limiting, CSRF, Helmet`)
    })
