# pkg_services

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) NOT NULL |
| `type` | varchar(50) NOT NULL |
| `status` | tinyint(1) NOT NULL DEFAULT '1' |
| `price` | decimal(15,4) NOT NULL DEFAULT '0.0000' |
| `description` | text |
| `disk_space` | int(11) DEFAULT NULL |
| `sipaccountlimit` | int(11) DEFAULT NULL |
| `calllimit` | int(11) DEFAULT NULL |
| `return_credit` | tinyint(1) NOT NULL DEFAULT '1' |
| PRIMARY | KEY (`id`) |
