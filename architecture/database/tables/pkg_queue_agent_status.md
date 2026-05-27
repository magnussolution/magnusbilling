# pkg_queue_agent_status

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) DEFAULT NULL |
| `id_queue` | int(11) NOT NULL |
| `agentName` | varchar(40) DEFAULT NULL |
| `agentStatus` | varchar(30) DEFAULT NULL |
| `totalCalls` | int(11) NOT NULL DEFAULT '0' |
| `last_call` | int(11) NOT NULL DEFAULT '0' |
| PRIMARY | KEY (`id`) |
| UNIQUE | KEY `unique_index` (`agentName`,`id_queue`) |
| KEY | `id_user` (`id_user`) |
| KEY | `id_queue` (`id_queue`) |
