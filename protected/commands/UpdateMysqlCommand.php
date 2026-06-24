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
class UpdateMysqlCommand extends CConsoleCommand
{

    public $debug = 0;
    public $config;

    public function run($args)
    {

        $this->config = LoadConfig::getConfig();

        if (file_exists('/var/spool/cron/root')) {
            $CRONPATH = '/var/spool/cron/root';
        } elseif (file_exists('/var/spool/cron/crontabs/root')) {
            $CRONPATH = '/var/spool/cron/crontabs/root';
        }

        $version  = $this->config['global']['version'];
        $language = $this->config['global']['base_language'];

        echo $version;

        if (preg_match('/^6/', $version)) {

            $sql = "
            CREATE TABLE IF NOT EXISTS `pkg_rate_provider` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `id_provider` int(11) NOT NULL,
            `id_prefix` int(11) NOT NULL,
            `buyrate` decimal(15,6) DEFAULT '0.000000',
            `buyrateinitblock` int(11) NOT NULL DEFAULT '1',
            `buyrateincrement` int(11) NOT NULL DEFAULT '1',
            `minimal_time_buy` int(2) NOT NULL DEFAULT '0',
            `dialprefix` bigint(20) DEFAULT NULL,
            `destination` varchar(50) DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `fk_pkg_prefix_pkg_rate` (`id_prefix`),
            KEY `dialprefix` (`dialprefix`),
            CONSTRAINT `fk_pkg_provider_pkg_rate_provider` FOREIGN KEY (`id_provider`) REFERENCES `pkg_provider` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            ";
            $this->executeDB($sql);

            $sql    = "SELECT * FROM pkg_provider";
            $result = Yii::app()->db->createCommand($sql)->queryAll();
            foreach ($result as $key => $provider) {
                $sql = "INSERT INTO `pkg_rate_provider` (`id_provider`, `id_prefix`, `buyrate`, `buyrateinitblock`, `buyrateincrement`, `minimal_time_buy`)    SELECT " . $provider['id'] . ", t.id, 0, 1, 1, 0  FROM `pkg_prefix` t ";
                $this->executeDB($sql);
            }

            $sql = "UPDATE pkg_rate LEFT JOIN  pkg_trunk ON pkg_rate.id_trunk = pkg_trunk.id  SET pkg_rate.starttime = pkg_trunk.id_provider;";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_rate_provider  JOIN  pkg_rate ON pkg_rate.starttime = pkg_rate_provider.id_provider AND pkg_rate.id_prefix = pkg_rate_provider.id_prefix SET
            pkg_rate_provider.buyrate = pkg_rate.buyrate, pkg_rate_provider.buyrateinitblock = pkg_rate.buyrateinitblock,
            pkg_rate_provider.buyrateincrement = pkg_rate.buyrateincrement,
            pkg_rate_provider.minimal_time_buy = pkg_rate.minimal_time_buy";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Provider Rates'')', 'rateprovider', 'prefixs', 10,3)";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_module SET priority = '1' WHERE module = 'provider';
            UPDATE pkg_module SET priority = '2' WHERE module = 'trunk';
            UPDATE pkg_module SET priority = '4' WHERE module = 'servers';
            ";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_rate`
              DROP `buyrate`,
              DROP `buyrateinitblock`,
              DROP `buyrateincrement`,
              DROP `minimal_time_buy`,
              DROP `startdate`,
              DROP `stopdate`,
              DROP `starttime`,
              DROP `endtime`,
              DROP `musiconhold`;";
            $this->executeDB($sql);

            $sql = "
            ALTER TABLE `pkg_rate` ADD `dialprefix` bigint(20) NULL DEFAULT NULL , ADD INDEX (`dialprefix`) ;
            ALTER TABLE `pkg_rate` ADD `destination` varchar(50) NULL DEFAULT NULL;
            ";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_rate`
            CHANGE `initblock` `initblock` INT(11) NOT NULL DEFAULT '1',
            CHANGE `billingblock` `billingblock` INT(11) NOT NULL DEFAULT '1'
            ;";
            $this->executeDB($sql);

            $sql = "

            CREATE TABLE IF NOT EXISTS `pkg_status_system` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
              `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `cpuMediaUso` float NOT NULL DEFAULT '0',
              `cpuPercent` float NOT NULL DEFAULT '0',
              `memTotal` int(11) DEFAULT NULL,
              `memUsed` float NOT NULL DEFAULT '0',
              `networkin` float NOT NULL DEFAULT '0',
              `networkout` float NOT NULL DEFAULT '0',
              `cpuModel` varchar(200) DEFAULT NULL,
              `uptime` varchar(200) DEFAULT NULL,
              PRIMARY KEY (`id`),
              UNIQUE KEY `date` (`date`)
            ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=0";

            $this->executeDB($sql);

            $sql = "UPDATE pkg_module SET `icon_cls` = 'x-fa fa-arrow-right' WHERE id_module IS NULL;
            UPDATE pkg_module SET `icon_cls` = 'x-fa fa-desktop' WHERE id_module IS NOT NULL;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE pkg_rate DROP FOREIGN KEY fk_pkg_prefix_pkg_rate;";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'Enable Signup Form', 'enable_signup', '0', 'Enable Signup form', 'global', '1');

                ";
            $this->executeDB($sql);

            $sql = "
                UPDATE `pkg_group_module` SET `show_menu` = '1', action = 'ru' WHERE `pkg_group_module`.`id_group` = 1 AND `pkg_group_module`.`id_module` = 4;
                UPDATE `pkg_module` SET `text` = 't(''Menus'')' WHERE module = 'module';
                DELETE FROM `pkg_group_module` WHERE `id_module` = 2;
                DELETE FROM `pkg_module` WHERE `id` = 2;
                DELETE FROM `pkg_group_module` WHERE `id_module` = (SELECT id FROM `pkg_module` WHERE `module` = 'groupusergroup');
                DELETE FROM `pkg_module` WHERE `module` = 'groupusergroup';
                UPDATE `pkg_module` SET priority = 1 WHERE id = 1;
                UPDATE `pkg_module` SET priority = 2 WHERE id = 7;
                UPDATE `pkg_module` SET priority = 3 WHERE id = 5;
                UPDATE `pkg_module` SET priority = 4 WHERE id = 8;
                UPDATE `pkg_module` SET priority = 5 WHERE id = 9;
                UPDATE `pkg_module` SET priority = 6 WHERE id = 10;
                UPDATE `pkg_module` SET priority = 7 WHERE id = 12;
                UPDATE `pkg_module` SET priority = 8 WHERE id = 13;
                UPDATE `pkg_module` SET priority = 9 WHERE id = 14;
                UPDATE `pkg_module` SET priority = 10 WHERE `text` = 't(''Services'')' AND id_module IS NULL;

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 1 AND module = 'user';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 1 AND module = 'sip';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 1 AND module = 'callonline';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 1 AND module = 'callerid';
                UPDATE `pkg_module` SET priority = 5 WHERE id_module = 1 AND module = 'sipuras';
                UPDATE `pkg_module` SET priority = 6 WHERE id_module = 1 AND module = 'restrictedphonenumber';
                UPDATE `pkg_module` SET priority = 7 WHERE id_module = 1 AND module = 'callback';
                UPDATE `pkg_module` SET priority = 8 WHERE id_module = 1 AND module = 'buycredit';
                UPDATE `pkg_module` SET priority = 9 WHERE id_module = 1 AND module = 'iax';
                UPDATE `pkg_module` SET priority = 10 WHERE id_module = 1 AND module = 'gauthenticator';
                UPDATE `pkg_module` SET priority = 11 WHERE id_module = 1 AND module = 'transfertomobile';

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 7 AND module = 'refill';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 7 AND module = 'methodpay';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 7 AND module = 'voucher';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 7 AND module = 'refillprovider';

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 5 AND module = 'did';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 5 AND module = 'diddestination';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 5 AND module = 'diduse';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 5 AND module = 'ivr';
                UPDATE `pkg_module` SET priority = 5 WHERE id_module = 5 AND module = 'queue';
                UPDATE `pkg_module` SET priority = 6 WHERE id_module = 5 AND module = 'queuemember';
                UPDATE `pkg_module` SET priority = 7 WHERE id_module = 5 AND module = 'didbuy';
                UPDATE `pkg_module` SET priority = 8 WHERE id_module = 5 AND module = 'dashboardqueue';

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 8 AND module = 'plan';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 8 AND module = 'rate';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 8 AND module = 'prefix';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 8 AND module = 'userrate';
                UPDATE `pkg_module` SET priority = 5 WHERE id_module = 8 AND module = 'offer';
                UPDATE `pkg_module` SET priority = 6 WHERE id_module = 8 AND module = 'offercdr';
                UPDATE `pkg_module` SET priority = 7 WHERE id_module = 8 AND module = 'offeruse';

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 9 AND module = 'call';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 9 AND module = 'callfailed';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 9 AND module = 'callsummaryperday';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 9 AND module = 'callsummarydayuser';
                UPDATE `pkg_module` SET priority = 5 WHERE id_module = 9 AND module = 'callsummarydaytrunk';
                UPDATE `pkg_module` SET priority = 6 WHERE id_module = 9 AND module = 'callsummarydayagent';
                UPDATE `pkg_module` SET priority = 7 WHERE id_module = 9 AND module = 'callsummarypermonth';
                UPDATE `pkg_module` SET priority = 8 WHERE id_module = 9 AND module = 'callsummarymonthuser';
                UPDATE `pkg_module` SET priority = 9 WHERE id_module = 9 AND module = 'callsummarymonthtrunk';
                UPDATE `pkg_module` SET priority = 10 WHERE id_module = 9 AND module = 'callsummaryperuser';
                UPDATE `pkg_module` SET priority = 11 WHERE id_module = 9 AND module = 'callsummarypertrunk';
                UPDATE `pkg_module` SET priority = 12 WHERE id_module = 9 AND module = 'callarchive';
                UPDATE `pkg_module` SET priority = 13 WHERE id_module = 9 AND module = 'sendcreditsummary';


                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 10 AND module = 'rateprovider';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 10 AND module = 'provider';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 10 AND module = 'trunk';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 10 AND module = 'servers';

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 12 AND module = 'module';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 12 AND module = 'groupuser';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 12 AND module = 'configuration';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 12 AND module = 'templatemail';
                UPDATE `pkg_module` SET priority = 5 WHERE id_module = 12 AND module = 'logusers';
                UPDATE `pkg_module` SET priority = 6 WHERE id_module = 12 AND module = 'smtps';
                UPDATE `pkg_module` SET priority = 7 WHERE id_module = 12 AND module = 'firewall';
                UPDATE `pkg_module` SET priority = 8 WHERE id_module = 12 AND module = 'api';
                UPDATE `pkg_module` SET priority = 9 WHERE id_module = 12 AND module = 'dashboard';
                UPDATE `pkg_module` SET priority = 10 WHERE id_module = 12 AND module = 'campaignlog';


                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 13 AND module = 'campaign';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 13 AND module = 'phonebook';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 13 AND module = 'phonenumber';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 13 AND module = 'campaignpoll';
                UPDATE `pkg_module` SET priority = 5 WHERE id_module = 13 AND module = 'campaignpollinfo';
                UPDATE `pkg_module` SET priority = 6 WHERE id_module = 13 AND module = 'campaignrestrictphone';
                UPDATE `pkg_module` SET priority = 7 WHERE id_module = 13 AND module = 'sms';
                UPDATE `pkg_module` SET priority = 8 WHERE id_module = 13 AND module = 'campaignsend';

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 14 AND module = 'callshop';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 14 AND module = 'callshopcdr';
                UPDATE `pkg_module` SET priority = 3 WHERE id_module = 14 AND module = 'ratecallshop';
                UPDATE `pkg_module` SET priority = 4 WHERE id_module = 14 AND module = 'callsummarycallshop';

                UPDATE `pkg_module` SET priority = 1 WHERE id_module = 85 AND module = 'services';
                UPDATE `pkg_module` SET priority = 2 WHERE id_module = 85 AND module = 'servicesuse';
            ";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Background Color', 'backgroundColor', '#1b1e23', 'Background Color', 'global', '1')";
            $this->executeDB($sql);

            exec("echo '\n* * * * * php /var/www/html/mbilling/cron.php statussystem' >> /var/spool/cron/root");
            exec("touch /etc/asterisk/queues_magnus.conf");
            exec("echo '#include queues_magnus.conf' >> /etc/asterisk/queues.conf");

            exec("echo '

[trunk_answer_handler]
exten => s,1,Set(MASTER_CHANNEL(TRUNKANSWERTIME)=\${EPOCH})
    same => n,Return()' >> /etc/asterisk/extensions_magnus.conf");

            $version = '7.0.0';
            $sql     = "UPDATE pkg_configuration SET config_value = '" . $version . "'WHERE config_key = 'version'";
            $this->executeDB($sql);
        }

        if ($version == '7.0.0') {

            $sql = "
            ALTER TABLE `pkg_ivr` CHANGE `monFriStart` `monFriStart` VARCHAR(200) NOT NULL DEFAULT '09:00-12:00|14:00-18:00';
            ALTER TABLE `pkg_ivr` CHANGE `satStart` `satStart` VARCHAR(200) NOT NULL DEFAULT '09:00-12:00';
            ALTER TABLE `pkg_ivr` CHANGE `sunStart` `sunStart` VARCHAR(200) NOT NULL DEFAULT '00:00';
            UPDATE pkg_ivr SET monFriStart = CONCAT(monFriStart,'-',monFriStop);
            UPDATE pkg_ivr SET satStart = CONCAT(satStart,'-',satStop);
            UPDATE pkg_ivr SET sunStart = CONCAT(sunStart,'-',sunStop);
            ALTER TABLE `pkg_ivr` DROP `monFriStop`;
            ALTER TABLE `pkg_ivr` DROP `satStop`;
            ALTER TABLE `pkg_ivr` DROP `sunStop`;
            ";
            $this->executeDB($sql);

            $version = '7.0.1';
            $sql     = "UPDATE pkg_configuration SET config_value = '" . $version . "'WHERE config_key = 'version'";
            $this->executeDB($sql);
        }

        //2019-11-14
        if ($version == '7.0.1') {
            $sql = "ALTER TABLE `pkg_campaign` ADD `auto_reprocess` INT(11) NULL DEFAULT 0 ;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_day_agent` ADD  `agent_bill` FLOAT NOT NULL DEFAULT  '0';
                    ALTER TABLE  `pkg_cdr_summary_day_agent` ADD  `agent_lucro` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $version = '7.0.2';
            $this->update($version);
        }

        //2019-11-23
        if ($version == '7.0.2') {

            $sql = "UPDATE pkg_plan SET `lcrtype` = '0' WHERE lcrtype != 2;
                    UPDATE pkg_plan SET `lcrtype` = '1' WHERE lcrtype = 2;";
            $this->executeDB($sql);

            $version = '7.0.3';
            $this->update($version);
        }

        //2019-12-04
        if ($version == '7.0.3') {
            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Group to Admins'')', 'groupusergroup', 'x-fa fa-desktop', 12,11)";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
            }
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '0', '0');";
            $this->executeDB($sql);

            $version = '7.0.4';
            $this->update($version);
        }

        if ($version == '7.0.4') {
            $sql = "ALTER TABLE `pkg_group_user` ADD `user_prefix` INT(11) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.0.5';
            $this->update($version);
        }
        //2020-01-17
        if ($version == '7.0.5') {
            $sql = "ALTER TABLE `pkg_sip` ADD `addparameter` VARCHAR(50) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.0.6';
            $this->update($version);
        }

        //2020-01-20
        if ($version == '7.0.6') {

            $sql = "ALTER TABLE `pkg_restrict_phone` ADD `direction` INT(11) NOT NULL DEFAULT '1' ;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_day_user` ADD  `nbcall_fail` INT( 11 ) NOT NULL DEFAULT  '0' AFTER  `nbcall` ;
                    ALTER TABLE  `pkg_cdr_summary_day_user` ADD  `asr` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_day_trunk` ADD  `nbcall_fail` INT( 11 ) NOT NULL DEFAULT  '0' AFTER  `nbcall` ;
                    ALTER TABLE  `pkg_cdr_summary_day_trunk` ADD  `asr` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_day_agent` ADD  `nbcall_fail` INT( 11 ) NOT NULL DEFAULT  '0' AFTER  `nbcall` ;
                    ALTER TABLE  `pkg_cdr_summary_day_agent` ADD  `asr` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_month` ADD  `nbcall_fail` INT( 11 ) NOT NULL DEFAULT  '0' AFTER  `nbcall` ;
                    ALTER TABLE  `pkg_cdr_summary_month` ADD  `asr` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_month_user` ADD  `nbcall_fail` INT( 11 ) NOT NULL DEFAULT  '0' AFTER  `nbcall` ;
                    ALTER TABLE  `pkg_cdr_summary_month_user` ADD  `asr` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_month_trunk` ADD  `nbcall_fail` INT( 11 ) NOT NULL DEFAULT  '0' AFTER  `nbcall` ;
                    ALTER TABLE  `pkg_cdr_summary_month_trunk` ADD  `asr` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr` ADD INDEX `id_user` (`id_user`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr` ADD INDEX `id_trunk` (`id_trunk`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr` ADD INDEX `id_prefix` (`id_prefix`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr` ADD INDEX `starttime` (`starttime`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr` ADD INDEX `calledstation` (`calledstation`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr` ADD INDEX `src` (`src`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr` ADD INDEX `callerid` (`callerid`);";
            $this->executeDB($sql);

            $version = '7.0.7';
            $this->update($version);
        }

        //2020-01-23
        if ($version == '7.0.7') {
            $sql = "ALTER TABLE `pkg_cdr` CHANGE `id_offer` `id_server` INT(11) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $sql = "RENAME TABLE pkg_cdr_failed to pkg_cdr_failed_old;";
            $this->executeDB($sql);

            $sql = "CREATE TABLE `pkg_cdr_failed` LIKE pkg_cdr_failed_old;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr_failed` ADD INDEX `id_trunk` (`id_trunk`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr_failed` ADD INDEX `id_user` (`id_user`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr_failed` ADD INDEX `calledstation` (`calledstation`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr_failed` ADD INDEX `starttime` (`starttime`);";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_cdr_failed` ADD `id_server` INT(11) NULL DEFAULT NULL AFTER `id_prefix`;";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_cdr_failed (SELECT NULL, id_user, id_plan, id_trunk, id_prefix, NULL, sessionid, uniqueid, starttime, calledstation, sipiax, src, callerid, terminatecauseid, hangupcause FROM pkg_cdr_failed_old);";
            $this->executeDB($sql);

            $version = '7.0.8';
            $this->update($version);

            $sql = "ALTER TABLE `pkg_cdr` DROP `stoptime`;";
            $this->executeDB($sql);
        }

        if ($version == '7.0.8') {
            $sql = "UPDATE pkg_configuration SET config_key = 'delay_notifications' WHERE config_key = 'Low balance notification frequency';";
            $this->executeDB($sql);

            $version = '7.0.9';
            $this->update($version);
        }

        if ($version == '7.0.9') {
            $sql = "ALTER TABLE `pkg_servers` ADD `public_ip` VARCHAR(80) NULL DEFAULT NULL AFTER `host`;";
            $this->executeDB($sql);

            $version = '7.1.0';
            $this->update($version);
        }

        if ($version == '7.1.0') {
            $sql = " ALTER TABLE `pkg_campaign` ADD `max_frequency` INT(11) NOT NULL DEFAULT '0' AFTER `frequency`;";
            $this->executeDB($sql);

            $version = '7.1.1';
            $this->update($version);
        }

        if ($version == '7.1.1') {
            $sql = " ALTER TABLE  `pkg_sip` CHANGE  `accountcode`  `accountcode` VARCHAR( 30 ) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.1.2';
            $this->update($version);
        }

        if ($version == '7.1.2') {
            $sql = " ALTER TABLE pkg_queue_agent_status ADD UNIQUE `unique_index`(`agentName`, `id_queue`);";
            $this->executeDB($sql);

            $version = '7.1.3';
            $this->update($version);
        }

        if ($version == '7.1.3') {

            $sql = "INSERT INTO pkg_configuration VALUES
            (NULL, 'DIDWW APY KEY', 'didww_api_key', '', 'DIDWW APY KEY', 'global', '1'),
            (NULL, 'DIDWW APY URL', 'didww_url', 'https://api.didww.com/v3/', 'DIDWW APY URL', 'global', '1'),
            (NULL, 'DIDWW PROFIT', 'didww_profit', '0', 'DIDWW profit percentage. Integer value', 'global', '1');
            ";
            $this->executeDB($sql);

            $version = '7.1.4';
            $this->update($version);

            exec("echo '\n* * * * * php /var/www/html/mbilling/cron.php didwww' >> $CRONPATH");
        }

        if ($version == '7.1.4') {

            $sql = "ALTER TABLE `pkg_trunk` CHANGE `secret` `secret` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
            ALTER TABLE `pkg_smtp` CHANGE `password` `password` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
            ";
            $this->executeDB($sql);

            $version = '7.1.5';
            $this->update($version);
        }

        if ($version == '7.1.5') {

            $sql = "ALTER TABLE `pkg_sip` ADD `amd` INT(11) NOT NULL DEFAULT '0'";
            $this->executeDB($sql);

            $version = '7.1.6';
            $this->update($version);
        }

        if ($version == '7.1.6') {

            $sql = "ALTER TABLE `pkg_sip` ADD `voicemail_email` VARCHAR(100) NULL DEFAULT NULL AFTER `voicemail`, ADD `voicemail_password` INT(11) NULL DEFAULT NULL AFTER `voicemail_email`;";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_sip INNER JOIN pkg_user ON pkg_sip.id_user = pkg_user.id SET pkg_sip.voicemail_email = pkg_user.email, pkg_sip.voicemail_password = pkg_user.callingcard_pin;";
            $this->executeDB($sql);

            $sql = "DROP TABLE IF EXISTS `pkg_voicemail_users`; DROP VIEW IF EXISTS `pkg_voicemail_users`;";
            $this->executeDB($sql);

            $sql = " CREATE VIEW `pkg_voicemail_users` AS SELECT `pkg_sip`.`id` AS `id`,`pkg_sip`.`id_user` AS `customer_id`,'billing' AS `context`,`pkg_sip`.`name` AS `mailbox`,`pkg_sip`.`voicemail_password` AS `password`,`pkg_user`.`firstname` AS `fullname`,`pkg_sip`.`voicemail_email` AS `email`,`pkg_sip`.`md5secret` AS `pager`,`pkg_user`.`creationdate` AS `stamp`,'' AS `uniqueid` FROM `pkg_sip` JOIN `pkg_user` on `pkg_sip`.`id_user` = `pkg_user`.`id` ;
            ";
            $this->executeDB($sql);

            $version = '7.1.7';
            $this->update($version);
        }

        if ($version == '7.1.7') {

            $sql = "UPDATE pkg_configuration SET config_title = 'DIDWW APY URL' WHERE config_key = 'didww_url';
                UPDATE pkg_configuration SET config_title = 'DIDWW PROFIT' WHERE config_key = 'didww_profit';";

            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''DIDWW'')', 'didww', 'x-fa fa-desktop', 5,10);
                INSERT INTO pkg_module VALUES (NULL, 't(''Extra2'')', 'extra2', 'x-fa fa-desktop', 12,10);
                INSERT INTO pkg_module VALUES (NULL, 't(''Extra3'')', 'extra3', 'x-fa fa-desktop', 12,11);
            ";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'URL to extra module2', 'module_extra2', '', 'Url to extra module, default: index.php/extra2/read', 'global', '1');
                INSERT INTO pkg_configuration VALUES (NULL, 'URL to extra module3', 'module_extra3', '', 'Url to extra module, default: index.php/extra3/read', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.1.8';
            $this->update($version);
        }

        if ($version == '7.1.8') {

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'DIDWW CURRENCY CONVERTER', 'didww_curreny_converter', '0', 'DIDWW CURRENCY CONVERTER. Ex. 1 USD in your local currency is 3.25, so add here 3.25', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.1.9';
            $this->update($version);
        }

        if ($version == '7.1.9') {

            $sql = "ALTER TABLE `pkg_campaign` CHANGE `forward_number` `forward_number` VARCHAR(160) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL;
                ";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_campaign_poll` CHANGE `option0` `option0` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option1` `option1` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option2` `option2` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option3` `option3` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option4` `option4` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option5` `option5` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option6` `option6` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option7` `option7` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option8` `option8` VARCHAR(150) NOT NULL;
                    ALTER TABLE `pkg_campaign_poll` CHANGE `option9` `option9` VARCHAR(150) NOT NULL;
                ";
            $this->executeDB($sql);

            $version = '7.2.0';
            $this->update($version);
        }

        if ($version == '7.2.0') {

            $sql = "ALTER TABLE `pkg_user` ADD `neighborhood` VARCHAR(50) NULL DEFAULT NULL AFTER `city`;";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Fixed CallerId to use on Signup', 'fixed_callerid_signup', '', 'Fixed CallerId to use on Signup, Leave blank to use the user phone', 'global', '1');";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Apply the local prefix rule on DID and Sip Call', 'apply_local_prefix_did_sip', '0', 'Apply the local prefix rule on DID and Sip Call', 'global', '0'); ";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Default Codecs', 'default_codeds', 'g729,gsm,opus,alaw,ulaw', 'Default Codecs', 'global', '1'); ";
            $this->executeDB($sql);

            $version = '7.2.1';
            $this->update($version);
        }

        if ($version == '7.2.1') {

            $sql = "ALTER TABLE `pkg_campaign` ADD `from` VARCHAR(20) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.2.2';
            $this->update($version);
        }

        if ($version == '7.2.2') {

            $sql = "UPDATE `pkg_method_pay` SET `showFields` = 'payment_method,show_name,id_user,country,active,min,max,username,pagseguro_TOKEN,P2P_RecipientKeyID' WHERE payment_method = 'molpay';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_method_pay` CHANGE `P2P_RecipientKeyID` `P2P_RecipientKeyID` VARCHAR(100) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.2.3';
            $this->update($version);
        }

        if ($version == '7.2.3') {

            $sql = "ALTER TABLE `pkg_sms` ADD `from` varchar(16) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.2.4';
            $this->update($version);
        }
        //2020-06-08
        if ($version == '7.2.4') {

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Signup: Allow multiples users with same DOC', 'signup_unique_doc', '1', 'Signup: Allow multiples users with same DOC', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.2.5';
            $this->update($version);
        }

        //2020-06-15
        if ($version == '7.2.5') {

            $sql = "CREATE TABLE IF NOT EXISTS `pkg_trunk_group` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `name` varchar(100) NOT NULL,
                `type`  INT(11) NOT NULL DEFAULT '1',
                `description` text,
                PRIMARY KEY (`id`),
                UNIQUE KEY `name` (`name`)
                ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
            Yii::app()->db->createCommand($sql)->execute();

            $sql = "CREATE TABLE IF NOT EXISTS `pkg_trunk_group_trunk` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `id_trunk_group` int(11) NOT NULL,
                `id_trunk` int(11) NOT NULL,
                PRIMARY KEY (`id`),
                KEY `id_trunk_group` (`id_trunk_group`),
                KEY `id_trunk` (`id_trunk`),

                CONSTRAINT `fk_pkg_trunk_group_trunk_pkg_trunk_group` FOREIGN KEY (`id_trunk_group`) REFERENCES `pkg_trunk_group` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_pkg_trunk_group_trunk_pkg_trunk` FOREIGN KEY (`id_trunk`) REFERENCES `pkg_trunk` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
            Yii::app()->db->createCommand($sql)->execute();

            $sql = "ALTER TABLE pkg_rate DROP foreign key fk_pkg_trunk_pkg_rate;
            ALTER TABLE `pkg_rate` CHANGE `id_trunk` `id_trunk_group` INT(11) NOT NULL;";
            Yii::app()->db->createCommand($sql)->execute();

            $sql        = "SELECT id, id_trunk_group FROM pkg_rate GROUP BY id_trunk_group";
            $resultRate = Yii::app()->db->createCommand($sql)->queryAll();

            foreach ($resultRate as $key => $rate) {

                $sql        = "SELECT * FROM pkg_trunk WHERE id = " . $rate['id_trunk_group'];
                $modelTrunk = Yii::app()->db->createCommand($sql)->queryAll();

                $sql = "INSERT INTO pkg_trunk_group (name) VALUES ('Group - " . $modelTrunk[0]['trunkcode'] . "')";
                try {
                    Yii::app()->db->createCommand($sql)->execute();
                    $id_trunk_group = Yii::app()->db->lastInsertID;
                } catch (Exception $e) {
                    $sql            = "SELECT id FROM pkg_trunk_group WHERE name = 'Group - " . $modelTrunk[0]['trunkcode'] . "'";
                    $result         = Yii::app()->db->createCommand($sql)->queryAll();
                    $id_trunk_group = $result[0]['id'];
                }

                $sql = "UPDATE pkg_rate SET id_trunk_group = $id_trunk_group WHERE id_trunk_group = " . $rate['id_trunk_group'];
                Yii::app()->db->createCommand($sql)->execute();

                for ($i = 0; $i < 5; $i++) {

                    $sql = "INSERT INTO pkg_trunk_group_trunk (id_trunk_group, id_trunk) VALUES ( $id_trunk_group, " . $modelTrunk[0]['id'] . " )";
                    Yii::app()->db->createCommand($sql)->execute();

                    if (! is_numeric($modelTrunk[0]['failover_trunk'])) {
                        break;
                    }
                    $sql        = "SELECT * FROM pkg_trunk WHERE id = " . $modelTrunk[0]['failover_trunk'];
                    $modelTrunk = Yii::app()->db->createCommand($sql)->queryAll();
                }
            }

            $sql = "
            ALTER TABLE `pkg_rate` ADD  CONSTRAINT `fk_pkg_trunk_group_pkg_rate` FOREIGN KEY (`id_trunk_group`) REFERENCES `pkg_trunk_group` (`id`)";
            Yii::app()->db->createCommand($sql)->execute();

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Trunk Groups'')', 'trunkgroup', 'x-fa fa-desktop', 10,4)";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            $sql = "
            UPDATE pkg_module SET priority = 1 WHERE module = 'provider';
            UPDATE pkg_module SET priority = 2 WHERE module = 'trunk';
            UPDATE pkg_module SET priority = 3 WHERE module = 'trunkgroup';
            UPDATE pkg_module SET priority = 4 WHERE module = 'rateprovider';
            UPDATE pkg_module SET priority = 5 WHERE module = 'servers';
            ";
            $this->executeDB($sql);

            $version = '7.3.0';
            $this->update($version);
        }

        //2020-06-15
        if ($version == '7.3.0') {
            $sql = " ALTER TABLE `pkg_rate_provider` ADD INDEX(`id_prefix`);";
            $this->executeDB($sql);

            $version = '7.3.1';
            $this->update($version);
        }

        //2020-07-11
        if ($version == '7.3.1') {
            $sql = " INSERT INTO `pkg_configuration` (`id`, `config_title`, `config_key`, `config_value`, `config_description`, `config_group_title`, `status`) VALUES (NULL, 'Show the Campaign DashBoard to User', 'showMCDashBoard', '0', 'Show the Campaign DashBoard to User', 'global', '1');";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_sms` CHANGE `from` `sms_from` VARCHAR(16) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.3.2';
            $this->update($version);
        }

        //2020-07-20
        if ($version == '7.3.2') {
            $sql = " INSERT INTO `pkg_configuration` (`id`, `config_title`, `config_key`, `config_value`, `config_description`, `config_group_title`, `status`) VALUES
                (NULL, 'Incoming DID first Digit Removal', 'did_ignore_zero_on_did', '1', '0=Disable \n1=Enable Remove First Digit of Incoming DID', 'global', '1'),
                (NULL, 'Enable IAX internal calls', 'use_sip_to_iax', '0', 'Enable IAX internal calls', 'global', '1');";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_did_destination` ADD `context` TEXT NULL DEFAULT NULL AFTER `destination`;";
            $this->executeDB($sql);

            echo ("touch /etc/asterisk/extensions_magnus_did.conf");
            exec("echo '#include extensions_magnus_did.conf' >> /etc/asterisk/extensions.conf");

            $version = '7.3.3';
            $this->update($version);
        }

        //2020-07-27
        if ($version == '7.3.3') {

            $sql = "ALTER TABLE `pkg_did_destination` ADD `context` TEXT NULL DEFAULT NULL AFTER `destination`;";
            $this->executeDB($sql);

            $version = '7.3.4';
            $this->update($version);
        }

        //2020-07-11
        if ($version == '7.3.4') {
            $sql = "UPDATE `pkg_configuration` SET config_title = 'Show Broadcasting DashBoard on User home panel' WHERE config_key =  'showMCDashBoard'";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''DashBoard'')', 'campaigndashboard', 'x-fa fa-desktop', 13,11)";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            $version = '7.3.5';
            $this->update($version);
        }

        //2020-07-28
        if ($version == '7.3.5') {

            $version = '7.3.6';
            $this->update($version);
        }

        //2020-07-28
        if ($version == '7.3.6') {

            $sql = "UPDATE `pkg_group_module` SET show_menu = 0 WHERE id_group = 1 AND id_module = (SELECT id FROM `pkg_module` WHERE `module` LIKE 'dashboard' LIMIT 1)";
            $this->executeDB($sql);

            $sql    = "SELECT * FROM pkg_module WHERE module = 'backup'";
            $result = Yii::app()->db->createCommand($sql)->queryAll();
            if (! isset($result[0])) {

                $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Backup'')', 'backup', 'x-fa fa-desktop', 12,15)";
                $this->executeDB($sql);

                $idServiceModule = Yii::app()->db->lastInsertID;

                $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
                $this->executeDB($sql);
            }

            $sql = " CREATE TABLE IF NOT EXISTS `pkg_campaign_report` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `id_campaign` int(11) NOT NULL,
                `id_phonenumber` int(11) NOT NULL,
                `id_user` int(11) NOT NULL,
                `id_trunk` int(11) NOT NULL,
                `unix_timestamp` int(11) NOT NULL,
                `status` tinyint(1) NOT NULL DEFAULT '2',
                PRIMARY KEY (`id`),
                KEY `unix_timestamp` (`unix_timestamp`),
                KEY `fk_pkg_campaign_report_pkg_campaign` (`id_campaign`),
                KEY `fk_pkg_campaign_report_pkg_phonenumber` (`id_phonenumber`),
                KEY `fk_pkg_campaign_report_pkg_user` (`id_user`),
                CONSTRAINT `fk_pkg_campaign_report_pkg_campaign` FOREIGN KEY (`id_campaign`) REFERENCES `pkg_campaign` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_pkg_campaign_report_pkg_phonenumber` FOREIGN KEY (`id_phonenumber`) REFERENCES `pkg_phonenumber` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_pkg_campaign_report_pkg_user` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_pkg_campaign_report_pkg_trunk` FOREIGN KEY (`id_trunk`) REFERENCES `pkg_trunk` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            $this->executeDB($sql);

            $sql    = "SELECT * FROM pkg_module WHERE module = 'campaignreport'";
            $result = Yii::app()->db->createCommand($sql)->queryAll();
            if (! isset($result[0])) {
                $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Campaign Report'')', 'campaignreport', 'x-fa fa-desktop', 13,12)";
                $this->executeDB($sql);
                $idServiceModule = Yii::app()->db->lastInsertID;

                $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
                $this->executeDB($sql);
            }

            $version = '7.3.7';
            $this->update($version);
        }

        //2020-07-28
        if ($version == '7.3.7') {

            $sql = "
                UPDATE `pkg_module` SET text = 't(''Clients'')' WHERE id = 1;
                UPDATE `pkg_module` SET text = 't(''DIDs'')' WHERE id = 5;
                UPDATE `pkg_module` SET text = 't(''Billing'')' WHERE id = 7;
                UPDATE `pkg_module` SET text = 't(''Rates'')' WHERE id = 8;
                UPDATE `pkg_module` SET text = 't(''Reports'')' WHERE id = 9;
                UPDATE `pkg_module` SET text = 't(''Routes'')' WHERE id = 10;
                UPDATE `pkg_module` SET text = 't(''Settings'')' WHERE id = 12;
                UPDATE `pkg_module` SET text = 't(''Voice Broadcasting'')' WHERE id = 13;
                UPDATE `pkg_module` SET text = 't(''CallShop'')' WHERE id = 14;
            ";
            $this->executeDB($sql);

            $sql = "
                UPDATE `pkg_module` SET text = 't(''Users'')' WHERE module = 'user';
                UPDATE `pkg_module` SET text = 't(''SIP Users'')' WHERE module = 'sip';
                UPDATE `pkg_module` SET text = 't(''Calls Online'')' WHERE module = 'callonline';
                UPDATE `pkg_module` SET text = 't(''CallerID'')' WHERE module = 'callerid';
                UPDATE `pkg_module` SET text = 't(''ATA Linksys'')' WHERE module = 'sipuras';
                UPDATE `pkg_module` SET text = 't(''Restricted Number'')' WHERE module = 'restrictedphonenumber';
                UPDATE `pkg_module` SET text = 't(''Callback'')' WHERE module = 'callback';
                UPDATE `pkg_module` SET text = 't(''Buy Credit'')' WHERE module = 'buycredit';
                UPDATE `pkg_module` SET text = 't(''Refill Providers'')' WHERE module = 'refillprovider';



                UPDATE `pkg_module` SET text = 't(''Refills'')' WHERE module = 'refill';
                UPDATE `pkg_module` SET text = 't(''Payment Methods'')' WHERE module = 'methodpay';
                UPDATE `pkg_module` SET text = 't(''Voucher'')' WHERE module = 'voucher';
                UPDATE `pkg_module` SET text = 't(''Boleto'')' WHERE module = 'boleto';


                UPDATE `pkg_module` SET text = 't(''DIDs'')' WHERE module = 'did';
                UPDATE `pkg_module` SET text = 't(''DID Destination'')' WHERE module = 'diddestination';
                UPDATE `pkg_module` SET text = 't(''DIDs Use'')' WHERE module = 'diduse';
                UPDATE `pkg_module` SET text = 't(''IVRs'')' WHERE module = 'ivr';
                UPDATE `pkg_module` SET text = 't(''Queues'')' WHERE module = 'queue';
                UPDATE `pkg_module` SET text = 't(''Queues Members'')' WHERE module = 'queuemember';
                UPDATE `pkg_module` SET text = 't(''DIDww'')' WHERE module = 'didww';


                UPDATE `pkg_module` SET text = 't(''Plans'')' WHERE module = 'plan';
                UPDATE `pkg_module` SET text = 't(''Tariffs'')' WHERE module = 'rate';
                UPDATE `pkg_module` SET text = 't(''Prefixes'')' WHERE module = 'prefix';
                UPDATE `pkg_module` SET text = 't(''User Custom Rates'')' WHERE module = 'userrate';
                UPDATE `pkg_module` SET text = 't(''Offers'')' WHERE module = 'offer';
                UPDATE `pkg_module` SET text = 't(''Offer CDR'')' WHERE module = 'offercdr';
                UPDATE `pkg_module` SET text = 't(''Offer Use'')' WHERE module = 'offeruse';


                UPDATE `pkg_module` SET text = 't(''CDR'')' WHERE module = 'call';
                UPDATE `pkg_module` SET text = 't(''CDR Failed'')' WHERE module = 'callfailed';
                UPDATE `pkg_module` SET text = 't(''Summary per Day'')' WHERE module = 'callsummaryperday';


                UPDATE `pkg_module` SET text = 't(''Providers'')' WHERE module = 'provider';
                UPDATE `pkg_module` SET text = 't(''Trunks'')' WHERE module = 'trunk';

                UPDATE `pkg_module` SET text = 't(''Group Users'')' WHERE module = 'groupuser';
                UPDATE `pkg_module` SET text = 't(''Configuration'')' WHERE module = 'configuration';
                UPDATE `pkg_module` SET text = 't(''Emails Templates'')' WHERE module = 'templatemail';
                UPDATE `pkg_module` SET text = 't(''Log Users'')' WHERE module = 'logusers';
                UPDATE `pkg_module` SET text = 't(''SMTP'')' WHERE module = 'smtps';


                UPDATE `pkg_module` SET text = 't(''Campaigns'')' WHERE module = 'campaign';
                UPDATE `pkg_module` SET text = 't(''Phonebooks'')' WHERE module = 'phonebook';
                UPDATE `pkg_module` SET text = 't(''Phonenumbers'')' WHERE module = 'phonenumber';
                UPDATE `pkg_module` SET text = 't(''Polls'')' WHERE module = 'campaignpoll';
                UPDATE `pkg_module` SET text = 't(''Polls Reports'')' WHERE module = 'campaignpollinfo';
                UPDATE `pkg_module` SET text = 't(''Restrict Phone'')' WHERE module = 'campaignrestrictphone';
                UPDATE `pkg_module` SET text = 't(''SMS'')' WHERE module = 'sms';
                UPDATE `pkg_module` SET text = 't(''Campanha Rápida'')' WHERE module = 'Quick Campaign';
                UPDATE `pkg_module` SET text = 't(''Campaigns DashBoard'')' WHERE module = 'campaigndashboard';


                UPDATE `pkg_module` SET text = 't(''Booths'')' WHERE module = 'callshop';
                UPDATE `pkg_module` SET text = 't(''Booths Report'')' WHERE module = 'callshopcdr';
                UPDATE `pkg_module` SET text = 't(''Booths Tariffs'')' WHERE module = 'ratecallshop';
                UPDATE `pkg_module` SET text = 't(''Summary per Day'')' WHERE module = 'callsummarycallshop';

            ";
            $this->executeDB($sql);

            $version = '7.3.8';
            $this->update($version);
        }

        //2020-08-14
        if ($version == '7.3.8') {

            $sql = "ALTER TABLE `pkg_status_system` ADD `cps` INT(11) NOT NULL DEFAULT '0' ;";
            $this->executeDB($sql);

            $version = '7.3.9';
            $this->update($version);
        }

        //2020-08-17
        if ($version == '7.3.9') {

            $sql = "UPDATE `pkg_module` SET text = 't(''Restrict Phone'')' WHERE module = 'campaignrestrictphone';";
            $this->executeDB($sql);

            $version = '7.4.0';
            $this->update($version);
        }

        //2020-08-18
        if ($version == '7.4.0') {

            $sql = " UPDATE `pkg_did` SET expression_1 = '.*' WHERE expression_1 = '*';
            UPDATE `pkg_did` SET expression_2 = '.*' WHERE expression_2 = '*';
            UPDATE `pkg_did` SET expression_3 = '.*' WHERE expression_3 = '*';";
            $this->executeDB($sql);

            $version = '7.4.1';
            $this->update($version);
        }

        //2020-08-18
        if ($version == '7.4.1') {

            $sql = " UPDATE `pkg_module` SET text = 't(''Fail2ban'')' WHERE text = 't(''Firewall'')';";
            $this->executeDB($sql);

            $version = '7.4.2';
            $this->update($version);
        }
        //2020-08-19
        if ($version == '7.4.2') {

            $sql = "DELETE FROM `pkg_group_module` WHERE id_module = (SELECT id FROM pkg_module WHERE module = 'boleto');
            DELETE FROM  pkg_module WHERE module = 'boleto';";
            $this->executeDB($sql);

            $version = '7.4.3';
            $this->update($version);
        }
        //2020-08-19
        if ($version == '7.4.3') {

            $sql = "ALTER TABLE `pkg_callerid` ADD `name` VARCHAR(100) NOT NULL DEFAULT '' AFTER `cid`;";
            $this->executeDB($sql);

            $version = '7.4.4';
            $this->update($version);
        }
        //2020-08-25
        if ($version == '7.4.4') {

            $sql = "DELETE FROM `pkg_configuration` WHERE `config_key` LIKE 'record_call'";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_did` ADD `record_call` INT(11) NOT NULL DEFAULT '0';";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_did LEFT JOIN  pkg_user ON pkg_did.id_user = pkg_user.id  SET pkg_did.record_call = pkg_user.record_call;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_campaign` ADD `record_call` INT(11) NOT NULL DEFAULT '0';";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_campaign LEFT JOIN  pkg_user ON pkg_campaign.id_user = pkg_user.id  SET pkg_campaign.record_call = pkg_user.record_call;";
            $this->executeDB($sql);

            $version = '7.4.5';
            $this->update($version);
        }

        //2020-08-26
        if ($version == '7.4.5') {

            $sql = "ALTER TABLE `pkg_templatemail` ADD `status` INT(11) NOT NULL DEFAULT '1'; ";
            $this->executeDB($sql);

            $sql = 'UPDATE `pkg_templatemail` SET messagehtml = REPLACE(messagehtml, "$dias_vencimento$", "$days_to_pay$"") WHERE `mailtype` LIKE "plan_unpaid";';
            $this->executeDB($sql);

            $version = '7.4.6';
            $this->update($version);
        }

        //2020-08-26
        if ($version == '7.4.6') {

            $sql = "ALTER TABLE `pkg_queue_member` CHANGE `uniqueid` `id` INT(11) NOT NULL AUTO_INCREMENT;
            ALTER TABLE `pkg_queue_member` ADD `uniqueid` INT(11) NULL DEFAULT NULL AFTER `id`;
            UPDATE `pkg_queue_member` SET uniqueid=id;";
            $this->executeDB($sql);

            $version = '7.4.7';
            $this->update($version);
        }

        //2020-09-10
        if ($version == '7.4.7') {

            $sql = "
                CREATE TRIGGER update_user_credit_after_insert
                AFTER INSERT
                ON pkg_cdr FOR EACH ROW
                BEGIN
                    IF NEW.sessionbill > 0 THEN
                        IF NEW.agent_bill > 0 THEN
                            SET @IDAGENT = (SELECT id_user FROM pkg_user WHERE id = new.id_user LIMIT 1);
                            UPDATE pkg_user SET credit = credit - new.agent_bill WHERE pkg_user.id = new.id_user;
                            UPDATE pkg_user SET credit = credit - new.sessionbill WHERE pkg_user.id = @IDAGENT;
                        ELSE
                            UPDATE pkg_user SET credit = credit - new.sessionbill WHERE pkg_user.id = new.id_user;
                        END IF;
                    END IF;
                END
            ";
            $this->executeDB($sql);

            $version = '7.5.0';
            $this->update($version);
        }

        //2020-09-21
        if ($version == '7.5.0') {

            $sql = "
                CREATE TRIGGER update_sip_status_after_insert
                AFTER INSERT
                ON pkg_callshop FOR EACH ROW
                BEGIN
                    UPDATE pkg_sip SET status = 2 WHERE name = new.cabina;
                END
            ";
            $this->executeDB($sql);

            $version = '7.5.1';
            $this->update($version);
        }

        //2020-10-05
        if ($version == '7.5.1') {

            $sql = " ALTER TABLE `pkg_method_pay` CHANGE `pagseguro_TOKEN` `pagseguro_TOKEN` VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL; ";
            $this->executeDB($sql);

            $version = '7.5.2';
            $this->update($version);
        }

        //2020-10-08
        if ($version == '7.5.2') {

            $sql = "ALTER TABLE `pkg_callerid`
            ADD COLUMN `description` MEDIUMTEXT CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.5.3';
            $this->update($version);
        }

        //2020-10-08
        if ($version == '7.5.3') {

            $sql = "ALTER TABLE `pkg_user`
            ADD COLUMN `commercial_name` VARCHAR(100) NULL DEFAULT NULL AFTER `company_name`;";
            $this->executeDB($sql);

            $version = '7.5.4';
            $this->update($version);
        }

        //2020-12-01
        if ($version == '7.5.4') {

            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'Login header', 'login_header', 'Log in', 'Login header', 'global', '1');

                ";
            $this->executeDB($sql);

            $version = '7.5.5';
            $this->update($version);
        }

        //2020-12-22
        if ($version == '7.5.5') {

            $sql = "
            CREATE TABLE IF NOT EXISTS `pkg_holidays` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                  `name` varchar(50) NOT NULL,
                  `day` date NOT NULL,
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

                ";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Holidays'')', 'holidays', 'x-fa fa-desktop', 5,11)";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_ivr` ADD `use_holidays` TINYINT(1) NOT NULL DEFAULT '0' ;";
            $this->executeDB($sql);

            $version = '7.5.6';
            $this->update($version);
        }

        //2020-12-26
        if ($version == '7.5.6') {

            $sql = "UPDATE  pkg_configuration SET status = 1 WHERE config_key = 'apply_local_prefix_did_sip' ";
            $this->executeDB($sql);

            $version = '7.5.7';
            $this->update($version);
        }

        //2021-01-02
        if ($version == '7.5.7') {

            $sql = "ALTER TABLE `pkg_group_user` ADD `hidden_prices` TINYINT(1) NOT NULL DEFAULT '0'";
            $this->executeDB($sql);

            $version = '7.5.8';
            $this->update($version);
        }

        //2021-01-03
        if ($version == '7.5.8') {

            $sql = "
            CREATE TABLE IF NOT EXISTS `pkg_alarm` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `type` int(11) NOT NULL,
                `amount` int(11) NOT NULL,
                `condition` int(11) NOT NULL,
                `status` int(11) NOT NULL,
                `creationdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `period` int(11) DEFAULT NULL,
                `id_plan` int(11) DEFAULT NULL,
                `email` varchar(100) DEFAULT NULL,
                PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
                ";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Alarms'')', 'alarm', 'x-fa fa-desktop', 12,16)";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            exec("echo '\n*/5 * * * * php /var/www/html/mbilling/cron.php alarm' >> $CRONPATH");

            $version = '7.5.9';
            $this->update($version);
        }

        //2021-01-03
        if ($version == '7.5.9') {

            $sql = "
            CREATE TABLE IF NOT EXISTS `pkg_cdr_summary_month_did` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `month` varchar(20) NOT NULL,
                `id_did` int(11) NOT NULL,
                `sessiontime` int(11) NOT NULL,
                `aloc_all_calls` int(11) NOT NULL,
                `nbcall` int(11) NOT NULL,
                `sessionbill` float NOT NULL DEFAULT '0',
                PRIMARY KEY (`id`),
                KEY month (`month`),
                FOREIGN KEY (`id_did`) REFERENCES `pkg_did` (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
                ";
            $this->executeDB($sql);

            $sql    = "SELECT priority + 1 AS priority FROM `pkg_module` WHERE `id_module` = 9 ORDER BY `priority` DESC LIMIT 1";
            $result = Yii::app()->db->createCommand($sql)->queryAll();

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Summary Month DID'')', 'callsummarymonthdid', 'x-fa fa-desktop', 9," . $result[0]['priority'] . ")";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            $version = '7.6.0';
            $this->update($version);
        }
        //2021-01-21
        if ($version == '7.6.0') {

            $sql = "ALTER TABLE `pkg_campaign_poll`
        CHANGE `option0` `option0` VARCHAR(300) NOT NULL,
        CHANGE `option1` `option1` VARCHAR(300) NOT NULL,
        CHANGE `option2` `option2` VARCHAR(300) NOT NULL,
        CHANGE `option3` `option3` VARCHAR(300) NOT NULL,
        CHANGE `option4` `option4` VARCHAR(300) NOT NULL,
        CHANGE `option5` `option5` VARCHAR(300) NOT NULL,
        CHANGE `option6` `option6` VARCHAR(300) NOT NULL,
        CHANGE `option7` `option7` VARCHAR(300) NOT NULL,
        CHANGE `option8` `option8` VARCHAR(300) NOT NULL,
        CHANGE `option9` `option9` VARCHAR(300) NOT NULL;";
            $this->executeDB($sql);

            $version = '7.6.1';
            $this->update($version);
        }

        //2021-01-21
        if ($version == '7.6.1') {

            $sql = "ALTER TABLE `pkg_phonenumber` ADD `doc` VARCHAR(200) NULL DEFAULT NULL AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.6.2';
            $this->update($version);
        }

        //2021-01-21
        if ($version == '7.6.2') {

            $sql = "ALTER TABLE `pkg_phonenumber` ADD `email` VARCHAR(200) NULL DEFAULT NULL AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.6.3';
            $this->update($version);
        }

        //2021-03-05
        if ($version == '7.6.3') {

            $sql = " INSERT INTO `pkg_configuration`  VALUES
                (NULL, 'Record all calls', 'global_record_calls', '0', '0=Disable \n1=Enable\n Record all calls, the fields record calls will be hidden if this option is activated.', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.6.4';
            $this->update($version);
        }

        //2021-03-18
        if ($version == '7.6.4') {

            $sql = "
            CREATE TABLE IF NOT EXISTS `pkg_trunk_error` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `ip` varchar(100) NOT NULL,
                `code` int(5) NOT NULL,
                `total` int(11) NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_index` (`ip`,`code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
                ";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Trunk Errors'')', 'trunksipcodes', 'x-fa fa-desktop', 10,7)";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            exec("echo '\n* * * * * php /var/www/html/mbilling/cron.php TrunkSIPCodes' >> $CRONPATH");

            $version = '7.6.5';
            $this->update($version);
        }

        //2021-03-18
        if ($version == '7.6.5' || $version == '7.6.7') {

            AsteriskAccess::instance()->generateSipPeers();

            $select = 'trunkcode, user, secret, disallow, allow, directmedia, context, dtmfmode, insecure, nat, qualify, type, host, fromdomain,fromuser, register_string,port,transport,encryption,sendrpid,maxuse';
            $model  = Trunk::model()->findAll(
                [
                    'select'    => $select,
                    'condition' => 'providertech = :key AND status = 1',
                    'params'    => [':key' => 'sip'],
                ]
            );

            if (isset($model[0])) {
                AsteriskAccess::instance()->writeAsteriskFile($model, '/etc/asterisk/sip_magnus.conf', 'trunkcode');
            }

            $version = '7.6.8';
            $this->update($version);
        }

        //2021-06-08
        if ($version == '7.6.8') {
            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Default prefix rule', 'default_prefix_rule', '', 'This rule will be used when you create a new user or on the Sign up  form. More details about prefix rule on the bellow link https://www.magnusbilling.org/local_prefix', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.6.9';
            $this->update($version);
        }

        //2021-06-18
        if ($version == '7.6.9') {
            $sql = "ALTER TABLE `pkg_offer` ADD `initblock` INT(11) NOT NULL DEFAULT '60' , ADD `billingblock` INT(11) NOT NULL DEFAULT '60' ;";
            $this->executeDB($sql);

            $version = '7.7.0';
            $this->update($version);
        }

        //2021-06-23
        if ($version == '7.7.0') {
            $sql = "ALTER TABLE `pkg_offer` ADD `minimal_time_charge` INT(2) NOT NULL DEFAULT '0';";
            $this->executeDB($sql);

            $version = '7.7.1';
            $this->update($version);
        }

        //2021-07-28
        if ($version == '7.7.1') {
            $sql = "ALTER TABLE `pkg_user` ADD `dist` VARCHAR(100) NULL DEFAULT NULL AFTER `state_number`, ADD `contract_value` DOUBLE NOT NULL DEFAULT '0' AFTER `dist`;;";
            $this->executeDB($sql);

            $version = '7.7.2';
            $this->update($version);
        }

        //2021-07-28
        if ($version == '7.7.2') {
            $sql = "ALTER TABLE `pkg_user` CHANGE `contract_value` `contract_value` INT(11) NULL DEFAULT '0';";
            $this->executeDB($sql);

            $version = '7.7.3';
            $this->update($version);
        }

        //2021-07-28
        if ($version == '7.7.3') {
            $sql = "ALTER TABLE `pkg_campaign` ADD `callerid` VARCHAR(100) NULL DEFAULT '' AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.7.4';
            $this->update($version);
        }

        //2021-08-27
        if ($version == '7.7.4') {
            $sql = "ALTER TABLE `pkg_refill` ADD `image` VARCHAR(100) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.7.5';
            $this->update($version);
        }

        //2021-08-27
        if ($version == '7.7.5') {
            $sql = " INSERT INTO `pkg_configuration` (`id`, `config_title`, `config_key`, `config_value`, `config_description`, `config_group_title`, `status`) VALUES (NULL, 'Delete CDR archived prior X month', 'delete_cdr_archived_prior_x_month', '0', 'Delete CDR archived prior X monthr', 'global', '1'),(NULL, 'Delete CDR failed archived prior X month', 'delete_cdr_failed_archived_prior_x_month', '0', 'Delete CDR failed archived prior X month', 'global', '1');";
            $this->executeDB($sql);
            $version = '7.7.6';
            $this->update($version);
        }

        //2021-10-22
        if ($version == '7.7.6') {
            $sql = "INSERT INTO `pkg_templatemail` VALUES (NULL, '1', 'credit', 'noreply@site.com', 'VoIP', 'Crédito atual da sua cuenta VoIP ( \$credit\$ \$currency\$)', '<p>Olá \$firstname\$ \$lastname\$, </p> <br> <p>Seu saldo atual é de R$ \$credit\$.</p> <br> <p>Observação: Você pode desativar o recebimento deste email no seu painel de cliente.</p> <br> <p>Atenciosamente,<br>', 'br', '1');";
            $this->executeDB($sql);

            $sql = "INSERT INTO `pkg_templatemail`  VALUES (NULL, '1', 'credit', 'noreply@site.com', 'VoIP', 'Credito actual de su cuenta VoIP ( \$credit\$ \$currency\$)', '<p>Hola \$firstname\$ \$lastname\$, </p> <br> <p>Su credito actual es de \$credit\$.</p> <br> <p>OBS: Puedes desactivar el envio de este email en su panel de cliente.</p> <br> <p>Saludos,<br>', 'es', '1');";
            $this->executeDB($sql);

            $sql = "INSERT INTO `pkg_templatemail`  VALUES (NULL, '1', 'credit', 'noreply@site.com', 'VoIP', 'You actual credit is ( \$credit\$ \$currency\$)', '<p>Hello \$firstname\$ \$lastname\$, </p> <br> <p>Your credit is \$credit\$.</p> <br> <p>OBS: You can disable this email on your VoIP panel.</p> <br> <p>Atenciosamente,<br>', 'en', '1');";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_user` ADD `credit_notification_daily` INT(1) NOT NULL DEFAULT '0' AFTER `credit_notification`;";
            $this->executeDB($sql);

            exec("echo '\n59 23 * * * php /var/www/html/mbilling/cron.php NotifyClientDaily' >> $CRONPATH");

            $version = '7.7.7';
            $this->update($version);
        }

        //2021-10-24
        if ($version == '7.7.7') {
            $sql = " INSERT INTO `pkg_configuration` VALUES (NULL, 'Charge the DID if client have enough credit before the due date', 'charge_did_before_due_date', '1', 'Charge the DID if client have enough credit before the due date', 'global', '1');";
            $this->executeDB($sql);
            $version = '7.7.8';
            $this->update($version);
        }

        //2021-10-26
        if ($version == '7.7.8') {
            $sql = "UPDATE pkg_configuration SET config_description = 'Charge the DID/Services if client have enough credit before the due date'  WHERE config_key = 'charge_did_before_due_date'";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_configuration SET config_title = 'Charge the DID/Services if client have enough credit before the due date'  WHERE config_key = 'charge_did_before_due_date'";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_configuration SET config_key = 'charge_did_services_before_due_date'  WHERE config_key = 'charge_did_before_due_date'";
            $this->executeDB($sql);
            $version = '7.7.9';
            $this->update($version);
        }

        //2021-12-06
        if ($version == '7.7.9') {
            $sql = "ALTER TABLE `pkg_sip` ADD `sip_config` TEXT NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $sql = "
            ALTER TABLE `pkg_did` ADD `buy_rate_1` decimal(15,5)   NOT NULL DEFAULT '0.00000' AFTER `selling_rate_1`;
            ALTER TABLE `pkg_did` ADD `buy_rate_2` decimal(15,5)   NOT NULL DEFAULT '0.00000' AFTER `selling_rate_2`;
            ALTER TABLE `pkg_did` ADD `buy_rate_3` decimal(15,5)   NOT NULL DEFAULT '0.00000' AFTER `selling_rate_3`;



            ALTER TABLE `pkg_did` ADD `buyrateinitblock` int(11)   NOT NULL DEFAULT '1' AFTER `initblock`;
            ALTER TABLE `pkg_did` ADD `buyrateincrement` int(11)   NOT NULL DEFAULT '1' AFTER `increment`;
            ALTER TABLE `pkg_did` ADD `minimal_time_buy` int(11)   NOT NULL DEFAULT '1' AFTER `minimal_time_charge`;

            ";
            $this->executeDB($sql);

            $version = '7.8.0.0';
            $this->update($version);
        }
        //2021-12-00
        if ($version == '7.8.0.0') {
            $sql = "ALTER TABLE `pkg_sip` ADD `sip_config` TEXT NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.0.1';
            $this->update($version);
        }
        //2022-01-19
        if ($version == '7.8.0.1') {
            $sql = "ALTER TABLE `pkg_sip` ADD `description` VARCHAR(150) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.0.2';
            $this->update($version);
        }

        //2022-01-19
        if ($version == '7.8.0.2') {
            $sql = "ALTER TABLE `pkg_user` ADD `restriction_use` int(11)  NOT NULL DEFAULT '1'";
            $this->executeDB($sql);

            $version = '7.8.0.3';
            $this->update($version);
        }

        //2022-02-14
        if ($version == '7.8.0.3') {
            $sql = "ALTER TABLE `pkg_sms` CHANGE `result` `status` INT(11) NOT NULL DEFAULT '0';
            ALTER TABLE `pkg_sms` ADD `result` VARCHAR(500) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.0.4';
            $this->update($version);
        }

        //2022-02-14
        if ($version == '7.8.0.4') {
            $sql = "ALTER TABLE `pkg_user` CHANGE `description` `description` VARCHAR(500) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.0.5';
            $this->update($version);
        }

        //2022-02-17
        if ($version == '7.8.0.5') {
            $sql = "ALTER TABLE `pkg_sip` ADD `id_trunk_group` INT(11) NULL DEFAULT NULL ;";
            Yii::app()->db->createCommand($sql)->execute();

            $version = '7.8.0.6';
            $this->update($version);
        }

        //2022-02-18
        if ($version == '7.8.0.6') {

            $sql = "ALTER TABLE `pkg_group_user` ADD `hidden_batch_update` TINYINT(1) NOT NULL DEFAULT '0'";
            $this->executeDB($sql);

            $version = '7.8.0.7';
            $this->update($version);
        }

        //2022-04-15
        if ($version == '7.8.0.7') {
            $sql = "ALTER TABLE `pkg_sip` ADD `sip_config` TEXT NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $sql = "
            ALTER TABLE `pkg_did` ADD `agent_client_rate_1` decimal(15,5)   NOT NULL DEFAULT '0.00000' AFTER `selling_rate_1`;
            ALTER TABLE `pkg_did` ADD `agent_client_rate_2` decimal(15,5)   NOT NULL DEFAULT '0.00000' AFTER `selling_rate_2`;
            ALTER TABLE `pkg_did` ADD `agent_client_rate_3` decimal(15,5)   NOT NULL DEFAULT '0.00000' AFTER `selling_rate_3`;
            ";
            $this->executeDB($sql);

            $version = '7.8.0.8';
            $this->update($version);
        }

        //2022-04-21
        if ($version == '7.8.0.8') {

            $sql = "ALTER TABLE `pkg_services_use` CHANGE `contract_period` `contract_period` DATE NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_services_use` ADD `termination_date` DATE NULL DEFAULT NULL AFTER `releasedate`;";
            $this->executeDB($sql);

            $version = '7.8.0.9';
            $this->update($version);
        }

        //2022-04-27
        if ($version == '7.8.0.9') {

            $sql = "ALTER TABLE `pkg_restrict_phone` CHANGE `number` `number` VARCHAR(20) NOT NULL;";
            $this->executeDB($sql);

            $version = '7.8.1.0';
            $this->update($version);
        }

        //2022-05-05
        if ($version == '7.8.1.0') {

            $sql = "ALTER TABLE `pkg_services_use` ADD `contract_period` DATETIME NULL DEFAULT NULL AFTER `releasedate`;";
            $this->executeDB($sql);

            $version = '7.8.1.1';
            $this->update($version);
        }

        //2022-05-13
        if ($version == '7.8.1.1') {
            $sql = "ALTER TABLE `pkg_method_pay` CHANGE `boleto_convenio` `boleto_convenio` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_banco` `boleto_banco` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_agencia` `boleto_agencia` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_conta_corrente` `boleto_conta_corrente` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_inicio_nosso_numeroa` `boleto_inicio_nosso_numeroa` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_carteira` `boleto_carteira` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_taxa` `boleto_taxa` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_instrucoes` `boleto_instrucoes` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_nome_emp` `boleto_nome_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_end_emp` `boleto_end_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_cidade_emp` `boleto_cidade_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_estado_emp` `boleto_estado_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_cpf_emp` `boleto_cpf_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.1.2';
            $this->update($version);
        }

        //2022-05-23
        if ($version == '7.8.1.2') {
            $sql = " CREATE TABLE IF NOT EXISTS `pkg_provider_cnl` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `id_provider` int(11) NOT NULL,
            `cnl` int(11) NOT NULL,
            `zone` VARCHAR(11) NOT NULL,
            PRIMARY KEY (`id`),
            KEY `id_provider` (`id_provider`),
            KEY `cnl` (`cnl`),
            CONSTRAINT `fk_pkg_provider_pkg_provider_cnl` FOREIGN KEY (`id_provider`) REFERENCES `pkg_provider` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_sip` ADD `cnl` VARCHAR(11) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.8.1.3';
            $this->update($version);
        }

        //2022-05-25
        if ($version == '7.8.1.3') {
            $sql    = "SELECT * FROM pkg_module WHERE module = 'providercnl'";
            $result = Yii::app()->db->createCommand($sql)->queryAll();
            if (! isset($result[0]['id'])) {
                $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''Provider CNL'')', 'providercnl', 'x-fa fa-desktop', 10,7)";
                $this->executeDB($sql);
            }

            $sql = "ALTER TABLE `pkg_trunk` ADD `cnl` INT(11) NOT NULL DEFAULT '0' ;";
            $this->executeDB($sql);

            $version = '7.8.1.4';
            $this->update($version);
        }

        //2022-05-25
        if ($version == '7.8.1.4') {

            $sql    = "SELECT priority FROM pkg_module WHERE id_module = 1 ORDER BY priority DESC";
            $result = Yii::app()->db->createCommand($sql)->queryAll();
            if (isset($result[0]['priority'])) {
                $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''User History'')', 'userhistory', 'x-fa fa-desktop', 1," . ($result[0]['priority'] + 1) . ")";
                $this->executeDB($sql);
                $idServiceModule = Yii::app()->db->lastInsertID;

                $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
                $this->executeDB($sql);
            }

            $version = '7.8.1.5';
            $this->update($version);
        }

        //2022-05-25
        if ($version == '7.8.1.5') {
            $sql = "CREATE TABLE `pkg_user_history` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `id_user` int(11) NOT NULL,
                    `description` mediumtext,
                    `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `fk_pkg_user_pkg_user_history` (`id_user`),
                    CONSTRAINT `fk_pkg_user_pkg_user_history` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            ";
            $this->executeDB($sql);

            $version = '7.8.1.6';
            $this->update($version);
        }

        //2022-07-15
        if ($version == '7.8.1.6') {
            $sql = "ALTER TABLE `pkg_user` CHANGE `contract_value` `contract_value` DECIMAL(15,5) NULL DEFAULT '0.00000'";
            $this->executeDB($sql);

            $version = '7.8.1.7';
            $this->update($version);
        }

        //2022-08-22
        if ($version == '7.8.1.7') {
            $sql = "ALTER TABLE `pkg_did` ADD `country` VARCHAR(50) NOT NULL DEFAULT ''";
            $this->executeDB($sql);

            $version = '7.8.1.8';
            $this->update($version);
        }

        //2022-08-29
        if ($version == '7.8.1.8') {
            $sql = "ALTER TABLE `pkg_offer` ADD `id_user` INT(11) NULL DEFAULT NULL AFTER `id`;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_offer` ADD  CONSTRAINT `fk_pkg_user_pkg_offer` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE";
            $this->executeDB($sql);

            $version = '7.8.1.9';
            $this->update($version);
        }

        //2022-09-07
        if ($version == '7.8.1.9') {
            $sql = "ALTER TABLE `pkg_rate_agent` ADD `package_offer` TINYINT(1) NOT NULL DEFAULT '0' AFTER `minimal_time_charge`;";
            $this->executeDB($sql);

            $version = '7.8.2.0';
            $this->update($version);
        }

        //2022-09-26
        if ($version == '7.8.2.0') {
            $sql = "ALTER TABLE `pkg_campaign_restrict_phone` ADD `description` VARCHAR(100) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.8.2.1';
            $this->update($version);
        }

        //2022-09-26
        if ($version == '7.8.2.1') {
            $sql = "ALTER TABLE `pkg_trunk_group_trunk` ADD `weight` INT(11) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_trunk_group` ADD `weight` VARCHAR(100) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.2.2';
            $this->update($version);
        }

        //2022-10-07
        if ($version == '7.8.2.2') {
            $sql = "
            CREATE TABLE IF NOT EXISTS `pkg_module_extra` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `id_module` int(11) NOT NULL,
            `type` varchar(10) DEFAULT NULL,
            `description` text NOT NULL,
            PRIMARY KEY (`id`),
            KEY `pkg_module_extra_id_module` (`id_module`),
            KEY `type` (`type`),
            CONSTRAINT `fk_pkg_module_pkg_module_extra` FOREIGN KEY (`id_module`) REFERENCES `pkg_module` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            ";
            $this->executeDB($sql);

            $version = '7.8.2.3';
            $this->update($version);
        }

        //2022-10-12
        if ($version == '7.8.2.3') {
            $sql = "ALTER TABLE `pkg_user` CHANGE `contract_value` `contract_value` FLOAT(11) NULL DEFAULT '0.00000';";
            $this->executeDB($sql);

            $version = '7.8.2.4';
            $this->update($version);
        }

        //2022-11-05
        if ($version == '7.8.2.4') {
            $sql = "ALTER TABLE `pkg_trunk` ADD `cid_add` VARCHAR(11) NOT NULL DEFAULT '' , ADD `cid_remove` VARCHAR(11) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.8.2.5';
            $this->update($version);
        }

        //2022-11-28
        if ($version == '7.8.2.5') {

            $sql = "INSERT INTO pkg_module VALUES (NULL, 't(''DID History'')', 'didhistory', 'x-fa fa-desktop', 5,12)";
            $this->executeDB($sql);
            $idServiceModule = Yii::app()->db->lastInsertID;

            $sql = "INSERT INTO pkg_group_module VALUES ((SELECT id FROM pkg_group_user WHERE id_user_type = 1 LIMIT 1), '" . $idServiceModule . "', 'crud', '1', '1', '1');";
            $this->executeDB($sql);

            $sql = "CREATE TABLE `pkg_did_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `did` varchar(50) DEFAULT NULL,
  `reservationdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `releasedate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `month_payed` int(11) DEFAULT '0',
    `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  KEY `did` (`did`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            $this->executeDB($sql);

            $sql = " INSERT INTO pkg_did_history(username, did, reservationdate, releasedate, month_payed, description ) SELECT username, did, reservationdate, releasedate, month_payed, c.description FROM pkg_did_use a JOIN pkg_user b ON a.id_user = b.id JOIN pkg_did c ON a.id_did = c.id WHERE releasedate > '2000-01-01'";
            $this->executeDB($sql);

            $version = '7.8.2.6';
            $this->update($version);
        }

        //2022-12-13
        if ($version == '7.8.2.6') {
            $sql = "ALTER TABLE `pkg_did` ADD `id_server` INT(11) NULL DEFAULT NULL AFTER `id_user`;";
            $this->executeDB($sql);

            $version = '7.8.2.7';
            $this->update($version);
        }

        //2022-12-27
        if ($version == '7.8.2.7') {
            $sql = "ALTER TABLE `pkg_alarm` ADD `last_notification` TIMESTAMP NOT NULL DEFAULT '0000-00-00' AFTER `email`;";
            $this->executeDB($sql);

            $version = '7.8.2.8';
            $this->update($version);
        }
        //2022-12-28
        if ($version == '7.8.2.8') {
            $sql = "ALTER TABLE `pkg_did_use` ADD `next_due_date` VARCHAR(30) NULL DEFAULT '' AFTER `reminded`;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_services_use` ADD `next_due_date` VARCHAR(30) NULL DEFAULT ''";
            $this->executeDB($sql);

            $version = '7.8.2.9';
            $this->update($version);
        }

        //2023-01-10
        if ($version == '7.8.2.9') {
            $sql = "INSERT INTO `pkg_method_pay` (`id`, `id_user`, `payment_method`, `show_name`, `country`, `active`, `active_agent`, `obs`, `url`, `username`, `pagseguro_TOKEN`, `fee`, `boleto_convenio`, `boleto_banco`, `boleto_agencia`, `boleto_conta_corrente`, `boleto_inicio_nosso_numeroa`, `boleto_carteira`, `boleto_taxa`, `boleto_instrucoes`, `boleto_nome_emp`, `boleto_end_emp`, `boleto_cidade_emp`, `boleto_estado_emp`, `boleto_cpf_emp`, `P2P_CustomerSiteID`, `P2P_KeyID`, `P2P_Passphrase`, `P2P_RecipientKeyID`, `P2P_tax_amount`, `client_id`, `client_secret`, `SLAppToken`, `SLAccessToken`, `SLSecret`, `SLIdProduto`, `SLvalidationtoken`, `min`, `max`, `showFields`) VALUES
(NULL, 1, 'Custom', 'Custom Method', 'Global', 0, 0, NULL, '', '', '', 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 10, 'payment_method,show_name,id_user,country,active,min,max,min,max,username,url');";
            $this->executeDB($sql);

            $version = '7.8.3.0';
            $this->update($version);
        }

        //2023-01-14
        if ($version == '7.8.3.0') {
            $sql = "ALTER TABLE `pkg_alarm` ADD `subject` VARCHAR(200) NOT NULL DEFAULT 'MagnusBilling ALARM' AFTER `last_notification`, ADD `message` VARCHAR(1000) NOT NULL DEFAULT 'MagnusBilling ALARM email body, customize' AFTER `subject`;";
            $this->executeDB($sql);

            $version = '7.8.3.1';
            $this->update($version);
        }

        //2023-02-21
        if ($version == '7.8.3.1') {
            $sql = " INSERT INTO `pkg_configuration`  VALUES (NULL, 'Allow login on webpanel with SIP user and password', 'sipuser_login', '1', 'Allow login on webpanel with SIP user and password', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.8.3.2';
            $this->update($version);
        }

        //2023-03-14
        if ($version == '7.8.3.2') {
            $sql = "ALTER TABLE `pkg_user` ADD `email2` VARCHAR(100) NOT NULL DEFAULT '' AFTER `email`; ";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_user` CHANGE `email` `email` VARCHAR(100) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.8.3.3';
            $this->update($version);
        }

        //2023-03-14
        if ($version == '7.8.3.3') {
            $sql = "ALTER TABLE `pkg_user` ADD `email_services` INT(11) NOT NULL DEFAULT '1' , ADD `email_did` INT(11) NOT NULL DEFAULT '1' AFTER `email_services`;";
            $this->executeDB($sql);

            $version = '7.8.3.4';
            $this->update($version);
        }

        //2023-03-14
        if ($version == '7.8.3.4') {
            $version = '7.8.3.5';
            $this->update($version);
        }

        //2023-04-21
        if ($version == '7.8.3.5') {
            $sql = "
                CREATE TABLE `pkg_servers_servers` (
                  `id_proxy` int(11) NOT NULL,
                  `id_server` int(11) NOT NULL,
                  PRIMARY KEY (`id_server`,`id_proxy`),
                  KEY `fk_pkg_servers` (`id_server`),
                  KEY `fk_pkg_proxy` (`id_proxy`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
                ";
            $this->executeDB($sql);

            $version = '7.8.3.6';
            $this->update($version);
        }

        //2023-05-03
        if ($version == '7.8.3.6') {
            $sql = "ALTER TABLE `pkg_method_pay` CHANGE `username` `username` VARCHAR(1000) NOT NULL";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_method_pay SET username = CONCAT('BTC(BTC)=>',username) WHERE payment_method = 'cryptocurrency';";
            $this->executeDB($sql);

            $version = '7.8.3.7';
            $this->update($version);
        }

        //2023-05-18
        if ($version == '7.8.3.7') {
            $sql = "ALTER TABLE `pkg_user` CHANGE `prefix_local` `prefix_local` VARCHAR(500) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.8.3.8';
            $this->update($version);
        }

        //2023-05-25
        if ($version == '7.8.3.8') {
            $sql = "ALTER TABLE `pkg_status_system` ADD `disk_free` INT(11) NULL DEFAULT NULL AFTER `cps`, ADD `disk_perc` INT(11) NULL DEFAULT NULL AFTER `disk_free`;";
            $this->executeDB($sql);

            $version = '7.8.3.9';
            $this->update($version);
        }

        //2023-06-26
        if ($version == '7.8.3.9') {
            $sql = "ALTER TABLE `pkg_servers` ADD `last_call` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_servers` ADD `last_call_id` INT(11) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.4.0';
            $this->update($version);
        }

        //2023-07-26
        if ($version == '7.8.4.0') {
            $sql = "ALTER TABLE pkg_trunk ADD block_cid VARCHAR(120) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.8.4.1';
            $this->update($version);
        }

        //2023-11-08
        if ($version == '7.8.4.1') {
            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'Disable CDR count', 'remove_count_cdr', '0', 'It will make the CDR more efficiency, particularly when utilizing filters', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.8.4.2';
            $this->update($version);
        }

        //2023-11-09
        if ($version == '7.8.4.2') {
            $sql = "ALTER TABLE `pkg_rate_provider` CHANGE `dialprefix` `dialprefix` VARCHAR(20) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.4.3';
            $this->update($version);
        }

        //2023-11-09
        if ($version == '7.8.4.3') {
            $sql = "ALTER TABLE `pkg_user` ADD `inbound_call_limit` INT NOT NULL DEFAULT '-1' AFTER `email_did`;";
            $this->executeDB($sql);

            $version = '7.8.4.4';
            $this->update($version);
        }
        //2024-01-22
        if ($version == '7.8.4.4') {
            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'Max call duration', 'max_call_duration', '3600', 'Maximum call duration in seconds', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.8.4.5';
            $this->update($version);
        }

        //2024-01-22
        if ($version == '7.8.4.5') {
            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'API allow multiple user/email', 'api_allow_same_ip', '0', 'Allow create muiltiple clients with same email via API', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.8.4.6';
            $this->update($version);
        }

        //2024-05-27
        if ($version == '7.8.4.6') {
            $sql = " ALTER TABLE `pkg_campaign_poll` ADD `option10` VARCHAR(150) NULL DEFAULT NULL AFTER `option9`;";
            $this->executeDB($sql);

            $sql = " ALTER TABLE `pkg_campaign_poll_info` ADD `resposta_text` VARCHAR(150) NULL DEFAULT NULL AFTER `city`";
            $this->executeDB($sql);

            $sql = "
            ALTER TABLE `pkg_campaign_poll_info` CHANGE `resposta` `resposta` INT(11) NOT NULL;";
            $this->executeDB($sql);

            $version = '7.8.4.7';
            $this->update($version);
        }

        //2024-10-23
        if ($version == '7.8.4.7') {
            $sql = "DELETE FROM pkg_group_module WHERE id_module = (SELECT id FROM pkg_module WHERE module = 'firewall')";
            $this->executeDB($sql);

            $sql = "DELETE FROM pkg_module WHERE module = 'firewall'";
            $this->executeDB($sql);

            $version = '7.8.4.8';
            $this->update($version);
        }

        //2024-12-17
        if ($version == '7.8.4.8') {
            $sql = "UPDATE `pkg_method_pay` SET `show_name` = 'EFI' , `payment_method` = 'EFI' WHERE `payment_method` = 'GerenciaNet'";
            $this->executeDB($sql);

            $version = '7.8.4.9';
            $this->update($version);
        }


        //2025-01-06
        if ($version == '7.8.4.9') {
            $sql = "ALTER TABLE pkg_trunk DROP FOREIGN KEY fk_pkg_trunk_pkg_trunk";
            $this->executeDB($sql);

            $version = '7.8.5.0';
            $this->update($version);
        }

        //2025-02-03
        if ($version == '7.8.4.9') {
            $sql = "ALTER TABLE `pkg_servers` CHANGE `last_call_id` `last_call_id` BIGINT(11) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.5.0';
            $this->update($version);
        }

        //2025-03-10
        if ($version == '7.8.5.0') {
            $sql = "ALTER TABLE `pkg_sip` CHANGE `forward` `forward` VARCHAR(100) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.8.5.1';
            $this->update($version);
        }

        //2025-04-23
        if ($version == '7.8.5.1') {

            $sql = "INSERT INTO `pkg_module`(`id`, `text`, `module`, `icon_cls`, `id_module`, `priority`) VALUES (82,'t(\'Fail2ban\')','firewall','x-fa fa-desktop',12,82);";
            $this->executeDB($sql);

            $sql = "INSERT INTO `pkg_group_module` (`id_group`, `id_module`, `action`, `show_menu`, `createShortCut`, `createQuickStart`) VALUES ('1', '82', 'crud', '1', '0', '0');";
            $this->executeDB($sql);

            $sql = "TRUNCATE TABLE pkg_firewall";
            $this->executeDB($sql);

            $sql = " ALTER TABLE `pkg_firewall` ADD `id_server` INT(11) NOT NULL AFTER `jail`;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE pkg_firewall ADD  UNIQUE KEY ipperserver (ip, id_server);";
            $this->executeDB($sql);

            exec("echo '\n*/2 * * * * root flock -n /tmp/failtwobanip.lock php /var/www/html/mbilling/cron.php failtwobanip' >> /etc/crontab");
            exec("sed -i 's/ssh-iptables/sshd/g' /etc/fail2ban/jail.local");
            exec("systemctl restart fail2ban");

            $version = '7.8.5.2';
            $this->update($version);
        }

        //2025-04-24
        if ($version == '7.8.5.2') {
            $sql = "ALTER TABLE `pkg_sip` ADD UNIQUE(`name`);";
            $this->executeDB($sql);

            $version = '7.8.5.3';
            $this->update($version);
        }
        //2025-09-25
        if ($version == '7.8.5.3') {
            $sql = "INSERT INTO pkg_module VALUES
                (13, 't(''Voice Broadcasting'')', NULL, 'x-fa fa-arrow-right', NULL,8),
                (41, 't(\'Campaigns\')', 'campaign', 'x-fa fa-desktop', 13, 1),
                (42, 't(\'Polls\')', 'campaignpoll', 'x-fa fa-desktop', 13, 4),
                (43, 't(\'Phonebooks\')', 'phonebook', 'x-fa fa-desktop', 13, 2),
                (44, 't(\'Phonenumbers\')', 'phonenumber', 'x-fa fa-desktop', 13, 3),
                (49, 't(\'SMS\')', 'sms', 'x-fa fa-desktop', 13, 7),
                (57, 't(\'Polls Reports\')', 'campaignpollinfo', 'x-fa fa-desktop', 13, 5),
                (62, 't(\'Restrict Phone\')', 'campaignrestrictphone', 'x-fa fa-desktop', 13, 6),
                (63, 't(\'Quick Campaign\')', 'campaignsend', 'x-fa fa-desktop', 13, 8),
                (NULL, 't(\'Campaigns DashBoard\')', 'campaigndashboard', 'x-fa fa-desktop', 13, 11),
                (NULL, 't(\'Campaign Report\')', 'campaignreport', 'x-fa fa-desktop', 13, 12);";
            $this->executeDB($sql);


            $sql = "INSERT INTO `pkg_group_module` (`id_group`, `id_module`, `action`, `show_menu`, `createShortCut`, `createQuickStart`) VALUES
            (1, 13, 'crud', 1, 0, 0),
            (1, 41, 'crud', 1, 0, 0),
            (1, 42, 'crud', 1, 0, 0),
            (1, 43, 'crud', 1, 0, 0),
            (1, 44, 'crud', 1, 0, 0),
            (1, 49, 'crud', 1, 0, 0),
            (1, 57, 'crud', 1, 0, 0),
            (1, 62, 'crud', 1, 0, 0),
            (1, 63, 'crud', 1, 0, 0);";
            $this->executeDB($sql);

            $version = '7.8.5.4';
            $this->update($version);
        }

        //2025-10-21
        if ($version == '7.8.5.4') {
            $sql = "";
            $sql = "INSERT INTO pkg_configuration
                VALUES (
                    NULL,
                    'Archive cdr failed',
                    'archive_call_failed_prior_x_month',
                    ( SELECT config_value FROM (SELECT config_value FROM pkg_configuration WHERE config_key = 'archive_call_prior_x_month' LIMIT 1) AS tmp),
                    'Archive call to other table before X months.',
                    'global',
                    '1'
                );";
            $this->executeDB($sql);

            $version = '7.8.5.5';
            $this->update($version);
        }


        //2025-10-21
        if ($version == '7.8.5.5') {
            exec("echo 'noload => codec_silk.so' >> /etc/asterisk/modules.conf");
            $version = '7.8.5.6';
            $this->update($version);
        }

        //2026-06-24
        if ($version == '7.8.5.6') {
            $sql = "";
            $sql = "UPDATE pkg_configuration SET `config_title` = 'hash', `config_key` = 'hash', `config_description` = 'hash' WHERE id = 4;";
            $this->executeDB($sql);

            $version = '7.8.5.7';
            $this->update($version);
        }

        //2026-06-24
        if ($version == '7.8.5.7') {
            if (! $this->indexExists('pkg_rate', 'uq_pkg_rate_plan_prefix')) {
                $this->migrateRateAndPrefixIndexes();
            } else {
                echo "\n[7.8.5.8] Index uq_pkg_rate_plan_prefix already exists. Skipping rate and prefix migration.\n";
            }

            $version = '7.8.5.8';
            $this->updateCritical($version);
        }
    }

    private function migrateRateAndPrefixIndexes()
    {
        $db           = Yii::app()->db;
        $lockName     = 'mbilling-update-rate-prefix-7.8.5.8';
        $lockAcquired = false;

        try {
            $command = $db->createCommand('SELECT GET_LOCK(:lockName, 60)');
            $command->bindValue(':lockName', $lockName, PDO::PARAM_STR);
            $lockAcquired = (int) $command->queryScalar() === 1;

            if (! $lockAcquired) {
                throw new Exception('Could not acquire the rate and prefix migration lock.');
            }

            echo "\n[7.8.5.8] Checking duplicated prefixes...\n";

            $this->criticalExecute(
                'CREATE TABLE IF NOT EXISTS `pkg_prefix_merge_7858` (
                    `old_id` INT NOT NULL,
                    `keep_id` INT NOT NULL,
                    `prefix` VARCHAR(18) NOT NULL,
                    PRIMARY KEY (`old_id`),
                    KEY `idx_prefix_merge_keep_id` (`keep_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8'
            );

            $this->criticalExecute(
                'INSERT IGNORE INTO `pkg_prefix_merge_7858` (`old_id`, `keep_id`, `prefix`)
                 SELECT p.id, duplicated.keep_id, p.prefix
                 FROM `pkg_prefix` p
                 INNER JOIN (
                    SELECT prefix, MAX(id) AS keep_id
                    FROM `pkg_prefix`
                    GROUP BY prefix
                    HAVING COUNT(*) > 1
                 ) duplicated ON duplicated.prefix = p.prefix
                 WHERE p.id <> duplicated.keep_id'
            );

            $prefixesToMerge = (int) $db->createCommand(
                'SELECT COUNT(*) FROM `pkg_prefix_merge_7858` m
                 INNER JOIN `pkg_prefix` p ON p.id = m.old_id'
            )->queryScalar();

            if ($prefixesToMerge > 0) {
                echo '[7.8.5.8] Prefixes to merge: ' . $prefixesToMerge . "\n";

                $this->createBackupTable('pkg_prefix', 'pkg_prefix_duplicate_backup_7858');
                $this->criticalExecute(
                    'INSERT IGNORE INTO `pkg_prefix_duplicate_backup_7858`
                     SELECT p.* FROM `pkg_prefix` p
                     INNER JOIN `pkg_prefix_merge_7858` m ON m.old_id = p.id'
                );

                $prefixReferenceTables = [
                    'pkg_rate',
                    'pkg_rate_provider',
                    'pkg_rate_agent',
                    'pkg_user_rate',
                    'pkg_balance',
                    'pkg_cdr',
                    'pkg_cdr_archive',
                    'pkg_cdr_failed',
                ];

                foreach ($prefixReferenceTables as $table) {
                    $this->remapPrefixReferences($table);
                }

                // Prefix merging can create duplicated logical rows in these tables.
                $this->backupAndDeleteDuplicates(
                    'pkg_rate_provider',
                    ['id_provider', 'id_prefix'],
                    'pkg_rate_provider_duplicate_backup_7858'
                );
                $this->backupAndDeleteDuplicates(
                    'pkg_rate_agent',
                    ['id_plan', 'id_prefix'],
                    'pkg_rate_agent_duplicate_backup_7858'
                );
                $this->backupAndDeleteDuplicates(
                    'pkg_user_rate',
                    ['id_user', 'id_prefix'],
                    'pkg_user_rate_duplicate_backup_7858'
                );

                foreach ($prefixReferenceTables as $table) {
                    if (! $this->tableHasColumn($table, 'id_prefix')) {
                        continue;
                    }

                    $remainingReferences = (int) $db->createCommand(
                        'SELECT COUNT(*) FROM `' . $table . '` t
                         INNER JOIN `pkg_prefix_merge_7858` m ON m.old_id = t.id_prefix'
                    )->queryScalar();

                    if ($remainingReferences > 0) {
                        throw new Exception(
                            'Prefix migration still has references in ' . $table . ': ' . $remainingReferences
                        );
                    }
                }

                $this->criticalExecute(
                    'DELETE p FROM `pkg_prefix` p
                     INNER JOIN `pkg_prefix_merge_7858` m ON m.old_id = p.id'
                );
            }

            echo "[7.8.5.8] Removing duplicated selling rates...\n";
            $this->backupAndDeleteDuplicates(
                'pkg_rate',
                ['id_plan', 'id_prefix'],
                'pkg_rate_duplicate_backup_7858'
            );

            if ($this->countDuplicateGroups('pkg_prefix', ['prefix']) > 0) {
                throw new Exception('Duplicated prefixes remain after migration.');
            }

            if ($this->countDuplicateGroups('pkg_rate', ['id_plan', 'id_prefix']) > 0) {
                throw new Exception('Duplicated selling rates remain after migration.');
            }

            echo "[7.8.5.8] Creating unique indexes...\n";
            $this->ensureUniqueIndex('pkg_prefix', 'uq_pkg_prefix_prefix', ['prefix']);
            $this->ensureUniqueIndex('pkg_rate', 'uq_pkg_rate_plan_prefix', ['id_plan', 'id_prefix']);
            $this->dropRedundantPrefixIndexes();

            if (! $this->hasUniqueIndex('pkg_prefix', ['prefix']) ||
                ! $this->hasUniqueIndex('pkg_rate', ['id_plan', 'id_prefix'])) {
                throw new Exception('The required unique indexes were not created.');
            }

            $this->criticalExecute('ANALYZE TABLE `pkg_prefix`, `pkg_rate`');
            echo "[7.8.5.8] Rate and prefix migration completed.\n";
        } finally {
            if ($lockAcquired) {
                try {
                    $command = $db->createCommand('SELECT RELEASE_LOCK(:lockName)');
                    $command->bindValue(':lockName', $lockName, PDO::PARAM_STR);
                    $command->queryScalar();
                } catch (Exception $e) {
                }
            }
        }
    }

    private function remapPrefixReferences($table)
    {
        if (! $this->tableHasColumn($table, 'id') || ! $this->tableHasColumn($table, 'id_prefix')) {
            return;
        }

        echo '[7.8.5.8] Remapping ' . $table . "...\n";

        if (! $this->hasIndexStartingWith($table, 'id_prefix')) {
            $this->criticalExecute(
                'UPDATE `' . $table . '` t
                 INNER JOIN `pkg_prefix_merge_7858` m ON m.old_id = t.id_prefix
                 SET t.id_prefix = m.keep_id'
            );
            return;
        }

        $this->criticalExecute('DROP TEMPORARY TABLE IF EXISTS `tmp_prefix_remap_7858`');
        $this->criticalExecute(
            'CREATE TEMPORARY TABLE `tmp_prefix_remap_7858` (
                `id` BIGINT NOT NULL,
                `keep_id` INT NOT NULL,
                PRIMARY KEY (`id`)
             ) ENGINE=InnoDB'
        );

        do {
            $this->criticalExecute('TRUNCATE TABLE `tmp_prefix_remap_7858`');
            $batchRows = $this->criticalExecute(
                'INSERT INTO `tmp_prefix_remap_7858` (`id`, `keep_id`)
                 SELECT t.id, m.keep_id
                 FROM `' . $table . '` t
                 INNER JOIN `pkg_prefix_merge_7858` m ON m.old_id = t.id_prefix
                 LIMIT 10000'
            );

            if ($batchRows > 0) {
                $this->criticalExecute(
                    'UPDATE `' . $table . '` t
                     INNER JOIN `tmp_prefix_remap_7858` b ON b.id = t.id
                     SET t.id_prefix = b.keep_id'
                );
            }
        } while ($batchRows > 0);

        $this->criticalExecute('DROP TEMPORARY TABLE IF EXISTS `tmp_prefix_remap_7858`');
    }

    private function backupAndDeleteDuplicates($table, array $groupColumns, $backupTable)
    {
        if (! $this->tableExists($table)) {
            return;
        }

        foreach ($groupColumns as $column) {
            if (! $this->tableHasColumn($table, $column)) {
                return;
            }
        }

        $this->createBackupTable($table, $backupTable);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            if ($this->countDuplicateGroups($table, $groupColumns) === 0) {
                return;
            }

            $quotedColumns = array_map([$this, 'quoteIdentifier'], $groupColumns);
            $groupList      = implode(', ', $quotedColumns);
            $joinConditions = [];

            foreach ($groupColumns as $column) {
                $quotedColumn    = $this->quoteIdentifier($column);
                $joinConditions[] = 'duplicated.' . $quotedColumn . ' = t.' . $quotedColumn;
            }

            $this->criticalExecute(
                'INSERT IGNORE INTO `' . $backupTable . '`
                 SELECT t.* FROM `' . $table . '` t
                 INNER JOIN (
                    SELECT ' . $groupList . ', MAX(`id`) AS keep_id
                    FROM `' . $table . '`
                    GROUP BY ' . $groupList . '
                    HAVING COUNT(*) > 1
                 ) duplicated ON ' . implode(' AND ', $joinConditions) . '
                 WHERE t.id <> duplicated.keep_id'
            );

            $this->criticalExecute(
                'DELETE t FROM `' . $table . '` t
                 INNER JOIN `' . $backupTable . '` backup ON backup.id = t.id'
            );
        }

        $remaining = $this->countDuplicateGroups($table, $groupColumns);
        if ($remaining > 0) {
            throw new Exception('Could not remove duplicated rows from ' . $table . ': ' . $remaining);
        }
    }

    private function createBackupTable($sourceTable, $backupTable)
    {
        if (! $this->tableExists($backupTable)) {
            $this->criticalExecute(
                'CREATE TABLE `' . $backupTable . '` ENGINE=InnoDB
                 AS SELECT * FROM `' . $sourceTable . '` WHERE 1 = 0'
            );
        }

        if (! $this->indexExists($backupTable, 'PRIMARY')) {
            $this->criticalExecute(
                'ALTER TABLE `' . $backupTable . '` ADD PRIMARY KEY (`id`)'
            );
        }
    }

    private function countDuplicateGroups($table, array $groupColumns)
    {
        $quotedColumns = array_map([$this, 'quoteIdentifier'], $groupColumns);
        $sql = 'SELECT COUNT(*) FROM (
                    SELECT 1 FROM `' . $table . '`
                    GROUP BY ' . implode(', ', $quotedColumns) . '
                    HAVING COUNT(*) > 1
                ) duplicated_groups';

        return (int) Yii::app()->db->createCommand($sql)->queryScalar();
    }

    private function ensureUniqueIndex($table, $indexName, array $columns)
    {
        if ($this->hasUniqueIndex($table, $columns)) {
            return;
        }

        if ($this->indexExists($table, $indexName)) {
            $this->criticalExecute(
                'ALTER TABLE `' . $table . '` DROP INDEX `' . $indexName . '`'
            );
        }

        $quotedColumns = array_map([$this, 'quoteIdentifier'], $columns);
        $this->criticalExecute(
            'ALTER TABLE `' . $table . '` ADD UNIQUE KEY `' . $indexName . '` (' .
            implode(', ', $quotedColumns) . ')'
        );
    }

    private function dropRedundantPrefixIndexes()
    {
        $indexes = $this->getTableIndexes('pkg_prefix');

        foreach ($indexes as $indexName => $index) {
            if ($indexName === 'PRIMARY' || (int) $index['non_unique'] !== 1 || $index['columns'] !== ['prefix']) {
                continue;
            }

            $this->criticalExecute(
                'ALTER TABLE `pkg_prefix` DROP INDEX `' . $indexName . '`'
            );
        }
    }

    private function hasUniqueIndex($table, array $columns)
    {
        foreach ($this->getTableIndexes($table) as $index) {
            if ((int) $index['non_unique'] === 0 && $index['columns'] === $columns) {
                return true;
            }
        }

        return false;
    }

    private function hasIndexStartingWith($table, $column)
    {
        foreach ($this->getTableIndexes($table) as $index) {
            if (isset($index['columns'][0]) && $index['columns'][0] === $column) {
                return true;
            }
        }

        return false;
    }

    private function indexExists($table, $indexName)
    {
        $indexes = $this->getTableIndexes($table);
        return isset($indexes[$indexName]);
    }

    private function getTableIndexes($table)
    {
        if (! $this->tableExists($table)) {
            return [];
        }

        $command = Yii::app()->db->createCommand(
            'SELECT INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME
             FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName
             ORDER BY INDEX_NAME, SEQ_IN_INDEX'
        );
        $command->bindValue(':tableName', $table, PDO::PARAM_STR);
        $rows    = $command->queryAll();
        $indexes = [];

        foreach ($rows as $row) {
            $name = $row['INDEX_NAME'];
            if (! isset($indexes[$name])) {
                $indexes[$name] = [
                    'non_unique' => (int) $row['NON_UNIQUE'],
                    'columns'    => [],
                ];
            }
            $indexes[$name]['columns'][] = $row['COLUMN_NAME'];
        }

        return $indexes;
    }

    private function tableExists($table)
    {
        $command = Yii::app()->db->createCommand(
            'SELECT COUNT(*) FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName'
        );
        $command->bindValue(':tableName', $table, PDO::PARAM_STR);
        return (int) $command->queryScalar() === 1;
    }

    private function tableHasColumn($table, $column)
    {
        $command = Yii::app()->db->createCommand(
            'SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName AND COLUMN_NAME = :columnName'
        );
        $command->bindValue(':tableName', $table, PDO::PARAM_STR);
        $command->bindValue(':columnName', $column, PDO::PARAM_STR);
        return (int) $command->queryScalar() === 1;
    }

    private function quoteIdentifier($identifier)
    {
        if (! preg_match('/^[a-zA-Z0-9_]+$/', $identifier)) {
            throw new Exception('Invalid SQL identifier: ' . $identifier);
        }

        return '`' . $identifier . '`';
    }

    private function criticalExecute($sql)
    {
        return Yii::app()->db->createCommand($sql)->execute();
    }

    private function updateCritical($version)
    {
        $command = Yii::app()->db->createCommand(
            "UPDATE pkg_configuration SET config_value = :version WHERE config_key = 'version'"
        );
        $command->bindValue(':version', $version, PDO::PARAM_STR);
        $command->execute();

        $savedVersion = Yii::app()->db->createCommand(
            "SELECT config_value FROM pkg_configuration WHERE config_key = 'version' LIMIT 1"
        )->queryScalar();

        if ((string) $savedVersion !== (string) $version) {
            throw new Exception('Could not save database version ' . $version . '.');
        }
    }

    public function executeDB($sql)
    {
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            //print_r($e);
        }
    }

    public function update($version = '')
    {
        $sql = "UPDATE pkg_configuration SET config_value = '" . $version . "' WHERE config_key = 'version' ";
        $this->executeDB($sql);
    }
}
