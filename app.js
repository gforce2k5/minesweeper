require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Game = require('./models/game');
const Score = require('./models/score');

mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true});

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  const results = {};
  Game.find({difficulty: 'easy', state: 2})
  .select('name score').sort('score').limit(10).exec()
  .then((foundGames) => {
    results.easy = foundGames;
    return Game.find({difficulty: 'medium', state: 2})
    .select('name score').sort('score').limit(10).exec();
  })
  .then((foundGames) => {
    results.medium = foundGames;
    return Game.find({difficulty: 'hard', state: 2})
    .select('name score').sort('score').limit(10).exec();
  })
  .then((foundGames) => {
    results.hard = foundGames;
    res.render('index', {results: results});
  });
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
    const boardState = new Array(req.query.width);
    for (let i = 0; i < req.query.width; i++) {
      boardState[i] = new Array(req.query.height);
      for (let j = 0; j < req.query.height; j++) {
        boardState[i][j] = false;
      }
    }
    Game.create({
      difficulty: difficulty,
      ip: req.ip,
      boardState: boardState,
    })
    .then((newGame) => {
      res.render('game', {game: req.query, id: newGame.id});
    })
    .catch((err) => {
      console.log(err);
    });
  } else {
    res.render('game', {game: req.query, id: undefined});
  }
});

initBoard = (difficulty, bState, curX, curY) => {
  let grid = [];
  for (let i = 0; i < bState.length; i++) {
    for (let j = 0; j < bState[0].length; j++) {
      if (i === curX && j === curY) continue;
      grid.push(`${i}-${j}`);
    }
  }

  const board = new Array(bState.length);
  for (let i = 0; i < bState.length; i++) {
    board[i] = new Array(bState[0].length);
  }

  let numOfMines;

  switch (difficulty) {
    case 'easy':
      numOfMines = 10;
      break;
    case 'medium':
      numOfMines = 40;
      break;
    case 'hard':
      numOfMines = 99;
      break;
  }

  for (let i = 0; i < numOfMines; i++) {
    const index = Math.floor(Math.random() * grid.length);
    const coords = getCoordinates(grid.splice(index, 1)[0]);
    const x = coords[0];
    const y = coords[1];
    board[x][y] = 9;
  }

  for (let i = 0; i < bState.length; i++) {
    for (let j = 0; j < bState[0].length; j++) {
      if (board[i][j] === 9) {
        continue;
      }
      let surroundingMines = 0;
      for (let ii = i - 1; ii <= i + 1; ii++) {
        if (!board[ii]) continue;
        for (let jj = j - 1; jj <= j + 1; jj++) {
          if (board[ii][jj] && board[ii][jj] === 9) {
            surroundingMines++;
          }
        }
      }
      board[i][j] = surroundingMines;
    }
  }
  return board;
};

getCoordinates = (id) => {
  const coords = id.split('-');
  return [parseInt(coords[0]), parseInt(coords[1])];
};

app.post('/game/new/:id', (req, res) => {
  Game.findById(req.params.id)
  .then((foundGame) => {
    if (foundGame.ip === req.ip) {
      if (!foundGame.state) {
        const bState = foundGame.boardState;
        const newBoard = initBoard(foundGame.difficulty, bState,
          req.body.data.x, req.body.data.y);
        bState[req.body.data.x][req.body.data.y] = true;
        res.send(JSON.stringify(newBoard));
        return foundGame.update({$set: {
          start: new Date(),
          state: 1,
          board: newBoard,
          boardState: bState,
        }});
      }
    }
  })
  .catch((err) => {
    console.log(err);
  });
});

app.post('/game/score/:id', (req, res) => {
  Game.findById(req.params.id)
  .then((foundGame) => {
    if (foundGame.ip === req.ip && foundGame.state === 1) {
      let = flag = false;
      for (let i = 0; i < foundGame.boardState.length; i++) {
        for (let j = 0; j < foundGame.boardState[i].length; j++) {
          if (!foundGame.boardState[i][j]) {
            if (foundGame.board[i][j] != 9) {
              flag = true;
              break;
            }
          }
        }
      }
      if (!flag) {
        Score.create({
          score: Math.round((Date.now() - foundGame.start) / 1000),
          gameId: foundGame._id,
        })
        .then((score) => {
          res.send(JSON.stringify({scoreId: score._id}));
        });
      }
    }
  })
  .catch((err) => {
    console.log(err);
  });
});

app.post('/game/update/:id', (req, res) => {
  Game.findById(req.params.id)
  .then((foundGame) => {
    if (foundGame.ip === req.ip && foundGame.state === 1) {
      const bState = foundGame.boardState;
      const blocks = req.body.data.blocks;
      for (let i = 0; i < blocks.length; i++) {
        if (foundGame.board[blocks[i].x][blocks[i].y] !== 9) {
          bState[blocks[i].x][blocks[i].y] = true;
        } else {
          foundGame.state = 3;
          return foundGame.save();
        }
      }
      return foundGame.update({$set: {
        boardState: bState,
      }});
    }
  })
  .then(() => {
    res.send(JSON.stringify({status: 'ok'}));
  })
  .catch((err) => {
    res.send(JSON.stringify({status: 'error'}));
    console.log(err);
  });
});

app.post('/game/mine/:id', (req, res) => {
  Game.findById(req.params.id)
  .then((foundGame) => {
    if (foundGame.ip === req.ip) {
      foundGame.state = 3;
      return foundGame.save();
    }
  })
  .catch((err) => {
    console.log(err);
  });
});

app.post('/score/:id', bodyParser.urlencoded({extended: true}), (req, res) => {
  Score.findByIdAndRemove(req.params.id)
  .then((foundScore) => {
    return Game.findByIdAndUpdate(foundScore.gameId, {
      score: foundScore.score,
      name: req.body.name,
      state: 2,
    });
  })
  .catch((err) => {
    console.log(err);
  });
  res.redirect('/');
});

app.listen(process.env.PORT, () => {
  console.log('Server running');
});
