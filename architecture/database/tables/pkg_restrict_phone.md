# pkg_restrict_phone

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `number` | bigint(20) NOT NULL |
| `direction` | int(11) NOT NULL DEFAULT '1' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_restricted_phonenumber` (`id_user`) |
| KEY | `number` (`number`) |
| CONSTRAINT | `fk_pkg_user_pkg_restricted_phonenumber` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
