const client = stitch.Stitch.initializeDefaultAppClient('odraw-ouzze');

const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('odraw');

var canvasCollection;

document.addEventListener("DOMContentLoaded", () => {
  client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(doc => {
    document.getElementById("newDrawing").onclick = createDrawing;
    document.getElementById("submitCode").onclick = () => {
      var code = document.getElementById("canvasId").value;
      if (code.length == 24) {
        canvasCollection.find({_id: new stitch.BSON.ObjectId(code)}).toArray().then((result) => {
          if (result.length == 0) {
            findError(code);
            return;
          }
          window.location = `/draw?id=${result[0]._id}`;
        }).catch(err => console.error);
      } else {
        findError(code)
      }
    };

    canvasCollection.find({}).toArray().then((result) => {
      for (let i of result) {
        let link = document.createElement("a");
        link.classList.add("list-group-item", "list-group-item-action");
        link.href = `/draw?id=${i._id}`;
        link.innerHTML = i._id;
        document.getElementById("canvasList").appendChild(link);
      }
    }).catch(err => console.error);

    document.getElementById("closeAlert").onclick = closeError;
  }).catch(err => console.error);

  canvasCollection = db.collection('canvases');

});

function closeError() {
  document.getElementById("errstatus").classList.remove("showErr");
}

function findError(code) {
  document.getElementById("errstatus").classList.add("showErr");
  setTimeout(closeError, 5000)
}

function createDrawing() {
  canvasCollection.insertOne({userid: client.auth.user.id}).then((result) => {
    window.location = "draw?id="+result.insertedId;
  }).catch(err => console.error)
}
