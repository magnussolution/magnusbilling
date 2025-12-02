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
class DeleteCallCommand extends ConsoleCommand
{
    public function run($args)
    {
        ini_set('memory_limit', '-1');
        $backdate = $this->subDayIntoDate(date('Ymd'), 15);

        Call::model()->deleteAll([
            'condition' => 'sessiontime = 0 AND  starttime < :key',
            'params'    => [':key' => $backdate],
            'limit'     => 1000,
        ]);
    }

    public function subDayIntoDate($date, $days)
    {
        $thisyear  = substr($date, 0, 4);
        $thismonth = substr($date, 4, 2);
        $thisday   = substr($date, 6, 2);
        $nextdate  = mktime(0, 0, 0, $thismonth, $thisday - $days, $thisyear);
        return strftime("%Y-%m-%d", $nextdate);
    }
}
