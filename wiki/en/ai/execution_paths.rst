Execution Paths (Source of Truth)
=================================

This page captures the highest-value execution paths in MagnusBilling.
Use these paths first when answering technical questions.

Entrypoints
===========

- Web application entry: index.php
- Cron entry: cron.php
- AGI entry: resources/asterisk/mbilling.php
- Frontend bootstrap: app.js and classic/src/Application.js

Path 1: Web Login -> Session -> Menu
====================================

1. classic/src/Application.js calls index.php/authentication/check.
2. Login form posts to index.php/authentication/login.
3. protected/controllers/AuthenticationController.php validates credentials.
4. Session keys are set (id_user, id_group, role flags, credit, language, permissions).
5. Menu/actions are built and returned to frontend.

Main files
----------

- protected/controllers/AuthenticationController.php
- protected/components/BaseController.php
- protected/components/Controller.php
- classic/src/Application.js

Path 2: UI CRUD -> Controller -> Model -> JSON
===============================================

1. ExtJS store or Ext.Ajax requests index.php/<controller>/<action>.
2. Yii controller action executes via BaseController lifecycle.
3. Permission checks are applied using session/AccessManager.
4. Model query/save runs over pkg_* tables.
5. JSON response returns rows/count/success/errors.

Main files
----------

- protected/components/BaseController.php
- protected/controllers/*.php
- protected/models/*.php
- app/store/*.js

Path 3: Outbound Call Billing
=============================

1. Asterisk invokes resources/asterisk/mbilling.php.
2. Authentication chain runs (callerid/accountcode/sip proxy/calling card).
3. Number restrictions and validation run.
4. Tariff lookup runs using destination/prefix rules.
5. Timeout and billing are computed.
6. Trunk is selected and dial executed.
7. CDR is persisted and credit debited.

Main files
----------

- resources/asterisk/mbilling.php
- resources/asterisk/AuthenticateAgi.php
- resources/asterisk/StandardCallAgi.php
- resources/asterisk/SearchTariff.php
- resources/asterisk/CalcAgi.php

Path 4: Inbound DID Routing
===========================

1. AGI detects inbound DID context.
2. DID record is loaded.
3. DID destination list is resolved by priority/type.
4. Route is dispatched to SIP, Queue, IVR, external number, or voicemail.
5. Inbound CDR and DID usage are updated.

Main files
----------

- resources/asterisk/DidAgi.php
- resources/asterisk/IvrAgi.php
- resources/asterisk/QueueAgi.php
- protected/models/Did.php
- protected/models/Diddestination.php

Path 5: Reporting and Archive Jobs
==================================

1. cron.php boots Yii console config.
2. Command classes aggregate CDR into summary tables.
3. Old CDR records are moved/archived based on configuration.

Main files
----------

- cron.php
- protected/config/cron.php
- protected/commands/SummaryTablesCdrCommand.php
- protected/commands/CallArchiveCommand.php

Notes for AI Answers
====================

- Always cite the path from entrypoint to side effect.
- Distinguish frontend controller (ExtJS) from backend controller (Yii).
- For telephony questions, start at AGI dispatch first.
