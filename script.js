const boardEl = document.getElementById("board");
const timeEl = document.getElementById("time");
const mistakeEl = document.getElementById("mistake");
const bestEl = document.getElementById("bestTime");
const msg = document.getElementById("message");

let solution = [];
let board = [];
let timer = null;
let seconds = 0;
let mistakes = 0;
let pencilMode = false;
let difficulty = "easy";

/* ---------------- TIMER ---------------- */

function startTimer() {
  if (timer) return;

  timer = setInterval(() => {
    seconds++;

    let m = Math.floor(seconds / 60);
    let s = seconds % 60;

    timeEl.innerText =
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0");

  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  seconds = 0;
  timeEl.innerText = "00:00";
}

/* ---------------- SUDOKU LOGIC ---------------- */

function isValid(board, row, col, num) {

  for (let i = 0; i < 9; i++) {

    if (board[row][i] === num) return false;

    if (board[i][col] === num) return false;
  }

  let sr = row - (row % 3);
  let sc = col - (col % 3);

  for (let i = 0; i < 3; i++) {

    for (let j = 0; j < 3; j++) {

      if (board[sr + i][sc + j] === num) return false;

    }
  }

  return true;
}

function shuffle(arr) {

  for (let i = arr.length - 1; i > 0; i--) {

    let j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function solveRandom(board) {

  for (let row = 0; row < 9; row++) {

    for (let col = 0; col < 9; col++) {

      if (board[row][col] === 0) {

        let nums = shuffle([1,2,3,4,5,6,7,8,9]);

        for (let num of nums) {

          if (isValid(board, row, col, num)) {

            board[row][col] = num;

            if (solveRandom(board)) return true;

            board[row][col] = 0;
          }
        }

        return false;
      }
    }
  }

  return true;
}

function generateSudoku() {

  let board =
    Array.from({ length: 9 }, () =>
      Array(9).fill(0)
    );

  solveRandom(board);

  return board;
}

function removeCells(board) {

  let removeCount =
    difficulty === "easy"
      ? 35
      : difficulty === "medium"
      ? 45
      : 55;

  while (removeCount > 0) {

    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);

    if (board[row][col] !== 0) {

      board[row][col] = 0;

      removeCount--;
    }
  }

  return board;
}

/* ---------------- CREATE BOARD ---------------- */

function createBoard() {

  boardEl.innerHTML = "";

  mistakes = 0;

  mistakeEl.innerText = "0";

  msg.innerText = "";

  resetTimer();

  solution = generateSudoku();

  board =
    JSON.parse(JSON.stringify(solution));

  removeCells(board);

  for (let row = 0; row < 9; row++) {

    for (let col = 0; col < 9; col++) {

      const cell =
        document.createElement("input");

      cell.classList.add("cell");

      cell.maxLength = 1;

      if (board[row][col] !== 0) {

        cell.value = board[row][col];

        cell.disabled = true;

        cell.classList.add("fixed");
      }

      cell.addEventListener("input", () => {

        startTimer();

        if (pencilMode) return;

        let value = parseInt(cell.value);

        if (!value || value < 1 || value > 9) {

          cell.value = "";

          return;
        }

        if (value !== solution[row][col]) {

          mistakes++;

          mistakeEl.innerText = mistakes;

          cell.style.background = "#ef4444";

          setTimeout(() => {

            cell.style.background = "";

            cell.value = "";

          }, 500);

          if (mistakes >= 3) {

            alert("Game Over!");

            createBoard();
          }

        } else {

          cell.style.background = "#22c55e";
        }
      });

      boardEl.appendChild(cell);
    }
  }
}

/* ---------------- BUTTONS ---------------- */

document
  .getElementById("newGame")
  .onclick = createBoard;

document
  .getElementById("difficulty")
  .onchange = (e) => {

    difficulty = e.target.value;

    createBoard();
  };

document
  .getElementById("themeBtn")
  .onclick = () => {

    document.body.classList.toggle("dark");

    const btn =
      document.getElementById("themeBtn");

    btn.innerText =
      document.body.classList.contains("dark")
        ? "☀ Light Mode"
        : "🌙 Dark Mode";
  };

document
  .getElementById("pencil")
  .onclick = () => {

    pencilMode = !pencilMode;

    document.getElementById(
      "pencil"
    ).style.background =
      pencilMode
        ? "#facc15"
        : "";
  };

document
  .getElementById("solve")
  .onclick = () => {

    const cells =
      document.querySelectorAll(".cell");

    let index = 0;

    for (let row = 0; row < 9; row++) {

      for (let col = 0; col < 9; col++) {

        cells[index++].value =
          solution[row][col];
      }
    }

    msg.innerText = "Solved!";
  };

document
  .getElementById("hint")
  .onclick = () => {

    const cells =
      [...document.querySelectorAll(".cell")];

    const empty =
      cells
        .map((cell, i) =>
          cell.value === "" ? i : -1
        )
        .filter(i => i !== -1);

    if (empty.length === 0) return;

    const pick =
      empty[
        Math.floor(
          Math.random() * empty.length
        )
      ];

    const row =
      Math.floor(pick / 9);

    const col =
      pick % 9;

    cells[pick].value =
      solution[row][col];
  };

document
  .getElementById("check")
  .onclick = () => {

    const cells =
      document.querySelectorAll(".cell");

    let index = 0;

    let won = true;

    for (let row = 0; row < 9; row++) {

      for (let col = 0; col < 9; col++) {

        if (
          parseInt(cells[index++].value)
          !== solution[row][col]
        ) {

          won = false;
        }
      }
    }

    if (won) {

      msg.innerText =
        "🎉 Congratulations! You Won!";

      clearInterval(timer);

      confetti();

      const best =
        localStorage.getItem("best");

      if (
        !best ||
        seconds < parseInt(best)
      ) {

        localStorage.setItem(
          "best",
          seconds
        );

        loadBest();
      }

    } else {

      msg.innerText =
        "❌ Puzzle not solved yet!";
    }
  };

/* ---------------- BEST TIME ---------------- */

function loadBest() {

  let best =
    localStorage.getItem("best");

  if (!best) return;

  best = parseInt(best);

  let m =
    Math.floor(best / 60);

  let s =
    best % 60;

  bestEl.innerText =
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0");
}

/* ---------------- START ---------------- */

loadBest();

createBoard();