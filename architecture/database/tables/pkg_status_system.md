# pkg_status_system

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `date` | datetime NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `cpuMediaUso` | float NOT NULL DEFAULT '0' |
| `cpuPercent` | float NOT NULL DEFAULT '0' |
| `memTotal` | int(11) DEFAULT NULL |
| `memUsed` | float NOT NULL DEFAULT '0' |
| `networkin` | float NOT NULL DEFAULT '0' |
| `networkout` | float NOT NULL DEFAULT '0' |
| `cpuModel` | varchar(200) DEFAULT NULL |
| `uptime` | varchar(200) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `date` (`date`) |
