const client = stitch.Stitch.initializeDefaultAppClient('odraw-ouzze');

const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('odraw');

client.auth.loginWithCredential(new stitch.AnonymousCredential()).catch(err => console.error);

var canvasCollection = db.collection('canvases');

$(document).ready(function() {
  $("#newDrawing").click(createDrawing);

  $("#submit_code").click(() => {
  
  });
});

function createDrawing() {
  canvasCollection.insertOne({userid: client.auth.user.id}).then((result) => {
    location.href = "new.html?id="+result.insertedId;
  }).catch(err => console.error)

}
