# pkg_voucher

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `id_plan` | int(11) DEFAULT NULL |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `usedate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `expirationdate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `voucher` | int(6) NOT NULL |
| `tag` | char(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `credit` | float NOT NULL DEFAULT '0' |
| `used` | int(11) DEFAULT '0' |
| `prefix_local` | varchar(50) DEFAULT NULL |
| `language` | char(5) NOT NULL DEFAULT 'en' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `cons_pkg_voucher_voucher` (`voucher`) |
| KEY | `fk_pkg_user_pkg_voucher` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_voucher` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
