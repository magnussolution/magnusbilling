# pkg_estados

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL |
| `nome` | varchar(45) NOT NULL |
| `sigla` | varchar(2) NOT NULL |
| PRIMARY | KEY (`id`,`sigla`) |
| UNIQUE | KEY `sigla_UNIQUE` (`sigla`) |
