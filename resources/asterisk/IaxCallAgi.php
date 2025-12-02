<?php

/**
 *
 */
class IaxCallAgi
{

    public static function processCall(&$MAGNUS, &$agi, &$CalcAgi, $modeIax)
    {
        $agi->verbose('IaxCallAgi ');
        if (($MAGNUS->agiconfig['use_dnid'] == 1) && (strlen($MAGNUS->dnid) > 2)) {
            $MAGNUS->destination = $MAGNUS->dnid;
        }

        $MAGNUS->destination = $MAGNUS->dnid;
        $dialparams          = $MAGNUS->agiconfig['dialcommand_param_sipiax_friend'];

        $agi->verbose('IaxCallAgi 2');

        $sql = "SELECT * FROM pkg_user WHERE id = " . $modeIax->id_user . " LIMIT 1";
        $agi->verbose($sql, 25);
        $MAGNUS->modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $MAGNUS->modelUser);

        $MAGNUS->startRecordCall($agi);

        $dialstr = "IAX2/" . $MAGNUS->destination;

        $startCall = time();
        $MAGNUS->run_dial($agi, $dialstr, $dialparams);

        $answeredtime = $agi->get_variable("ANSWEREDTIME");
        $answeredtime = $answeredtime['data'];
        $dialstatus   = $agi->get_variable("DIALSTATUS");
        $dialstatus   = $dialstatus['data'];

        $MAGNUS->stopRecordCall($agi);

        $agi->verbose("[" . $MAGNUS->username . " Friend]:[ANSWEREDTIME=" . $answeredtime . "-DIALSTATUS=" . $dialstatus . "]", 6);

        if (strlen($MAGNUS->dialstatus_rev_list[$dialstatus]) > 0) {
            $terminatecauseid = $MAGNUS->dialstatus_rev_list[$dialstatus];
        } else {
            $terminatecauseid = 0;
        }

        if ($answeredtime > 0 && $terminatecauseid == 1) {
            if ($MAGNUS->config['global']['charge_sip_call'] > 0) {
                $cost = ($MAGNUS->config['global']['charge_sip_call'] / 60) * $answeredtime;
                $agi->verbose("Update credit username after transfer $MAGNUS->username, " . $cost, 15);
            } else {
                $cost = 0;
            }
        }

        $CalcAgi->starttime        = date("Y-m-d H:i:s", $startCall);
        $CalcAgi->sessiontime      = $answeredtime;
        $CalcAgi->terminatecauseid = $terminatecauseid;
        $CalcAgi->sessionbill      = $cost;
        $CalcAgi->sipiax           = 1;
        $CalcAgi->buycost          = 0;
        $CalcAgi->saveCDR($agi, $MAGNUS);

        $MAGNUS->hangup($agi);
    }
}
