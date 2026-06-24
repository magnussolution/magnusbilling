#!/bin/bash
clear
echo
echo
echo
echo "=======================WWW.MAGNUSBILLING.COM===========================";
echo "_      _                               ______ _ _ _ _  			     ";
echo "|\    /|                               | ___ (_) | (_) 			     ";
echo "| \  / | ___  ____ _ __  _   _   _____ | |_/ /_| | |_ _ __   __ _ 	 ";
echo "|  \/  |/   \/  _ \| '_ \| | | \| ___| | ___ \ | | | | '_ \ /  _ \	 ";
echo "| |\/| |  | |  (_| | | | | |_| ||____  | |_/ / | | | | | | |  (_| |	 ";
echo "|_|  |_|\___|\___  |_| | |_____|_____|  \___/|_|_|_|_|_| |_|\___  |	 ";
echo "                _/ |                                           _/ |	 ";
echo "               |__/                                           |__/ 	 ";
echo "														                 ";
echo "============================== UPDATE =================================";
echo

sleep 2

if [[ -e /var/www/html/mbilling/protected/commands/update2.sh ]]; then
	/var/www/html/mbilling/protected/commands/update2.sh
	exit;
fi


get_linux_distribution ()
{ 
    if [ -f /etc/debian_version ]; then
        DIST="DEBIAN"
        HTTP_DIR="/etc/apache2/"
        HTTP_CONFIG=${HTTP_DIR}"apache2.conf"
        MYSQL_CONFIG="/etc/mysql/mariadb.conf.d/50-server.cnf"
        SERVICE='apache2'
        APACHE_USER="www-data"
      elif [ -f /etc/redhat-release ]; then
        DIST="CENTOS"
        HTTP_DIR="/etc/httpd/"
        HTTP_CONFIG=${HTTP_DIR}"conf/httpd.conf"
        MYSQL_CONFIG="/etc/my.cnf"
        SERVICE='httpd'
        APACHE_USER="apache"
    else
        DIST="OTHER"
        echo 'Installation does not support your distribution'
        exit 1
    fi
}



get_linux_distribution


cd /var/www/html/mbilling
rm -rf MagnusBilling8-current.tar.gz
wget --no-check-certificate https://magnusbilling.org/download/MagnusBilling8-current.tar.gz
tar xzf MagnusBilling8-current.tar.gz


## remove unnecessary directories
rm -rf /var/www/html/mbilling/doc
rm -rf /var/www/html/mbilling/script
rm -rf /var/www/html/mbilling/assets/*
/var/www/html/mbilling/protected/commands/clear_memory

usermod -aG asterisk $APACHE_USER
systemctl restart $SERVICE
sed -i "s/^User .*/User $APACHE_USER/" $HTTP_CONFIG
sed -i "s/^Group .*/Group $APACHE_USER/" $HTTP_CONFIG




## set default permissions 
find /etc/asterisk -name "*magnus*" -exec chown asterisk:asterisk {} \;
find /etc/asterisk -name "*magnus*" -exec chmod 660 {} \;
find /etc/asterisk -name "*mbilling*" -exec chown asterisk:asterisk {} \;
find /etc/asterisk -name "*mbilling*" -exec chmod 660 {} \;

chmod 600 /root/passwordMysql.log
chown root:asterisk /var/spool/asterisk/outgoing
chmod 775 /var/spool/asterisk/outgoing
chown -R root:asterisk /usr/local/src/magnus
chmod -R 775 /usr/local/src/magnus
chown -R root:asterisk /var/lib/asterisk/moh
chmod -R 775 /var/lib/asterisk/moh
chown root:asterisk /etc/asterisk/res_config_mysql.conf
chmod 0640 /etc/asterisk/res_config_mysql.conf

chown -R root:root /var/www/html/mbilling
find /var/www/html/mbilling -type d -exec chmod 755 {} \;
find /var/www/html/mbilling -type f -exec chmod 644 {} \;

for d in protected/runtime assets tmp resources/reports resources/images; do
  mkdir -p "/var/www/html/mbilling/$d"
  chown -R $APACHE_USER:$APACHE_USER "/var/www/html/mbilling/$d"
  find "/var/www/html/mbilling/$d" -type d -exec chmod 750 {} \;
  find "/var/www/html/mbilling/$d" -type f -exec chmod 640 {} \;
done


chown -R asterisk:asterisk /var/www/html/mbilling/resources/asterisk
chmod +x /var/www/html/mbilling/resources/asterisk/mbilling.php
chmod 500 /var/www/html/mbilling/resources/asterisk
chmod 500 /var/www/html/mbilling/resources/asterisk/mbilling.php

chmod +x /var/www/html/mbilling/protected/commands/*.sh

##update database
php /var/www/html/mbilling/cron.php UpdateMysql

if [[ -e /var/www/html/mbilling/protected/commands/update3.sh ]]; then
	/var/www/html/mbilling/protected/commands/update3.sh
fi

