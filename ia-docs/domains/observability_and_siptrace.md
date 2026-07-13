---
doc_id: MB-RAG-DOMAIN-OBS-SIPTRACE
version: 1.0
language: en
tags: [diagnostics, siptrace, rejected-calls, troubleshooting]
---

# Observability and SIPTrace

## Core Files

- protected/controllers/SipTraceController.php
- protected/models/SipTrace.php
- protected/controllers/CallFailedController.php
- protected/models/CallFailed.php

## Diagnostic Workflow

1. Narrow filters first (time window, account/SIP id, destination).
2. Inspect rejected call details.
3. Correlate signaling path in SIP trace.
4. Validate trunk host/prefix/dial formatting.

## High-Value Hint

Single-leg analysis is risky. Validate ingress and egress signaling legs.

## Common Findings

- Provider response codes (for example 500/503/4xx) explain call rejection.
- Last attempted trunk in rejected list may differ from full attempted chain.
