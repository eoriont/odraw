var navState = false;
var toolSelected = "pencil";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("close").onclick = () => closeNav();

  document.getElementById('brushSize').oninput = () => {
    ocanvas.brushSize = document.getElementById('brushSize').value;
  };

  document.getElementById("col").value = "#FFFFFF"
  document.getElementById("col").oninput = e => {
    var c = document.getElementById("col").value;
    ocanvas.color = c;
    updateColor(c);
  };

  document.getElementById("tools").addEventListener("click", (e) => {
    var child = e.target;
    var parent = child.parentNode;
    if (parent.id == toolSelected || parent.parentNode.id != "tools") return;
    parent.children[0].classList.add("selected");
    document.getElementById(toolSelected).children[0].classList.remove("selected")
    toolSelected = parent.id;
  })
});

function updateColor(c) {
  document.getElementById("test_wrapper").style['background-color'] = c;
}

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