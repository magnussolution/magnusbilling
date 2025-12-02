<?php

/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 *
 */
class CallArchiveCommand extends ConsoleCommand
{
    public function run($args)
    {
        $prior_x_month = $this->config['global']['archive_call_prior_x_month'];
        $prior_x_month_failed = $this->config['global']['archive_call_failed_prior_x_month'];


        CallFailed::model()->createDataBaseIfNotExist();

        $c      = 0;
        $tables = ['pkg_cdr', 'pkg_cdr_failed'];
        foreach ($tables as $key => $table) {


            if ($table == 'pkg_cdr') {
                $func_fields = "id_user, id_plan, id_prefix, id_trunk, uniqueid, starttime, sessiontime, calledstation, sessionbill, sipiax, src, buycost, real_sessiontime, terminatecauseid, agent_bill";
                $condition = 'starttime < "' . date("Y-m-d", strtotime(date("Y-m-d") . "-$prior_x_month month")) . ' 00:00:00"';
            } else {
                $func_fields = "id_user, id_plan, id_prefix, id_trunk, uniqueid, starttime, calledstation, sipiax, src, terminatecauseid";
                $condition = 'starttime < "' . date("Y-m-d", strtotime(date("Y-m-d") . "-$prior_x_month_failed month")) . ' 00:00:00"';
            }


            $sql    = "SELECT count(*) AS count FROM $table WHERE $condition ";
            $result = Yii::app()->db->createCommand($sql)->queryAll();

            $loop = intval($result[0]['count'] / 10000);


            if ($c == 0) {
                $condition = $condition . " ORDER BY id LIMIT 10000";
                $c++;
            }

            for ($i = 0; $i < $loop; $i++) {
                echo "New insert \n";
                $sql = "INSERT INTO " . $table . "_archive ($func_fields) SELECT $func_fields FROM " . $table . " WHERE $condition";
                try {
                    Yii::app()->db->createCommand($sql)->execute();
                } catch (Exception $e) {
                }
                $sql = "DELETE FROM $table WHERE $condition";
                Yii::app()->db->createCommand($sql)->execute();
                sleep(60);
            }
        }

        $this->deleteCalls();
    }
    public function deleteCalls()
    {
        //delete calls archived

        $prior_cdr_archive_month_delete        = $this->config['global']['delete_cdr_archived_prior_x_month'];
        $prior_cdr_failed_archive_month_delete = $this->config['global']['delete_cdr_failed_archived_prior_x_month'];

        $c      = 0;
        $tables = ['pkg_cdr_archive', 'pkg_cdr_failed_archive'];
        foreach ($tables as $key => $table) {

            if ($table == 'pkg_cdr_archive') {

                if ($prior_cdr_archive_month_delete == 0) {
                    continue;
                }
                $condition = 'starttime < "' . date("Y-m-d", strtotime(date("Y-m-d") . "-$prior_cdr_archive_month_delete month")) . ' 00:00:00"';
            } else if ($table == 'pkg_cdr_failed_archive') {
                if ($prior_cdr_failed_archive_month_delete == 0) {
                    continue;
                }
                $condition = 'starttime < "' . date("Y-m-d", strtotime(date("Y-m-d") . "-$prior_cdr_failed_archive_month_delete month")) . ' 00:00:00"';
            }

            $sql    = "SELECT count(*) AS count FROM $table WHERE $condition ";
            $result = Yii::app()->db->createCommand($sql)->queryAll();

            $loop = intval($result[0]['count'] / 50000);

            if ($c == 0) {
                $condition = $condition . " LIMIT 50000";
                $c++;
            }
            for ($i = 0; $i < $loop; $i++) {
                $sql = "DELETE FROM $table WHERE $condition";
                echo $sql . "\n";
                Yii::app()->db->createCommand($sql)->execute();
                sleep(5);
            }
        }
    }
}
