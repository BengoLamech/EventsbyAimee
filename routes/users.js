/**
 * users.js
 * Example routes using better-sqlite3
 */

const express = require("express");
const router = express.Router();

/**
 * @desc Display all users
 */
router.get("/list-users", (req, res, next) => {
    try {
        const users = global.db
            .prepare("SELECT * FROM users")
            .all();

        res.json(users);
    } catch (err) {
        next(err);
    }
});

/**
 * @desc Display form to create a user
 */
router.get("/add-user", (req, res) => {
    res.render("add-user.ejs");
});

/**
 * @desc Insert a new user
 */
router.post("/add-user", (req, res, next) => {
    try {
        const result = global.db
            .prepare(`
                INSERT INTO users (user_name)
                VALUES (?)
            `)
            .run(req.body.user_name);

        res.send(`New data inserted @ id ${result.lastInsertRowid}!`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;