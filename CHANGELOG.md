# Changelog

This file records notable user-visible changes to the MagnusBilling 8 release
line. The project is under active development; release tags and database
migration instructions remain authoritative for deployment.

## Unreleased

### Documentation

- Reworked the repository introduction, installation, migration, development,
  architecture, support, security, and contribution guidance.
- Added the project mission, scope, engineering priorities, and roadmap.
- Corrected the repository license description to LGPL-3.0.

## MagnusBilling 8

### Changed

- Moved the supported telephony baseline to Asterisk 20.
- Replaced `chan_sip` with PJSIP for new installations.
- Added a side-by-side MagnusBilling 7 to 8 migration path.

For detailed version 8 behavior, see
[What's new in MB8](wiki/en/whats_new_mb8.rst). For database-specific changes,
review the update command and migration guidance before deployment.
