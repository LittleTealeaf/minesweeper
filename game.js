const board = document.getElementById("board");
const table = document.getElementById("table");

const EMOJI_FLAG = "🚩";
const EMOJI_PICKAXE = "⛏️";

function setTool(choice) {
  board.dataset.tool = choice;
}

function isTool(tool) {
  return board.dataset.tool == tool;
}

// make the tool selector
const div_pickaxe = document.createElement("div");
div_pickaxe.classList.add("mine");
div_pickaxe.innerText = EMOJI_PICKAXE;
div_pickaxe.onclick = () => setTool(EMOJI_PICKAXE);
tool.append(div_pickaxe);

const div_flag = document.createElement("div");
div_flag.classList.add("flag");
div_flag.onclick = () => setTool(EMOJI_FLAG);
div_flag.innerText = EMOJI_FLAG;
tool.append(div_flag);

setTool(EMOJI_PICKAXE);

var areMinesSet = false;
var cells;

class Cell {
  constructor(row, column) {
    this.row = row;
    this.column = column;
    this.bomb = false;

    this.element = document.createElement("td");

    this.element.onclick = () => this.onclick();

    this.setState("blank");
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

  onclick() {
    if (isTool("🚩")) {
      if (this.isState("blank")) return this.setState("flag");
      if (this.isState("flag")) return this.setState("blank");
      return;
    }

    if (this.isState("flag")) return;

    if (!areMinesSet) setMines(this.row, this.column);

    if(this.bomb) return explode();

    var count = 0;

    for(var i = -1; i <= 1; i++) {
      for(var j = -1; j <= 1; j++) {
        try {
          if(cells[this.row + i][this.column + j].bomb) {
            count++;
          }
        } catch(e) {}
      }
    }


    this.setState("revealed");

    if(count > 0) {
      return this.element.innerText = count;
    }

    for(var i = this.row - 1; i <= this.row + 1; i++) {
      for(var j = this.column - 1; j <= this.column + 1; j++) {
        try {
          if(cells[i][j].isState("blank")) {
            cells[i][j].onclick();
          }
        } catch(e){}
      }
    }

  }
}

function explode() {
  for(var i = 0; i < cells.length; i++) {
    for(var j = 0; j < cells[i].length; j++) {
      if(cells[i][j].bomb) {
        cells[i][j].setState("exploded");
      }
    }
  }
}

function setMines(row, column) {
  var count = cells.length * cells[0].length / 5;

  var buffer = [];
  for(var r = 0; r < cells.length; r++) {
    for(var c = 0; c < cells[r].length; c++) {
      if(Math.abs(r - row) > 1 || Math.abs(c - column) > 1) {
        buffer.push(cells[r][c]);
      }
    }
  }

  for(var i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * buffer.length);
    const choice = buffer[index];
    buffer = buffer.filter(data => data != choice);
    choice.bomb = true;
  }
  areMinesSet = true;
}

function setBoard(rows, columns) {
  areMinesSet = false;
  table.innerHTML = "";
  cells = [];

  for (var r = 0; r < rows; r++) {
    const tr = document.createElement("tr");
    const row_cells = [];

    for (var c = 0; c < columns; c++) {
      const cell = new Cell(r, c);

      tr.append(cell.element);
      row_cells.push(cell);
    }

    table.append(tr);
    cells.push(row_cells);
  }
}

setBoard(10, 10);
