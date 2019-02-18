var navState = false;

$(document).ready(() => {
  $("#close").click(function() {
    closeNav();
  });

  $("#brushSize").on('input', () => {
    size = $("#brushSize").val();
  })

  $("#col").val("#FFFFFF");
  $("#col").change(function(){
    var c = $("#col").val();
    color = c;
    $("#test_wrapper").css('background-color', c);
  });
});

function toggleNav() {
  if (navState) closeNav();
  else openNav();
}

function openNav() {
  navState = true;
  $("#sidenav").width(250);
}

function closeNav() {
  navState = false;
  $("#sidenav").width(0);
}
