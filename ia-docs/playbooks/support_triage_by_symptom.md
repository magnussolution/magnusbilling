---
doc_id: MB-RAG-PLAYBOOK-SUPPORT-TRIAGE-SYMPTOM
version: 1.0
language: en
tags: [support, triage, symptom, troubleshooting]
---

# Support Triage by Symptom

## Goal

Route MagnusBilling support questions to the right domain and evidence path quickly.

## Symptom Routing

### User can login but panel/menu does not load

- Primary docs: MB-RAG-DOMAIN-AUTH-SESSION, MB-RAG-PLAYBOOK-QA-PROTOCOL
- Verify: authentication/check response, session flags, frontend bootstrap path.

### Outbound call rejected or wrong trunk selected

- Primary docs: MB-RAG-DOMAIN-CALLFLOW-BILLING, MB-RAG-DOMAIN-RATES-PROVIDER-COSTS
- Verify: trunk mode, prefix specificity, provider rates, SIP final response.

### Inbound DID does not reach queue or IVR

- Primary docs: MB-RAG-DOMAIN-INBOUND-DID-QUEUE-IVR, MB-RAG-DOMAIN-QUEUE-CONTACT-CENTER
- Verify: did destination type, queue/ivr route state, AGI dispatch path.

### Rejected calls and SIP errors (500, 503, 4xx)

- Primary docs: MB-RAG-DOMAIN-OBS-SIPTRACE
- Verify: SIP trace both legs, rejected-call status detail, trunk host/dial format.

### Chart mismatch on CallOnlineChart

- Primary docs: MB-RAG-DOMAIN-DASHBOARD-CALLONLINECHART
- Verify: filter interval, aggregation source, timezone alignment.

### Refill/payment created but balance mismatch

- Primary docs: MB-RAG-DOMAIN-PAYMENTS-REFILL, MB-RAG-DOMAIN-INVOICES-REPORTS
- Verify: transaction status, balance side effect, report aggregation source.

### Field help icon or Wiki field description is missing

- Primary docs: MB-RAG-DOMAIN-DOCS-WIKI-FIELD-HELP, MB-RAG-PLAYBOOK-KNOWN-ISSUES-FIX-PATTERNS
- Verify: `resources/help/help_{LANG}.js`, matching ExtJS Form.js field, `wiki/generate.php`, generated `.rst` anchor.

## Response Template

1. Restate symptom in one line.
2. State routed domain and why.
3. Provide entrypoint-to-side-effect trace.
4. Provide 3-5 concrete checks.
5. If unresolved, provide next evidence to collect.
