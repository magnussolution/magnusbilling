# pkg_did

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `activated` | int(11) NOT NULL DEFAULT '1' |
| `reserved` | tinyint(11) DEFAULT '0' |
| `did` | char(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `callerid` | varchar(50) NOT NULL DEFAULT '' |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `startingdate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `expirationdate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| `secondusedreal` | int(11) DEFAULT '0' |
| `billingtype` | int(11) DEFAULT '0' |
| `cbr` | tinyint(1) NOT NULL DEFAULT '0' |
| `fixrate` | float NOT NULL DEFAULT '0' |
| `connection_charge` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `expression_1` | varchar(150) NOT NULL DEFAULT '*' |
| `selling_rate_1` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `expression_2` | varchar(150) NOT NULL DEFAULT '*' |
| `selling_rate_2` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `connection_sell` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `minimal_time_charge` | int(11) NOT NULL DEFAULT '0' |
| `initblock` | int(11) NOT NULL DEFAULT '1' |
| `cbr_ua` | tinyint(1) NOT NULL DEFAULT '0' |
| `cbr_em` | tinyint(1) NOT NULL DEFAULT '0' |
| `cbr_total_try` | int(11) NOT NULL DEFAULT '3' |
| `cbr_time_try` | int(11) NOT NULL DEFAULT '30' |
| `increment` | int(11) NOT NULL DEFAULT '1' |
| `block_expression_1` | smallint(2) NOT NULL DEFAULT '0' |
| `block_expression_2` | smallint(2) NOT NULL DEFAULT '0' |
| `expression_3` | varchar(150) NOT NULL DEFAULT '*' |
| `selling_rate_3` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `block_expression_3` | smallint(2) NOT NULL DEFAULT '0' |
| `charge_of` | int(1) NOT NULL DEFAULT '1' |
| `send_to_callback_1` | tinyint(1) NOT NULL DEFAULT '0' |
| `send_to_callback_2` | tinyint(1) NOT NULL DEFAULT '0' |
| `send_to_callback_3` | tinyint(1) NOT NULL DEFAULT '0' |
| `TimeOfDay_monFri` | varchar(150) DEFAULT NULL |
| `TimeOfDay_sat` | varchar(150) DEFAULT NULL |
| `TimeOfDay_sun` | varchar(150) DEFAULT NULL |
| `workaudio` | varchar(150) DEFAULT NULL |
| `noworkaudio` | varchar(150) DEFAULT NULL |
| `calllimit` | int(11) NOT NULL DEFAULT '-1' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `did` (`did`) |
| KEY | `fk_pkg_user_pkg_did` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_did` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
