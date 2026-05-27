# pkg_rate_provider

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_provider` | int(11) NOT NULL |
| `id_prefix` | int(11) NOT NULL |
| `buyrate` | decimal(15,6) DEFAULT '0.000000' |
| `buyrateinitblock` | int(11) NOT NULL DEFAULT '1' |
| `buyrateincrement` | int(11) NOT NULL DEFAULT '1' |
| `minimal_time_buy` | int(2) NOT NULL DEFAULT '0' |
| `dialprefix` | bigint(20) DEFAULT NULL |
| `destination` | varchar(50) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_prefix_pkg_rate` (`id_prefix`) |
| KEY | `dialprefix` (`dialprefix`) |
| KEY | `fk_pkg_provider_pkg_rate_provider` (`id_provider`) |
| CONSTRAINT | `fk_pkg_provider_pkg_rate_provider` FOREIGN KEY (`id_provider`) REFERENCES `pkg_provider` (`id`) ON DELETE CASCADE |
