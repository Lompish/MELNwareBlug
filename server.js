// express - Används för att skapa ett rest-api.
import express from "express";
import mysql from 'mysql2/promise';
import session from "express-session";
import apiRegister from "./api/apiRegister.js";
import 'dotenv/config';
//import acl from "./api/acl.js";


// Databas konfiguration.
const database = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
})

// Skapar ett express-objekt.
const app = express()
// Vilken port vi ska lägga servern på.
const port = 3000

// En middleware som låter oss hantera json-data i våra request.
app.use(express.json())

//Lägger till session i vårt rest-api.
// lägg till i env + salt, saltprocessen inte är en hårdkodad textfil
// man kan bygga en process som gör att saltet blir unikt för varje användare
// börja med att lägga in saltet i env!
// vi vill helst inte ha ett statiskt salt
app.use(session({
    secret: process.env.SESSION_SECRET, // hemlighet som används för att signera session id cookien i webbläsaren 
    resave: false,
    saveUninitialized: true
}))

// access control list middleware
//app.use(acl)


// Registrerar alla våra endpoints i api-mappen.
apiRegister(app, database)
// Gör så att vi kan komma åt filerna i mappen "dist" (vår frontend).

app.use(express.static("./server/dist"))

// Startar servern när vi kör server.js-filen.
app.listen(port, () => { console.log(`http://localhost:${port}`) })
