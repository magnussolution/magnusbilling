# pkg_templatemail

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `mailtype` | char(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `fromemail` | char(70) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `fromname` | char(70) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `subject` | varchar(130) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `messagehtml` | varchar(3000) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `language` | varchar(5) DEFAULT 'br' |
| PRIMARY | KEY (`id`) |
