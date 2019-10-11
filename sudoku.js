$(document).ready(function(){

  //Løkke som genererer brettet
  var tabell = "<table>";
  for (var i = 0; i < 9; i++) {
    tabell += "<tr>";
    for (var j = 0; j < 9; j++) {
      tabell += "<td>";
      tabell += "<input type='text'>";
      tabell += "</td>";
    }
    tabell += "</tr>";
  }
  tabell += "</table>";
  $("#brett").html(tabell);
});
