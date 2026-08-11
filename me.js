const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const movesElement = document.getElementById("moves");

let gameMode = "bot";
let currentPlayer = "white";
let selectedSquare = null;
let gameOver = false;

const pieces = {
    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }
};

let board = [
    ["black-rook", "black-knight", "black-bishop", "black-queen",
     "black-king", "black-bishop", "black-knight", "black-rook"],

    ["black-pawn", "black-pawn", "black-pawn", "black-pawn",
     "black-pawn", "black-pawn", "black-pawn", "black-pawn"],

    [null, null, null, null, null, null, null, null],

    [null, null, null, null, null, null, null, null],

    [null, null, null, null, null, null, null, null],

    [null, null, null, null, null, null, null, null],

    ["white-pawn", "white-pawn", "white-pawn", "white-pawn",
     "white-pawn", "white-pawn", "white-pawn", "white-pawn"],

    ["white-rook", "white-knight", "white-bishop", "white-queen",
     "white-king", "white-bishop", "white-knight", "white-rook"]
];

function drawBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];

            if (piece) {

                const [color, type] = piece.split("-");

                square.textContent = pieces[color][type];

            }

            square.addEventListener("click", handleSquareClick);

            boardElement.appendChild(square);
        }
    }
}

function handleSquareClick(event) {

    if (gameOver) return;

    if (gameMode === "bot" && currentPlayer === "black") {
        return;
    }

    const row = Number(event.currentTarget.dataset.row);
    const col = Number(event.currentTarget.dataset.col);

    const piece = board[row][col];

    if (selectedSquare === null) {

        if (piece && piece.startsWith(currentPlayer)) {

            selectedSquare = { row, col };

            highlightSquare();

        }

        return;
    }

    if (piece && piece.startsWith(currentPlayer)) {

        selectedSquare = { row, col };

        highlightSquare();

        return;
    }

    const from = selectedSquare;
    const to = { row, col };

    if (isLegalMove(from, to)) {

        makeMove(from, to);

        selectedSquare = null;

        if (!gameOver) {

            currentPlayer =
                currentPlayer === "white" ? "black" : "white";

            updateStatus();

            if (gameMode === "bot" && currentPlayer === "black") {

                setTimeout(botMove, 500);

            }
        }

    } else {

        selectedSquare = null;
        drawBoard();
    }
}

function highlightSquare() {

    drawBoard();

    const squares = document.querySelectorAll(".square");

    const index =
        selectedSquare.row * 8 + selectedSquare.col;

    squares[index].classList.add("selected");

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            if (
                isLegalMove(
                    selectedSquare,
                    { row, col }
                )
            ) {

                squares[row * 8 + col]
                    .classList.add("possible");
            }
        }
    }
}

function isLegalMove(from, to) {

    if (
        from.row === to.row &&
        from.col === to.col
    ) {
        return false;
    }

    const piece = board[from.row][from.col];

    if (!piece) return false;

    const [color, type] = piece.split("-");

    const target = board[to.row][to.col];

    if (
        target &&
        target.startsWith(color)
    ) {
        return false;
    }

    const dr = to.row - from.row;
    const dc = to.col - from.col;

    if (type === "pawn") {

        const direction = color === "white" ? -1 : 1;

        if (dc === 0 && !target) {

            if (dr === direction) return true;

            const startRow =
                color === "white" ? 6 : 1;

            if (
                from.row === startRow &&
                dr === direction * 2 &&
                !board[from.row + direction][from.col]
            ) {
                return true;
            }
        }

        if (
            Math.abs(dc) === 1 &&
            dr === direction &&
            target
        ) {
            return true;
        }

        return false;
    }

    if (type === "knight") {

        return (
            (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
            (Math.abs(dr) === 1 && Math.abs(dc) === 2)
        );
    }

    if (type === "king") {

        return (
            Math.abs(dr) <= 1 &&
            Math.abs(dc) <= 1
        );
    }

    if (type === "rook") {

        if (dr !== 0 && dc !== 0) return false;

        return clearPath(from, to);
    }

    if (type === "bishop") {

        if (Math.abs(dr) !== Math.abs(dc)) {
            return false;
        }

        return clearPath(from, to);
    }

    if (type === "queen") {

        if (
            dr !== 0 &&
            dc !== 0 &&
            Math.abs(dr) !== Math.abs(dc)
        ) {
            return false;
        }

        return clearPath(from, to);
    }

    return false;
}

function clearPath(from, to) {

    const rowStep =
        Math.sign(to.row - from.row);

    const colStep =
        Math.sign(to.col - from.col);

    let row = from.row + rowStep;
    let col = from.col + colStep;

    while (
        row !== to.row ||
        col !== to.col
    ) {

        if (board[row][col] !== null) {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}

function makeMove(from, to) {

    const movingPiece = board[from.row][from.col];
    const capturedPiece = board[to.row][to.col];

    board[to.row][to.col] = movingPiece;
    board[from.row][from.col] = null;

    // Simple pawn promotion
    const [color, type] = movingPiece.split("-");

    if (
        type === "pawn" &&
        (to.row === 0 || to.row === 7)
    ) {

        board[to.row][to.col] =
            `${color}-queen`;
    }

    addMove(
        movingPiece,
        from,
        to,
        capturedPiece
    );

    drawBoard();

    checkGameStatus();
}

function addMove(piece, from, to, captured) {

    const pieceName = piece.split("-")[1];

    const moveNumber =
        movesElement.children.length + 1;

    const text =
        `${moveNumber}. ${pieceName} ` +
        `${positionName(from)} → ${positionName(to)}` +
        (captured ? " ×" : "");

    if (
        movesElement.textContent ===
        "No moves yet"
    ) {
        movesElement.innerHTML = "";
    }

    const move = document.createElement("div");

    move.textContent = text;

    move.style.marginBottom = "8px";

    movesElement.appendChild(move);
}

function positionName(position) {

    const files = "abcdefgh";

    return files[position.col] +
        (8 - position.row);
}

function updateStatus() {

    statusElement.textContent =
        currentPlayer === "white"
            ? "White's Turn"
            : "Black's Turn";
}

function checkGameStatus() {

    let whiteKing = false;
    let blackKing = false;

    for (let row of board) {

        for (let piece of row) {

            if (piece === "white-king") {
                whiteKing = true;
            }

            if (piece === "black-king") {
                blackKing = true;
            }
        }
    }

    if (!whiteKing) {

        endGame("Black Wins! 🤖");

    } else if (!blackKing) {

        endGame("White Wins! 🏆");
    }
}

function endGame(message) {

    gameOver = true;

    statusElement.textContent = message;
}

function botMove() {

    if (gameOver) return;

    const possibleMoves = [];

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = board[row][col];

            if (
                piece &&
                piece.startsWith("black")
            ) {

                for (let r = 0; r < 8; r++) {

                    for (let c = 0; c < 8; c++) {

                        if (
                            isLegalMove(
                                { row, col },
                                { row: r, col: c }
                            )
                        ) {

                            possibleMoves.push({
                                from: { row, col },
                                to: { row: r, col: c }
                            });

                        }
                    }
                }
            }
        }
    }

    if (possibleMoves.length === 0) {

        endGame("White Wins! 🏆");

        return;
    }

    // Prefer captures
    const captures =
        possibleMoves.filter(move =>
            board[move.to.row][move.to.col] !== null
        );

    const moves =
        captures.length > 0
            ? captures
            : possibleMoves;

    const selected =
        moves[Math.floor(Math.random() * moves.length)];

    makeMove(
        selected.from,
        selected.to
    );

    if (!gameOver) {

        currentPlayer = "white";

        updateStatus();
    }
}

document.getElementById("botMode")
    .addEventListener("click", () => {

        gameMode = "bot";

        restartGame();

    });

document.getElementById("friendMode")
    .addEventListener("click", () => {

        gameMode = "friend";

        restartGame();

    });

document.getElementById("restart")
    .addEventListener("click", restartGame);

function restartGame() {

    board = [
        ["black-rook", "black-knight", "black-bishop", "black-queen",
         "black-king", "black-bishop", "black-knight", "black-rook"],

        ["black-pawn", "black-pawn", "black-pawn", "black-pawn",
         "black-pawn", "black-pawn", "black-pawn", "black-pawn"],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        ["white-pawn", "white-pawn", "white-pawn", "white-pawn",
         "white-pawn", "white-pawn", "white-pawn", "white-pawn"],

        ["white-rook", "white-knight", "white-bishop", "white-queen",
         "white-king", "white-bishop", "white-knight", "white-rook"]
    ];

    currentPlayer = "white";
    selectedSquare = null;
    gameOver = false;

    movesElement.textContent = "No moves yet";

    updateStatus();
    drawBoard();
}

restartGame();
