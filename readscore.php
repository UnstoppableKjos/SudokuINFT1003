<?php
  require "tilkobling.php";

  $vanskelighetsgrad = array("Lett", "Medium", "Vanskelig");

  foreach ($vanskelighetsgrad as $val) {
    $sql = "SELECT spiller, tidspunkt, score FROM sudoku WHERE vanskelighetsgrad = '$val' ORDER BY score DESC LIMIT 10";

    mysqli_query($tilkobling, $sql);

    $resultat = mysqli_query($tilkobling, $sql);

    if(mysqli_num_rows($resultat) > 0) {
      echo "<ol>";
      echo "$val";
      while ($rad = mysqli_fetch_array($resultat)) {
        $spiller = $rad['spiller'];
        $score =  $rad['score'];
        $tidspunkt = date_create($rad['tidspunkt']);
        $tid = date_format($tidspunkt, "d.m.Y H:i");

        echo "<li>$spiller: $score</li>";
      }
      echo "</ol>";
    }
  }

  mysqli_close($tilkobling);

?>
