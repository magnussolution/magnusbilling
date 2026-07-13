---
doc_id: MB-RAG-DOMAIN-SYSTEM-ENTRYPOINTS
version: 1.0
language: en
tags: [architecture, entrypoint, bootstrap]
---

# System Entrypoints

## Web

- index.php
- protected/config/main.php

## Cron / Background

- cron.php
- protected/config/cron.php
- protected/commands/*.php

Current operational commands include backup, call archive, call chart,
audio conversion, DID checks, firewall/fail2ban updates, massive call
execution, notifications, plan/services checks, SIP proxy accounts, SIP trace,
SMS, SMTP config, status system, summary tables, trunk SIP codes, MySQL
updates, and user disk space checks.

## AGI / Telephony Runtime

- resources/asterisk/mbilling.php
- resources/asterisk/Magnus.php
- resources/asterisk/AuthenticateAgi.php
- resources/asterisk/StandardCallAgi.php
- resources/asterisk/DidAgi.php
- resources/asterisk/QueueAgi.php
- resources/asterisk/IvrAgi.php
- resources/asterisk/SipCallAgi.php
- resources/asterisk/IaxCallAgi.php
- resources/asterisk/CallbackAgi.php
- resources/asterisk/CalcAgi.php
- resources/asterisk/SearchTariff.php

## Frontend Bootstrap

- app.js
- classic/src/Application.js
- app/store/*.js
- app/model/*.js
- classic/src/view/<Module>/

## Key Interpretation Rule

For call behavior, AGI files are authoritative over panel assumptions.
For panel behavior, map ExtJS store/model/view files to the matching Yii
controller and ActiveRecord model before answering.
