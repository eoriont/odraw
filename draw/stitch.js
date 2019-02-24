const client = stitch.Stitch.initializeDefaultAppClient('odraw-ouzze');

const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('odraw');

client.auth.loginWithCredential(new stitch.AnonymousCredential()).catch(err => console.error);

var canvasCollection = db.collection('canvases');
var userId = client.auth.user.id;
var _id = new stitch.BSON.ObjectId(getUrlVars()["id"]);

var stream1;
async function watcher() {
  let c = this;
  canvasCollection.find({_id}).toArray().then(doc => {
    c.allMoves = doc[0].moves != null ? doc[0].moves : {};
    c.drawMoves();
  });

  stream1 = await canvasCollection.watch([_id]);
  stream1.onNext(e => {
     c.allMoves = e.fullDocument.moves != null ? e.fullDocument.moves : {};
     c.drawMoves();
   });
}

function clearMovesDB() {
  canvasCollection.updateOne({_id}, {$unset: {"moves": 0}});
}

function redoDB(move) {
  let c = this;
  let obj = {};
  obj["moves."+move.id] = move;
  canvasCollection.updateOne({_id}, {$set: obj}).then((doc) => {
    c.drawMoves();
  }).catch(err => console.error);
}

function undoDB(move) {
  let c = this;
  let obj = {};
  obj["moves."+move.id] = 0;
  canvasCollection.updateOne({_id}, {$unset: obj}).then((doc) => {
    c.drawMoves();
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
  if (Object.keys(this.newChanges).length != 0) {
    let moves = {};
    for (let m in this.newChanges) {
      moves["moves."+m] = this.newChanges[m];
    }
    let c = this;
    canvasCollection.updateOne({_id}, {$set: moves}).then(() => {
      console.log(upToDate(c.newChanges, c.allMoves))
      if (upToDate(c.newChanges, c.allMoves)) {
          c.newChanges = {};
      }
      setTimeout(writeToDb.bind(c), ttime);
    }).catch(err => console.error);
  } else {
    setTimeout(writeToDb.bind(this), ttime);
  }
}
