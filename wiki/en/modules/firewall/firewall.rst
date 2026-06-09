
.. _firewall-ip:

IP
--

| IP Address.




.. _firewall-action:

Action
------

| With this option set to YES, the IP will be added to the fail2ban ip-blacklist and will remain blocked permanently.
| The NO option blocks the IP temporarily according to the parameters in /etc/fail2ban/jail.local.
|     
|     By default, the IP stays blocked for 10 minutes.




.. _firewall-description:

Description
-----------

| This information is captured from the log file /var/log/fail2ban.log.
| You can follow this log with the command 
|     
|     tail -f /var/log/fail2ban.log



