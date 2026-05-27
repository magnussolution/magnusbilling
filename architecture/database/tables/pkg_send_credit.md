# pkg_send_credit

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `date` | timestamp NULL DEFAULT CURRENT_TIMESTAMP |
| `service` | varchar(50) NOT NULL |
| `number` | varchar(30) NOT NULL |
| `profit` | varchar(10) DEFAULT '0' |
| `earned` | varchar(20) DEFAULT NULL |
| `amount` | varchar(10) DEFAULT NULL |
| `total_sale` | int(11) DEFAULT NULL |
| `count` | int(11) DEFAULT NULL |
| `confirmed` | tinyint(1) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
