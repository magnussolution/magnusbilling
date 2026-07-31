# Architecture

## System context

MagnusBilling is a PHP web application coupled to a telephony runtime. The web
panel and API manage commercial and technical configuration; scheduled
commands maintain operational state; Asterisk executes calls; AGI applies
routing and billing logic; MariaDB is the shared system of record.

## Main components

### Web client

The Ext JS 6 application lives primarily in `app/`, with toolkit-specific code
under `classic/` and `modern/`. It communicates with Yii controllers over HTTP.
Generated bundles and framework sources are checked into this repository, so a
frontend change may affect both source and build artifacts.

### Web and API backend

`index.php` boots the Yii 1 application using `protected/config/main.php`.
Controllers in `protected/controllers/` handle panel and API requests. Models
in `protected/models/` map the domain to MariaDB. Reusable operational logic
belongs in `protected/components/` rather than in controllers.

CSRF and cookie validation are enabled by the main web configuration. New
endpoints must also enforce authentication, authorization, input validation,
and safe output handling appropriate to their callers.

### Console and scheduling

`cron.php` starts the Yii console application configured by
`protected/config/cron.php`. Commands under `protected/commands/` run periodic
work, database updates, report generation, and operational maintenance.
Commands must be safe under retry and must log enough context to diagnose
partial failure.

### Telephony runtime

New installations use Asterisk 20 and PJSIP. Files under
`resources/asterisk/` implement AGI call processing and supporting telephony
logic. Backend components communicate with Asterisk through AMI and regenerate
or reload configuration where required.

Treat calls from PHP to the shell, Asterisk CLI, AMI, and AGI as trust
boundaries. Validate identifiers and never interpolate untrusted input into a
command.

### Persistence

MariaDB stores configuration, balances, rates, and call records.
`script/database.sql` contains the installation baseline; update behavior is
implemented through the application's database update command.

The Yii configurations read database credentials from
`/etc/asterisk/res_config_mysql.conf`. Credentials and production configuration
must remain outside the repository.

## Request and call flows

### Administrative request

```text
Browser
  -> Apache/PHP
  -> index.php
  -> Yii controller
  -> model/component
  -> MariaDB and, when required, Asterisk AMI
  -> JSON/HTML response
```

### Call processing

```text
SIP device or carrier
  -> Asterisk 20 / PJSIP
  -> dialplan
  -> MagnusBilling AGI
  -> routing and rating data in MariaDB
  -> selected trunk/provider
  -> CDR, balance, and reporting updates
```

### Scheduled processing

```text
system scheduler
  -> cron.php
  -> Yii console command
  -> domain component/model
  -> MariaDB, filesystem, external service, or Asterisk
```

## External boundaries

MagnusBilling can communicate with payment gateways, email and messaging
providers, DID services, WHMCS, and other APIs. Each integration must define:

- where credentials are configured;
- timeouts and retry behavior;
- signature or webhook verification;
- idempotency behavior for financial operations;
- redaction of secrets and personal data from logs;
- a clear failure response for operators.

## High-risk changes

Changes in these areas require additional review and production-like
verification:

- rate matching, call duration, rounding, balance, refill, and invoice logic;
- database schema or update commands;
- authentication, permissions, API exposure, and webhook validation;
- installer, firewall, Fail2ban, Apache, MariaDB, or Asterisk configuration;
- PJSIP endpoint, trunk, route, dialplan, AMI, or AGI behavior;
- payment callbacks and any operation that may be repeated.

## Design guidance

- Keep controllers thin and move reusable behavior into components.
- Keep persistence rules in models or explicit domain services.
- Make financial and webhook operations idempotent where possible.
- Bound network and Asterisk operations with timeouts.
- Return stable machine-readable result codes and actionable human messages.
- Add translations for all new user-facing strings.
- Add a focused regression test for every fixed defect.
- Document operational or compatibility changes in the same pull request.

## Deployment assumptions

The supported installer owns significant system configuration. A production
deployment therefore spans the repository plus Apache, PHP, MariaDB, Asterisk,
PJSIP, cron, firewall, and Fail2ban state. Repository-only tests cannot prove a
complete deployment; release validation must include an isolated server and a
realistic inbound and outbound call path.
