/**
 * Site Settings Routes
 */

const express = require('express');
const router = express.Router();


// =========================================
// SETTINGS PAGE
// =========================================

/**
 * GET /settings
 *
 * Displays current site settings
 */
router.get('/', (req, res) => {

    db.get(
        `
        SELECT *
        FROM site_settings
        WHERE id = 1
        `,
        [],
        (err, settings) => {

            if (err) {
                return res.status(500).send(err.message);
            }

            res.render('settings', {
                settings
            });

        }
    );
});


// =========================================
// UPDATE SETTINGS
// =========================================

/**
 * POST /settings/update
 *
 * Updates site name and description
 */
router.post('/update', (req, res) => {

    const {
        site_name,
        site_description
    } = req.body;

    // Basic validation
    if (!site_name || !site_description) {

        return res.status(400).send(
            "All fields are required."
        );

    }

    db.run(
        `
        UPDATE site_settings
        SET
            site_name = ?,
            site_description = ?
        WHERE id = 1
        `,
        [
            site_name,
            site_description
        ],
        function (err) {

            if (err) {
                return res.status(500).send(err.message);
            }

            res.redirect('/organiser');

        }
    );
});


module.exports = router;