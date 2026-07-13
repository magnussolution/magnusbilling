---
doc_id: MB-RAG-DOMAIN-DOCS-WIKI-FIELD-HELP
version: 1.0
language: en
tags: [documentation, wiki, field-help, extjs, sphinx, readthedocs]
---

# Documentation, Wiki, and Field Help

## Core Files

- wiki/generate.php
- resources/help/help_en.js
- resources/help/help_pt_BR.js
- resources/locale/*.js
- wiki/en/modules/*/*.rst
- wiki/pt_BR/modules/*/*.rst
- classic/src/view/*/Form.js

## What This Domain Controls

- Human-facing Wiki pages published from `wiki/` through Sphinx/Read the Docs.
- Contextual help icons shown beside fields in the MagnusBilling admin panel.
- Field-level descriptions loaded from `resources/help/help_{LANG}.js`.
- Synchronization between ExtJS form fields, the `wiki` database table, and generated `.rst` files.

## Source of Truth Rule

The field help files are the shared source for both documentation surfaces:

- Public Wiki: generated `.rst` files under `wiki/<lang>/modules/`.
- In-panel help: tooltip/help icons beside ExtJS form fields.

When a field description is wrong or missing, update `resources/help/help_en.js`
and `resources/help/help_pt_BR.js` first, then run `wiki/generate.php` to update
the `wiki` table and regenerate module pages.

## Field Discovery Path

1. Scan `classic/src/view/*/Form.js`.
2. Extract `name` and `fieldLabel` pairs from the same ExtJS field object.
3. Support labels built from multiple translations, such as `t('CID') + ' ' + t('Add prefix')`.
4. Insert or update rows in the `wiki` table for each language.
5. Load descriptions from `resources/help/help_{LANG}.js`.
6. Generate module `.rst` pages under `wiki/<lang>/modules/`.

## Current Coverage Baseline

- Current ExtJS Forms scanned: 80.
- Current form fields detected for Wiki/help coverage: 637.
- Current help entries per language: 664.
- Required user-facing help languages for field descriptions: `en` and `pt_BR`.

These counts are audit baselines, not permanent constants. Recount from code
when validating future changes.

## Configuration and UI Behavior

- The admin panel can show field help icons beside each field.
- The option `Show fields help` under Settings, Configuration controls whether
  those icons are shown.
- A good description must work in both places: short enough for an in-panel
  tooltip, but precise enough for the generated Wiki page.

## Verification Checklist

1. Confirm the field exists in the relevant `classic/src/view/<Module>/Form.js`.
2. Confirm the field key exists in both help files as `<module>.<field>`.
3. Confirm both descriptions are non-empty and explain user-facing behavior.
4. Run `php wiki/generate.php`.
5. Confirm the generated `.rst` contains the expected anchor:
   `.. _<module>-<field-with-dashes>:`.
6. Confirm Sphinx does not emit blocking errors.

## Common Failure Modes

- A field exists in ExtJS but has no help entry, causing missing tooltip/Wiki text.
- A description exists in only one language.
- The field parser misses unusual label formats or fields where `fieldLabel`
  appears before `name`.
- Generated `.rst` is edited directly instead of updating `resources/help`.
- Text is too long or too vague for the in-panel tooltip even if it renders in the Wiki.

## Answering Guidance for AI Assistants

- For documentation questions, distinguish human Wiki output from AI docs in `ia-docs`.
- For field-help questions, start with `resources/help/help_{LANG}.js`, not the generated `.rst`.
- For behavior questions about what a field actually does, inspect the model,
  controller, AGI, or command that consumes the field before rewriting the description.
- Preserve MagnusBilling terms used in the UI, such as DID, SIP user, trunk,
  CallerID, CNL, CallBack Pro, rate, prefix, and reseller.
