/**
 * Organiser Routes
 */

const express = require("express");
const router = express.Router();

// ==================================================
// ORGANISER HOME PAGE
// ==================================================

/**
 * GET /organiser
 *
 * Displays:
 * - Site settings
 * - Draft events
 * - Published events
 */
router.get("/", (req, res) => {
    try {
        const settings = global.db
            .prepare("SELECT * FROM site_settings WHERE id = 1")
            .get();

        const publishedEvents = global.db
            .prepare(`
                SELECT *
                FROM events
                WHERE status = 'published'
                ORDER BY event_date ASC
            `)
            .all();

        const draftEvents = global.db
            .prepare(`
                SELECT *
                FROM events
                WHERE status = 'draft'
                ORDER BY created_at DESC
            `)
            .all();

        res.render("organiser-home", {
            settings,
            publishedEvents,
            draftEvents,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ==================================================
// CREATE NEW EVENT
// ==================================================

/**
 * POST /organiser/create
 *
 * Creates a blank draft event
 */
router.post("/create", (req, res) => {
    try {
        const result = global.db
            .prepare(`
                INSERT INTO events (
                    title,
                    description,
                    event_date,
                    full_ticket_qty,
                    full_ticket_price,
                    concession_ticket_qty,
                    concession_ticket_price,
                    status
                )
                VALUES (
                    'New Event',
                    'Enter event description',
                    DATE('now'),
                    0,
                    0,
                    0,
                    0,
                    'draft'
                )
            `)
            .run();

        res.redirect(`/organiser/event/${result.lastInsertRowid}`);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ==================================================
// EDIT EVENT PAGE
// ==================================================

/**
 * GET /organiser/event/:id
 *
 * Displays event editor
 */
router.get("/event/:id", (req, res) => {
    try {
        const eventId = req.params.id;

        const event = global.db
            .prepare(`
                SELECT *
                FROM events
                WHERE event_id = ?
            `)
            .get(eventId);

        if (!event) {
            return res.status(404).send("Event not found");
        }

        res.render("organiser-edit-event", { event });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ==================================================
// SAVE EVENT CHANGES
// ==================================================

/**
 * POST /organiser/event/:id
 *
 * Updates event details
 */
router.post("/event/:id", (req, res) => {
    try {
        const eventId = req.params.id;

        const {
            title,
            description,
            event_date,
            full_ticket_qty,
            full_ticket_price,
            concession_ticket_qty,
            concession_ticket_price,
        } = req.body;

        global.db
            .prepare(`
                UPDATE events
                SET
                    title = ?,
                    description = ?,
                    event_date = ?,
                    full_ticket_qty = ?,
                    full_ticket_price = ?,
                    concession_ticket_qty = ?,
                    concession_ticket_price = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE event_id = ?
            `)
            .run(
                title,
                description,
                event_date,
                full_ticket_qty,
                full_ticket_price,
                concession_ticket_qty,
                concession_ticket_price,
                eventId
            );

        res.redirect("/organiser");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ==================================================
// PUBLISH EVENT
// ==================================================

/**
 * POST /organiser/publish/:id
 *
 * Changes draft to published
 */
router.post("/publish/:id", (req, res) => {
    try {
        const eventId = req.params.id;

        global.db
            .prepare(`
                UPDATE events
                SET
                    status = 'published',
                    published_at = CURRENT_TIMESTAMP
                WHERE event_id = ?
            `)
            .run(eventId);

        res.redirect("/organiser");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ==================================================
// DELETE EVENT
// ==================================================

/**
 * POST /organiser/delete/:id
 *
 * Removes event from database
 */
router.post("/delete/:id", (req, res) => {
    try {
        const eventId = req.params.id;

        global.db
            .prepare(`
                DELETE FROM events
                WHERE event_id = ?
            `)
            .run(eventId);

        res.redirect("/organiser");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;