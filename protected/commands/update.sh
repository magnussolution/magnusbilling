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

cd /var/www/html/mbilling
rm -rf master.tar.gz
wget https://github.com/magnussolution/magnusbilling7/archive/master.tar.gz
tar xzf master.tar.gz --strip-components=1



##update database
php /var/www/html/mbilling/cron.php UpdateMysql

## remove unnecessary directories
rm -rf /var/www/html/mbilling/doc
rm -rf /var/www/html/mbilling/script
## set default permissions 
chown -R asterisk:asterisk /var/lib/php/session/
chown -R asterisk:asterisk /var/spool/asterisk/outgoing/
chown -R asterisk:asterisk /etc/asterisk
chown -R asterisk:asterisk /var/www/html/mbilling
chown -R asterisk:asterisk /var/lib/asterisk/moh/
chmod -R 777 /tmp
chmod -R 555 /var/www/html/mbilling/
chmod -R 700 /var/www/html/mbilling/resources/reports 
chmod -R 774 /var/www/html/mbilling/protected/runtime/
chmod -R 700 /var/www/html/mbilling/lib
mkdir -p /usr/local/src/magnus
chmod -R 755 /usr/local/src/magnus
mkdir -p /var/www/tmpmagnus
chown -R asterisk:asterisk /var/www/tmpmagnus
chmod -R 777 /var/www/tmpmagnus
chmod 774 /var/www/html/mbilling/resources/ip.blacklist
chmod -R 700 /var/www/html/mbilling/tmp
chmod -R 700 /var/www/html/mbilling/assets
chmod -R 700 /var/www/html/mbilling/resources/sounds
chmod -R 700 /var/www/html/mbilling/resources/images
chmod +x /var/www/html/mbilling/resources/asterisk/mbilling.php
chmod -R 100 /var/www/html/mbilling/resources/asterisk/
if [[ -e /var/www/html/mbilling/protected/commands/update3.sh ]]; then
	/var/www/html/mbilling/protected/commands/update3.sh
fi
