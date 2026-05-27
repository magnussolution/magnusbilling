# pkg_group_user_group

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_group_user` | int(11) NOT NULL |
| `id_group` | int(11) NOT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_pkg_group_user_pkg_group` (`id_group_user`) |
| KEY | `fk_pkg_group_pkg_pkg_group_user_group` (`id_group`) |
| CONSTRAINT | `fk_pkg_group_pkg_pkg_group_user_group` FOREIGN KEY (`id_group`) REFERENCES `pkg_group_user` (`id`) ON DELETE CASCADE |
| CONSTRAINT | `fk_pkg_pkg_group_user_pkg_group` FOREIGN KEY (`id_group_user`) REFERENCES `pkg_group_user` (`id`) ON DELETE CASCADE |
