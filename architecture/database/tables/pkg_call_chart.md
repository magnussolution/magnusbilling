# pkg_call_chart

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `answer` | int(11) DEFAULT NULL |
| `date` | timestamp NULL DEFAULT CURRENT_TIMESTAMP |
| `total` | int(11) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `date` (`date`) |
