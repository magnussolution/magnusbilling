# pkg_phonebook

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `name` | char(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `description` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `status` | int(1) NOT NULL DEFAULT '1' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_phonebook` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_phonebook` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
