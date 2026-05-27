# pkg_user_rate

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_prefix` | int(11) NOT NULL |
| `rateinitial` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `initblock` | int(11) NOT NULL DEFAULT '0' |
| `billingblock` | int(11) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_user_rate` (`id_user`) |
| KEY | `fk_pkg_prefix_pkg_user_rate` (`id_prefix`) |
| CONSTRAINT | `fk_pkg_prefix_pkg_user_rate` FOREIGN KEY (`id_prefix`) REFERENCES `pkg_prefix` (`id`) |
| CONSTRAINT | `fk_pkg_user_pkg_user_rate` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
