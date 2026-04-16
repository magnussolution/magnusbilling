#!/bin/bash
echo
echo
echo
echo "===================BY WWW.MAGNUSBILLING.ORG=========================";
echo "_      _                               ______ _ _ _ _                ";
echo "|\    /|                               | ___ (_) | (_)               ";
echo "| \  / | ___  ____  _ __  _   _  _____ | |_/ /_| | |_ _ __   ____    ";
echo "|  \/  |/   \/  _ \| '_ \| | | \| ___| | ___ \ | | | | '_ \ /  _ \   ";
echo "| |\/| |  | |  (_| | | | | |_| ||____  | |_/ / | | | | | | |  (_| |  ";
echo "|_|  |_|\___|\___  |_| | |_____|_____|  \___/|_|_|_|_|_| |_|\___  |  ";
echo "                _/ |                                           _/ |  ";
echo "               |__/                                           |__/   ";
echo "                                                                     ";
echo "======================= VOIP SYSTEM FOR LINUX =======================";
echo

sleep 3


if [[ -f /var/www/html/mbilling/index.php ]]; then
  echo "This server already has MagnusBilling installed";
  exit;
fi
get_linux_distribution ()
{ 
    if [ -f /etc/debian_version ]; then
        DIST="DEBIAN"
        HTTP_DIR="/etc/apache2/"
        HTTP_CONFIG=${HTTP_DIR}"apache2.conf"
        MYSQL_CONFIG="/etc/mysql/mariadb.conf.d/50-server.cnf"
        APACHE_USER="www-data"
    else
        DIST="OTHER"
        echo 'Installation does not support your distribution'
        exit 1
    fi
}



get_linux_distribution

startup_services() 
{
    # Startup Services
    if [ ${DIST} = "DEBIAN" ]; then
        systemctl restart mariadb
        systemctl restart apache2
        systemctl restart asterisk   
    fi
}



genpasswd() 
{
    length=$1
    [ "$length" == "" ] && length=16
    tr -dc A-Za-z0-9_ < /dev/urandom | head -c ${length} | xargs
}
password=$(genpasswd)

if [ -e "/root/passwordMysql.log" ] && [ ! -z "/root/passwordMysql.log" ]
then
    password=$(awk '{print $1}' /root/passwordMysql.log)
fi

touch /root/passwordMysql.log
echo "$password" > /root/passwordMysql.log 



apt-get update --allow-releaseinfo-change
apt-get install -y locales
sed -i 's/^# *en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen || echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo 'LANG=en_US.UTF-8' > /etc/default/locale
echo 'LC_ALL=en_US.UTF-8' >> /etc/default/locale
update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

apt-get -o Acquire::Check-Valid-Until=false update 
apt-get install -y apache2
apt-get install -y autoconf automake devscripts gawk ntpsec g++ git-core curl sudo xmlstarlet libjansson-dev git  odbcinst1debian2 libodbc1 odbcinst unixodbc unixodbc-dev 
apt-get install -y php-fpm php  php-dev php-common php-cli php-gd php-pear php-cli php-sqlite3 php-curl php-mbstring unzip libapache2-mod-php uuid-dev libxml2 libxml2-dev openssl libcurl4-openssl-dev gettext gcc g++ sqlite3 libsqlite3-dev subversion mpg123
apt-get install -y libncurses5-dev 
apt-get install -y libncurses-dev
apt-get install -y mariadb-server php-mysql
apt-get install -y unzip git libcurl4-openssl-dev htop sngrep firewalld fail2ban cron
apt-get install -y rsyslog
apt-get install -y whiptail

PHP_INI=$(php -i | grep /.+/php.ini -oE)

mkdir -p /var/www/html/mbilling
cd /var/www/html/mbilling
wget --no-check-certificate  https://magnusbilling.org/download/MagnusBilling-current.tar.gz
tar xzf MagnusBilling-current.tar.gz

echo
echo '----------- Install PJPROJECT ----------'
echo
sleep 1
cd /usr/src
wget http://www.digip.org/jansson/releases/jansson-2.7.tar.gz
tar -zxvf jansson-2.7.tar.gz
cd jansson-2.7
./configure
make clean
make && make install
ldconfig


echo
echo '----------- Install Asterisk 13 ----------'
echo
sleep 1
cd /usr/src
rm -rf asterisk*
mv /var/www/html/mbilling/script/asterisk-13.35.0.tar.gz /usr/src/
tar xzvf asterisk-13.35.0.tar.gz
rm -rf asterisk-13.35.0.tar.gz
cd asterisk-*
useradd -c 'Asterisk PBX' -d /var/lib/asterisk asterisk -s /sbin/nologin
echo 'asterisk' > /etc/cron.deny
mkdir /var/run/asterisk
mkdir /var/log/asterisk
chown -R asterisk:asterisk /var/run/asterisk
chown -R asterisk:asterisk /var/log/asterisk
contrib/scripts/install_prereq install
make clean
./configure
make menuselect.makeopts
menuselect/menuselect --enable res_config_mysql  menuselect.makeopts
menuselect/menuselect --enable format_mp3  menuselect.makeopts
menuselect/menuselect --enable codec_opus  menuselect.makeopts
menuselect/menuselect --enable codec_silk  menuselect.makeopts
menuselect/menuselect --enable codec_siren7  menuselect.makeopts
menuselect/menuselect --enable codec_siren14  menuselect.makeopts
contrib/scripts/get_mp3_source.sh
make
make install
make samples
make config
ldconfig

 

echo '
<IfModule mime_module>
AddType application/octet-stream .csv
</IfModule>

<Directory "/var/www/html">
    AllowOverride All
    DirectoryIndex index.htm index.html index.php index.php3 default.html index.cgi
</Directory>


<Directory "/var/www/html/mbilling/protected">
    deny from all
</Directory>

<Directory "/var/www/html/mbilling/yii">
    deny from all
</Directory>

<Directory "/var/www/html/mbilling/doc">
    deny from all
</Directory>

<Directory "/var/www/html/mbilling/resources/*log">
    deny from all
</Directory>

<Files "*.sql">
  deny from all
</Files>

<Files "*.log">
  deny from all
</Files>
' >> ${HTTP_CONFIG}


rm -rf ${PHP_INI}_old
cp -rf ${PHP_INI} ${PHP_INI}_old

sed -i "s/upload_max_filesize = 2M/upload_max_filesize = 3M /" ${PHP_INI}
sed -i "s/post_max_size = 8M/post_max_size = 20M/" ${PHP_INI}
sed -i "s/max_execution_time = 30/max_execution_time = 90/" ${PHP_INI}
sed -i "s/max_input_time = 60/max_input_time = 120/" ${PHP_INI}
sed -i '/date.timezone/s/= .*/= '$phptimezone'/' ${PHP_INI}
sed -i "s/session.cookie_secure = 1/" ${PHP_INI}
sed -i "s/memory_limit = 16M/memory_limit = 512M /" ${PHP_INI}
sed -i "s/memory_limit = 128M/memory_limit = 512M /" ${PHP_INI}
sed -i 's/^;*\s*phar.readonly\s*=.*/phar.readonly = On/' ${PHP_INI}
sed -i 's/^;*\s*phar.require_hash\s*=.*/phar.require_hash = On/' ${PHP_INI}

mkdir -p /var/www/html
sed -i 's/<Directory \/var\/www\/>/<Directory \/var\/www\/html\/>/' "${HTTP_CONFIG}"

systemctl enable apache2 
systemctl enable --now ntpsec
echo
echo "----------- Create mysql password: Your mysql root password is $password ----------"
echo


systemctl start mariadb
sudo systemctl enable --now mariadb
sudo mariadb -e "ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('${password}');FLUSH PRIVILEGES;"

echo "
[server]

[mysqld]
user    = mysql
pid-file  = /var/run/mysqld/mysqld.pid
socket    = /var/run/mysqld/mysqld.sock
port    = 3306
basedir   = /usr
datadir   = /var/lib/mysql
tmpdir    = /tmp
lc-messages-dir = /usr/share/mysql
skip-external-locking
max_connections = 500
key_buffer_size   = 64M
max_allowed_packet  = 64M
thread_stack    = 1M
thread_cache_size       = 8
query_cache_limit = 8M
query_cache_size        = 64M
log_error = /var/log/mysql/error.log
expire_logs_days  = 10
max_binlog_size   = 1G
secure_file_priv = /var/lib/mysql-files
symbolic-links=0
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
tmp_table_size=128MB
open_files_limit=500000

[embedded]

[mariadb]

" > ${MYSQL_CONFIG}


mkdir /var/lib/mysql-files
chown root:root /var/lib/mysql-files
chmod 755 /var/lib/mysql-files




startup_services

echo
echo '----------- Installing the Web Interface ----------'
echo
sleep 2

rm -rf /var/www/html/index.html
cd  /var/www/html/mbilling/resources/images/
rm -rf lock-screen-background.jpg
wget --no-check-certificate https://magnusbilling.org/download/lock-screen-background.jpg


cd /var/www/html/mbilling/
rm -rf /var/www/html/mbilling/tmp && mkdir /var/www/html/mbilling/tmp
mkdir /var/www/html/mbilling/assets
mkdir /var/run/magnus
mkdir /usr/local/src/magnus
touch /etc/asterisk/extensions_magnus.conf
touch /etc/asterisk/extensions_magnus_did.conf
touch /etc/asterisk/sip_magnus_register.conf
touch /etc/asterisk/sip_magnus.conf
touch /etc/asterisk/sip_magnus_user.conf
touch /etc/asterisk/iax_magnus_register.conf
touch /etc/asterisk/iax_magnus.conf
touch /etc/asterisk/iax_magnus_user.conf
touch /etc/asterisk/musiconhold_magnus.conf
touch /etc/asterisk/queues_magnus.conf
touch /etc/asterisk/voicemail_magnus.conf
touch /etc/asterisk/mbilling.conf


selectLanguage() {
   echo "SELECT THE MAIN LANGUAGE"  
   echo "------------------------------------------"
   echo "Options:"
   echo
   echo "1. Portuguese"
   echo "2. English"
   echo "3. Spanish"
   echo
   echo -n "Select one option: "
   read opcao
   case $opcao in
      1) installBr;;
      2) installEn;;
      3) installEs;;
      *) "Invalid option." ; echo ; selectLanguage ;;
   esac
}

cp -rf /var/www/html/mbilling/resources/sounds/br /var/lib/asterisk/sounds
cp -rf /var/www/html/mbilling/resources/sounds/es /var/lib/asterisk/sounds
cp -rf /var/www/html/mbilling/resources/sounds/en /var/lib/asterisk/sounds

installBr() {

   language='br'
   cp -rf /var/www/html/mbilling/script/br /var/lib/asterisk/
   cd /var/lib/asterisk
   wget --no-check-certificate https://raw.githubusercontent.com/magnussolution/magnusbilling7/source/script/sounds/Sounds-br.tar.gz
   tar xzvf Sounds-br.tar.gz
}

installEn() {

    language='en'
}

installEs() {

    language='en'
    cp -n /var/www/html/mbilling/resources/sounds/en/* /var/lib/asterisk/sounds
    mkdir /var/lib/asterisk/es
    cd /var/lib/asterisk/es
     wget --no-check-certificate https://raw.githubusercontent.com/magnussolution/magnusbilling7/source/script/sounds/Sounds-es.tar.gz
   tar xzvf Sounds-es.tar.gz
}


if [[ $1 == '' ]]; then
  selectLanguage
elif [[ $1 == 'en' ]]; then
  installEn
elif [[ $1 == 'br' ]]; then
  installBr
elif [[ $1 == 'es' ]]; then
  installEs
else
  selectLanguage
fi

cd /var/www/html/mbilling

echo $'[billing]
exten => _[*0-9].,1,AGI("/var/www/html/mbilling/resources/asterisk/mbilling.php")
  same => n,Hangup()

exten => _+X.,1,Goto(billing,${EXTEN:1},1)

exten => h,1,hangup()

exten => *111,1,VoiceMailMain(${CHANNEL(peername)}@billing)
  same => n,Hangup()

[trunk_answer_handler]
exten => s,1,Set(MASTER_CHANNEL(TRUNKANSWERTIME)=${EPOCH})
  same => n,Return()

' > /etc/asterisk/extensions_magnus.conf

echo "
[general]
enabled = yes

port = 5038
bindaddr = 0.0.0.0
displayconnects = no

[magnus]
secret = magnussolution
deny=0.0.0.0/0.0.0.0
permit=127.0.0.1/255.255.255.0
read = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan
write = system,call,agent,user,config,command,reporting,originate
" > /etc/asterisk/manager.conf


echo "#include extensions_magnus.conf" >> /etc/asterisk/extensions.conf
echo '#include extensions_magnus_did.conf' >> /etc/asterisk/extensions.conf
echo "#include musiconhold_magnus.conf" >> /etc/asterisk/musiconhold.conf
echo "#include voicemail_magnus.conf" >> /etc/asterisk/voicemail.conf

echo "
noload => res_config_sqlite3.so
noload => res_config_sqlite.so
noload => chan_skinny.so
noload => cdr_custom.so
noload => cdr_odbc.so
noload => cdr_sqlite3_custom.so
noload => cdr_csv.so
noload => cdr_manager.so
noload => chan_iax2.so
noload => cdr_mysql.so
noload => app_celgenuserevent.so
noload => cel_custom.so
noload => cel_manager.so
noload => cel_odbc.so
noload => cel_sqlite3_custom.so
noload => res_format_attr_celt.so
" >> /etc/asterisk/modules.conf

echo "
/var/log/asterisk/*log {
  missingok
  rotate 3
  weekly
  postrotate
  /usr/sbin/asterisk -rx 'logger reload' > /dev/null 2> /dev/null
  endscript
}

/var/log/asterisk/messages {
  missingok
  rotate 3
  weekly
  postrotate
  /usr/sbin/asterisk -rx 'logger reload' > /dev/null 2> /dev/null
  endscript
}

/var/log/asterisk/magnus {
  missingok
  rotate 3
  daily
  postrotate
  /usr/sbin/asterisk -rx 'logger reload' > /dev/null 2> /dev/null
  endscript
}

/var/log/asterisk/fail2ban {
  missingok
  rotate 3
  weekly
  postrotate
  /usr/sbin/asterisk -rx 'logger reload' > /dev/null 2> /dev/null
  endscript
}
" > /etc/logrotate.d/asterisk


MBillingMysqlPass=$(genpasswd)

echo
echo "----------- Installing the new Database ----------"
echo
sleep 2

mysql -uroot -p${password} -e "CREATE DATABASE IF NOT EXISTS mbilling;"
mysql -uroot -p${password} -e "CREATE USER 'mbillingUser'@'localhost' IDENTIFIED BY '${MBillingMysqlPass}';"
mysql -uroot -p${password} -e "GRANT ALL PRIVILEGES ON \`mbilling\` . * TO 'mbillingUser'@'localhost' WITH GRANT OPTION;FLUSH PRIVILEGES;"    
mysql -uroot -p${password} -e "GRANT FILE ON * . * TO  'mbillingUser'@'localhost' WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;"
mysql mbilling -u root -p${password}  < /var/www/html/mbilling/script/database.sql
rm -rf /var/www/html/mbilling/script

echo "[general]
dbhost = 127.0.0.1
dbname = mbilling
dbuser = mbillingUser
dbpass = $MBillingMysqlPass
" > /etc/asterisk/res_config_mysql.conf

echo '[directories](!)
astetcdir => /etc/asterisk
astmoddir => /usr/lib/asterisk/modules
astvarlibdir => /var/lib/asterisk
astdbdir => /var/lib/asterisk
astkeydir => /var/lib/asterisk
astdatadir => /var/lib/asterisk
astagidir => /var/lib/asterisk/agi-bin
astspooldir => /var/spool/asterisk
astrundir => /var/run/asterisk
astlogdir => /var/log/asterisk
' > /etc/asterisk/asterisk.conf

echo "
[options]
documentation_language = en_US 
verbose = 5
debug = 0
maxfiles = 500000
hideconnect = 1

[compat]
pbx_realtime=1.6
res_agi=1.6
app_set=1.6" >> /etc/asterisk/asterisk.conf


echo 500000 > /proc/sys/fs/file-max
echo "fs.file-max=500000">>/etc/sysctl.conf


ulimit -c unlimited # The maximum size of core files created.
ulimit -d unlimited # The maximum size of a process's data segment.
ulimit -f unlimited # The maximum size of files created by the shell (default option)
ulimit -i unlimited # The maximum number of pending signals
ulimit -n 99999    # The maximum number of open file descriptors.
ulimit -q unlimited # The maximum POSIX message queue size
ulimit -u unlimited # The maximum number of processes available to a single user.
ulimit -v unlimited # The maximum amount of virtual memory available to the process.
ulimit -x unlimited # ???
ulimit -s 240         # The maximum stack size
ulimit -l unlimited # The maximum size that may be locked into memory.
ulimit -a           # All current limits are reported.


echo '
* soft nofile 500000
* hard nofile 500000
* soft core unlimited
* hard core unlimited
* soft data unlimited
* hard data unlimited
* soft fsize unlimited
* hard fsize unlimited
* soft memlock unlimited
* hard memlock unlimited
* soft cpu unlimited
* hard cpu unlimited
* soft nproc unlimited
* hard nproc unlimited
* soft locks unlimited
* hard locks unlimited
* soft sigpending unlimited
* hard sigpending unlimited' >> /etc/security/limits.conf



CRONPATH='/var/spool/cron/crontabs/root'


echo "
8 8 * * * php /var/www/html/mbilling/cron.php servicescheck
* * * * * php /var/www/html/mbilling/cron.php callchart
1 * * * * php /var/www/html/mbilling/cron.php NotifyClient
1 22 * * * php /var/www/html/mbilling/cron.php DidCheck
1 23 * * * php /var/www/html/mbilling/cron.php PlanCheck
0 2 * * * php /var/www/html/mbilling/cron.php Backup
0 4 * * * /var/www/html/mbilling/protected/commands/clear_memory
*/2 * * * * php /var/www/html/mbilling/cron.php SummaryTablesCdr
*/3 * * * * php /var/www/html/mbilling/cron.php PhoneBooksReprocess
* * * * * php /var/www/html/mbilling/cron.php statussystem
* * * * * php /var/www/html/mbilling/cron.php didwww
*/5 * * * * php /var/www/html/mbilling/cron.php alarm
* * * * * php /var/www/html/mbilling/cron.php TrunkSIPCodes
59 23 * * * php /var/www/html/mbilling/cron.php NotifyClientDaily
" > $CRONPATH
chmod 600 $CRONPATH

echo "
* * * * * root php /var/www/html/mbilling/cron.php cryptocurrency 
">> /etc/crontab


echo "
[general]
bindaddr=0.0.0.0
bindport=5060
context = billing
dtmfmode=RFC2833
disallow=all
allow=g729
allow=g723
allow=ulaw  
allow=alaw  
allow=gsm
rtcachefriends=yes
srvlookup=no
allowsubscribe = no
alwaysauthreject=yes
rtupdate=yes
allowguest=no
language=$language
rtptimeout=60
rtpholdtimeout=300
rtsavesysname=yes
rtupdate=yes
ignoreregexpire=yes

#include sip_magnus_register.conf
#include sip_magnus_user.conf
#include sip_magnus.conf
" > /etc/asterisk/sip.conf

echo "
[general]
bandwidth=low
disallow=lpc10
jitterbuffer=no
autokill=yes

#include iax_magnus_register.conf
#include iax_magnus_user.conf
#include iax_magnus.conf
" > /etc/asterisk/iax.conf

echo "
#include queues_magnus.conf
" >> /etc/asterisk/queues.conf


echo "<?php 
header('Location: ./mbilling');
?>
" > /var/www/html/index.php

echo "
User-agent: *
Disallow: /mbilling/
" > /var/www/html/robots.txt

systemctl daemon-reload

install_fail2ban()
{
    apt-get -y install fail2ban
}


echo
echo "Installing Fail2ban & Iptables"
echo

ssh_port=$(
    awk '
        /^[[:space:]]*Port[[:space:]]+[0-9]+/ && $1 !~ /^#/ { port=$2 } 
        END { print port ? port : "22" }
    ' /etc/ssh/sshd_config
)



apt install -y firewalld

install_fail2ban

systemctl disable iptables
systemctl start firewalld
systemctl enable firewalld
systemctl enable fail2ban


systemctl stop firewalld


nft flush ruleset 2>/dev/null
iptables -F
iptables -t nat -F
iptables -t mangle -F


rm -rf /etc/firewalld/zones/*
rm -rf /etc/firewalld/services/*

systemctl start firewalld


firewall-cmd --zone=public --add-port=$ssh_port/tcp --permanent
firewall-cmd --zone=public --add-port=22/tcp --permanent
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --zone=public --add-port=5060/udp --permanent
firewall-cmd --zone=public --add-port=10000-60000/udp --permanent
firewall-cmd --reload
firewall-cmd --zone=public --list-all



touch /var/www/html/mbilling/protected/runtime/application.log


echo
echo "Fail2ban configuration!"
echo


echo '
[INCLUDES]
[Definition]
failregex = NOTICE.* .*: Useragent: sipcli.*\[<HOST>\] 
ignoreregex =
' > /etc/fail2ban/filter.d/asterisk_cli.conf

echo '
[INCLUDES]
[Definition]
failregex = .*NOTICE.* <HOST> tried to authenticate with nonexistent user.*
ignoreregex =
' > /etc/fail2ban/filter.d/asterisk_manager.conf

echo '
[INCLUDES]
[Definition]
failregex = NOTICE.* .*hangupcause to DB: 200, \[<HOST>\]
ignoreregex =
' > /etc/fail2ban/filter.d/asterisk_hgc_200.conf

echo '
[INCLUDES]
[Definition]
failregex = .*client <HOST>\].*request failed: URI too long.*
     .*client <HOST>\].*request failed: error reading the headers
ignoreregex =
' > /etc/fail2ban/filter.d/mbilling_ddos.conf

echo '
[INCLUDES]
[Definition]
failregex = .*Username and password combination is invalid - User.*IP: <HOST>
ignoreregex =
' > /etc/fail2ban/filter.d/mbilling_login.conf


echo "
[DEFAULT]
ignoreip = 127.0.0.1
bantime  = 600
findtime  = 600
maxretry = 3
backend = auto
usedns = warn
banaction = firewallcmd-multiport
banaction_allports = firewallcmd-multiport


[asterisk-iptables]   
enabled  = true           
filter   = asterisk       
logpath  = /var/log/asterisk/messages 
maxretry = 5  
bantime = 600

[ast-cli-attck]   
enabled  = true           
filter   = asterisk_cli     
logpath  = /var/log/asterisk/messages 
maxretry = 1  
bantime = -1

[asterisk-manager]   
enabled  = true           
filter   = asterisk_manager     
logpath  = /var/log/asterisk/messages 
maxretry = 1  
bantime = -1

[ast-hgc-200]
enabled  = true           
filter   = asterisk_hgc_200     
logpath  = /var/log/asterisk/messages
maxretry = 20
bantime = -1

[mbilling_login]
enabled  = true
filter   = mbilling_login
logpath  = /var/www/html/mbilling/protected/runtime/application.log
maxretry = 3
bantime = 300

[ip-blacklist]
enabled   = true
maxretry  = 0
findtime  = 15552000
bantime   = -1

[sshd]
enabled=true

[mbilling_ddos]
enabled  = true
filter   = mbilling_ddos
logpath  = /var/log/apache2/error.log
maxretry = 20
bantime = 3600" > /etc/fail2ban/jail.local


rm -rf /var/www/html/mbilling/resources/ip.blacklist
touch /var/www/html/mbilling/resources/ip.blacklist


echo "
[Definition]
failregex = ^<HOST> \[.*\]$
ignoreregex =
" > /etc/fail2ban/filter.d/ip-blacklist.conf

echo "
[general]
dateformat=%F %T

[logfiles]
console => error
messages => notice,warning,error
magnus => debug
" > /etc/asterisk/logger.conf

touch /var/log/auth.log

mkdir /var/run/fail2ban/
asterisk -rx "module reload logger"
systemctl enable fail2ban.service 
systemctl restart fail2ban.service 
iptables -L -v

php /var/www/html/mbilling/cron.php updatemysql

## set default permissions 


sed -i "s/^User .*/User $APACHE_USER/" $HTTP_CONFIG
sed -i "s/^Group .*/Group $APACHE_USER/" $HTTP_CONFIG

usermod -aG asterisk $APACHE_USER
systemctl restart apache2

#permissions
find /etc/asterisk -name "*magnus*" -exec chown asterisk:asterisk {} \;
find /etc/asterisk -name "*magnus*" -exec chmod 660 {} \;
find /etc/asterisk -name "*mbilling*" -exec chown asterisk:asterisk {} \;
find /etc/asterisk -name "*mbilling*" -exec chmod 660 {} \;

chmod 600 /root/passwordMysql.log
chown root:asterisk /var/spool/asterisk/outgoing
chmod 730 /var/spool/asterisk/outgoing
chown -R root:$APACHE_USER /usr/local/src/magnus
chmod -R 730 /usr/local/src/magnus
chown -R root:asterisk /var/lib/asterisk/moh
chmod -R 730 /var/lib/asterisk/moh


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


chown -R asterisk:asterisk /var/lib/asterisk
chown -R asterisk:asterisk /var/log/asterisk
chown -R asterisk:asterisk /var/spool/asterisk
chown -R asterisk:asterisk /var/run/asterisk

# end permissions


echo '
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

' > /etc/systemd/system/asterisk.service


systemctl disable asterisk 2>/dev/null
systemctl daemon-reload
systemctl enable asterisk
systemctl restart asterisk

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

echo
echo
echo ===============================================================
echo 


/var/www/html/mbilling/protected/commands/update.sh

p4_proc()
{
    set $(grep "model name" /proc/cpuinfo);

    if [ "$4" == "Celeron" ]; then

        wget https://www.magnusbilling.org/download/codecs/codec_g723-ast13-gcc4-glibc-pentium.so
        wget https://www.magnusbilling.org/download/codecs/codec_g729-ast13-gcc4-glibc-pentium.so
        cp /usr/src/codec_g723-ast13-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g723.so
        cp /usr/src/codec_g729-ast13-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g729.so
         
        return 0;
    fi

    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast130-gcc4-glibc-pentium4.so   
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast130-gcc4-glibc-pentium4.so
    mv /usr/src/codec_g723-ast130-gcc4-glibc-pentium4.so  /usr/lib/asterisk/modules/codec_g723.so
    mv codec_g729-ast130-gcc4-glibc-pentium4.so /usr/lib/asterisk/modules/codec_g729.so            

}
p4_x64_proc()
{         
    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast130-gcc4-glibc-x86_64-pentium4.so
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast130-gcc4-glibc-x86_64-pentium4.so
    mv /usr/src/codec_g723-ast130-gcc4-glibc-x86_64-pentium4.so /usr/lib/asterisk/modules/codec_g723.so
    mv /usr/src/codec_g729-ast130-gcc4-glibc-x86_64-pentium4.so /usr/lib/asterisk/modules/codec_g729.so
      
}
p3_proc()
{       
    set $(grep "model name" /proc/cpuinfo);
    if [ "$4" == "Intel(R)" &&  "$5" == "Pentium(R)" && "$6"== "III" ];then
        wget https://www.magnusbilling.org/download/codecs/codec_g723-ast130-gcc4-glibc-pentium.so   
        wget https://www.magnusbilling.org/download/codecs/codec_g729-ast130-gcc4-glibc-pentium.so
        mv /usr/src/codec_g723-ast130-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g723.so
        mv /usr/src/codec_g729-ast130-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g729.so
        return 0;
    fi
    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast130-gcc4-glibc-pentium3.so
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast130-gcc4-glibc-pentium3.so
    mv /usr/src/codec_g723-ast130-gcc4-glibc-pentium3.so /usr/lib/asterisk/modules/codec_g723.so
    mv /usr/src/codec_g729-ast130-gcc4-glibc-pentium3.so /usr/lib/asterisk/modules/codec_g729.so

}
AMD_proc()
{
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast130-gcc4-glibc-athlon-sse.so
    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast130-gcc4-glibc-athlon-sse.so
    mv /usr/src/codec_g723-ast130-gcc4-glibc-athlon-sse.so /usr/lib/asterisk/modules/codec_g723.so
    mv /usr/src/codec_g729-ast130-gcc4-glibc-athlon-sse.so /usr/lib/asterisk/modules/codec_g729.so

}

processor_type()
{
    _UNAME=`uname -a`;
    _IS_64_BIT=`echo "$_UNAME"  | grep x86_64`
    if [ -n "$_IS_64_BIT" ];
        then _64BIT=1;
        else _64BIT=0;
    fi;
}

cd /usr/src/asterisk-13.35.0 
make config

echo "INSTALLING G723 and G729 CODECS......... FROM http://asterisk.hosting.lv";   
cd /usr/src
rm -rf codec_*
processor_type;
    _IS_AMD=`cat /proc/cpuinfo | grep AMD`;
    _P3=`cat /proc/cpuinfo | grep "Pentium III"`;
    _P3_R=`cat /proc/cpuinfo | grep "Pentium(R) III"`;
    _INTEL=`cat /proc/cpuinfo | grep Intel`;
    if [ -n "$_IS_AMD" ];
      then 
          echo "Processor type detected: AMD";
          if  [ "$_64BIT" == 1 ]; then 
            echo "It is a x64 proc";
               p4_x64_proc;
          else 
            echo "AMD processor detected"; 
            AMD_proc;
          fi
       
    elif [ -n "$_P3_R" ]; then echo "Pentium(R) III processor detected"; p3_proc;           
    elif [ "$_64BIT" == 1 ]; then echo "Processor type detected: INTEL x64"; p4_x64_proc;       
    elif [ -n "$_INTEL" ]; then echo "Pentium IV processor detected"; p4_proc;
    elif [ -n "$_P3" ]; then echo "Pentium III processor detected"; p3_proc;
    else
        echo -e "Automatic detection of required codec installation script failed\nYou must manually select and install the required codec according to this output:";
        cat /proc/cpuinfo
        uname -a
        echo "you can find codecs installation scripts in http://asterisk.hosting.lv";
    fi;

asterisk -rx 'module load codec_g729.so'
asterisk -rx 'module load codec_g723.so'
sleep 4
asterisk -rx 'core show translation'


whiptail --title "MagnusBilling Instalation Result" --msgbox "Congratulations! You have installed MagnusBilling in your Server.\n\nAccess your MagnusBilling in http://your_ip/ \n  Username = root \n  Password = magnus \n\nYour mysql root password is $password\n\n\nPRESS ANY KEY TO REBOOT YOUR SERVER" --fb 20 70

reboot
