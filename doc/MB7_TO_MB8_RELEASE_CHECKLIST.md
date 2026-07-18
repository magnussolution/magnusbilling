# MagnusBilling 7 to 8 release checklist

This checklist is for maintainers before declaring the migration path
production-ready.

## Migration code

- [ ] Every database step is idempotent.
- [ ] SQL errors stop `UpdateMysql` with a non-zero exit status.
- [ ] The stored version changes only after a step succeeds.
- [ ] A failed migration can be corrected and safely rerun.
- [ ] The migration assistant refuses an in-place MagnusBilling 7 installation.
- [ ] Full dumps include triggers and historical CDR tables.
- [ ] Public documentation contains no private app_mbilling code, logic,
      distribution, or licensing details.

## Test matrix

- [ ] Latest MagnusBilling 7 on Debian 11 to MagnusBilling 8 on Debian.
- [ ] Latest MagnusBilling 7 on Debian 12 to MagnusBilling 8 on Debian.
- [ ] A representative CentOS 7 MagnusBilling 7 snapshot to MagnusBilling 8.
- [ ] Migration with a contracted private app_mbilling add-on is coordinated
      with MagnusSolution.
- [ ] Migration without app_mbilling.
- [ ] Registration-based and IP-authenticated trunks.
- [ ] NAT, custom codecs, DTMF, and provider registrations.
- [ ] DIDs, IVRs, queues, campaigns, callbacks, recordings, and cron.
- [ ] Large database with CDR history.
- [ ] Failed SQL step followed by a safe rerun.
- [ ] Cutover and rollback rehearsal.

## Data validation

- [ ] Compare counts for users, plans, rates, trunks, providers, DIDs, and CDRs.
- [ ] Compare representative balances and call prices.
- [ ] Confirm the migrated application version.
- [ ] Confirm all expected triggers and indexes exist.
- [ ] Confirm no unexpected table data was excluded.

## Telephony validation

- [ ] `pjsip show endpoints` is correct.
- [ ] `pjsip show registrations` is correct.
- [ ] `pjsip show contacts` is correct.
- [ ] Inbound and outbound test calls succeed.
- [ ] Audio, DTMF, caller ID, hangup, and billing are correct.
- [ ] Every custom `chan_sip` option has an explicit PJSIP decision.

## Publication

- [ ] MagnusBilling 7 README contains the maintenance notice.
- [ ] MagnusBilling 7 installer displays the maintenance notice.
- [ ] MagnusBilling 7 feature requests redirect to MagnusBilling 8.
- [ ] MagnusBilling 8 README links to the migration guide.
- [ ] Documentation and GitHub Wiki publish the migration guide.
- [ ] A pinned GitHub issue uses the approved announcement.
- [ ] Website and community announcements use the same dates.
- [ ] The final MagnusBilling 7 release notes repeat the end-of-maintenance date.
