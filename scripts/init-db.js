const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "database.db");
const schemaPath = path.join(__dirname, "..", "db_schema.sql");

try {
    // Open (or create) the database
    const db = new Database(dbPath);

    // Check whether the database has already been initialized
    const table = db
        .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='events';"
        )
        .get();

    if (table) {
        console.log("✓ Database already initialized.");
    } else {
        console.log("Initializing database...");

        const schema = fs.readFileSync(schemaPath, "utf8");

        // Execute the SQL schema
        db.exec(schema);

        console.log("✓ Database initialized successfully.");
    }

    db.close();
} catch (error) {
    console.error("Database initialization failed:");
    console.error(error);
    process.exit(1);
}