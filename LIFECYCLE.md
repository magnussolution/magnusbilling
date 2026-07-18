# MagnusBilling 7 lifecycle policy

MagnusBilling 7 entered maintenance mode on July 18, 2026.

## Maintenance period

- No new features are added to MagnusBilling 7.
- Critical bug, security, and compatibility fixes continue through
  December 31, 2026.
- Regular maintenance ends on January 1, 2027.
- Existing installations may continue to run after that date, but they are no
  longer covered by regular maintenance.

All new feature development is performed exclusively in
[MagnusBilling 8](https://github.com/magnussolution/magnusbilling8).

## Supported legacy platform

MagnusBilling 7 uses Asterisk 13 and `chan_sip`. Its final supported
installation platforms are Debian 11 and Debian 12.

CentOS Linux 7 is end-of-life and is not supported. Existing MagnusBilling 7
systems on CentOS 7 must be migrated to a new Debian server.

## Migration

Moving to MagnusBilling 8 is a side-by-side migration, not an in-place update.
MagnusBilling 8 uses Asterisk 20 and PJSIP.

Do not install MagnusBilling 8 over a MagnusBilling 7 production server.
Preserve the old server for rollback, install MagnusBilling 8 on a new Debian
server, create and verify a full database dump, restore it, run the database
migrator, review the PJSIP configuration, and complete the acceptance tests.

Installations using `app_mbilling` must rebuild and reinstall the
Asterisk 20-compatible module. An Asterisk 13 `.so` module must not be copied
to Asterisk 20.

Read the complete
[MagnusBilling 7 to 8 migration guide](https://github.com/magnussolution/magnusbilling8/blob/source/wiki/en/get_started/migrate_from_mb7.rst).
