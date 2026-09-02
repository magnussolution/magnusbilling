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

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this installer as root."
  exit 1
fi

if [[ -f /var/www/html/mbilling/index.php ]]; then
  echo "This server already has MagnusBilling installed";
  exit;
fi
get_linux_distribution ()
{
    if [ ! -r /etc/os-release ]; then
        echo "Unable to identify the Linux distribution: /etc/os-release not found."
        exit 1
    fi

    # shellcheck disable=SC1091
    . /etc/os-release

    case "${ID:-}" in
        debian)
            DEBIAN_MAJOR="${VERSION_ID%%.*}"
            case "${DEBIAN_MAJOR}" in
                11|12)
                    ODBC_RUNTIME_PACKAGE="libodbc1"
                    ;;
                13)
                    ODBC_RUNTIME_PACKAGE="libodbc2"
                    ;;
                *)
                    echo "Unsupported Debian version: ${VERSION_ID:-unknown}."
                    echo "Supported Debian versions: 11, 12 and 13."
                    exit 1
                    ;;
            esac
            DIST="DEBIAN"
            ;;
        ubuntu)
            DIST="UBUNTU"
            case "${VERSION_ID:-}" in
                22.04)
                    ODBC_RUNTIME_PACKAGE="libodbc1"
                    ;;
                24.04|26.04)
                    ODBC_RUNTIME_PACKAGE="libodbc2"
                    ;;
                *)
                    echo "Unsupported Ubuntu version: ${VERSION_ID:-unknown}."
                    echo "Supported Ubuntu LTS versions: 22.04, 24.04 and 26.04."
                    exit 1
                    ;;
            esac
            ;;
        *)
            echo "Installation does not support distribution: ${ID:-unknown}."
            exit 1
            ;;
    esac

    HTTP_DIR="/etc/apache2/"
    HTTP_CONFIG="${HTTP_DIR}apache2.conf"
    MYSQL_CONFIG="/etc/mysql/mariadb.conf.d/60-magnusbilling.cnf"
    APACHE_USER="www-data"

    echo "Detected ${PRETTY_NAME:-${ID}}."
    echo "Using ODBC runtime package: ${ODBC_RUNTIME_PACKAGE}."
}



get_linux_distribution

startup_services() 
{
    # Startup Services
    if [ "${DIST}" = "DEBIAN" ] || [ "${DIST}" = "UBUNTU" ]; then
        for service in mariadb apache2 asterisk; do
            if ! systemctl restart "${service}"; then
                echo "Unable to restart required service: ${service}."
                exit 1
            fi
        done
    fi
}



genpasswd() 
{
    length=$1
    [ "$length" == "" ] && length=16
    tr -dc A-Za-z0-9_ < /dev/urandom | head -c ${length} | xargs
}

apt_install()
{
    if ! DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"; then
        echo "Unable to install required packages: $*"
        exit 1
    fi
}


configure_pjsip_dns()
{
    local resolv_file="/etc/resolv.conf"
    local resolv_backup
    local nameserver
    local dns_failures=0

    if [ ! -r "${resolv_file}" ]; then
        echo "WARNING: ${resolv_file} is not readable. PJSIP DNS checks were skipped."
        return
    fi

    # When no search/domain directive exists, libc may infer a search suffix
    # from a provider hostname such as host.example.net. PJSIP then performs
    # unnecessary SRV lookups such as _sip._udp.trunk.net.example.net during
    # every reload. An explicit root search domain prevents that expansion.
    if ! grep -Eq '^[[:space:]]*(search|domain)[[:space:]]+' "${resolv_file}"; then
        resolv_backup="${resolv_file}.magnusbilling.$(date +%Y%m%d-%H%M%S).bak"
        cp -a -- "${resolv_file}" "${resolv_backup}"
        if sed -i --follow-symlinks '1i search .' "${resolv_file}"; then
            echo "Configured root DNS search domain for predictable PJSIP SRV lookups."
            echo "Resolver backup: ${resolv_backup}"
        else
            echo "WARNING: Unable to add 'search .' to ${resolv_file}."
        fi
    fi

    echo "Checking configured DNS servers for PJSIP SRV response..."
    while read -r nameserver; do
        [ -n "${nameserver}" ] || continue

        # NXDOMAIN is a valid and fast DNS response. dig returns success when
        # the server answers, regardless of whether this test name exists.
        if dig +time=1 +tries=1 +short \
            "@${nameserver}" SRV _sip._udp.magnusbilling-dns-check.invalid \
            > /dev/null 2>&1; then
            echo "DNS server ${nameserver}: responding"
        else
            echo "WARNING: DNS server ${nameserver} did not answer within 1 second."
            dns_failures=$((dns_failures + 1))
        fi
    done < <(awk '/^[[:space:]]*nameserver[[:space:]]+/ { print $2 }' "${resolv_file}")

    if [ "${dns_failures}" -gt 0 ]; then
        echo "WARNING: ${dns_failures} configured DNS server(s) may delay PJSIP reloads."
        echo "Remove or repair non-responsive resolvers before using DNS-based trunks."
    fi
}



if ! apt-get update --allow-releaseinfo-change; then
    echo "Unable to update the APT package lists."
    exit 1
fi



apt_install locales
sed -i 's/^# *en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen || echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo 'LANG=en_US.UTF-8' > /etc/default/locale
echo 'LC_ALL=en_US.UTF-8' >> /etc/default/locale
update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

if [ "${DIST}" = "UBUNTU" ]; then
    apt_install software-properties-common
    if ! add-apt-repository -y universe; then
        echo "Unable to enable the Ubuntu universe repository."
        exit 1
    fi
fi

if ! apt-get -o Acquire::Check-Valid-Until=false update; then
    echo "Unable to refresh the APT package lists."
    exit 1
fi

apt_install apache2 dnsutils
apt_install autoconf automake devscripts gawk ntpsec g++ curl wget ca-certificates sudo xmlstarlet libjansson-dev git "${ODBC_RUNTIME_PACKAGE}" odbcinst unixodbc unixodbc-dev patchelf
apt_install php-fpm php php-dev php-common php-cli php-gd php-pear php-sqlite3 php-curl php-mbstring php-xml php-mysql libapache2-mod-php
apt_install unzip uuid-dev libxml2-dev openssl libcurl4-openssl-dev gettext gcc sqlite3 libsqlite3-dev subversion mpg123
apt_install libncurses-dev mariadb-server htop sngrep firewalld fail2ban cron rsyslog whiptail libblocksruntime-dev iproute2 iptables ngrep

configure_pjsip_dns

mkdir -p /var/www/html/mbilling
cd /var/www/html/mbilling
if ! wget -O MagnusBilling8-current.tar.gz https://magnusbilling.org/download/MagnusBilling8-current.tar.gz; then
    echo "Unable to download MagnusBilling."
    exit 1
fi
if ! tar xzf MagnusBilling8-current.tar.gz; then
    echo "Unable to extract MagnusBilling."
    exit 1
fi


echo
echo '----------- Install Asterisk 20 ----------'
echo
sleep 1
cd /usr/src
rm -rf asterisk*
clear

wget https://raw.githubusercontent.com/magnussolution/magnusbilling/source/script/asterisk-20.9.2.tar.gz
tar xzvf asterisk-20.9.2.tar.gz
rm -rf asterisk-20.9.2.tar.gz
cd asterisk-*
useradd -r -d /var/lib/asterisk -s /usr/sbin/nologin -c 'Asterisk PBX' asterisk
mkdir /var/run/asterisk
mkdir /var/log/asterisk
chown -R asterisk:asterisk /var/run/asterisk
chown -R asterisk:asterisk /var/log/asterisk
make clean
contrib/scripts/install_prereq install
./configure --with-jansson-bundled --with-pjproject-bundled
make menuselect.makeopts
menuselect/menuselect --enable res_config_mysql  menuselect.makeopts
make
make install
make samples
make config
ldconfig

 echo '
noload => chan_sip.so
' >> /etc/asterisk/modules.conf


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
' >> "${HTTP_CONFIG}"


PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION, ".", PHP_MINOR_VERSION;')
PHP_TIMEZONE=$(timedatectl show --property=Timezone --value 2>/dev/null)
[ -n "${PHP_TIMEZONE}" ] || PHP_TIMEZONE="UTC"
PHP_MAGNUS_INI="/etc/php/${PHP_VERSION}/mods-available/magnusbilling.ini"

cat > "${PHP_MAGNUS_INI}" <<EOF
; MagnusBilling settings
upload_max_filesize = 3M
post_max_size = 20M
max_execution_time = 90
max_input_time = 120
date.timezone = ${PHP_TIMEZONE}
memory_limit = 512M
phar.readonly = On
phar.require_hash = On
EOF

if ! phpenmod -v "${PHP_VERSION}" magnusbilling; then
    echo "Unable to enable the MagnusBilling PHP configuration."
    exit 1
fi

mkdir -p /var/www/html
sed -i 's/<Directory \/var\/www\/>/<Directory \/var\/www\/html\/>/' "${HTTP_CONFIG}"

systemctl enable apache2 
systemctl enable --now ntpsec
echo
echo "----------- Starting MariaDB with unix_socket root authentication ----------"
echo


systemctl start mariadb
systemctl enable --now mariadb

cat > "${MYSQL_CONFIG}" <<'EOF'
[mysqld]
max_connections = 500
key_buffer_size = 64M
max_allowed_packet = 64M
thread_stack = 1M
thread_cache_size = 8
query_cache_limit = 8M
query_cache_size = 64M
expire_logs_days = 10
max_binlog_size = 1G
secure_file_priv = /var/lib/mysql-files
symbolic_links = 0
sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
tmp_table_size = 128M
open_files_limit = 500000
EOF

install -d -o root -g root -m 0755 /var/lib/mysql-files




startup_services

echo
echo '----------- Installing the Web Interface ----------'
echo
sleep 2

rm -rf /var/www/html/index.html
cd  /var/www/html/mbilling/resources/images/
rm -rf lock-screen-background.jpg
wget https://magnusbilling.org/download/lock-screen-background.jpg


cd /var/www/html/mbilling/
rm -rf /var/www/html/mbilling/tmp && mkdir /var/www/html/mbilling/tmp
mkdir -p /var/www/html/mbilling/assets
mkdir -p /var/run/magnus
mkdir -p /usr/local/src/magnus
touch /etc/asterisk/extensions_magnus.conf
touch /etc/asterisk/extensions_magnus_did.conf
touch /etc/asterisk/pjsip_magnus.conf
touch /etc/asterisk/pjsip_magnus_user.conf
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
   esac
}

cp -rf /var/www/html/mbilling/resources/sounds/br /var/lib/asterisk/sounds
cp -rf /var/www/html/mbilling/resources/sounds/es /var/lib/asterisk/sounds
cp -rf /var/www/html/mbilling/resources/sounds/en /var/lib/asterisk/sounds

installBr() {

   language='br'
   cp -rf /var/www/html/mbilling/script/br /var/lib/asterisk/
   cd /var/lib/asterisk
   wget https://raw.githubusercontent.com/magnussolution/magnusbilling7/source/script/sounds/Sounds-br.tar.gz
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
   wget https://raw.githubusercontent.com/magnussolution/magnusbilling7/source/script/sounds/Sounds-es.tar.gz
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
noload => res_pjsip_endpoint_identifier_anonymous.so
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



echo
echo "----------- Installing the new Database ----------"
echo
sleep 2


MBillingMysqlPass=$(genpasswd)
DATABASE_FILE=/var/www/html/mbilling/script/database.sql
DB_CONFIG_FILE=/etc/asterisk/res_config_mysql.conf

if [[ ! -f ${DATABASE_FILE} ]]; then
  echo "Database schema not found: ${DATABASE_FILE}"
  exit 1
fi

# Debian and Ubuntu MariaDB packages authenticate the OS root user through the
# local Unix socket. Keep that authentication method and create a separate
# password-based account for MagnusBilling.
if ! mariadb --protocol=socket <<SQL
CREATE DATABASE IF NOT EXISTS mbilling;
CREATE USER IF NOT EXISTS 'mbillingUser'@'localhost' IDENTIFIED BY '${MBillingMysqlPass}';
ALTER USER 'mbillingUser'@'localhost' IDENTIFIED BY '${MBillingMysqlPass}';
CREATE USER IF NOT EXISTS 'mbillingUser'@'127.0.0.1' IDENTIFIED BY '${MBillingMysqlPass}';
ALTER USER 'mbillingUser'@'127.0.0.1' IDENTIFIED BY '${MBillingMysqlPass}';
GRANT ALL PRIVILEGES ON \`mbilling\`.* TO 'mbillingUser'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON \`mbilling\`.* TO 'mbillingUser'@'127.0.0.1' WITH GRANT OPTION;
GRANT FILE ON *.* TO 'mbillingUser'@'localhost';
GRANT FILE ON *.* TO 'mbillingUser'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
then
  echo "Unable to create the MagnusBilling MariaDB database user."
  exit 1
fi

if ! mariadb --protocol=socket mbilling < "${DATABASE_FILE}"; then
  echo "Unable to import the MagnusBilling database schema."
  exit 1
fi

if ! MYSQL_PWD="${MBillingMysqlPass}" mariadb --protocol=tcp --host=127.0.0.1 --user=mbillingUser mbilling \
  --execute="SELECT 1;" > /dev/null; then
  echo "Unable to connect to MariaDB using the MagnusBilling application account."
  exit 1
fi

if ! install -o root -g asterisk -m 0640 /dev/null "${DB_CONFIG_FILE}"; then
  echo "Unable to create the MagnusBilling database configuration."
  exit 1
fi

if ! printf '[general]\ndbhost = 127.0.0.1\ndbname = mbilling\ndbuser = mbillingUser\ndbpass = %s\n' \
  "${MBillingMysqlPass}" > "${DB_CONFIG_FILE}"; then
  echo "Unable to write the MagnusBilling database configuration."
  exit 1
fi

rm -rf /var/www/html/mbilling/script

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
runuser = asterisk
rungroup = asterisk
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
* * * * * php /var/www/html/mbilling/cron.php massivecall
8 8 * * * php /var/www/html/mbilling/cron.php servicescheck
* * * * * php /var/www/html/mbilling/cron.php callchart
1 * * * * php /var/www/html/mbilling/cron.php NotifyClient
1 22 * * * php /var/www/html/mbilling/cron.php DidCheck
1 23 * * * php /var/www/html/mbilling/cron.php PlanCheck
0 2 * * * php /var/www/html/mbilling/cron.php Backup
0 4 * * * /var/www/html/mbilling/protected/commands/clear_memory
30 1 * * * /var/www/html/mbilling/protected/commands/update.sh
*/2 * * * * flock -n /tmp/SummaryTablesCdr.lock php /var/www/html/mbilling/cron.php SummaryTablesCdr
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
*/2 * * * * root flock -n /tmp/failtwobanip.lock php /var/www/html/mbilling/cron.php failtwobanip
">> /etc/crontab


echo "
[general]
bindaddr = 0.0.0.0

[transport-udp]
type = transport
protocol = udp
bind = 0.0.0.0:5060

#include pjsip_magnus.conf
#include pjsip_magnus_user.conf
" > /etc/asterisk/pjsip.conf




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
    apt_install fail2ban
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

WAN_IF=$(ip -4 route show default | awk '{for(i=1;i<=NF;i++) if($i=="dev"){print $(i+1); exit}}')

if [ -z "$WAN_IF" ] || ! ip link show "$WAN_IF" >/dev/null 2>&1; then
    echo
    echo "WARNING: Unable to detect the WAN interface from the IPv4 default route."
    echo "Firewalld installation will continue using the default zone: public."
    echo "No interface will be explicitly assigned to the public zone."
    echo
    echo "To fix this later, identify the public interface with:"
    echo "  ip -br addr"
    echo
    echo "Then assign it manually, for example:"
    echo "  firewall-cmd --permanent --zone=public --change-interface=eth0"
    echo "  firewall-cmd --reload"
    echo
    WAN_IF=""
else
    echo "Public interface detected: $WAN_IF"
fi



apt_install firewalld

install_fail2ban
systemctl enable fail2ban


systemctl disable --now iptables 2>/dev/null || true
systemctl disable --now netfilter-persistent 2>/dev/null || true
if [ "${DIST}" = "UBUNTU" ]; then
    systemctl disable --now ufw 2>/dev/null || true
fi
systemctl enable --now firewalld


firewall-cmd --set-default-zone=public
firewall-cmd --zone=public --add-port=$ssh_port/tcp --permanent
firewall-cmd --zone=public --add-port=22/tcp --permanent
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --zone=public --add-port=5060/udp --permanent
firewall-cmd --zone=public --add-port=10000-20000/udp --permanent
if [ -n "$WAN_IF" ]; then
    firewall-cmd --permanent --zone=public --change-interface="$WAN_IF"
fi
firewall-cmd --reload
firewall-cmd --state
firewall-cmd --get-active-zones
if [ -n "$WAN_IF" ]; then
    firewall-cmd --get-zone-of-interface="$WAN_IF"
fi
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
bantime.increment = true
bantime.factor = 2
bantime.maxtime = 30d
backend = auto
usedns = warn
banaction = firewallcmd-allports
banaction_allports = firewallcmd-allports



[asterisk-iptables]   
enabled  = true           
filter   = asterisk       
logpath  = /var/log/asterisk/messages 
maxretry = 5  
bantime = 600
port     = 5060,5061
protocol = udp

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

install -d -m 0755 /var/run/fail2ban
asterisk -rx "module reload logger"
systemctl enable fail2ban.service 
systemctl restart fail2ban.service 
iptables -L -v

php /var/www/html/mbilling/cron.php updatemysql



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

# SSH-managed panel IP allowlists live outside the document root and database.
install -d -o root -g "$APACHE_USER" -m 0750 /etc/magnusbilling/panel-ip-access
for command_name in addmyip delmyip releaseAll; do
  install -o root -g root -m 0755 \
    /var/www/html/mbilling/protected/commands/panelIpAccessCommand.sh \
    "/usr/local/sbin/$command_name"
done


mkdir -p /usr/local/src/magnus/monitor
mkdir -p /usr/local/src/magnus/sounds
mkdir -p /usr/local/src/magnus/backup
mv /usr/local/src/backup* /usr/local/src/magnus/backup

usermod -aG asterisk $APACHE_USER
systemctl restart apache2

#permissions
find /etc/asterisk -name "*magnus*" -exec chown asterisk:asterisk {} \;
find /etc/asterisk -name "*magnus*" -exec chmod 660 {} \;
find /etc/asterisk -name "*mbilling*" -exec chown asterisk:asterisk {} \;
find /etc/asterisk -name "*mbilling*" -exec chmod 660 {} \;


mkdir -p /var/spool/asterisk/outgoing/.magnusbilling-tmp
chown root:asterisk /var/spool/asterisk/outgoing
chmod 730 /var/spool/asterisk/outgoing
chown $APACHE_USER:asterisk /var/spool/asterisk/outgoing/.magnusbilling-tmp
chmod 770 /var/spool/asterisk/outgoing/.magnusbilling-tmp
chown -R root:$APACHE_USER /usr/local/src/magnus
chmod -R 730 /usr/local/src/magnus
chown -R root:asterisk /var/lib/asterisk/moh
chmod -R 730 /var/lib/asterisk/moh
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
StandardOutput=null
StandardError=journal
ReadWritePaths=/var/lib/asterisk /var/spool/asterisk /var/log/asterisk
SyslogIdentifier=asterisk
LogLevelMax=notice
SyslogLevel=err


[Install]
WantedBy=multi-user.target

' > /etc/systemd/system/asterisk.service


systemctl disable asterisk 2>/dev/null
systemctl daemon-reload
systemctl enable asterisk
systemctl restart asterisk




if command -v journalctl >/dev/null 2>&1; then
    install -d -m 0755 /etc/systemd/journald.conf.d

    printf '%s\n' \
        '[Journal]' \
        'SystemMaxUse=200M' \
        'RuntimeMaxUse=200M' \
        'SystemMaxFileSize=20M' \
        > /etc/systemd/journald.conf.d/magnusbilling.conf

    systemctl restart systemd-journald
    journalctl --rotate
    journalctl --vacuum-size=200M
fi


echo
echo
echo ===============================================================
echo 

chmod +x /var/www/html/mbilling/protected/commands/*.sh
/var/www/html/mbilling/protected/commands/update.sh


p4_proc()
{
    set $(grep "model name" /proc/cpuinfo);

    if [ "$4" == "Celeron" ]; then
        wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium.so
        cp /usr/src/codec_g729-ast200-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g729.so
         
        return 0;
    fi
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium4.so
    mv codec_g729-ast200-gcc4-glibc-pentium4.so /usr/lib/asterisk/modules/codec_g729.so            

}
p4_x64_proc()
{         
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-x86_64-pentium4.so
    mv /usr/src/codec_g729-ast200-gcc4-glibc-x86_64-pentium4.so /usr/lib/asterisk/modules/codec_g729.so
      
}
p3_proc()
{       
    set $(grep "model name" /proc/cpuinfo);
    if [ "$4" == "Intel(R)" &&  "$5" == "Pentium(R)" && "$6"== "III" ];then  
        wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium.so
        mv /usr/src/codec_g729-ast200-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g729.so
        return 0;
    fi
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium3.so
    mv /usr/src/codec_g729-ast200-gcc4-glibc-pentium3.so /usr/lib/asterisk/modules/codec_g729.so

}
AMD_proc()
{
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-athlon-sse.so
    mv /usr/src/codec_g729-ast200-gcc4-glibc-athlon-sse.so /usr/lib/asterisk/modules/codec_g729.so

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

echo "INSTALLING G729 CODECS......... FROM http://asterisk.hosting.lv";   
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

for codec in /usr/lib/asterisk/modules/codec_g729.so; do
    if [ -f "${codec}" ]; then
        if patchelf --help 2>&1 | grep -q -- '--clear-execstack'; then
            echo "Clearing executable-stack flag from ${codec}."
            patchelf --clear-execstack "${codec}"
        else
            echo "This patchelf version cannot clear the executable-stack flag from ${codec}."
        fi
        asterisk -rx "module load $(basename "${codec}")"
    fi
done

sleep 4
asterisk -rx 'core show translation'


whiptail --title "MagnusBilling Instalation Result" --msgbox "Congratulations! You have installed MagnusBilling in your Server.\n\nAccess your MagnusBilling in http://your_ip/ \n  Username = root \n  Password = magnus \n\nMariaDB root access uses the local Unix socket (run: mariadb).\n\n\nPRESS ANY KEY TO REBOOT YOUR SERVER" --fb 20 70

reboot
