# pkg_group_module

| Column | Definition |
|---|---|
| `id_group` | int(11) NOT NULL |
| `id_module` | int(11) NOT NULL |
| `action` | varchar(45) NOT NULL |
| `show_menu` | tinyint(1) NOT NULL DEFAULT '1' |
| `createShortCut` | tinyint(1) NOT NULL DEFAULT '0' |
| `createQuickStart` | tinyint(1) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id_group`,`id_module`) |
| KEY | `fk_pkg_module_group_pkg_module` (`id_module`) |
| CONSTRAINT | `fk_pkg_group_user_pkg_group_module` FOREIGN KEY (`id_group`) REFERENCES `pkg_group_user` (`id`) |
| CONSTRAINT | `fk_pkg_module_group_pkg_module` FOREIGN KEY (`id_module`) REFERENCES `pkg_module` (`id`) |
