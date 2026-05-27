# pkg_ivr

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_did` | int(11) DEFAULT NULL |
| `name` | varchar(50) NOT NULL |
| `monFriStart` | varchar(200) NOT NULL DEFAULT '09:00-12:00|14:00-18:00' |
| `satStart` | varchar(200) NOT NULL DEFAULT '09:00-12:00' |
| `sunStart` | varchar(200) NOT NULL DEFAULT '00:00' |
| `option_0` | varchar(50) DEFAULT NULL |
| `option_1` | varchar(50) DEFAULT NULL |
| `option_2` | varchar(50) DEFAULT NULL |
| `option_3` | varchar(50) DEFAULT NULL |
| `option_4` | varchar(50) DEFAULT NULL |
| `option_5` | varchar(50) DEFAULT NULL |
| `option_6` | varchar(50) DEFAULT NULL |
| `option_7` | varchar(50) DEFAULT NULL |
| `option_8` | varchar(50) DEFAULT NULL |
| `option_9` | varchar(50) DEFAULT NULL |
| `option_10` | varchar(50) DEFAULT NULL |
| `direct_extension` | tinyint(1) DEFAULT '0' |
| `workaudio` | varchar(100) DEFAULT NULL |
| `noworkaudio` | varchar(100) DEFAULT NULL |
| `option_out_0` | varchar(50) DEFAULT NULL |
| `option_out_1` | varchar(50) DEFAULT NULL |
| `option_out_2` | varchar(50) DEFAULT NULL |
| `option_out_3` | varchar(50) DEFAULT NULL |
| `option_out_4` | varchar(50) DEFAULT NULL |
| `option_out_5` | varchar(50) DEFAULT NULL |
| `option_out_6` | varchar(50) DEFAULT NULL |
| `option_out_7` | varchar(50) DEFAULT NULL |
| `option_out_8` | varchar(50) DEFAULT NULL |
| `option_out_9` | varchar(50) DEFAULT NULL |
| `option_out_10` | varchar(50) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_ivr` (`id_user`) |
| KEY | `fk_pkg_did_pkg_ivr` (`id_did`) |
| CONSTRAINT | `fk_pkg_user_pkg_ivr` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
