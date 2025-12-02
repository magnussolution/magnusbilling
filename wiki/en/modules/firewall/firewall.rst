
.. _firewall-ip:

IP
--

| IP Address.




.. _firewall-action:

Perm ban
--------

| With this option marked on YES, the IP will be placed on the ip-blacklist list of fail2ban and will be blocked forever. 
| The option will NOT block the IP momentarily according the parameters of the file /etc/fail2ba/jail.local.
|     
|     By default the IP is going to stay blocked for 10 minutes




.. _firewall-description:

Description
-----------

| These informations are captured from the log file /var/log/fail2ban.log 
|  It's possible to track this LOG with the command 
|     
|     tail -f /var/log/fail2ban.log



