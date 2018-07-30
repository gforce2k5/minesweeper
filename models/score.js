const mongoose = require('mongoose');

const scoreSchena = new mongoose.Schema({
  score: Number,
  game: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
    },
  },
  name: String,
});

module.exports = mongoose.model('Score', scoreSchena);
