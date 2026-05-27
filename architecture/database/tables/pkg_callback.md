# pkg_callback

| Column | Definition |
|---|---|
| `id` | int(20) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_did` | int(11) NOT NULL |
| `uniqueid` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `entry_time` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `status` | varchar(80) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `server_ip` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `num_attempt` | int(11) NOT NULL DEFAULT '0' |
| `last_attempt_time` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `manager_result` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `agi_result` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `callback_time` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `channel` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `exten` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `context` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `priority` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `application` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `data` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `timeout` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `callerid` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `variable` | varchar(300) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `account` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `async` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `actionid` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `id_server` | int(11) DEFAULT NULL |
| `id_server_group` | int(11) DEFAULT NULL |
| `sessiontime` | int(11) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `pkg_callback_uniqueid_key` (`uniqueid`) |
| KEY | `fk_pkg_user_pkg_callback` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_callback` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
