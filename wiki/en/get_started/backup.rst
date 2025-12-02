******
Backup
******

It`s always a good idea to have a backup.

The backup don`t saves the rejected calls table, since normally it`s enourmous.

Manual Backup
^^^^^^^^^^^^^

The project already has a script to do backups of the Databank and Asterisk files.
In the installation is already added an script in the Linux crontab to perform one backup per day. Default is set to 02:00 am.

Manually
^^^^^^^^^^^

Execute this command in SHELL of your server..
php /var/www/html/mbilling/cron.php Backup

Crontab
^^^^^^^

Setting up crontab -e
 
::

 crontab -e

Search the line below and change the time as you see fit, or only comment in the line with ; to not make automated backups.

::

 0 2 * * * php /var/www/html/mbilling/cron.php Backup
 
Backup Menu
^^^^^^^^^^^

It`s possible to view, download and delete backups via the Backup menu as well. The menu is located in the settings.




