//VARS
var lines = [];
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
  r: 0,
  g: 0,
  b: 0
}
var mouseDown;
var c = cv.canvas;
var ctx = c.getContext("2d");
var elm = {
  brushsize: document.getElementById('brushSize'),
  color: document.getElementById('color')
};
var span = $(".close");

//FIREBASE INIT
var config = {
  apiKey: "AIzaSyAEkGP-cMQYQ0Vus6UC6KNQebzhduLieQo",
  authDomain: "odraw-dynamic.firebaseapp.com",
  databaseURL: "https://odraw-dynamic.firebaseio.com",
  storageBucket: "odraw-dynamic.appspot.com",
  messagingSenderId: "248622176221"
};
firebase.initializeApp(config);
var database = firebase.database();
var dblink = 'drawing/'+getUrlVars()["id"];
var drawingRef = firebase.database().ref(dblink);
drawingRef.on('value', function(liness) {
  if(liness.val() == null) {
    lines = [];
  } else {
    lines = liness.val();
    drawLines(lines);
  }
});

//EVENT LISTENERS
$(c).on('mousemove', mouseMove);
c.addEventListener('mousedown', function() {mouseDown=true;});
c.addEventListener('mouseup', function() {mouseDown=false;});
$(document).on('keypress', function(e) {getKeyPressed(e);});
c.addEventListener('wheel', mouseWheel);

  c.addEventListener("touchstart", function (event) {
    if (event.targetTouches.length > 1) return; //touch with only 1 finger

      mouseDown = true;

    event.preventDefault();
  });

  c.addEventListener("touchmove", function (event) {
    touchMove(event);
    event.preventDefault();
  });

  c.addEventListener("touchend", function (event) {
    if (event.targetTouches.length > 0) return; //touch with only 1 finger

    mouseDown = false;
  });
function getMousePos(canvas, evt) {
  var rect = c.getBoundingClientRect();
  return {
    lastX: mousePos.x,
    lastY: mousePos.y,
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
function getTouchMousePos(canvas, evt) {
  var rect = c.getBoundingClientRect();
  return {
    lastX: mousePos.x,
    lastY: mousePos.y,
    x: evt.changedTouches[0].clientX - rect.left,
    y: evt.changedTouched[0].clientY - rect.top
  };
}

//FUNCTION EVENT LISTENERS
function touchMove(evt) {
  mousePos = getTouchMousePos(c, evt);
  anyMove();
}
function mouseMove(evt) {
  mousePos = getMousePos(c, evt);
  anyMove();
}
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
      endY: mousePos.y
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
  }
  $(elm).css('background-color', 'rgb('+color.r+','+color.g+','+color.b+')');
  if(key == "h") {
    modal("switch");
  }
  if(key == "c") {
    drawingRef.remove();
    ctx.clearRect(0, 0, ci.width, ci.height);
  }
}
function mouseWheel(e) {
  if (event.wheelDelta >= 120)
    size++;
  else if (event.wheelDelta <= -120)
    size--;
  ctx.lineWidth = size;
  elm.brushsize.innerHTML = "(Scroll With the Mouse Wheel) Brush Size: "+size;
}

//DRAWING
function drawLines() {
  var keys = Object.keys(lines);
  for(var i = 0; i < keys.length; i++) {
    drawLine(lines[keys[i]]);
  }
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
  firebase.database().ref(dblink).push(line);
}

//PAGE SCRIPTS
$(".close").click(function() {
  modal(false);
});
$("#myModal").click(function() {
  modal(false);
});
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
$(document).ready(function() {
  cv.render();
});
function modal(state) {
  var modal = $("#myModal");
  if(state == "switch") {
    $(modal).toggle();
  } else if(state) {
    $(modal).show();
  } else {
    $(modal).hide();
  }
  console.log("switch");
}
