********************
Update MagnusBilling
********************

Our team works daily to add new functions and solve problems. You can see the changes made in the link https://github.com/magnussolution/magnusbilling/commits/source.

Therefore, our team recommends that you keep your server up to date.

To update run the following command.


::

 /var/www/html/mbilling/protected/commands/update.sh

.. warning::

   This command updates an existing MagnusBilling 8 installation. It does not
   convert a MagnusBilling 7 server into MagnusBilling 8. Version 7 installations
   must use the :doc:`side-by-side migration procedure <migrate_from_mb7>`.


Post update checks
==================

After updating, verify the main runtime areas that can be affected by source
changes:

* Web panel bootstrap: ``index.php`` and ``protected/config/main.php``.
* Console commands: ``cron.php`` and ``protected/config/cron.php``.
* Database migrations and structure changes: ``protected/commands/UpdateMysqlCommand.php`` and ``script/database.sql``.
* Asterisk AGI behavior: ``resources/asterisk/mbilling.php`` and the related ``*Agi.php`` files.
* Frontend assets and module files: ``app/`` and ``classic/src/view/``.

If a module appears in the source code but not in the web panel, also verify
the group permissions in the menu and group module settings.
