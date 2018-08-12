require('dotenv').config();
let mongoose = require('mongoose');
let Game = require('./models/game');
let Score = require('./models/score');

mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true});

Game.deleteMany({state: 0}).where('start').lt(Date.now() - 24 * 60 * 60 * 1000)
.then(() => {
  return Game.deleteMany({state: 1}).where('start').lt(Date.now() -
    24 * 60 * 60 * 1000);
})
.then(() => {
  return Game.deleteMany({state: 3}).where('start').lt(Date.now() -
    24 * 60 * 60 * 1000);
})
.then(() => {
  Score.deleteMany({}).where('time').lt(Date.now() - 24 * 60 * 60 * 1000);
})
.then(() => {
  console.log('done');
})
.catch((err) => {
  console.log(err);
});
