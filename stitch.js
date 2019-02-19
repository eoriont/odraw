const client = stitch.Stitch.initializeDefaultAppClient('odraw-ouzze');

const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('odraw');

client.auth.loginWithCredential(new stitch.AnonymousCredential()).catch(err => {
  console.error(err)
});

var canvasCollection = db.collection('canvases');
var userId = client.auth.user.id;
var _id = new stitch.BSON.ObjectId(getUrlVars()["id"]);

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

function clearMovesDB() {
  canvasCollection.updateOne({_id}, {$unset: {"moves": 0}});
}

function redoDB(move) {
  let obj = {};
  obj["moves."+move.id] = move;
  canvasCollection.updateOne({_id}, {$set: obj}).then((doc) => {
    drawMoves();
  }).catch(err => console.error);
}

function undoDB(move) {
  let obj = {};
  obj["moves."+move.id] = 0;
  canvasCollection.updateOne({_id}, {$unset: obj}).then((doc) => {
    drawMoves();
  }).catch(err => console.error);
}

function upToDate(obj1, obj2) {
  for (let k in obj1) {
    if (!deepEqual(obj1[k], obj2[k])) {
      return false;
    }
  }
  return true;
}

var ttime = 1;
function writeToDb() {
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
