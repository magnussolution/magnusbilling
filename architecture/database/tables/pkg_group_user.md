# pkg_group_user

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) NOT NULL |
| `id_user_type` | int(11) NOT NULL |
| `user_prefix` | int(11) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `pkg_user_type_pkg_group_user` (`id_user_type`) |
| CONSTRAINT | `pkg_user_type_pkg_group_user` FOREIGN KEY (`id_user_type`) REFERENCES `pkg_user_type` (`id`) |
