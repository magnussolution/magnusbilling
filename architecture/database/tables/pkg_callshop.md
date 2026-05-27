# pkg_callshop

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `sessionid` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `id_user` | int(11) NOT NULL |
| `status` | tinyint(1) NOT NULL DEFAULT '0' |
| `buycost` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `price` | decimal(15,5) NOT NULL |
| `price_min` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `calledstation` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `destination` | varchar(100) DEFAULT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |
| `sessiontime` | int(11) NOT NULL |
| `cabina` | varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `markup` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| PRIMARY | KEY (`id`) |
| KEY | `cabina` (`cabina`) |
| KEY | `fk_pkg_user_pkg_callshop` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_callshop` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
