const mongoose = require('mongoose');

const scoreSchena = new mongoose.Schema({
  score: Number,
  gameId: String,
});

module.exports = mongoose.model('Score', scoreSchena);
