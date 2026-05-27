Documentation Governance for AI Readiness
=========================================

This page defines how to keep MagnusBilling documentation reliable for AI systems.

Principles
==========

1. Code is primary truth.
2. Videos are contextual truth.
3. Wiki pages are operational truth.

Update Triggers
===============

Update AI docs when any of the following changes:

- Entrypoints: index.php, cron.php, resources/asterisk/mbilling.php
- Authentication/session flow
- AGI dispatch and billing logic
- DID/Queue/IVR routing logic
- Model-table mapping for major domains
- Cron summary/archive behavior

Required Update Set (Minimum)
=============================

For each significant code change, update at least:

1. wiki/en/ai/execution_paths.rst
2. wiki/en/ai/domain_map.rst
3. wiki/en/ai/qa_protocol.rst
4. wiki/en/ai/video_tutorial_map.rst (if video topic affected)

AI Answering SLA for Accuracy
=============================

Before publishing an AI answer in production support context, require:

- At least one entrypoint reference.
- At least one execution path reference.
- Explicit mention of write-side effects when applicable.
- Role/config caveat when behavior is conditional.

Conflict Resolution: Video vs Code
==================================

If tutorial video differs from current code:

1. Mark code as authoritative.
2. Add note in video_tutorial_map.rst describing divergence.
3. Optionally add migration note if old behavior is still relevant in legacy installs.

Versioning Notes
================

- Training videos are from v5/v6 and remain useful for logic.
- Final validation must always run against current code in this repository.

Suggested Quarterly Maintenance Routine
=======================================

1. Re-scan AGI entry and dispatch points.
2. Re-scan Authentication and BaseController guards.
3. Re-scan core billing/rate/trunk paths.
4. Re-scan report/archive commands.
5. Update AI docs and changelog notes.
