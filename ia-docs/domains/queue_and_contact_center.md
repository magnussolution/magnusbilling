---
doc_id: MB-RAG-DOMAIN-QUEUE-CONTACT-CENTER
version: 1.0
language: en
tags: [queue, queue-member, contact-center, inbound]
---

# Queue and Contact Center

## Core Files

- protected/controllers/QueueController.php
- protected/controllers/QueueMemberController.php
- protected/models/Queue.php
- protected/models/QueueMember.php
- resources/asterisk/QueueAgi.php

## What This Domain Answers

- Why DID inbound did not route to queue as configured.
- Why agents are not receiving calls from queue.
- Why queue membership changes are not reflected in runtime behavior.

## Investigation Path

1. Validate queue and member records (status, relation, strategy fields).
2. Validate DID destination points to queue route type.
3. Validate AGI queue dispatch path for current call leg.
4. Validate final call result in call failed or SIP diagnostics when needed.

## Typical Side Effects and Tables

- pkg_queue
- pkg_queue_member
- queue state/status related data used by runtime

## Video-Logic Notes

- For support, always verify route destination type first, then queue runtime behavior.
