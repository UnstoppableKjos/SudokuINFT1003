<?php
  require "tilkobling.php";

  $sql = "SELECT spiller, tidspunkt, score FROM sudoku ORDER BY score DESC LIMIT 10";

  mysqli_query($tilkobling, $sql);

  $resultat = mysqli_query($tilkobling, $sql);

  echo "<ol>";
  while ($rad = mysqli_fetch_array($resultat)) {
    $spiller = $rad['spiller'];
    $score =  $rad['score'];
    $tidspunkt = date_create($rad['tidspunkt']);
    $tid = date_format($tidspunkt, "d.m.Y H:i");
    echo "<li>$spiller: $score poeng</li>";
  }
  echo "</ol>";

  mysqli_close($tilkobling);
?>
