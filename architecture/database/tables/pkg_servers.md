# pkg_servers

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) NOT NULL |
| `host` | varchar(100) NOT NULL |
| `public_ip` | varchar(80) DEFAULT NULL |
| `username` | varchar(50) NOT NULL DEFAULT '' |
| `password` | varchar(50) NOT NULL |
| `port` | char(10) NOT NULL |
| `sip_port` | int(7) NOT NULL DEFAULT '5060' |
| `status` | tinyint(1) NOT NULL DEFAULT '1' |
| `type` | varchar(20) NOT NULL DEFAULT 'freeswitch' |
| `weight` | int(1) NOT NULL DEFAULT '1' |
| `description` | text NOT NULL |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `host` (`host`) |
