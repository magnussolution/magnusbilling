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
class PortabilidadeCommand extends CConsoleCommand
{

    private $validUser;
    private $validPass;
    public function run($args)
    {


        if (isset($args[2]) && $args[2] == 'did') {
            $this->checkDID($args);
            exit;
        }

        $this->validUser = preg_match('/^[A-Za-z0-9._-]+$/', $args['0']);
        $this->validPass = preg_match('/^[A-Za-z0-9._-]+$/', $args['1']);

        if ($this->validUser && $this->validPass) {




            shell_exec('mkdir -p /usr/src/ChipCerto');
            shell_exec('rm -rf /usr/src/ChipCerto/*');
            shell_exec('cd /usr/src/ChipCerto && wget ftp://' . escapeshellarg($this->validUser) . ':' . escapeshellarg($this->validPass) . '@ftp.portabilidadecelular.com:2157/portabilidade.tar.bz2 && tar -jxvf portabilidade.tar.bz2');
            shell_exec('cd /usr/src/ChipCerto && wget ftp://' . escapeshellarg($this->validUser) . ':' . escapeshellarg($this->validPass) . '@ftp.portabilidadecelular.com:2157/prefix_anatel.csv');

            if (! file_exists("/usr/src/ChipCerto/prefix_anatel.csv")) {
                exit;
            }

            if (filesize("/usr/src/ChipCerto/prefix_anatel.csv") < '100') {
                exit;
            }

            $sql = "CREATE TABLE IF NOT EXISTS pkg_portabilidade_prefix (
          `id` int(11) NOT NULL auto_increment,
          `number` bigint(15) NOT NULL,
          `company` int(5) NOT NULL,
          PRIMARY KEY  (`id`),
          KEY `number` (`number`),
          KEY `company` (`company`)
        ) ENGINE=MyISAM  DEFAULT CHARSET=latin1;";
            Yii::app()->db->createCommand($sql)->execute();

            $sql = "TRUNCATE pkg_portabilidade_prefix";
            Yii::app()->db->createCommand($sql)->execute();

            $sql = "LOAD DATA LOCAL INFILE '/usr/src/ChipCerto/prefix_anatel.csv' INTO TABLE pkg_portabilidade_prefix FIELDS TERMINATED BY ';'  LINES TERMINATED BY '\n'  (number, company);";
            Yii::app()->db->createCommand($sql)->execute();

            if (! file_exists("/usr/src/ChipCerto/exporta.csv")) {
                exit;
            }

            if (filesize("/usr/src/ChipCerto/exporta.csv") < '10000') {
                exit;
            }

            $sql = "CREATE TABLE IF NOT EXISTS pkg_portabilidade (
          `id` int(11) NOT NULL auto_increment,
          `number` bigint(15) NOT NULL,
          `company` int(5) NOT NULL,
          `date` varchar(30) NOT NULL,
          PRIMARY KEY  (`id`),
          KEY `number` (`number`),
          KEY `company` (`company`)
        ) ENGINE=MyISAM  DEFAULT CHARSET=latin1;";
            Yii::app()->db->createCommand($sql)->execute();

            $sql = "TRUNCATE pkg_portabilidade";
            Yii::app()->db->createCommand($sql)->execute();

            $sql = "LOAD DATA LOCAL INFILE '/usr/src/ChipCerto/exporta.csv' INTO TABLE pkg_portabilidade FIELDS TERMINATED BY ';'  LINES TERMINATED BY '\n'  (id, number, company, date);";
            Yii::app()->db->createCommand($sql)->execute();
        } else {
            exit('Usuário ou senha inválidos');
        }
    }

    public function checkDID($args)
    {

        $modelDid = Did::model()->findAll();

        foreach ($modelDid as $key => $did) {

            $url = "https://consultas.portabilidadecelular.com/painel/consulta_numero.php?user=" . escapeshellarg($this->validUser)  . "&pass=" . escapeshellarg($this->validPass) . "&seache_number=" . $did->did . "&completo";

            if (! $result = @file_get_contents($url, false)) {

                $did->country = 'Operadora não identificada';
            } else {
                $res = preg_split('/\|/', $result);
            }

            if (! isset($res[1])) {
                print_r($result);
                continue;
            }

            if ($res == 55998) {
                $did->country = 'Sem crédito';
            } else {

                if ($res[1]) {
                    $did->country = $res[3] . ' ' . $res[2];
                } else {
                    $did->country = $res[3];
                }
            }
            $did->country = utf8_encode($did->country);
            echo $did->did . ' ' . $did->country . "\n";

            $did->save();
        }
    }
}
