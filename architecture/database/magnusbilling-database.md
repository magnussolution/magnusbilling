# MagnusBilling Database Documentation

## Overview
This document describes the MagnusBilling database schema, where to find the SQL scripts, and how schema updates are applied. The canonical schema is provided as SQL scripts in the repository; incremental schema updates are implemented in `protected/commands/UpdateMysqlCommand.php`.

---

## Where the SQL schema lives
- Full initial schema (create statements):
  - [doc/script.sql](doc/script.sql) — canonical SQL install script included in the repository (recommended source)

    **Warning:** In some production deployments the `doc/` directory and `script.sql` are removed from the installed package. If `doc/script.sql` is missing in your environment, fetch the canonical SQL from the project's GitHub repository (for example: https://github.com/magnusbilling/mbilling) and look for `doc/script.sql` in the repository root.
- Schema update (migrations / incremental updates):
  - [protected/commands/UpdateMysqlCommand.php](protected/commands/UpdateMysqlCommand.php) — contains ALTER / CREATE / INSERT statements applied during upgrades

Notes
- The SQL script files contain the complete CREATE TABLE statements, indexes and default data for core tables.
- `UpdateMysqlCommand.php` is used by the app to apply incremental changes; reading this file shows the history of schema changes.

---

## How updates are applied
- During upgrades the `UpdateMysqlCommand` executes SQL blocks that create/alter tables and insert configuration values.
- To review recent updates, search for SQL statements in `protected/commands/UpdateMysqlCommand.php`.

Quick commands (run from repo root):

grep -n "CREATE TABLE" build/production/MBilling/script/database.sql | sed -n '1,200p'
grep -n "ALTER TABLE\|INSERT INTO\|CREATE TABLE" protected/commands/UpdateMysqlCommand.php | sed -n '1,200p'
```bash
# show all CREATE TABLE statements in the install script
grep -n "CREATE TABLE" doc/script.sql | sed -n '1,200p'

# find ALTER / INSERT in update script
grep -n "ALTER TABLE\|INSERT INTO\|CREATE TABLE" protected/commands/UpdateMysqlCommand.php | sed -n '1,200p'
```

---

## Main tables (catalog)
Below is a non-exhaustive list of the most important tables used by MagnusBilling. For full column lists, see the `database.sql` script links above.

- pkg_user — customers / accounts
- pkg_sip — SIP account settings
- pkg_trunk — trunk definitions
- pkg_provider — trunk providers
- pkg_rate — rate records (per prefix)
- pkg_prefix — prefix table used for routing
- pkg_plan — plans and tariffs
- pkg_cdr — call detail records
- pkg_cdr_failed — failed CDRs storage
- pkg_cdr_archive — archived CDRs
- pkg_configuration — global configuration key/value
- pkg_trunk_group — trunk grouping for selection
- pkg_trunk_group_trunk — relation table linking trunk groups to trunks
- pkg_rate_provider — provider rates
- pkg_queue / pkg_queue_member / pkg_queue_agent_status — queue structures
- pkg_campaign / pkg_campaign_* — campaign telephony tables
- pkg_balance / pkg_refill / pkg_refill_provider — billing and refill tables
- pkg_servers / pkg_servers_servers — server registration and data
- pkg_log / pkg_log_actions — application logs
- pkg_user_history — user change history
- pkg_offer / pkg_offer_use — promotional offer tables
- pkg_did / pkg_did_destination / pkg_did_use — DID (number) management
- pkg_cdr_summary_* — summary tables used by reporting jobs

There are many auxiliary tables (pkg_module, pkg_group_user, pkg_holidays, pkg_alarm, pkg_sms, pkg_smtp, etc.). See `database.sql` for the full list.

---

## Recommended documentation contents (what I can generate on request)
I can generate any of the following and add them into this repo under `architecture/database/`:

- A per-table reference: table name, column list (name, type, null, default), primary key, indexes, foreign keys and short purpose.
- An ER diagram (Mermaid) showing major relationships (users, trunks, rates, cdrs, providers).
- A chronological migration log extracted from `protected/commands/UpdateMysqlCommand.php` listing changes by version.

Tell me which of the above you want next. Generating a full per-table reference requires parsing `doc/script.sql` and the update script; I can do that automatically and create a set of markdown files (one per table).

---

## Example: how to generate per-table docs locally
To extract the CREATE TABLE for a single table and format it into markdown, run:

```bash
# extract CREATE TABLE for pkg_cdr
awk 'BEGIN{IGNORECASE=1} /CREATE TABLE `pkg_cdr`/,/\);/ {print}' doc/script.sql > tmp/pkg_cdr.sql

# convert to markdown (simple)
printf "# pkg_cdr\n\n```
$(cat tmp/pkg_cdr.sql)
```\n" > architecture/database/pkg_cdr.md
```

I can automate this across all tables and commit the generated markdown files.

---

## Notes about UpdateMysqlCommand.php
- This file contains code blocks that run SQL to create or alter tables and insert configuration entries. It is effectively the migration log.
- To inspect new configuration keys added by updates, search for `INSERT INTO pkg_configuration` inside `UpdateMysqlCommand.php`.

Example:
```
grep -n "INSERT INTO pkg_configuration" protected/commands/UpdateMysqlCommand.php
```

---

## Next steps (I can run for you)
- Generate per-table markdown docs for all tables (one file per table) and a master index. (recommended)
- Extract a chronological migration log from `UpdateMysqlCommand.php` and include it in `architecture/database/migrations.md`.
- Generate a Mermaid ER diagram of main entities.

Which of these should I do next? If you want the full per-table documentation now, I will parse `build/production/MBilling/script/database.sql` and `protected/commands/UpdateMysqlCommand.php` and create the files under `architecture/database/`.
