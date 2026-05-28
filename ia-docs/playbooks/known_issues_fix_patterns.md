---
doc_id: MB-RAG-PLAYBOOK-KNOWN-ISSUES-FIX-PATTERNS
version: 1.0
language: en
tags: [playbook, known-issues, fix-patterns, support]
---

# Known Issues and Fix Patterns

## Usage Rule

- Use this playbook only after routing the question to the right domain.
- Always confirm current behavior in code and data before applying a fix pattern.
- If pattern and current code diverge, code is authoritative.

## Auth and Session

### Symptom

User authenticates but panel/menu does not fully load.

### Typical Root Causes

- Session flags incomplete or inconsistent after login check.
- Role/group mismatch causes menu/action filtering.
- Frontend bootstrap receives success without required permission context.

### Verification

- protected/controllers/AuthenticationController.php
- protected/components/BaseController.php
- classic/src/Application.js
- pkg_user, pkg_group_user, pkg_user_type

### Fix Pattern

1. Validate check/login response payload includes required flags.
2. Reconcile user type and group context.
3. Confirm frontend branch for authenticated state and menu building.

## Outbound Calls, Trunks, Rates

### Symptom

Call rejected, wrong trunk selected, or unexpected call pricing.

### Typical Root Causes

- Prefix specificity mismatch.
- Trunk group mode misunderstood (order/random/LCR).
- Provider cost records missing or null for expected prefix.

### Verification

- resources/asterisk/mbilling.php
- resources/asterisk/SearchTariff.php
- resources/asterisk/CalcAgi.php
- pkg_prefix, pkg_rate, pkg_rate_provider, pkg_trunk, pkg_trunk_group

### Fix Pattern

1. Replay number match from most specific prefix to generic fallback.
2. Confirm selected trunk strategy mode.
3. Validate provider buy-cost records for same prefix.
4. Correlate with call failure final SIP code.

## Inbound DID, Queue, IVR

### Symptom

Inbound DID does not route to expected destination.

### Typical Root Causes

- DID destination type differs from operator assumption.
- Queue or IVR target not active or not eligible.
- Route resolves but downstream leg fails.

### Verification

- resources/asterisk/DidAgi.php
- resources/asterisk/QueueAgi.php
- resources/asterisk/IvrAgi.php
- pkg_did, pkg_did_destination, pkg_queue, pkg_queue_member

### Fix Pattern

1. Confirm destination type configured for DID.
2. Validate route target availability (queue members, IVR options).
3. Trace AGI path until final leg result.

## SIPTrace and Rejected Calls

### Symptom

Support sees rejected code but cannot determine accountable leg.

### Typical Root Causes

- Single-leg analysis (ingress only or egress only).
- Overbroad capture filter obscures relevant packets.
- Last status code interpreted without full signaling context.

### Verification

- protected/controllers/SipTraceController.php
- protected/controllers/CallFailedController.php
- pkg_cdr_failed, SIP trace source records

### Fix Pattern

1. Use narrow capture window and specific filter.
2. Compare ingress and egress legs.
3. Link final provider response to rejected call detail.

## ActiveRecord CRUD Operations

### Symptom

Save/delete fails unexpectedly.

### Typical Root Causes

- FK constraints prevent delete/update.
- Model validation/rules reject payload.
- Payload mapping missing required attributes.

### Verification

- protected/components/BaseController.php
- protected/models/*.php related rules
- Browser network payload for save/destroy calls

### Fix Pattern

1. Validate request payload against model rules.
2. Check FK dependencies before delete.
3. If needed, apply model hooks for controlled side effects.

## Payments, Refill, Balance

### Symptom

Payment/refill exists but balance or invoice values diverge.

### Typical Root Causes

- Transaction record created without expected balance side effect.
- Payment method constraints block complete posting.
- Report aggregation reads a different source window or scope.

### Verification

- protected/controllers/RefillController.php
- protected/controllers/BuyCreditController.php
- pkg_refill, pkg_balance, pkg_method_pay

### Fix Pattern

1. Validate transaction status and timestamp.
2. Validate linked balance mutation event.
3. Reconcile report period/filter dimensions.

## Dashboard CallOnlineChart

### Symptom

Chart has missing points or time-shifted values.

### Typical Root Causes

- Timezone mismatch across OS, PHP, and database.
- Aggregation feeder job lag or missing run.
- Frontend interval parameter not matching backend grouping.

### Verification

- app/store/CallOnlineChart.js
- protected/controllers/CallOnlineChartController.php
- protected/models/CallOnlineChart.php
- protected/commands/CallChartCommand.php

### Fix Pattern

1. Validate timezone consistency.
2. Validate feeder command execution and source data.
3. Align frontend interval with backend grouping strategy.

## Campaign and Massive Call Runtime

### Symptom

Campaign does not start or stalls with partial logs.

### Typical Root Causes

- Campaign state/schedule prevents eligible dispatch.
- Target set has invalid or exhausted candidate records.
- Runtime dispatch proceeds but outbound route fails.

### Verification

- protected/controllers/CampaignController.php
- protected/models/Campaign.php
- resources/asterisk/MassiveCall.php
- pkg_campaign, pkg_campaign_log, pkg_campaign_phonebook

### Fix Pattern

1. Validate campaign active window and state.
2. Validate candidate target pool.
3. Correlate each failed attempt with outbound route diagnostics.

## Response Contract for AI Answers

1. State the likely domain and symptom class.
2. Provide the exact verification path (files and data).
3. Propose fix pattern as conditional guidance, not absolute claim.
4. End with next evidence needed when uncertainty remains.
