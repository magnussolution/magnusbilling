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

        if (empty($this->config['global']['version'])) {
            throw new RuntimeException('Unable to determine the current MagnusBilling database version.');
        }

        $version = trim($this->config['global']['version']);
        $this->logMessage('Current database version: ' . $version);

        if (! preg_match('/^(7|8)(\.|$)/', $version)) {
            throw new RuntimeException(
                'Unsupported source database version: ' . $version . '. Expected MagnusBilling 7 or 8.'
            );
        }

        if (preg_match('/^7/', $version)) {
            $this->logMessage('Migrating MagnusBilling 7 trunk technology values to PJSIP.');
            $this->executeDB("UPDATE pkg_trunk SET providertech = 'pjsip' WHERE providertech = 'sip'");
            $this->migrateLegacySipReferences();
            $version = '8.0.0.0';
            $this->update($version);
        }

        if ($version == '8.0.0.0') {
            $this->logMessage('Applying database migration 8.0.0.0 -> 8.0.0.1.');
            if (! $this->columnExists('pkg_sip', 'max_contacts')) {
                $this->executeDB(
                    "ALTER TABLE `pkg_sip` ADD `max_contacts` INT(11) NOT NULL DEFAULT '1' AFTER `cnl`"
                );
            }

            $version = '8.0.0.1';
            $this->update($version);
        }

        //2026-06-24
        if ($version == '8.0.0.1') {
            $this->logMessage('Applying database migration 8.0.0.1 -> 8.0.0.2.');
            if (! $this->rowExists('pkg_configuration', 'id', 4)) {
                throw new RuntimeException('Expected pkg_configuration row id=4 was not found.');
            }
            $this->executeDB(
                "UPDATE pkg_configuration
                 SET `config_title` = 'hash', `config_key` = 'hash', `config_description` = 'hash'
                 WHERE id = 4"
            );

            $version = '8.0.0.2';
            $this->update($version);
        }

        //2026-07-13
        if ($version == '8.0.0.2') {
            $this->logMessage('Applying database migration 8.0.0.2 -> 8.0.0.3.');
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
            $this->logMessage('Applying database migration 8.0.0.3 -> 8.0.0.4.');
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


        //2026-07-27
        if ($version == '8.0.0.4') {
            $this->logMessage('Applying database migration 8.0.0.4 -> 8.0.0.5.');
            $sql = "INSERT INTO pkg_module (text,module,icon_cls,id_module,priority) SELECT 't(''Call diagnostics'')','callDiagnostic','x-fa fa-stethoscope',12,99 WHERE NOT EXISTS (SELECT 1 FROM pkg_module WHERE module='callDiagnostic');";
            $this->executeDB($sql);

            $sql = "INSERT INTO pkg_group_module (id_group,id_module,action,show_menu,createShortCut,createQuickStart)
                SELECT 1,m.id,'r',0,0,0 FROM pkg_module m
                WHERE m.module='callDiagnostic'
                AND NOT EXISTS (
                    SELECT 1 FROM pkg_group_module gm WHERE gm.id_group=1 AND gm.id_module=m.id
                )";
            $this->executeDB($sql);
            $version = '8.0.0.5';
            $this->update($version);
        }

        //2026-07-29
        if ($version == '8.0.0.5') {
            $this->logMessage('Applying database migration 8.0.0.5 -> 8.0.0.6.');
            $affected = $this->executeDB(
                "UPDATE pkg_sip
                 SET insecure = 'port,invite'
                 WHERE LOWER(TRIM(COALESCE(host, ''))) NOT IN ('', 'dynamic')
                   AND TRIM(COALESCE(secret, '')) = ''
                   AND LOWER(COALESCE(insecure, '')) NOT LIKE '%invite%'"
            );
            $this->logMessage(
                'Normalized ' . (int) $affected
                    . ' fixed-IP SIP account(s) for IP-only PJSIP authentication.'
            );
            $version = '8.0.0.6';
            $this->update($version);

            $this->logMessage('Regenerating PJSIP users after authentication migration.');
            AsteriskAccess::instance()->generateSipPeers();
        }

        //2026-07-31
        if ($version == '8.0.0.6') {
            $this->logMessage('Applying system migration 8.0.0.6 -> 8.0.0.7.');
            $changed = AsteriskModulesConfig::ensureNoload(
                '/etc/asterisk/modules.conf',
                'res_pjsip_endpoint_identifier_anonymous.so'
            );
            $this->logMessage(
                $changed
                    ? 'Disabled the anonymous PJSIP endpoint identifier in modules.conf. Restart Asterisk to apply this change.'
                    : 'The anonymous PJSIP endpoint identifier was already disabled in modules.conf.'
            );
            $version = '8.0.0.7';
            $this->update($version);
        }

        //2026-08-05
        if ($version == '8.0.0.7') {
            $this->logMessage('Applying database migration 8.0.0.7 -> 8.0.0.8.');
            if (! $this->columnExists('pkg_sipura', 'provision_token_hash')) {
                $this->executeDB(
                    "ALTER TABLE `pkg_sipura` ADD `provision_token_hash` CHAR(64) NOT NULL DEFAULT '' AFTER `macadr`"
                );
            }
            if (! $this->columnExists('pkg_sipura', 'provision_token_created_at')) {
                $this->executeDB(
                    'ALTER TABLE `pkg_sipura` ADD `provision_token_created_at` DATETIME NULL DEFAULT NULL AFTER `provision_token_hash`'
                );
            }
            if (! $this->indexExists('pkg_sipura', 'idx_pkg_sipura_provision')) {
                $this->executeDB(
                    'ALTER TABLE `pkg_sipura` ADD KEY `idx_pkg_sipura_provision` (`macadr`, `provision_token_hash`)'
                );
            }
            // Existing rows intentionally receive no token. MAC-only provisioning is
            // disabled until an administrator rotates the token and updates the ATA.
            $version = '8.0.0.8';
            $this->update($version);
        }

        //2026-08-12
        if ($version == '8.0.0.8') {
            $this->logMessage('Applying database migration 8.0.0.8 -> 8.0.0.9.');
            $this->executeDB(
                "INSERT INTO pkg_configuration
                    (config_title, config_key, config_value, config_description, config_group_title, status)
                 SELECT 'Disable mobile template', 'disable_mobile_template', '0',
                    'Set to 1 to always use the desktop template on mobile devices.', 'global', 1
                 FROM DUAL
                 WHERE NOT EXISTS (
                    SELECT 1 FROM pkg_configuration WHERE config_key = 'disable_mobile_template'
                 )"
            );
            $version = '8.0.0.9';
            $this->update($version);
        }

                //2026-08-14
        if ($version == '8.0.0.9') {
            $this->logMessage('Applying database migration 8.0.0.9 -> 8.0.0.10.');
            $this->executeDB(
                "CREATE TABLE IF NOT EXISTS pkg_trace (
                id int(11) NOT NULL AUTO_INCREMENT,
                filter varchar(50) NOT NULL,
                status tinyint(1) NOT NULL DEFAULT '1',
                timeout int(11) NOT NULL DEFAULT '60',
                in_use tinyint(1) DEFAULT NULL,
                port varchar(7) NOT NULL DEFAULT '5060',
                PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
            );  

           $WAN_IF = trim(shell_exec(
                "ip -4 route show default | awk '{for(i=1;i<=NF;i++) if(\$i==\"dev\"){print \$(i+1); exit}}'"
            ));

            $command = 'php /var/www/html/mbilling/cron.php SipTrace';

            $cronLine = '*/2 * * * * root flock -n /tmp/siptrace.lock '
                    . $command
                    . ($WAN_IF !== '' ? ' ' . $WAN_IF : '');

            exec(
                "grep -F " . escapeshellarg($command) . " /etc/crontab "
                . "| grep -qv '^[[:space:]]*#' "
                . "|| printf '%s\n' " . escapeshellarg($cronLine)
                . " >> /etc/crontab"
            );
       
            $version = '8.0.0.10';
            $this->update($version);
        }

        //2026-08-15
        if ($version == '8.0.0.10') {
            $this->logMessage('Applying database migration 8.0.0.10 -> 8.0.0.11.');
            $this->executeDB(
                "INSERT INTO pkg_configuration
                    (config_title, config_key, config_value, config_description, config_group_title, status)
                 SELECT 'GitHub star prompt dismissed', 'github_star_prompt_dismissed', '0',
                    'Internal flag set after an administrator confirms support on GitHub.', 'global', 0
                 FROM DUAL
                 WHERE NOT EXISTS (
                    SELECT 1 FROM pkg_configuration WHERE config_key = 'github_star_prompt_dismissed'
                 )"
            );
            $version = '8.0.0.11';
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

    private function rowExists($table, $column, $value)
    {
        $command = Yii::app()->db->createCommand(
            'SELECT COUNT(*) FROM `' . $table . '` WHERE `' . $column . '` = :value'
        );
        $command->bindValue(':value', $value, PDO::PARAM_INT);
        return (int) $command->queryScalar() > 0;
    }

    /**
     * Convert only legacy technology tokens. SIP usernames, table names, and
     * arbitrary descriptions must remain unchanged.
     */
    private function migrateLegacySipReferences()
    {
        $references = [
            ['pkg_did_destination', 'destination', ['SIP/', 'sip/', 'Sip/']],
            ['pkg_campaign', 'forward_number', ['SIP|', 'sip|', 'Sip|', 'SIP/', 'sip/', 'Sip/']],
        ];

        foreach ($references as $reference) {
            [$table, $column, $tokens] = $reference;
            $expression = '`' . $column . '`';
            foreach ($tokens as $token) {
                $replacement = strpos($token, '|') !== false
                    ? 'pjsip|'
                    : (substr($token, -1) === ':' ? 'pjsip:' : 'PJSIP/');
                $expression = 'REPLACE(' . $expression . ', ' .
                    Yii::app()->db->quoteValue($token) . ', ' .
                    Yii::app()->db->quoteValue($replacement) . ')';
            }

            $affected = $this->executeDB(
                'UPDATE `' . $table . '` SET `' . $column . '` = ' . $expression .
                    ' WHERE `' . $column . '` IS NOT NULL AND `' . $column . '` <> ' . $expression
            );
            $this->logMessage('Converted ' . (int) $affected . ' legacy SIP reference(s) in ' . $table . '.' . $column . '.');
        }

        // pkg_sip is still the MBilling table name in version 8. It has no
        // pkg_sip technology column; sip_config is the only free-text field
        // where a legacy SIP dial/URI token may need conversion.
        if ($this->columnExists('pkg_sip', 'sip_config')) {
            $tokens = ['SIP/', 'sip/', 'Sip/'];
            $expression = '`sip_config`';
            foreach ($tokens as $token) {
                $replacement = substr($token, -1) === ':' ? 'pjsip:' : 'PJSIP/';
                $expression = 'REPLACE(' . $expression . ', ' .
                    Yii::app()->db->quoteValue($token) . ', ' .
                    Yii::app()->db->quoteValue($replacement) . ')';
            }

            $affected = $this->executeDB(
                'UPDATE `pkg_sip` SET `sip_config` = ' . $expression .
                    ' WHERE `sip_config` IS NOT NULL AND `sip_config` <> ' . $expression
            );
            $this->logMessage('Converted ' . (int) $affected . ' legacy SIP reference(s) in pkg_sip.sip_config.');
        }
    }

    public function executeDB($sql)
    {
        try {
            return Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            $this->logMessage('Database migration failed: ' . $e->getMessage(), true);
            throw $e;
        }
    }

    public function update($version = '')
    {
        if (! preg_match('/^\d+\.\d+\.\d+\.\d+$/', $version)) {
            throw new InvalidArgumentException('Invalid MagnusBilling database version: ' . $version);
        }

        $command = Yii::app()->db->createCommand(
            "UPDATE pkg_configuration SET config_value = :version WHERE config_key = 'version'"
        );
        $command->bindValue(':version', $version, PDO::PARAM_STR);
        $command->execute();

        $storedVersion = Yii::app()->db->createCommand(
            "SELECT config_value FROM pkg_configuration WHERE config_key = 'version' LIMIT 1"
        )->queryScalar();

        if ($storedVersion !== $version) {
            throw new RuntimeException('Unable to persist database version ' . $version . '.');
        }

        $this->logMessage('Database version updated to ' . $version . '.');
    }

    private function logMessage($message, $error = false)
    {
        $stream = $error ? STDERR : STDOUT;
        fwrite($stream, '[UpdateMysql] ' . $message . PHP_EOL);
    }
}
