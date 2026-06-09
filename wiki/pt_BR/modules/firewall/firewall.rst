
.. _firewall-ip:

IP
--

| IP.




.. _firewall-action:

Ação
------

| Com esta opção em SIM, o IP será colocado na lista ip-blacklist do fail2ban e ficará bloqueado permanentemente.
| A opção NÃO vai bloquear o IP momentaneamente conforme os parâmetros no arquivo /etc/fail2ban/jail.local.
| 
|     Por padrão o IP ficará bloqueado por 10 minutos.




.. _firewall-description:

Descrição
-----------

| Estas informações são capturadas do arquivo de log /var/log/fail2ban.log.
| É possível acompanhar esse log com o comando 
| 
| 
| tail -f /var/log/fail2ban.log.



