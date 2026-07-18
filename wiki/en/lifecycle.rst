MagnusBilling 7 lifecycle
=========================

MagnusBilling 7 entered maintenance mode on July 18, 2026.

* No new features are added.
* Critical bug, security, and compatibility fixes continue through
  December 31, 2026.
* Regular maintenance ends on January 1, 2027.
* New development is exclusive to MagnusBilling 8.

MagnusBilling 7 uses Asterisk 13 and ``chan_sip``. MagnusBilling 8 uses
Asterisk 20 and PJSIP. Migration is performed on a new Debian server and is
not an in-place upgrade.

CentOS Linux 7 is end-of-life and is not supported. Preserve the old server
for rollback, install MagnusBilling 8 on a new Debian server, restore a full
database dump, and run the MagnusBilling 8 database migrator.

Installations using ``app_mbilling`` must rebuild and reinstall the module for
Asterisk 20.

Read the complete migration guide at:

https://github.com/magnussolution/magnusbilling8/blob/source/wiki/en/get_started/migrate_from_mb7.rst
