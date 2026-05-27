# pkg_api

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `status` | tinyint(11) NOT NULL DEFAULT '1' |
| `api_key` | varchar(150) NOT NULL |
| `api_secret` | varchar(150) NOT NULL |
| `api_restriction_ips` | varchar(150) DEFAULT NULL |
| `action` | varchar(7) NOT NULL |
| PRIMARY | KEY (`id`) |
