# pkg_queue_status

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_queue` | int(11) DEFAULT NULL |
| `id_agent` | int(11) DEFAULT NULL |
| `callId` | varchar(40) NOT NULL |
| `callerId` | varchar(60) NOT NULL |
| `status` | varchar(30) NOT NULL |
| `time` | timestamp NULL DEFAULT NULL |
| `queue_name` | varchar(25) NOT NULL |
| `priority` | int(11) NOT NULL DEFAULT '0' |
| `channel` | varchar(50) NOT NULL |
| `holdtime` | varchar(11) DEFAULT '' |
| `totalCalls` | int(11) DEFAULT NULL |
| `answeredCalls` | int(11) DEFAULT NULL |
| `callduration` | int(11) DEFAULT NULL |
| `oldtime` | int(11) NOT NULL DEFAULT '0' |
| `agentName` | varchar(50) NOT NULL DEFAULT '' |
| PRIMARY | KEY (`id`) |
| KEY | `callerId` (`callerId`) |
| KEY | `status` (`status`) |
| KEY | `timestamp` (`time`) |
| KEY | `queue_name` (`queue_name`) |
