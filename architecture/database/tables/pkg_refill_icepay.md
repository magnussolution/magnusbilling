# pkg_refill_icepay

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `credit` | decimal(15,5) NOT NULL |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| PRIMARY | KEY (`id`) |
