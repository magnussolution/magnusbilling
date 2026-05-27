# pkg_user

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `id_group` | int(11) NOT NULL |
| `id_group_agent` | int(11) DEFAULT NULL |
| `id_plan` | int(11) DEFAULT NULL |
| `id_offer` | int(11) DEFAULT NULL |
| `username` | varchar(20) NOT NULL |
| `password` | varchar(100) NOT NULL |
| `credit` | decimal(15,4) DEFAULT NULL |
| `active` | tinyint(1) DEFAULT NULL |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `firstusedate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `expirationdate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `enableexpire` | tinyint(1) DEFAULT '0' |
| `expiredays` | int(11) DEFAULT '0' |
| `lastname` | varchar(50) NOT NULL DEFAULT '' |
| `firstname` | varchar(50) NOT NULL DEFAULT '' |
| `address` | varchar(100) DEFAULT NULL |
| `city` | varchar(50) NOT NULL DEFAULT '' |
| `neighborhood` | varchar(50) DEFAULT NULL |
| `state` | varchar(50) NOT NULL DEFAULT '' |
| `country` | varchar(50) NOT NULL DEFAULT '' |
| `zipcode` | varchar(20) DEFAULT '' |
| `phone` | varchar(50) NOT NULL DEFAULT '' |
| `mobile` | varchar(20) DEFAULT '' |
| `email` | varchar(50) NOT NULL DEFAULT '' |
| `vat` | varchar(50) DEFAULT NULL |
| `company_name` | varchar(100) DEFAULT NULL |
| `company_website` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `state_number` | varchar(40) DEFAULT NULL |
| `lastuse` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `typepaid` | tinyint(1) DEFAULT '0' |
| `creditlimit` | int(11) NOT NULL DEFAULT '0' |
| `language` | char(5) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT 'en' |
| `redial` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `loginkey` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `last_notification` | timestamp NULL DEFAULT NULL |
| `credit_notification` | int(11) NOT NULL DEFAULT '10' |
| `restriction` | tinyint(4) NOT NULL DEFAULT '0' |
| `callingcard_pin` | int(6) NOT NULL |
| `prefix_local` | varchar(50) NOT NULL DEFAULT '' |
| `callshop` | varchar(20) DEFAULT '' |
| `plan_day` | tinyint(1) DEFAULT NULL |
| `record_call` | tinyint(1) NOT NULL DEFAULT '0' |
| `active_paypal` | tinyint(1) NOT NULL DEFAULT '0' |
| `boleto` | tinyint(1) NOT NULL DEFAULT '0' |
| `boleto_day` | smallint(2) DEFAULT NULL |
| `description` | varchar(100) DEFAULT NULL |
| `last_login` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `googleAuthenticator_enable` | tinyint(1) NOT NULL DEFAULT '0' |
| `google_authenticator_key` | varchar(50) NOT NULL DEFAULT '' |
| `doc` | varchar(50) DEFAULT NULL |
| `id_sacado_sac` | int(11) DEFAULT NULL |
| `disk_space` | int(10) NOT NULL DEFAULT '-1' |
| `sipaccountlimit` | int(10) NOT NULL DEFAULT '-1' |
| `calllimit` | int(10) NOT NULL DEFAULT '-1' |
| `cpslimit` | int(11) NOT NULL DEFAULT '-1' |
| `calllimit_error` | varchar(3) NOT NULL DEFAULT '503' |
| `mix_monitor_format` | varchar(5) DEFAULT 'gsm' |
| `transfer_show_selling_price` | tinyint(1) DEFAULT '0' |
| `transfer_bdservice_rate` | int(11) DEFAULT '0' |
| `transfer_dbbl_rocket_profit` | int(11) DEFAULT '0' |
| `transfer_bkash_profit` | int(11) DEFAULT '0' |
| `transfer_flexiload_profit` | int(11) DEFAULT '0' |
| `transfer_international_profit` | int(11) DEFAULT '0' |
| `transfer_dbbl_rocket` | tinyint(1) NOT NULL DEFAULT '0' |
| `transfer_bkash` | tinyint(1) DEFAULT '0' |
| `transfer_flexiload` | tinyint(1) DEFAULT '0' |
| `transfer_international` | tinyint(1) DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `callingcard_pin` (`callingcard_pin`) |
| KEY | `fk_pkg_group_user_pkg_user` (`id_group`) |
| KEY | `fk_pkg_plan_pkg_user` (`id_plan`) |
| KEY | `username` (`username`) |
| KEY | `fk_pkg_user_pkg_user` (`id_user`) |
| KEY | `fk_pkg_group_user_pkg_user_agent` (`id_group_agent`) |
| CONSTRAINT | `fk_pkg_group_user_pkg_user` FOREIGN KEY (`id_group`) REFERENCES `pkg_group_user` (`id`) |
| CONSTRAINT | `fk_pkg_group_user_pkg_user_agent` FOREIGN KEY (`id_group_agent`) REFERENCES `pkg_group_user` (`id`) |
| CONSTRAINT | `fk_pkg_plan_pkg_user` FOREIGN KEY (`id_plan`) REFERENCES `pkg_plan` (`id`) |
| CONSTRAINT | `fk_pkg_user_pkg_user` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
