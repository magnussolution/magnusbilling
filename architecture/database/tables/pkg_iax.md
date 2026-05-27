# pkg_iax

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL DEFAULT '0' |
| `name` | varchar(80) COLLATE utf8_bin NOT NULL |
| `accountcode` | varchar(20) COLLATE utf8_bin NOT NULL |
| `regexten` | varchar(20) COLLATE utf8_bin NOT NULL |
| `amaflags` | char(7) COLLATE utf8_bin DEFAULT NULL |
| `callgroup` | char(10) COLLATE utf8_bin DEFAULT NULL |
| `callerid` | varchar(80) COLLATE utf8_bin NOT NULL |
| `canreinvite` | varchar(20) COLLATE utf8_bin DEFAULT NULL |
| `context` | varchar(80) COLLATE utf8_bin NOT NULL |
| `DEFAULTip` | char(15) COLLATE utf8_bin DEFAULT NULL |
| `dtmfmode` | char(7) COLLATE utf8_bin NOT NULL DEFAULT 'RFC2833' |
| `fromuser` | varchar(80) COLLATE utf8_bin NOT NULL |
| `fromdomain` | varchar(80) COLLATE utf8_bin NOT NULL |
| `host` | varchar(31) COLLATE utf8_bin NOT NULL |
| `insecure` | varchar(20) COLLATE utf8_bin NOT NULL |
| `language` | char(2) COLLATE utf8_bin DEFAULT NULL |
| `mailbox` | varchar(50) COLLATE utf8_bin NOT NULL |
| `md5secret` | varchar(80) COLLATE utf8_bin NOT NULL |
| `nat` | varchar(25) COLLATE utf8_bin DEFAULT 'force_rport,comedia' |
| `permit` | varchar(95) COLLATE utf8_bin NOT NULL |
| `deny` | varchar(95) COLLATE utf8_bin NOT NULL |
| `mask` | varchar(95) COLLATE utf8_bin DEFAULT NULL |
| `pickupgroup` | char(10) COLLATE utf8_bin DEFAULT NULL |
| `port` | char(5) COLLATE utf8_bin NOT NULL DEFAULT '' |
| `qualify` | char(7) COLLATE utf8_bin DEFAULT 'yes' |
| `restrictcid` | char(1) COLLATE utf8_bin DEFAULT NULL |
| `rtptimeout` | char(3) COLLATE utf8_bin DEFAULT NULL |
| `rtpholdtimeout` | char(3) COLLATE utf8_bin DEFAULT NULL |
| `secret` | varchar(80) COLLATE utf8_bin NOT NULL |
| `type` | char(6) COLLATE utf8_bin NOT NULL DEFAULT 'friend' |
| `username` | varchar(80) COLLATE utf8_bin NOT NULL |
| `disallow` | varchar(100) COLLATE utf8_bin NOT NULL |
| `allow` | varchar(100) COLLATE utf8_bin NOT NULL |
| `musiconhold` | varchar(100) COLLATE utf8_bin DEFAULT NULL |
| `regseconds` | int(11) NOT NULL DEFAULT '0' |
| `ipaddr` | char(15) COLLATE utf8_bin NOT NULL DEFAULT '' |
| `cancallforward` | char(3) COLLATE utf8_bin DEFAULT 'yes' |
| `trunk` | char(3) COLLATE utf8_bin DEFAULT 'no' |
| `useragent` | varchar(200) COLLATE utf8_bin NOT NULL DEFAULT '' |
| `requirecalltoken` | varchar(3) COLLATE utf8_bin NOT NULL DEFAULT 'no' |
| `calllimit` | int(11) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `cons_pkg_iax_name` (`name`) |
| KEY | `name` (`name`) |
| KEY | `host` (`host`) |
| KEY | `ipaddr` (`ipaddr`) |
| KEY | `port` (`port`) |
