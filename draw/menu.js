var navState = false;

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
});



function toggleNav() {
  if (navState) closeNav();
  else openNav();
}

function openNav() {
  navState = true;
  document.getElementById("sidenav").style.width = "250px";
}

function closeNav() {
  navState = false;
  document.getElementById("sidenav").style.width = "0px";
}
