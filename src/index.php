<?php
// Command Injection — executa comando com input do usuário
$host = $_GET['host'];
system("ping -c 1 " . $host);

// Também detectado:
exec($_GET['cmd']);
shell_exec($_GET['command']);
passthru($_GET['action']);