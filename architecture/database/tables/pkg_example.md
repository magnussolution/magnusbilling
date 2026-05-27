# pkg_example

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `name` | varchar(100) NOT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_example` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_example` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |
