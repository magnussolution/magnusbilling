********
Iptables
********

Iptables regras aplicadas na instalação

Regras Básicas
^^^^^^^^^^^^^^

::
     
  	iptablesF
	iptablesA INPUT -p icmp --icmp-type echo-request -j ACCEPT
	iptablesA OUTPUT -p icmp --icmp-type echo-reply -j ACCEPT
	iptablesA INPUT -i lo -j ACCEPT
	iptablesA INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
	iptablesA INPUT -p tcp --dport 22 -j ACCEPT
	iptablesP INPUT DROP
	iptablesP FORWARD DROP
	iptablesP OUTPUT ACCEPT
	iptablesA INPUT -p udp -m udp --dport 5060 -j ACCEPT
	iptablesA INPUT -p udp -m udp --dport 10000:20000 -j ACCEPT
	iptablesA INPUT -p tcp -m tcp --dport 80 -j ACCEPT

Regras Opcionais
^^^^^^^^^^^^^^^^

| OPENVPN: ``iptables -A INPUT -p udp --dport 1194 -j ACCEPT`` 
| ICMP: ``iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT``
| IAX: ``iptables -A INPUT -p udp -m udp --dport 4569 -j ACCEPT``
| HTTPS: ``iptablesA INPUT -p tcp -m tcp --dport 443 -j ACCEPT``

Scanner Amigável
^^^^^^^^^^^^^^^^^

Regras para bloquear scanner que não é amigável.

::
     
	iptables -I INPUT -j DROP -p tcp --dport 5060 -m string --string "friendly-scanner" --algo bm
	iptables -I INPUT -j DROP -p tcp --dport 5080 -m string --string "friendly-scanner" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5060 -m string --string "friendly-scanner" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5080 -m string --string "friendly-scanner" --algo bm

| *Opicional*


::
     
	iptables -I INPUT -j DROP -p tcp --dport 5060 -m string--string "VaxSIPUserAgent" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5060 -m string --string "VaxIPUserAgent" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5080 -m string --string "VaxSIPUserAgent" --algo bm
	iptables -I INPUT -j DROP -p tcp --dport 5080 -m string --string "VaxIPUserAgent" --algo bm


Mostrar regras iptables
^^^^^^^^^^^^^^^^^^^^^^^
::
     
  sudo iptables -L -v

Mostrar número de linha
^^^^^^^^^^^^^^^^^^^^^^^

::
     
  iptables -L -v --line-numbers

Deletar Linha
^^^^^^^^^^^^^^

Deletar linha 2

::
     
  iptables -D INPUT 2

Bloquear endereço de IP
^^^^^^^^^^^^^^^^^^^^^^

::
     
  iptables -I INPUT -s 62.210.245.132 -j DROP

Salvar mudanças
^^^^^^^^^^^^^
     
	apt-get install iptables-persistent
	service iptables-persistent save
	dpkg-reconfigure iptables-persistent



