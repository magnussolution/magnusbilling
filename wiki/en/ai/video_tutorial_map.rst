Video Tutorial to Code Map
==========================

This page maps training videos in doc/videos to the most relevant code paths.
Even though the videos were recorded for v5/v6, the core execution logic is
largely preserved and remains useful for AI retrieval.

Source folder
=============

- doc/videos

Video 1 - Understanding URL Routes
==================================

Likely focus
------------

- URL routing and controller action dispatch in Yii.

Primary files
-------------

- index.php
- protected/config/main.php
- protected/components/BaseController.php
- protected/components/Controller.php
- protected/controllers/*.php

Video 2 - Login
===============

Likely focus
------------

- Login flow, session initialization, permission context.

Primary files
-------------

- protected/controllers/AuthenticationController.php
- classic/src/view/main/LoginController.js
- classic/src/Application.js
- protected/components/BaseController.php

Video 3 - Trunk Order
=====================

Likely focus
------------

- Trunk priority/selection and routing decisions.

Primary files
-------------

- resources/asterisk/SearchTariff.php
- resources/asterisk/CalcAgi.php
- resources/asterisk/StandardCallAgi.php
- protected/models/Trunk.php
- protected/models/TrunkGroup.php

Video 4 - Yii ActiveRecord
==========================

Likely focus
------------

- Model patterns, relations, validation, persistence.

Primary files
-------------

- protected/models/*.php
- protected/components/Model.php
- protected/components/BaseController.php

Video 5 - Continuing Login
==========================

Likely focus
------------

- Advanced login concerns, 2FA/session/check endpoints.

Primary files
-------------

- protected/controllers/AuthenticationController.php
- classic/src/Application.js
- protected/models/LogUsers.php
- protected/models/GAuthenticator.php

Video 6 - SpyCall
=================

Likely focus
------------

- Spy/monitor call flow in AGI.

Primary files
-------------

- resources/asterisk/mbilling.php
- resources/asterisk/SipCallAgi.php
- resources/asterisk/QueueAgi.php

Video 7 - Invoices
==================

Likely focus
------------

- Billing artifacts, invoice-related business logic, credit/accounting flow.

Primary files
-------------

- protected/controllers/RefillController.php
- protected/controllers/BuyCreditController.php
- protected/models/Refill.php
- protected/models/Balance.php
- protected/models/Methodpay.php

Video 8 - First View / Identify Controller / CallOnlineChart
=============================================================

Likely focus
------------

- ExtJS view-controller-store binding and backend endpoint mapping.

Primary files
-------------

- classic/src/Application.js
- app/store/CallOnlineChart.js
- protected/controllers/CallOnlineChartController.php
- protected/models/CallOnlineChart.php

Video 9 - Investigate Rejected Calls
====================================

Likely focus
------------

- Diagnosing failed calls from panel and logs.

Primary files
-------------

- protected/controllers/CallFailedController.php
- protected/models/CallFailed.php
- protected/controllers/SipTraceController.php
- protected/models/SipTrace.php
- resources/asterisk/mbilling.php

Video 10 - SipTrace
===================

Likely focus
------------

- SIP trace analysis and troubleshooting.

Primary files
-------------

- protected/controllers/SipTraceController.php
- protected/models/SipTrace.php
- AGI and trunk selection files for correlation:
  resources/asterisk/SearchTariff.php
  resources/asterisk/StandardCallAgi.php

How AI Should Use These Videos
==============================

1. Treat each video as domain context, not sole source of truth.
2. Confirm behavior against current code in the mapped files.
3. If video and code diverge, prioritize current code.
4. Register divergence in documentation governance notes.
