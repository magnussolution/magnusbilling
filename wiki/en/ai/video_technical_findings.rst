Video-Derived Technical Findings
================================

This page consolidates practical engineering insights extracted from training
videos in doc/videos and validated against current code paths.

Scope and Reliability
=====================

- Video baseline: MagnusBilling v5/v6 tutorials.
- Validation target: current repository code.
- Rule: when video and code diverge, code is authoritative.

Processed Tutorial Set (Current Pass)
=====================================

The findings below are based on transcripts generated from all 10 tutorial
videos under doc/videos.

Finding Group 1: HTTP Route and Action Pattern
===============================================

Observed in videos
------------------

- Frontend requests follow index.php/<controller>/<action>.
- Common CRUD actions are read, save, and destroy.
- Missing route parameters default to site/index behavior in Yii entry flow.

Code anchor points
------------------

- index.php
- protected/config/main.php
- protected/components/BaseController.php
- protected/controllers/SiteController.php

AI implications
---------------

- For panel issues, trace frontend endpoint first, then backend controller action.
- Avoid assuming REST conventions from other frameworks; follow current Yii action naming.

Finding Group 2: Login and Session Composition
===============================================

Observed in videos
------------------

- Login flow sets multiple session values consumed by frontend bootstrap.
- check endpoint returns role/session flags used by UI boot logic.
- Debug mode in index.php is practical for diagnosing route/action failures.

Code anchor points
------------------

- protected/controllers/AuthenticationController.php
- classic/src/Application.js
- index.php

AI implications
---------------

- Any answer about permissions/visibility must include session role flags.
- Distinguish authentication success from post-login UI initialization failures.

Finding Group 3: Trunk Order and Tariff Resolution
==================================================

Observed in videos
------------------

- Trunk group behavior is highlighted in three modes: ordered, random, and LCR.
- Outbound call path is explained from AGI entry to standard call processing.
- Prefix matching strategy is described as progressive substring reduction.
- before/after hook files around tariff search are mentioned for custom behavior.

Code anchor points
------------------

- resources/asterisk/mbilling.php
- resources/asterisk/StandardCallAgi.php
- resources/asterisk/CalcAgi.php
- resources/asterisk/SearchTariff.php

AI implications
---------------

- For trunk/rate questions, always trace AGI path first, not web controller path.
- If users report route selection anomalies, verify trunk mode and prefix specificity together.

Finding Group 4: ActiveRecord and Safe Data Operations
======================================================

Observed in videos
------------------

- Practical difference between delete via loaded model and conditional delete.
- Foreign key constraints are a common source of delete/update failures.
- Browser console and network tabs are used to confirm failing backend requests.

Code anchor points
------------------

- ``protected/models/*.php``
- protected/components/Model.php
- protected/components/BaseController.php

AI implications
---------------

- When deletion fails, include FK relationship diagnosis in the answer.
- Distinguish model-level validation failure from SQL-level constraint failure.

Finding Group 5: Login Abuse Logging and Operational Controls
==============================================================

Observed in videos
------------------

- Operational strategy shifted from pure fail2ban-style blocking to DB-backed login event tracking.
- Login failures are persisted to support auditing and controlled response logic.

Code anchor points
------------------

- protected/controllers/AuthenticationController.php
- protected/components/MagnusLog.php
- protected/models/LogUsers.php

AI implications
---------------

- For brute-force questions, check both firewall/fail2ban context and application log policies.
- Recommend evidence from LogUsers records before proposing network-level blocking changes.

Finding Group 6: SIPTrace Diagnostic Workflow
=============================================

Observed in videos
------------------

- Packet capture window is time-bounded and target-filtered.
- Troubleshooting compares signaling legs (client/proxy to server, server to trunk).
- Typical investigation follows INVITE -> provisional/final response -> CANCEL/BYE.
- Rejected-call analysis is correlated with SIP signaling outcomes.

Code anchor points
------------------

- protected/controllers/SipTraceController.php
- protected/models/SipTrace.php
- protected/controllers/CallFailedController.php
- protected/models/CallFailed.php

AI implications
---------------

- For call-failure analysis, include both SIP trace evidence and CDR/rejected-call context.
- Avoid single-leg conclusions; verify both ingress and egress legs.

Finding Group 7: Invoice PDF Architecture and Customization
===========================================================

Observed in videos
------------------

- Invoice generation flow is explained as select/aggregate first, then PDF render.
- The Report component extends FPDF and centralizes formatting conventions.
- Multi-section PDF layouts are implemented by passing additional column/record
  sets and customizing report behavior.

Code anchor points
------------------

- protected/components/Report.php
- protected/controllers/*Invoice* related controllers/commands
- fpdf library integration under project dependencies

AI implications
---------------

- For invoice customization requests, separate data aggregation changes from PDF
  rendering changes.
- Validate requested totals against existing billing source tables before
  changing report presentation.

Finding Group 8: Frontend-to-Backend Trace for CallOnlineChart
===============================================================

Observed in videos
------------------

- Practical method to find backend source from UI element: view -> store -> model -> proxy URL -> controller.
- CallOnlineChart time filter logic depends on hours parameter and SQL date interval.
- Dashboard chart inconsistencies can be caused by timezone mismatch between
  system/PHP and MySQL server time.

Code anchor points
------------------

- app/store/CallOnlineChart.js
- app/model/CallOnlineChart.js
- protected/controllers/CallOnlineChartController.php
- protected/models/CallOnlineChart.php
- protected/commands/CallChartCommand.php (or equivalent chart feeder command)

AI implications
---------------

- For dashboard chart anomalies, always check timezone alignment across OS,
  PHP runtime, and MySQL NOW().
- Include ingestion path (command job -> table -> controller -> chart) when
  explaining missing points in charts.

Finding Group 9: Rejected Calls Workflow in Operations
======================================================

Observed in videos
------------------

- Effective troubleshooting starts with narrow filters (date/time/accountcode)
  to avoid heavy queries.
- Rejected call details represent signaling outcomes and trunk response codes.
- Last attempted trunk behavior in rejected-call view is highlighted.

Code anchor points
------------------

- protected/controllers/CallFailedController.php
- protected/models/CallFailed.php
- protected/controllers/TrunkController.php

AI implications
---------------

- In support answers, include filtering strategy before deep diagnosis.
- Correlate rejected-call details with trunk host configuration and dial rules
  to distinguish provider errors from local routing issues.

Operational Notes
=================

- All tutorial videos are transcribed in this phase; maintain updates when new
  training videos are added.
- Keep this page concise and move stable rules into execution_paths.rst,
  domain_map.rst, and qa_protocol.rst.
