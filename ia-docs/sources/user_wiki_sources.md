---
doc_id: MB-RAG-SOURCE-USER-WIKI
version: 1.0
language: en
tags: [source, wiki, user-docs, sphinx]
audience: [user-support, ai-agent]
---

# User Wiki Source Map

The curated English pages under `wiki/en` are the human-facing documentation
for MagnusBilling users. The public GitHub Wiki excludes `wiki/en/modules`,
which is generated for contextual field help. AI assistants may use the public
pages as supporting context after current code and curated `ia-docs` pages.

## Source Priority

1. Current code in repository.
2. Curated `ia-docs` domain/playbook/source documents.
3. User Wiki pages under `wiki/en`.
4. Video transcripts as operational context.

## Use Cases

- Explain workflows and module responsibilities in user-facing language.
- Confirm terminology already used in published documentation.
- Provide support-friendly wording for common configuration workflows.
- Route detailed field questions to the contextual help source when needed.

## Guardrails

- Do not edit generated Sphinx build output under `wiki/*/_build`.
- For field descriptions, update `resources/help/help_{LANG}.js` first.
- Do not treat generated module pages as public GitHub Wiki content.
- When Wiki and code disagree, current code wins.
- When Wiki and `ia-docs` disagree, inspect code and update the stale doc.
