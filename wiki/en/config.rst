.. _config:

Configuration
=============

MagnusBilling configuration is split between panel records, application files,
and Asterisk files. Identify which layer owns a setting before changing it.

Panel configuration
-------------------

Use the **Configuration** module for supported global options exposed by
MagnusBilling. Review a field's contextual help before saving an unfamiliar
value. Changes can affect billing, authentication, email, campaigns, and call
processing.

Application configuration
-------------------------

The main application entrypoints are:

* ``protected/config/main.php`` for the web application;
* ``protected/config/cron.php`` for scheduled and console commands;
* ``/etc/asterisk/res_config_mysql.conf`` for the database connection used by
  the installed system.

Do not place credentials in public documentation, issue reports, or screenshots.
Back up files before changing them and preserve their owner and permissions.

Asterisk 20 and PJSIP
---------------------

New MBilling 8 installations use PJSIP. The installer creates the main
``pjsip.conf`` and includes MagnusBilling-managed configuration files such as:

* ``/etc/asterisk/pjsip_magnus.conf`` for server and trunk configuration;
* ``/etc/asterisk/pjsip_magnus_user.conf`` for customer endpoints.

Some files are regenerated from panel data. Prefer changing the corresponding
MagnusBilling record instead of editing a generated endpoint directly. Manual
changes to generated files can be replaced by a later save or update.

Safe change procedure
---------------------

1. Back up the database and ``/etc/asterisk``.
2. Record the original value and the reason for the change.
3. Change one layer at a time.
4. Reload or restart only the affected service.
5. Test login, inbound calls, outbound calls, billing, and scheduled jobs as
   appropriate.
6. Check application and Asterisk logs before moving production traffic.

For SIP migration considerations, see :doc:`What's new in MBilling 8 <whats_new_mb8>`.
