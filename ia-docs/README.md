# MagnusBilling IA Docs (RAG-Ready)

This folder is a machine-oriented knowledge base for AI assistants.
It is intentionally separated from the human documentation under wiki/.

## Goals

- Fast retrieval for technical Q&A.
- Stable document IDs for indexing and embedding refresh.
- Explicit source mapping (code and video transcripts).
- Video-explanation logic transformed into FAQ-style chunks for user-support questions.
- Answer protocol that enforces evidence-first responses.

## Structure

- domains/: domain-centered technical truth (auth, billing, did, etc).
- playbooks/: response and investigation workflows.
- sources/: source inventories and traceability maps.
- indexes/: machine-readable manifests for ingestion.

## Audience Layers

- user-support: answer with panel menus, visible fields, and practical checks.
- operator: include Asterisk, cron, logs, services, and production side effects.
- developer: trace code entrypoints, models, controllers, AGI, commands, and tables.
- ai-agent: include doc IDs and retrieval paths for another assistant.

## Human Wiki vs IA Docs

- `wiki/` is the user-facing documentation published with Sphinx/Read the Docs.
- `ia-docs/` is the machine-oriented documentation used by AI assistants.
- Field descriptions are shared by the public Wiki and the in-panel help icons.
  Their source is `resources/help/help_{LANG}.js`; generated `.rst` files should
  not be treated as the first edit point for field help.

## Retrieval Ranking Hints

The chunk index includes ranking metadata optimized for support Q&A retrieval:

- priority_tier: faq, core, transcript, or context.
- priority_score: normalized weight from 0.4 to 1.0.
- rank_features: extra retrieval hints such as has_video_logic and has_resolution_steps.
- query intents include intent_priority and doc_weights for domain-aware retrieval.

Expected preference order during retrieval:

1. FAQ chunks generated from video logic.
2. Core curated chunks from playbooks/domains.
3. Raw transcript chunks as supporting context.

## Recommended RAG Ingestion Order

1. indexes/rag_manifest.json
2. playbooks/qa_protocol.md
3. playbooks/question_routing.md
4. playbooks/user_question_to_module_map.md
5. playbooks/troubleshooting_flows.md
6. domains/*.md
7. sources/glossary.md
8. sources/module_catalog.md
9. sources/database_table_index.md
10. sources/user_wiki_sources.md
11. sources/video_transcripts.md

## Documentation Audit

The latest repository documentation audit is stored at:

- indexes/documentation_audit_report.md

Use it before expanding docs. It lists outdated pages, missing pages,
code/documentation inconsistencies, and the remaining coverage gaps found by
comparing `wiki/`, `ia-docs/`, and current source code.

## Source Priority Policy

1. Current code in repository is authoritative.
2. Curated `ia-docs` documents provide AI response structure and routing.
3. User Wiki pages provide user-facing context and terminology.
4. Videos/transcripts are contextual and operational guidance.
5. If any documentation conflicts with code, answer with current code behavior.

## Rebuild Indexes

Run the index builder to regenerate manifest, chunks, and intents:

"/Users/magnus/Library/Mobile Documents/com~apple~CloudDocs/html/MBilling_7/.venv/bin/python" ia-docs/tools/build_rag_indexes.py

Regenerate code-derived catalogs before rebuilding indexes when controllers,
models, schema, Forms, or field help changed:

python3 ia-docs/tools/build_code_catalogs.py

Generated files:

- ia-docs/indexes/rag_manifest.json
- ia-docs/indexes/rag_chunks.jsonl
- ia-docs/indexes/query_intents.jsonl
- ia-docs/indexes/retrieval_eval.jsonl
- ia-docs/sources/module_catalog.md
- ia-docs/sources/database_table_index.md

The index builder also creates supporting chunks from `wiki/en` user
documentation. These chunks are lower priority than curated `ia-docs` chunks
and should be used as user-facing context, not as the final authority over code.
