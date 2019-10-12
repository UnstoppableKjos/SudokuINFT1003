
$(document).ready(function(){

  //Løkke som genererer brettet
  let tabell = "<table>";
  for (let i = 0; i < 9; i++) {
    tabell += "<tr>";
    for (let j = 0; j < 9; j++) {
      tabell += "<td><input type='text' oninput='checkInput(this)'></td>";
    }
    tabell += "</tr>";
  }
  tabell += "</table>";
  $("#brett").html(tabell);
});


function checkInput(cell) {
  let input = Number(cell.value);
  if (input < 0 || input > 10 || cell.value.length > 1 || isNaN(input)) {
    cell.value = (cell.value).slice(0, -1);
  }
}
