*****************
Iptables
*****************

Applicable Iptables rules in the installation.

Basic Rules
^^^^^^^^^^^^

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

Optional Rules
^^^^^^^^^^^^^^^^

| OPENVPN: ``iptables -A INPUT -p udp --dport 1194 -j ACCEPT`` 
| ICMP: ``iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT``
| IAX: ``iptables -A INPUT -p udp -m udp --dport 4569 -j ACCEPT``
| HTTPS: ``iptablesA INPUT -p tcp -m tcp --dport 443 -j ACCEPT``

Friendly Scanner
^^^^^^^^^^^^^^^^^

Rules to block not so friendly scanner

::
     
	iptables -I INPUT -j DROP -p tcp --dport 5060 -m string --string "friendly-scanner" --algo bm
	iptables -I INPUT -j DROP -p tcp --dport 5080 -m string --string "friendly-scanner" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5060 -m string --string "friendly-scanner" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5080 -m string --string "friendly-scanner" --algo bm

| *Optional*


::
     
	iptables -I INPUT -j DROP -p tcp --dport 5060 -m string--string "VaxSIPUserAgent" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5060 -m string --string "VaxIPUserAgent" --algo bm
	iptables -I INPUT -j DROP -p udp --dport 5080 -m string --string "VaxSIPUserAgent" --algo bm
	iptables -I INPUT -j DROP -p tcp --dport 5080 -m string --string "VaxIPUserAgent" --algo bm


Show iptable rules
^^^^^^^^^^^^^^^^^^^
::
     
  sudo iptables -L -v

Show line numbers
^^^^^^^^^^^^^^^^^^

::
     
  iptables -L -v --line-numbers

Delete a line
^^^^^^^^^^^^^^

Delete line 2

::
     
  iptables -D INPUT 2

Block IP address
^^^^^^^^^^^^^^^^^

::
     
  iptables -I INPUT -s 62.210.245.132 -j DROP

Save Changes
^^^^^^^^^^^^^
     
	apt-get install iptables-persistent
	service iptables-persistent save
	dpkg-reconfigure iptables-persistent


