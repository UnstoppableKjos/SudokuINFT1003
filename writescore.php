<?php
  require "tilkobling.php";

  $spiller = $_POST['spiller'];
  $score = $_POST['score'];
  $vanskelighetsgrad = $_POST['vanskelighetsgrad'];
  $tidspunkt = date('Y-m-d H:i:s');

  $sql = "INSERT INTO sudoku (spiller, tidspunkt, score, vanskelighetsgrad)
          VALUES ('$spiller', '$tidspunkt', '$score', '$vanskelighetsgrad')";

  mysqli_query($tilkobling, $sql);

  mysqli_close($tilkobling);
?>
