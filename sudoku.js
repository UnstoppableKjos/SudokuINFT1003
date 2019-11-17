// Globale variabler som brukes av de ulike funksjonene
let tabell = []; // Inneholder det spillbare brettet
let losning1, losning2; // Brukes for å generere brettet, og for å validere det spilleren skriver inn
let score = 0; // Holder oversikt over poengsummen
let vanskelighetsgrad; // Enten "Lett", "Medium" eller "Vanskelig"
let forsok; // Antall forsøk på å skrive inn tall i hver celle
let timer; // Incrementer currenttimer hvert sekund
let currentTimer = 0; // Hvor lang tid man har brukt på spillet
let losteCeller; // Teller hvor mange celler som er løste
let diffMultiplier; // Koeffisient til endelig poengsum utifra vanskelighetsgrad

$(document).ready(function(){
  // Genererer brettet
  let brett = "<table>";
  let notater = "<table>";
  for (let i = 0; i < 9; i++) {
    brett += "<tr>";
    notater += "<tr>";
    for (let j = 0; j < 9; j++) {
      brett += "<td><input class='celle' type='text' readonly></td>";
      notater += "<td><textarea class='notat' readonly></textarea></td>";
    }
    brett += "</tr>";
    notater += "</tr>";
  }
  brett += "</table>";
  notater += "</table>";
  $("#brett").html(brett);
  $("#notater").html(notater);

  // Flytter musepeker før tallet når man klikker på en celle, eller skriver inn et tall
  // Gjør at tallet kan endres uten å klikke på cellen på nytt
  $(".celle").on("click keydown", function() {
    $(this)[0].setSelectionRange(0, 0);
  });

  // Flytter markør på slutten av innhold i notatfelt
  $(".notat").on("click", function() {
    let input = $(this).val();
    $(this).val("");
    $(this).val(input);
  });

  // Validerer input til notater
  $(".notat").on("input", function() {
    // Finner indeksen til notatfeltet
    let rad = $(this).closest("tr").index();
    let kolonne = $(this).closest("td").index();

    $("#brett tr:eq("+rad+") td:eq("+kolonne+") input").val(""); // Fjerner tall fra brett

    let input = $(this).val(); // Alt som er notert

    input = input.replace(/[^1-9]/g,""); // Fjerner alt untatt tallene 1-9

    // Kjøres dersom det skrives inn mer en ett tall
    if ($(this).val().length > 1) {
      let siste = $(this).val().slice(-1); // Det siste tallet som er notert

      input = input.split(""); // Lager et array

      let antall = 0; // Hvor mange ganger et tall er skrevet inn

      // Sjekker om et tall er skrevet inn mer enn én gang
      for (let i = 0; i < input.length; i++) {
        if (input[i] === siste) {
          antall++;
        }
      }

      // Fjerner et tall hvis det skrives inn to ganger
      // Gjør at man kan toggle tall i notatene
      if (antall > 1) { //
        input = input.filter(function(tall) {
          return tall != siste;
        });
      }

      input.sort(); // Ordner tallene i riktig rekkefølge
      input = input.join(" "); // Setter sammen arrayet til en ny tekststreng
    }

    $(this).val(input);
  });

  // Sjekker om tallet stemmer med løsningen
  $(".celle").on("input", function() {
    let input = $(this).val();
    input = input.replace(/[^1-9]/g,""); // Fjerner alt untatt tallene 1-9
    input = input.charAt(0); // Gjør at kun ett tall kan skrives inn
    $(this).val(input);

    if ($(this).val() != "") {
      // Finner indeksen til cellen som er fylt inn
      let rad = $(this).closest("tr").index();
      let kolonne = $(this).closest("td").index();

      $("#notater tr:eq("+rad+") td:eq("+kolonne+") textarea").val(""); // Fjerner notater

      if ($(this).val() != losning1[rad][kolonne]) {
        $(this).css("text-shadow", "0 0 red");
        forsok[rad][kolonne]++;
      } else {
        $(this).css("text-shadow", "0 0 black");
        $(this).prop("readonly", true);
        $("#notater tr:eq("+rad+") td:eq("+kolonne+") textarea").prop("readonly", true);
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
      diff = 38;
      vanskelighetsgrad = "Lett";
      diffMultiplier = 1;
    } else if (tekst == "Medium") {
      diff = 32;
      vanskelighetsgrad = "Medium";
      diffMultiplier = 1.5;
    } else if (tekst == "Vanskelig") {
      diff = 26;
      vanskelighetsgrad = "Vanskelig";
      diffMultiplier = 2;
    }
    losteCeller = diff;
    lagSudoku(diff);
    fjernFarge();
    $(".notat").val("");
  });

  $("#losbrett").click(function() {
    if (tabell.length > 0) {
      $(".celle").css("background-color", "");
      losSudoku();
      skrivUt();
    }
  });

  $("#noter").click(function() {
    if ($("#notater").css("z-index") == -1) {
        $(this).css("background-color", "#00509e"); // Farge på knapp
        $("td").css("background-color", ""); // Fjerner all bakgrunnsfarge på brettet
        $("#notater").removeClass("farge");
        $("#brett").addClass("farge");
        $("#notater").css("z-index", 1);
      } else {
        $(this).css("background-color", "");
        $("td").css("background-color", "");
        $("#brett").removeClass("farge");
        $("#notater").addClass("farge");
        $("#notater").css("z-index", -1);
    }
  })

  // Laster inn highscores
  readScore();

  // Setter bakgrunnsfarge ved fokus
  $(".celle, .notat").focusin(function() {
    $("td").css("background-color", "") // Fjern tidligere farge

    let farge1 = "LightGray";
    let farge2 = "#00509e";

    let rad = $(this).closest("tr").index();
    let kolonne = $(this).closest("td").index();
    let tall = $("#brett tr:eq("+rad+") td:eq("+kolonne+") input").val();

    $(".farge tr:eq("+rad+") td:eq("+kolonne+")").children().css("background-color", "#00509e");

    // Bakgrunnsfarge på tilhørende rad, kolonne og 3x3-boks
    for (let i = 0; i < 9; i++) {
      let j = 3 * Math.floor(rad / 3) + Math.floor(i / 3);
      let k = 3 * Math.floor(kolonne / 3) + i % 3;
      $(".farge tr:eq("+j+") td:eq("+k+")").css("background-color", farge1);
      $(".farge tr:eq("+rad+") td:eq("+i+")").css("background-color", farge1);
      $(".farge tr:eq("+i+") td:eq("+kolonne+")").css("background-color", farge1);
    }

    // Bakgrunnsfarge på alle like tall
    if (tall != "") {
      for (let x = 0; x < 9; x++) {
        for (y = 0; y < 9; y++) {
          if ($("#brett tr:eq("+x+") td:eq("+y+") input").val() == tall) {
            $(".farge tr:eq("+x+") td:eq("+y+")").css("background-color", farge);
          }
        }
      }
    }
  });

  // Fjerner bakgrunnsfarge ved mistet fokus
  $(".celle, .notat").focusout(function() {
    $(".celle, .notat").css("background-color", "");
  });

  // Navigering med piltaster
  $(".celle, .notat").keydown(function(event) {
    let aktiv = $(this);
    let neste = null;
    let posisjon = $(this).closest("td").index();
    let mulig = "input, textarea";
    switch (event.keyCode) {
        case 37: // Venstre
            neste = aktiv.parent("td").prev().find(mulig);
            break;
        case 38: // Opp
            neste = aktiv
                .closest("tr")
                .prev()
                .find("td:eq("+posisjon+")")
                .find(mulig);
            break;
        case 39: // Høyre
            neste = aktiv.closest('td').next().find(mulig);
            break;
        case 40: // Ned
            neste = aktiv
                .closest("tr")
                .next()
                .find("td:eq("+posisjon+")")
                .find(mulig);
            break;
    }
    if (neste && neste.length) {
        neste.focus();
    }
  });

});

// Fjerner bakgrunnsfarge og bakgrunnsbilde
function fjernFarge() {
  $("td").css("background-color", "");
  $("#brett input").css("text-shadow", "0 0 black");
  $("#brett").css("background-image", "");
}

function lagSudoku(diff) {
  let t0 = performance.now();
  opprettTabell(); // Oppretter et tomt brett
  losSudoku(); // Genererer et tilfeldig ferdigutfylt brett
  lagSpill(diff); // Fjerner tall for å gjøre brettet spillbart
  skrivUt(); // Skriver ut brettet
  let t1 = performance.now();
  console.log("Brett laget på " + (t1 - t0) + " ms.");
  console.log(losning1.toString());
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
    $(".celle, td").css("background-color", ""); // Fjerner cellemarkeringer
    $("#brett").css("background-image", "linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(" + gif() + ")");
    clearInterval(timer);
    updateScore(Math.ceil(diffMultiplier * (30650/Math.pow(currentTimer, 2/3))));
    writeScore();
  }
}

// Oppretter en tabell som inneholder tallene på brettet
// En tom posisjon markeres med tallet 0
function opprettTabell() {
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
function losSudoku(tall) {
  // Finner neste ledige celle i tabellen
  let celle = finnCelle();
  let rad = celle[0];
  let kolonne = celle[1];

  // Sjekker om det er flere tomme celler, avslutter funksjonen hvis alt er utfylt
  if (rad === -1) {
    return true;
  }

  let randoms = tilfeldigeTall();

  for (let i = 0; i < 9; i++) {
    if (!tall) {
      tallet = randoms[i];
    } else {
      tallet = tall[i]; // Forsøker å løse med tallene som funksjonen har mottatt som argument
    }
    //console.log("Forsøker " + tallet + " i celle " + rad + "," + kolonne);
    if (valider(rad, kolonne, tallet)) { // Sjekker om valgt tall er gyldig i cellen
        tabell[rad][kolonne] = tallet; // Legger til tallet
        //console.log(tallet + " er gyldig, legger til")
        if (losSudoku(tall)) { // Avslutter og går til neste celle dersom det har blitt fylt inn et tall
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
      losSudoku(tall1);
      losning1 = JSON.parse(JSON.stringify(tabell)); // Legger det løste brettet fra forsøk 1 i en egen matrise

      fjernTall(indekser); // Tømmer cellene igjen før løsningsforsøk 2

      let tall2 = [9,8,7,6,5,4,3,2,1]; // Forsøker å løse brettet. Sjekker tallene 1 til 9 i motsatt rekkefølge.
      losSudoku(tall2);
      losning2 = JSON.parse(JSON.stringify(tabell)); // Legger det løste brettet fra forsøk 2 i en egen matrise

      // Sjekker om de to løsningene er like. Hvis de er forskjellige, har ikke brettet en unik løsning.
      // Fjerner indeksen for den siste valgte cellen, slik at funksjonen kan prøve med en annen celle.
      for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
          if (losning1[i][j] != [losning2[i][j]]) {
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
        $("#brett tr:eq("+i+") td:eq("+j+") input").val(tabell[i][j]);
        $("#brett tr:eq("+i+") td:eq("+j+") input").prop("readonly", true);
        $("#notater tr:eq("+i+") td:eq("+j+") textarea").prop("readonly", true);
      }
      else {
        $("#brett tr:eq("+i+") td:eq("+j+") input").val("");
        $("#brett tr:eq("+i+") td:eq("+j+") input").prop("readonly", false);
        $("#notater tr:eq("+i+") td:eq("+j+") textarea").prop("readonly", false);
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

// Tull og tøys
function gif() {
  let gif = [];
  gif[0] = "https://media.giphy.com/media/Gf3fU0qPtI6uk/giphy.gif";
  gif[1] = "https://media.giphy.com/media/zd9wcDX4H4z4I/giphy.gif";
  gif[2] = "https://media.giphy.com/media/fA81FF4mdE6lgeoJwb/giphy.gif";
  gif[3] = "https://media.giphy.com/media/YnBntKOgnUSBkV7bQH/giphy.gif";
  gif[4] = "https://media.giphy.com/media/S6qkS0ETvel6EZat45/giphy.gif";
  let i = Math.floor(Math.random() * 5);
  return gif[i];
}
