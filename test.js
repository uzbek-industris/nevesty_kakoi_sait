class Node {
  constructor(x, y, isWall) {
    this.x = x;
    this.y = y;
    this.isWall = isWall;
    this.gScore = Infinity;
    this.fScore = Infinity;
    this.cameFrom = null;
  }
}

function heuristic(node1, node2) {
  return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
}

class Map {
  constructor(count, cellSize) {
    this.count = count;
    this.cellSize = cellSize;
    this.width = this.count * this.cellSize;
    this.height = this.count * this.cellSize;
    this.tiles = [];
    for (let x = 0; x < this.count; x++) {
			this.tiles.push([]);
			for (let y = 0; y < this.count; y++) {
				this.tiles[x].push(new Node(x, y, false));
			}
		}
    this.startCell = null;
    this.finishCell = null;
    this.currentPath = [];
  }

  clearPath() {
    for (let x = 0; x < this.count; x++) {
      for (let y = 0; y < this.count; y++) {
        this.tiles[x][y].isPath = false;
      }
    }
  }

  updateTileColor(x, y, color) {
    if (this.tiles[x] && this.tiles[x][y]) {
      let tile = this.tiles[x][y];
      switch (color) {
        case 1: // стена
          tile.isWall = true;
          break;
        case 2: // стартовая ячейка
          tile.isWall = false;
          this.startCell = [x, y];
          break;
        case 3: // финишная ячейка
          tile.isWall = false;
          this.finishCell = [x, y];
          break;
        case 4: // ячейка на пути
          tile.isWall = false;
          tile.isPath = true;
          break;
        default: // обычная ячейка
          tile.isWall = false;
          break;
      }
      this.draw(canvas, 0, 0, this.width, this.height);
    }
  }

  draw(canvas, x, y, width, height) {
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startCol = Math.max(0, Math.floor(x / this.cellSize));
    let endCol = Math.min(this.count, Math.ceil((x + width) / this.cellSize));
    let startRow = Math.max(0, Math.floor(y / this.cellSize));
    let endRow = Math.min(this.count, Math.ceil((y + height) / this.cellSize));

    for (let col = startCol; col < endCol && col < this.tiles.length; col++) {
			for (let row = startRow; row < endRow && row < this.tiles.length; row++) {
				let tile = this.tiles[col][row];
				if (tile.isPath) {
					ctx.fillStyle = "yellow";
				} 
        else {
					ctx.fillStyle = tile.isWall ? "#444" : "#eee";
				}
				if (this.startCell && col === this.startCell[0] && row === this.startCell[1]) {
					ctx.fillStyle = "green";
				} else if (this.finishCell && col === this.finishCell[0] && row === this.finishCell[1]) {
					ctx.fillStyle = "red";
				}
					ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
			}
		}
  }

  getNeighbors(node) {
    let neighbors = [];
    let x = node.x;
    let y = node.y;
    if (x > 0) {
      if (!this.tiles[x - 1][y].isWall) {
        neighbors.push(this.tiles[x - 1][y]);
      }
      if (y > 0 && !this.tiles[x - 1][y - 1].isWall) {
        neighbors.push(this.tiles[x - 1][y - 1]);
      }
      if (y < this.count - 1 && !this.tiles[x - 1][y + 1].isWall) {
        neighbors.push(this.tiles[x - 1][y + 1]);
      }
    }
    if (x < this.count - 1) {
      if (!this.tiles[x + 1][y].isWall) {
        neighbors.push(this.tiles[x + 1][y]);
      }
      if (y > 0 && !this.tiles[x + 1][y - 1].isWall) {
        neighbors.push(this.tiles[x + 1][y - 1]);
      }
      if (y < this.count - 1 && !this.tiles[x + 1][y + 1].isWall) {
        neighbors.push(this.tiles[x + 1][y + 1]);
      }
    }
    if (y > 0 && !this.tiles[x][y - 1].isWall) {
      neighbors.push(this.tiles[x][y - 1]);
    }
    if (y < this.count - 1 && !this.tiles[x][y + 1].isWall) {
      neighbors.push(this.tiles[x][y + 1]);
    }
    return neighbors;
  }

  aStar() {
    let openSet = [this.tiles[this.startCell[0]][this.startCell[1]]];
    let closedSet = [];
    this.tiles[this.startCell[0]][this.startCell[1]].gScore = 0;
    this.tiles[this.startCell[0]][this.startCell[1]].fScore = heuristic(this.tiles[this.startCell[0]][this.startCell[1]], this.tiles[this.finishCell[0]][this.finishCell[1]]);
    while (openSet.length > 0) {
      let current = openSet.reduce((a, b) => a.fScore < b.fScore ? a : b);
      if (current.x === this.finishCell[0] && current.y === this.finishCell[1]) {
        // путь найден
        let path = [current];
        while (current.cameFrom) {
          path.push(current.cameFrom);
          current = current.cameFrom;
        }
        this.currentPath = path; // Сохраняем текущий путь в currentPath
        return path.reverse();
      }
      openSet.splice(openSet.indexOf(current), 1);
      closedSet.push(current);
      let neighbors = this.getNeighbors(current);
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (closedSet.includes(neighbor)) {
          continue;
        }
        let tentativeGScore = current.gScore + 1;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= neighbor.gScore) {
          continue;
        }
        neighbor.cameFrom = current;
        neighbor.gScore = tentativeGScore;
        neighbor.fScore = neighbor.gScore + heuristic(neighbor, this.tiles[this.finishCell[0]][this.finishCell[1]]);
      }
      // Обновляем currentPath
      this.currentPath = closedSet.filter(tile => tile.isPath && !this.currentPath.includes(tile));
    }
    // путь не найден
    return alert("Путь не обнаружен! Поменяй клетки!"); 
    ;
  }
}

let startbut = document.getElementById("start");
startbut.addEventListener("click", function(event) {
  if (map.finishCell) {
    map.clearPath(); // почистить отрисованный путь
    let path = map.aStar();
    if (path) {
      for (let i = 0; i < path.length; i++) {
        setTimeout(() => {
          map.updateTileColor(path[i].x, path[i].y, 4);
          map.draw(canvas, 0, 0, map.width, map.height);
          if (i === path.length - 1) {
            console.log("Путь есть!");
          }
        }, i * 15);
      }
    }
  }
});

let canvas = document.getElementById("mein-canvAss");
let finishMode = false;
let wallMode = false;

let finishRadio = document.getElementById("finish");
finishRadio.addEventListener("click", function(event) {
  finishMode = true;
  wallMode = false;
});
let wallRadio = document.getElementById("wall");
wallRadio.addEventListener("click", function(event) {
  wallMode = true;
  finishMode = false;
});

function createNewMap(count) {
	map = new Map(count, 20);
	map.updateTileColor(0, 0, 2);
	map.draw(canvas, 0, 0, count*20, count*20);
	canvas.addEventListener("click", function(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let col = Math.floor(x / map.cellSize);
    let row = Math.floor(y / map.cellSize);
    if (wallMode) {// Обновляем ячейку на стену
      map.updateTileColor(col, row, 1);
    } else if (finishMode) {
      // Обновляем ячейку на финишную
      if (map.finishCell && map.finishCell[0] === col && map.finishCell[1] === row) {
        // если финиш есть - удалить старый
        map.updateTileColor(col, row, 0);
        map.finishCell = null;
      } else {
        // поставить финиш
        map.updateTileColor(col, row, 3);
        map.finishCell = [col, row];
      }
      // Сбрасываем переменную finishMode
      finishMode = false;
    }
  });
}

createNewMap(20);

let countInput = document.getElementById("count");
countInput.addEventListener("input", () => {
  let newCount = parseInt(countInput.value);
  if (!isNaN(newCount)) {
    createNewMap(newCount);
  }
});




