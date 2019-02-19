var size = 2;
var color = "#FFFFFF"

var mouseDown = false;
var mousePos = {
  lastX: 0,
  lastY: 0,
  x: 0,
  y: 0
};

var c = $("<canvas></canvas>");
var ctx = $(c)[0].getContext("2d");

var userMoves = {};
var moveIdsList = [];
var currentMove = {};

var allMoves = {};

var undoMoves = {};
var undoMoveIdsList = [];

var canvasId = getUrlVars()["id"];
var canvasCollection = db.collection('canvases');
var userId = client.auth.user.id;
var _id = new stitch.BSON.ObjectId(canvasId);

var newChanges = {};

$(document).ready(() => {
  $(c).attr('width', $(window).width());
  $(c).attr('height', $(window).height());
  $("#main").append($(c))
  $(document).attr("title", "ODraw: " + canvasId);
  watcher();
  writeToDb();
});

var stream1;
async function watcher() {
  canvasCollection.find({_id}).toArray().then((doc) => {
    allMoves = doc[0].moves != null ? doc[0].moves : {};
    drawMoves();
  });

  stream1 = await canvasCollection.watch([_id]);
  stream1.onNext((event) => {
     allMoves = event.fullDocument.moves != null ? event.fullDocument.moves : {};
     console.log(Object.keys(allMoves).length)
     drawMoves();
   });
}

function upToDate(obj1, obj2) {
  for (let k in obj1) {
    if (!deepEqual(obj1[k], obj2[k])) {
      return false;
    }
  }
  return true;
}

const ttime = 1;
function writeToDb() {
  console.log('dbwrite')
  if (Object.keys(newChanges).length != 0) {
    let moves = {};
    for (let m in newChanges) {
      moves["moves."+m] = newChanges[m];
    }

    canvasCollection.updateOne({_id}, {$set: moves}).then(() => {
      if (upToDate(newChanges, allMoves)) {
        newChanges = {};
      }
      setTimeout(writeToDb, ttime);
    }).catch(err => console.error);
  } else {
    setTimeout(writeToDb, ttime);
  }
}

function deepEqual (x, y) {
  if (x === y) {
    return true;
  }
  else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
    if (Object.keys(x).length != Object.keys(y).length)
      return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop))
      {
        if (! deepEqual(x[prop], y[prop]))
          return false;
      }
      else
        return false;
    }

    return true;
  }
  else
    return false;
}

function genId() {
  var id = '_' + Math.random().toString(36).substr(2, 9);
  moveIdsList.push(id);
  return id;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function anyMove() {
  drawMoves();
  if(mouseDown) {
    var move = currentMove;
    if (Object.keys(currentMove).length == 0) {
      move = {
        mode: "line",
        color,
        size,
        id: genId(),
        userId,
        data: [
          new Point(mousePos.lastX, mousePos.lastY),
          new Point(mousePos.x, mousePos.y)
        ]
      }
    } else {
      move.data.push(new Point(mousePos.x, mousePos.y));
    }
    currentMove = move;
    writeMoves(move);
  }
}

function drawMoves() {
  ctx.clearRect(0, 0, $(window).width(), $(window).height());
  Object.values(allMoves).concat(Object.values(userMoves)).forEach((move) => {
    if (move.mode == "line") {
      drawLine(move);
    }
  });
}

function drawLine(line) {
  ctx.beginPath();
  ctx.moveTo(line.data[0].x, line.data[0].y);
  ctx.lineWidth = line.size;
  ctx.strokeStyle = line.color;
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.globalCompositeOperation = "source-over";
  for (let i = 1; i < line.data.length; i++) {
    let l = line.data[i];
    ctx.lineTo(l.x, l.y);
  }
  ctx.stroke();
}

function writeMoves(move) {
  userMoves[move.id] = move;
  newChanges[move.id] = move
}

function undo() {
  if (moveIdsList.length == 0) return;

  var undoMoveId = moveIdsList.pop();
  var undoMove = userMoves[undoMoveId];

  undoMoveIdsList.push(undoMoveId);
  undoMoves[undoMoveId] = undoMove;

  delete userMoves[undoMoveId];

  undoDB(undoMove);

  drawMoves();
}

function undoDB(move) {
  let obj = {};
  obj["moves."+move.id] = 0;
  canvasCollection.updateOne({_id}, {$unset: obj}).then((doc) => {
    drawMoves();
  }).catch(err => console.error);
}

function redo() {
  if (undoMoveIdsList.length == 0) return;

  var oldMoveId = undoMoveIdsList.pop();
  var oldMove = undoMoves[oldMoveId];

  moveIdsList.push(oldMoveId);
  userMoves[oldMoveId] = oldMove;

  delete undoMoves[oldMoveId];

  redoDB(oldMove);

  drawMoves()
}

function redoDB(move) {
  let obj = {};
  obj["moves."+move.id] = move;
  canvasCollection.updateOne({_id}, {$set: obj}).then((doc) => {
    drawMoves();
  }).catch(err => console.error);
}

$(c).mouseup(() => {
  mouseDown = false;
  currentMove = {};
});

$(document).keydown((e) => {
  var keynum = e.keyCode;
  var key = String.fromCharCode(keynum);
  if (e.metaKey && key != "R") {
    e.preventDefault();
  }

  if (key == "Z" && e.metaKey) {
    undo();
  } else if (key == "Y" && e.metaKey) {
    redo();
  }

  if(key == "H") {
    toggleNav();
  }
  if(key == "C") {
    userMoves = {};
    moveIdsList = [];
    canvasCollection.updateOne({_id}, {$unset: {"moves": 0}}).then(() => {
      console.log("cleared")
    })
    ctx.clearRect(0, 0, $(window).width(), $(window).height());
  }
});

$(c).mousemove((e) => {
  var rect = $(c)[0].getBoundingClientRect();
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
