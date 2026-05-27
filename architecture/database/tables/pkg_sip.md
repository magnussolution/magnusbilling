# pkg_sip

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `name` | varchar(80) NOT NULL |
| `accountcode` | varchar(30) DEFAULT NULL |
| `alias` | varchar(10) DEFAULT NULL |
| `regexten` | varchar(40) DEFAULT NULL |
| `amaflags` | varchar(40) DEFAULT NULL |
| `callcounter` | enum('yes','no') DEFAULT NULL |
| `busylevel` | int(11) DEFAULT NULL |
| `allowoverlap` | enum('yes','no') DEFAULT NULL |
| `allowsubscribe` | enum('yes','no') DEFAULT NULL |
| `videosupport` | enum('yes','no') DEFAULT 'no' |
| `callgroup` | char(10) DEFAULT NULL |
| `callerid` | varchar(80) DEFAULT NULL |
| `context` | varchar(80) DEFAULT NULL |
| `DEFAULTip` | char(15) DEFAULT NULL |
| `dtmfmode` | char(7) DEFAULT 'RFC2833' |
| `fromuser` | varchar(80) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `fromdomain` | varchar(80) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `host` | varchar(31) DEFAULT NULL |
| `insecure` | varchar(20) DEFAULT NULL |
| `language` | char(2) DEFAULT NULL |
| `mailbox` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `session-timers` | enum('accept','refuse','originate') DEFAULT NULL |
| `session-expires` | int(11) DEFAULT NULL |
| `session-minse` | int(11) DEFAULT NULL |
| `session-refresher` | enum('uac','uas') DEFAULT NULL |
| `t38pt_usertpsource` | varchar(40) DEFAULT NULL |
| `md5secret` | varchar(80) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `nat` | varchar(25) DEFAULT 'force_rport,comedia' |
| `deny` | varchar(95) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `permit` | varchar(95) DEFAULT NULL |
| `pickupgroup` | char(10) DEFAULT NULL |
| `port` | int(5) DEFAULT NULL |
| `qualify` | char(7) DEFAULT 'yes' |
| `rtptimeout` | int(11) DEFAULT NULL |
| `rtpholdtimeout` | int(11) DEFAULT NULL |
| `secret` | varchar(80) DEFAULT NULL |
| `type` | char(6) DEFAULT 'friend' |
| `disallow` | varchar(100) DEFAULT 'all' |
| `allow` | varchar(100) DEFAULT NULL |
| `regseconds` | int(11) DEFAULT '0' |
| `ipaddr` | char(45) DEFAULT NULL |
| `fullcontact` | varchar(80) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `setvar` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `regserver` | varchar(20) DEFAULT NULL |
| `lastms` | varchar(11) DEFAULT NULL |
| `defaultuser` | varchar(40) DEFAULT NULL |
| `auth` | varchar(10) DEFAULT NULL |
| `subscribemwi` | varchar(10) DEFAULT NULL |
| `vmexten` | varchar(20) DEFAULT NULL |
| `cid_number` | varchar(40) DEFAULT NULL |
| `callingpres` | varchar(20) DEFAULT NULL |
| `usereqphone` | varchar(10) DEFAULT NULL |
| `mohsuggest` | varchar(20) DEFAULT NULL |
| `allowtransfer` | varchar(20) DEFAULT 'no' |
| `autoframing` | varchar(10) DEFAULT NULL |
| `maxcallbitrate` | int(11) DEFAULT NULL |
| `rfc2833compensate` | enum('yes','no') DEFAULT NULL |
| `outboundproxy` | varchar(40) DEFAULT NULL |
| `rtpkeepalive` | int(11) DEFAULT NULL |
| `useragent` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `calllimit` | int(11) DEFAULT NULL |
| `status` | smallint(1) DEFAULT '1' |
| `directmedia` | varchar(10) DEFAULT 'no' |
| `sippasswd` | varchar(50) DEFAULT NULL |
| `callshopnumber` | varchar(15) DEFAULT NULL |
| `callshoptime` | int(11) DEFAULT '0' |
| `callbackextension` | varchar(40) DEFAULT NULL |
| `sip_group` | varchar(20) DEFAULT NULL |
| `ringfalse` | tinyint(1) NOT NULL DEFAULT '0' |
| `record_call` | tinyint(1) NOT NULL DEFAULT '0' |
| `voicemail` | tinyint(1) NOT NULL DEFAULT '0' |
| `voicemail_email` | varchar(100) DEFAULT NULL |
| `voicemail_password` | int(11) DEFAULT NULL |
| `forward` | varchar(50) NOT NULL DEFAULT '' |
| `url_events` | varchar(150) DEFAULT NULL |
| `block_call_reg` | varchar(100) NOT NULL DEFAULT '' |
| `dial_timeout` | int(11) NOT NULL DEFAULT '60' |
| `techprefix` | int(6) DEFAULT NULL |
| `trace` | tinyint(1) NOT NULL DEFAULT '0' |
| `addparameter` | varchar(50) NOT NULL DEFAULT '' |
| `amd` | int(11) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `techprefix` (`techprefix`) |
| KEY | `host` (`host`) |
| KEY | `ipaddr` (`ipaddr`) |
| KEY | `port` (`port`) |
| KEY | `pkg_sip_hp_index` (`host`,`port`) |
| KEY | `pkg_sip_ip_index` (`ipaddr`,`port`) |
| KEY | `fk_pkg_user_pkg_sip_buddies` (`id_user`) |
| KEY | `name` (`name`) |
| CONSTRAINT | `fk_pkg_user_pkg_sip_buddies` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
