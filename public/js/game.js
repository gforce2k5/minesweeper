const mines = new Array(height);
const colors = [
  '#FFF',
  '#0224E8',
  '#417B34',
  '#E83635',
  '#000',
  '#000',
  '#000',
  '#000',
  '#000',
];

init = () => {
  for (let i = 0; i < width; i++) {
    mines[i] = new Array(width);
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
    const coords = getCoordinates(el.id);
    const x = coords[0];
    const y = coords[1];
    el.classList.add('pressed');
    if (mines[x][y] === 0) {
      el.textContent = mines[x][y];
      showMines(x, y);
    } else if (mines[x][y] === 9) {
      el.classList.add('mine');
    } else {
      el.textContent = mines[x][y];
      el.style.color = colors[mines[x][y]];
    }
  });
});

getCoordinates = (id) => {
  const coords = id.split('-');
  return [parseInt(coords[0]), parseInt(coords[1])];
};

showMines = (x, y) => {
  if (isPressed(x, y)) return;
  pressed[x][y] = true;
  tileSelector(x, y).classList.add('pressed');
  if (mines[x][y] === 0) {
    for (let i = x - 1; i <= x + 1; i++) {
      if (!mines[i]) continue;
      for (let j = y - 1; j <= x + 1; j++) {
        if (mines[i][j]) {
          showMines(i, j);
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
  return tile.classList.contains('pressed') || tile.contains('mine');
};

init();
