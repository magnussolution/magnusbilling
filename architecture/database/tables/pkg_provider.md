# pkg_provider

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `provider_name` | char(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| `credit` | decimal(18,5) NOT NULL DEFAULT '0.00000' |
| `credit_control` | smallint(1) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `cons_pkg_provider_provider_name` (`provider_name`) |
