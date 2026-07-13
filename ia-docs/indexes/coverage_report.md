# IA Docs Coverage Report

## Covered Domains

- System entrypoints
- Auth/session
- Outbound call flow and billing
- Inbound DID, queue, IVR
- Observability and SIP trace
- Invoices and reports
- SIP and IAX accounts
- Rates and provider costs
- Queue and contact center
- Campaigns and massive calls
- Payments and refill
- Dashboard CallOnlineChart
- Documentation, Wiki, and field help generation
- Glossary and terminology guidance
- User question to module routing
- Audience-aware answer policy
- Troubleshooting flows
- Code-derived module catalog
- Full `pkg_*` database table index

## Covered Playbooks

- QA protocol
- Question routing
- Support triage by symptom
- Known issues and fix patterns

## Covered Sources

- Code source map
- Module catalog generated from controllers, models, ExtJS Forms, and field help
- Full database table index generated from schema and model mappings
- Glossary
- User Wiki source map and generated Wiki retrieval chunks
- Video transcript inventory
- Video/code findings summary
- Top 30 operational tables dictionary

## Coverage Limits Found in Latest Audit

- `script/database.sql` table inventory is covered by
  `sources/database_table_index.md`, while `top30_operational_tables.md`
  remains the curated operational dictionary.
- Payment/refill coverage documents the generic refill path, but
  gateway-specific callback behavior remains partial.
- English wiki module coverage does not yet have dedicated field pages for
  every current Yii controller or ExtJS module.
- Console command coverage is summarized by domain; it is not yet a full
  command-by-command operations manual.
- Generated Sphinx output under `wiki/*/_build` is not a source of truth for
  edits and should be regenerated from source files when needed.

## Remaining Suggested Expansions

- Incident postmortem template linked to retrieval_eval cases.
- Full table dictionary with columns, relationships, defaults, and operational
  side effects, beyond the generated table index.
- Payment gateway setup and callback matrix.
- Console command schedule and side-effect matrix.
- Field-level English pages for source modules that currently lack dedicated
  wiki pages.
- More real-world support Q&A examples from production tickets.
