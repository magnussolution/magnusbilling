---
doc_id: MB-RAG-SOURCE-TOP30-OPERATIONAL-TABLES
version: 1.0
language: en
tags: [source, database, tables, data-dictionary]
---

# Top 30 Operational Tables (Machine Dictionary)

Current schema note:

- `script/database.sql` currently defines 92 `pkg_*` tables.
- This page intentionally documents the top 30 operational tables used most
  often in support, billing, routing, diagnostics, and report questions.
- For full schema validation, inspect `script/database.sql` and the matching
  ActiveRecord model in `protected/models/`.

Selection basis:

- Frequently referenced in support and billing/call troubleshooting.
- Present in current model mappings.
- High impact on call flow, routing, balances, diagnostics, and reports.

## 1) pkg_user

- Domain: identity and account ownership.
- Used by: auth/session, billing, permission checks.
- Common support question: user can login but behavior/role is unexpected.

## 2) pkg_user_type

- Domain: role profile and permission baseline.
- Used by: menu/action authorization.
- Common support question: same action works for admin but fails for reseller.

## 3) pkg_group_user

- Domain: tenant/group segmentation.
- Used by: visibility, ownership boundaries.
- Common support question: data appears for one account and not another.

## 4) pkg_sip

- Domain: SIP account credentials and endpoint settings.
- Used by: endpoint registration and SIP call path.
- Common support question: SIP extension not registering.

## 5) pkg_iax

- Domain: IAX account credentials and endpoint settings.
- Used by: IAX registration and call authentication.
- Common support question: IAX account authenticates intermittently.

## 6) pkg_trunk

- Domain: outbound trunk definitions.
- Used by: dialing and provider interconnection.
- Common support question: wrong trunk used on outbound attempt.

## 7) pkg_trunk_group

- Domain: trunk selection strategy container.
- Used by: ordered/random/LCR behavior.
- Common support question: trunk order appears inconsistent.

## 8) pkg_trunk_group_trunk

- Domain: relation between trunk groups and trunks.
- Used by: candidate trunk list per routing strategy.
- Common support question: configured trunk not considered in route.

## 9) pkg_prefix

- Domain: destination prefixes.
- Used by: matching dialed numbers to rates.
- Common support question: call matched broader prefix instead of specific one.

## 10) pkg_rate

- Domain: customer sell rates.
- Used by: call pricing and allowance checks.
- Common support question: charged value differs from expected tariff.

## 11) pkg_rate_provider

- Domain: provider buy costs.
- Used by: LCR and provider-cost comparison.
- Common support question: LCR did not pick lowest expected cost.

## 12) pkg_plan

- Domain: account plan controls.
- Used by: limits, prefixes, and rate applicability.
- Common support question: customer with plan cannot call expected destinations.

## 13) pkg_cdr

- Domain: primary call detail records.
- Used by: billing evidence and post-call analysis.
- Common support question: call completed but invoice/report missing line.

## 14) pkg_cdr_failed

- Domain: rejected/failed calls.
- Used by: troubleshooting status codes and failure history.
- Common support question: why call failed with specific SIP code.

## 15) pkg_call_online

- Domain: current/near-real-time call tracking.
- Used by: dashboard and online call monitoring.
- Common support question: active calls mismatch dashboard count.

## 16) pkg_call_chart

- Domain: chart feed for call dashboards.
- Used by: CallOnlineChart series aggregation.
- Common support question: chart points missing or shifted.

## 17) pkg_did

- Domain: inbound DID inventory.
- Used by: DID lookup on inbound leg.
- Common support question: DID not recognized or not routed.

## 18) pkg_did_destination

- Domain: DID routing destinations.
- Used by: route type dispatch (SIP/queue/IVR/external).
- Common support question: DID configured but routing target ignored.

## 19) pkg_did_use

- Domain: DID usage/accounting.
- Used by: inbound usage tracking.
- Common support question: DID usage appears inconsistent with traffic.

## 20) pkg_queue

- Domain: queue definitions.
- Used by: inbound queue delivery behavior.
- Common support question: DID reaches queue but no proper distribution.

## 21) pkg_queue_member

- Domain: queue agents/members.
- Used by: eligibility for queue delivery.
- Common support question: online agent not receiving calls.

## 22) pkg_queue_status

- Domain: queue runtime status snapshots.
- Used by: queue diagnostics.
- Common support question: queue appears idle despite incoming calls.

## 23) pkg_campaign

- Domain: outbound campaign metadata.
- Used by: campaign execution lifecycle.
- Common support question: campaign not starting or not progressing.

## 24) pkg_campaign_log

- Domain: campaign attempt logs.
- Used by: attempt/result auditing.
- Common support question: attempts logged but no successful calls.

## 25) pkg_campaign_phonebook

- Domain: campaign targets.
- Used by: dialer candidate list.
- Common support question: campaign skipped expected target numbers.

## 26) pkg_refill

- Domain: refill transactions.
- Used by: credit additions and payment records.
- Common support question: refill created but balance unchanged.

## 27) pkg_balance

- Domain: account balance state.
- Used by: credit checks and billing side effects.
- Common support question: balance diverges from transaction history.

## 28) pkg_method_pay

- Domain: payment method configuration.
- Used by: payment/refill processing routes.
- Common support question: method available to one account but blocked to another.

## 29) pkg_log_actions

- Domain: user login/action audit history.
- Used by: auth abuse review and traceability.
- Common support question: repeated login failures and block behavior.

## 30) pkg_configuration

- Domain: global operational configuration.
- Used by: runtime switches and platform-wide behavior.
- Common support question: system-wide behavior changed after config update.

## Retrieval Use Rule

- For support answers, start with symptom -> map to domain -> inspect 2-4 relevant tables above.
- Correlate table evidence with code path (controller/model/AGI) before final response.
