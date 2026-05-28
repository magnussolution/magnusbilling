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

## AGI / Telephony Runtime

- resources/asterisk/mbilling.php
- resources/asterisk/Magnus.php

## Frontend Bootstrap

- app.js
- classic/src/Application.js

## Key Interpretation Rule

For call behavior, AGI files are authoritative over panel assumptions.
