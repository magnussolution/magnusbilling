MagnusBilling release lifecycle
===============================

Current release
---------------

MagnusBilling 8 is the active development release. New features are developed
only for version 8.

MagnusBilling 8 uses Asterisk 20 and PJSIP. The supported installation path is
a new server with a minimal Debian installation. Ubuntu support is planned but
must not be treated as supported until it is explicitly announced and covered
by the installer and release tests.

MagnusBilling 7
---------------

MagnusBilling 7 entered maintenance mode on July 18, 2026.

* No new features are added to MagnusBilling 7.
* Critical bug, security, and compatibility fixes are provided through
  December 31, 2026.
* Regular maintenance ends on January 1, 2027.
* Existing installations may continue to run after that date, but they are no
  longer covered by regular maintenance.

MagnusBilling 7 uses Asterisk 13 and ``chan_sip``. Migrating to MagnusBilling 8
requires a new Debian server, Asterisk 20, PJSIP, and a database migration.
An in-place operating system or application upgrade is not supported.

CentOS 7
--------

CentOS Linux 7 reached end of life on June 30, 2024. MagnusBilling 7
installations still running on CentOS 7 are considered unsupported and should
be migrated to a new Debian server.

Do not attempt to upgrade CentOS 7 in place as part of the MagnusBilling
migration. Preserve the old server for rollback, install MagnusBilling 8 on a
new Debian server, restore a full database dump, and run the MagnusBilling 8
database migrator.

Compatibility summary
---------------------

* **MagnusBilling 7 / Debian 11 or 12 / Asterisk 13 / chan_sip:** maintenance
  through December 31, 2026.
* **MagnusBilling 7 legacy / CentOS 7 / Asterisk 13 / chan_sip:** unsupported;
  migrate to a new Debian server.
* **MagnusBilling 8 / Debian or Ubuntu / Asterisk 20 / PJSIP:** active development.

See :doc:`Migrating from MagnusBilling 7 <get_started/migrate_from_mb7>` for
the supported migration procedure.
