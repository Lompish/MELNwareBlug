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
// import csrf from 'csurf';


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
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
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
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}))

// BODY PARSING med storleksbegränsning
app.use(express.json({
    limit: '10kb',
    strict: true
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
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
})

// STRIKT limiter för autentisering (login)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many login attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true,
})

// Limiter för registrering (POST users)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many accounts created from this IP, please try again later.",
})

// Limiter för att skapa innehåll (POST threads, forums)
const createContentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many posts created, please slow down.",
})

// Limiter för DELETE operationer
const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many delete operations, please try again later.",
})

// Limiter för PATCH/UPDATE operationer
const updateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many update operations, please try again later.",
})

// SESSION
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    },
    rolling: true,
    proxy: process.env.NODE_ENV === 'production'
}))

// CSRF PROTECTION - KOMMENTERAD FÖR UTVECKLING
// const csrfProtection = csrf({ cookie: true })

// app.get('/api/csrf-token', csrfProtection, (req, res) => {
//     res.json({ csrfToken: req.csrfToken() })
// })


// APPLICERA RATE LIMITERS
// Generell limiter på ALLA routes
app.use('/api', generalLimiter)

// Specifika limiters för olika endpoints
app.use('/api/login', authLimiter)
app.use('/api/users', registerLimiter)

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
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`Security features enabled: ACL, Rate Limiting, Helmet`)
    console.log(`http://localhost:${port}`)
})