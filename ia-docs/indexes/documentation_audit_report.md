---
doc_id: MB-RAG-DOC-AUDIT-2026-06-09
version: 1.0
language: en
tags: [audit, documentation, coverage, wiki, ia-docs]
---

# Documentation Audit Report

Audit date: 2026-06-09

Scope:

- `wiki/`
- `ia-docs/`
- PHP backend under `protected/`
- Yii 1.1 controllers, models, components, and console commands
- ExtJS frontend under `app/`, `classic/src/`, and `modern/src/`
- Asterisk integration under `resources/asterisk/`
- Database structure from `script/database.sql`
- Installation and upgrade procedures
- API endpoints, billing, routing, payments, reports, queues, campaigns, and diagnostics

Primary source policy:

1. Current code in this repository is authoritative for behavior.
2. Existing English documentation in `wiki/en` and `ia-docs` is the primary documentation source of truth.
3. Generated Sphinx output under `wiki/*/_build` should not be edited directly.
4. Portuguese docs under `wiki/pt_BR` contain useful legacy detail, but requested updates must remain in English.

## Executive Summary

The repository already contains two useful documentation layers:

- Human-facing Sphinx pages under `wiki/en`.
- Machine-oriented RAG pages under `ia-docs`.

The strongest existing coverage is around core call flow, DID routing, queues, rates, SIP/IAX accounts, support triage, and AI answer protocols. The weakest coverage is around current module inventory, buildable English wiki navigation, payment gateway endpoints, console command operations, database breadth, and the ExtJS-to-Yii endpoint pattern.

Several English wiki pages are structurally outdated. The most important issue is `wiki/en/modules/index.rst`: it uses stale lowercase include paths while the current English module files use mixed-case names, and it ends with an incomplete Services section. The top-level English wiki also references `conf.rst` and `asterisk_options/directmedia.rst`, but the English source tree contains `config.rst` and no English `asterisk_options/directmedia.rst`.

## Outdated Documents

- `wiki/en/modules/index.rst`
  - Uses stale include paths such as `callonline/callonline.rst`, `callback/callback.rst`, `userrate/userrate.rst`, and `methodpay/methodpay.rst`.
  - Current English module files use paths such as `callOnLine/callOnLine.rst`, `callBack/callBack.rst`, `userRate/userRate.rst`, and `methodPay/methodPay.rst`.
  - References missing English pages such as `buycredit`, `didbuy`, `dashboardqueue`, `didww`, `dashboard`, `extra`, `extra2`, `extra3`, `campaignsend`, `campaignreport`, and `callfailed`.
  - Stops after an incomplete `Menu Summary Month Trunk` heading for services.

- `wiki/en/index.rst`
  - References `conf.rst`, but the existing English page is `config.rst`.
  - References `asterisk_options/directmedia.rst`, but this page exists only in `wiki/pt_BR`.

- `wiki/en/get_started/quick_install.rst`
  - Still gives the basic install command, but does not describe the repository's current entrypoints to verify after installation: `index.php`, `cron.php`, `resources/asterisk/mbilling.php`, `protected/config/main.php`, `protected/config/cron.php`, and `script/database.sql`.

- `wiki/en/get_started/update.rst`
  - Provides the update command but does not describe current post-upgrade checks for the Yii config, cron commands, AGI files, database schema, or generated frontend assets.

- `wiki/en/modules/api/api.rst`
  - Documents API credentials and permissions, but does not explain how current Yii action endpoints are exposed or how public callback-style controllers differ from authenticated ExtJS CRUD endpoints.

- `ia-docs/indexes/coverage_report.md`
  - Lists covered domains, but does not state the important limits found during the audit: the top table dictionary covers 30 of 92 database tables, and payment/notification/public callback endpoint documentation is partial.

- `ia-docs/sources/top30_operational_tables.md`
  - The title is accurate, but the page does not warn that `script/database.sql` currently defines 92 tables. Readers may incorrectly treat the top 30 dictionary as a full schema reference.

## Missing Documents

Missing or incomplete English coverage should be handled by updating existing docs first. New pages are only needed when there is no existing page to extend.

- English Direct Media / Asterisk option page.
  - `wiki/en/index.rst` already links to `asterisk_options/directmedia.rst`, but the English file is missing.

- Current module inventory / endpoint coverage.
  - Source contains controllers and ExtJS views for modules not represented in the English module wiki source, including `BuyCredit`, `CallFailed`, `CallShop`, `CallOnlineChart`, `CampaignReport`, `QueueDashBoard`, `QueueMemberDashBoard`, `RefillChart`, `Signup`, `StatusSystem`, `UserType`, and payment callback controllers.

- Public payment and callback endpoints.
  - Code contains controllers for `BuyCredit`, `Paypal`, `PagSeguro`, `PagHiper`, `MercadoPago`, `Efi`, `Icepay`, `Moip`, `MolPay`, `PlacetoPay`, `Coinpayup`, `WHMCS`, `Joomla`, and SMS callbacks.
  - `ia-docs/domains/payments_and_refill.md` only covers the generic refill path.

- Console command operations.
  - `protected/commands` includes operational commands such as `Backup`, `CallArchive`, `CallChart`, `DidCheck`, `MassiveCall`, `PlanCheck`, `ServicesCheck`, `SipTrace`, `SummaryTablesCdr`, `TrunkSIPCodes`, and `UpdateMysql`.
  - Existing install/update docs mention only backup and update at a high level.

- Complete database schema reference in English.
  - `script/database.sql` currently defines 92 tables.
  - `ia-docs/sources/top30_operational_tables.md` is useful for operational support, but it is not a complete schema dictionary.

- ExtJS frontend workflow.
  - `wiki/en/ai_codebase_guide.rst` describes the pattern, but the human wiki lacks a concise page describing how `app/store`, `app/model`, and `classic/src/view` map to Yii controllers.

## Code and Documentation Inconsistencies

- English wiki navigation does not match existing English file paths.
  - Current docs use mixed-case module directories; `wiki/en/modules/index.rst` uses older lowercase include targets.

- Top-level English wiki references missing or renamed pages.
  - `conf.rst` should point to `config.rst`.
  - `asterisk_options/directmedia.rst` should either exist in English or be removed from the English toctree.

- The module index does not match source module coverage.
  - Source has 88 top-level ExtJS classic view modules and 98 Yii controllers.
  - English module docs contain 69 module source pages.
  - Some missing pages are expected because not every controller is an admin menu module, but the docs do not explain this distinction.

- API docs imply a single external API library path.
  - Current source also exposes many Yii endpoints directly through `index.php/<controller>/<action>`, plus public callback controllers for payment gateways and integrations.

- Database coverage language is broader than actual machine docs coverage.
  - `ia-docs/indexes/coverage_report.md` says database sources are covered, while the detailed dictionary is explicitly top 30 only.

- Asterisk documentation is split.
  - `ia-docs` and `wiki/en/ai` point to current AGI files.
  - English human wiki lacks the linked Asterisk Direct Media page and does not summarize the current AGI entrypoint set.

## Documentation Update Basis

The following updates should be made from this audit:

1. Repair English wiki toctree and module includes so current source docs can build.
2. Add the missing English Direct Media page because the English index already links to it.
3. Extend existing IA docs for entrypoints, payments/refill, code source mapping, coverage limits, and operational table coverage.
4. Add compact current-code notes to installation and update docs.
5. Extend the API module page to distinguish configured API access from Yii HTTP endpoints and public callbacks.
6. Keep generated Sphinx output untouched.

## Potential Documentation Gaps Remaining

- Full field-by-field English pages for every ExtJS/Yii module that exists in code but has no English source page.
- Full 92-table English database dictionary.
- Gateway-specific payment setup pages for each payment callback controller.
- Complete cron schedule matrix by install profile.
- Full screenshots refresh for English wiki pages.
