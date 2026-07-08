/**
 * index.js
 * Main application entry point
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


// ======================================
// DATABASE CONNECTION
// ======================================

const sqlite3 = require('sqlite3').verbose();

global.db = new sqlite3.Database('./database.db', (err) => {

    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log("Database connected");

    global.db.run("PRAGMA foreign_keys=ON");
});


// ======================================
// HOME PAGE
// ======================================

/**
 * GET /
 *
 * Main landing page.
 * Displays links to organiser and attendee pages.
 */
app.get('/', (req, res) => {

    res.render('home');

});


// ======================================
// ROUTES
// ======================================

const organiserRoutes = require('./routes/organiser');
app.use('/organiser', organiserRoutes);

const settingsRoutes = require('./routes/settings');
app.use('/settings', settingsRoutes);

const attendeeRoutes = require('./routes/attendee');
app.use('/attendee', attendeeRoutes);


// ======================================
// START SERVER
// ======================================

app.listen(port, () => {

    console.log(`Event Manager running on port ${port}`);

});