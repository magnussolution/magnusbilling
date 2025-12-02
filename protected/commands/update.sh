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
    elif [ -f /etc/redhat-release ]; then
        DIST="CENTOS"
        HTTP_DIR="/etc/httpd/"
        HTTP_CONFIG=${HTTP_DIR}"conf/httpd.conf"
        MYSQL_CONFIG="/etc/my.cnf"
         SERVICE='httpd'
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
## set default permissions 

chown -R root:root /var/www/html/mbilling
find /var/www/html/mbilling -type d -exec chmod 755 {} \;
find /var/www/html/mbilling -type f -exec chmod 644 {} \;

for d in protected/runtime assets tmp resources/reports resources/images; do
  mkdir -p "/var/www/html/mbilling/$d"
  chown -R asterisk:asterisk "/var/www/html/mbilling/$d"
  find "/var/www/html/mbilling/$d" -type d -exec chmod 750 {} \;
  find "/var/www/html/mbilling/$d" -type f -exec chmod 640 {} \;
done

for d in assets tmp protected/runtime resources/reports resources/images; do
  cat > "/var/www/html/mbilling/$d/.htaccess" <<'EOF'
<FilesMatch "\.(php|phtml|phar)$">
  Require all denied
</FilesMatch>
# Se estiver usando mod_php, isto ajuda extra:
<IfModule mod_php7.c>
  php_flag engine off
</IfModule>
<IfModule mod_php8.c>
  php_flag engine off
</IfModule>
EOF
done

chmod +x /var/www/html/mbilling/protected/commands/*.sh
chmod +x /var/www/html/mbilling/protected/commands/clear_memory
touch /etc/asterisk/extensions_magnus_did.conf
chown -R asterisk:asterisk /var/lib/php/session*
chown -R asterisk:asterisk /var/spool/asterisk/outgoing/
chown -R asterisk:asterisk /etc/asterisk
chown -R asterisk:asterisk /var/lib/asterisk/moh/
chown -R asterisk:asterisk /var/lib/asterisk/sounds/
mkdir -p /usr/local/src/magnus
chown -R asterisk:asterisk /var/run/magnus/
chown -R root:root /root
chown -R mysql:mysql /var/lib/mysql
chmod -R 755 /usr/local/src/magnus


echo 'Options -Indexes
Order Deny,Allow
Deny from all
' > /var/www/html/mbilling/assets/.htaccess
echo 'Options -Indexes
Order Deny,Allow
Deny from all
' > /var/www/html/mbilling/lib/.htaccess
chmod +x /var/www/html/mbilling/resources/asterisk/mbilling.php
sed -i "s/AllowOverride None/AllowOverride All/" ${HTTP_CONFIG}
systemctl reload ${SERVICE}


sed -i.bak -E "s/^[[:space:]]*secure[-_]file[-_]priv[[:space:]]*=[[:space:]]*.*$/secure_file_priv = \/var\/lib\/mysql-files/" "$MYSQL_CONFIG"

mkdir /var/lib/mysql-files
chown root:root /var/lib/mysql-files
chmod 755 /var/lib/mysql-files


/var/www/html/mbilling/protected/commands/clear_memory

rm -rf /var/www/html/mbilling/protected/controllers/Transfer*
rm -rf /var/www/html/mbilling/protected/controllers/SendCredit*
rm -rf /var/www/html/mbilling/protected/controllers/SmsInfoBip*
rm -rf /var/www/html/mbilling/protected/controllers/BDService*
rm -rf /var/www/html/mbilling/protected/models/Transfer*
rm -rf /var/www/html/mbilling/protected/models/SendCredit*
rm -rf /var/www/html/mbilling/protected/models/SmsInfoBip*
rm -rf /var/www/html/mbilling/protected/components/Transfer*
rm -rf /var/www/html/mbilling/protected/components/SendCredit*
rm -rf /var/www/html/mbilling/protected/views/transfer*
rm -rf /var/www/html/mbilling/protected/views/sendCredit*
rm -rf /var/www/html/mbilling/protected/commands/BDService*

##update database
php /var/www/html/mbilling/cron.php UpdateMysql

if [[ -e /var/www/html/mbilling/protected/commands/update3.sh ]]; then
	/var/www/html/mbilling/protected/commands/update3.sh
fi

