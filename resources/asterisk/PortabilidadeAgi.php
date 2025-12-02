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

class PortabilidadeAgi
{

    public static function getDestination($agi, $MAGNUS, $number)
    {
        $agi->verbose("consulta portabilidade numero " . $number, 25);

        //celular SP
        $mobile = false;
        $fixed  = false;

        if (strlen($number) >= 10 && substr($number, 0, 2) == 55) {

            if (substr($number, 4, 1) >= 7) {
                $mobile = true;
            } else {
                $fixed = true;
            }

            if (($mobile == true && $MAGNUS->portabilidadeMobile == 1) ||
                ($fixed == true && $MAGNUS->portabilidadeFixed == 1)) {

                $MAGNUS->portabilidade = true;
                if (strlen($MAGNUS->config['global']['portabilidadeUsername']) > 3 && strlen($MAGNUS->config['global']['portabilidadePassword']) > 3) {
                    $user = $MAGNUS->config['global']['portabilidadeUsername'];
                    $pass = $MAGNUS->config['global']['portabilidadePassword'];
                    $url  = "http://consultas.portabilidadecelular.com/painel/consulta_numero.php?user=" . $user . "&pass=" . $pass . "&seache_number=" . $number . "";
                    $agi->verbose($url, 25);

                    if ( ! $operadora = @file_get_contents($url, false)) {
                        $operadora = '55999';
                    }
                    $company = str_replace("55", "", $operadora);
                    $number  = "1111" . $company . $number;
                } else {
                    $ddd = substr($number, 2);
                    //verifico se é radio
                    if (strlen($ddd) == 10 && $mobile == true) {
                        $sql = "SELECT company FROM pkg_portabilidade_prefix  WHERE number = '" . substr($ddd, 0, 6) . "' ORDER BY id DESC LIMIT 1";
                        $agi->verbose($sql, 25);
                        $resultNextel = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                        if (isset($resultNextel->company)
                            && ($resultNextel->company == '55377' || $resultNextel->company == '55390'
                                || $resultNextel->company == '55391')) {
                            $agi->verbose("é Nextel", 15);
                            $company = str_replace("55", "", $resultNextel->company);
                            $number  = "1111" . $company . $number;
                            $agi->verbose("CONSULTA DA PORTABILIDADE ->" . $modelPortabilidade->company, 1);
                            return $number;
                        } else {

                            $agi->verbose("Numero sem o nono digito, MBilling adicionou", 8);
                            $ddd    = substr($ddd, 0, 2) . 9 . substr($ddd, 2);
                            $number = "55" . $ddd;

                        }
                    }
                    $sql = "SELECT company FROM pkg_portabilidade WHERE number = '$ddd' ORDER BY id DESC LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelPortabilidade = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                    if (isset($modelPortabilidade->company)) {
                        $company = str_replace("55", "", $modelPortabilidade->company);
                        $number  = "1111" . $company . $number;
                        $agi->verbose("CONSULTA DA PORTABILIDADE ->" . $modelPortabilidade->company, 25);
                    } else {
                        if ($mobile == true) {
                            $sql = "SELECT company FROM pkg_portabilidade_prefix WHERE number = " . substr($ddd, 0, 7) . " LIMIT 1";
                        } else {
                            $sql = "SELECT company FROM pkg_portabilidade_prefix WHERE number = " . substr($ddd, 0, 6) . " LIMIT 1";
                        }
                        $agi->verbose($sql, 25);
                        $modelPortabilidade = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                        if (isset($modelPortabilidade->company)) {
                            $company = str_replace("55", "", $modelPortabilidade->company);
                            $number  = "1111" . $company . $number;
                            $agi->verbose("CONSULTA DA PORTABILIDADE ->NUMERO NAO FOI PORTADO->" . $modelPortabilidade->company, 25);
                        } else {
                            $company = 399;
                            $number  = "1111" . $company . $number;
                            $agi->verbose("CONSULTA DA PORTABILIDADE ->Numero sem operadora->" . $number, 3);
                        }
                    }
                }
                $agi->verbose("CONSULTA DA PORTABILIDADE ->" . $number, 25);
            }
        } else if ($MAGNUS->portabilidadeMobile == true) {
            $sql = "SELECT prefix FROM pkg_nmp  WHERE number = '" . $number . "' LIMIT 1";
            $agi->verbose($sql, 25);
            $modelNMP = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelNMP->prefix)) {
                $number      = "1111" . $modelNMP->prefix . $number;
                $MAGNUS->NPM = 1;
                $agi->verbose('MAGNUS->NP -> ' . $MAGNUS->NPM, 5);
            }
        }
        return $number;
    }
}
