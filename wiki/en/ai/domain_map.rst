Domain-to-Code Map
==================

Use this map to route questions to the correct code area quickly.

Authentication and Session
==========================

- Controllers: protected/controllers/AuthenticationController.php
- Core components: protected/components/BaseController.php, protected/components/Controller.php
- Main model: protected/models/User.php
- Main tables: pkg_user, pkg_group_user, pkg_user_type

SIP and IAX Accounts
====================

- Controllers: protected/controllers/SipController.php, protected/controllers/IaxController.php
- Models: protected/models/Sip.php, protected/models/Iax.php
- AGI: resources/asterisk/SipCallAgi.php, resources/asterisk/IaxCallAgi.php
- Tables: pkg_sip, pkg_iax

Outbound Calls and Billing
==========================

- AGI orchestration: resources/asterisk/mbilling.php
- Auth and checks: resources/asterisk/AuthenticateAgi.php
- Call flow: resources/asterisk/StandardCallAgi.php
- Rating/trunks: resources/asterisk/SearchTariff.php
- Billing/CDR writes: resources/asterisk/CalcAgi.php
- Tables: pkg_cdr, pkg_rate, pkg_prefix, pkg_trunk, pkg_user

Inbound DID and Routing
=======================

- Controllers: protected/controllers/DidController.php, protected/controllers/DiddestinationController.php
- Models: protected/models/Did.php, protected/models/Diddestination.php
- AGI: resources/asterisk/DidAgi.php
- Destination engines: resources/asterisk/IvrAgi.php, resources/asterisk/QueueAgi.php
- Tables: pkg_did, pkg_did_destination, pkg_did_use

Queue and Contact Center
========================

- Controllers: protected/controllers/QueueController.php, protected/controllers/QueueMemberController.php
- Models: protected/models/Queue.php, protected/models/QueueMember.php
- AGI: resources/asterisk/QueueAgi.php
- Tables: pkg_queue, pkg_queue_member, queue status-related tables

Rates and Provider Costs
========================

- Controllers: protected/controllers/RateController.php, protected/controllers/RateProviderController.php
- Models: protected/models/Rate.php, protected/models/RateProvider.php, protected/models/Prefix.php
- AGI consumption: resources/asterisk/SearchTariff.php, resources/asterisk/CalcAgi.php
- Tables: pkg_rate, pkg_rate_provider, pkg_prefix

Campaigns and Massive Calls
===========================

- Controllers: protected/controllers/CampaignController.php, protected/controllers/CampaignLogController.php
- Models: protected/models/Campaign.php, protected/models/CampaignLog.php
- AGI helper: resources/asterisk/MassiveCall.php
- Tables: pkg_campaign, pkg_campaign_log, pkg_campaign_phonebook

Payments and Refill
===================

- Controllers: protected/controllers/RefillController.php, protected/controllers/BuyCreditController.php
- Models: protected/models/Refill.php, protected/models/BuyCredit.php, protected/models/Methodpay.php
- Tables: pkg_refill, pkg_balance, pkg_methodpay

Observability and Diagnostics
=============================

- Controllers: protected/controllers/CallFailedController.php, protected/controllers/SipTraceController.php, protected/controllers/LogUsersController.php
- Models: protected/models/CallFailed.php, protected/models/SipTrace.php, protected/models/LogUsers.php
- Related AGI points: resources/asterisk/mbilling.php

AI Usage Notes
==============

- Start from the domain, then traverse controller/model/agi/table in that order.
- If a behavior involves live calls, AGI code has priority over web controller assumptions.
- If behavior differs by role, inspect session flags and group permissions.
