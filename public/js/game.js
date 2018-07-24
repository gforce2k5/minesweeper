{
  document.querySelector('.board').addEventListener('contextmenu', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  });

  document.querySelector('#message').addEventListener('click', (evt) => {
    if (evt.target.matches('#new-game')) {
      newGame();
    }
  });

  const mines = new Array(width);
  const flags = new Array(width);
  const colors = [
    '#FFF',
    '#0224E8',
    '#417B34',
    '#E83635',
    '#01007B',
    '#76150E',
    '#377E80',
    '#000',
    '#808080',
  ];

  let gameState = 0;
  let start;
  let timer;
  let currentMines;

  init = (curX, curY) => {
    start = new Date().getTime();
    timer = runTimer();
    gameState = 1;
    for (let i = 0; i < numOfMines; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (mines[x][y] || (x === curX && y === curY)) {
        i--;
      } else {
        mines[x][y] = 9;
      }
    }

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (mines[i][j] === 9) {
          continue;
        }
        let surroundingMines = 0;
        for (let ii = i - 1; ii <= i + 1; ii++) {
          if (!mines[ii]) continue;
          for (let jj = j - 1; jj <= j + 1; jj++) {
            if (mines[ii][jj] && mines[ii][jj] === 9) {
              surroundingMines++;
            }
          }
        }
        mines[i][j] = surroundingMines;
      }
    }
  };

  const fields = document.querySelectorAll('.field');
  fields.forEach((el) => {
    el.addEventListener('mousedown', (evt) => {
      const coords = getCoordinates(el.id);
      const x = coords[0];
      const y = coords[1];
      if (gameState === 0 && !(evt.button === 2)) {
        init(x, y);
      } else if (gameState === 2) {
        return;
      }
      if (evt.button === 0) {
        if (flags[x][y] === 1) return;
        if (el.classList.contains('pressed')) {
          if (mines[x][y] > 0 && mines[x][y] < 9) {
            if (countFlags(x, y) === mines[x][y]) {
              showSpace(x, y, false, true);
            }
          }
          return;
        }
        if (mines[x][y] === 0) {
          showSpace(x, y);
        } else if (mines[x][y] === 9) {
          el.classList.add('pressed');
          el.classList.add('mine');
          gameState = 2;
          clearInterval(timer);
          showAllMines();
          showMessage('You Lost! Please try again', 'danger');
        } else {
          el.classList.add('pressed');
          el.textContent = mines[x][y];
          el.style.color = colors[mines[x][y]];
        }
        checkVictory();
      } else if (evt.button === 2) {
        if (el.classList.contains('pressed')) return;
        if (!flags[x][y]) flags[x][y] = 0;
        flags[x][y]++;
        flags[x][y] %= 3;
        if (flags[x][y] === 1) {
          el.classList.add('flag');
          currentMines--;
        } else {
          el.classList.remove('flag');
        }

        if (flags[x][y] === 2) {
          el.innerHTML = '<i class="fas fa-question"></i>';
          tileSelector(x, y).style.color = '#000';
          currentMines++;
        } else {
          el.innerHTML = '';
        }
        document.querySelector('#mines').textContent = currentMines;
      }
    });

    el.addEventListener('mouseover', () => {
      if (gameState !== 1) return;
      const coords = getCoordinates(el.id);
      const x = coords[0];
      const y = coords[1];
      if (mines[x][y] > 0 && mines[x][y] < 9 &&
          el.classList.contains('pressed')) {
        highlightAdjacent(x, y, true);
      }
    });

    el.addEventListener('mouseout', () => {
      if (gameState !== 1) return;
      const coords = getCoordinates(el.id);
      const x = coords[0];
      const y = coords[1];
      if (mines[x][y] > 0 && mines[x][y] < 9 &&
          el.classList.contains('pressed')) {
        highlightAdjacent(x, y);
      }
    });
  });

  getCoordinates = (id) => {
    const coords = id.split('-');
    return [parseInt(coords[0]), parseInt(coords[1])];
  };

  revealNumber = (x, y) => {
    const tile = tileSelector(x, y);
    if (mines[x][y] > 0 && mines[x][y] < 9) {
      tile.textContent = mines[x][y];
    }
    tile.style.color = colors[mines[x][y]];
    tile.classList.add('pressed');
  };

  showSpace = (x, y, ignoreMines = true, numberPressed = false) => {
    if (ignoreMines && isPressed(x, y) || (flags[x] && flags[x][y]) ||
        (ignoreMines && !numberPressed && mines[x][y] === 9)) {
      return;
    }
    if (numberPressed && mines[x][y] === 9 && !flags[x][y]) {
      gameState = 2;
      clearInterval(timer);
      showAllMines();
      showMessage('You Lost! Pleaae try again', 'danger');
      return;
    }
    revealNumber(x, y);
    if (mines[x][y] === 0 || !ignoreMines) {
      for (let i = x - 1; i <= x + 1; i++) {
        if (!mines[i]) continue;
        for (let j = y - 1; j <= y + 1; j++) {
          if (mines[i][j] >= 0) {
            showSpace(i, j, true, numberPressed);
          }
        }
      }
    }
  };

  tileSelector = (x, y) => {
    return document.getElementById(`${x}-${y}`);
  };

  isPressed = (x, y) => {
    const tile = tileSelector(x, y);
    return tile.classList.contains('pressed') ||
      tile.classList.contains('mine');
  };

  showAllMines = () => {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (mines[i][j] === 9 && !flags[i][j]) {
          tileSelector(i, j).classList.add('mine');
        }
        if (flags[i][j] === 1 && mines[i][j] !== 9) {
          tileSelector(i, j).innerHTML = '<i class="fas fa-times"></i>';
          tileSelector(i, j).style.color = '#000';
        }
      }
    }
  };

  highlightAdjacent = (x, y, add) => {
    for (let i = x - 1; i <= x + 1; i++) {
      if (!mines[i]) continue;
      for (let j = y - 1; j <= y + 1; j++) {
        if (mines[i][j] >= 0) {
          if (add) {
            tileSelector(i, j).classList.add('highlight');
          } else {
            tileSelector(i, j).classList.remove('highlight');
          }
        }
      }
    }
  };

  checkVictory = () => {
    const fields = document.querySelectorAll('.field:not(.pressed)');
    if (fields.length === numOfMines) {
      gameState = 2;
      showAllMines();
      const elapsed = document.querySelector('#timer').textContent;
      showMessage(`You Won! Your time is ${elapsed} seconds!`, 'success');
      clearInterval(timer);
    }
  };

  countFlags = (x, y) => {
    let numOfFlags = 0;
    for (let i = x - 1; i <= x + 1; i++) {
      if (!flags[i]) continue;
      for (let j = y - 1; j <= y + 1; j++) {
        if (flags[i][j] === 1) {
          numOfFlags++;
        }
      }
    }
    return numOfFlags;
  };

  runTimer = () => {
    return setInterval(() => {
      const time = new Date().getTime() - start;
      let elapsed = Math.floor(time / 100) / 10;
      if (Math.round(elapsed) == elapsed) {
        elapsed += '.0';
      }
      document.querySelector('#timer').textContent = elapsed;
    }, 100);
  };

  showMessage = (msg, alertType) => {
    document.querySelector('#message').innerHTML = `
      <div class="alert alert-${alertType}">
        <p>${msg}</p>
        <button id="new-game" class="btn btn-${alertType}">New Game</button>
      </div>
    `;
  };

  newGame = () => {
    gameState = 0;
    currentMines = numOfMines;
    document.querySelector('#mines').textContent = currentMines;
    document.querySelector('#timer').textContent = '0.0';
    document.querySelector('#message').textContent = '';
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        tileSelector(i, j).classList.remove('pressed', 'mine', 'flag');
        tileSelector(i, j).textContent = '';
      }
      mines[i] = new Array(height);
      flags[i] = new Array(height);
    }
  };

  newGame();
}
