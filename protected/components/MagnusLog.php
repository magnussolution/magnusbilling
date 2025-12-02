<?php
class MagnusLog
{
    public static function writeLog($fileLog, $log)
    {
        $string_log = "[" . date("d/m/Y H:i:s") . "]:[$log]\n";
        error_log($string_log, 3, Yii::app()->baseUrl . '/' . $fileLog);
        unset($string_log);
    }

    public static function insertLOG($action, $description)
    {
        $id_user                       = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : null;
        $modelLogUsers                 = new LogUsers();
        $modelLogUsers->id_user        = $id_user;
        $modelLogUsers->description    = CHtml::encode($description);
        $modelLogUsers->id_log_actions = $action;
        $modelLogUsers->ip             = $_SERVER['REMOTE_ADDR'];
        try {
            $modelLogUsers->save();
        } catch (Exception $e) {
            Yii::log(print_r($e->getMessage(), true), 'error');
        }
    }
}
