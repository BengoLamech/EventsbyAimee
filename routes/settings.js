/**
 * Site Settings Routes
 */

const express = require("express");
const router = express.Router();

// =========================================
// SETTINGS PAGE
// =========================================

/**
 * GET /settings
 *
 * Displays current site settings
 */
router.get("/", (req, res) => {
    try {
        const settings = global.db
            .prepare(`
                SELECT *
                FROM site_settings
                WHERE id = 1
            `)
            .get();

        res.render("settings", {
            settings,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// =========================================
// UPDATE SETTINGS
// =========================================

/**
 * POST /settings/update
 *
 * Updates site name and description
 */
router.post("/update", (req, res) => {
    try {
        const { site_name, site_description } = req.body;

        // Basic validation
        if (!site_name || !site_description) {
            return res.status(400).send("All fields are required.");
        }

        global.db
            .prepare(`
                UPDATE site_settings
                SET
                    site_name = ?,
                    site_description = ?
                WHERE id = 1
            `)
            .run(site_name, site_description);

        res.redirect("/organiser");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;