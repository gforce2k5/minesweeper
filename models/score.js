const mongoose = require('mongoose');

const scoreSchena = new mongoose.Schema({
  score: Number,
  gameId: String,
  time: {type: Date, default: Date.now()},
});

module.exports = mongoose.model('Score', scoreSchena);
