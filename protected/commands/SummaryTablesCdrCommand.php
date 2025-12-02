<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
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

class SummaryTablesCdrCommand extends CConsoleCommand
{
    private $date;
    private $cdr_id;
    private $cdr_falide_id;
    private $month_cdr_id;
    private $month_cdr_falide_id;
    private $day;
    private $filter_per_day;
    private $filter;

    public function run($args)
    {

        if (isset($args[0])) {
            $this->day = $args[0];
        } else {
            $this->day = date('Y-m-d');
        }

        if (!$this->validateDate($this->day)) {

            echo 'Date is invalid, use today' . "\n";
            $this->day = date('Y-m-d');
        }

        $this->filter = 't.starttime >= "' . $this->day . '" AND starttime <= "' . $this->day . ' 23:59:59"';

        echo $this->filter . "\n\n";

        $this->perDayUser();
        $this->perDayTrunk();
        $this->perDayAgent();
        $this->perDay();
        $this->perMonth();
        $this->perMonthUser();
        $this->perMonthTrunk();
        $this->perUser();
        $this->perTrunk();
        $this->perMonthDid();
    }

    public function perDayUser()
    {
        $sql = "SELECT
                id_user,
                sum(sessiontime) AS sessiontime,
                SUM(sessiontime) / COUNT(*) AS aloc_all_calls,
                count(*) as nbcall,
                sum(buycost) AS buycost,
                sum(sessionbill) AS sessionbill,
                sum(agent_bill) AS agent_bill
                FROM pkg_cdr t WHERE $this->filter  GROUP BY id_user";

        $result = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($result[0]['id_user'])) {
            echo "No calls\n";
            return;
        }

        $line = '';
        foreach ($result as $key => $value) {

            if (!is_numeric($value['id_user']) || $value['id_user'] < 1 || !is_numeric($value['sessiontime'])) {
                continue;
            }
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['aloc_all_calls'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $this->day . "','" . $value['id_user'] . "', '" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "','" . $value['agent_bill'] . "'),";

        }

        $sql = "DELETE FROM pkg_cdr_summary_day_user WHERE day = '" . $this->day . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_day_user (day, id_user, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill, agent_bill) VALUES " . substr($line, 0, -1) . ";";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        echo "perDayUser " . date('H:i:s') . "\n";

        $sql = "UPDATE pkg_cdr_summary_day_user t  INNER JOIN pkg_user u ON t.id_user = u.id SET t.isAgent = IF(u.id_user > 1, 1,0);";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_day_user SET lucro = sessionbill - buycost WHERE isAgent = 0";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_day_user SET lucro = agent_bill - sessionbill WHERE isAgent = 1";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "SELECT
                id_user,
                count(*) as nbcall_fail
                FROM pkg_cdr_failed t WHERE $this->filter  GROUP BY id_user";
        $resultFail = Yii::app()->db->createCommand($sql)->queryAll();

        foreach ($resultFail as $key => $value) {
            $sql = "UPDATE pkg_cdr_summary_day_user SET nbcall_fail =" . $value['nbcall_fail'] . " WHERE day = '" . $this->day . "' AND id_user = '" . $value['id_user'] . "' ";
            Yii::app()->db->createCommand($sql)->execute();
        }

        $sql = "UPDATE  pkg_cdr_summary_day_user SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();

    }

    public function perDayTrunk()
    {

        $sql = "SELECT
                id_trunk,
                sum(real_sessiontime) AS sessiontime,
                SUM(sessiontime) / COUNT(*) AS aloc_all_calls,
                count(*) as nbcall,
                sum(buycost) AS buycost,
                sum(sessionbill) AS sessionbill
                FROM pkg_cdr t WHERE $this->filter AND id_trunk IS NOT NULL GROUP BY id_trunk";

        $result = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($result[0]['id_trunk'])) {
            echo "No calls\n";
            return;
        }

        $line = '';
        foreach ($result as $key => $value) {
            if (!is_numeric($value['id_trunk']) || $value['id_trunk'] < 1) {
                continue;
            }
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['aloc_all_calls'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $this->day . "','" . $value['id_trunk'] . "', '" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "'),";
        }

        $sql = "DELETE FROM pkg_cdr_summary_day_trunk WHERE day = '" . $this->day . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_day_trunk (day, id_trunk, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill) VALUES " . substr($line, 0, -1) . ";";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        echo "perDayTrunk " . date('H:i:s') . "\n";

        $sql = "UPDATE  pkg_cdr_summary_day_trunk SET lucro = sessionbill - buycost";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "SELECT
                id_trunk,
                count(*) as nbcall_fail
                FROM pkg_cdr_failed t WHERE $this->filter  GROUP BY id_trunk";
        $resultFail = Yii::app()->db->createCommand($sql)->queryAll();

        foreach ($resultFail as $key => $value) {
            $sql = "UPDATE pkg_cdr_summary_day_trunk SET nbcall_fail =" . $value['nbcall_fail'] . " WHERE day = '" . $this->day . "' AND id_trunk = '" . $value['id_trunk'] . "' ";
            Yii::app()->db->createCommand($sql)->execute();
        }

        $sql = "UPDATE  pkg_cdr_summary_day_trunk SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();

    }

    public function perDayAgent()
    {

        $sql = "SELECT
                c.id_user as id_user,
                sum(sessiontime) AS sessiontime,
                SUM(sessiontime) / COUNT(*) AS aloc_all_calls,
                count(*) as nbcall,
                sum(buycost) AS buycost,
                sum(sessionbill) AS sessionbill,
                sum(agent_bill) AS agent_bill
                FROM pkg_cdr t
                LEFT JOIN pkg_user c ON t.id_user = c.id
                WHERE  $this->filter AND c.id_user > 1  GROUP BY c.id_user";

        $result = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($result[0]['id_user'])) {
            echo "No calls\n";
            return;
        }

        $line = '';
        foreach ($result as $key => $value) {

            if (!is_numeric($value['id_user']) || $value['id_user'] < 1) {
                continue;
            }
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['aloc_all_calls'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $this->day . "','" . $value['id_user'] . "', '" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "','" . $value['agent_bill'] . "'),";
        }

        $sql = "DELETE FROM pkg_cdr_summary_day_agent WHERE day = '" . $this->day . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_day_agent (day, id_user, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill, agent_bill) VALUES " . substr($line, 0, -1) . ";";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        echo "perDayAgent " . date('H:i:s') . "\n";

        $sql = "UPDATE  pkg_cdr_summary_day_agent SET lucro = sessionbill - buycost, agent_lucro = agent_bill -  sessionbill";
        Yii::app()->db->createCommand($sql)->execute();

        /*$sql = "SELECT
    c.id_user as id_user,
    count(*) as nbcall_fail
    FROM pkg_cdr_failed t
    LEFT JOIN pkg_user c ON t.id_user = c.id
    WHERE  $this->filter AND c.id_user > 1  GROUP BY c.id_user";

    $resultFail = Yii::app()->db->createCommand($sql)->queryAll();

    foreach ($resultFail as $key => $value) {
    $sql = "UPDATE pkg_cdr_summary_day_agent SET nbcall_fail =" . $value['nbcall_fail'] . " WHERE day = '" . $this->day . "' AND id_user = '" . $value['id_user'] . "' ";
    Yii::app()->db->createCommand($sql)->execute();
    }

    $sql = "UPDATE  pkg_cdr_summary_day_agent SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
    Yii::app()->db->createCommand($sql)->execute();
     */

    }

    public function perDay()
    {

        $sql = "SELECT
                SUM(sessiontime) AS sessiontime,
                SUM(aloc_all_calls) AS aloc_all_calls,
                SUM(nbcall) AS nbcall,
                SUM(buycost) AS buycost,
                SUM(sessionbill) AS sessionbill
                FROM pkg_cdr_summary_day_user
                WHERE day = '" . $this->day . "'";

        $result = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($result[0]['sessiontime'])) {
            return;
        }

        $line = '';
        foreach ($result as $key => $value) {
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['sessiontime'] / $value['nbcall'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $this->day . "', '" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "'),";
        }

        $sql = "DELETE FROM pkg_cdr_summary_day WHERE day = '" . $this->day . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_day (day, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill) VALUES " . substr($line, 0, -1) . ";";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        echo "perDay " . date('H:i:s') . "\n";

        $sql = "SELECT count(*) as nbcall_fail
                FROM pkg_cdr_failed t WHERE $this->filter ";
        $model = Yii::app()->db->createCommand($sql)->queryAll();

        foreach ($model as $key => $value) {
            $sql = "UPDATE pkg_cdr_summary_day SET nbcall_fail =" . $value['nbcall_fail'] . " WHERE day = '" . $this->day . "' ";
            Yii::app()->db->createCommand($sql)->execute();
        }

        $sql = "UPDATE  pkg_cdr_summary_day SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_day SET lucro = sessionbill - buycost";
        Yii::app()->db->createCommand($sql)->execute();

    }

    public function perMonth()
    {

        $sql = "SELECT
                SUM(sessiontime) AS sessiontime,
                SUM(aloc_all_calls) AS aloc_all_calls,
                SUM(nbcall) AS nbcall,
                SUM(buycost) AS buycost,
                SUM(nbcall_fail) AS nbcall_fail,
                SUM(sessionbill) AS sessionbill
                FROM pkg_cdr_summary_day
                WHERE day >= '" . substr($this->day, 0, -3) . "-01'  AND day <= '" . substr($this->day, 0, -3) . "-31' ";

        $result = Yii::app()->db->createCommand($sql)->queryAll();

        $filter = 't.id >= ' . $this->month_cdr_id;

        if (!isset($result[0]['sessiontime'])) {
            return;
        }

        //convert month to YYYYMM
        $month = preg_replace('/-/', '', substr($this->day, 0, -3));

        $line = '';
        foreach ($result as $key => $value) {
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['sessiontime'] / $value['nbcall'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $month . "', '" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "','" . $value['nbcall_fail'] . "'),";
        }

        $sql = "DELETE FROM pkg_cdr_summary_month WHERE month = '" . $month . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_month (month, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill,nbcall_fail) VALUES " . substr($line, 0, -1) . ";";

        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        echo "perMonth " . date('H:i:s') . "\n";

        $sql = "UPDATE  pkg_cdr_summary_month SET lucro = sessionbill - buycost";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_month SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();

    }

    public function perMonthUser()
    {

        echo $sql = "SELECT
                id_user,
                SUM(sessiontime) AS sessiontime,
                SUM(aloc_all_calls) AS aloc_all_calls,
                SUM(nbcall) AS nbcall,
                SUM(nbcall_fail) AS nbcall_fail,
                SUM(buycost) AS buycost,
                SUM(sessionbill) AS sessionbill,
                sum(agent_bill) AS agent_bill
                FROM pkg_cdr_summary_day_user
                WHERE day >= '" . substr($this->day, 0, -3) . "-01' AND day <= '" . substr($this->day, 0, -3) . "-31' GROUP BY id_user";
        $result = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($result[0]['sessiontime'])) {
            return;
        }

        //convert month to YYYYMM
        $month = preg_replace('/-/', '', substr($this->day, 0, -3));

        $line = '';
        foreach ($result as $key => $value) {

            if (!is_numeric($value['id_user']) || $value['id_user'] < 1) {
                continue;
            }
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['sessiontime'] / $value['nbcall'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $month . "','" . $value['id_user'] . "', '" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "','" . $value['agent_bill'] . "','" . $value['nbcall_fail'] . "'),";
        }

        $sql = "DELETE FROM pkg_cdr_summary_month_user WHERE month = '" . $month . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_month_user (month, id_user, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill,agent_bill,nbcall_fail) VALUES " . substr($line, 0, -1) . ";";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        echo "perMonthUser " . date('H:i:s') . "\n";

        $sql = "UPDATE pkg_cdr_summary_month_user t  INNER JOIN pkg_user u ON t.id_user = u.id SET t.isAgent = IF(u.id_user > 1, 1,0);";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_month_user SET lucro = sessionbill - buycost  WHERE isAgent = 0";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_month_user SET lucro = agent_bill - sessionbill  WHERE isAgent = 1";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_month_user SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();
    }

    public function perMonthDid()
    {
        $firstDay     = date('Y-m-01');
        $lastDay      = date('Y-m-01', strtotime("+1 months"));
        $this->filter = 't.starttime >= "' . $firstDay . '" AND starttime <= "' . $lastDay . ' 23:59:59"';

        $sql       = "SELECT * FROM pkg_did WHERE activated = 1 AND reserved = 1";
        $resultDid = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($resultDid[0]['id'])) {
            return;
        }
        //convert month to YYYYMM
        $month = preg_replace('/-/', '', substr($this->day, 0, -3));

        $sql = "DELETE FROM pkg_cdr_summary_month_did WHERE month = '" . $month . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        foreach ($resultDid as $key => $did) {

            $sql = "SELECT
                sum(sessiontime) AS sessiontime,
                SUM(sessiontime) / COUNT(*) AS aloc_all_calls,
                count(*) as nbcall,
                sum(sessionbill) AS sessionbill
                FROM pkg_cdr t WHERE $this->filter AND calledstation = '" . $did['did'] . "' AND sipiax IN(2,3)";
            $result = Yii::app()->db->createCommand($sql)->queryAll();

            if (!isset($result[0]['sessiontime'])) {
                continue;
            }

            $result[0]['sessionbill'] = $result[0]['sessionbill'] == null ? 0 : $result[0]['sessionbill'];

            $line = "('" . $month . "','" . $did['id'] . "', '" . $result[0]['sessiontime'] . "','" . $result[0]['aloc_all_calls'] . "','" . $result[0]['nbcall'] . "','" . $result[0]['sessionbill'] . "')";

            $sql = "INSERT INTO pkg_cdr_summary_month_did (month, id_did, sessiontime, aloc_all_calls, nbcall, sessionbill) VALUES " . $line . ";";

            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo $sql . "\n";
            }

        }
    }
    public function perMonthTrunk()
    {

        $sql = "SELECT
                id_trunk,
                SUM(sessiontime) AS sessiontime,
                SUM(aloc_all_calls) AS aloc_all_calls,
                SUM(nbcall) AS nbcall,
                SUM(nbcall_fail) AS nbcall_fail,
                SUM(buycost) AS buycost,
                SUM(sessionbill) AS sessionbill
                FROM pkg_cdr_summary_day_trunk
                WHERE day >= '" . substr($this->day, 0, -3) . "-01'  AND day <= '" . substr($this->day, 0, -3) . "-31' GROUP BY id_trunk";

        $result = Yii::app()->db->createCommand($sql)->queryAll();

        //convert month to YYYYMM
        $month = preg_replace('/-/', '', substr($this->day, 0, -3));

        if (!isset($result[0]['id_trunk'])) {
            return;
        }

        $line = '';
        foreach ($result as $key => $value) {

            if (!is_numeric($value['id_trunk']) || $value['id_trunk'] < 1) {
                continue;
            }
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['sessiontime'] / $value['nbcall'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $month . "','" . $value['id_trunk'] . "','" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "','" . $value['nbcall_fail'] . "'),";
        }

        $sql = "DELETE FROM pkg_cdr_summary_month_trunk WHERE month = '" . $month . "' ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_month_trunk (month, id_trunk, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill,nbcall_fail) VALUES " . substr($line, 0, -1) . ";";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        echo "perMonthTrunk " . date('H:i:s') . "\n";

        $sql = "UPDATE  pkg_cdr_summary_month_trunk SET lucro = sessionbill - buycost";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_month_trunk SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();

    }

    public function perUser()
    {

        $sql = "SELECT
                id_user,
                SUM(sessiontime) AS sessiontime,
                SUM(aloc_all_calls) AS aloc_all_calls,
                SUM(nbcall) AS nbcall,
                SUM(nbcall_fail) AS nbcall_fail,
                SUM(buycost) AS buycost,
                SUM(sessionbill) AS sessionbill,
                sum(agent_bill) AS agent_bill,
                isAgent
                FROM pkg_cdr_summary_day_user
                 GROUP BY id_user";
        $result = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($result[0]['id_user'])) {
            return;
        }

        $line = '';
        foreach ($result as $key => $value) {
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['sessiontime'] / $value['nbcall'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $value['isAgent']        = $value['isAgent'] == null || $value['isAgent'] == '' ? 0 : $value['isAgent'];
            $line .= "('" . $value['id_user'] . "','" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "','" . $value['isAgent'] . "','" . $value['agent_bill'] . "', '" . $value['nbcall_fail'] . "'),";
        }

        $sql = "TRUNCATE pkg_cdr_summary_user";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            //
            $sql = "DROP table pkg_cdr_summary_user";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo $sql . "\n";
            }
        }

        $sql = "DESCRIBE pkg_cdr_summary_user";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {

            $sql = "CREATE TABLE `pkg_cdr_summary_user` (
                  `id` int(11) NOT NULL AUTO_INCREMENT,
                  `id_user` int(11) NOT NULL,
                  `sessiontime` bigint(25) NOT NULL,
                  `aloc_all_calls` int(11) NOT NULL,
                  `nbcall` int(11) NOT NULL,
                  `nbcall_fail` int(11) DEFAULT NULL,
                  `buycost` float NOT NULL DEFAULT '0',
                  `sessionbill` float NOT NULL DEFAULT '0',
                  `lucro` float DEFAULT NULL,
                  `asr` float DEFAULT NULL,
                  `isAgent` int(11) DEFAULT NULL,
                  `agent_bill` float NOT NULL DEFAULT '0',
                  PRIMARY KEY (`id`),
                  KEY `id_user` (`id_user`)
                ) ENGINE=InnoDB DEFAULT CHARSET=latin1;";
            Yii::app()->db->createCommand($sql)->execute();
        }

        $sql = "INSERT INTO pkg_cdr_summary_user (id_user, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill, isAgent, agent_bill,nbcall_fail) VALUES " . substr($line, 0, -1) . ";";

        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
            return;
        }

        $sql = "UPDATE  pkg_cdr_summary_user SET isAgent = 0 WHERE isAgent <= 1";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_user SET isAgent =1 WHERE isAgent > 1";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_user SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_user SET lucro = sessionbill - buycost  WHERE isAgent = 0";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_user SET lucro = agent_bill - sessionbill  WHERE isAgent = 1";
        Yii::app()->db->createCommand($sql)->execute();

    }

    public function perTrunk()
    {

        $sql = "SELECT
                id_trunk,
                SUM(sessiontime) AS sessiontime,
                SUM(aloc_all_calls) AS aloc_all_calls,
                SUM(nbcall) AS nbcall,
                SUM(nbcall_fail) AS nbcall_fail,
                SUM(buycost) AS buycost,
                SUM(sessionbill) AS sessionbill
                FROM pkg_cdr_summary_day_trunk
                 GROUP BY id_trunk";
        $result = Yii::app()->db->createCommand($sql)->queryAll();

        if (!isset($result[0]['id_trunk'])) {
            return;
        }

        $line = '';
        foreach ($result as $key => $value) {
            $value['aloc_all_calls'] = $value['aloc_all_calls'] == null ? 0 : $value['sessiontime'] / $value['nbcall'];
            $value['sessiontime']    = $value['sessiontime'] == null ? 0 : $value['sessiontime'];
            $value['buycost']        = $value['buycost'] == null ? 0 : $value['buycost'];
            $value['sessionbill']    = $value['sessionbill'] == null ? 0 : $value['sessionbill'];
            $line .= "('" . $value['id_trunk'] . "','" . $value['sessiontime'] . "','" . $value['aloc_all_calls'] . "','" . $value['nbcall'] . "','" . $value['buycost'] . "','" . $value['sessionbill'] . "','" . $value['nbcall_fail'] . "'),";
        }

        $sql = "TRUNCATE pkg_cdr_summary_trunk";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "INSERT INTO pkg_cdr_summary_trunk (id_trunk, sessiontime, aloc_all_calls, nbcall, buycost, sessionbill, nbcall_fail) VALUES " . substr($line, 0, -1) . ";";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo $sql . "\n";
        }

        $sql = "UPDATE  pkg_cdr_summary_trunk SET asr = (nbcall / ( nbcall_fail + nbcall) ) * 100 ";
        Yii::app()->db->createCommand($sql)->execute();

        $sql = "UPDATE  pkg_cdr_summary_trunk SET lucro = sessionbill - buycost";
        Yii::app()->db->createCommand($sql)->execute();
    }

    public function validateDate($date, $format = 'Y-m-d')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }

}
