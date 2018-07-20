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

let gameState;

init = () => {
  gameState = 0;
  for (let i = 0; i < width; i++) {
    mines[i] = new Array(height);
    flags[i] = new Array(height);
  }

  for (let i = 0; i < numOfMines; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    if (!mines[x][y]) {
      mines[x][y] = 9;
    } else {
      i--;
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
  el.addEventListener('click', () => {
    if (gameState === 0) {
      gameState === 1;
    }
    const coords = getCoordinates(el.id);
    const x = coords[0];
    const y = coords[1];
    if (el.classList.contains('pressed')) {
      if (mines[x][y] > 0 && mines[x][y] < 9) {
        if (countFlags(x, y) === mines[x][y]) {
          showSpace(x, y, false);
        }
      }
      return;
    }
    if (mines[x][y] === 0) {
      showSpace(x, y);
    } else if (mines[x][y] === 9) {
      el.classList.add('pressed');
      el.classList.add('mine');
    } else {
      el.classList.add('pressed');
      el.textContent = mines[x][y];
      el.style.color = colors[mines[x][y]];
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

showSpace = (x, y, ignoewMines = true) => {
  if (isPressed(x, y) || (ignoreMines && mines[x][y] === 9)) return;
  revealNumber(x, y);
  if (mines[x][y] === 0) {
    for (let i = x - 1; i <= x + 1; i++) {
      if (!mines[i]) continue;
      for (let j = y - 1; j <= y + 1; j++) {
        if (mines[i][j] >= 0) {
          showSpace(i, j);
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
  return tile.classList.contains('pressed') || tile.classList.contains('mine');
};

init();
