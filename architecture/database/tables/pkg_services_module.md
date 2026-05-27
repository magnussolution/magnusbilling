# pkg_services_module

| Column | Definition |
|---|---|
| `id_services` | int(11) NOT NULL |
| `id_module` | int(11) NOT NULL |
| `action` | varchar(45) NOT NULL |
| `show_menu` | tinyint(1) NOT NULL DEFAULT '1' |
| `createShortCut` | tinyint(1) NOT NULL DEFAULT '0' |
| `createQuickStart` | tinyint(1) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id_services`,`id_module`) |
| KEY | `fk_pkg_services_module_pkg_module` (`id_module`) |
| CONSTRAINT | `fk_pkg_services_module_pkg_module` FOREIGN KEY (`id_module`) REFERENCES `pkg_module` (`id`) |
| CONSTRAINT | `fk_pkg_services_pkg_services_module` FOREIGN KEY (`id_services`) REFERENCES `pkg_services` (`id`) |
