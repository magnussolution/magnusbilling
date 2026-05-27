# pkg_cdr_archive

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_plan` | int(11) DEFAULT NULL |
| `id_trunk` | int(11) DEFAULT NULL |
| `id_did` | int(11) DEFAULT NULL |
| `id_offer` | int(11) DEFAULT '0' |
| `id_prefix` | int(11) DEFAULT NULL |
| `uniqueid` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `starttime` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `stoptime` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `sessiontime` | int(11) DEFAULT NULL |
| `calledstation` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `sessionbill` | float DEFAULT NULL |
| `sipiax` | int(11) DEFAULT '0' |
| `src` | varchar(40) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `buycost` | decimal(15,5) DEFAULT '0.00000' |
| `real_sessiontime` | int(11) DEFAULT NULL |
| `terminatecauseid` | int(1) DEFAULT '1' |
| `agent_bill` | decimal(15,5) DEFAULT '0.00000' |
| PRIMARY | KEY (`id`) |
