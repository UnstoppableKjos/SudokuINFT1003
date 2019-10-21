$(document).ready(function(){

  // Genererer brettet
  let brett = "<table id='brett'>";
  for (let i = 0; i < 9; i++) {
    brett += "<tr>";
    for (let j = 0; j < 9; j++) {
      brett += "<td><input class='celle' type='text' oninput='checkInput(this)'></td>";
    }
    brett += "</tr>";
  }
  brett += "</table>";
  $("#brett").html(brett);

  // Flytter musepeker før tallet når man klikker på en celle, eller skriver inn et tall
  // Gjør at tallet kan endres uten å klikke på cellen på nytt
  $(".celle").on("click input", function() {
    $(this)[0].setSelectionRange(0, 0);
  });

  // Oppretter en tom tabell for alle tallene på brettet
  var tabell = [[],[],[],[],[],[],[],[],[]]

  // Funksjon som finner første ledige celle i tabellen
  function finnCelle() {
    var posisjon = [-1,-1];
    for (let i = 0; i < 9; i++) { // Går gjennom hver rad
      for (let j = 0; j < 9; j++) { // Går gjennom hver kolonne
        if (typeof tabell[i][j] === "undefined") { // Sjekker om cellen er tom
          posisjon[0] = i; // Legger til radnummer
          posisjon[1] = j; // Legger til kolonnenummer
          return posisjon; // Returnerer [i, j] ved tom celle
        }
      }
    }
    return posisjon // Returnerer [-1, -1] ved ingen tomme celler
  }

  // Sjekker om tall finnes i samme rad, kolonne eller 3x3-boks
  function valider(tabell, rad, kolonne, tallet) {
      for (let i = 0; i < 9; i++) { // Kjører valideringen for hver mulig posisjon
          let j = 3 * Math.floor(rad / 3) + Math.floor(i / 3); // Finner rad i 3x3-boks
          let k = 3 * Math.floor(kolonne / 3) + i % 3; // Finner kolonne i 3x3-boks
          if (tabell[rad][i] == tallet || tabell[i][kolonne] == tallet || tabell[j][k] == tallet) {
            return false; // Validering feiler hvis tallet er funnet
          }
      }
      return true; // Validering godkjennes hvis tallet ikke finnes fra før
  }

  // Kjører sudoku-funksjonen for å fylle ut brettet
  sudoku();

  function sudoku() {
    // Henter nummer for rad og kolonne på cellen som skal fylles ut
    var celle = finnCelle();
    var rad = celle[0];
    var kolonne = celle[1];

    // Sjekker om det er flere tomme celler, avslutter funksjonen hvis alt er utfylt
    if (rad == -1) {
      return true;
    }

    var tall = [1,2,3,4,5,6,7,8,9]; // Oppretter en matrise med mulige tall som kan fylles inn

    while (tall.length) { // Så lenge det finnes mulige tall å velge
      var indeks = Math.floor(Math.random() * tall.length); // Velger et tilfeldig tall
      tallet = tall[indeks]; // Henter ut tallet
      tall.splice(indeks, 1) // Fjerner tallet fra mulige valg
      if (valider(tabell, rad, kolonne, tallet)) { // Sjekker om valgt tall er gyldig i cellen
          tabell[rad][kolonne] = tallet; // Legger til tallet
          // Kjører funksjonen på nytt, slik at neste tall kan fylles ut
          if (sudoku()) {
              return true; // Avslutter funksjonen hvis alt er utfylt
          }
          tabell[rad][kolonne] = undefined; // Setter den sist utfylte cellen som tom hvis ingen flere tall er gyldige
      }
    }
  }

  // Skriver ut tall fra tabell til brettet
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      $("tr:eq("+i+") td:eq("+j+") input").val(tabell[i][j]);
      }
  }

});


/* Tar inn et <input> element og sjekker om det kun står ett siffer mellom 1 og 9 der.
  Fjerner alt annet */
function checkInput(cell) {
  let input = Number(cell.value);
  if (isNaN(input)) {
    cell.value = (cell.value).slice(1, 2);
  }
  else if (input < 0 || input > 10 || cell.value.length > 1) {
    cell.value = (cell.value).slice(0, -1); // Kutter av alle karakterer etter den første
  }
}
