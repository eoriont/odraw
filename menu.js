function modal(state) {
  var modal = $("#options");
  if(state == "switch") {
    $(modal).toggle();
  } else if(state) {
    $(modal).show();
  } else {
    $(modal).hide();
  }
}

$(document).ready(() => {
  $("#close").click(function() {
    modal(false);
  });
});
