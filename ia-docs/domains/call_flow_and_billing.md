---
doc_id: MB-RAG-DOMAIN-CALLFLOW-BILLING
version: 1.0
language: en
tags: [agi, outbound, billing, tariff, trunk]
---

# Call Flow and Billing

## Core Files

- resources/asterisk/mbilling.php
- resources/asterisk/AuthenticateAgi.php
- resources/asterisk/StandardCallAgi.php
- resources/asterisk/SearchTariff.php
- resources/asterisk/CalcAgi.php

## Canonical Outbound Path

1. AGI entry in mbilling.php.
2. User authentication chain.
3. Number/restriction checks.
4. Prefix and tariff resolution.
5. Timeout/cost calculation.
6. Trunk selection and dial.
7. CDR write and credit debit.

## Trunk Strategy Notes

- Group behavior can be ordered, random, or LCR-like depending on config.
- Prefix specificity and trunk mode must be analyzed together.

## Side-Effect Tables (Typical)

- pkg_cdr
- pkg_rate
- pkg_prefix
- pkg_trunk
- pkg_user
