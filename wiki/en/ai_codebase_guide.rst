AI Codebase Understanding Guide
===============================

This guide helps AI assistants and maintainers quickly navigate MagnusBilling 8
and answer technical questions with traceable evidence.

Goal
====

Answer questions such as:

- Where a feature is implemented.
- Which runtime flow executes for each call type.
- Which tables/models/controllers are involved in an operation.
- Which files should be changed for a specific enhancement.

High-Level Architecture
=======================

MagnusBilling combines three core layers:

1. Yii 1.1 backend (PHP)
2. ExtJS 6.2 admin frontend
3. Asterisk AGI call engine

Simplified flow:

::

    Browser (ExtJS)
      -> index.php/<controller>/<action>
      -> Yii Controller
      -> Model (ActiveRecord)
      -> MySQL/MariaDB

    Asterisk Dialplan
      -> resources/asterisk/mbilling.php
      -> *Agi.php classes
      -> user/rate/trunk/CDR tables

Real Entry Points
=================

Web backend
-----------

- index.php: Yii bootstrap and application run.
- protected/config/main.php: model/component imports and DB connection.

Frontend
--------

- app.js: creates ExtJS app (Ext.application).
- classic/src/Application.js: MBilling.Application startup, session check,
  initial views/stores load, and global CSRF behavior.

AGI
---

- resources/asterisk/mbilling.php: AGI entrypoint, routes special commands,
  detects DID, SIP calls, queue, callback, and standard outbound flow.

Critical Directory Map
======================

::

    protected/
      controllers/   # HTTP endpoints (actionList/actionCreate/actionUpdate...)
      models/        # ActiveRecord for pkg_* tables
      components/    # BaseController, auth, utilities, integrations
      config/        # main.php, permissions, cron

    app/
      store/         # ExtJS data layer (ajax proxy)
      model/         # UI data definitions
      helper/        # utility helpers

    classic/src/
      Application.js # UI bootstrap and session/menu orchestration

    resources/asterisk/
      mbilling.php
      Magnus.php
      AuthenticateAgi.php
      CalcAgi.php
      DidAgi.php
      QueueAgi.php
      IvrAgi.php
      SipCallAgi.php
      StandardCallAgi.php
      SearchTariff.php

    script/
      install.sh     # server installation script
      database.sql   # base database schema

Question Router (AI Playbook)
==============================

Use this routing table to choose the first file to inspect.

* Login, session, permission, menu:
  start at ``protected/controllers/AuthenticationController.php``.
  Support files are ``protected/components/BaseController.php`` and
  ``protected/components/Controller.php``.

* Panel CRUD (user, sip, trunk, rate, did, queue):
  start at ``protected/controllers/<Entity>Controller.php``.
  Support files are ``protected/models/<Entity>.php`` and
  ``app/store/<Entity>.js``.

* Outbound call, billing, timeout, trunk selection:
  start at ``resources/asterisk/StandardCallAgi.php``.
  Support files are ``resources/asterisk/CalcAgi.php``,
  ``resources/asterisk/SearchTariff.php``, and
  ``resources/asterisk/AuthenticateAgi.php``.

* DID inbound, queue, IVR, destination routing:
  start at ``resources/asterisk/DidAgi.php``.
  Support files are ``resources/asterisk/IvrAgi.php``,
  ``resources/asterisk/QueueAgi.php``, Did/Diddestination models, and
  ``pkg_did`` / ``pkg_did_destination`` tables.

* Special commands (``*120`` voucher, ``*7`` pickup, queue pause):
  start at ``resources/asterisk/mbilling.php``.

* Global runtime settings (language, version, timeout, currency):
  start at ``pkg_configuration`` through the Configuration model.
  Support file is ``protected/components/LoadConfig.php``.

* UI issue after login/session check:
  start at ``classic/src/Application.js``.
  Support endpoint is ``index.php/authentication/check``.

* Payment, buy credit, gateway callback, refill side effect:
  start at ``protected/controllers/BuyCreditController.php`` or
  ``protected/controllers/<Gateway>Controller.php``.
  Support files are ``protected/models/Refill.php``,
  ``protected/models/BuyCredit.php``, and ``protected/models/Methodpay.php``.

* Install, update, migration, cron operation:
  start at ``script/install.sh``, ``cron.php``,
  ``protected/config/cron.php``, and
  ``protected/commands/UpdateMysqlCommand.php``.
  Support files are ``protected/commands/*.php`` and ``script/database.sql``.

Frontend-to-Backend Mental Model
================================

Repeated pattern:

1. ExtJS Store calls endpoint ``index.php/<controller>/<action>``
2. Yii Controller applies filters/permissions
3. ActiveRecord Model handles persistence
4. Controller returns JSON to grid/form

Recommended tracing sequence:

- Identify called endpoint in frontend (store or Ext.Ajax.request)
- Open matching controller under protected/controllers/
- Identify the model being used
- Validate fields and rules in model
- Confirm impacted table (pkg_* naming)

Public callbacks are different from authenticated ExtJS module calls. Payment,
SMS, WHMCS, Joomla, signup, and similar integration controllers may expose
provider-specific actions that do not follow the normal grid/form CRUD pattern.

Call Flow Summary
=================

Outbound
--------

1. Dialplan invokes AGI in resources/asterisk/mbilling.php
2. User authentication (AuthenticateAgi)
3. Number and restriction checks
4. Rate lookup (SearchTariff)
5. Timeout/cost calculation (CalcAgi)
6. Trunk selection and dial
7. CDR persistence and credit debit

Inbound DID
-----------

1. mbilling.php detects DID call
2. DidAgi locates DID and destinations
3. Routes to SIP/Queue/IVR/external number
4. Updates inbound CDR and related costs

Confidence Checklist for AI Answers
===================================

Before answering a technical question, validate:

1. Correct entry file for the feature.
2. Correct controller/model/table mapping (web flow).
3. Correct AGI class mapping (telephony flow).
4. Role-dependent behavior (admin/agent/client).
5. Global config impact on behavior.

If evidence is incomplete in the first file, follow calls until one of:

- SQL/table access
- model/controller method with side effects
- AGI execution or DIAL decision point

Common Interpretation Risks
===========================

- Similar module names can mislead (for example campaign* vs callSummary*).
  Always validate exact file path.
- Application.js loads many modules; do not assume one is active without
  checking menu/permissions.
- Session/security checks in BaseController::init() may block actions.
- AGI execution path changes based on Asterisk channel variables.

Recommended Reference Files
===========================

- ``wiki/en/ai_codebase_guide.rst``
- ``wiki/en/lifecycle.rst``
- ``wiki/en/module_overview.rst``
- ``wiki/GITHUB_WIKI_SYNC.md``

Durable Maintenance Conventions
================================

Documentation
-------------

* ``wiki/en`` is the source of truth for public English documentation.
* The GitHub Wiki is generated from ``wiki/en`` and must not be edited as an
  independent source.
* Keep project documentation inside ``wiki`` and follow the GitHub Wiki
  publication workflow described in ``wiki/GITHUB_WIKI_SYNC.md``.
* ``ia-docs`` is internal, machine-oriented material and must not be published
  as user documentation.
* Database installation and upgrade changes belong in
  ``protected/commands/UpdateMysqlCommand.php``.

Call diagnostics
----------------

* Diagnostics must execute the production AGI decision flow instead of
  reimplementing routing rules in a web service.
* The supported CLI diagnostic entrypoint is
  ``php resources/asterisk/mbilling.php debug NUMBER MB_ACC CALLERID``.
* Debug mode is a dry-run. It may read configuration and database records, but
  must not execute ``Dial``, ``Queue``, audio or channel commands, create CDRs,
  charge accounts, update operational tables, call external integrations, or
  leave database writes committed.
* The dry-run must stop at ``Magnus::run_dial()`` before dialing, CDR creation,
  or charging. Every new AGI path used by diagnostics must preserve this
  boundary.
* Do not bypass validations that occur before a channel operation. IVR
  schedules, holidays, audio compatibility, IVR options, Queue existence and
  membership, DID destinations, SIP groups, rates, offers, and trunk
  eligibility must be evaluated by their real AGI paths.
* Missing optional media or Queue agents may be warnings when the production
  flow can continue. Missing required routing objects or an empty selected
  destination is a blocking error.
* Fixed-IP SIP accounts are IP-only when ``insecure`` contains ``invite`` or
  no password is stored. Their generated endpoint uses ``identify_by=ip`` and
  has no inbound ``auth=``. Dynamic and explicitly credentialed accounts retain
  username/password authentication.
* AGI result serialization must produce exactly one ``MBILLING_RESULT`` line,
  substitute invalid UTF-8, and return a minimal valid JSON error contract if
  normal encoding fails.
* Technical details exposed by the web diagnostic are administrator-only and
  must never contain SIP passwords, trunk credentials, API keys, DSNs, or
  other secrets.

AGI logging
-----------

* Use ``AGI::verboseEvent()`` for validated routing decisions that the
  diagnostic must interpret.
* Event codes are stable identifiers used by tests, translations, and the web
  formatter.
* Verbose levels follow the project convention:

  * level 1: blocking error;
  * level 2: warning or skipped candidate;
  * level 3: routing decision;
  * level 4: operational detail;
  * level 25: SQL or deep technical trace.

* The normal initial Asterisk log level is 5. Messages visible at normal levels
  must be concise, actionable, and understandable without reading SQL.

Translations and presentation
-----------------------------

* Backend user-facing messages use ``Yii::t('zii', 'English source text')``.
* Add each new key to
  ``resources/locale/php/LANG/zii.php`` for every supported language.
* Web diagnostics follow the language selected in the active UI session, not
  the default language stored in ``pkg_configuration``.
* Preserve established technical terms such as ``Techprefix``; do not replace
  them with an invented localized term.
* Monetary values displayed by diagnostics use
  ``Yii::app()->session['currency']``.
* DID destination type names must match the values in
  ``classic/src/view/diddestination/Combo.js``.

Diagnostic user interface
-------------------------

* ``Check User`` belongs to ``classic/src/view/sip/Form.js`` and ``Check DID``
  belongs to ``classic/src/view/did/Form.js``. Both use the form
  ``extraButtons`` convention.
* Diagnostic actions and technical details are available exclusively to
  administrators.
* Diagnostic text must remain selectable so an administrator can copy either
  the complete result or only the relevant passage.

Maintenance Notes
=================

Update this guide whenever there is:

- a new entrypoint (web or AGI)
- a login/auth flow change
- a new central module (controller/model/AGI class)
- a structural change in core tables
- a change to the diagnostic dry-run safety boundary
- a change to translation, currency, permission, or documentation conventions
