# pkg_trunk_group

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) NOT NULL |
| `type` | int(11) NOT NULL DEFAULT '1' |
| `description` | text |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `name` (`name`) |
