const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  start: {type: Date, default: Date.now},
  started: {type: Boolean, default: false},
  difficulty: String,
  ip: String,
});

module.exports = mongoose.model('Game', gameSchema);
