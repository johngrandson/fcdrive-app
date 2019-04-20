const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './config/.env' });
}

app.use(helmet())
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./features/auth/auth.routes')(app);
require('./features/user/user.routes')(app);
require('./features/sync/sync.routes')(app);

app.get('/authenticated', (req, res, next) => {
  return res.sendFile(__dirname + '/client/views/settings.html');
});

app.get('/unauthorized', (req, res, next) => {
  return res.sendFile(__dirname + '/client/views/unauthorized.html');
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`API Listening on port ${port}`));
