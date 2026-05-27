# pkg_trunk_group_trunk

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_trunk_group` | int(11) NOT NULL |
| `id_trunk` | int(11) NOT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `id_trunk_group` (`id_trunk_group`) |
| KEY | `id_trunk` (`id_trunk`) |
| CONSTRAINT | `fk_pkg_trunk_group_trunk_pkg_trunk` FOREIGN KEY (`id_trunk`) REFERENCES `pkg_trunk` (`id`) ON DELETE CASCADE |
| CONSTRAINT | `fk_pkg_trunk_group_trunk_pkg_trunk_group` FOREIGN KEY (`id_trunk_group`) REFERENCES `pkg_trunk_group` (`id`) ON DELETE CASCADE |
