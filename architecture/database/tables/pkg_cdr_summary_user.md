# pkg_cdr_summary_user

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `sessiontime` | bigint(25) NOT NULL |
| `aloc_all_calls` | int(11) NOT NULL |
| `nbcall` | int(11) NOT NULL |
| `nbcall_fail` | int(11) DEFAULT NULL |
| `buycost` | float NOT NULL DEFAULT '0' |
| `sessionbill` | float NOT NULL DEFAULT '0' |
| `lucro` | float DEFAULT NULL |
| `asr` | float DEFAULT NULL |
| `isAgent` | int(11) DEFAULT NULL |
| `agent_bill` | float NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| KEY | `id_user` (`id_user`) |
