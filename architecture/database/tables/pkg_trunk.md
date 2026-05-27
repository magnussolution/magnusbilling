# pkg_trunk

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_provider` | int(11) NOT NULL |
| `failover_trunk` | int(11) DEFAULT NULL |
| `trunkcode` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `host` | varchar(100) NOT NULL |
| `fromdomain` | varchar(100) NOT NULL |
| `trunkprefix` | char(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `providertech` | char(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `providerip` | char(80) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `removeprefix` | char(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `secondusedreal` | int(11) DEFAULT '0' |
| `call_answered` | int(11) DEFAULT '0' |
| `call_total` | int(11) DEFAULT '0' |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `addparameter` | char(120) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `inuse` | int(11) DEFAULT '0' |
| `maxuse` | int(11) DEFAULT '-1' |
| `status` | int(11) DEFAULT '1' |
| `if_max_use` | int(11) DEFAULT '0' |
| `user` | varchar(80) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `secret` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `allow` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `link_sms` | varchar(250) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `directmedia` | char(10) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'no' |
| `context` | char(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'billing' |
| `dtmfmode` | char(7) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'RFC2833' |
| `insecure` | varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'port,invite' |
| `nat` | char(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'yes' |
| `qualify` | char(7) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'yes' |
| `type` | char(6) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'peer' |
| `disallow` | varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'all' |
| `sms_res` | varchar(50) NOT NULL |
| `register` | int(11) NOT NULL DEFAULT '0' |
| `language` | varchar(10) NOT NULL |
| `allow_error` | int(11) NOT NULL DEFAULT '0' COMMENT 'Allow send for backup trunk incluse busy' |
| `short_time_call` | int(11) NOT NULL DEFAULT '0' |
| `fromuser` | varchar(80) NOT NULL DEFAULT '' |
| `register_string` | varchar(300) NOT NULL DEFAULT '' |
| `transport` | varchar(3) NOT NULL DEFAULT 'no' |
| `encryption` | varchar(3) NOT NULL DEFAULT 'no' |
| `port` | varchar(5) NOT NULL DEFAULT '5060' |
| `sendrpid` | varchar(10) NOT NULL DEFAULT 'no' |
| `sip_config` | text |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_provider_pkg_trunk` (`id_provider`) |
| KEY | `fk_pkg_trunk_pkg_trunk` (`failover_trunk`) |
| CONSTRAINT | `fk_pkg_provider_pkg_trunk` FOREIGN KEY (`id_provider`) REFERENCES `pkg_provider` (`id`) |
| CONSTRAINT | `fk_pkg_trunk_pkg_trunk` FOREIGN KEY (`failover_trunk`) REFERENCES `pkg_trunk` (`id`) |
