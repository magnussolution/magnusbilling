# Project

## Mission

MagnusBilling 8 provides an open, auditable platform for operating and billing
IP telephony services. It aims to keep the full path from customer management
to call rating, routing, and reporting under the operator's control.

## Current release line

Version 8 is the active development line. Its platform baseline is Asterisk 20
with PJSIP. MagnusBilling 7 deployments must move to a new server and follow the
documented database and telephony migration process.

The application metadata and database migration versions are not a promise of
Semantic Versioning. Release notes and migration instructions are authoritative
for upgrade impact.

## Product scope

### Core

- customers, resellers, authentication, and access control;
- rates, plans, providers, trunks, routes, and call billing;
- SIP endpoints, DIDs, IVRs, queues, callbacks, and calling cards;
- CDRs, invoices, balances, refills, vouchers, and reporting;
- campaigns, call-shop workflows, scheduled jobs, and APIs;
- Asterisk/PJSIP provisioning, AMI control, and AGI call processing.

### Integrations

The repository contains integrations for payment providers, messaging
services, DID suppliers, control panels, and external APIs. An integration is
supported only when its provider contract, credentials, and required runtime
dependencies are still compatible.

### Out of scope

- operating unsupported Linux distributions;
- in-place upgrades from MagnusBilling 7;
- replacing the carrier, network, or database backup strategy;
- guaranteeing compatibility with arbitrary third-party modules;
- storing deployment secrets in the source tree.

## Engineering priorities

1. **Billing correctness** — rating and balance changes must be deterministic
   and traceable.
2. **Safe telephony operation** — PJSIP configuration and live call actions
   must fail predictably and expose useful diagnostics.
3. **Security** — authentication, authorization, input handling, secrets, and
   installer defaults require conservative review.
4. **Migration confidence** — version 7 operators need explicit, reversible
   migration and validation steps.
5. **Operational clarity** — failures must be observable through logs,
   diagnostics, and actionable documentation.
6. **Maintainability** — new behavior should be isolated, tested, translated,
   and documented.

## Roadmap

The roadmap is direction, not a release commitment.

### Now

- stabilize Asterisk 20 and PJSIP behavior;
- improve call-failure and configuration diagnostics;
- harden installation, migration, and database update paths;
- keep user-facing documentation aligned with version 8;
- expand focused regression coverage around billing and telephony boundaries.

### Next

- reduce implicit coupling between controllers and system services;
- standardize integration error handling and secret management;
- improve automated checks for PHP, shell, localization, and documentation;
- make supported platform and upgrade compatibility easier to verify.

### Later

- modernize legacy framework boundaries incrementally without disrupting
  production operators;
- improve packaging and reproducible development environments;
- strengthen release automation and upgrade rollback guidance.

## Decision principles

- Production safety is preferred over upgrade convenience.
- Backward compatibility is preserved when it does not retain unsafe legacy
  behavior.
- Database or billing changes require explicit migration and rollback thinking.
- Telephony changes require both configuration-level and runtime validation.
- Public user-facing documentation is written in English and kept in the same
  change as the behavior it describes.

## Success criteria

The project is succeeding when operators can install or migrate predictably,
complete a correctly billed call through PJSIP, diagnose failures without
guesswork, recover from an upgrade using documented backups, and contribute a
focused change with a repeatable verification path.

## How work is proposed

Use GitHub Issues for bugs and proposals. A useful proposal states the operator
problem, affected workflow, compatibility impact, security implications,
database changes, and a test or validation plan. Large changes should be
discussed before implementation.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and
[ARCHITECTURE.md](ARCHITECTURE.md) for system boundaries.
