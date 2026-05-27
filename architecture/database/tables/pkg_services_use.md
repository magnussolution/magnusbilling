# pkg_services_use

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `id_services` | int(11) NOT NULL |
| `reservationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `releasedate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `status` | int(11) DEFAULT '0' |
| `month_payed` | int(11) DEFAULT '0' |
| `reminded` | tinyint(4) NOT NULL DEFAULT '0' |
| `id_method` | int(11) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_services_use` (`id_user`) |
| KEY | `fk_pkg_services_pkg_services_use` (`id_services`) |
| CONSTRAINT | `fk_pkg_services_pkg_services_use` FOREIGN KEY (`id_services`) REFERENCES `pkg_services` (`id`) |
| CONSTRAINT | `fk_pkg_user_pkg_services_use` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
