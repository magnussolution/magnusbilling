# pkg_module

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `text` | varchar(100) NOT NULL |
| `module` | varchar(100) DEFAULT NULL |
| `icon_cls` | varchar(100) DEFAULT NULL |
| `id_module` | int(11) DEFAULT NULL |
| `priority` | int(11) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_module_pkg_module` (`id_module`) |
| CONSTRAINT | `fk_pkg_module_pkg_module` FOREIGN KEY (`id_module`) REFERENCES `pkg_module` (`id`) |
