# pkg_cryptocurrency

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `status` | tinyint(1) NOT NULL DEFAULT '0' |
| `currency` | varchar(50) NOT NULL |
| `amountCrypto` | decimal(15,8) NOT NULL DEFAULT '0.00000000' |
| `amount` | decimal(15,8) NOT NULL DEFAULT '0.00000000' |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_cryptocurrency` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_cryptocurrency` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
