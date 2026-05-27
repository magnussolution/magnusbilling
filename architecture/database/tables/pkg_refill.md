# pkg_refill

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `credit` | decimal(15,5) NOT NULL |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| `refill_type` | tinyint(4) NOT NULL DEFAULT '0' |
| `payment` | tinyint(1) DEFAULT '0' |
| `invoice_number` | varchar(50) NOT NULL DEFAULT '' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_logrefill` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_logrefill` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
