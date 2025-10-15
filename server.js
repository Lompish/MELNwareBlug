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
const port = 3000


// SÄKERHET
// 

// HELMET - säkerhetsheaders
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

// CORS - tillåt frontenden
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}))

// BODY PARSING
app.use(express.json({ limit: '10kb', strict: true }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// COOKIE PARSER (för CSRF)
app.use(cookieParser())


// RATE LIMITERS
//

// För testning: vi sänker gränser rejält så det triggas snabbt
// Vanliga produktionsvärden anges i kommentarerna

// Generell limiter för alla API-anrop
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minut (prod: 15 min)
    max: 50, // prod: 200
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
})

// Strikt limiter för autentisering (login)
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minut (prod: 15 min)
    max: 5, // prod: 20
    message: "Too many login attempts, please try again later.",
    skipSuccessfulRequests: true,
})

// Limiter för registrering (POST users)
const registerLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 min (prod: 1 h)
    max: 5, // prod: 20
    message: "Too many accounts created from this IP, please try again later.",
})

// Unika limiters för att skapa innehåll (förhindrar att GET påverkas)
const createForumLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: "Too many forums created, please slow down.",
})

const createThreadLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: "Too many threads created, please slow down.",
})

const createPostLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: "Too many posts created, please slow down.",
})

const createModeratorLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: "Too many moderators added, please slow down.",
})

// Limiter för DELETE-operationer
const deleteLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 min (prod: 15 min)
    max: 5, // prod: 20
    message: "Too many delete operations, please try again later.",
})

// Limiter för PATCH/UPDATE-operationer
const updateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 min (prod: 15 min)
    max: 10, // prod: 30
    message: "Too many update operations, please try again later.",
})


// SESSION
// 
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


// LIMITER APPLICATION (nu används alla!)
// 
// Generell limiter på ALLA routes
app.use('/api', generalLimiter)

// Mer specifika limiter beroende på endpoint
app.use('/api/login', authLimiter)
app.use('/api/users', registerLimiter)

// Skapa innehåll – nu med separata instanser
app.post('/api/forums', createForumLimiter)
app.post('/api/threads', createThreadLimiter)
app.post('/api/posts', createPostLimiter)
app.post('/api/threads/:threadId/moderators', createModeratorLimiter)

// Delete operationer
app.delete('/api/forums/:id', deleteLimiter)
app.delete('/api/threads/:id', deleteLimiter)
app.delete('/api/threads/:forumId/:threadId', deleteLimiter)
app.delete('/api/posts/:id', deleteLimiter)
app.delete('/api/threads/:threadId/moderators/:userId', deleteLimiter)

// Update operationer
app.patch('/api/threads/:id', updateLimiter)
app.patch('/api/users/:id', updateLimiter)
app.patch('/api/forums/:id', updateLimiter)
app.patch('/api/posts/:id', updateLimiter)
app.patch('/api/threads/:threadId/transfer-ownership', updateLimiter)

// HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    })
})

// ACCESS CONTROL LIST
app.use('/api', acl)

// Registrera alla endpoints
apiRegister(app, database)

// Statisk frontend
app.use(express.static("./server/dist"))

// Starta servern
app.listen(port, () => {
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`Security features enabled: ACL, Rate Limiting, Helmet`)
    console.log(`http://localhost:${port}`)
})