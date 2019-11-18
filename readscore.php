<?php
  require "tilkobling.php";

  $vanskelighetsgrad = array("Lett", "Medium", "Vanskelig");

  foreach ($vanskelighetsgrad as $val) {
    $sql = "SELECT spiller, tidspunkt, score FROM sudoku WHERE vanskelighetsgrad = '$val' ORDER BY score DESC LIMIT 5";

    mysqli_query($tilkobling, $sql);

    $resultat = mysqli_query($tilkobling, $sql);

    if(mysqli_num_rows($resultat) > 0) {
      echo "<h4>$val:</h4>";
      echo "<table>";
      $counter = 0;
      while ($rad = mysqli_fetch_array($resultat)) {
        $counter++;
        echo "<tr>";
        $spiller = $rad['spiller'];
        $score =  $rad['score'];
        $tidspunkt = date_create($rad['tidspunkt']);
        $tid = date_format($tidspunkt, "d.m.Y H:i");

        echo "<td class='highscore_nr'>$counter.</td>";
        echo "<td class='highscore_spiller'>$spiller</td>";
        echo "<td class='highscore_score'>$score</td>";
        echo "</tr>";
      }
      echo "</table>";
    }
  }

  mysqli_close($tilkobling);

?>
