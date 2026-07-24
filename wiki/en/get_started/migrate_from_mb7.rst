Migrating from MagnusBilling 7
==============================

Purpose and supported path
--------------------------

This document describes the supported migration from MagnusBilling 7 to
MagnusBilling 8. It applies to MagnusBilling 7 installations on Debian and to
legacy installations on CentOS 7.

This is a side-by-side migration to a new server. It is not an in-place
upgrade.

The major platform changes are:

* Asterisk 13 is replaced by Asterisk 20.
* ``chan_sip`` is replaced by PJSIP.
* MagnusBilling 8 is installed on a new Debian server.
* Customers with the private ``app_mbilling`` add-on must request an MB8
  compatible reinstallation from MagnusSolution.

.. warning::

   Never run the MagnusBilling 8 installer over the production MagnusBilling 7
   server. Never copy the old Asterisk binaries, modules, complete
   ``/etc/asterisk`` directory, or MagnusBilling 7 web application into the new
   server.

Migration overview
------------------

#. Inventory and update the MagnusBilling 7 installation.
#. Install and verify MagnusBilling 8 on a new Debian server.
#. Rehearse the complete migration before the maintenance window.
#. Freeze writes on MagnusBilling 7 and create a final full database dump.
#. Restore the dump on MagnusBilling 8 and run ``UpdateMysql``.
#. Review every trunk and endpoint after the conversion to PJSIP.
#. Arrange the private ``app_mbilling`` reinstallation when it is contracted.
#. Run the acceptance tests and move production traffic.
#. Keep the old server stopped and intact during the rollback period.

Before the migration
--------------------

Record the following information before changing either server:

* MagnusBilling version and operating system version;
* public and private IP addresses, DNS records, NAT, and firewall rules;
* SIP trunks, provider registrations, IP authentication, codecs, and DTMF;
* DIDs, queues, IVRs, campaigns, and custom dialplan;
* recordings, music on hold, prompts, certificates, and custom scripts;
* cron jobs and external integrations;
* whether ``app_mbilling`` is installed;
* current record counts, important balances, and sample call costs.

Lower relevant DNS TTL values 24 to 48 hours before the cutover. Define the
acceptance criteria, maintenance window, and rollback decision deadline.

Prepare the new server
----------------------

Install MagnusBilling 8 on a new minimal Debian server:

::

   curl -O https://raw.githubusercontent.com/magnussolution/magnusbilling8/source/script/install.sh
   bash install.sh

For a staged migration, the repository also includes
``script/updateV7_to_V8.sh``. It can be run on a clean Debian server
before the web application is installed. The script compiles Asterisk 20 with
PJSIP, disables ``chan_sip`` in the generated baseline, creates the MagnusBilling
include files, and leaves the database connection file for the MagnusBilling 8
installer to create:

::

   curl -O https://raw.githubusercontent.com/magnussolution/magnusbilling8/source/script/updateV7_to_V8.sh
   chmod 750 updateV7_to_V8.sh
   sudo ./updateV7_to_V8.sh --configure-firewall

If ``/etc/asterisk`` already contains files, the script automatically archives
the old directory under ``/root/asterisk-config-before-mb8-*.tar.gz`` and
creates a clean PJSIP configuration; it does not import the old ``sip.conf``
or ``chan_sip`` modules. The old ``--allow-existing`` option is accepted for
backward compatibility but is no longer required.
For the normal clean installation, running ``script/install.sh`` remains the
shortest path because it installs the web application and Asterisk together.

Verify the clean installation before importing any version 7 data:

* the web panel opens and the administrator can sign in;
* MariaDB and Apache are running;
* ``asterisk -rx "core show version"`` reports Asterisk 20;
* PJSIP loads without configuration errors;
* scheduled MagnusBilling tasks are installed;
* the firewall permits only the services required by the deployment.

Keep the database configuration created by MagnusBilling 8 at
``/etc/asterisk/res_config_mysql.conf``. The MariaDB application user and its
grants remain on the new server when the clean ``mbilling`` database is
replaced.

Create a full version 7 backup
------------------------------

The regular Backup menu and ``Backup`` command omit data from some large
historical tables. They are useful for routine recovery but must not be the
only backup used for a full migration.

Read the database connection from
``/etc/asterisk/res_config_mysql.conf`` on the version 7 server and create a
complete logical dump with triggers:

::

   mysqldump \
     --host=DATABASE_HOST \
     --user=DATABASE_USER \
     --password \
     --single-transaction \
     --quick \
     --triggers \
     --hex-blob \
     --default-character-set=utf8 \
     mbilling > /root/mbilling7-full.sql

Compress the dump and create a checksum:

::

   gzip /root/mbilling7-full.sql
   sha256sum /root/mbilling7-full.sql.gz \
     > /root/mbilling7-full.sql.gz.sha256

The repository also provides ``doc/migrate7_8.sh`` to create and restore a
validated migration dump. Run ``doc/migrate7_8.sh help`` before using it.

Copy recordings, prompts, music on hold, certificates, and other customer
files separately. Archive ``/etc/asterisk`` for reference only. Do not restore
the complete old directory on the new server.

Rehearsal
---------

Perform at least one rehearsal with a recent production backup. Record the
time required for transfer, restore, database migration, PJSIP review, and
acceptance tests.

The rehearsal must include the same database size and optional modules used in
production. Resolve all SQL and PJSIP errors before scheduling the final
cutover.

Final backup and write freeze
-----------------------------

At the beginning of the maintenance window, stop call and web writers on the
old server. Keep MariaDB running long enough to create the final dump.

On Debian, the relevant units normally include:

::

   systemctl stop asterisk apache2 cron

On CentOS 7, they normally include:

::

   systemctl stop asterisk httpd crond

Create a new full dump after the services stop, verify its checksum, and
transfer it to the new server. Do not allow both servers to process production
traffic at the same time.

Restore and migrate the database
--------------------------------

On the new server, stop writers:

::

   systemctl stop asterisk apache2 cron

Preserve a dump of the clean MagnusBilling 8 database, then replace it:

::

   mariadb-dump --protocol=socket --triggers mbilling \
     | gzip > /root/mbilling8-clean-before-migration.sql.gz

   mariadb --protocol=socket -e \
     "DROP DATABASE IF EXISTS mbilling;
      CREATE DATABASE mbilling CHARACTER SET utf8 COLLATE utf8_general_ci;"

   gunzip -c /root/mbilling7-full.sql.gz \
     | mariadb --protocol=socket mbilling

Run the MagnusBilling database migrator:

::

   php /var/www/html/mbilling/cron.php UpdateMysql

The command must finish without an SQL error and report a MagnusBilling 8
version. Do not start production services if the migration command fails.

PJSIP conversion
----------------

The database migrator changes compatible trunk technology values from ``sip``
to ``pjsip``. It also converts legacy technology tokens in
``pkg_did_destination.destination`` and ``pkg_campaign.forward_number``. The
legacy free-text ``pkg_sip.sip_config`` field is converted only for explicit
``SIP/`` dial tokens; SIP URI schemes, usernames, and unrelated text are not
renamed. ``pkg_sip`` remains the database table name in MagnusBilling 8; there
is no ``pkg_sip`` technology column.

The migrator cannot translate every custom ``chan_sip`` option or manual
``sip.conf`` change.

Manually review authentication, registration, IP matching, NAT, codecs,
``fromuser``, ``fromdomain``, DTMF, headers, qualify settings, and contact
limits for every trunk and endpoint.

Use the Asterisk CLI to inspect the converted configuration:

::

   asterisk -rx "pjsip show endpoints"
   asterisk -rx "pjsip show registrations"
   asterisk -rx "pjsip show contacts"

Devices and providers may need new PJSIP-specific settings even when they
continue to use UDP port 5060.

Private app_mbilling add-on
---------------------------

``app_mbilling`` is a private commercial add-on and is not included in the
public MagnusBilling 8 repository. Customers who have contracted the add-on
must contact MagnusSolution before the migration and request the MB8/Asterisk
20 compatible package and installation service.

Do not copy the old version 7 add-on to the new server. The vendor must perform
the reinstallation and confirm the contracted support scope. No source code,
implementation details, or private distribution instructions are published in
this guide.

Acceptance tests
----------------

Complete all applicable tests before moving production traffic:

* administrator login and application version;
* customer, plan, rate, trunk, DID, and balance record counts;
* PJSIP endpoint registration and provider registration;
* inbound and outbound calls;
* expected sell and buy prices on test calls;
* CDR creation and background processing;
* caller ID, DTMF, audio in both directions, and hangup;
* IVR, queue, campaign, recording, and callback behavior;
* cron jobs, backups, e-mail, API, and external integrations;
* ``app_mbilling`` behavior when installed.

Cutover
-------

#. Point provider routes, public IP/NAT rules, and DNS records to the new
   server.
#. Start MariaDB, Apache, cron, and Asterisk on the new server.
#. Repeat critical inbound, outbound, and billing tests with production routes.
#. Monitor the Asterisk, MariaDB, Apache, and MagnusBilling logs.
#. Keep the old server stopped, isolated, and unchanged.

Rollback
--------

If a critical acceptance test fails:

#. Stop Asterisk, Apache, and cron on the new server.
#. Return provider routes, NAT, and DNS to the old server.
#. Start the old services.
#. Record the failure and correct it before another migration attempt.

Do not import a database that has received MagnusBilling 8 writes back into
MagnusBilling 7. The migration is not reversible. Rollback depends on the
frozen version 7 server and database.
