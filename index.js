/**
 * index.js
 * Main application entry point
 */

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// ======================================
// DATABASE CONNECTION
// ======================================

const dbPath = path.join(__dirname, "database.db");
const schemaPath = path.join(__dirname, "db_schema.sql");

try {
    // Open or create the SQLite database
    global.db = new Database(dbPath);

    // Enable foreign keys
    global.db.pragma("foreign_keys = ON");

    console.log("✓ Database connected");

    // Check if the database has already been initialized
    const table = global.db
        .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='events';"
        )
        .get();

    if (!table) {
        console.log("Initializing database...");

        const schema = fs.readFileSync(schemaPath, "utf8");

        global.db.exec(schema);

        console.log("✓ Database initialized successfully.");
    } else {
        console.log("✓ Database already initialized.");
    }
} catch (error) {
    console.error("Database initialization failed:");
    console.error(error);
    process.exit(1);
}

// ======================================
// HOME PAGE
// ======================================

app.get("/", (req, res) => {
    res.render("home");
});

// ======================================
// ROUTES
// ======================================

const organiserRoutes = require("./routes/organiser");
app.use("/organiser", organiserRoutes);

const settingsRoutes = require("./routes/settings");
app.use("/settings", settingsRoutes);

const attendeeRoutes = require("./routes/attendee");
app.use("/attendee", attendeeRoutes);

// ======================================
// START SERVER
// ======================================

app.listen(port, () => {
    console.log(`✓ Event Manager running on port ${port}`);
});