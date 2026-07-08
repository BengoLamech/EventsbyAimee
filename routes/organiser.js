/**
 * Organiser Routes
 */

const express = require('express');
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
router.get('/', (req, res) => {

    // Get site settings
    db.get(
        `SELECT * FROM site_settings WHERE id = 1`,
        [],
        (err, settings) => {

            if (err) {
                return res.status(500).send(err.message);
            }

            // Get published events
            db.all(
                `SELECT * FROM events
                 WHERE status='published'
                 ORDER BY event_date ASC`,
                [],
                (err, publishedEvents) => {

                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    // Get draft events
                    db.all(
                        `SELECT * FROM events
                         WHERE status='draft'
                         ORDER BY created_at DESC`,
                        [],
                        (err, draftEvents) => {

                            if (err) {
                                return res.status(500).send(err.message);
                            }

                            res.render('organiser-home', {
                                settings,
                                publishedEvents,
                                draftEvents
                            });

                        }
                    );
                }
            );
        }
    );
});


// ==================================================
// CREATE NEW EVENT
// ==================================================

/**
 * POST /organiser/create
 *
 * Creates a blank draft event
 */
router.post('/create', (req, res) => {

    db.run(
        `
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
        `,
        function (err) {

            if (err) {
                return res.status(500).send(err.message);
            }

            res.redirect(
                `/organiser/event/${this.lastID}`
            );
        }
    );
});


// ==================================================
// EDIT EVENT PAGE
// ==================================================

/**
 * GET /organiser/event/:id
 *
 * Displays event editor
 */
router.get('/event/:id', (req, res) => {

    const eventId = req.params.id;

    db.get(
        `
        SELECT *
        FROM events
        WHERE event_id = ?
        `,
        [eventId],
        (err, event) => {

            if (err) {
                return res.status(500).send(err.message);
            }

            if (!event) {
                return res.status(404).send("Event not found");
            }

            res.render(
                'organiser-edit-event',
                { event }
            );
        }
    );
});


// ==================================================
// SAVE EVENT CHANGES
// ==================================================

/**
 * POST /organiser/event/:id
 *
 * Updates event details
 */
router.post('/event/:id', (req, res) => {

    const eventId = req.params.id;

    const {
        title,
        description,
        event_date,
        full_ticket_qty,
        full_ticket_price,
        concession_ticket_qty,
        concession_ticket_price
    } = req.body;

    db.run(
        `
        UPDATE events
        SET
            title=?,
            description=?,
            event_date=?,
            full_ticket_qty=?,
            full_ticket_price=?,
            concession_ticket_qty=?,
            concession_ticket_price=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE event_id=?
        `,
        [
            title,
            description,
            event_date,
            full_ticket_qty,
            full_ticket_price,
            concession_ticket_qty,
            concession_ticket_price,
            eventId
        ],
        function (err) {

            if (err) {
                return res.status(500).send(err.message);
            }

            res.redirect('/organiser');
        }
    );
});


// ==================================================
// PUBLISH EVENT
// ==================================================

/**
 * POST /organiser/publish/:id
 *
 * Changes draft to published
 */
router.post('/publish/:id', (req, res) => {

    const eventId = req.params.id;

    db.run(
        `
        UPDATE events
        SET
            status='published',
            published_at=CURRENT_TIMESTAMP
        WHERE event_id=?
        `,
        [eventId],
        function (err) {

            if (err) {
                return res.status(500).send(err.message);
            }

            res.redirect('/organiser');
        }
    );
});


// ==================================================
// DELETE EVENT
// ==================================================

/**
 * POST /organiser/delete/:id
 *
 * Removes event from database
 */
router.post('/delete/:id', (req, res) => {

    const eventId = req.params.id;

    db.run(
        `
        DELETE FROM events
        WHERE event_id=?
        `,
        [eventId],
        function (err) {

            if (err) {
                return res.status(500).send(err.message);
            }

            res.redirect('/organiser');
        }
    );
});


module.exports = router;