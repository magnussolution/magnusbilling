# pkg_did_destination

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_ivr` | int(11) DEFAULT NULL |
| `id_sip` | int(11) DEFAULT NULL |
| `id_queue` | int(11) DEFAULT NULL |
| `id_did` | int(11) NOT NULL |
| `destination` | varchar(120) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `priority` | int(11) NOT NULL DEFAULT '0' |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |
| `activated` | int(11) NOT NULL DEFAULT '1' |
| `secondusedreal` | int(11) DEFAULT '0' |
| `voip_call` | int(11) DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_did_pkg_did_destination` (`id_did`) |
| KEY | `fk_pkg_user_pkg_did_destination` (`id_user`) |
| CONSTRAINT | `fk_pkg_did_pkg_did_destination` FOREIGN KEY (`id_did`) REFERENCES `pkg_did` (`id`) |
| CONSTRAINT | `fk_pkg_user_pkg_did_destination` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
