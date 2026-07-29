# MagnusBilling 8

Open-source billing, routing, and management platform for VoIP providers,
call shops, and telephony services.

MagnusBilling 8 combines a web administration panel, a billing engine, and
Asterisk integration. New installations use **Asterisk 20** and **PJSIP**.

> [!IMPORTANT]
> MagnusBilling 8 must be installed on a clean, dedicated server. Migrating
> from MagnusBilling 7 is a side-by-side migration, not an in-place upgrade.

## What MagnusBilling provides

- prepaid and postpaid customer billing;
- rates, rate plans, trunks, providers, and call routing;
- SIP/PJSIP accounts, DIDs, IVRs, queues, callbacks, and calling cards;
- call detail records, reports, invoices, refills, and vouchers;
- campaigns, call-shop operation, and reseller administration;
- payment, messaging, and external-system integrations;
- a web API and scheduled background processing.

The exact modules available depend on the installation, configuration, and
licensed extensions.

## Supported platform

The installer currently recognizes:

- Debian 11, 12, and 13;
- Ubuntu LTS 22.04, 24.04, and 26.04.

The runtime includes PHP, MariaDB, Apache, Asterisk 20, PJSIP, Fail2ban, and
host firewall configuration. A fresh virtual machine or dedicated server is
strongly recommended.

## Install

Connect to the new server as `root`, then run:

```bash
curl -O https://raw.githubusercontent.com/magnussolution/magnusbilling8/source/script/install.sh
bash install.sh
```

The server may restart when installation finishes. Open `http://SERVER_IP` and
sign in with the initial credentials shown by the installer. A standard new
installation starts with:

```text
Username: root
Password: magnus
```

Change this password immediately and limit panel and SSH access to trusted
networks.

For validation steps and troubleshooting, read the
[installation guide](wiki/en/get_started/quick_install.rst).

## Migrating from MagnusBilling 7

Do not install version 8 over a version 7 server. Provision a new supported
server, take verified backups, migrate the database, and review every trunk and
endpoint after conversion from `chan_sip` to PJSIP.

Follow the complete
[MagnusBilling 7 to 8 migration guide](wiki/en/get_started/migrate_from_mb7.rst)
and review the [release lifecycle](wiki/en/lifecycle.rst) before scheduling
production downtime.

## Architecture

```text
Browser / API clients
        |
Apache + PHP
        |
Yii 1 web application ---- MariaDB
        |                     |
        +---- AMI / AGI ------+
                 |
          Asterisk 20 / PJSIP
                 |
       carriers and SIP devices
```

The administration interface is built with Ext JS 6. The PHP backend uses
Yii 1, reads its database connection from
`/etc/asterisk/res_config_mysql.conf`, and communicates with Asterisk through
AMI, AGI, and generated configuration.

See [ARCHITECTURE.md](ARCHITECTURE.md) for component boundaries and important
entry points.

## Repository map

| Path | Purpose |
| --- | --- |
| `app/`, `classic/`, `modern/` | Ext JS application, views, and themes |
| `protected/controllers/` | HTTP and API controllers |
| `protected/models/` | Yii models and domain persistence |
| `protected/components/` | Billing, telephony, integration, and shared services |
| `protected/commands/` | Scheduled and administrative console commands |
| `resources/asterisk/` | AGI runtime and Asterisk integration |
| `resources/locale/` | User-interface translations |
| `script/` | installer, database schema, migration, and system configuration |
| `protected/tests/` | PHP test suites |
| `wiki/` | source for the project documentation and GitHub wiki |

## Development

This is a system-level application whose full runtime depends on Asterisk,
MariaDB, Apache, and Linux configuration. Use an isolated development
environment; never test installer or telephony changes on a production server.

The Ext JS application is built with Sencha Cmd 6.2:

```bash
sencha app build development
sencha app build production
```

PHP unit tests use PHPUnit. When PHPUnit is available, run an individual suite
from the repository root, for example:

```bash
phpunit protected/tests/unit/PjsipIpAuthenticationProbeTest.php
```

Test files under `protected/tests/` also include focused executable regression
suites. Run the tests relevant to the code you change and describe any
environment-dependent checks in the pull request.

Detailed contributor setup, standards, and the pull-request checklist are in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [Project definition and roadmap](PROJECT.md)
- [Architecture](ARCHITECTURE.md)
- [User and administrator wiki](wiki/en/index.rst)
- [What's new in MB8](wiki/en/whats_new_mb8.rst)
- [Support](SUPPORT.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Community and support

Use [GitHub Issues](https://github.com/magnussolution/magnusbilling8/issues) for
reproducible bugs and feature proposals. Use the channels listed in
[SUPPORT.md](SUPPORT.md) for installation and configuration questions.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security
vulnerabilities must be reported privately as described in
[SECURITY.md](SECURITY.md), not in a public issue.

## Contributing

Contributions are welcome. Before opening a pull request:

1. read [CONTRIBUTING.md](CONTRIBUTING.md);
2. search existing issues and pull requests;
3. keep changes focused and include tests or a verification procedure;
4. update English documentation for user-visible behavior.

## License

MagnusBilling is distributed under the
[GNU Lesser General Public License v3.0](LICENSE).

## Maintainer and acknowledgements

MagnusBilling was created by
[Adilson Magnus](https://github.com/magnussolution) / MagnusSolution.
See the repository
[contributors](https://github.com/magnussolution/magnusbilling8/contributors)
for everyone who has helped improve the project.
