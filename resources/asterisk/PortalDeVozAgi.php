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
class PortalDeVozAgi
{

    public static function send(&$agi, &$MAGNUS, &$CalcAgi, &$DidAgi)
    {
        $agi->answer();
        $agi->verbose('PortalDeVozAgi');
        for ($i = 0; $i < 3; $i++) {
            $res_dtmf     = $agi->get_data('prepaid-enter-dest', 5000, 10);
            $MAGNUS->dnid = $res_dtmf["result"];

            $sql = "SELECT * FROM pkg_sip WHERE name = '$MAGNUS->dnid' OR alias = '$MAGNUS->dnid' LIMIT 1 ";
            $agi->verbose($sql, 25);
            $MAGNUS->modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            if ( ! isset($MAGNUS->modelSip->id)) {
                $agi->verbose('User no found', 15);
                $agi->stream_file('prepaid-invalid-digits', '#');
                continue;
            } else {
                $agi->verbose('Call to user ' . $MAGNUS->modelSip->name, 15);
                $MAGNUS->extension = $MAGNUS->destination = $MAGNUS->dnid = $MAGNUS->modelSip->name;
                SipCallAgi::processCall($MAGNUS, $agi, $CalcAgi);
                break;
            }
        }

    }
}
