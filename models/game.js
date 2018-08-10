const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  start: {type: Date, default: Date.now},
  state: {type: Number, default: 0},
  difficulty: String,
  ip: String,
  board: [[Number]],
  boardState: [[Boolean]],
  score: Number,
  name: String,
});

module.exports = mongoose.model('Game', gameSchema);
