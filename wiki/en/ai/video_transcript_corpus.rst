Video Transcript Corpus
=======================

This page indexes the transcript corpus extracted from doc/videos for AI
retrieval and technical auditing.

Corpus Location
===============

- Source videos: doc/videos
- Transcripts: doc/videos/transcripts

Transcript Files (Canonical Set)
================================

- Video 1 - Entendo as URL routes.txt
- Video 2 - Login.txt
- Video 3 - Ordem de troncos.txt
- Video 4 - Yii Active record.txt
- Video 5 - Continuando o LOGIN.txt
- video 6 - spycall.txt
- video 7 - Faturas.txt
- video 8 - Primeira VIEW - Identificar uma controle - CallonlineChart.txt
- Video 9 - Verificar erro de chamadas pelo menu chamadas rejeitadas.txt
- Video 10 - siptrace.txt

Retrieval Notes
===============

- Language is predominantly Portuguese and domain-specific telephony vocabulary.
- Automatic transcription introduces spelling noise in identifiers; validate
  against repository file names before concluding.
- Use this corpus as context, then verify on current code paths.

Recommended AI Retrieval Strategy
=================================

1. Match question to domain using wiki/en/ai/domain_map.rst.
2. Pull relevant transcript snippets from corresponding tutorial file.
3. Confirm claims in code (controllers/models/AGI/commands).
4. Return answer with explicit evidence chain.

Known Limitations
=================

- Some terms are phonetically transcribed and may not match exact symbols.
- Technical abbreviations (for example SIP/AGI/CDR) can appear with variation.
- Legacy references from v5/v6 may differ from current implementation details.

Quality Rule
============

When transcript and code differ:

- Treat code as authoritative.
- Keep transcript as contextual explanation of intent and operational logic.
