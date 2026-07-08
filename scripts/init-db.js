const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "database.db");
const schemaPath = path.join(__dirname, "..", "db_schema.sql");

const initializeDatabase = () => {
    const schema = fs.readFileSync(schemaPath, "utf8");

    db.exec(schema, (err) => {
        if (err) {
            console.error("Database initialization failed:", err.message);
            process.exit(1);
        }

        console.log("✓ Database initialized successfully.");
        db.close();
    });
};

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }

    db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='events';",
        (err, row) => {
            if (err) {
                console.error(err.message);
                process.exit(1);
            }

            if (row) {
                console.log("✓ Database already initialized.");
                db.close();
            } else {
                console.log("Initializing database...");
                initializeDatabase();
            }
        }
    );
});