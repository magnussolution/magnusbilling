# pkg_queue_member

| Column | Definition |
|---|---|
| `uniqueid` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `membername` | varchar(40) DEFAULT NULL |
| `queue_name` | varchar(128) DEFAULT NULL |
| `interface` | varchar(128) DEFAULT NULL |
| `penalty` | int(11) DEFAULT NULL |
| `paused` | tinyint(11) DEFAULT NULL |
| PRIMARY | KEY (`uniqueid`) |
| UNIQUE | KEY `queue_interface` (`queue_name`,`interface`) |
| KEY | `fk_pkg_user_pkg_queue_member` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_queue_member` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
