# pkg_callerid

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `cid` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `id_user` | int(11) NOT NULL |
| `activated` | char(1) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 't' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `cons_pkg_callerid_cid` (`cid`) |
| KEY | `fk_pkg_user_pkg_callerid` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_callerid` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
