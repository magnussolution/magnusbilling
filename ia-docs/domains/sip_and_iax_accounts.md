---
doc_id: MB-RAG-DOMAIN-SIP-IAX-ACCOUNTS
version: 1.0
language: en
tags: [sip, iax, account, endpoint, authentication]
---

# SIP and IAX Accounts

## Core Files

- protected/controllers/SipController.php
- protected/controllers/IaxController.php
- protected/models/Sip.php
- protected/models/Iax.php
- resources/asterisk/SipCallAgi.php
- resources/asterisk/IaxCallAgi.php

## What This Domain Answers

- Why an extension/account fails to register.
- Why an extension can register but cannot complete calls.
- Why account authentication behavior differs between SIP and IAX.

## Investigation Path

1. Validate account existence and status in SIP/IAX model records.
2. Validate credential and transport fields expected by PBX endpoint.
3. Validate account-to-user/group relationship and permission scope.
4. Correlate with AGI call path if registration succeeds but call fails.

## Typical Side Effects and Tables

- pkg_sip
- pkg_iax
- linked user/group tables via account ownership

## Video-Logic Notes

- Support questions should separate endpoint registration from call authorization.
- If panel looks correct but calls fail, continue in AGI path before assuming UI issue.
