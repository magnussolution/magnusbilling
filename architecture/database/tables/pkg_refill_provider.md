# pkg_refill_provider

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_provider` | int(11) NOT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `credit` | decimal(15,5) NOT NULL |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| `payment` | tinyint(1) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_provider_pkg_logrefill_provider` (`id_provider`) |
| CONSTRAINT | `fk_pkg_provider_pkg_logrefill_provider` FOREIGN KEY (`id_provider`) REFERENCES `pkg_provider` (`id`) |
