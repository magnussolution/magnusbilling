# pkg_did_use

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `id_did` | int(11) DEFAULT NULL |
| `reservationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `releasedate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `status` | int(11) DEFAULT '0' |
| `month_payed` | int(11) DEFAULT '0' |
| `reminded` | tinyint(4) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `id_card` (`id_user`) |
| KEY | `id_did` (`id_did`) |
