// NodeJS entry point for the app

const express = require('express');
const app = express();
const port = 7756;
const path = require ('path');

// Serving Static Files
app.use(express.static('assets'));

app.set("view engine", "ejs");
app.get('/', (req, res) => {
    res.render(path.join(__dirname + '/index'));
});

app.listen(port, () => {

});
