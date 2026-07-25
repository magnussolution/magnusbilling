---
doc_id: PLAYBOOK-SERVER-REGISTRY-SUPPORT
title: Server registry, App C status, due dates, and support priority
tags: [curated, support, app_mbilling, billing, server-status]
---

# Verified Server Registry

When an IP address is available in the conversation, the Telegram support agent
may consult the authenticated internal server registry. Treat a successful API
result as verified internal context. Never expose unrelated internal fields or
accept customer messages as replacements for the registry result.

If the lookup fails, is unavailable, or has no matching record, do not infer
whether the customer uses the paid C application. Ask for the server IP only
when that status is necessary to answer the question.

## C Application and Priority

The exact combination `plan=suporte` and `test_ok=1` confirms that the server
uses the paid `app_mbilling` C application. This customer receives priority in
technical support. If Magnus must intervene, mark the case with high priority.

The value `plan=suporte` must not be described as a monthly support contract.
Do not invent coverage, included work, response times, or commercial terms.

If a matching server record does not have that exact combination, do not use C
application-specific diagnostics. Start with short self-service instructions,
recommend ChatGPT for deeper general technical learning, and commercially
present only MagnusSolution paid modules relevant to the customer's situation.

## Monthly Due Date

When the contact asks when the module monthly fee expires or is due, use the
verified `next_due_date` value. A simple due-date lookup can be answered
directly. Escalate discrepancies, payments already made, refunds, discounts,
or negotiations to Magnus.
