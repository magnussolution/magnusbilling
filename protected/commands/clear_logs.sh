#!/bin/bash

cd /var/log
rm -rf *202*
rm -rf asterisk/*202*
rm -rf httpd/*202*
rm -rf apache2/*202*
rm -rf apache2/access.log.*
rm -rf apache2/error.log.*
rm -rf asterisk/messages.*
rm -rf /var/www/html/mbilling/protected/runtime/*.log.*
rm -rf *.1 && rm -rf *.2 && rm -rf *.3 && rm -rf *.gz
rm -rf asterisk/*.1 && rm -rf asterisk/*.2 && rm -rf asterisk/*.3 && rm -rf asterisk/*.gz

echo '' > /var/log/syslog
echo '' > /var/log/fail2ban.log
echo '' > /var/log/messages
echo '' > /var/log/opensips*
echo '' > /var/log/secure
echo '' > /var/log/maillog
echo '' > /var/log/mysqld.log
echo '' > /var/log/cron
echo '' > /var/log/asteriskSlave.log
echo '' > /var/log/asterisk/messages
echo '' > /var/log/asterisk/fail2ban
echo '' > /var/log/asterisk/queue_log
echo '' > /var/log/httpd/access_log
echo '' > /var/log/httpd/error_log
echo '' > /var/log/httpd/deflate_log
echo '' > /var/log/httpd/ssl_access_log
echo '' > /var/log/httpd/ssl_error_log
echo '' > /var/log/httpd/ssl_request_log
echo '' > /var/log/apache2/access_log
echo '' > /var/log/apache2/error_log
echo '' > /var/log/apache2/deflate_log
echo '' > /var/log/apache2/ssl_access_log
echo '' > /var/log/apache2/ssl_error_log
echo '' > /var/log/apache2/ssl_request_log
