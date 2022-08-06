require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const userRoute = require('./routes/user');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(userRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}!`));
