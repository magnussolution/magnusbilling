# pkg_campaign_phonebook

| Column | Definition |
|---|---|
| `id_campaign` | int(11) NOT NULL |
| `id_phonebook` | int(11) NOT NULL |
| PRIMARY | KEY (`id_campaign`,`id_phonebook`) |
| KEY | `fk_pkg_campaign_pkg_campaign_phonebook` (`id_campaign`) |
| KEY | `fk_pkg_phonebook_pkg_campaign_phonebook` (`id_phonebook`) |
| CONSTRAINT | `fk_pkg_campaign_pkg_campaign_phonebook` FOREIGN KEY (`id_campaign`) REFERENCES `pkg_campaign` (`id`) ON DELETE CASCADE |
| CONSTRAINT | `fk_pkg_phonebook_pkg_campaign_phonebook` FOREIGN KEY (`id_phonebook`) REFERENCES `pkg_phonebook` (`id`) ON DELETE CASCADE |
