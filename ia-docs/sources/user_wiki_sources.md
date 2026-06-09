---
doc_id: MB-RAG-SOURCE-USER-WIKI
version: 1.0
language: en
tags: [source, wiki, user-docs, sphinx]
audience: [user-support, ai-agent]
---

# User Wiki Source Map

The English Wiki under `wiki/en` is the human-facing documentation for
MagnusBilling users. AI assistants may use it as supporting context after the
current code and curated `ia-docs` domain/playbook pages.

## Source Priority

1. Current code in repository.
2. Curated `ia-docs` domain/playbook/source documents.
3. User Wiki pages under `wiki/en`.
4. Video transcripts as operational context.

## Use Cases

- Explain visible panel fields and menus in user-facing language.
- Confirm terminology already used in published documentation.
- Provide support-friendly wording for common configuration workflows.
- Supplement field-help text generated from `resources/help/help_en.js`.

## Guardrails

- Do not edit generated Sphinx build output under `wiki/*/_build`.
- For field descriptions, update `resources/help/help_{LANG}.js` first.
- When Wiki and code disagree, current code wins.
- When Wiki and `ia-docs` disagree, inspect code and update the stale doc.
