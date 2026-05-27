# pkg_configuration

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `config_title` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `config_key` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `config_value` | varchar(200) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `config_description` | varchar(500) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `config_group_title` | varchar(64) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `status` | int(10) NOT NULL |
| PRIMARY | KEY (`id`) |
