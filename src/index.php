<?php
$conn = new mysqli("localhost", "user_errado", "senha_errada", "db_fake");

if ($conn->connect_error) {
    die("Erro: " . $conn->connect_error);
}