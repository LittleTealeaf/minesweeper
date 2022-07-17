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

class Game {
  constructor(rows, columns) {
    this.board = document.getElementById("board");
    this.board.innerHTML = "";

    const title = document.createElement("h1");
    title.innerText = "Minesweeper";
    this.board.append(title);

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
  }

  onclick(cell) {
    if(this.isState("gameover")) return;

    if (this.isTool(EMOJI_FLAG)) {
      if (cell.isState("unknown")) return cell.setState("flag");
      if (cell.isState("flag")) return cell.setState("unknown");
      return;
    }

    if (cell.isState("flag")) return;

    if (this.isState("newgame")) this.placeMines(cell);

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
    var count = (this.cells.length * this.cells[0].length) / 5;

    var buffer = [];
    for (var r = 0; r < this.cells.length; r++) {
      for (var c = 0; c < this.cells[r].length; c++) {
        if (Math.abs(r - origin.row) > 1 || Math.abs(c - origin.column) > 1) {
          buffer.push(this.cells[r][c]);
        }
      }
    }
    for (var i = 0; i < count; i++) {
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

new Game(10, 10);
