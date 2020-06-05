const path = require('path');
const express = require('express');

const app = express();
const bodyParser = require('body-parser');

// const fetch = require('node-fetch');
// const db = require('./queries')

const { samples, publications } = require('./routes');

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, 'client/build')));

// app.get('/data', db.getData);
app.use('/samples', samples);
app.use('/publications', publications); // http://localhost:3000/visualization/c91952a9b48f32a8f26a.worker.js

// WORKER_SCRIPTS = {}

// // check express docs for how to do something like /{hash}.worker.js
// app.get('/visualization/:hash.worker.js', (req, res) => {
//   /**
//    * 1. Fetch the real worker.js file from http://target.wustl.edu/dli/eg/c91952a9b48f32a8f26a.worker.js
//    * 2. Save the fetched contents in WORKER_SCRIPTS[hash], https://www.npmjs.com/package/node-fetch
//    * 3. Return WORKER_SCRIPTS[hash], see res.sendFile docs or google "express send string as file"
//    */
//   if (WORKER_SCRIPTS[req.params.hash]) {
//     res.type('.js');
//     return res.send(WORKER_SCRIPTS[req.params.hash]);
//   }

//    fetch('http://target.wustl.edu/dli/eg/' + req.params.hash + '.worker.js')
//       .then(res => res.text())
//       .then(text => {
//         WORKER_SCRIPTS = {
//           [req.params.hash]: text,
//         }
//         res.type('.js');
//         res.send(WORKER_SCRIPTS[req.params.hash]);
//       });
// })

app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));
