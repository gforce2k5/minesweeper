const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  start: {type: Date, default: Date.now},
  difficulty: String,
});

module.exports = mongoose.model('Game', gameSchema);
