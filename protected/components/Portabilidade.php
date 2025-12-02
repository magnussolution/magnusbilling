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
class Portabilidade
{
    public static function getDestination($destination, $id_plan = null)
    {
        if (strlen($destination) >= 10 && substr($destination, 0, 2) == 55) {
            $config    = LoadConfig::getConfig();
            $ddd       = substr($destination, 2);
            $is_mobile = false;
            $is_fixed  = false;

            $modelPlan = Plan::model()->findByPk((int) $id_plan);

            if (strlen($ddd) >= 11 || substr($ddd, 2, 1) >= 7) {
                $is_mobile = true;
            } else {
                $is_fixed = true;
            }

            if (($is_mobile == true && $modelPlan->portabilidadeMobile == 1) || ($is_fixed == true && $modelPlan->portabilidadeFixed == 1)) {

                if (strlen($config['global']['portabilidadeUsername']) > 3 && strlen($config['global']['portabilidadePassword']) > 3) {
                    $user = $config['global']['portabilidadeUsername'];
                    $pass = $config['global']['portabilidadePassword'];
                    $url  = "http://portabilidadecelular.com/painel/consulta_numero.php?user=" . $user . "&pass=" . $pass . "&seache_number=" . $destination . "";
                    if ( ! $operadora = @file_get_contents($url, false)) {
                        $operadora = '55999';
                    }

                    $company     = str_replace("55", "", $operadora);
                    $destination = "1111" . $company . $destination;
                } else {
                    if ($is_mobile && strlen($ddd) == 10 && substr($ddd, 2, 1) == 7) {
                        //verifico se é radio
                        $sql     = "SELECT company FROM pkg_portabilidade_prefix  WHERE number = :key LIMIT 1";
                        $command = Yii::app()->db->createCommand($sql);
                        $command->bindValue(":key", substr($ddd, 0, 6), PDO::PARAM_STR);
                        $result = $command->queryAll();

                        $radiosRn1 = ['55377,55390,55391'];

                        //se nao for radio, adiciono o 9º digito
                        if ( ! count($result) || ! in_array($row[0]['company'], $radiosRn1)) {
                            $ddd = substr($ddd, 0, 2) . 9 . substr($ddd, 2);
                        }

                    }

                    $sql     = "SELECT company FROM pkg_portabilidade  WHERE number = :key ORDER BY id DESC LIMIT 1";
                    $command = Yii::app()->db->createCommand($sql);
                    $command->bindValue(":key", $ddd, PDO::PARAM_STR);
                    $result = $command->queryAll();

                    if (count($result) && isset($result[0]['company'])) {
                        $destination = preg_replace("/^55/", '1111', $result[0]['company']) . $destination;
                    } else {
                        if (strlen($ddd) == 11) {
                            $sql = "SELECT company FROM pkg_portabilidade_prefix WHERE number = " . substr($ddd, 0, 7) . " ORDER BY number DESC LIMIT 1";
                        } else {
                            $sql = "SELECT company FROM pkg_portabilidade_prefix WHERE number = " . substr($ddd, 0, 6) . " ORDER BY number DESC LIMIT 1";
                        }
                        $result = Yii::app()->db->createCommand($sql)->queryAll();

                        if (is_array($result) && isset($result[0]['company'])) {
                            $destination = preg_replace("/^55/", '1111', $result[0]['company']) . $destination;
                        } else {
                            $destination = '1111399' . $destination;
                        }

                    }
                }
            }
        }
        return $destination;
    }
}
