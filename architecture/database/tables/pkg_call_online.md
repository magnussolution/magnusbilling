# pkg_call_online

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `uniqueid` | varchar(25) DEFAULT NULL |
| `sip_account` | varchar(50) DEFAULT NULL |
| `id_user` | int(11) DEFAULT NULL |
| `canal` | varchar(50) DEFAULT NULL |
| `tronco` | varchar(50) DEFAULT NULL |
| `ndiscado` | varchar(25) DEFAULT '0' |
| `codec` | varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `status` | varchar(16) NOT NULL |
| `duration` | int(11) NOT NULL DEFAULT '0' |
| `reinvite` | varchar(5) NOT NULL |
| `from_ip` | varchar(50) DEFAULT NULL |
| `server` | varchar(50) NOT NULL DEFAULT '' |
| PRIMARY | KEY (`id`) |
| KEY | `starttime` (`status`) |
| KEY | `fk_pkg_user_pkg_call_online` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_call_online` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
