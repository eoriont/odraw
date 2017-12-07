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
var span = $(".close");

var mode = "line";

//FIREBASE INIT
var config = {
  apiKey: "AIzaSyCb9Nxkj52W_mNVnZKY_18QlGerxbs0Ogc",
  authDomain: "odraw-x.firebaseapp.com",
  databaseURL: "https://odraw-x.firebaseio.com",
  projectId: "odraw-x",
  storageBucket: "odraw-x.appspot.com",
  messagingSenderId: "885108201960"
};
firebase.initializeApp(config);
var database = firebase.database();
var dblink = 'drawing/'+getUrlVars()["id"];
var drawingRef = firebase.database().ref(dblink);
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
  return l.map((line)=> {
    return lines[line]
  })
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

//PAGE SCRIPTS
$(document).ready(() => {
  cv.render();
  $("#close").click(function() {
    modal(false);
  });
})

function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

function modal(state) {
  var modal = $("#options");
  if(state == "switch") {
    $(modal).toggle();
  } else if(state) {
    $(modal).show();
  } else {
    $(modal).hide();
  }
}

window.requestAnimFrame = (function (callback) {
  return window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimaitonFrame ||
  function (callback) {
    window.setTimeout(callback, 1000/60);
  };
})();

// (function drawLoop () {
//   requestAnimFrame(drawLoop);
// })();


window.onmouseup = function() {
  mouseDown=false;
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
}

function getKeyPressed(event) {
  var keynum;
  if(window.event) {
    keynum = event.keyCode;
  } else if(e.which){
    keynum = e.which;
  }

  var key = String.fromCharCode(keynum);
  if(key == "1") {
    color.r+=10;
  } else if (key == "2") {
    color.g+=10;
  } else if (key == "3") {
    color.b+=10;
  }
  if(key == "q") {
    color.r-=10;
  } else if (key == "w") {
    color.g-=10;
  } else if (key == "e") {
    color.b-=10;
  } else if (key == "z") {
    undo();
  } else if (key == "p") {
    mode = "line";
  } else if (key == "o") {
    mode = "circle";
  }
  $("#color").css('background-color', 'rgb('+color.r+','+color.g+','+color.b+')');
  if(key == "h") {
    modal("switch");
  }
  if(key == "c") {
    drawingRef.remove();
    userLines = [];
    ctx.clearRect(0, 0, ci.width, ci.height);
  }
}
function mouseWheel(e) {
  if (event.wheelDelta >= 120)
    size++;
  else if (event.wheelDelta <= -120)
    size--;
  ctx.lineWidth = size;
  $("#brushSize")[0].innerHTML = "(Scroll With the Mouse Wheel) Brush Size: "+size;
}

$(c).on('mousemove', mouseMove);
c.addEventListener('mousedown', () => {mouseDown = true;});
$(document).on('keypress', getKeyPressed);
document.addEventListener('wheel', mouseWheel);

function getMousePos(evt) {
  var rect = c.getBoundingClientRect();
  return {
    lastX: mousePos.x,
    lastY: mousePos.y,
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

//FUNCTION EVENT LISTENERS
function mouseMove(evt) {
  mousePos = getMousePos(evt);
  anyMove();
}

/////////////////////////////////////////

c.addEventListener("touchstart", function (e) {
  mousePos = getTouchPos(e);
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  c.dispatchEvent(mouseEvent);
}, false);

c.addEventListener("touchend", function (e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  c.dispatchEvent(mouseEvent);
}, false);

c.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  c.dispatchEvent(mouseEvent);
}, false);

function getTouchPos(touchEvent) {
  var rect = c.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}

window.onload = function() {
  document.body.addEventListener("touchstart", function (e) {
    if (e.target == c) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchend", function (e) {
    if (e.target == c) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchmove", function (e) {
    if (e.target == c) {
      e.preventDefault();
    }
  }, false);
}

