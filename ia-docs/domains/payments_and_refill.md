---
doc_id: MB-RAG-DOMAIN-PAYMENTS-REFILL
version: 1.0
language: en
tags: [payment, refill, buy-credit, balance, accounting]
---

# Payments and Refill

## Core Files

- protected/controllers/RefillController.php
- protected/controllers/BuyCreditController.php
- protected/models/Refill.php
- protected/models/BuyCredit.php
- protected/models/Methodpay.php

## What This Domain Answers

- Why a refill appears in UI but balance did not update as expected.
- Why payment method behavior differs by account/group.
- Why accounting totals differ between refill and billing views.

## Investigation Path

1. Validate refill/buy-credit operation status and timestamps.
2. Validate payment method and user/group constraints.
3. Validate balance side effects and reconciliation fields.
4. Cross-check invoice/report aggregates after payment changes.

## Typical Side Effects and Tables

- pkg_refill
- pkg_balance
- pkg_methodpay

## Support Guidance

- Always distinguish transaction creation from balance application.
- For disputes, provide evidence from transaction record plus resulting balance history.
