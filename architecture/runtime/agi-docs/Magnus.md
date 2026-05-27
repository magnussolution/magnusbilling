# Magnus

======================================= ################################### MagnusBilling @package MagnusBilling @author Adilson Leffa Magnus. @copyright Copyright (C) 2005 - 2021 MagnusSolution. All rights reserved. ################################### This software is released under the terms of the GNU Lesser General Public License v2.1 A copy of which is available from http://www.gnu.org/copyleft/lesser.html Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues ======================================= Magnusbilling.com <info@magnusbilling.com>

## Methods

### __construct()

### init()

### load_conf(&$agi, $config = null, $webui = 0, $idconfig = 1, $optconfig = [])

### get_agi_request_parameter($agi)

### calculation_price($buyrate, $duration, $initblock, $increment)

### hangup(&$agi, $code = '')

### getDialStatus_Revert_List()

### checkNumber($agi, &$CalcAgi, $try_num, $call2did = false)

### say_time_call($agi, $timeout, $rate = 0)

### sayBalance($agi, $credit, $fromvoucher = 0)

### sayLastCall($agi, $rate, $time = 0)

### sayRate($agi, $rate)

### checkDaysPackage($agi, $startday, $billingtype)

### freeCallUsed($agi, $id_user, $id_offer, $billingtype, $startday)

### packageUsedSeconds($agi, $id_user, $id_offer, $billingtype, $startday)

### check_expirationdate_customer($agi)

### run_dial($agi, $dialstr, $dialparams = "", $trunk_directmedia = 'no', $timeout = 3600, $max_long = 2147483647)

### number_translation($agi, $destination)

### round_precision($number)

### executePlayAudio($prompt, $agi)

### checkRestrictPhoneNumber($agi, $type = 'outbound')

### startRecordCall(&$agi, $addicional = '', $isDid = false)

### stopRecordCall(&$agi)

### executeVoiceMail($agi, $dialstatus, $answeredtime)

### roudRatePrice($sessiontime, $sell, $initblock, $billingblock)

### checkIVRSchedule($monFri, $sat, $sun)

### getNewUsername($agi)

### generatePassword($tamanho, $maiuscula, $minuscula, $numeros, $codigos)

