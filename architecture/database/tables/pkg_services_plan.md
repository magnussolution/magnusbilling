# pkg_services_plan

| Column | Definition |
|---|---|
| `id_services` | int(11) NOT NULL |
| `id_plan` | int(11) NOT NULL |
| PRIMARY | KEY (`id_services`,`id_plan`) |
| KEY | `fk_pkg_services_pkg_services_plan` (`id_services`) |
| KEY | `fk_pkg_plan_pkg_services_plan` (`id_plan`) |
| CONSTRAINT | `fk_pkg_plan_pkg_services_plan` FOREIGN KEY (`id_plan`) REFERENCES `pkg_plan` (`id`) ON DELETE CASCADE |
| CONSTRAINT | `fk_pkg_services_pkg_services_plan` FOREIGN KEY (`id_services`) REFERENCES `pkg_services` (`id`) ON DELETE CASCADE |
