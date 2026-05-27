# pkg_campaign_poll_info

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_campaign_poll` | int(11) NOT NULL |
| `resposta` | smallint(2) NOT NULL |
| `number` | varchar(18) NOT NULL |
| `date` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `obs` | varchar(200) DEFAULT NULL |
| `city` | varchar(50) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_campaign_poll_pkg_campaign_poll_info` (`id_campaign_poll`) |
| KEY | `number` (`number`) |
| CONSTRAINT | `fk_pkg_campaign_poll_pkg_campaign_poll_info` FOREIGN KEY (`id_campaign_poll`) REFERENCES `pkg_campaign_poll` (`id`) ON DELETE CASCADE |
