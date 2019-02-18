//VARS
var lines = [];
var userLines = [];
var undoLines = [];
var moveNum = 1;
var size = 2;
var ci = {
  width: $(window).width(),
  height: $(window).height()
}
var cv = {
  canvas : document.createElement("canvas"),
  render : function() {
    this.canvas.width = ci.width;
    this.canvas.height = ci.height;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  }
}
var mousePos = {
  lastX: 0,
  lastY: 0,
  x: 0,
  y: 0
};
var lastMouse = {
  x: 0,
  y: 0,
}
var color = {
  r: 255,
  g: 255,
  b: 255
}
var mouseDown;
var c = cv.canvas;
var ctx = c.getContext("2d");

var mode = "line";

drawingRef.on('value', function(liness) {
  if(liness.val() == null) {
    lines = [];
  } else {
    lines = liness.val().lines;
    drawLines(lines);
  }
});

function anyMove() {
  drawLines()
  if(mouseDown) {
    if (mode == "line") {
      var line = {
        colorr: color.r,
        colorg: color.g,
        colorb: color.b,
        size: size,
        startX: mousePos.lastX,
        startY: mousePos.lastY,
        endX: mousePos.x,
        endY: mousePos.y,
        moveNum,
        mode
      }
      writeLines(line);
    }
    if (mode == "circle") {
      drawEllipse({startX: mousePos.x, startY: mousePos.y, endX: lastMouse.x, endY: lastMouse.y});
    }
  } else {
    lastMouse = {x: mousePos.x, y: mousePos.y};
  }
}

function drawEllipse(e) {
  let x1 = e.startX;
  let x2 = e.endX;
  let y1 = e.startY;
  let y2 = e.endY;
    var radiusX = (x2 - x1) * 0.5,
        radiusY = (y2 - y1) * 0.5,
        centerX = x1 + radiusX,
        centerY = y1 + radiusY,
        step = 0.01,
        a = step,
        pi2 = Math.PI * 2 - step;

    ctx.beginPath();
    ctx.moveTo(centerX + radiusX * Math.cos(0),
               centerY + radiusY * Math.sin(0));

    for(; a < pi2; a += step) {
        ctx.lineTo(centerX + radiusX * Math.cos(a),
                   centerY + radiusY * Math.sin(a));
    }

    ctx.closePath();
    ctx.strokeStyle = '#FFF';
    ctx.stroke();
}
//DRAWING
function drawLines() {
  ctx.clearRect(0, 0, ci.width, ci.height);
  if (lines == null) return;
  Object.values(lines).forEach((e)=> {
    if (e.mode == "line") {
      drawLine(e);
    } else if (e.mode == "circle") {
      drawEllipse(e);
    }
  })
}

function drawLine(line) {
  ctx.beginPath();
  ctx.moveTo(line.startX, line.startY);
  ctx.lineWidth = line.size;
  ctx.strokeStyle = "rgb("+line.colorr+","+line.colorg+","+line.colorb+")";
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.globalCompositeOperation = "source-over";
  ctx.lineTo(line.endX, line.endY);
  ctx.stroke();
}

function writeLines(line) {
  userLines.push(drawingRef.child("lines").push(line).key);
}

function pushAllLines() {
  drawingRef.child("lines").set(lines);
}

function subtract(arr1, arr2) {
  let arr = [];
  arr1.forEach((e)=>{
    let isInList = arr2.indexOf(e) == -1;
    if (isInList) {
      arr.push(e);
    }
  });
  return arr;
}

function subtractObj(obj1, obj2) {
  let obj = {};
  if (obj1 == null) debugger
  Object.keys(obj1).forEach((e)=>{
    let isInList = Object.keys(obj2).indexOf(e) == -1;
    if (isInList) {
      obj[e] = obj1[e];
    }
  });
  return obj;
}

function getLine(l) {
  return lines[l];
}

function getLines(l) {
  return l.map((line) => {
    return lines[line];
  });
}

function undo() {
  let toUndo = {};
  userLines.some((e)=> {
    let line = getLine(e)
    if (line != null) {
      if (line.moveNum == moveNum-1) {
        toUndo[e] = line;
        undoLines.push(line);
      }
    }
  });

  lines = subtractObj(lines, toUndo);
  userLines = subtract(userLines, Object.keys(toUndo));
  pushAllLines();
  drawLines();
  if (moveNum > 0) {
    moveNum--;
  }
}

$(document).ready(()=> {
  cv.render();
  $(document).attr("title", "ODraw: " + getUrlVars()["id"]);
})

function redo() {
  if (undoLines.length == 0) return;
  var oldMoveNum = undoLines[undoLines.length - 1].moveNum;
  var undidMove = [];

  for (let line of undoLines) {
    if (line.moveNum == oldMoveNum) {
      undidMove.push(line);
    }
  }

  undoLines = subtract(undoLines, undidMove);
  undidMove.map((l) => l.moveNum = moveNum);
  moveNum++;
  for (let l of undidMove) {
    writeLines(l);
  }
}

$(document).mouseup(() => {
  mouseDown = false;
  moveNum++;
  if (mode == "circle") {
    var line = {
      colorr: color.r,
      colorg: color.g,
      colorb: color.b,
      size: size,
      startX: lastMouse.x,
      startY: lastMouse.y,
      endX: mousePos.x,
      endY: mousePos.y,
      moveNum,
      mode
    }
    writeLines(line);
  }
});

$(document).keydown((e) => {
  var keynum = e.keyCode;
  var key = String.fromCharCode(keynum);
  if (e.metaKey && key != "R") {
    e.preventDefault();
  }
  if(key == "1") {
    color.r+=10;
  } else if (key == "2") {
    color.g+=10;
  } else if (key == "3") {
    color.b+=10;
  }
  if(key == "q") {
    color.r-=10;
  } else if (key == "W") {
    color.g-=10;
  } else if (key == "E") {
    color.b-=10;
  } else if (key == "Z" && e.metaKey) {
    undo();
  } else if (key == "Y" && e.metaKey) {
    redo();
  } else if (key == "P") {
    mode = "line";
  } else if (key == "O") {
    mode = "circle";
  }
  $("#color").css('background-color', 'rgb('+color.r+','+color.g+','+color.b+')');
  if(key == "h") {
    modal("switch");
  }
  if(key == "C") {
    drawingRef.remove();
    userLines = [];
    ctx.clearRect(0, 0, ci.width, ci.height);
  }
});

$(c).mousemove((e) => {
  var rect = c.getBoundingClientRect();
  mousePos = {
    lastX: mousePos.x,
    lastY: mousePos.y,
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  anyMove();
});

$(c).mousedown(() => {
  mouseDown = true;
});

$(c).mousewheel((e) => {
  if (e.deltaY >= 1) size+=.1;
  else if (e.deltaY <= -1) size-=.1;
  ctx.lineWidth = size;
  $("#brushSize").html(size);
});
