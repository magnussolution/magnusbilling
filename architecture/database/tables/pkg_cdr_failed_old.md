# pkg_cdr_failed_old

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_plan` | int(11) DEFAULT NULL |
| `id_trunk` | int(11) DEFAULT NULL |
| `id_prefix` | int(11) DEFAULT NULL |
| `sessionid` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `uniqueid` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `starttime` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `calledstation` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `sipiax` | int(11) DEFAULT '0' |
| `src` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `callerid` | varchar(40) DEFAULT NULL |
| `terminatecauseid` | int(1) DEFAULT '1' |
| `hangupcause` | int(11) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `id_user` (`id_user`) |
| KEY | `id_trunk` (`id_trunk`) |
| KEY | `calledstation` (`calledstation`) |
| KEY | `starttime` (`starttime`) |
