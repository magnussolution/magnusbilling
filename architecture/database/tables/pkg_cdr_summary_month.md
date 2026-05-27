# pkg_cdr_summary_month

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `month` | varchar(20) NOT NULL |
| `sessiontime` | bigint(25) NOT NULL |
| `aloc_all_calls` | int(11) NOT NULL |
| `nbcall` | int(11) NOT NULL |
| `nbcall_fail` | int(11) NOT NULL DEFAULT '0' |
| `buycost` | float NOT NULL DEFAULT '0' |
| `sessionbill` | float NOT NULL DEFAULT '0' |
| `lucro` | float DEFAULT '0' |
| `asr` | float NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `month` (`month`) |
