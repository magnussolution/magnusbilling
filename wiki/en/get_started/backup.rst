******
Backup
******

It`s always a good idea to have a backup.

The standard backup intentionally excludes data from several large historical
tables. This keeps routine backups manageable, but it also means that a standard
backup is not a complete migration backup.

.. warning::

   Do not use only the Backup menu or the ``Backup`` console command when
   migrating from MagnusBilling 7 to MagnusBilling 8. Follow the
   :doc:`MagnusBilling 7 migration guide <migrate_from_mb7>` and create a full
   database dump if historical CDR data must be preserved.

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



