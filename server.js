// express - Används för att skapa ett rest-api.
import express from "express";
import mysql from "mysql2/promise";
import session from "express-session";
import 'dotenv/config';

import acl from "./api/acl.js";
import forum from "./api/endpointForum.js";

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

// API routes
forum(app, "/api", database);

// Serve static frontend
app.use(express.static("./server/dist"));

// Start server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
