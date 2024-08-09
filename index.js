const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});