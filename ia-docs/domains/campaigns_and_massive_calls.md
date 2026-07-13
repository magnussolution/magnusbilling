---
doc_id: MB-RAG-DOMAIN-CAMPAIGNS-MASSIVE-CALLS
version: 1.0
language: en
tags: [campaign, massive-call, outbound, scheduler]
---

# Campaigns and Massive Calls

## Core Files

- protected/controllers/CampaignController.php
- protected/controllers/CampaignLogController.php
- protected/models/Campaign.php
- protected/models/CampaignLog.php
- resources/asterisk/MassiveCall.php

## What This Domain Answers

- Why campaign dialing is not starting or not progressing.
- Why campaign attempts are logged but calls are not completed.
- Why dialing behavior differs between campaign batches.

## Investigation Path

1. Validate campaign state and scheduling fields in campaign records.
2. Validate eligible phonebook/target records for the batch.
3. Validate runtime dispatch in MassiveCall logic.
4. Validate attempt and result consistency in campaign logs and CDR context.

## Typical Side Effects and Tables

- pkg_campaign
- pkg_campaign_log
- pkg_campaign_phonebook

## Support Guidance

- Separate scheduling issues from call routing issues.
- If attempts exist but calls fail, continue through outbound AGI and trunk diagnostics.
