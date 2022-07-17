const EMOJI_FLAG = "🚩";
const EMOJI_PICKAXE = "⛏️";

class Cell {
  constructor(row, column, game) {
    this.row = row;
    this.column = column;
    this.bomb = false;

    this.element = document.createElement("td");
    this.element.onclick = () => game.onclick(this);

    this.setState("unknown");
  }

  setState(state) {
    this.element.dataset.state = state;
  }

  isState(state) {
    return this.element.dataset.state == state;
  }

  getState() {
    return this.element.dataset.state;
  }
}

class Timer {
  constructor(parent) {
    this.element = document.createElement("div");
    this.element.classList.add("timer");
    this.instance = null;
    this.seconds = -1;
    parent.append(this.element);
  }

  increment() {
    this.seconds++;

    const mins = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;

    this.element.innerText = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  }

  start() {
    this.increment();
    this.instance = setInterval(() => this.increment(), 1000);
  }
  stop() {
    if (this.instance) {
      clearInterval(this.instance);
      this.instance = null;
    }
  }
}

class Game {
  constructor(rows, columns, count) {
    this.count = count;
    this.board = document.getElementById("board");
    this.board.innerHTML = "";

    const title = document.createElement("h1");
    title.innerText = "Minesweeper";
    this.board.append(title);

    const score = document.createElement("div");
    score.classList.add("score");
    this.board.append(score);

    this.timer = new Timer(score);

    this.flagcount = document.createElement("div");
    this.flagcount.classList.add("flagscore");
    score.append(this.flagcount);

    this.table = document.createElement("table");
    this.board.append(this.table);

    this.cells = [];
    for (var r = 0; r < rows; r++) {
      const tr = document.createElement("tr");
      const array = [];
      for (var c = 0; c < columns; c++) {
        const cell = new Cell(r, c, this);
        array.push(cell);
        tr.append(cell.element);
      }

      this.cells.push(array);
      this.table.append(tr);
    }

    const tools = document.createElement("div");
    tools.classList.add("toolbar");

    const tool_pickaxe = document.createElement("div");
    tool_pickaxe.classList.add("mine");
    tool_pickaxe.innerText = EMOJI_PICKAXE;
    tool_pickaxe.onclick = () => this.setTool(EMOJI_PICKAXE);

    const tool_flag = document.createElement("div");
    tool_flag.classList.add("flag");
    tool_flag.innerText = EMOJI_FLAG;
    tool_flag.onclick = () => this.setTool(EMOJI_FLAG);

    tools.append(tool_pickaxe, tool_flag);
    this.board.append(tools);
    this.setTool(EMOJI_PICKAXE);

    this.setState("newgame");
    this.updateFlagCount();
  }

  updateFlagCount() {
    var correct = 0;
    var incorrect = 0;
    for (var r = 0; r < this.cells.length; r++) {
      for (var c = 0; c < this.cells[r].length; c++) {
        if (!this.cells[r][c].isState("flag")) continue;

        if (this.cells[r][c].bomb) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }
    this.flagcount.innerText = `${correct + incorrect}/${this.count}`;
  }

  onclick(cell) {
    if (this.isState("gameover")) return;

    if (this.isTool(EMOJI_FLAG)) {
      if (this.isState("newgame")) return;
      if (cell.isState("revealed")) return;

      //toggles the state
      cell.setState(cell.isState("flag") ? "unknown" : "flag");

      this.updateFlagCount();

      return;
    }

    if (this.isState("newgame")) this.placeMines(cell);

    if (cell.isState("flag")) return;

    if (cell.bomb) return this.explode();

    var count = 0;

    for (var r = cell.row - 1; r <= cell.row + 1; r++) {
      for (var c = cell.column - 1; c <= cell.column + 1; c++) {
        try {
          if (this.cells[r][c].bomb) {
            count++;
          }
        } catch (e) {}
      }
    }

    cell.setState("revealed");

    if (count > 0) return (cell.element.innerText = count);

    for (var r = cell.row - 1; r <= cell.row + 1; r++) {
      for (var c = cell.column - 1; c <= cell.column + 1; c++) {
        try {
          if (this.cells[r][c].isState("unknown")) {
            this.onclick(this.cells[r][c]);
          }
        } catch (e) {}
      }
    }
  }

  placeMines(origin) {
    this.timer.start();

    var buffer = [];
    for (var r = 0; r < this.cells.length; r++) {
      for (var c = 0; c < this.cells[r].length; c++) {
        if (Math.abs(r - origin.row) > 1 || Math.abs(c - origin.column) > 1) {
          buffer.push(this.cells[r][c]);
        }
      }
    }
    for (var i = 0; i < this.count; i++) {
      const index = Math.floor(Math.random() * buffer.length);
      const choice = buffer[index];
      buffer = buffer.filter((data) => data != choice);
      choice.bomb = true;
    }

    this.setState("playing");
  }

  setState(state) {
    this.board.dataset.state = state;
  }

  getState() {
    return this.board.dataset.state;
  }

  isState(state) {
    return this.getState() == state;
  }

  setTool(tool) {
    this.board.dataset.tool = tool;
  }

  getTool() {
    return this.board.dataset.tool;
  }

  isTool(tool) {
    return this.getTool() == tool;
  }

  explode() {
    this.timer.stop();
    for (var r = 0; r < this.cells.length; r++) {
      for (var c = 0; c < this.cells[r].length; c++) {
        if (this.cells[r][c].bomb && this.cells[r][c].isState("unknown")) {
          this.cells[r][c].setState("exploded");
        }
      }
    }
    this.setState("gameover");
  }
}

new Game(10, 10, 20);
