---
doc_id: MB-RAG-SOURCE-GLOSSARY
version: 1.0
language: en
tags: [source, glossary, terminology, user-support]
audience: [user-support, operator, developer]
---

# MagnusBilling Glossary

Use these terms consistently when answering MagnusBilling users.

## Core Telephony

- AGI: Asterisk Gateway Interface runtime used by MagnusBilling to authenticate,
  route, bill, and complete calls.
- Asterisk: PBX engine used by MagnusBilling for SIP/IAX signaling, dialplan,
  media handling, and call execution.
- CallerID: Number or identity sent as the call origin. Some providers accept
  it, rewrite it, or require trunk-specific From settings.
- CDR: Call Detail Record. Billing and report evidence for completed or
  attempted calls.
- DID: Inbound phone number. DID routing can point to SIP users, queues, IVRs,
  callback flows, or custom destinations.
- Direct media: Asterisk option that may let RTP media flow directly between
  endpoints instead of through Asterisk.
- DTMF: Digits sent during calls, used by IVR, queues, and feature codes.
- IAX account: IAX endpoint account linked to a MagnusBilling user.
- IVR: Interactive Voice Response menu. Routes callers based on selected digits
  and configured schedules.
- Queue: Call distribution destination with members/agents and queue strategy.
- SIP Trace: Diagnostic capture of SIP signaling used to troubleshoot call legs,
  provider responses, and registration/call failures.
- SIP user: SIP endpoint account used by customers, devices, softphones, and
  internal routing.
- Trunk: Provider interconnection used to send outbound calls or SMS.

## Routing and Billing

- Buy price: Provider cost for the call, DID, or service.
- CallBack Pro: DID callback behavior that can return a call based on inbound
  detection and configured rules.
- CNL: Brazilian local numbering/tariff zone reference used in some provider,
  SIP, DID, and trunk workflows.
- LCR: Least Cost Routing. Trunk selection mode that considers provider buy
  cost when choosing the route.
- Plan: User billing plan that controls applicable rates, permissions, and
  signup behavior.
- Prefix: Dialed-number pattern used to match destination and tariff.
- Rate: Sell price charged to the customer.
- Rate provider: Provider buy-cost record used for cost and LCR decisions.
- Reseller: User profile that owns or manages downstream customers and may have
  separate prices or visibility.
- Sell price: Amount charged to the customer or reseller client.
- Trunk group: Ordered, random, or LCR group of trunks used by routing.

## Financial and Service Terms

- Balance: User credit available for calls, services, and purchases.
- Buy credit: User-facing credit purchase operation.
- Invoice/report: Aggregated financial or usage output; validate totals against
  billing source tables before changing presentation.
- Refill: Credit addition or payment record that may affect user balance.
- Service: Recurring subscription or add-on associated with a user or plan.
- Voucher: Prepaid credit token that can be redeemed by users.

## Documentation Terms

- Field help: Description stored in `resources/help/help_{LANG}.js` and shown
  both in generated Wiki pages and in-panel help icons.
- IA docs: Machine-oriented documentation under `ia-docs/` for AI assistants.
- User Wiki: Human-facing Sphinx documentation under `wiki/`.
