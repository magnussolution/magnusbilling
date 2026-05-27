# pkg_campaign_poll

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_campaign` | int(11) DEFAULT NULL |
| `name` | varchar(50) NOT NULL |
| `description` | varchar(100) DEFAULT NULL |
| `arq_audio` | varchar(100) DEFAULT NULL |
| `ordem_exibicao` | int(11) DEFAULT NULL |
| `option0` | varchar(150) NOT NULL |
| `option1` | varchar(150) NOT NULL |
| `option2` | varchar(150) NOT NULL |
| `option3` | varchar(150) NOT NULL |
| `option4` | varchar(150) NOT NULL |
| `option5` | varchar(150) NOT NULL |
| `option6` | varchar(150) NOT NULL |
| `option7` | varchar(150) NOT NULL |
| `option8` | varchar(150) NOT NULL |
| `option9` | varchar(150) NOT NULL |
| `digit_authorize` | int(1) NOT NULL DEFAULT '1' |
| `request_authorize` | int(1) NOT NULL DEFAULT '0' |
| `repeat` | int(1) NOT NULL DEFAULT '1' |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_campaign_pkg_campaign_poll` (`id_campaign`) |
| CONSTRAINT | `fk_pkg_campaign_pkg_campaign_poll` FOREIGN KEY (`id_campaign`) REFERENCES `pkg_campaign` (`id`) ON DELETE CASCADE |
