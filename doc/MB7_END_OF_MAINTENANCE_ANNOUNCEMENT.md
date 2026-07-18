# MagnusBilling 7 maintenance and migration announcement

Use this text for the website, GitHub pinned issue, release notes, documentation,
administrator notices, and community channels.

## Full announcement

MagnusBilling 7 entered maintenance mode on July 18, 2026.

No new features will be added to MagnusBilling 7. Critical bug, security, and
compatibility fixes will continue through December 31, 2026. Regular
maintenance ends on January 1, 2027.

All new feature development is now performed exclusively in MagnusBilling 8.

MagnusBilling 8 is based on Asterisk 20 and PJSIP. Migration requires a new
Debian server and is not supported as an in-place upgrade. Install
MagnusBilling 8 on the new server, create and verify a full MagnusBilling 7
database backup, restore it on the new server, run the database migration, and
complete the PJSIP acceptance tests before moving production traffic.

CentOS Linux 7 is end-of-life. MagnusBilling installations still running on
CentOS 7 must be migrated to a new Debian server. Do not combine an in-place
CentOS operating system upgrade with the MagnusBilling migration.

Customers with a contracted private `app_mbilling` add-on must contact
MagnusSolution before migration and schedule the MB8/Asterisk 20 compatible
reinstallation. The old version 7 add-on must not be copied to the new server.

Read the complete migration procedure:

https://github.com/magnussolution/magnusbilling8/blob/source/wiki/en/get_started/migrate_from_mb7.rst

## Short administrator notice

MagnusBilling 7 is in maintenance mode. No new features will be added. Critical
fixes are provided through December 31, 2026, and regular maintenance ends on
January 1, 2027. Plan a side-by-side migration to MagnusBilling 8 on a new
Debian server.

## Repository description

MagnusBilling 7 — maintenance only through December 31, 2026. New development
continues in MagnusBilling 8.
