---
doc_id: MB-RAG-PLAYBOOK-AUDIENCE-RESPONSE-POLICY
version: 1.0
language: en
tags: [playbook, audience, response-style, support]
audience: [user-support, operator, developer]
---

# Audience Response Policy

MagnusBilling questions can come from administrators, resellers, operators,
developers, or AI agents. Choose the response layer before answering.

## User-Support Audience

Use when the user asks how to configure or troubleshoot from the panel.

- Prefer menu names and visible fields.
- Use short steps.
- Mention code only when it explains why the panel behaves that way.
- Example phrasing: "Open Rejected Calls and check the SIP code, then compare it
  with SIP Trace for the same time window."

## Operator Audience

Use when the user manages servers, Asterisk, cron, firewalls, or production
incidents.

- Include logs, commands, services, and side effects.
- Separate safe inspection from changes that affect calls.
- Reference AGI, cron, and database tables when useful.

## Developer Audience

Use when the user asks where behavior is implemented or how to change it.

- Start from entrypoint and trace to side effect.
- Reference concrete files, controller/model names, and tables.
- Confirm whether behavior is frontend, Yii controller/model, AGI, or cron.

## AI-Agent Audience

Use when preparing context for another AI.

- Provide document IDs and retrieval path.
- State source priority: code first, then IA docs, then user Wiki.
- Include exact files to inspect next.

## Field Description Audience

Field help must serve two audiences at once:

- In-panel tooltip: concise, user-facing, immediately actionable.
- Generated Wiki page: precise enough to explain behavior and consequences.

Avoid long implementation detail in field help unless the field is dangerous or
technical, such as trunk SIP parameters, rate blocks, direct media, or firewall.
