---
doc_id: MB-RAG-PLAYBOOK-USER-QUESTION-MODULE-MAP
version: 1.0
language: en
tags: [playbook, support, module-map, routing]
audience: [user-support, operator]
---

# User Question to Module Map

Use this playbook to translate a user's symptom into MagnusBilling panel areas
and evidence paths.

## Outbound Call Does Not Complete

- Panel modules: Calls, Rejected Calls, SIP Trace, SIP Users, Trunks, Trunk
  Groups, Rates, Provider Rates, Prefixes, Users.
- Start docs: MB-RAG-DOMAIN-CALLFLOW-BILLING, MB-RAG-DOMAIN-RATES-PROVIDER-COSTS.
- First checks: user credit/status, SIP user status, dialed number format,
  matching prefix/rate, selected trunk, final SIP response.

## Wrong Price or Credit Deduction

- Panel modules: Calls, Rates, Provider Rates, Plans, Users, Offers, Services.
- Start docs: MB-RAG-DOMAIN-CALLFLOW-BILLING, MB-RAG-DOMAIN-RATES-PROVIDER-COSTS.
- First checks: matched prefix, initial block/increment, sell price, provider
  buy price, plan relation, offer/package effects.

## DID Does Not Ring

- Panel modules: DIDs, DID Destination, SIP Users, Queues, IVR, Rejected Calls,
  SIP Trace.
- Start docs: MB-RAG-DOMAIN-INBOUND-DID-QUEUE-IVR, MB-RAG-DOMAIN-QUEUE-CONTACT-CENTER.
- First checks: DID active status, destination type, destination target status,
  inbound AGI path, downstream SIP/trunk response.

## SIP User Does Not Register

- Panel modules: SIP Users, Users, Firewall, Servers, SIP Trace.
- Start docs: MB-RAG-DOMAIN-SIP-IAX-ACCOUNTS, MB-RAG-DOMAIN-AUTH-SESSION.
- First checks: SIP username/password, host/dynamic setting, status, NAT,
  firewall/fail2ban, server IP/port, Asterisk peer status.

## User Can Login But Menu Is Missing

- Panel modules: Users, Groups, Group Modules, Modules.
- Start docs: MB-RAG-DOMAIN-AUTH-SESSION.
- First checks: user type, group, permissions, session flags, frontend bootstrap.

## Payment or Refill Did Not Add Credit

- Panel modules: Refill, Buy Credit, Payment Methods, Users, Invoices/Reports.
- Start docs: MB-RAG-DOMAIN-PAYMENTS-REFILL, MB-RAG-DOMAIN-INVOICES-REPORTS.
- First checks: transaction status, callback controller, method constraints,
  balance mutation, report date filters.

## Campaign Does Not Call

- Panel modules: Campaigns, Phone Book, Campaign Log, Campaign Poll, Trunks,
  Rates, Rejected Calls.
- Start docs: MB-RAG-DOMAIN-CAMPAIGNS-MASSIVE-CALLS, MB-RAG-DOMAIN-CALLFLOW-BILLING.
- First checks: campaign status/date/time, phonebook candidates, max calls,
  audio compatibility, outbound route result.

## Queue Agents Do Not Receive Calls

- Panel modules: Queues, Queue Members, DIDs, DID Destination, SIP Users.
- Start docs: MB-RAG-DOMAIN-QUEUE-CONTACT-CENTER, MB-RAG-DOMAIN-INBOUND-DID-QUEUE-IVR.
- First checks: DID destination type, queue active state, member status, SIP
  registration, queue strategy.

## Dashboard or Call Chart Looks Wrong

- Panel modules: Dashboard, Calls Online, CallOnlineChart.
- Start docs: MB-RAG-DOMAIN-DASHBOARD-CALLONLINECHART.
- First checks: timezone, chart command/feed, aggregation interval, raw CDR
  comparison for same period.

## Help Icon or Wiki Field Description Is Missing

- Panel modules: Settings > Configuration, affected module Form.
- Start docs: MB-RAG-DOMAIN-DOCS-WIKI-FIELD-HELP.
- First checks: `Show fields help`, `resources/help/help_{LANG}.js`, ExtJS
  Form field name, generated `.rst` anchor.
