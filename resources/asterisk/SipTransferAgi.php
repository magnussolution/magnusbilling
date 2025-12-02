<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusSolution. All rights reserved.
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

class SipTransferAgi
{
    public static function billing(&$MAGNUS, $agi, &$CalcAgi)
    {
        $siptransfer = $agi->get_variable("SIPTRANSFER");
        if ($siptransfer['data'] == 'yes') {
            // transferencia
            $agi->verbose("SIPTRANSFER", 15);

            $MAGNUS->agiconfig['cid_enable']     = 0;
            $MAGNUS->agiconfig['say_timetocall'] = 0;
            if (strlen($MAGNUS->CallerID) < 6) {
                $sql = "SELECT * FROM pkg_cdr WHERE uniqueid = '$MAGNUS->uniqueid' AND starttime = '" . date("Y-m-d") . "' ";
                $agi->verbose($sql, 25);
                $modelCall = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                if (isset($modelCall->id)) {
                    $MAGNUS->CallerID = $modelCall->calledstation;
                }

            }
            $cia_res = AuthenticateAgi::authenticateUser($agi, $MAGNUS);

            if ($cia_res == 1) {

                $MAGNUS->CallerID = $MAGNUS->number_translation($agi, $MAGNUS->CallerID);
                $MAGNUS->dnid     = $MAGNUS->destination     = $MAGNUS->CallerID;

                $MAGNUS->agiconfig['use_dnid'] = 1;

                $searchTariff          = new SearchTariff();
                $resfindrate           = $searchTariff->find($MAGNUS, $agi);
                $CalcAgi->tariffObj    = $resfindrate;
                $CalcAgi->number_trunk = count($resfindrate);

                $agi->verbose(print_r($CalcAgi->tariffObj, true), 10);
                $CalcAgi->usedratecard = 0;
                // IF FIND RATE
                if ($resfindrate != 0) {
                    $agi->verbose("CREDIT $MAGNUS->credit", 15);
                    $res_all_calcultimeout = $CalcAgi->calculateAllTimeout($MAGNUS, $MAGNUS->credit);
                    $agi->verbose(print_r($res_all_calcultimeout, true), 10);

                    if ($res_all_calcultimeout) {
                        $dialtime = $agi->get_variable("DIALEDTIME");
                        $dialtime = $dialtime['data'];

                        $answeredtime = $agi->get_variable("ANSWEREDTIME");
                        $answeredtime = $answeredtime['data'];

                        $CalcAgi->answeredtime = $dialtime + $answeredtime + 30;
                        $CalcAgi->dialstatus   = 'ANSWERED';
                        $CalcAgi->usedtrunk    = $CalcAgi->tariffObj[0]['rc_id_trunk'];
                        $agi->verbose("Calc -> answeredtime=" . $CalcAgi->answeredtime . " $CalcAgi->usedtrunk", 15);

                        $CalcAgi->updateSystem($MAGNUS, $agi, 1, 0, 2);

                    }
                }
            }
        }
    }
}
