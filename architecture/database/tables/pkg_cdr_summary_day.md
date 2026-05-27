# pkg_cdr_summary_day

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `day` | varchar(10) NOT NULL |
| `sessiontime` | bigint(25) NOT NULL |
| `aloc_all_calls` | int(11) NOT NULL |
| `nbcall` | int(11) NOT NULL |
| `nbcall_fail` | int(11) DEFAULT NULL |
| `buycost` | float NOT NULL DEFAULT '0' |
| `sessionbill` | float NOT NULL DEFAULT '0' |
| `lucro` | float DEFAULT NULL |
| `asr` | float DEFAULT NULL |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `day` (`day`) |
