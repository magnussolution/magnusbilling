# pkg_smtp

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `host` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `username` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `password` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `port` | varchar(10) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `encryption` | varchar(10) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_smtp` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_smtp` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
