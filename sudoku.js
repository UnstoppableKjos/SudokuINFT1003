$(document).ready(function(){

  // Genererer brettet
  let brett = "<table id='brett'>";
  for (let i = 0; i < 9; i++) {
    brett += "<tr>";
    for (let j = 0; j < 9; j++) {
      brett += "<td><input class='celle' type='text' disabled></td>";
    }
    brett += "</tr>";
  }
  brett += "</table>";
  $("#brett").html(brett);

  // Flytter musepeker før tallet når man klikker på en celle, eller skriver inn et tall
  // Gjør at tallet kan endres uten å klikke på cellen på nytt
  $(".celle").on("click keydown", function() {
    $(this)[0].setSelectionRange(0, 0);
  });

  /* Sjekker at det man skriver inn på brettet kun er tall fra 1 - 9,
  og om tallet eventuelt er gyldig i forhold til løsningen */
  $(".celle").on("input", function() {
    let ugyldig = ["0", "+", "-", "."]; // Ugyldige tegn som ikke kan skrives inn
    let input = $(this).val();
    if (isNaN(input) || ugyldig.indexOf(input.slice(0, 1)) > -1) {
      $(this).val(input.slice(1, 2));
    } else if (input < 0 ||input > 10 || input.length > 1) {
      $(this).val(input.slice(0, -1)); // Kutter av alle karakterer etter den første
    }
    // Finner indeksen til cellen som er fylt inn
    let rad = $(this).closest("tr").index();
    let kolonne = $(this).closest("td").index();
    // Sjekker om tallet stemmer med løsningen
    if ($(this).val() != løsning1[rad][kolonne]) {
      $(this).css("background-color", "red");
    } else {
      $(this).css("background-color", "");
    }
  });

});

function lagSudoku(diff) {
  var t0 = performance.now();

  opprettTabell(); // Oppretter et tomt brett
  løsSudoku(tilfeldigeTall()); // Genererer et tilfeldig ferdigutfylt brett
  lagSpill(diff); // Fjerner tall for å gjøre brettet spillbart
  skrivUt(); // Skriver ut brettet
  console.log(løsning1.toString());
  // Starter ny timer og stopper etter behov
  stopCounter();
  window.timer = setInterval(counter,1000);
  // Måler hvor lang tid det tar å generere brettet
  var t1 = performance.now();
  console.log("Brett laget på " + (t1 - t0) + " ms.");
}

// Oppretter en tabell som inneholder tallene på brettet
// En tom posisjon markeres med tallet 0
var tabell = [];
function opprettTabell() {
  tabell = [];
  for (i = 0; i < 9; i++) {
    tabell[i] = [];
    for (j = 0; j < 9; j++) {
      tabell[i][j] = 0;
    }
  }
}

// Funksjon som finner første ledige celle i tabellen
function finnCelle() {
  let posisjon = [-1,-1];
  for (let i = 0; i < 9; i++) { // Går gjennom hver rad
    for (let j = 0; j < 9; j++) { // Går gjennom hver kolonne
      if (tabell[i][j] === 0) { // Sjekker om cellen er tom
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

// Funksjon som løser brettet
function løsSudoku(tall) {
  if (!tall) { // Hvis funksjonen ikke mottar spesifikke tall, bruk disse
    tall = [1,2,3,4,5,6,7,8,9];
  }

  // Finner neste ledige celle i tabellen
  let celle = finnCelle();
  let rad = celle[0];
  let kolonne = celle[1];

  // Sjekker om det er flere tomme celler, avslutter funksjonen hvis alt er utfylt
  if (rad === -1) {
    return true;
  }

  for (let i = 0; i < 9; i++) {
    tallet = tall[i]; // Forsøker å løse med tallene som funksjonen har mottatt som argument
    //console.log("Forsøker " + tallet + " i celle " + rad + "," + kolonne);
    if (valider(rad, kolonne, tallet)) { // Sjekker om valgt tall er gyldig i cellen
        tabell[rad][kolonne] = tallet; // Legger til tallet
        //console.log(tallet + " er gyldig, legger til")
        if (løsSudoku(tall)) { // Avslutter og går til neste celle dersom det har blitt fylt inn et tall
            return true;
        }
        //console.log("Ingen gyldige tall, setter " + rad + "," + kolonne + " som tom");
        tabell[rad][kolonne] = 0; // Setter den sist utfylte cellen som tom hvis ingen flere tall er gyldige
    } else {
      //console.log("Ikke gyldig, velger et nytt tall");
    }
  }
  return false;
}

// lager en matrise med tallene 1 - 9 i tilfeldig rekkefølge
// Brukes for å generere tilfeldige brett
function tilfeldigeTall() {
  let mulig = [1,2,3,4,5,6,7,8,9];
  let tall = [];
  while (mulig.length) {
    let indeks = Math.floor(Math.random() * mulig.length); // Velger en tilfeldig indeks
    tall.push(mulig[indeks]); // Henter ut tallet på denne indeksen og legger til i ny matrise
    mulig.splice(indeks, 1) // Fjerner tallet fra mulige valg
  }
  return tall;
}

// Brukes av lagSpill for å fjerne tall fra brettet
function fjernTall(indekser) {
  for (let i = 0; i < indekser.length; i++) {
    let x = indekser[i].slice(0, 1); // Indeks for rad hentes fra [*][]
    let y = indekser[i].slice(1, 2); // Indeks for kolonne hentes fra [][*]
    tabell[x][y] = 0; // Fjerner tallet fra valgt indeks
  }
}

// Brukes i funksjonen under for å generere brettet, og for å validere det spilleren skriver inn
var løsning1;
var løsning2;

// Finner ut hvilke tall som kan fjernes for å lage et spillbart brett med unik løsning
function lagSpill(diff) { // Mottar vanskelighetsgrad som argument
  let antallHint = diff; // Antall hint som skal være igjen på brettet
  let antallTall = 81 - antallHint; // Antall tall som må fjernes
  let indekser = []; // Holder styr på hvilke celler som kan tømmes

  while (indekser.length < antallTall) {
    // Genererer to tilfeldige tall mellom 0 og 8 for å velge indeksen til en celle
    let x = Math.floor(Math.random() * 9);
    let y = Math.floor(Math.random() * 9);
    let posisjon = [x,y]; // Legger posisjonen for valgt celle i en matrise

    if (tabell[x][y] !== 0) { // Sjekker om tallet allerede er fjernet fra valgt posisjon
      //console.log("Funnet " + indekser.length + " celler.");
      indekser.push(posisjon); // Legger til posisjonen i matrise for celler som kan tømmes

      let tall1 = [1,2,3,4,5,6,7,8,9]; // Forsøker å løse brettet. Sjekker tallene 1 til 9 sekvensielt.
      løsSudoku(tall1);
      løsning1 = JSON.parse(JSON.stringify(tabell)); // Legger det løste brettet fra forsøk 1 i en egen matrise

      fjernTall(indekser); // Tømmer cellene igjen før løsningsforsøk 2

      let tall2 = [9,8,7,6,5,4,3,2,1]; // Forsøker å løse brettet. Sjekker tallene 1 til 9 i motsatt rekkefølge.
      løsSudoku(tall2);
      løsning2 = JSON.parse(JSON.stringify(tabell)); // Legger det løste brettet fra forsøk 2 i en egen matrise

      // Sjekker om de to løsningene er like. Hvis de er forskjellige, har ikke brettet en unik løsning.
      // Fjerner indeksen for den siste valgte cellen, slik at funksjonen kan prøve med en annen celle.
      for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
          if (løsning1[i][j] != [løsning2[i][j]]) {
            console.log("Ikke unik løsning. Prøver et annet tall.");
            indekser.pop(); // Fjerner den siste indeksen i matrisen
            break; // Avslutter løkken dersom den finner en ulikhet
          }
        }
      }
    }
    fjernTall(indekser); // Tømmer cellene som er funnet så langt
    // Dersom antall indekser er mindre enn nødvendig, forsøker funksjonen å tømme en ny celle
    // Dersom antall indekser er OK, er funksjonen ferdig og et spillbart brett kan skrives ut
  }
}

// Skriver ut tall fra tabell til brettet
function skrivUt() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (tabell[i][j] > 0) {
        $("tr:eq("+i+") td:eq("+j+") input").val(tabell[i][j]);
        $("tr:eq("+i+") td:eq("+j+") input").prop("disabled", true);
      }
      else {
        $("tr:eq("+i+") td:eq("+j+") input").val("");
        $("tr:eq("+i+") td:eq("+j+") input").prop("disabled", false);
      }
    }
  }
}

// Legger til leading zeros for å få timeren til å se bedre ut
Number.prototype.pad = function(size) {
  let s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
};

let currentTimer = 0;

// Teller hvert sekund
function counter() {
  let min = Math.floor(currentTimer / 60);
  let sec = currentTimer % 60;
  $("#tid").html(`${min.pad()}:${sec.pad()}`);
  currentTimer++;
}

// Stopper og nullstiller timeren
function stopCounter() {
  if (currentTimer > 0) {
    clearInterval(timer);
    currentTimer = 0;
    $("#tid").html("00:00");
  }
}
