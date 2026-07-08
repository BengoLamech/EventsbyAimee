/**
 * Attendee Routes
 */

const express = require('express');
const router = express.Router();


// =========================================
// ATTENDEE HOME PAGE
// =========================================

/**
 * GET /attendee
 *
 * Display all published events
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

            db.all(
                `
                SELECT *
                FROM events
                WHERE status = 'published'
                ORDER BY event_date ASC
                `,
                [],
                (err, events) => {

                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    res.render(
                        'attendee-home',
                        {
                            settings,
                            events
                        }
                    );

                }
            );

        }
    );

});


// =========================================
// VIEW EVENT
// =========================================

/**
 * GET /attendee/event/:id
 *
 * Display event details and booking form
 */
router.get('/event/:id', (req, res) => {

    const eventId = req.params.id;

    db.get(
        `
        SELECT *
        FROM events
        WHERE event_id = ?
        AND status = 'published'
        `,
        [eventId],
        (err, event) => {

            if (err) {
                return res.status(500).send(err.message);
            }

            if (!event) {
                return res.status(404).send(
                    "Event not found"
                );
            }

            db.get(
                `
                SELECT
                    COALESCE(SUM(full_tickets),0) as soldFull,
                    COALESCE(SUM(concession_tickets),0) as soldConcession
                FROM bookings
                WHERE event_id = ?
                `,
                [eventId],
                (err, bookingData) => {

                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    const remainingFullTickets =
                        event.full_ticket_qty -
                        bookingData.soldFull;

                    const remainingConcessionTickets =
                        event.concession_ticket_qty -
                        bookingData.soldConcession;

                    res.render(
                        'attendee-event',
                        {
                            event,
                            remainingFullTickets,
                            remainingConcessionTickets
                        }
                    );

                }
            );

        }
    );

});


// =========================================
// BOOK TICKETS
// =========================================

/**
 * POST /attendee/book/:id
 *
 * Create booking
 */
router.post('/book/:id', (req, res) => {

    const eventId = req.params.id;

    const attendee_name =
        req.body.attendee_name?.trim();

    const full_tickets =
        parseInt(req.body.full_tickets) || 0;

    const concession_tickets =
        parseInt(req.body.concession_tickets) || 0;

    // Validation

    if (!attendee_name) {

        return res.send(
            "Please enter your name."
        );

    }

    if (
        full_tickets === 0 &&
        concession_tickets === 0
    ) {

        return res.send(
            "Please select at least one ticket."
        );

    }

    // Get event

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

                return res.send(
                    "Event not found."
                );

            }

            // Calculate sold tickets

            db.get(
                `
                SELECT
                    COALESCE(SUM(full_tickets),0) as soldFull,
                    COALESCE(SUM(concession_tickets),0) as soldConcession
                FROM bookings
                WHERE event_id = ?
                `,
                [eventId],
                (err, bookingData) => {

                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    const remainingFullTickets =
                        event.full_ticket_qty -
                        bookingData.soldFull;

                    const remainingConcessionTickets =
                        event.concession_ticket_qty -
                        bookingData.soldConcession;

                    // Prevent overbooking

                    if (
                        full_tickets >
                        remainingFullTickets
                    ) {

                        return res.send(
                            "Not enough full-price tickets available."
                        );

                    }

                    if (
                        concession_tickets >
                        remainingConcessionTickets
                    ) {

                        return res.send(
                            "Not enough concession tickets available."
                        );

                    }

                    // Save booking

                    db.run(
                        `
                        INSERT INTO bookings (
                            event_id,
                            attendee_name,
                            full_tickets,
                            concession_tickets
                        )
                        VALUES (?, ?, ?, ?)
                        `,
                        [
                            eventId,
                            attendee_name,
                            full_tickets,
                            concession_tickets
                        ],
                        function(err){

                            if(err){
                                return res.status(500)
                                    .send(err.message);
                            }

                            res.redirect(
                                `/attendee/event/${eventId}`
                            );

                        }
                    );

                }
            );

        }
    );

});


module.exports = router;