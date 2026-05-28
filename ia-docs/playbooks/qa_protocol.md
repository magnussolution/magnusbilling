---
doc_id: MB-RAG-PLAYBOOK-QA-PROTOCOL
version: 1.0
language: en
tags: [qa, protocol, evidence, verification]
source_priority: [code, transcript, wiki]
---

# QA Protocol

## Rule 0
Never answer from assumptions. Trace from entrypoint to side effect.

## Mandatory Checks

1. Confirm correct entrypoint type: web, AGI, or cron.
2. Confirm execution path (controller/model or AGI chain).
3. Confirm DB side effects (read/write tables).
4. Confirm role/config conditions that change behavior.
5. Include concrete file evidence in final answer.

## Evidence Template

- Entrypoint:
- Path:
- Decision points:
- Side effects:
- Files checked:

## Ambiguity Policy

If unclear, provide:

1. Most likely path A.
2. Most likely path B.
3. Exact condition that selects each path.
4. What to inspect next to resolve ambiguity.

## High-Risk Misreads

- Frontend controller (ExtJS) vs backend controller (Yii).
- Assuming web controller owns telephony logic (AGI-first in call flows).
- Ignoring BaseController guards for auth/session/permissions.
- Assuming DID destination is always SIP.
