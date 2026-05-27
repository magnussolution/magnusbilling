# pkg_offer

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `label` | varchar(70) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `packagetype` | int(11) NOT NULL |
| `billingtype` | int(11) NOT NULL |
| `startday` | int(11) NOT NULL |
| `freetimetocall` | int(11) NOT NULL |
| `price` | decimal(10,3) NOT NULL |
| PRIMARY | KEY (`id`) |
