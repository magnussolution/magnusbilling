---
doc_id: MB-RAG-DOMAIN-DASHBOARD-CALLONLINECHART
version: 1.0
language: en
tags: [dashboard, callonlinechart, timezone, chart, aggregation]
---

# Dashboard CallOnlineChart

## Core Files

- app/store/CallOnlineChart.js
- app/model/CallOnlineChart.js
- protected/controllers/CallOnlineChartController.php
- protected/models/CallOnlineChart.php
- protected/commands/CallChartCommand.php

## What This Domain Answers

- Why chart points are missing or shifted.
- Why online call counts differ from expected period.
- Why dashboard and raw call listings disagree.

## Investigation Path

1. Validate frontend request interval and hours filter parameters.
2. Validate backend aggregation query and grouping interval.
3. Validate command/job feed path that populates chart source.
4. Validate timezone consistency across OS, PHP, and MySQL.

## Typical Side Effects and Tables

- chart/summary data tables populated by call chart command
- CDR-derived aggregates used by dashboard endpoint

## Video-Logic Notes

- A recurring real-world issue is timezone mismatch; check this early.
