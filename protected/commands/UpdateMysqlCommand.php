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

        if (preg_match('/^7/', $version)) {

            $sql = "UPDATE pkg_trunk SET providertech = 'pjsip' WHERE providertech = 'sip' ";
            $this->executeDB($sql);

            $version = '8.0.0.0';
            $sql     = "UPDATE pkg_configuration SET config_value = '" . $version . "'WHERE config_key = 'version'";
            $this->executeDB($sql);
        }

        if ($version == '8.0.0.0') {

            $sql = "ALTER TABLE `pkg_sip` ADD `max_contacts` INT(11) NOT NULL DEFAULT '1' AFTER `cnl`; ";
            $this->executeDB($sql);

            $version = '8.0.0.1';
            $sql     = "UPDATE pkg_configuration SET config_value = '" . $version . "'WHERE config_key = 'version'";
            $this->executeDB($sql);
        }

        //2026-06-24
        if ($version == '8.0.0.1') {
            $sql = "";
            $sql = "UPDATE pkg_configuration SET `config_title` = 'hash', `config_key` = 'hash', `config_description` = 'hash' WHERE id = 4;";
            $this->executeDB($sql);

            $version = '8.0.0.2';
            $this->update($version);
        }

        //2026-07-13
        if ($version == '8.0.0.2') {
            $this->executeDB(
                'ALTER TABLE `pkg_configuration` MODIFY `config_value` VARCHAR(400) NULL DEFAULT NULL'
            );

            if (! $this->columnExists('pkg_campaign', 'whatsapp_template_name')) {
                $this->executeDB(
                    "ALTER TABLE `pkg_campaign` ADD `whatsapp_template_name` VARCHAR(512) NOT NULL DEFAULT 'hello_world' AFTER `description`"
                );
            }
            if (! $this->columnExists('pkg_campaign', 'whatsapp_template_language')) {
                $this->executeDB(
                    "ALTER TABLE `pkg_campaign` ADD `whatsapp_template_language` VARCHAR(20) NOT NULL DEFAULT 'en_US' AFTER `whatsapp_template_name`"
                );
            }

            $whatsappSettings = [
                ['WhatsApp Phone Number ID', 'whatsapp_phone_number_id', '', 'Phone Number ID from Meta WhatsApp Manager.'],
                ['WhatsApp Access Token', 'whatsapp_access_token', '', 'Permanent access token for the WhatsApp Business Cloud API.'],
                ['WhatsApp API Version', 'whatsapp_api_version', 'v25.0', 'Meta Graph API version used to send WhatsApp messages.'],
                ['WhatsApp API Timeout', 'whatsapp_timeout', '30', 'WhatsApp API request timeout in seconds.'],
            ];

            foreach ($whatsappSettings as $setting) {
                $command = Yii::app()->db->createCommand(
                    'INSERT INTO pkg_configuration
                        (config_title, config_key, config_value, config_description, config_group_title, status)
                     SELECT :title, :key, :value, :description, \'global\', 1
                     FROM DUAL
                     WHERE NOT EXISTS (
                        SELECT 1 FROM pkg_configuration WHERE config_key = :existingKey
                     )'
                );
                $command->bindValue(':title', $setting[0], PDO::PARAM_STR);
                $command->bindValue(':key', $setting[1], PDO::PARAM_STR);
                $command->bindValue(':value', $setting[2], PDO::PARAM_STR);
                $command->bindValue(':description', $setting[3], PDO::PARAM_STR);
                $command->bindValue(':existingKey', $setting[1], PDO::PARAM_STR);
                $command->execute();
            }

            $this->executeDB(
                "UPDATE pkg_configuration SET config_value = 'v25.0'
                 WHERE config_key = 'whatsapp_api_version' AND config_value = 'v23.0'"
            );

            if (isset($CRONPATH) && file_exists($CRONPATH)) {
                $cronLine = '* * * * * php /var/www/html/mbilling/cron.php WhatsappCampaign';
                $cron     = file_get_contents($CRONPATH);
                if (strpos($cron, $cronLine) === false) {
                    file_put_contents($CRONPATH, "\n" . $cronLine . "\n", FILE_APPEND);
                }
            }

            $version = '8.0.0.3';
            $this->update($version);
        }

        //2026-07-13
        if ($version == '8.0.0.3') {
            if (! $this->columnExists('pkg_sms', 'channel')) {
                $this->executeDB(
                    "ALTER TABLE `pkg_sms` ADD `channel` VARCHAR(20) NOT NULL DEFAULT 'sms' AFTER `status`"
                );
            }
            if (! $this->columnExists('pkg_sms', 'provider_message_id')) {
                $this->executeDB(
                    'ALTER TABLE `pkg_sms` ADD `provider_message_id` VARCHAR(191) NULL DEFAULT NULL AFTER `channel`'
                );
            }
            if (! $this->columnExists('pkg_sms', 'id_campaign')) {
                $this->executeDB(
                    'ALTER TABLE `pkg_sms` ADD `id_campaign` INT NULL DEFAULT NULL AFTER `id_user`'
                );
            }
            if (! $this->indexExists('pkg_sms', 'uq_pkg_sms_channel_provider_message')) {
                $this->executeDB(
                    'ALTER TABLE `pkg_sms` ADD UNIQUE KEY `uq_pkg_sms_channel_provider_message` (`channel`, `provider_message_id`)'
                );
            }
            if (! $this->indexExists('pkg_sms', 'idx_pkg_sms_id_campaign')) {
                $this->executeDB(
                    'ALTER TABLE `pkg_sms` ADD KEY `idx_pkg_sms_id_campaign` (`id_campaign`)'
                );
            }

            $whatsappWebhookSettings = [
                ['WhatsApp Webhook Verify Token', 'whatsapp_webhook_verify_token', '', 'Private token used by Meta to verify the webhook URL.'],
                ['WhatsApp App Secret', 'whatsapp_app_secret', '', 'Meta application secret used to validate webhook signatures.'],
            ];

            foreach ($whatsappWebhookSettings as $setting) {
                $command = Yii::app()->db->createCommand(
                    'INSERT INTO pkg_configuration
                        (config_title, config_key, config_value, config_description, config_group_title, status)
                     SELECT :title, :key, :value, :description, \'global\', 1
                     FROM DUAL
                     WHERE NOT EXISTS (
                        SELECT 1 FROM pkg_configuration WHERE config_key = :existingKey
                     )'
                );
                $command->bindValue(':title', $setting[0], PDO::PARAM_STR);
                $command->bindValue(':key', $setting[1], PDO::PARAM_STR);
                $command->bindValue(':value', $setting[2], PDO::PARAM_STR);
                $command->bindValue(':description', $setting[3], PDO::PARAM_STR);
                $command->bindValue(':existingKey', $setting[1], PDO::PARAM_STR);
                $command->execute();
            }

            $this->executeDB(
                "UPDATE pkg_module SET text = 't(\\'Received Messages\\')' WHERE module = 'sms'"
            );

            $version = '8.0.0.4';
            $this->update($version);
        }
    }

    private function columnExists($table, $column)
    {
        $command = Yii::app()->db->createCommand(
            'SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName AND COLUMN_NAME = :columnName'
        );
        $command->bindValue(':tableName', $table, PDO::PARAM_STR);
        $command->bindValue(':columnName', $column, PDO::PARAM_STR);
        return (int) $command->queryScalar() === 1;
    }

    private function indexExists($table, $index)
    {
        $command = Yii::app()->db->createCommand(
            'SELECT COUNT(*) FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName AND INDEX_NAME = :indexName'
        );
        $command->bindValue(':tableName', $table, PDO::PARAM_STR);
        $command->bindValue(':indexName', $index, PDO::PARAM_STR);
        return (int) $command->queryScalar() > 0;
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
