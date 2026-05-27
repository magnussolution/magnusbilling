# pkg_sms

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `prefix` | int(11) NOT NULL DEFAULT '0' |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |
| `telephone` | varchar(50) NOT NULL DEFAULT '' |
| `sms` | mediumtext NOT NULL |
| `result` | varchar(50) NOT NULL DEFAULT '' |
| `rate` | decimal(15,5) NOT NULL DEFAULT '0.00000' |
| `from` | varchar(16) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_sms` (`id_user`) |
| KEY | `prefix` (`prefix`) |
| KEY | `date` (`date`) |
| CONSTRAINT | `fk_pkg_user_pkg_sms` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
