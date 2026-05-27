# pkg_firewall

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `ip` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `action` | int(1) NOT NULL |
| `description` | text NOT NULL |
| `jail` | varchar(100) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
