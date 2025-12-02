<?php
$user     = $_GET['u'];
$uniqueid = $_GET['id'];
if ( ! preg_match('/^[0-9]{10}\.[0-9]{1,}$/', $uniqueid)) {
    exit('uniqueid invalid');
}
$configFile = '/etc/asterisk/res_config_mysql.conf';
$array      = parse_ini_file($configFile);
try {
    $conn = new PDO('mysql:host=' . $array['dbhost'] . ';dbname=' . $array['dbname'], $array['dbuser'], $array['dbpass']);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    exit;
}
$sql     = "SELECT username FROM pkg_user WHERE username = :key";
$command = $conn->prepare($sql);
$command->bindValue(":key", $user, PDO::PARAM_STR);
$command->execute();
$result = $command->fetchAll(PDO::FETCH_OBJ);
if ( ! isset($result[0]->username)) {
    exit('User not found');
}
exec("ls /var/spool/asterisk/monitor/" . $result[0]->username . '/*.' . $uniqueid . '*', $output);
if (isset($output[0])) {
    $file_name = explode("/", $output[0]);
    header("Cache-Control: public");
    header("Content-Description: File Transfer");
    header("Content-Disposition: attachment; filename=" . end($file_name));
    header("Content-Type: audio/x-gsm");
    header("Content-Transfer-Encoding: binary");
    readfile($output[0]);
} else {
    exit('Audio no found');
}
