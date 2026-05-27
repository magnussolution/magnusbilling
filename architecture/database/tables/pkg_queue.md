# pkg_queue

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(128) NOT NULL |
| `id_user` | int(11) DEFAULT NULL |
| `language` | varchar(5) NOT NULL |
| `musiconhold` | varchar(128) DEFAULT NULL |
| `announce` | varchar(128) DEFAULT NULL |
| `context` | varchar(128) DEFAULT NULL |
| `timeout` | int(11) DEFAULT NULL |
| `announce-frequency` | int(11) DEFAULT NULL |
| `announce-round-seconds` | int(11) DEFAULT NULL |
| `announce-holdtime` | varchar(128) DEFAULT NULL |
| `announce-position` | varchar(5) NOT NULL DEFAULT 'yes' |
| `retry` | int(11) DEFAULT NULL |
| `wrapuptime` | int(11) DEFAULT NULL |
| `maxlen` | int(11) DEFAULT NULL |
| `servicelevel` | int(11) DEFAULT NULL |
| `strategy` | varchar(128) DEFAULT NULL |
| `joinempty` | varchar(128) DEFAULT NULL |
| `leavewhenempty` | varchar(128) DEFAULT NULL |
| `eventmemberstatus` | tinyint(1) DEFAULT NULL |
| `eventwhencalled` | tinyint(1) DEFAULT NULL |
| `reportholdtime` | tinyint(1) DEFAULT NULL |
| `memberdelay` | int(11) DEFAULT NULL |
| `weight` | int(11) DEFAULT NULL |
| `timeoutrestart` | tinyint(1) DEFAULT NULL |
| `periodic-announce` | varchar(200) DEFAULT NULL |
| `periodic-announce-frequency` | int(11) DEFAULT NULL |
| `ringinuse` | varchar(3) DEFAULT NULL |
| `setinterfacevar` | varchar(3) DEFAULT 'yes' |
| `setqueuevar` | varchar(3) NOT NULL DEFAULT 'yes' |
| `setqueueentryvar` | varchar(3) NOT NULL DEFAULT 'yes' |
| `var_holdtime` | int(11) NOT NULL DEFAULT '0' |
| `var_talktime` | int(11) NOT NULL DEFAULT '0' |
| `var_totalCalls` | int(11) NOT NULL DEFAULT '0' |
| `var_answeredCalls` | int(11) NOT NULL DEFAULT '0' |
| `ring_or_moh` | varchar(4) NOT NULL DEFAULT 'moh' |
| `max_wait_time` | int(11) DEFAULT NULL |
| `max_wait_time_action` | varchar(50) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `name` (`name`) |
| KEY | `fk_pkg_user_pkg_queue` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_queue` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
