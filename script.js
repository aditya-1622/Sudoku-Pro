const boardEl = document.getElementById("board");
const timeEl = document.getElementById("time");
const mistakeEl = document.getElementById("mistake");
const messageEl = document.getElementById("message");

let solution = [];
let board = [];
let timer;
let seconds = 0;
let mistakes = 0;
let difficulty = "easy";

function startTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
        seconds++;

        let min = Math.floor(seconds / 60);
        let sec = seconds % 60;

        timeEl.innerText =
            String(min).padStart(2, "0") +
            ":" +
            String(sec).padStart(2, "0");

    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    seconds = 0;
    timeEl.innerText = "00:00";
}

function isValid(board, row, col, num) {

    for (let i = 0; i < 9; i++) {

        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }

    let startRow = row - row % 3;
    let startCol = col - col % 3;

    for (let i = 0; i < 3; i++) {

        for (let j = 0; j < 3; j++) {

            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }

    return true;
}

function solve(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {

                for (let num = 1; num <= 9; num++) {

                    if (isValid(board, row, col, num)) {

                        board[row][col] = num;

                        if (solve(board)) {
                            return true;
                        }

                        board[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }

    return true;
}

function createPuzzle() {

    let arr = Array.from(
        { length: 9 },
        () => Array(9).fill(0)
    );

    solve(arr);

    solution = JSON.parse(JSON.stringify(arr));

    let removeCount = 35;

    if (difficulty === "medium") {
        removeCount = 45;
    }

    if (difficulty === "hard") {
        removeCount = 55;
    }

    while (removeCount > 0) {

        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);

        if (arr[row][col] !== 0) {

            arr[row][col] = 0;
            removeCount--;
        }
    }

    return arr;
}

function createBoard() {

    boardEl.innerHTML = "";

    mistakes = 0;
    mistakeEl.innerText = "0";

    messageEl.innerText = "";

    resetTimer();
    startTimer();

    board = createPuzzle();

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            let cell = document.createElement("input");

            cell.type = "text";
            cell.maxLength = 1;
            cell.classList.add("cell");

            if (board[row][col] !== 0) {

                cell.value = board[row][col];
                cell.disabled = true;
                cell.classList.add("fixed");

            } else {

                cell.addEventListener("input", () => {

                    let value = parseInt(cell.value);

                    if (isNaN(value) || value < 1 || value > 9) {
                        cell.value = "";
                        return;
                    }

                    if (value !== solution[row][col]) {

                        mistakes++;
                        mistakeEl.innerText = mistakes;

                        cell.style.background = "#ffcccc";

                        setTimeout(() => {
                            cell.value = "";
                            cell.style.background = "";
                        }, 500);

                        if (mistakes >= 3) {

                            alert("Game Over!");
                            createBoard();
                        }

                    } else {

                        cell.style.background = "#ccffcc";
                    }
                });
            }

            boardEl.appendChild(cell);
        }
    }
}

document.getElementById("newGame").addEventListener("click", () => {
    createBoard();
});

document.getElementById("difficulty").addEventListener("change", (e) => {
    difficulty = e.target.value;
    createBoard();
});

document.getElementById("hint").addEventListener("click", () => {

    let cells = document.querySelectorAll(".cell");
    let empty = [];

    cells.forEach((cell, index) => {

        if (cell.value === "") {
            empty.push(index);
        }
    });

    if (empty.length === 0) return;

    let randomIndex =
        empty[Math.floor(Math.random() * empty.length)];

    let row = Math.floor(randomIndex / 9);
    let col = randomIndex % 9;

    cells[randomIndex].value = solution[row][col];
});

document.getElementById("check").addEventListener("click", () => {

    let cells = document.querySelectorAll(".cell");
    let index = 0;
    let win = true;

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            let value = parseInt(cells[index].value);

            if (value !== solution[row][col]) {
                win = false;
            }

            index++;
        }
    }

    if (win) {

        clearInterval(timer);
        messageEl.innerText = "You Won!";

    } else {

        messageEl.innerText = "Puzzle is not complete.";
    }
});

createBoard();