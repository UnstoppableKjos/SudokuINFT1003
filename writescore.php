<?php
  require "tilkobling.php";

  $spiller = $_POST['spiller'];
  $score = $_POST['score'];
  $tidspunkt = date('Y-m-d H:i:s');

  $sql = "INSERT INTO sudoku (spiller, tidspunkt, score) VALUES ('$spiller', '$tidspunkt', '$score')";

  mysqli_query($tilkobling, $sql);

  mysqli_close($tilkobling);
?>
