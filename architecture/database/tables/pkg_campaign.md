# pkg_campaign

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `id_plan` | int(11) DEFAULT NULL |
| `name` | char(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `creationdate` | timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `startingdate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `expirationdate` | timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' |
| `description` | mediumtext CHARACTER SET utf8 COLLATE utf8_bin |
| `secondusedreal` | int(11) DEFAULT '0' |
| `nb_callmade` | int(11) DEFAULT '0' |
| `status` | int(11) NOT NULL DEFAULT '1' |
| `frequency` | int(11) NOT NULL DEFAULT '0' |
| `max_frequency` | int(11) NOT NULL DEFAULT '0' |
| `forward_number` | varchar(160) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `daily_start_time` | time NOT NULL DEFAULT '10:00:00' |
| `daily_stop_time` | time NOT NULL DEFAULT '18:00:00' |
| `monday` | tinyint(4) NOT NULL DEFAULT '1' |
| `tuesday` | tinyint(4) NOT NULL DEFAULT '1' |
| `wednesday` | tinyint(4) NOT NULL DEFAULT '1' |
| `thursday` | tinyint(4) NOT NULL DEFAULT '1' |
| `friday` | tinyint(4) NOT NULL DEFAULT '1' |
| `saturday` | tinyint(4) NOT NULL DEFAULT '0' |
| `sunday` | tinyint(4) NOT NULL DEFAULT '0' |
| `audio` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `audio_2` | varchar(100) DEFAULT NULL |
| `type` | int(10) DEFAULT '1' |
| `restrict_phone` | int(1) NOT NULL DEFAULT '0' |
| `enable_max_call` | int(1) NOT NULL DEFAULT '0' |
| `digit_authorize` | smallint(1) NOT NULL DEFAULT '1' |
| `tts_audio` | varchar(200) DEFAULT NULL |
| `tts_audio2` | varchar(200) DEFAULT NULL |
| `asr_audio` | varchar(200) DEFAULT NULL |
| `asr_options` | varchar(200) DEFAULT NULL |
| `auto_reprocess` | int(11) DEFAULT '0' |
| `from` | varchar(20) DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_campaign` (`id_user`) |
| KEY | `fk_pkg_plan_pkg_campaign` (`id_plan`) |
| CONSTRAINT | `fk_pkg_plan_pkg_campaign` FOREIGN KEY (`id_plan`) REFERENCES `pkg_plan` (`id`) |
| CONSTRAINT | `fk_pkg_user_pkg_campaign` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) ON DELETE CASCADE |
