# pkg_plan

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `name` | char(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `lcrtype` | int(11) NOT NULL DEFAULT '0' |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `removeinterprefix` | int(11) NOT NULL DEFAULT '1' |
| `signup` | int(11) NOT NULL DEFAULT '0' |
| `portabilidadeMobile` | tinyint(1) NOT NULL DEFAULT '0' |
| `portabilidadeFixed` | tinyint(1) NOT NULL DEFAULT '0' |
| `ini_credit` | decimal(10,5) NOT NULL DEFAULT '0.00000' |
| `techprefix` | varchar(7) NOT NULL DEFAULT '' |
| `play_audio` | smallint(1) NOT NULL DEFAULT '0' |
| `tariff_limit` | int(11) NOT NULL DEFAULT '3' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_plan` (`id_user`) |
| KEY | `id_user` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_plan` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
