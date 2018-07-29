const difficulty = document.querySelector('#difficulty');

difficulty.addEventListener('change', () => {
  console.log(difficulty.value);
  switch (difficulty.value) {
    case 'easy':
      setFields(9, 9, 10);
      break;
    case 'medium':
      setFields(16, 16, 40);
      break;
    case 'hard':
      setFields(30, 16, 99);
      break;
  }
});

setFields = (width, height, mines) => {
  document.getElementById('width').value = `${width}`;
  document.getElementById('height').value = `${height}`;
  document.getElementById('mines').value = `${mines}`;
};
