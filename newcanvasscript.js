// Initialize Firebase
var config = {
  apiKey: "AIzaSyCb9Nxkj52W_mNVnZKY_18QlGerxbs0Ogc",
  authDomain: "odraw-x.firebaseapp.com",
  databaseURL: "https://odraw-x.firebaseio.com",
  projectId: "odraw-x",
  storageBucket: "odraw-x.appspot.com",
  messagingSenderId: "885108201960"
};
firebase.initializeApp(config);

var db = firebase.database();
var drawingRef = db.ref('drawing');
var canvasList = [];

$(document).ready(function() {
  $("#newDrawing").click(createDrawing);

  $("#submit_code").click(() => {
    let code = $("#passcode").val();
    db.ref('drawing/'+code).once('value').then((snap)=>{
      let data = snap.val();
      if (data) {
        location.href = "new.html?id="+id;
        
      } else {
        $("body").append("Could not find that canvas!")
      }
    });
  });
});

let id = Math.floor(Math.random()*10000);
console.log(id);
function createDrawing() {
  var newDrawingRef = db.ref('drawing/'+id).set({
    test: 1
  });

  location.href = "new.html?id="+id;
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




// drawingRef.once('value').then((snap) => {
//   let data = snap.val();
//   var keys = Object.keys(data);
//   for(var i = 0; i < keys.length; i++) {
//     var key = keys[i];
//     console.log(key);
//     $("table").append('<tr><td><a href="new.html?id='+key+'">'+key+'</a></td></tr>');
//   }
// });
