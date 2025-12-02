
.. _firewall-ip:

IP
--

| IP.




.. _firewall-action:

Banido permanente
-----------------

| Com está opção em SIM, o IP será colocado na lista de ip-blacklist do fail2ban e ficará bloqueado para sempre.
| A opção NÃO vai bloquear o IP momentaneamente conforme os parâmetros no arquivo /etc/fail2ba/jail.local.
| 
|     Por padrão o IP ficará bloqueado por 10 minutos.




.. _firewall-description:

Descrição
-----------

| Estas informaçōes são capturadas do arquivo de log /var/log/fail2ban.log
| É possível acompanhar esse LOG com o comando 
| 
| 
| tail -f /var/log/fail2ban.log.



