---
doc_id: MB-RAG-DOMAIN-INVOICES-REPORTS
version: 1.0
language: en
tags: [invoice, pdf, report, fpdf, sql]
---

# Invoices and Reports

## Core Files

- protected/components/Report.php
- invoice-related controllers/commands in protected/controllers and protected/commands
- fpdf integration used by report component

## Practical Pattern

1. Aggregate values with SQL by requested business dimensions.
2. Build columns/records payload.
3. Render PDF via Report component and FPDF methods.

## Customization Notes

- Client requests often combine presentation changes and aggregation changes.
- Keep data logic separate from PDF rendering logic.
- Validate totals against billing source tables before format changes.

## Known Risk

Mismatched column definitions vs record keys can silently break report rendering.
