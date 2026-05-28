---
doc_id: MB-RAG-DOMAIN-INBOUND-DID-QUEUE-IVR
version: 1.0
language: en
tags: [did, inbound, queue, ivr, routing]
---

# Inbound DID, Queue, IVR

## Core Files

- resources/asterisk/DidAgi.php
- resources/asterisk/IvrAgi.php
- resources/asterisk/QueueAgi.php
- protected/models/Did.php
- protected/models/Diddestination.php

## Routing Path

1. DID call detection.
2. DID lookup and destination resolution.
3. Dispatch by destination type.
4. Fallback and final handling.
5. Usage/CDR updates.

## Key Warning

Do not assume inbound always routes to SIP; destination type decides route.

## Typical Tables

- pkg_did
- pkg_did_destination
- pkg_did_use
- queue-related tables
