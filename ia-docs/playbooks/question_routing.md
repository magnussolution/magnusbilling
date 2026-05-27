---
doc_id: MB-RAG-PLAYBOOK-QUESTION-ROUTING
version: 1.0
language: en
tags: [routing, triage, investigation]
---

# Question Routing

## Login / Session / Permission

- Start: protected/controllers/AuthenticationController.php
- Shared guards: protected/components/BaseController.php
- UI bootstrap checks: classic/src/Application.js

## Panel CRUD Behavior

- Start in frontend endpoint caller: app/store/*.js
- Then backend: protected/controllers/<Module>Controller.php
- Then model/table mapping: protected/models/<Module>.php

## Outbound / Billing / Trunk Selection

- Start: resources/asterisk/mbilling.php
- Then: AuthenticateAgi.php -> StandardCallAgi.php -> SearchTariff.php -> CalcAgi.php

## DID / Inbound / Queue / IVR

- Start: resources/asterisk/DidAgi.php
- Then route-specific: IvrAgi.php, QueueAgi.php, SipCallAgi.php

## Reports / Archive / Summaries

- Start: cron.php
- Commands: protected/commands/*Command.php

## SIP Failures / Rejected Calls

- Start: protected/controllers/CallFailedController.php
- Correlate: protected/controllers/SipTraceController.php
- Validate with AGI and trunk config.

## SIP / IAX Registration and Endpoint Account Issues

- Start: protected/controllers/SipController.php and protected/controllers/IaxController.php
- Then models: protected/models/Sip.php and protected/models/Iax.php
- Correlate runtime: resources/asterisk/SipCallAgi.php and resources/asterisk/IaxCallAgi.php

## Rate / Prefix / Provider Cost Mismatch

- Start: protected/controllers/RateController.php and protected/controllers/RateProviderController.php
- Then models: protected/models/Rate.php, Prefix.php, RateProvider.php
- Correlate AGI selection: resources/asterisk/SearchTariff.php and CalcAgi.php

## Queue and Contact Center Agent Delivery Problems

- Start: protected/controllers/QueueController.php and QueueMemberController.php
- Then models: protected/models/Queue.php and QueueMember.php
- Correlate inbound route: resources/asterisk/QueueAgi.php

## Campaign / Massive Call Runtime Problems

- Start: protected/controllers/CampaignController.php and CampaignLogController.php
- Then models: protected/models/Campaign.php and CampaignLog.php
- Correlate runtime dispatcher: resources/asterisk/MassiveCall.php

## Payment / Refill / Balance Divergence

- Start: protected/controllers/RefillController.php and BuyCreditController.php
- Then models: protected/models/Refill.php, BuyCredit.php, Methodpay.php
- Correlate totals with invoice/report paths

## Dashboard CallOnlineChart Inconsistencies

- Start frontend: app/store/CallOnlineChart.js and app/model/CallOnlineChart.js
- Then backend: protected/controllers/CallOnlineChartController.php
- Then model/command feed: protected/models/CallOnlineChart.php and protected/commands/CallChartCommand.php
