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
rm -rf MagnusBilling-current.tar.gz
wget --no-check-certificate https://magnusbilling.org/download/MagnusBilling-current.tar.gz
tar xzf MagnusBilling-current.tar.gz


## remove unnecessary directories
rm -rf /var/www/html/mbilling/doc
rm -rf /var/www/html/mbilling/script
rm -rf /var/www/html/mbilling/assets/*
touch /etc/asterisk/voicemail_magnus.conf

## set default permissions 


sed -i "s/^User .*/User $APACHE_USER/" $HTTP_CONFIG
sed -i "s/^Group .*/Group $APACHE_USER/" $HTTP_CONFIG

usermod -aG asterisk $APACHE_USER
systemctl restart $SERVICE

#permissions
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
  chown -R $APACHE_USER:$APACHE_USER "/var/www/html/mbilling/$d"
  find "/var/www/html/mbilling/$d" -type d -exec chmod 750 {} \;
  find "/var/www/html/mbilling/$d" -type f -exec chmod 640 {} \;
done


chown -R asterisk:asterisk /var/www/html/mbilling/resources/asterisk
chmod +x /var/www/html/mbilling/resources/asterisk/mbilling.php
chmod 500 /var/www/html/mbilling/resources/asterisk
chmod 500 /var/www/html/mbilling/resources/asterisk/mbilling.php
chown -R $APACHE_USER:$APACHE_USER /var/lib/php/session*

chown -R asterisk:asterisk /var/lib/asterisk
chown -R asterisk:asterisk /var/log/asterisk
chown -R asterisk:asterisk /var/spool/asterisk
chown -R asterisk:asterisk /var/run/asterisk

chmod +x /var/www/html/mbilling/protected/commands/*.sh

grep -qi '^pedantic=' /etc/asterisk/sip.conf || \
sed -i '/^\[general\]/a pedantic=no' /etc/asterisk/sip.conf


# end permissions

SERVICE_FILE="/etc/systemd/system/asterisk.service"

if [ ! -f "$SERVICE_FILE" ]; then
cat <<'EOF' > "$SERVICE_FILE"
[Unit]
Description=Asterisk PBX (MagnusBilling)
Documentation=man:asterisk(8)
After=network.target

[Service]
Type=simple

User=asterisk
Group=asterisk

Environment=AST_USER=asterisk
Environment=AST_GROUP=asterisk
Environment=HOME=/var/lib/asterisk
WorkingDirectory=/var/lib/asterisk

ExecStart=/usr/sbin/asterisk -f -U asterisk -G asterisk -C /etc/asterisk/asterisk.conf
ExecStop=/usr/sbin/asterisk -rx "core stop now"
ExecReload=/usr/sbin/asterisk -rx "core reload"

Restart=always
RestartSec=4

LimitNOFILE=500000
LimitNPROC=500000
LimitCORE=infinity

NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
RuntimeDirectory=asterisk
RuntimeDirectoryMode=0750
ReadWritePaths=/var/lib/asterisk /var/spool/asterisk /var/log/asterisk

SyslogIdentifier=asterisk

[Install]
WantedBy=multi-user.target
EOF

systemctl disable asterisk 2>/dev/null
systemctl daemon-reload
systemctl enable asterisk

fi




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

mkdir -p /var/lib/mysql-files
chown root:root /var/lib/mysql-files
chmod 755 /var/lib/mysql-files

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

