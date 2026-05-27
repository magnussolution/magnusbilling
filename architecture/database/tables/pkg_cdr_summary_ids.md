# pkg_cdr_summary_ids

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `day` | date NOT NULL |
| `cdr_id` | int(11) NOT NULL |
| `cdr_falide_id` | int(11) NOT NULL |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `day` (`day`) |
