#!/bin/bash

get_linux_distribution ()
{ 
    if [ -f /etc/debian_version ]; then
        DIST="DEBIAN"
        HTTP_DIR="/etc/apache2/"
        HTTP_CONFIG=${HTTP_DIR}"apache2.conf"
        MYSQL_CONFIG="/etc/mysql/mariadb.conf.d/50-server.cnf"
        SERVICE='apache2'
        APACHE_USER="www-data"
    else
        DIST="OTHER"
        echo 'MagnusBilling 8 currently supports Debian only.'
        exit 1
    fi
}



get_linux_distribution


cd /var/www/html/mbilling

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

mkdir -p /var/spool/asterisk/outgoing/.magnusbilling-tmp
chown root:asterisk /var/spool/asterisk/outgoing
chmod 775 /var/spool/asterisk/outgoing
chown $APACHE_USER:asterisk /var/spool/asterisk/outgoing/.magnusbilling-tmp
chmod 770 /var/spool/asterisk/outgoing/.magnusbilling-tmp
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
find /var/www/html/mbilling/resources/asterisk \
  -type d -exec chmod 550 {} \;

find /var/www/html/mbilling/resources/asterisk \
  -type f -exec chmod 440 {} \;

chmod 550 /var/www/html/mbilling/resources/asterisk/mbilling.php

chmod 755 /var/www/html/mbilling/protected/commands/*.sh

## Install/update the SSH commands that manage panel IP allowlists.
install -d -o root -g "$APACHE_USER" -m 0750 /etc/magnusbilling/panel-ip-access
for command_name in addmyip delmyip releaseAll; do
  install -o root -g root -m 0755 \
    /var/www/html/mbilling/protected/commands/panelIpAccessCommand.sh \
    "/usr/local/sbin/$command_name"
done

##update database
if ! php /var/www/html/mbilling/cron.php UpdateMysql; then
    echo "The database migration failed. The MagnusBilling update was aborted."
    exit 1
fi

## Install or update Magnus Sentinel only on servers using app_mbilling in C.
SENTINEL_MODULE=/usr/lib/asterisk/modules/app_mbilling.so
SENTINEL_LIFECYCLE=/var/www/html/mbilling/protected/commands/magnusSentinelCommand.sh
if [ -f "$SENTINEL_MODULE" ] && [ ! -L "$SENTINEL_MODULE" ] &&
   [ -x "$SENTINEL_LIFECYCLE" ]; then
    if ! "$SENTINEL_LIFECYCLE"; then
        echo "WARNING: MagnusBilling was updated, but Magnus Sentinel installation/update failed." >&2
        echo "Run $SENTINEL_LIFECYCLE after correcting the reported error." >&2
    fi
fi

## Refresh optional Magnus Sentinel state only after a successful update.
SENTINEL_POST_UPDATE=/opt/magnus-sentinel/refresh-after-mbilling-update
if [ -x "$SENTINEL_POST_UPDATE" ]; then
    echo "Refreshing Magnus Sentinel after the MagnusBilling update."
    if ! "$SENTINEL_POST_UPDATE"; then
        echo "WARNING: MagnusBilling was updated, but Magnus Sentinel refresh failed." >&2
        echo "Run $SENTINEL_POST_UPDATE after correcting the reported error." >&2
    fi
fi
