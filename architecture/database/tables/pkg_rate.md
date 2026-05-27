# pkg_rate

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_plan` | int(11) NOT NULL |
| `id_trunk_group` | int(11) NOT NULL |
| `id_prefix` | int(11) NOT NULL |
| `rateinitial` | decimal(15,6) DEFAULT '0.000000' |
| `initblock` | int(11) NOT NULL DEFAULT '1' |
| `billingblock` | int(11) NOT NULL DEFAULT '1' |
| `connectcharge` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `disconnectcharge` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `additional_grace` | varchar(11) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0' |
| `minimal_time_charge` | int(2) NOT NULL DEFAULT '0' |
| `package_offer` | smallint(1) NOT NULL DEFAULT '0' |
| `status` | tinyint(1) NOT NULL DEFAULT '1' |
| `dialprefix` | bigint(20) DEFAULT NULL |
| `destination` | varchar(50) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_plan_pkg_rate` (`id_plan`) |
| KEY | `fk_pkg_prefix_pkg_rate` (`id_prefix`) |
| KEY | `fk_pkg_trunk_pkg_rate` (`id_trunk_group`) |
| KEY | `dialprefix` (`dialprefix`) |
| CONSTRAINT | `fk_pkg_plan_pkg_rate` FOREIGN KEY (`id_plan`) REFERENCES `pkg_plan` (`id`) |
| CONSTRAINT | `fk_pkg_trunk_group_pkg_rate` FOREIGN KEY (`id_trunk_group`) REFERENCES `pkg_trunk_group` (`id`) |
