<?php
// File Inclusion — inclui arquivo baseado em input do usuário
$page = $_GET['page'];
include($page);

// Também detectado:
require($_GET['template']);
include_once($_GET['module']);