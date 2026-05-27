# pkg_rate_callshop

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `dialprefix` | char(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `destination` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `buyrate` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `minimo` | int(10) NOT NULL DEFAULT '1' |
| `block` | int(10) NOT NULL DEFAULT '1' |
| `minimal_time_charge` | int(11) DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `dialprefix` (`dialprefix`) |
| KEY | `fk_pkg_user_pkg_rate_callshop` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_rate_callshop` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
