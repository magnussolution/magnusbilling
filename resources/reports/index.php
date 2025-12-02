<?php

session_start();

if ($_SESSION['logged'] == 1) {

	$filename = explode(".", $_SERVER['REDIRECT_URL']);
	$file = 'report.'.$filename[1];
	$len = filesize($file);
	header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1 header("Cache-Control: post-check=0, pre-check=0", false); header("Pragma: no-cache"); // HTTP/1.0
	header("Content-type: application/".$filename[1]."");
	header("Content-Length: $len");
	header("Content-Disposition: inline; filename=$file"); header("Content-Transfer-Encoding: binary\n");
	readfile($file);
}
?>