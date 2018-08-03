require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Game = require('./models/game');

mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true});

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
  let difficulty;
  if (req.query.width === '9' && req.query.height === '9' &&
      req.query.mines === '10') {
    difficulty = 'easy';
  } else if (req.query.width === '16' && req.query.height === '16' &&
      req.query.mines === '40') {
    difficulty = 'medium';
  } else if (req.query.width === '30' && req.query.height === '16' &&
      req.query.mines === '99') {
    difficulty = 'hard';
  }
  if (difficulty) {
    Game.create({difficulty: difficulty, ip: req.ip})
    .then((newGame) => {
      res.render('game', {game: req.query, id: newGame.id});
    })
    .catch();
  }
});

app.post('/game/new/:id', (req, res) => {
  Game.findById(req.params.id)
  .then((foundGame) => {
    if (foundGame.ip === req.ip) {
      if (!foundGame.state) {
        foundGame.start = new Date();
        foundGame.state = 1;
        foundGame.save();
      }
    }
  })
  .catch();
});

app.post('/game/score/:id', (req, res) => {
  Game.findById(req.params.id)
  .then((foundGame) => {
    if (foundGame.ip === req.ip && foundGame.state === 2) {
      // TODO
    }
  })
  .catch();
});

app.listen(process.env.PORT, () => {
  console.log('Server running');
});
