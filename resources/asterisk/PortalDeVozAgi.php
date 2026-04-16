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
// PortalDeVozAgi provides a simple voice portal where callers can dial a
// destination by entering a SIP username.  Typically triggered by a DID that
// routes to a voice portal.  It prompts the caller for digits and then
// forwards the call to the entered SIP account.
class PortalDeVozAgi
{

    // send: main routine invoked by DidAgi when the destination type is
    // portal_de_voz.  Plays a prompt asking for a SIP user ID, looks up the
    // account, and then delegates to SipCallAgi to place the call.  Retries up
    // to three times on invalid input.
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

            if (! isset($MAGNUS->modelSip->id)) {
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
