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

$(document).ready(function() {
  $("#newDrawing").click(createDrawing);

  $("#submit_code").click(() => {
    let code = parseInt($("#passcode").val());
    console.log(code)
    db.ref('drawing/'+code).once('value').then((snap)=>{
      let data = snap.val();
      if (data) {
        location.href = "new.html?id="+code;
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