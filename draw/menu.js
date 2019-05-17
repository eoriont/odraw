var navState = false;
var toolSelected = "pencil";
var toolElm = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("close").onclick = () => closeNav();

  document.getElementById('brushSize').oninput = () => {
    ocanvas.brushSize = document.getElementById('brushSize').value;
  };

  document.getElementById("col").value = "#FFFFFF"
  document.getElementById("col").oninput = e => {
    var c = document.getElementById("col").value;
    ocanvas.color = c;
    document.getElementById("test_wrapper").style['background-color'] = c;
  };

  toolElm = document.getElementById("pencil")
  document.getElementById("tools").addEventListener("click", (e) => {
    var child = e.target;
    var parent = child.parentNode;
    parent.children[0].classList.add("selected");
    toolElm.children[0].classList.remove("selected")
    toolElm = parent;
    toolSelected = parent.id;

  })
});

function toggleNav() {
  if (navState) closeNav();
  else openNav();
}

function openNav() {
  navState = true;
  document.getElementById("sidenav").style.left = "0px";
}

function closeNav() {
  navState = false;
  document.getElementById("sidenav").style.left = "-250px";
}