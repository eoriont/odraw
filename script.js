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
  y:0
};
var color = {
  r: 255,
  g: 255,
  b: 255
}
var mouseDown;
var c = cv.canvas;
var ctx = c.getContext("2d");
var span = $(".close");

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
  if(mouseDown) {
    var line = {
      colorr: color.r,
      colorg: color.g,
      colorb: color.b,
      size: size,
      startX: mousePos.lastX,
      startY: mousePos.lastY,
      endX: mousePos.x,
      endY: mousePos.y,
      moveNum
    }
    writeLines(line);
  }
}

//DRAWING
function drawLines() {
  ctx.clearRect(0, 0, ci.width, ci.height);
  Object.values(lines).forEach((e)=> {
    drawLine(e);
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
  if (arr1 == null) debugger
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
  var modal = $("#myModal");
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

c.addEventListener("touchstart", function (e) {
  mousePos = getTouchPos(c, e);
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

function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
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
  }
  //  else if (key == "b") {
  //   moveNum++;
  // }
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
c.addEventListener('mousedown', function() {mouseDown = true;});
c.addEventListener('mouseup', function() {mouseDown=false;moveNum++;});
$(document).on('keypress', function(e) {getKeyPressed(e);});
document.addEventListener('wheel', mouseWheel);

function getMousePos(canvas, evt) {
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
  mousePos = getMousePos(c, evt);
  anyMove();
}