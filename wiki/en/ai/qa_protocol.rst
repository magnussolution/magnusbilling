AI Q&A Protocol for MagnusBilling
=================================

This protocol standardizes how AI should answer technical questions about MagnusBilling.

Golden Rule
===========

Do not answer from assumptions. Trace execution from entrypoint to side effect.

Mandatory Verification Checklist
================================

Before finalizing an answer, verify:

1. Correct entrypoint for the question type (web, AGI, or cron).
2. Correct code path (controller/component/model or AGI class chain).
3. Correct table impact (read/write side effects).
4. Role-dependent behavior (admin, agent, client) where relevant.
5. Config-dependent behavior (global flags in configuration).

Question Routing
================

Question about login/session/permissions
----------------------------------------

- Start at protected/controllers/AuthenticationController.php
- Confirm shared guards in protected/components/BaseController.php

Question about UI module behavior
---------------------------------

- Identify endpoint called in ``app/store/*.js`` or classic/src/*
- Follow to protected/controllers/<Module>Controller.php
- Follow model/table mapping in protected/models/<Module>.php

Question about call flow or billing
-----------------------------------

- Start at resources/asterisk/mbilling.php
- Follow to StandardCallAgi/DidAgi/QueueAgi/SipCallAgi
- Confirm pricing in SearchTariff/CalcAgi

Question about reports or archives
----------------------------------

- Start at cron.php and ``protected/commands/*.php``
- Confirm summary/archive target tables

Evidence Template
=================

When producing a technical answer, include:

1. Entrypoint
2. Execution path
3. Decision points (conditions/flags)
4. Side effects (DB writes, session changes, AGI actions)
5. Relevant files

Ambiguity Handling
==================

If there is ambiguity:

1. Present the two most likely paths.
2. State what configuration/session variable selects each path.
3. List exactly what to inspect to disambiguate.

High-Risk Misinterpretations to Avoid
=====================================

- Confusing ExtJS frontend controllers with Yii backend controllers.
- Assuming all call logic is in web controllers (telephony logic is AGI-first).
- Ignoring BaseController permission/session guards.
- Assuming DID always routes to SIP; destination type controls routing.

Answer Quality Bar
==================

A high-quality answer must be:

- Traceable to concrete files.
- Explicit about decision conditions.
- Explicit about write side effects.
- Clear about what is confirmed versus inferred.
