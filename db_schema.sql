PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

--------------------------------------------------
-- SITE SETTINGS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY,

    site_name TEXT NOT NULL,
    site_description TEXT NOT NULL
);

--------------------------------------------------
-- EVENTS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,
    description TEXT NOT NULL,

    event_date TEXT NOT NULL,

    full_ticket_qty INTEGER NOT NULL DEFAULT 0,
    full_ticket_price REAL NOT NULL DEFAULT 0,

    concession_ticket_qty INTEGER NOT NULL DEFAULT 0,
    concession_ticket_price REAL NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'draft',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    published_at DATETIME
);

--------------------------------------------------
-- BOOKINGS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_id INTEGER NOT NULL,

    attendee_name TEXT NOT NULL,

    full_tickets INTEGER DEFAULT 0,
    concession_tickets INTEGER DEFAULT 0,

    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(event_id)
    REFERENCES events(event_id)
    ON DELETE CASCADE
);

--------------------------------------------------
-- DEFAULT SITE SETTINGS
--------------------------------------------------

INSERT INTO site_settings (
    id,
    site_name,
    site_description
)
VALUES (
    1,
    'Event Manager',
    'Manage and book events online'
);

--------------------------------------------------
-- SAMPLE DRAFT EVENTS
--------------------------------------------------

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
VALUES
(
    'Morning Yoga Session',
    'Yoga class suitable for beginners',
    '2026-07-01',
    20,
    15.00,
    10,
    10.00,
    'draft'
),
(
    'Art Gallery Talk',
    'Discussion of modern artwork',
    '2026-07-15',
    30,
    20.00,
    15,
    12.00,
    'draft'
);

COMMIT;