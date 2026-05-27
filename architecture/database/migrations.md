# Migration log extracted from UpdateMysqlCommand.php

## Version 7.0.0
```php

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
```

## Version 7.0.1
```php
            $sql = "ALTER TABLE `pkg_campaign` ADD `auto_reprocess` INT(11) NULL DEFAULT 0 ;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE  `pkg_cdr_summary_day_agent` ADD  `agent_bill` FLOAT NOT NULL DEFAULT  '0';
                    ALTER TABLE  `pkg_cdr_summary_day_agent` ADD  `agent_lucro` FLOAT NOT NULL DEFAULT  '0';";
            $this->executeDB($sql);

            $version = '7.0.2';
            $this->update($version);
        }

        //2019-11-23
```

## Version 7.0.2
```php

            $sql = "UPDATE pkg_plan SET `lcrtype` = '0' WHERE lcrtype != 2;
                    UPDATE pkg_plan SET `lcrtype` = '1' WHERE lcrtype = 2;";
            $this->executeDB($sql);

            $version = '7.0.3';
            $this->update($version);
        }

        //2019-12-04
```

## Version 7.0.3
```php
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

```

## Version 7.0.4
```php
            $sql = "ALTER TABLE `pkg_group_user` ADD `user_prefix` INT(11) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.0.5';
            $this->update($version);
        }
        //2020-01-17
```

## Version 7.0.5
```php
            $sql = "ALTER TABLE `pkg_sip` ADD `addparameter` VARCHAR(50) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.0.6';
            $this->update($version);
        }

        //2020-01-20
```

## Version 7.0.6
```php

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

```

## Version 7.0.7
```php
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
```

## Version 7.0.8
```php
            $sql = "UPDATE pkg_configuration SET config_key = 'delay_notifications' WHERE config_key = 'Low balance notification frequency';";
            $this->executeDB($sql);

            $version = '7.0.9';
            $this->update($version);
        }

```

## Version 7.0.9
```php
            $sql = "ALTER TABLE `pkg_servers` ADD `public_ip` VARCHAR(80) NULL DEFAULT NULL AFTER `host`;";
            $this->executeDB($sql);

            $version = '7.1.0';
            $this->update($version);
        }

```

## Version 7.1.0
```php
            $sql = " ALTER TABLE `pkg_campaign` ADD `max_frequency` INT(11) NOT NULL DEFAULT '0' AFTER `frequency`;";
            $this->executeDB($sql);

            $version = '7.1.1';
            $this->update($version);
        }

```

## Version 7.1.1
```php
            $sql = " ALTER TABLE  `pkg_sip` CHANGE  `accountcode`  `accountcode` VARCHAR( 30 ) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.1.2';
            $this->update($version);
        }

```

## Version 7.1.2
```php
            $sql = " ALTER TABLE pkg_queue_agent_status ADD UNIQUE `unique_index`(`agentName`, `id_queue`);";
            $this->executeDB($sql);

            $version = '7.1.3';
            $this->update($version);
        }

```

## Version 7.1.3
```php

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

```

## Version 7.1.4
```php

            $sql = "ALTER TABLE `pkg_trunk` CHANGE `secret` `secret` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
            ALTER TABLE `pkg_smtp` CHANGE `password` `password` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
            ";
            $this->executeDB($sql);

            $version = '7.1.5';
            $this->update($version);
        }

```

## Version 7.1.5
```php

            $sql = "ALTER TABLE `pkg_sip` ADD `amd` INT(11) NOT NULL DEFAULT '0'";
            $this->executeDB($sql);

            $version = '7.1.6';
            $this->update($version);
        }

```

## Version 7.1.6
```php

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

```

## Version 7.1.7
```php

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
```

## Version 7.1.8
```php

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'DIDWW CURRENCY CONVERTER', 'didww_curreny_converter', '0', 'DIDWW CURRENCY CONVERTER. Ex. 1 USD in your local currency is 3.25, so add here 3.25', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.1.9';
            $this->update($version);
        }

```

## Version 7.1.9
```php

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
```

## Version 7.2.0
```php

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

```

## Version 7.2.1
```php

            $sql = "ALTER TABLE `pkg_campaign` ADD `from` VARCHAR(20) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.2.2';
            $this->update($version);
        }

```

## Version 7.2.2
```php

            $sql = "UPDATE `pkg_method_pay` SET `showFields` = 'payment_method,show_name,id_user,country,active,min,max,username,pagseguro_TOKEN,P2P_RecipientKeyID' WHERE payment_method = 'molpay';";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_method_pay` CHANGE `P2P_RecipientKeyID` `P2P_RecipientKeyID` VARCHAR(100) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.2.3';
            $this->update($version);
        }

```

## Version 7.2.3
```php

            $sql = "ALTER TABLE `pkg_sms` ADD `from` varchar(16) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.2.4';
            $this->update($version);
        }
        //2020-06-08
```

## Version 7.2.4
```php

            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Signup: Allow multiples users with same DOC', 'signup_unique_doc', '1', 'Signup: Allow multiples users with same DOC', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.2.5';
            $this->update($version);
        }

        //2020-06-15
```

## Version 7.2.5
```php

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
```

## Version 7.3.0
```php
            $sql = " ALTER TABLE `pkg_rate_provider` ADD INDEX(`id_prefix`);";
            $this->executeDB($sql);

            $version = '7.3.1';
            $this->update($version);
        }

        //2020-07-11
```

## Version 7.3.1
```php
            $sql = " INSERT INTO `pkg_configuration` (`id`, `config_title`, `config_key`, `config_value`, `config_description`, `config_group_title`, `status`) VALUES (NULL, 'Show the Campaign DashBoard to User', 'showMCDashBoard', '0', 'Show the Campaign DashBoard to User', 'global', '1');";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_sms` CHANGE `from` `sms_from` VARCHAR(16) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.3.2';
            $this->update($version);
        }

        //2020-07-20
```

## Version 7.3.2
```php
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
```

## Version 7.3.3
```php

            $sql = "ALTER TABLE `pkg_did_destination` ADD `context` TEXT NULL DEFAULT NULL AFTER `destination`;";
            $this->executeDB($sql);

            $version = '7.3.4';
            $this->update($version);
        }

        //2020-07-11
```

## Version 7.3.4
```php
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
```

## Version 7.3.5
```php

            $version = '7.3.6';
            $this->update($version);
        }

        //2020-07-28
```

## Version 7.3.6
```php

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
```

## Version 7.3.7
```php

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
```

## Version 7.3.8
```php

            $sql = "ALTER TABLE `pkg_status_system` ADD `cps` INT(11) NOT NULL DEFAULT '0' ;";
            $this->executeDB($sql);

            $version = '7.3.9';
            $this->update($version);
        }

        //2020-08-17
```

## Version 7.3.9
```php

            $sql = "UPDATE `pkg_module` SET text = 't(''Restrict Phone'')' WHERE module = 'campaignrestrictphone';";
            $this->executeDB($sql);

            $version = '7.4.0';
            $this->update($version);
        }

        //2020-08-18
```

## Version 7.4.0
```php

            $sql = " UPDATE `pkg_did` SET expression_1 = '.*' WHERE expression_1 = '*';
            UPDATE `pkg_did` SET expression_2 = '.*' WHERE expression_2 = '*';
            UPDATE `pkg_did` SET expression_3 = '.*' WHERE expression_3 = '*';";
            $this->executeDB($sql);

            $version = '7.4.1';
            $this->update($version);
        }

        //2020-08-18
```

## Version 7.4.1
```php

            $sql = " UPDATE `pkg_module` SET text = 't(''Fail2ban'')' WHERE text = 't(''Firewall'')';";
            $this->executeDB($sql);

            $version = '7.4.2';
            $this->update($version);
        }
        //2020-08-19
```

## Version 7.4.2
```php

            $sql = "DELETE FROM `pkg_group_module` WHERE id_module = (SELECT id FROM pkg_module WHERE module = 'boleto');
            DELETE FROM  pkg_module WHERE module = 'boleto';";
            $this->executeDB($sql);

            $version = '7.4.3';
            $this->update($version);
        }
        //2020-08-19
```

## Version 7.4.3
```php

            $sql = "ALTER TABLE `pkg_callerid` ADD `name` VARCHAR(100) NOT NULL DEFAULT '' AFTER `cid`;";
            $this->executeDB($sql);

            $version = '7.4.4';
            $this->update($version);
        }
        //2020-08-25
```

## Version 7.4.4
```php

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

```

## Version 7.4.5
```php

            $sql = "ALTER TABLE `pkg_templatemail` ADD `status` INT(11) NOT NULL DEFAULT '1'; ";
            $this->executeDB($sql);

            $sql = 'UPDATE `pkg_templatemail` SET messagehtml = REPLACE(messagehtml, "$dias_vencimento$", "$days_to_pay$"") WHERE `mailtype` LIKE "plan_unpaid";';
            $this->executeDB($sql);

            $version = '7.4.6';
            $this->update($version);
        }

        //2020-08-26
```

## Version 7.4.6
```php

            $sql = "ALTER TABLE `pkg_queue_member` CHANGE `uniqueid` `id` INT(11) NOT NULL AUTO_INCREMENT;
            ALTER TABLE `pkg_queue_member` ADD `uniqueid` INT(11) NULL DEFAULT NULL AFTER `id`;
            UPDATE `pkg_queue_member` SET uniqueid=id;";
            $this->executeDB($sql);

            $version = '7.4.7';
            $this->update($version);
        }

        //2020-09-10
```

## Version 7.4.7
```php

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
```

## Version 7.5.0
```php

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
```

## Version 7.5.1
```php

            $sql = " ALTER TABLE `pkg_method_pay` CHANGE `pagseguro_TOKEN` `pagseguro_TOKEN` VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL; ";
            $this->executeDB($sql);

            $version = '7.5.2';
            $this->update($version);
        }

        //2020-10-08
```

## Version 7.5.2
```php

            $sql = "ALTER TABLE `pkg_callerid`
            ADD COLUMN `description` MEDIUMTEXT CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.5.3';
            $this->update($version);
        }

        //2020-10-08
```

## Version 7.5.3
```php

            $sql = "ALTER TABLE `pkg_user`
            ADD COLUMN `commercial_name` VARCHAR(100) NULL DEFAULT NULL AFTER `company_name`;";
            $this->executeDB($sql);

            $version = '7.5.4';
            $this->update($version);
        }

        //2020-12-01
```

## Version 7.5.4
```php

            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'Login header', 'login_header', 'Log in', 'Login header', 'global', '1');

                ";
            $this->executeDB($sql);

            $version = '7.5.5';
            $this->update($version);
        }

        //2020-12-22
```

## Version 7.5.5
```php

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
```

## Version 7.5.6
```php

            $sql = "UPDATE  pkg_configuration SET status = 1 WHERE config_key = 'apply_local_prefix_did_sip' ";
            $this->executeDB($sql);

            $version = '7.5.7';
            $this->update($version);
        }

        //2021-01-02
```

## Version 7.5.7
```php

            $sql = "ALTER TABLE `pkg_group_user` ADD `hidden_prices` TINYINT(1) NOT NULL DEFAULT '0'";
            $this->executeDB($sql);

            $version = '7.5.8';
            $this->update($version);
        }

        //2021-01-03
```

## Version 7.5.8
```php

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
```

## Version 7.5.9
```php

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

```

## Version 7.6.0
```php

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
```

## Version 7.6.1
```php

            $sql = "ALTER TABLE `pkg_phonenumber` ADD `doc` VARCHAR(200) NULL DEFAULT NULL AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.6.2';
            $this->update($version);
        }

        //2021-01-21
```

## Version 7.6.2
```php

            $sql = "ALTER TABLE `pkg_phonenumber` ADD `email` VARCHAR(200) NULL DEFAULT NULL AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.6.3';
            $this->update($version);
        }

        //2021-03-05
```

## Version 7.6.3
```php

            $sql = " INSERT INTO `pkg_configuration`  VALUES
                (NULL, 'Record all calls', 'global_record_calls', '0', '0=Disable \n1=Enable\n Record all calls, the fields record calls will be hidden if this option is activated.', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.6.4';
            $this->update($version);
        }

        //2021-03-18
```

## Version 7.6.4
```php

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

```

## Version 7.6.8
```php
            $sql = "INSERT INTO pkg_configuration VALUES (NULL, 'Default prefix rule', 'default_prefix_rule', '', 'This rule will be used when you create a new user or on the Sign up  form. More details about prefix rule on the bellow link https://www.magnusbilling.org/local_prefix', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.6.9';
            $this->update($version);
        }

        //2021-06-18
```

## Version 7.6.9
```php
            $sql = "ALTER TABLE `pkg_offer` ADD `initblock` INT(11) NOT NULL DEFAULT '60' , ADD `billingblock` INT(11) NOT NULL DEFAULT '60' ;";
            $this->executeDB($sql);

            $version = '7.7.0';
            $this->update($version);
        }

        //2021-06-23
```

## Version 7.7.0
```php
            $sql = "ALTER TABLE `pkg_offer` ADD `minimal_time_charge` INT(2) NOT NULL DEFAULT '0';";
            $this->executeDB($sql);

            $version = '7.7.1';
            $this->update($version);
        }

        //2021-07-28
```

## Version 7.7.1
```php
            $sql = "ALTER TABLE `pkg_user` ADD `dist` VARCHAR(100) NULL DEFAULT NULL AFTER `state_number`, ADD `contract_value` DOUBLE NOT NULL DEFAULT '0' AFTER `dist`;;";
            $this->executeDB($sql);

            $version = '7.7.2';
            $this->update($version);
        }

        //2021-07-28
```

## Version 7.7.2
```php
            $sql = "ALTER TABLE `pkg_user` CHANGE `contract_value` `contract_value` INT(11) NULL DEFAULT '0';";
            $this->executeDB($sql);

            $version = '7.7.3';
            $this->update($version);
        }

        //2021-07-28
```

## Version 7.7.3
```php
            $sql = "ALTER TABLE `pkg_campaign` ADD `callerid` VARCHAR(100) NULL DEFAULT '' AFTER `name`;";
            $this->executeDB($sql);

            $version = '7.7.4';
            $this->update($version);
        }

        //2021-08-27
```

## Version 7.7.4
```php
            $sql = "ALTER TABLE `pkg_refill` ADD `image` VARCHAR(100) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.7.5';
            $this->update($version);
        }

        //2021-08-27
```

## Version 7.7.5
```php
            $sql = " INSERT INTO `pkg_configuration` (`id`, `config_title`, `config_key`, `config_value`, `config_description`, `config_group_title`, `status`) VALUES (NULL, 'Delete CDR archived prior X month', 'delete_cdr_archived_prior_x_month', '0', 'Delete CDR archived prior X monthr', 'global', '1'),(NULL, 'Delete CDR failed archived prior X month', 'delete_cdr_failed_archived_prior_x_month', '0', 'Delete CDR failed archived prior X month', 'global', '1');";
            $this->executeDB($sql);
            $version = '7.7.6';
            $this->update($version);
        }

        //2021-10-22
```

## Version 7.7.6
```php
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
```

## Version 7.7.7
```php
            $sql = " INSERT INTO `pkg_configuration` VALUES (NULL, 'Charge the DID if client have enough credit before the due date', 'charge_did_before_due_date', '1', 'Charge the DID if client have enough credit before the due date', 'global', '1');";
            $this->executeDB($sql);
            $version = '7.7.8';
            $this->update($version);
        }

        //2021-10-26
```

## Version 7.7.8
```php
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
```

## Version 7.7.9
```php
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
```

## Version 7.8.0.0
```php
            $sql = "ALTER TABLE `pkg_sip` ADD `sip_config` TEXT NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.0.1';
            $this->update($version);
        }
        //2022-01-19
```

## Version 7.8.0.1
```php
            $sql = "ALTER TABLE `pkg_sip` ADD `description` VARCHAR(150) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.0.2';
            $this->update($version);
        }

        //2022-01-19
```

## Version 7.8.0.2
```php
            $sql = "ALTER TABLE `pkg_user` ADD `restriction_use` int(11)  NOT NULL DEFAULT '1'";
            $this->executeDB($sql);

            $version = '7.8.0.3';
            $this->update($version);
        }

        //2022-02-14
```

## Version 7.8.0.3
```php
            $sql = "ALTER TABLE `pkg_sms` CHANGE `result` `status` INT(11) NOT NULL DEFAULT '0';
            ALTER TABLE `pkg_sms` ADD `result` VARCHAR(500) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.0.4';
            $this->update($version);
        }

        //2022-02-14
```

## Version 7.8.0.4
```php
            $sql = "ALTER TABLE `pkg_user` CHANGE `description` `description` VARCHAR(500) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.0.5';
            $this->update($version);
        }

        //2022-02-17
```

## Version 7.8.0.5
```php
            $sql = "ALTER TABLE `pkg_sip` ADD `id_trunk_group` INT(11) NULL DEFAULT NULL ;";
            Yii::app()->db->createCommand($sql)->execute();

            $version = '7.8.0.6';
            $this->update($version);
        }

        //2022-02-18
```

## Version 7.8.0.6
```php

            $sql = "ALTER TABLE `pkg_group_user` ADD `hidden_batch_update` TINYINT(1) NOT NULL DEFAULT '0'";
            $this->executeDB($sql);

            $version = '7.8.0.7';
            $this->update($version);
        }

        //2022-04-15
```

## Version 7.8.0.7
```php
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
```

## Version 7.8.0.8
```php

            $sql = "ALTER TABLE `pkg_services_use` CHANGE `contract_period` `contract_period` DATE NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_services_use` ADD `termination_date` DATE NULL DEFAULT NULL AFTER `releasedate`;";
            $this->executeDB($sql);

            $version = '7.8.0.9';
            $this->update($version);
        }

        //2022-04-27
```

## Version 7.8.0.9
```php

            $sql = "ALTER TABLE `pkg_restrict_phone` CHANGE `number` `number` VARCHAR(20) NOT NULL;";
            $this->executeDB($sql);

            $version = '7.8.1.0';
            $this->update($version);
        }

        //2022-05-05
```

## Version 7.8.1.0
```php

            $sql = "ALTER TABLE `pkg_services_use` ADD `contract_period` DATETIME NULL DEFAULT NULL AFTER `releasedate`;";
            $this->executeDB($sql);

            $version = '7.8.1.1';
            $this->update($version);
        }

        //2022-05-13
```

## Version 7.8.1.1
```php
            $sql = "ALTER TABLE `pkg_method_pay` CHANGE `boleto_convenio` `boleto_convenio` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_banco` `boleto_banco` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_agencia` `boleto_agencia` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_conta_corrente` `boleto_conta_corrente` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_inicio_nosso_numeroa` `boleto_inicio_nosso_numeroa` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_carteira` `boleto_carteira` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_taxa` `boleto_taxa` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_instrucoes` `boleto_instrucoes` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_nome_emp` `boleto_nome_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_end_emp` `boleto_end_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_cidade_emp` `boleto_cidade_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_estado_emp` `boleto_estado_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, CHANGE `boleto_cpf_emp` `boleto_cpf_emp` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.1.2';
            $this->update($version);
        }

        //2022-05-23
```

## Version 7.8.1.2
```php
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
```

## Version 7.8.1.3
```php
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
```

## Version 7.8.1.4
```php

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
```

## Version 7.8.1.5
```php
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
```

## Version 7.8.1.6
```php
            $sql = "ALTER TABLE `pkg_user` CHANGE `contract_value` `contract_value` DECIMAL(15,5) NULL DEFAULT '0.00000'";
            $this->executeDB($sql);

            $version = '7.8.1.7';
            $this->update($version);
        }

        //2022-08-22
```

## Version 7.8.1.7
```php
            $sql = "ALTER TABLE `pkg_did` ADD `country` VARCHAR(50) NOT NULL DEFAULT ''";
            $this->executeDB($sql);

            $version = '7.8.1.8';
            $this->update($version);
        }

        //2022-08-29
```

## Version 7.8.1.8
```php
            $sql = "ALTER TABLE `pkg_offer` ADD `id_user` INT(11) NULL DEFAULT NULL AFTER `id`;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_offer` ADD  CONSTRAINT `fk_pkg_user_pkg_offer` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE";
            $this->executeDB($sql);

            $version = '7.8.1.9';
            $this->update($version);
        }

        //2022-09-07
```

## Version 7.8.1.9
```php
            $sql = "ALTER TABLE `pkg_rate_agent` ADD `package_offer` TINYINT(1) NOT NULL DEFAULT '0' AFTER `minimal_time_charge`;";
            $this->executeDB($sql);

            $version = '7.8.2.0';
            $this->update($version);
        }

        //2022-09-26
```

## Version 7.8.2.0
```php
            $sql = "ALTER TABLE `pkg_campaign_restrict_phone` ADD `description` VARCHAR(100) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.8.2.1';
            $this->update($version);
        }

        //2022-09-26
```

## Version 7.8.2.1
```php
            $sql = "ALTER TABLE `pkg_trunk_group_trunk` ADD `weight` INT(11) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_trunk_group` ADD `weight` VARCHAR(100) NULL DEFAULT NULL ;";
            $this->executeDB($sql);

            $version = '7.8.2.2';
            $this->update($version);
        }

        //2022-10-07
```

## Version 7.8.2.2
```php
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
```

## Version 7.8.2.3
```php
            $sql = "ALTER TABLE `pkg_user` CHANGE `contract_value` `contract_value` FLOAT(11) NULL DEFAULT '0.00000';";
            $this->executeDB($sql);

            $version = '7.8.2.4';
            $this->update($version);
        }

        //2022-11-05
```

## Version 7.8.2.4
```php
            $sql = "ALTER TABLE `pkg_trunk` ADD `cid_add` VARCHAR(11) NOT NULL DEFAULT '' , ADD `cid_remove` VARCHAR(11) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.8.2.5';
            $this->update($version);
        }

        //2022-11-28
```

## Version 7.8.2.5
```php

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
```

## Version 7.8.2.6
```php
            $sql = "ALTER TABLE `pkg_did` ADD `id_server` INT(11) NULL DEFAULT NULL AFTER `id_user`;";
            $this->executeDB($sql);

            $version = '7.8.2.7';
            $this->update($version);
        }

        //2022-12-27
```

## Version 7.8.2.7
```php
            $sql = "ALTER TABLE `pkg_alarm` ADD `last_notification` TIMESTAMP NOT NULL DEFAULT '0000-00-00' AFTER `email`;";
            $this->executeDB($sql);

            $version = '7.8.2.8';
            $this->update($version);
        }
        //2022-12-28
```

## Version 7.8.2.8
```php
            $sql = "ALTER TABLE `pkg_did_use` ADD `next_due_date` VARCHAR(30) NULL DEFAULT '' AFTER `reminded`;";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_services_use` ADD `next_due_date` VARCHAR(30) NULL DEFAULT ''";
            $this->executeDB($sql);

            $version = '7.8.2.9';
            $this->update($version);
        }

        //2023-01-10
```

## Version 7.8.2.9
```php
            $sql = "INSERT INTO `pkg_method_pay` (`id`, `id_user`, `payment_method`, `show_name`, `country`, `active`, `active_agent`, `obs`, `url`, `username`, `pagseguro_TOKEN`, `fee`, `boleto_convenio`, `boleto_banco`, `boleto_agencia`, `boleto_conta_corrente`, `boleto_inicio_nosso_numeroa`, `boleto_carteira`, `boleto_taxa`, `boleto_instrucoes`, `boleto_nome_emp`, `boleto_end_emp`, `boleto_cidade_emp`, `boleto_estado_emp`, `boleto_cpf_emp`, `P2P_CustomerSiteID`, `P2P_KeyID`, `P2P_Passphrase`, `P2P_RecipientKeyID`, `P2P_tax_amount`, `client_id`, `client_secret`, `SLAppToken`, `SLAccessToken`, `SLSecret`, `SLIdProduto`, `SLvalidationtoken`, `min`, `max`, `showFields`) VALUES
(NULL, 1, 'Custom', 'Custom Method', 'Global', 0, 0, NULL, '', '', '', 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 10, 'payment_method,show_name,id_user,country,active,min,max,min,max,username,url');";
            $this->executeDB($sql);

            $version = '7.8.3.0';
            $this->update($version);
        }

        //2023-01-14
```

## Version 7.8.3.0
```php
            $sql = "ALTER TABLE `pkg_alarm` ADD `subject` VARCHAR(200) NOT NULL DEFAULT 'MagnusBilling ALARM' AFTER `last_notification`, ADD `message` VARCHAR(1000) NOT NULL DEFAULT 'MagnusBilling ALARM email body, customize' AFTER `subject`;";
            $this->executeDB($sql);

            $version = '7.8.3.1';
            $this->update($version);
        }

        //2023-02-21
```

## Version 7.8.3.1
```php
            $sql = " INSERT INTO `pkg_configuration`  VALUES (NULL, 'Allow login on webpanel with SIP user and password', 'sipuser_login', '1', 'Allow login on webpanel with SIP user and password', 'global', '1');";
            $this->executeDB($sql);

            $version = '7.8.3.2';
            $this->update($version);
        }

        //2023-03-14
```

## Version 7.8.3.2
```php
            $sql = "ALTER TABLE `pkg_user` ADD `email2` VARCHAR(100) NOT NULL DEFAULT '' AFTER `email`; ";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_user` CHANGE `email` `email` VARCHAR(100) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.8.3.3';
            $this->update($version);
        }

        //2023-03-14
```

## Version 7.8.3.3
```php
            $sql = "ALTER TABLE `pkg_user` ADD `email_services` INT(11) NOT NULL DEFAULT '1' , ADD `email_did` INT(11) NOT NULL DEFAULT '1' AFTER `email_services`;";
            $this->executeDB($sql);

            $version = '7.8.3.4';
            $this->update($version);
        }

        //2023-03-14
```

## Version 7.8.3.4
```php
            $version = '7.8.3.5';
            $this->update($version);
        }

        //2023-04-21
```

## Version 7.8.3.5
```php
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
```

## Version 7.8.3.6
```php
            $sql = "ALTER TABLE `pkg_method_pay` CHANGE `username` `username` VARCHAR(1000) NOT NULL";
            $this->executeDB($sql);

            $sql = "UPDATE pkg_method_pay SET username = CONCAT('BTC(BTC)=>',username) WHERE payment_method = 'cryptocurrency';";
            $this->executeDB($sql);

            $version = '7.8.3.7';
            $this->update($version);
        }

        //2023-05-18
```

## Version 7.8.3.7
```php
            $sql = "ALTER TABLE `pkg_user` CHANGE `prefix_local` `prefix_local` VARCHAR(500) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.8.3.8';
            $this->update($version);
        }

        //2023-05-25
```

## Version 7.8.3.8
```php
            $sql = "ALTER TABLE `pkg_status_system` ADD `disk_free` INT(11) NULL DEFAULT NULL AFTER `cps`, ADD `disk_perc` INT(11) NULL DEFAULT NULL AFTER `disk_free`;";
            $this->executeDB($sql);

            $version = '7.8.3.9';
            $this->update($version);
        }

        //2023-06-26
```

## Version 7.8.3.9
```php
            $sql = "ALTER TABLE `pkg_servers` ADD `last_call` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP";
            $this->executeDB($sql);

            $sql = "ALTER TABLE `pkg_servers` ADD `last_call_id` INT(11) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.4.0';
            $this->update($version);
        }

        //2023-07-26
```

## Version 7.8.4.0
```php
            $sql = "ALTER TABLE pkg_trunk ADD block_cid VARCHAR(120) NOT NULL DEFAULT '' ;";
            $this->executeDB($sql);

            $version = '7.8.4.1';
            $this->update($version);
        }

        //2023-11-08
```

## Version 7.8.4.1
```php
            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'Disable CDR count', 'remove_count_cdr', '0', 'It will make the CDR more efficiency, particularly when utilizing filters', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.8.4.2';
            $this->update($version);
        }

        //2023-11-09
```

## Version 7.8.4.2
```php
            $sql = "ALTER TABLE `pkg_rate_provider` CHANGE `dialprefix` `dialprefix` VARCHAR(20) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.4.3';
            $this->update($version);
        }

        //2023-11-09
```

## Version 7.8.4.3
```php
            $sql = "ALTER TABLE `pkg_user` ADD `inbound_call_limit` INT NOT NULL DEFAULT '-1' AFTER `email_did`;";
            $this->executeDB($sql);

            $version = '7.8.4.4';
            $this->update($version);
        }
        //2024-01-22
```

## Version 7.8.4.4
```php
            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'Max call duration', 'max_call_duration', '3600', 'Maximum call duration in seconds', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.8.4.5';
            $this->update($version);
        }

        //2024-01-22
```

## Version 7.8.4.5
```php
            $sql = "INSERT INTO pkg_configuration VALUES
                (NULL, 'API allow multiple user/email', 'api_allow_same_ip', '0', 'Allow create muiltiple clients with same email via API', 'global', '1');
                ";
            $this->executeDB($sql);

            $version = '7.8.4.6';
            $this->update($version);
        }

        //2024-05-27
```

## Version 7.8.4.6
```php
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
```

## Version 7.8.4.7
```php
            $sql = "DELETE FROM pkg_group_module WHERE id_module = (SELECT id FROM pkg_module WHERE module = 'firewall')";
            $this->executeDB($sql);

            $sql = "DELETE FROM pkg_module WHERE module = 'firewall'";
            $this->executeDB($sql);

            $version = '7.8.4.8';
            $this->update($version);
        }

        //2024-12-17
```

## Version 7.8.4.8
```php
            $sql = "UPDATE `pkg_method_pay` SET `show_name` = 'EFI' , `payment_method` = 'EFI' WHERE `payment_method` = 'GerenciaNet'";
            $this->executeDB($sql);

            $version = '7.8.4.9';
            $this->update($version);
        }


        //2025-01-06
```

## Version 7.8.4.9
```php
            $sql = "ALTER TABLE pkg_trunk DROP FOREIGN KEY fk_pkg_trunk_pkg_trunk";
            $this->executeDB($sql);

            $version = '7.8.5.0';
            $this->update($version);
        }

        //2025-02-03
```

## Version 7.8.4.9
```php
            $sql = "ALTER TABLE `pkg_servers` CHANGE `last_call_id` `last_call_id` BIGINT(11) NULL DEFAULT NULL;";
            $this->executeDB($sql);

            $version = '7.8.5.0';
            $this->update($version);
        }

        //2025-03-10
```

## Version 7.8.5.0
```php
            $sql = "ALTER TABLE `pkg_sip` CHANGE `forward` `forward` VARCHAR(100) NOT NULL DEFAULT '';";
            $this->executeDB($sql);

            $version = '7.8.5.1';
            $this->update($version);
        }

        //2025-04-23
```

## Version 7.8.5.1
```php

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

```

## Version 7.8.5.2
```php
            $sql = "ALTER TABLE `pkg_sip` ADD UNIQUE(`name`);";
            $this->executeDB($sql);

            $version = '7.8.5.3';
            $this->update($version);
        }
        //2025-09-25
```

## Version 7.8.5.3
```php
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
```

## Version 7.8.5.4
```php
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
```

## Version 7.8.5.5
```php
            exec("echo 'noload => codec_silk.so' >> /etc/asterisk/modules.conf");
            $version = '7.8.5.6';
            $this->update($version);
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
```

