# pkg_offer_use

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `id_offer` | int(11) NOT NULL |
| `reservationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `releasedate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `status` | int(11) DEFAULT '0' |
| `month_payed` | int(11) DEFAULT '0' |
| `reminded` | tinyint(4) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_offer_use` (`id_user`) |
| KEY | `fk_pkg_offer_pkg_offer_use` (`id_offer`) |
| CONSTRAINT | `fk_pkg_offer_pkg_offer_use` FOREIGN KEY (`id_offer`) REFERENCES `pkg_offer` (`id`) |
| CONSTRAINT | `fk_pkg_user_pkg_offer_use` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
