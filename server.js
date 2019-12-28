const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const db = require('./queries')
const { samples, publications } = require('./routes');

const port = process.env.PORT || 5000;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/data', db.getData);
app.use('/samples', samples);
app.use('/publications', publications);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));