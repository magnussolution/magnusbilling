# pkg_rate_agent

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_plan` | int(11) NOT NULL |
| `id_prefix` | int(11) NOT NULL |
| `rateinitial` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `initblock` | int(11) NOT NULL DEFAULT '0' |
| `billingblock` | int(11) NOT NULL DEFAULT '0' |
| `minimal_time_charge` | smallint(2) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_plan_pkg_rate_agent` (`id_plan`) |
| KEY | `fk_pkg_prefix_pkg_rate_agent` (`id_prefix`) |
| CONSTRAINT | `fk_pkg_plan_pkg_rate_agent` FOREIGN KEY (`id_plan`) REFERENCES `pkg_plan` (`id`) ON DELETE CASCADE |
| CONSTRAINT | `fk_pkg_prefix_pkg_rate_agent` FOREIGN KEY (`id_prefix`) REFERENCES `pkg_prefix` (`id`) |
