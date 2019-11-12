// Globale variabler som brukes av de ulike funksjonene

let tabell = []; // Inneholder det spillbare brettet
let løsning1, løsning2; // Brukes for å generere brettet, og for å validere det spilleren skriver inn
let score = 0; // Holder oversikt over poengsummen
let vanskelighetsgrad; // Enten "Lett", "Medium" eller "Vanskelig"
let forsok; // Antall forsøk på å skrive inn tall i hver celle
let timer; // Incrementer currenttimer hvert sekund
let currentTimer = 0; // Hvor lang tid man har brukt på spillet
let losteCeller; // Teller hvor mange celler som er løste
let diffMultiplier; // Koeffisient til endelig poengsum utifra vanskelighetsgrad

$(document).ready(function(){

  // Genererer brettet
  let brett = "<table id='brett'>";
  for (let i = 0; i < 9; i++) {
    brett += "<tr>";
    for (let j = 0; j < 9; j++) {
      brett += "<td><input class='celle' type='text' readonly></td>";
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
    // Finner indeksen til cellen som er fylt inn
    let rad = $(this).closest("tr").index();
    let kolonne = $(this).closest("td").index();

    let tall = true;

    let ugyldig = ["0", "+", "-", "."]; // Ugyldige tegn som ikke kan skrives inn

    let input = $(this).val();

    if (isNaN(input) || ugyldig.indexOf(input.slice(0, 1)) > -1) {
      $(this).val(input.slice(1, 2)); // Fjerner tegn hvis det er ugyldig
      tall = false;
    } else if (input < 0 ||input > 10 || input.length > 1) {
      $(this).val(input.slice(0, -1)); // Kutter av alle tegm etter den første
    }

    // Sjekker om tallet stemmer med løsningen
    // Gjøres kun dersom input er tall fra 1 - 9
    if (tall === true) {
      if ($(this).val() != løsning1[rad][kolonne]) {
        $(this).css("background-color", "red");
        forsok[rad][kolonne]++;
      } else {
        $(this).css("background-color", "");
        $(this).prop("readonly", true);
        updateScore(Math.floor(100 / forsok[rad][kolonne]));
        sjekkBrett();
      }
    }
  });

  // Definerer antall hint på hver vanskelighetsgrad, og kjører funksjonen for å lage brettet
  $(".vanskelighetsgrad").click(function() {
    let tekst = $(this).text();
    let diff;
    if (tekst == "Lett") {
      diff = 80;
      vanskelighetsgrad = "Lett";
      diffMultiplier = 1;
    } else if (tekst == "Medium") {
      diff = 30;
      vanskelighetsgrad = "Medium";
      diffMultiplier = 1.5;
    } else if (tekst == "Vanskelig") {
      diff = 25;
      vanskelighetsgrad = "Vanskelig";
      diffMultiplier = 2;
    }
    losteCeller = diff;
    lagSudoku(diff);
    $(".celle").css("background-color", "");
  });

  $(".løsbrett").click(function() {
    if (tabell.length > 0) {
      $(".celle").css("background-color", "");
      løsSudoku();
      skrivUt();
    }
  });

  // Laster inn highscores
  readScore();

  // Setter bakgrunnsfarge på celler som er relatert til den man klikker på
  $(".celle").click(function() {
    let farge = "LightGray";

    $(".celle").parent().css("background-color", "");

    let rad = $(this).closest("tr").index();
    let kolonne = $(this).closest("td").index();

    for (i = 0; i < 9; i++) {
      let j = 3 * Math.floor(rad / 3) + Math.floor(i / 3);
      let k = 3 * Math.floor(kolonne / 3) + i % 3;
      $("tr:eq("+j+") td:eq("+k+")").css("background-color", farge);
      $("tr:eq("+rad+") td:eq("+i+")").css("background-color", farge);
      $("tr:eq("+i+") td:eq("+kolonne+")").css("background-color", farge);
    }
  });

  // Merker alle like tall på brettet
  $(".celle").click(function() {
    let farge = "#00509e";

    let tall = $(this).val();
    if (tall != "") {
      for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
          if ($("tr:eq("+i+") td:eq("+j+") input").val() == tall) {
            $("tr:eq("+i+") td:eq("+j+")").css("background-color", farge);
          }
        }
      }
    }
  });

});

function lagSudoku(diff) {
  let t0 = performance.now();
  opprettTabell(); // Oppretter et tomt brett
  løsSudoku(tilfeldigeTall()); // Genererer et tilfeldig ferdigutfylt brett
  lagSpill(diff); // Fjerner tall for å gjøre brettet spillbart
  skrivUt(); // Skriver ut brettet
  let t1 = performance.now();
  console.log("Brett laget på " + (t1 - t0) + " ms.");
  console.log(løsning1.toString());
  // Starter ny timer og stopper etter behov
  stopCounter();
  timer = setInterval(counter,1000);
  forsok = resetScore();
  // Måler hvor lang tid det tar å generere brettet
}

// Nullstiller poengsummen og gir en ny forsøkstabell
function resetScore() {
  score = 0;
  $("#poeng").html(`Poengsum: ${score}`);
  return [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
}

// Oppdaterer poengsummen med verdien som tas inn
function updateScore(points) {
  console.log(points + " poeng");
  score += points;
  $("#poeng").html(`Poengsum: ${score}`);
}

// Henter liste over highscores fra database
function readScore() {
  $("#highscore").load("readscore.php");
}

// Legger til poeng i databasen
function writeScore() {
  let spiller = prompt("Gratulerer, du vant! Skriv inn navnet ditt for å lagre poengsummen");
  if (spiller != null) {
    $.post("writescore.php", {
      spiller: spiller, score: score, vanskelighetsgrad: vanskelighetsgrad
    });
    readScore();
  }
}

// Sjekker om brettet er løst. Stopper timer og gir poeng dersom det er det
function sjekkBrett() {
  losteCeller++;
  if (losteCeller === 81) {
    clearInterval(timer);
    updateScore(Math.ceil(diffMultiplier * (30650/Math.pow(currentTimer, 2/3))));
    writeScore();
  }
}

// Oppretter en tabell som inneholder tallene på brettet
// En tom posisjon markeres med tallet 0
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
            //console.log("Ikke unik løsning. Prøver et annet tall.");
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
        $("tr:eq("+i+") td:eq("+j+") input").prop("readonly", true);
      }
      else {
        $("tr:eq("+i+") td:eq("+j+") input").val("");
        $("tr:eq("+i+") td:eq("+j+") input").prop("readonly", false);
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

// Teller hvert sekund og skriver det ut på en pen måte
function counter() {
  let min = Math.floor(currentTimer / 60);
  let sec = currentTimer % 60;
  $("#tid").html(`Tid: ${min.pad()}:${sec.pad()}`);
  currentTimer++;
}

// Stopper og nullstiller timeren
function stopCounter() {
  if (currentTimer > 0) {
    clearInterval(timer);
    currentTimer = 0;
    $("#tid").html("Tid: 00:00");
  }
}
