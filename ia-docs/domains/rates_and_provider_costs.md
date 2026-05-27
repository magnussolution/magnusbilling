---
doc_id: MB-RAG-DOMAIN-RATES-PROVIDER-COSTS
version: 1.0
language: en
tags: [rate, rate-provider, prefix, lcr, trunk]
---

# Rates and Provider Costs

## Core Files

- protected/controllers/RateController.php
- protected/controllers/RateProviderController.php
- protected/models/Rate.php
- protected/models/RateProvider.php
- protected/models/Prefix.php
- resources/asterisk/SearchTariff.php
- resources/asterisk/CalcAgi.php

## What This Domain Answers

- Why call price is different from expected tariff.
- Why LCR selected a specific trunk/provider.
- Why prefix matching behaves unexpectedly.

## Investigation Path

1. Validate prefix specificity and active status in rate data.
2. Validate provider buy rates used by trunk/provider relation.
3. Validate trunk group mode (ordered, random, LCR).
4. Validate AGI tariff search path and timeout/cost computation.

## Critical Edge Cases

- Inactive tariffs can be ignored while broader prefixes still match.
- Null/empty provider rates can affect ordering behavior in LCR scenarios.
- Prefix match should be validated from most specific to less specific.

## Typical Side Effects and Tables

- pkg_rate
- pkg_rate_provider
- pkg_prefix
- pkg_trunk
