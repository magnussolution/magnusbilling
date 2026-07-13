---
doc_id: MB-RAG-DOMAIN-AUTH-SESSION
version: 1.0
language: en
tags: [auth, session, permission]
---

# Auth and Session

## Core Files

- protected/controllers/AuthenticationController.php
- protected/components/BaseController.php
- protected/components/Controller.php
- classic/src/Application.js

## What This Domain Controls

- Login credential validation.
- Session variables (role, group, user id, credits, locale).
- Menu/action visibility and authorization context.

## Verification Checklist

1. Is login successful in backend response?
2. Are session flags set for role and group?
3. Does frontend check endpoint consume expected flags?
4. Are BaseController guards blocking action execution?

## Frequent Failure Modes

- Session exists but role flags mismatch expected permissions.
- Frontend boot fails after auth check despite valid credentials.
- SQL inject guard or login security logic blocks request path.
