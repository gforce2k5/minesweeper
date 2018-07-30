require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASEURL);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/game', (req, res) => {
  if (req.query.width < 5 || req.query.width > 50 ||
      req.query.height < 5 || req.query.height > 50) {
    return res.redirect('/');
  }
  if (req.query.mines < 5 || req.query.mines > 999 ||
      req.query.mines >= req.query.width * req.query.height) {
    return res.redirect('/');
  }
  res.render('game', {game: req.query});
});

app.listen(process.env.PORT, () => {
  console.log('Server running');
});
