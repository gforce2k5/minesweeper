require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));

mongoose.connect('mongodb://localhost:27017');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/game', (req, res) => {
  res.render('game', {game: req.query});
});

app.listen(3000, () => {
  console.log('Server running');
});
