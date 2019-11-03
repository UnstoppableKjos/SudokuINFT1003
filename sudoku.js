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

  // Setter startpunkt for ytelsesmåling
  var t0 = performance.now();

  // Lager et fullstendig utfylt brett
  genererSudoku();
  // Fjerner tall for å gjøre brettet spillbart
  fjernTall();
  // Skriver ut brettet
  skrivUt();

  // Måler hvor lang tid det tar å generere brettet
  var t1 = performance.now();
  console.log("Brett laget på " + (t1 - t0) + " ms.");

});

// Oppretter en tom tabell for alle tallene på brettet
var tabell = [[],[],[],[],[],[],[],[],[]];

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
function valider(rad, kolonne, tallet) {
    for (let i = 0; i < 9; i++) { // Kjører valideringen for hver mulig posisjon
        let j = 3 * Math.floor(rad / 3) + Math.floor(i / 3); // Finner rad i 3x3-boks
        let k = 3 * Math.floor(kolonne / 3) + i % 3; // Finner kolonne i 3x3-boks
        if (tabell[rad][i] == tallet || tabell[i][kolonne] == tallet || tabell[j][k] == tallet) {
          return false; // Validering feiler hvis tallet er funnet
        }
    }
    return true; // Validering godkjennes hvis tallet ikke finnes fra før
}

var rekursjon = 0; // Teller for å se hvor mange funksjonskall som trengs for å generere brettet
var test = true;

// Funksjon for å fylle ut et fullstendig Sudoku-brett
function genererSudoku() {
  // Henter nummer for rad og kolonne på cellen som skal fylles ut
  var celle = finnCelle();
  var rad = celle[0]; //
  var kolonne = celle[1];

  // Sjekker om det er flere tomme celler, avslutter funksjonen hvis alt er utfylt
  if (rad == -1) {
    console.log("Antall rekursjoner: " + rekursjon);
    return true;
  } else {
    rekursjon++; // Øker telleren for hver gang funksjonen må kjøres på nytt
  }

  var tall = [1,2,3,4,5,6,7,8,9]; // Oppretter en matrise med mulige tall som kan fylles inn

  while (tall.length) { // Så lenge det finnes mulige tall å velge
    let indeks = Math.floor(Math.random() * tall.length); // Velger et tilfeldig tall
    tallet = tall[indeks]; // Henter ut tallet
    tall.splice(indeks, 1) // Fjerner tallet fra mulige valg
    console.log("Forsøker " + tallet + " i celle " + (rad + 1) + "," + (kolonne + 1));
    if (valider(rad, kolonne, tallet)) { // Sjekker om valgt tall er gyldig i cellen
        tabell[rad][kolonne] = tallet; // Legger til tallet
        console.log(tallet + " er gyldig, legger til")
        if (genererSudoku()) { // Avslutter og går til neste celle dersom det har blitt fylt inn et tall
            return true;
        }
        tabell[rad][kolonne] = undefined; // Setter den sist utfylte cellen som tom hvis ingen flere tall er gyldige
    } else {
      console.log("Ikke gyldig, velger et nytt tall");
    }
  }
  console.log("Ingen gyldige tall, går tilbake til forrige celle")
  return false;
}

// Funksjon for å fjerne tilfeldige tall, for å lage et spillbart brett

/* ***************************************************************************
***** OBS! Kun laget for å få testet andre funksjoner!                   *****
***** Fjerner helt tilfeldige tall, så brettet har ikke en unik løsning. *****
*************************************************************************** */

function fjernTall() {
  var antallTall = 81;
  var antallHint = 30;
  while (antallTall > antallHint) {
    // Genererer to tilfeldige tall mellom 0 og 8 for å velge indeksen til en tilfeldig celle
    let x = Math.floor(Math.random() * 9);
    let y = Math.floor(Math.random() * 9);
    // Fjerner tallet hvis det ikke har blitt fjernet fra før
    if (typeof tabell[x][y] !== "undefined") {
      tabell[x][y] = undefined;
      antallTall--;
    }
  }
}

// Skriver ut tall fra tabell til brettet
function skrivUt() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      $("tr:eq("+i+") td:eq("+j+") input").val(tabell[i][j]);
      if (typeof tabell[i][j] !== "undefined") {
        $("tr:eq("+i+") td:eq("+j+") input").prop("disabled", true);
      }
    }
  }
}

/* Tar inn et <input> element og sjekker om det kun står ett siffer mellom 1 og 9 der.
  Fjerner alt annet */
function checkInput(cell) {
  let input = Number(cell.value);
  if (isNaN(input) ||
      (cell.value).slice(0, 1) == 0 ||
      (cell.value).slice(0, 1) == "+" ||
      (cell.value).slice(0, 1) == "." ||
      (cell.value).slice(0, 1) == "-") {
        cell.value = (cell.value).slice(1, 2);
  } else if (input < 0 ||
             input > 10 ||
             cell.value.length > 1) {
    cell.value = (cell.value).slice(0, -1); // Kutter av alle karakterer etter den første
  }
}
