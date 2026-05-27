# pkg_prefix

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `prefix` | varchar(18) NOT NULL |
| `destination` | varchar(60) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `prefix_2` (`prefix`) |
| KEY | `prefix` (`prefix`) |
| KEY | `destination` (`destination`) |
