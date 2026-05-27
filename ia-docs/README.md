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
4. domains/*.md
5. sources/video_transcripts.md

## Source Priority Policy

1. Current code in repository is authoritative.
2. Videos/transcripts are contextual and operational guidance.
3. If transcript and code conflict, answer with current code behavior.

## Rebuild Indexes

Run the index builder to regenerate manifest, chunks, and intents:

"/Users/magnus/Library/Mobile Documents/com~apple~CloudDocs/html/MBilling_7/.venv/bin/python" ia-docs/tools/build_rag_indexes.py

Generated files:

- ia-docs/indexes/rag_manifest.json
- ia-docs/indexes/rag_chunks.jsonl
- ia-docs/indexes/query_intents.jsonl
- ia-docs/indexes/retrieval_eval.jsonl
