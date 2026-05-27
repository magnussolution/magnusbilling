# pkg_phonenumber

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_phonebook` | int(11) NOT NULL |
| `number` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `name` | char(40) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `status` | smallint(6) NOT NULL DEFAULT '1' |
| `info` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| `try` | smallint(1) NOT NULL DEFAULT '0' |
| `city` | varchar(50) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_phonebook_pkg_phonenumber` (`id_phonebook`) |
| KEY | `number` (`number`) |
| CONSTRAINT | `fk_pkg_phonebook_pkg_phonenumber` FOREIGN KEY (`id_phonebook`) REFERENCES `pkg_phonebook` (`id`) ON DELETE CASCADE |
