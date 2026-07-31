# Contributing to MagnusBilling 8

Thank you for helping improve MagnusBilling. Changes to billing and telephony
software can affect live calls, customer balances, and server security, so
contributions should be focused, testable, and easy to review.

## Before starting

1. Search existing issues and pull requests.
2. Open an issue for a new feature, schema change, compatibility break, or
   substantial refactor.
3. Do not disclose vulnerabilities publicly; follow [SECURITY.md](SECURITY.md).
4. Read [PROJECT.md](PROJECT.md) and [ARCHITECTURE.md](ARCHITECTURE.md) for scope
   and system boundaries.

Small bug fixes and documentation corrections may be submitted directly.

## Development environment

Use a disposable Linux environment. The complete application depends on PHP,
MariaDB, Apache, Asterisk 20, and PJSIP. Do not run installer, migration,
database, firewall, or call-control experiments on a production host.

For a full environment, begin with a clean operating system supported by
`script/install.sh`. Keep credentials and real customer data out of commits,
fixtures, logs, screenshots, and issue reports.

## Frontend build

The administration client uses Ext JS 6 and Sencha Cmd 6.2.

```bash
sencha app build development
sencha app build production
```

When preparing a deployable build, the application directories required by the
PHP runtime must be included with the generated frontend. Avoid unrelated
changes to generated bundles.

## Tests and checks

Run the narrowest relevant suite first, then the broader applicable checks.
Examples:

```bash
php -l protected/components/Example.php
phpunit protected/tests/unit/PjsipIpAuthenticationProbeTest.php
bash -n script/install.sh
```

Test availability varies by development environment. A pull request must state
exactly what was run and what could not be run.

Changes to telephony or installation behavior also need an isolated-system
validation plan. Changes to rating, balances, payments, or database migrations
must cover retries, partial failure, and representative edge cases.

## Coding and documentation standards

- Follow the style of the surrounding code and keep the diff focused.
- Prefer reusable components over adding business logic to controllers.
- Validate data at every external boundary, especially shell and Asterisk
  commands.
- Never commit passwords, tokens, private keys, production records, or customer
  data.
- Add or update translations for user-facing strings.
- Write all new or updated public user-facing documentation in English.
- Explain operational, configuration, database, and compatibility impact.
- Add a regression test when fixing a defect.

## Commit guidance

Use short, imperative commit subjects and keep logically separate changes in
separate commits. Useful examples:

```text
Fix PJSIP endpoint validation
Add regression test for refill retries
Document Debian 13 installation
```

## Pull request checklist

- [ ] The change has a linked issue or a clear problem statement.
- [ ] The diff contains no secrets or unrelated generated changes.
- [ ] Tests and manual verification are documented.
- [ ] Billing, database, API, security, and telephony risks were considered.
- [ ] User-visible text has translations where applicable.
- [ ] Documentation and `CHANGELOG.md` were updated when appropriate.
- [ ] Migration and rollback steps are included for operational changes.

Maintainers may request additional validation or split a change into smaller
pull requests. A pull request is merged only after the required project review.

## Community standards

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
Installation and usage questions belong in the channels described in
[SUPPORT.md](SUPPORT.md).
