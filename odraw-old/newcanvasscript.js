// Initialize Firebase
var config = {
  apiKey: "AIzaSyAEkGP-cMQYQ0Vus6UC6KNQebzhduLieQo",
  authDomain: "odraw-dynamic.firebaseapp.com",
  databaseURL: "https://odraw-dynamic.firebaseio.com",
  storageBucket: "odraw-dynamic.appspot.com",
  messagingSenderId: "248622176221"
};
firebase.initializeApp(config);

var db = firebase.database();
var drawingRef = db.ref('drawing');
var canvasList = [];

$(document).ready(function() {
  $("#newDrawing").click(createDrawing);
});

function createDrawing() {
  var newDrawingRef = drawingRef.push({
    test: 1
  });
  var drawId = newDrawingRef.key;

  location.href = "new.html?id="+drawId;
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
drawingRef.once('value').then((snap) => {
  let data = snap.val();
  var keys = Object.keys(data);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    console.log(key);
    $("table").append('<tr><td><a href="new.html?id='+key+'">'+key+'</a></td></tr>');
  }
});
