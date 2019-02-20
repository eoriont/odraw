const client = stitch.Stitch.initializeDefaultAppClient('odraw-ouzze');

const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('odraw');

var canvasCollection;

$(document).ready(function() {
  client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(doc => {
    $("#newDrawing").click(createDrawing);
    $("#submitCode").click(() => {
      var code = $("#canvasId").val();
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
    });

    canvasCollection.find({}).toArray().then((result) => {
      for (let i of result) {
        $("#canvasList").append($(`<a href="draw?id=${i._id}" class="list-group-item list-group-item-action">${i._id}</a>"`))
      }
    }).catch(err => console.error);

    $("#closeAlert").click(closeError);
  }).catch(err => console.error);

  canvasCollection = db.collection('canvases');

});

function closeError() {
  $("#errAlert").removeClass("show");
}

function findError(code) {
  console.log("test")
  $("#errAlert").addClass("show");
  setTimeout(closeError, 5000)

}

function createDrawing() {
  canvasCollection.insertOne({userid: client.auth.user.id}).then((result) => {
    window.location = "draw?id="+result.insertedId;
  }).catch(err => console.error)

}
