class Tetris {
  constructor() {
    this.board = Array(20)
      .fill()
      .map(() => Array(10).fill(null));
    this.score = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.currentPiece = null;
    this.nextPiece = null;
    this.gameLoop = null;
    this.dropInterval = 1000;
    this.lastDrop = 0;

    // Tetromino shapes
    this.shapes = {
      I: [[1, 1, 1, 1]],
      O: [
        [1, 1],
        [1, 1],
      ],
      T: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      L: [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
      J: [
        [0, 1],
        [0, 1],
        [1, 1],
      ],
      S: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      Z: [
        [1, 1, 0],
        [0, 1, 1],
      ],
    };

    // Colors for each piece
    this.colors = {
      I: "#00f0f0",
      O: "#f0f000",
      T: "#a000f0",
      L: "#f0a000",
      J: "#0000f0",
      S: "#00f000",
      Z: "#f00000",
    };

    this.init();
  }

  init() {
    this.createBoard();
    this.setupEventListeners();
    this.updateScore(0);
    this.updateLevel(1);
  }

  createBoard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";

    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = i;
        cell.dataset.col = j;
        gameBoard.appendChild(cell);
      }
    }
  }

  setupEventListeners() {
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
    document
      .getElementById("start-btn")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("pause-btn")
      .addEventListener("click", () => this.togglePause());
  }

  startGame() {
    if (this.gameLoop) return;
    this.reset();
    // Spawn the first piece immediately
    const pieces = Object.keys(this.shapes);
    this.nextPiece = pieces[Math.floor(Math.random() * pieces.length)];
    this.spawnPiece();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  reset() {
    this.board = Array(20)
      .fill()
      .map(() => Array(10).fill(null));
    this.score = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.updateScore(0);
    this.updateLevel(1);
    this.createBoard();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    document.getElementById("pause-btn").textContent = this.isPaused
      ? "Resume"
      : "Pause";
  }

  spawnPiece() {
    const pieces = Object.keys(this.shapes);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];

    if (this.nextPiece) {
      this.currentPiece = {
        shape: this.shapes[this.nextPiece],
        color: this.nextPiece,
        x: 3,
        y: 0,
      };
    }

    this.nextPiece = randomPiece;
    this.updateNextPiecePreview();

    if (
      this.currentPiece &&
      this.checkCollision(this.currentPiece.x, this.currentPiece.y)
    ) {
      this.gameOver = true;
      alert("Game Over! Score: " + this.score);
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }

  updateNextPiecePreview() {
    const preview = document.getElementById("next-piece-preview");
    preview.innerHTML = "";

    const shape = this.shapes[this.nextPiece];
    const color = this.nextPiece;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        if (shape[i] && shape[i][j]) {
          cell.classList.add("filled", color);
        }
        preview.appendChild(cell);
      }
    }
  }

  handleKeyPress(event) {
    if (this.gameOver || this.isPaused) return;

    switch (event.keyCode) {
      case 37: // Left
        this.movePiece(-1, 0);
        break;
      case 39: // Right
        this.movePiece(1, 0);
        break;
      case 40: // Down
        this.movePiece(0, 1);
        break;
      case 38: // Up
        this.rotatePiece();
        break;
    }
  }

  movePiece(dx, dy) {
    if (!this.currentPiece) return;

    const newX = this.currentPiece.x + dx;
    const newY = this.currentPiece.y + dy;

    if (!this.checkCollision(newX, newY)) {
      this.currentPiece.x = newX;
      this.currentPiece.y = newY;
      this.draw();
      return true;
    }

    if (dy > 0) {
      this.lockPiece();
    }

    return false;
  }

  rotatePiece() {
    if (!this.currentPiece) return;

    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map((row) => row[i]).reverse()
    );

    const originalShape = this.currentPiece.shape;
    this.currentPiece.shape = rotated;

    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.shape = originalShape;
    } else {
      this.draw();
    }
  }

  checkCollision(x, y) {
    for (let i = 0; i < this.currentPiece.shape.length; i++) {
      for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
        if (this.currentPiece.shape[i][j]) {
          const newX = x + j;
          const newY = y + i;

          if (
            newX < 0 ||
            newX >= 10 ||
            newY >= 20 ||
            (newY >= 0 && this.board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  lockPiece() {
    for (let i = 0; i < this.currentPiece.shape.length; i++) {
      for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
        if (this.currentPiece.shape[i][j]) {
          const y = this.currentPiece.y + i;
          const x = this.currentPiece.x + j;
          if (y >= 0) {
            this.board[y][x] = this.currentPiece.color;
            this.updateCell(y, x);
          }
        }
      }
    }
    this.clearLines();
    this.spawnPiece();
  }

  clearLines() {
    let linesCleared = 0;

    for (let i = this.board.length - 1; i >= 0; i--) {
      if (this.board[i].every((cell) => cell !== null)) {
        this.board.splice(i, 1);
        this.board.unshift(Array(10).fill(null));
        linesCleared++;
        i++;
      }
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared];
      this.updateScore(this.score + points);

      if (this.score >= this.level * 1000) {
        this.updateLevel(this.level + 1);
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
      }
    }
  }

  update(timestamp) {
    if (this.gameOver || this.isPaused) {
      return;
    }

    if (timestamp - this.lastDrop > this.dropInterval) {
      this.movePiece(0, 1);
      this.lastDrop = timestamp;
    }

    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    // Clear the board
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.classList.remove("filled", "I", "O", "T", "L", "J", "S", "Z");
    });

    // Draw locked pieces
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        if (this.board[i][j]) {
          this.updateCell(i, j, this.board[i][j]);
        }
      }
    }

    // Draw current piece
    if (this.currentPiece) {
      for (let i = 0; i < this.currentPiece.shape.length; i++) {
        for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
          if (this.currentPiece.shape[i][j]) {
            const y = this.currentPiece.y + i;
            const x = this.currentPiece.x + j;
            if (y >= 0) {
              this.updateCell(y, x, this.currentPiece.color);
            }
          }
        }
      }
    }
  }

  updateCell(row, col, color = null) {
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    if (color) {
      cell.classList.add("filled", color);
    } else {
      cell.classList.remove("filled", "I", "O", "T", "L", "J", "S", "Z");
    }
  }

  updateScore(score) {
    this.score = score;
    document.getElementById("score").textContent = score;
  }

  updateLevel(level) {
    this.level = level;
    document.getElementById("level").textContent = level;
  }
}

// Initialize the game when the page loads
window.addEventListener("load", () => {
  new Tetris();
});
