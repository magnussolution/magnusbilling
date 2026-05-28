---
doc_id: MB-RAG-SOURCE-CODE-SOURCES
version: 1.0
language: en
tags: [source, code, files]
---

# Code Source Map

## Core Runtime

- index.php
- cron.php
- protected/config/main.php
- protected/config/cron.php

## Backend Control Layer

- protected/components/BaseController.php
- protected/components/Controller.php
- protected/controllers/AuthenticationController.php

## AGI Telephony Core

- resources/asterisk/mbilling.php
- resources/asterisk/Magnus.php
- resources/asterisk/AuthenticateAgi.php
- resources/asterisk/StandardCallAgi.php
- resources/asterisk/DidAgi.php
- resources/asterisk/QueueAgi.php
- resources/asterisk/IvrAgi.php
- resources/asterisk/SearchTariff.php
- resources/asterisk/CalcAgi.php

## Frontend Bootstrap and Routing

- app.js
- classic/src/Application.js
- app/store/*.js
- app/model/*.js

## Reports and PDF

- protected/components/Report.php
- invoice/report related controllers and commands

## Diagnostics

- protected/controllers/CallFailedController.php
- protected/controllers/SipTraceController.php
- protected/models/CallFailed.php
- protected/models/SipTrace.php
