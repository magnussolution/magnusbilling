# pkg_campaign_log

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `total` | int(11) NOT NULL DEFAULT '0' |
| `loops` | int(11) NOT NULL DEFAULT '0' |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `trunks` | varchar(200) DEFAULT NULL |
| `campaigns` | varchar(200) NOT NULL |
| PRIMARY | KEY (`id`) |
