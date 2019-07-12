const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const db = require ('./queries')
const port = process.env.PORT || 5000;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
//app.get('/express', (req, res) => {
//  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
//});

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)


app.get('/data', db.getData)
app.get('/publications', db.getPublications)