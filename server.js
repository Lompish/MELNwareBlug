// Express - Används för att skapa ett rest-api.
import express from "express";
import mysql from "mysql2/promise";
import session from "express-session";
import 'dotenv/config';

import acl from "./api/acl.js";
import forum from "./api/endpointForum.js";
import rateLimit from "express-rate-limit";
//Import acl from "./api/acl.js";

// Database connection
const database = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

// Express server
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// ACL middleware
app.use(acl);
// En middleware som låter oss hantera json-data i våra request.
app.use(express.json())

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
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 timmar
    }
}))

// APPLICERA RATE LIMITERS
// Generell limiter på ALLA routes
app.use('/api', generalLimiter)

// Specifika limiters för olika endpoints
app.use('/api/login', authLimiter)              // POST login
app.use('/api/users', registerLimiter)          // POST users (registrering)

// Skapa innehåll
app.post('/api/forums', createContentLimiter)   // POST forum
app.post('/api/threads', createContentLimiter)  // POST thread

// Delete operationer
app.delete('/api/forums/:id', deleteLimiter)    // DELETE forum
app.delete('/api/threads/:id', deleteLimiter)   // DELETE thread

// Update operationer
app.patch('/api/threads/:id', updateLimiter)    // PATCH thread
app.patch('/api/users/:id', updateLimiter)      // PATCH user


// Access control list middleware
// app.use(acl)

// API routes
forum(app, "/api", database);

// Serve static frontend
app.use(express.static("./server/dist"));

// Start server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
// Registrerar alla våra endpoints i api-mappen.
apiRegister(app, database)

// Gör så att vi kan komma åt filerna i mappen "dist" (vår frontend).
app.use(express.static("./server/dist"))

// Startar servern när vi kör server.js-filen.
app.listen(port, () => { console.log(`http://localhost:${port}`) })
