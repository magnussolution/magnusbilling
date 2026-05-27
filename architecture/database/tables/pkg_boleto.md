# pkg_boleto

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(20) NOT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `status` | varchar(4) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `payment` | varchar(10) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `vencimento` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_boleto` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_boleto` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
