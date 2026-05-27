# pkg_log

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `id_log_actions` | int(11) DEFAULT NULL |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| `username` | varchar(50) DEFAULT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `ip` | varchar(50) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_log_actions_pkg_log` (`id_log_actions`) |
