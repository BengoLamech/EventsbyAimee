/**
 * Attendee Routes
 */

const express = require("express");
const router = express.Router();

// =========================================
// ATTENDEE HOME PAGE
// =========================================

/**
 * GET /attendee
 *
 * Display all published events
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

        const events = global.db
            .prepare(`
                SELECT *
                FROM events
                WHERE status = 'published'
                ORDER BY event_date ASC
            `)
            .all();

        res.render("attendee-home", {
            settings,
            events,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// =========================================
// VIEW EVENT
// =========================================

/**
 * GET /attendee/event/:id
 *
 * Display event details and booking form
 */
router.get("/event/:id", (req, res) => {
    try {
        const eventId = req.params.id;

        const event = global.db
            .prepare(`
                SELECT *
                FROM events
                WHERE event_id = ?
                AND status = 'published'
            `)
            .get(eventId);

        if (!event) {
            return res.status(404).send("Event not found");
        }

        const bookingData = global.db
            .prepare(`
                SELECT
                    COALESCE(SUM(full_tickets),0) AS soldFull,
                    COALESCE(SUM(concession_tickets),0) AS soldConcession
                FROM bookings
                WHERE event_id = ?
            `)
            .get(eventId);

        const remainingFullTickets =
            event.full_ticket_qty - bookingData.soldFull;

        const remainingConcessionTickets =
            event.concession_ticket_qty - bookingData.soldConcession;

        res.render("attendee-event", {
            event,
            remainingFullTickets,
            remainingConcessionTickets,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// =========================================
// BOOK TICKETS
// =========================================

/**
 * POST /attendee/book/:id
 *
 * Create booking
 */
router.post("/book/:id", (req, res) => {
    try {
        const eventId = req.params.id;

        const attendee_name = req.body.attendee_name?.trim();

        const full_tickets = parseInt(req.body.full_tickets) || 0;

        const concession_tickets =
            parseInt(req.body.concession_tickets) || 0;

        // Validation

        if (!attendee_name) {
            return res.send("Please enter your name.");
        }

        if (full_tickets === 0 && concession_tickets === 0) {
            return res.send("Please select at least one ticket.");
        }

        // Get event

        const event = global.db
            .prepare(`
                SELECT *
                FROM events
                WHERE event_id = ?
            `)
            .get(eventId);

        if (!event) {
            return res.send("Event not found.");
        }

        // Calculate sold tickets

        const bookingData = global.db
            .prepare(`
                SELECT
                    COALESCE(SUM(full_tickets),0) AS soldFull,
                    COALESCE(SUM(concession_tickets),0) AS soldConcession
                FROM bookings
                WHERE event_id = ?
            `)
            .get(eventId);

        const remainingFullTickets =
            event.full_ticket_qty - bookingData.soldFull;

        const remainingConcessionTickets =
            event.concession_ticket_qty -
            bookingData.soldConcession;

        // Prevent overbooking

        if (full_tickets > remainingFullTickets) {
            return res.send(
                "Not enough full-price tickets available."
            );
        }

        if (concession_tickets > remainingConcessionTickets) {
            return res.send(
                "Not enough concession tickets available."
            );
        }

        // Save booking

        global.db
            .prepare(`
                INSERT INTO bookings (
                    event_id,
                    attendee_name,
                    full_tickets,
                    concession_tickets
                )
                VALUES (?, ?, ?, ?)
            `)
            .run(
                eventId,
                attendee_name,
                full_tickets,
                concession_tickets
            );

        res.redirect(`/attendee/event/${eventId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;