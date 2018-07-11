const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27127');

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log('Server running');
});
