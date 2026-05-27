# pkg_offer_cdr

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_offer` | int(11) NOT NULL |
| `date_consumption` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `used_secondes` | int(11) NOT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `ind_pkg_offer_cdr_date_consumption` (`date_consumption`) |
| KEY | `fk_pkg_user_pkg_offer_cdr` (`id_user`) |
| KEY | `fk_pkg_offer_pkg_offer_cdr` (`id_offer`) |
| CONSTRAINT | `fk_pkg_offer_pkg_offer_cdr` FOREIGN KEY (`id_offer`) REFERENCES `pkg_offer` (`id`) |
| CONSTRAINT | `fk_pkg_user_pkg_offer_cdr` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
