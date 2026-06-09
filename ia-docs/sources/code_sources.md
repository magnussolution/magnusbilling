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
- script/install.sh
- script/database.sql
- protected/commands/UpdateMysqlCommand.php

## Backend Control Layer

- protected/components/BaseController.php
- protected/components/Controller.php
- protected/controllers/AuthenticationController.php
- protected/controllers/*Controller.php
- protected/models/*.php

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
- resources/asterisk/SipCallAgi.php
- resources/asterisk/IaxCallAgi.php
- resources/asterisk/CallbackAgi.php
- resources/asterisk/MassiveCall.php
- resources/asterisk/PickupAgi.php
- resources/asterisk/PortabilidadeAgi.php
- resources/asterisk/PortalDeVozAgi.php
- resources/asterisk/SipTransferAgi.php
- resources/asterisk/Tts.php

## Frontend Bootstrap and Routing

- app.js
- classic/src/Application.js
- app/store/*.js
- app/model/*.js
- classic/src/view/<Module>/

## Wiki and Field Help Documentation

- wiki/generate.php
- resources/help/help_en.js
- resources/help/help_pt_BR.js
- resources/locale/*.js
- classic/src/view/*/Form.js
- wiki/en/modules/*/*.rst
- wiki/pt_BR/modules/*/*.rst

Field descriptions are used by both the published Wiki and the in-panel help
icons. For field-help edits, update `resources/help/help_{LANG}.js` first and
regenerate Wiki files with `wiki/generate.php`.

## Reports and PDF

- protected/components/Report.php
- invoice/report related controllers and commands

## Diagnostics

- protected/controllers/CallFailedController.php
- protected/controllers/SipTraceController.php
- protected/models/CallFailed.php
- protected/models/SipTrace.php

## Payments and Public Integrations

- protected/controllers/BuyCreditController.php
- protected/controllers/PaypalController.php
- protected/controllers/PagSeguroController.php
- protected/controllers/PagHiperController.php
- protected/controllers/MercadoPagoController.php
- protected/controllers/EfiController.php
- protected/controllers/IcepayController.php
- protected/controllers/MoipController.php
- protected/controllers/MolPayController.php
- protected/controllers/PlacetoPayController.php
- protected/controllers/CoinpayupController.php
- protected/controllers/WHMCSController.php
- protected/controllers/JoomlaController.php
- protected/controllers/SmsCallbackController.php

## Console Operations

- protected/commands/BackupCommand.php
- protected/commands/CallArchiveCommand.php
- protected/commands/CallChartCommand.php
- protected/commands/DidCheckCommand.php
- protected/commands/MassiveCallCommand.php
- protected/commands/PlanCheckCommand.php
- protected/commands/ServicesCheckCommand.php
- protected/commands/SipTraceCommand.php
- protected/commands/SummaryTablesCdrCommand.php
- protected/commands/TrunkSIPCodesCommand.php
- protected/commands/UpdateMysqlCommand.php
