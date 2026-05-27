# pkg_cdr

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_plan` | int(11) DEFAULT NULL |
| `id_trunk` | int(11) DEFAULT NULL |
| `id_server` | int(11) DEFAULT NULL |
| `id_prefix` | int(11) DEFAULT NULL |
| `id_campaign` | int(11) DEFAULT NULL |
| `callerid` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' |
| `uniqueid` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `starttime` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `sessiontime` | int(11) DEFAULT NULL |
| `calledstation` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `sessionbill` | float DEFAULT NULL |
| `sipiax` | int(11) DEFAULT '0' |
| `src` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `buycost` | decimal(15,6) DEFAULT '0.000000' |
| `real_sessiontime` | int(11) DEFAULT NULL |
| `terminatecauseid` | int(1) DEFAULT '1' |
| `agent_bill` | decimal(15,6) DEFAULT '0.000000' |
| PRIMARY | KEY (`id`) |
| KEY | `id_user` (`id_user`) |
| KEY | `id_trunk` (`id_trunk`) |
| KEY | `id_prefix` (`id_prefix`) |
| KEY | `calledstation` (`calledstation`) |
| KEY | `src` (`src`) |
| KEY | `callerid` (`callerid`) |
| KEY | `starttime` (`starttime`) |
