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

// PickupAgi handles the "call pickup" feature triggered by dialling
// *7XX.  It searches for a SIP peer belonging to the caller's accountcode
// and uses AMI to find a ringing channel for that peer, then issues a
// PickupChan command to answer the call.  Called from mbilling.php when the
// DNID starts with *7.
class PickupAgi
{
    // execute: perform the pickup operation.
    // Looks up the SIP account from the DNID, then connects to AMI to scan
    // active channels for a ringing instance of that account.  If found,
    // invokes the PickupChan application to answer the call, then hangs up.
    public static function execute(&$agi, &$MAGNUS)
    {
        $sql = "SELECT * FROM pkg_sip WHERE ( name = '" . substr($MAGNUS->dnid, 2) . "' OR alias = '" . substr($MAGNUS->dnid, 2) . "' )  AND accountcode = '$MAGNUS->accountcode' LIMIT 1";
        $agi->verbose($sql, 25);
        $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (isset($modelSip->accountcode)) {

            $agi->verbose('Pickup module - SipAccount ' . $MAGNUS->accountcode . ' try pickup extension ' . $modelSip->name, 1);

            $asmanager = new AGI_AsteriskManager();
            $asmanager->connect('localhost', 'magnus', 'magnussolution');

            $calls = $asmanager->command("core show channels concise");
            $asmanager->disconnect();

            $channelsData = explode("\n", $calls["data"]);
            $channel      = '';
            foreach ($channelsData as $key => $line) {
                if (preg_match("/^SIP\/($modelSip->name)-/", $line) && preg_match("/Ringing/", $line)) {
                    $channel = explode("!", $line);
                    $channel = $channel[0];
                    break;
                }
            }
            if (strlen($channel) > 2) {
                $agi->verbose("pickup channel $channel");
                $agi->execute('PickupChan', $channel);
            }
        } else {
            $agi->verbose('Pickup module - SipAccount ' . $MAGNUS->accountcode . ' try pickup from another user extension ' . $modelSip->name, 1);
        }

        $MAGNUS->hangup($agi);
    }
}
