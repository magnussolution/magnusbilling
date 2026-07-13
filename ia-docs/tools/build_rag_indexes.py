#!/usr/bin/env python3
"""Build machine-readable RAG indexes for ia-docs.

Outputs:
- ia-docs/indexes/rag_manifest.json
- ia-docs/indexes/rag_chunks.jsonl
- ia-docs/indexes/query_intents.jsonl
- ia-docs/indexes/retrieval_eval.jsonl
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IA_DOCS = ROOT / "ia-docs"
INDEXES = IA_DOCS / "indexes"
TRANSCRIPTS = ROOT / "doc" / "videos" / "transcripts"
USER_WIKI = ROOT / "wiki" / "en"
ENGLISH_ONLY = True

DOC_ID_RE = re.compile(r"^doc_id:\s*(.+?)\s*$")

VIDEO_LOGIC_MAP = [
    {
        "video_number": 1,
        "title": "URL routes and controller actions",
        "questions": [
            "How do I identify which controller/action handles a menu request in MagnusBilling?",
            "How do I map an ExtJS request to Yii controller action?",
        ],
        "answer": "For panel CRUD requests, inspect the frontend store/proxy endpoint and map it to index.php/<controller>/<action>. In Yii, actionRead/actionSave/actionDestroy can be inherited from BaseController or overridden in the module controller.",
        "steps": [
            "Check app/store/*.js request URL.",
            "Open protected/controllers/<Module>Controller.php.",
            "If action is not present, inspect protected/components/BaseController.php.",
            "Validate payload and JSON response fields rows/count/sum.",
        ],
        "tags": ["routing", "controller", "extjs", "yii"],
    },
    {
        "video_number": 2,
        "title": "Login and session bootstrap",
        "questions": [
            "Why can a user log in but the menu does not load?",
            "Why does login succeed but dashboard does not load?",
        ],
        "answer": "The UI boot flow depends on AuthenticationController check endpoints and session flags returned to classic/src/Application.js. Missing or invalid session state keeps the app on login flow.",
        "steps": [
            "Inspect authentication check action response (success/permissions/session flags).",
            "Confirm session variables were set on backend.",
            "Validate frontend bootstrap logic in classic/src/Application.js.",
            "If needed, enable debug details in index.php for diagnosis.",
        ],
        "tags": ["auth", "session", "bootstrap", "permissions"],
    },
    {
        "video_number": 3,
        "title": "Trunk order, random, and LCR",
        "questions": [
            "Which trunk does MagnusBilling choose first?",
            "How does LCR choose the best trunk?",
        ],
        "answer": "Trunk selection is driven by trunk group mode: ordered sequence, SQL random ordering, or LCR using provider buy rate with NULL handling. Prefix matching uses longest-prefix-first logic.",
        "steps": [
            "Trace call entry in resources/asterisk/mbilling.php and StandardCallAgi.",
            "Inspect tariff/prefix resolution in SearchTariff and CalcAgi chain.",
            "Confirm trunk group mode (order/random/LCR).",
            "Validate provider rates and NULL ordering edge cases.",
        ],
        "tags": ["trunk", "lcr", "billing", "routing"],
    },
    {
        "video_number": 4,
        "title": "Yii ActiveRecord save/delete behavior",
        "questions": [
            "How do I validate save/delete errors in Yii backend?",
            "How to debug ActiveRecord update/delete constraints?",
        ],
        "answer": "Use ActiveRecord methods (find/save/delete/deleteAll/deleteByPk) with proper validation and FK awareness. For side effects, use model hooks like beforeSave/afterSave and verify with browser network + backend debug output.",
        "steps": [
            "Locate model rules and required fields in protected/models/<Model>.php.",
            "Check FK constraints for delete failures.",
            "Inspect BaseController actionSave flow and payload mapping.",
            "Use browser developer tools network trace for save/destroy requests.",
        ],
        "tags": ["yii", "activerecord", "crud", "debug"],
    },
    {
        "video_number": 6,
        "title": "Spycall operational troubleshooting",
        "questions": [
            "Why is Spycall not working for this extension?",
            "How to troubleshoot Spycall permission and dial flow?",
        ],
        "answer": "Spycall troubleshooting starts with permission scope, extension mapping, and AGI/dial path validation. Cross-check SIP/trunk signaling when behavior diverges from expected UI state.",
        "steps": [
            "Confirm user profile and permission scope for spy actions.",
            "Validate extension/account association.",
            "Trace AGI path and resulting dial command.",
            "Correlate with SIP diagnostics when needed.",
        ],
        "tags": ["spycall", "telephony", "permissions", "diagnostics"],
    },
    {
        "video_number": 7,
        "title": "Invoice generation and customization",
        "questions": [
            "How do I change invoice PDF layout and totals?",
            "How to customize invoice PDF without breaking totals?",
        ],
        "answer": "Keep SQL aggregation and PDF rendering separated. Validate source totals before layout edits, then apply rendering changes in report/invoice components.",
        "steps": [
            "Identify source aggregation query and grouping dimensions.",
            "Validate totals against billing tables.",
            "Apply rendering updates in report/FPDF layer.",
            "Re-test totals and formatting together.",
        ],
        "tags": ["invoice", "report", "fpdf", "billing"],
    },
    {
        "video_number": 8,
        "title": "Call online chart analysis",
        "questions": [
            "Why does the online calls chart show gaps?",
            "Why does CallOnlineChart show inconsistent data?",
        ],
        "answer": "Chart inconsistencies usually come from time window alignment, timezone assumptions, or aggregation source mismatch. Validate query filters and frontend interval handling.",
        "steps": [
            "Confirm requested time range and timezone.",
            "Validate aggregation source table and grouping.",
            "Inspect frontend chart request parameters.",
            "Compare with raw calls in same period.",
        ],
        "tags": ["dashboard", "chart", "reporting", "timezone"],
    },
    {
        "video_number": 9,
        "title": "Rejected calls investigation",
        "questions": [
            "Where can I see the rejected call reason?",
            "How to correlate rejected call reason with SIP signaling?",
        ],
        "answer": "Start from rejected calls list for high-level status, then correlate with SIP trace to identify final provider response and failed leg.",
        "steps": [
            "Open rejected calls details and identify last status code.",
            "Match call identifiers/time window in SIP trace.",
            "Inspect ingress and egress legs, not only one leg.",
            "Validate trunk configuration and dial format.",
        ],
        "tags": ["rejected-calls", "siptrace", "diagnostics", "trunk"],
    },
    {
        "video_number": 10,
        "title": "SIP trace packet analysis",
        "questions": [
            "How do I capture SIP trace for a specific customer?",
            "How do I interpret 500/503 and call legs in SIP trace?",
        ],
        "answer": "Use targeted filters and controlled capture windows. Interpret signaling by legs (client->server and server->trunk), then correlate final response codes with rejected call records.",
        "steps": [
            "Stop prior captures and start filtered capture window.",
            "Filter by number or call-id depending on case.",
            "Analyze INVITE/TRYING/183/200/BYE or failure responses.",
            "Correlate final trunk response with rejected-call panel.",
        ],
        "tags": ["siptrace", "packets", "diagnostics", "call-legs"],
    },
    {
        "video_number": 5,
        "title": "Login and session bootstrap",
        "questions": [
            "Why can a user log in but the menu does not load?",
            "Why does login succeed but dashboard does not load?",
        ],
        "answer": "The UI boot flow depends on AuthenticationController check endpoints and session flags returned to classic/src/Application.js. Missing or invalid session state keeps the app on login flow.",
        "steps": [
            "Inspect authentication check action response (success/permissions/session flags).",
            "Confirm session variables were set on backend.",
            "Validate frontend bootstrap logic in classic/src/Application.js.",
            "If needed, enable debug details in index.php for diagnosis.",
        ],
        "tags": ["auth", "session", "bootstrap", "permissions"],
    },
]


def read_doc_id(md_path: Path) -> str | None:
    text = md_path.read_text(encoding="utf-8", errors="ignore")
    if not text.startswith("---\n"):
        return None
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return None
    frontmatter = parts[0]
    for line in frontmatter.splitlines():
        match = DOC_ID_RE.match(line.strip())
        if match:
            return match.group(1).strip().strip('"').strip("'")
    return None


def build_manifest() -> dict:
    documents: list[dict] = []
    for kind in ["playbooks", "domains", "sources"]:
        folder = IA_DOCS / kind
        for md_file in sorted(folder.glob("*.md")):
            doc_id = read_doc_id(md_file)
            if not doc_id:
                continue
            rel = md_file.relative_to(ROOT).as_posix()
            doc_kind = "domain" if kind == "domains" else kind[:-1]
            documents.append({"doc_id": doc_id, "path": rel, "kind": doc_kind})

    return {
        "project": "MagnusBilling",
        "schema_version": "1.0",
        "source_priority": ["code", "ia-docs", "wiki", "transcript"],
        "documents": documents,
    }


def base_chunks() -> list[dict]:
    return [
        {
            "chunk_id": "MB-CHUNK-001",
            "doc_id": "MB-RAG-PLAYBOOK-QA-PROTOCOL",
            "title": "QA Rule 0",
            "text": "Never answer from assumptions. Trace from entrypoint to side effect.",
            "tags": ["qa", "evidence"],
        },
        {
            "chunk_id": "MB-CHUNK-002",
            "doc_id": "MB-RAG-PLAYBOOK-QUESTION-ROUTING",
            "title": "Call Flow Routing",
            "text": "For call flow and billing questions: start at resources/asterisk/mbilling.php, then AuthenticateAgi, StandardCallAgi, SearchTariff, CalcAgi.",
            "tags": ["routing", "agi", "billing"],
        },
        {
            "chunk_id": "MB-CHUNK-003",
            "doc_id": "MB-RAG-DOMAIN-AUTH-SESSION",
            "title": "Auth Core Files",
            "text": "Authentication and session context are centered in AuthenticationController.php and BaseController.php, with UI boot in classic/src/Application.js.",
            "tags": ["auth", "session"],
        },
        {
            "chunk_id": "MB-CHUNK-004",
            "doc_id": "MB-RAG-DOMAIN-CALLFLOW-BILLING",
            "title": "Outbound Canonical Path",
            "text": "AGI entry, authentication chain, number checks, tariff resolution, timeout and cost calculation, trunk selection, CDR write and credit debit.",
            "tags": ["outbound", "cdr", "trunk"],
        },
        {
            "chunk_id": "MB-CHUNK-005",
            "doc_id": "MB-RAG-DOMAIN-INBOUND-DID-QUEUE-IVR",
            "title": "Inbound Route Rule",
            "text": "Inbound routing is destination type driven; do not assume all DID calls route to SIP.",
            "tags": ["did", "ivr", "queue"],
        },
        {
            "chunk_id": "MB-CHUNK-006",
            "doc_id": "MB-RAG-DOMAIN-OBS-SIPTRACE",
            "title": "SIP Diagnostic Rule",
            "text": "Use narrow filters, inspect rejected details, correlate SIP signaling legs, and validate trunk formatting and provider responses.",
            "tags": ["siptrace", "troubleshooting"],
        },
        {
            "chunk_id": "MB-CHUNK-007",
            "doc_id": "MB-RAG-DOMAIN-INVOICES-REPORTS",
            "title": "Invoice Customization Pattern",
            "text": "Separate SQL aggregation logic from PDF rendering logic. Validate billing totals before format changes.",
            "tags": ["invoice", "report", "fpdf"],
        },
        {
            "chunk_id": "MB-CHUNK-008",
            "doc_id": "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS",
            "title": "Transcript Source Priority",
            "text": "Use transcripts as context, but confirm claims in current code when transcript and code differ.",
            "tags": ["source", "transcript", "priority"],
        },
        {
            "chunk_id": "MB-CHUNK-009",
            "doc_id": "MB-RAG-DOMAIN-DOCS-WIKI-FIELD-HELP",
            "title": "Field Help Source Rule",
            "text": "Field descriptions for both the public Wiki and in-panel help icons come from resources/help/help_{LANG}.js; update help files first, then run wiki/generate.php.",
            "tags": ["documentation", "wiki", "field-help"],
        },
        {
            "chunk_id": "MB-CHUNK-010",
            "doc_id": "MB-RAG-PLAYBOOK-USER-QUESTION-MODULE-MAP",
            "title": "User Question Routing",
            "text": "Translate user symptoms into panel modules first: calls use Calls, Rejected Calls, SIP Trace, SIP Users, Trunks, Rates, Provider Rates, Prefixes, and Users; DID issues use DIDs, DID Destination, SIP Users, Queues, IVR, Rejected Calls, and SIP Trace.",
            "tags": ["support", "module-map", "routing"],
        },
        {
            "chunk_id": "MB-CHUNK-011",
            "doc_id": "MB-RAG-PLAYBOOK-TROUBLESHOOTING-FLOWS",
            "title": "Troubleshooting Order",
            "text": "For operational support, answer in checks-first order: panel state, account or route configuration, runtime path, then evidence from CDR, Rejected Calls, SIP Trace, logs, or database tables.",
            "tags": ["support", "troubleshooting", "workflow"],
        },
        {
            "chunk_id": "MB-CHUNK-012",
            "doc_id": "MB-RAG-SOURCE-GLOSSARY",
            "title": "Canonical Terms",
            "text": "Use MagnusBilling terms consistently: DID is an inbound phone number; SIP user is an endpoint account; trunk is provider interconnection; prefix maps dialed numbers to rates; CDR is call evidence.",
            "tags": ["glossary", "terminology"],
        },
        {
            "chunk_id": "MB-CHUNK-013",
            "doc_id": "MB-RAG-SOURCE-MODULE-CATALOG",
            "title": "Module Catalog Rule",
            "text": "Use the generated module catalog to map a panel module to its ExtJS Form, Yii controller, ActiveRecord model, database table, and field-help signal.",
            "tags": ["module", "catalog", "code-map"],
        },
        {
            "chunk_id": "MB-CHUNK-014",
            "doc_id": "MB-RAG-PLAYBOOK-AUDIENCE-RESPONSE-POLICY",
            "title": "Audience Layer Rule",
            "text": "Choose the answer layer before responding: user-support gets panel steps, operator gets logs and services, developer gets entrypoint-to-side-effect code tracing, AI-agent gets doc IDs and retrieval path.",
            "tags": ["audience", "response-style"],
        },
    ]


def infer_tags(name: str) -> list[str]:
    key = name.lower()
    tags = ["transcript", "video"]
    if "login" in key:
        tags.extend(["auth", "session"])
    if "trunk" in key:
        tags.extend(["trunk", "routing"])
    if "route" in key:
        tags.append("routing")
    if "active record" in key or "yii" in key:
        tags.extend(["yii", "model"])
    if "invoice" in key:
        tags.extend(["invoice", "report"])
    if "siptrace" in key:
        tags.extend(["siptrace", "diagnostics"])
    if "rejected" in key:
        tags.extend(["rejected-calls", "diagnostics"])
    if "spycall" in key:
        tags.extend(["spycall", "telephony"])
    if "callonlinechart" in key:
        tags.extend(["dashboard", "chart"])
    # keep stable ordering and remove duplicates
    dedup: list[str] = []
    for t in tags:
        if t not in dedup:
            dedup.append(t)
    return dedup


def clean_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def split_text(text: str, target: int = 800, min_size: int = 260) -> list[str]:
    if len(text) <= target:
        return [text]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if not sentence:
            continue
        if not current:
            current = sentence
            continue
        next_size = len(current) + 1 + len(sentence)
        if next_size <= target:
            current += " " + sentence
        else:
            chunks.append(current.strip())
            current = sentence
    if current:
        chunks.append(current.strip())

    # Merge tiny trailing chunks for better retrieval quality.
    merged: list[str] = []
    for part in chunks:
        if merged and len(part) < min_size:
            merged[-1] = (merged[-1] + " " + part).strip()
        else:
            merged.append(part)
    return merged


def normalize_for_dedup(text: str) -> str:
    normalized = text.lower()
    normalized = re.sub(r"[^a-z0-9\s]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def is_low_quality_chunk(text: str) -> bool:
    if len(text) < 50:
        return True
    words = re.findall(r"\w+", text.lower())
    if len(words) < 10:
        return True
    unique_ratio = len(set(words)) / max(1, len(words))
    return unique_ratio < 0.25


def deduplicate_chunks(chunks: list[dict]) -> list[dict]:
    seen: set[str] = set()
    deduped: list[dict] = []
    for chunk in chunks:
        norm = normalize_for_dedup(chunk.get("text", ""))
        if not norm or norm in seen:
            continue
        seen.add(norm)
        deduped.append(chunk)
    return deduped


def score_chunk_priority(chunk: dict) -> tuple[float, str]:
    tags = chunk.get("tags", [])
    text = chunk.get("text", "")
    is_faq = "video-logic" in tags or "faq" in tags
    is_seed = str(chunk.get("chunk_id", "")).startswith("MB-CHUNK-00")
    is_transcript = str(chunk.get("chunk_id", "")).startswith("MB-CHUNK-T")
    is_wiki = str(chunk.get("chunk_id", "")).startswith("MB-CHUNK-W")

    if is_faq:
        score = 1.0
        tier = "faq"
    elif is_seed:
        score = 0.9
        tier = "core"
    elif is_transcript:
        score = 0.62
        tier = "transcript"
    elif is_wiki:
        score = 0.58
        tier = "wiki"
    else:
        score = 0.7
        tier = "context"

    if any(t in tags for t in ["diagnostics", "siptrace", "rejected-calls"]):
        score += 0.03
    if any(t in tags for t in ["auth", "billing", "routing"]):
        score += 0.02
    if len(text) > 1200:
        score -= 0.02

    score = max(0.4, min(1.0, round(score, 3)))
    return score, tier


def enrich_chunks_for_ranking(chunks: list[dict]) -> list[dict]:
    enriched: list[dict] = []
    for chunk in chunks:
        score, tier = score_chunk_priority(chunk)
        row = dict(chunk)
        row["priority_score"] = score
        row["priority_tier"] = tier
        row["rank_features"] = {
            "has_video_logic": "video-logic" in row.get("tags", []),
            "has_resolution_steps": bool(row.get("resolution_steps")),
            "source_type": "transcript" if str(row.get("chunk_id", "")).startswith("MB-CHUNK-T") else "curated",
        }
        if str(row.get("chunk_id", "")).startswith("MB-CHUNK-W"):
            row["rank_features"]["source_type"] = "wiki"
        enriched.append(row)
    return enriched


def find_video_logic_entry(file_name: str) -> dict | None:
    match = re.search(r"video\s*([0-9]+)", file_name.lower())
    if not match:
        return None
    video_number = int(match.group(1))
    for entry in VIDEO_LOGIC_MAP:
        if entry["video_number"] == video_number:
            return entry
    return None


def build_video_logic_chunks(start_index: int) -> list[dict]:
    chunks: list[dict] = []
    counter = start_index
    for txt_file in transcript_files():
        logic = find_video_logic_entry(txt_file.name)
        if not logic:
            continue
        for question in logic["questions"]:
            chunk_id = f"MB-CHUNK-Q{counter:04d}"
            counter += 1
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS",
                    "title": f"{logic['title']} / QA",
                    "question": question,
                    "answer": logic["answer"],
                    "resolution_steps": logic["steps"],
                    "text": f"Q: {question} A: {logic['answer']}",
                    "tags": ["video-logic", "faq", "user-question"] + logic["tags"],
                    "source_ref": f"tutorial_video_{counter:04d}",
                }
            )
    return chunks


def transcript_files() -> list[Path]:
    files = sorted(TRANSCRIPTS.glob("*.txt"))
    canonical = []
    for fp in files:
        name = fp.name.lower()
        if name == "video1.txt":
            continue
        if name.startswith("video ") or name.startswith("video"):
            canonical.append(fp)
    return canonical


def build_transcript_chunks(start_index: int) -> list[dict]:
    if ENGLISH_ONLY:
        # Raw transcripts are primarily Portuguese; keep retrieval corpus English-only.
        return []

    chunks: list[dict] = []
    counter = start_index
    for txt_file in transcript_files():
        raw = txt_file.read_text(encoding="utf-8", errors="ignore")
        text = clean_text(raw)
        if not text:
            continue
        parts = split_text(text)
        tags = infer_tags(txt_file.name)
        title_base = txt_file.stem
        for idx, part in enumerate(parts, start=1):
            if is_low_quality_chunk(part):
                continue
            chunk_id = f"MB-CHUNK-T{counter:04d}"
            counter += 1
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS",
                    "title": f"{title_base} / segment {idx}",
                    "text": part,
                    "tags": tags,
                    "source_file": txt_file.relative_to(ROOT).as_posix(),
                }
            )
    return deduplicate_chunks(chunks)


def clean_rst_for_retrieval(text: str) -> str:
    text = re.sub(r"^\s*\.\. _[^:]+:\s*$", "", text, flags=re.M)
    text = re.sub(r"^\s*\.\. (image|toctree)::.*$", "", text, flags=re.M)
    text = re.sub(r"^\s*:[a-zA-Z_-]+:.*$", "", text, flags=re.M)
    text = re.sub(r"`([^`<]+?)\s*<[^`]+>`_", r"\1", text)
    text = re.sub(r"^\s*[=+\-~#]{3,}\s*$", "", text, flags=re.M)
    text = text.replace("| ", "")
    return clean_text(text)


def wiki_files() -> list[Path]:
    if not USER_WIKI.exists():
        return []
    files: list[Path] = []
    for pattern in ["*.rst", "get_started/*.rst", "modules/*/*.rst", "asterisk_options/*.rst", "security/*.rst"]:
        files.extend(USER_WIKI.glob(pattern))
    return sorted({p for p in files if "_build" not in p.parts and p.name != "conf.py"})


def build_user_wiki_chunks(start_index: int) -> list[dict]:
    chunks: list[dict] = []
    counter = start_index
    for rst_file in wiki_files():
        raw = rst_file.read_text(encoding="utf-8", errors="ignore")
        text = clean_rst_for_retrieval(raw)
        if is_low_quality_chunk(text):
            continue
        title = rst_file.stem
        parts = split_text(text, target=900, min_size=220)
        for idx, part in enumerate(parts, start=1):
            if is_low_quality_chunk(part):
                continue
            chunk_id = f"MB-CHUNK-W{counter:04d}"
            counter += 1
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": "MB-RAG-SOURCE-USER-WIKI",
                    "title": f"{title} / wiki segment {idx}",
                    "text": part,
                    "tags": ["wiki", "user-docs", "support"],
                    "source_file": rst_file.relative_to(ROOT).as_posix(),
                }
            )
    return deduplicate_chunks(chunks)


def build_query_intents() -> list[dict]:
    return [
        {
            "intent_id": "MB-INTENT-001",
            "intent": "auth_login_failure",
            "examples": [
                "login fails with valid user",
                "user logs in but menu does not load",
                "why login fails for valid user",
                "session expired after login",
                "user logs in but menu is empty",
            ],
            "start_docs": ["MB-RAG-DOMAIN-AUTH-SESSION", "MB-RAG-PLAYBOOK-QA-PROTOCOL"],
        },
        {
            "intent_id": "MB-INTENT-002",
            "intent": "outbound_call_not_completing",
            "examples": [
                "outbound call rejected",
                "trunk returns 503",
                "outbound call rejected",
                "trunk returns 503",
                "call does not connect with credit",
            ],
            "start_docs": ["MB-RAG-DOMAIN-CALLFLOW-BILLING", "MB-RAG-DOMAIN-OBS-SIPTRACE"],
        },
        {
            "intent_id": "MB-INTENT-003",
            "intent": "did_inbound_routing",
            "examples": [
                "inbound did is not routing",
                "did should route to queue",
                "inbound DID not routing",
                "did should go to queue",
                "ivr destination not triggered",
            ],
            "start_docs": ["MB-RAG-DOMAIN-INBOUND-DID-QUEUE-IVR", "MB-RAG-PLAYBOOK-QUESTION-ROUTING"],
        },
        {
            "intent_id": "MB-INTENT-004",
            "intent": "dashboard_chart_inconsistent",
            "examples": [
                "call online chart has gaps",
                "wrong timezone on dashboard chart",
                "call online chart has gaps",
                "chart shows wrong time window",
                "timezone issue on dashboard",
            ],
            "start_docs": ["MB-RAG-DOMAIN-OBS-SIPTRACE", "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS"],
        },
        {
            "intent_id": "MB-INTENT-005",
            "intent": "invoice_pdf_customization",
            "examples": [
                "change invoice pdf layout",
                "invoice totals are inconsistent",
                "add totals to invoice pdf",
                "separate fixed mobile totals",
                "include package totals in invoice",
            ],
            "start_docs": ["MB-RAG-DOMAIN-INVOICES-REPORTS", "MB-RAG-PLAYBOOK-QA-PROTOCOL"],
        },
        {
            "intent_id": "MB-INTENT-006",
            "intent": "siptrace_interpretation",
            "examples": [
                "how to read siptrace for rejected call",
                "500 error from trunk",
                "how to read siptrace detail",
                "what 500 from trunk means",
                "which trunk attempted last",
            ],
            "start_docs": ["MB-RAG-DOMAIN-OBS-SIPTRACE", "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS"],
        },
        {
            "intent_id": "MB-INTENT-007",
            "intent": "trunk_order_and_lcr",
            "examples": [
                "which trunk is selected first",
                "random trunk order is not balanced",
                "lcr selected wrong trunk",
                "how trunk group order works",
                "why lcr did not pick cheapest provider",
            ],
            "start_docs": ["MB-RAG-DOMAIN-CALLFLOW-BILLING", "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS"],
        },
        {
            "intent_id": "MB-INTENT-008",
            "intent": "rejected_call_analysis",
            "examples": [
                "where to see rejected call reason",
                "last trunk response for this call",
                "481 error on call",
                "how to inspect failed call details",
                "why call failed but cdr is confusing",
            ],
            "start_docs": ["MB-RAG-DOMAIN-OBS-SIPTRACE", "MB-RAG-PLAYBOOK-QA-PROTOCOL"],
        },
        {
            "intent_id": "MB-INTENT-009",
            "intent": "spycall_issue",
            "examples": [
                "spycall has no audio",
                "extension monitoring has no permission",
                "spycall works for admin but not reseller",
                "how to troubleshoot spycall",
                "spycall permission denied",
            ],
            "start_docs": ["MB-RAG-SOURCE-VIDEO-TRANSCRIPTS", "MB-RAG-DOMAIN-OBS-SIPTRACE"],
        },
        {
            "intent_id": "MB-INTENT-010",
            "intent": "active_record_crud_debug",
            "examples": [
                "error deleting record with relationship",
                "save does not persist in database",
                "deleteAll removed less than expected",
                "how to debug yii activerecord save",
                "foreign key prevents delete in yii",
            ],
            "start_docs": ["MB-RAG-SOURCE-VIDEO-TRANSCRIPTS", "MB-RAG-PLAYBOOK-QA-PROTOCOL"],
        },
        {
            "intent_id": "MB-INTENT-011",
            "intent": "url_route_and_controller_mapping",
            "examples": [
                "which controller handles this menu",
                "how to map extjs endpoint to yii action",
                "where read save destroy are handled",
                "which action handles this request",
                "where actionread is implemented",
            ],
            "start_docs": ["MB-RAG-PLAYBOOK-QUESTION-ROUTING", "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS"],
        },
        {
            "intent_id": "MB-INTENT-012",
            "intent": "login_security_and_block",
            "examples": [
                "ip blocked after login attempts",
                "fail2ban blocks valid user",
                "invalid login attempts in loop",
                "how login brute-force protection works",
                "why ip got blocked after failed login",
            ],
            "start_docs": ["MB-RAG-DOMAIN-AUTH-SESSION", "MB-RAG-SOURCE-VIDEO-TRANSCRIPTS"],
        },
        {
            "intent_id": "MB-INTENT-013",
            "intent": "sip_iax_registration_issue",
            "examples": [
                "sip extension does not register",
                "iax account authenticates then drops",
                "sip registers but call does not complete",
                "why sip account is not registering",
                "iax auth failed intermittently",
            ],
            "start_docs": ["MB-RAG-DOMAIN-SIP-IAX-ACCOUNTS", "MB-RAG-PLAYBOOK-QUESTION-ROUTING"],
        },
        {
            "intent_id": "MB-INTENT-014",
            "intent": "rate_provider_cost_mismatch",
            "examples": [
                "applied rate differs from expected",
                "most specific prefix was not used",
                "provider cost is inconsistent",
                "why call used wrong rate",
                "provider cost mismatch on lcr",
            ],
            "start_docs": ["MB-RAG-DOMAIN-RATES-PROVIDER-COSTS", "MB-RAG-DOMAIN-CALLFLOW-BILLING"],
        },
        {
            "intent_id": "MB-INTENT-015",
            "intent": "queue_delivery_issue",
            "examples": [
                "queue is not delivering calls to agents",
                "did routes to queue but does not ring",
                "online queue member not receiving calls",
                "why queue agents are not receiving calls",
                "inbound queue route fails",
            ],
            "start_docs": ["MB-RAG-DOMAIN-QUEUE-CONTACT-CENTER", "MB-RAG-DOMAIN-INBOUND-DID-QUEUE-IVR"],
        },
        {
            "intent_id": "MB-INTENT-016",
            "intent": "payment_refill_balance_divergence",
            "examples": [
                "refill created without balance update",
                "balance does not match payment",
                "buy credit approved but balance unchanged",
                "why refill did not update balance",
                "payment posted but balance mismatch",
            ],
            "start_docs": ["MB-RAG-DOMAIN-PAYMENTS-REFILL", "MB-RAG-DOMAIN-INVOICES-REPORTS"],
        },
        {
            "intent_id": "MB-INTENT-017",
            "intent": "campaign_massivecall_runtime_issue",
            "examples": [
                "campaign does not start dialing",
                "massive call stopped midway",
                "campaign logs without completion",
                "why campaign dialer is not progressing",
                "massive call runtime error",
            ],
            "start_docs": ["MB-RAG-DOMAIN-CAMPAIGNS-MASSIVE-CALLS", "MB-RAG-DOMAIN-CALLFLOW-BILLING"],
        },
        {
            "intent_id": "MB-INTENT-018",
            "intent": "callonlinechart_inconsistency",
            "examples": [
                "online chart has missing points",
                "dashboard shows wrong time",
                "callonlinechart differs from cdr",
                "why call online chart misses intervals",
                "dashboard call chart timezone mismatch",
            ],
            "start_docs": ["MB-RAG-DOMAIN-DASHBOARD-CALLONLINECHART", "MB-RAG-SOURCE-VIDEO-CODE-FINDINGS"],
        },
        {
            "intent_id": "MB-INTENT-019",
            "intent": "create_new_module_guidance",
            "examples": [
                "how to create a new module in magnusbilling",
                "step by step to create module with user linked table",
                "documentation for ai to explain module creation",
                "how to create a new module in magnusbilling",
                "step by step for module creation with user foreign key",
            ],
            "start_docs": ["MB-RAG-PLAYBOOK-CREATE-MODULE-PKG-EXAMPLE", "MB-RAG-PLAYBOOK-QA-PROTOCOL"],
        },
        {
            "intent_id": "MB-INTENT-020",
            "intent": "wiki_field_help_generation",
            "examples": [
                "field help icon has no description",
                "how to update magnusbilling wiki field descriptions",
                "new form field is missing from wiki",
                "where are tooltip descriptions stored",
                "how does wiki/generate.php build module rst files",
            ],
            "start_docs": ["MB-RAG-DOMAIN-DOCS-WIKI-FIELD-HELP", "MB-RAG-PLAYBOOK-KNOWN-ISSUES-FIX-PATTERNS"],
        },
        {
            "intent_id": "MB-INTENT-021",
            "intent": "user_question_to_panel_module",
            "examples": [
                "which menu should I check for DID not ringing",
                "where do I see why a call failed",
                "which module controls SIP registration",
                "where should user check payment credit",
                "what panel modules help troubleshoot campaign calls",
            ],
            "start_docs": ["MB-RAG-PLAYBOOK-USER-QUESTION-MODULE-MAP", "MB-RAG-PLAYBOOK-TROUBLESHOOTING-FLOWS"],
        },
        {
            "intent_id": "MB-INTENT-022",
            "intent": "magnusbilling_term_definition",
            "examples": [
                "what is a DID in magnusbilling",
                "what is a trunk",
                "what does prefix mean in rates",
                "explain lcr in magnusbilling",
                "what is a cdr",
            ],
            "start_docs": ["MB-RAG-SOURCE-GLOSSARY", "MB-RAG-SOURCE-MODULE-CATALOG"],
        },
        {
            "intent_id": "MB-INTENT-023",
            "intent": "module_code_mapping",
            "examples": [
                "which controller handles sip users",
                "which model maps to pkg_trunk",
                "where is the form for rates",
                "map module to controller model table",
                "which table stores did destinations",
            ],
            "start_docs": ["MB-RAG-SOURCE-MODULE-CATALOG", "MB-RAG-SOURCE-DATABASE-TABLE-INDEX"],
        },
    ]


def default_doc_weights(start_docs: list[str]) -> list[dict]:
    weighted: list[dict] = []
    for i, doc_id in enumerate(start_docs):
        weight = 1.0 if i == 0 else 0.85
        weighted.append({"doc_id": doc_id, "weight": weight})
    return weighted


def intent_priority(intent_name: str) -> float:
    high = {
        "auth_login_failure",
        "outbound_call_not_completing",
        "did_inbound_routing",
        "siptrace_interpretation",
        "rejected_call_analysis",
        "callonlinechart_inconsistency",
    }
    medium = {
        "trunk_order_and_lcr",
        "spycall_issue",
        "login_security_and_block",
        "sip_iax_registration_issue",
        "rate_provider_cost_mismatch",
        "queue_delivery_issue",
        "payment_refill_balance_divergence",
        "campaign_massivecall_runtime_issue",
        "create_new_module_guidance",
        "wiki_field_help_generation",
        "user_question_to_panel_module",
        "magnusbilling_term_definition",
        "module_code_mapping",
    }
    if intent_name in high:
        return 1.0
    if intent_name in medium:
        return 0.9
    return 0.8


def enrich_intents_with_weights(intents: list[dict]) -> list[dict]:
    enriched: list[dict] = []
    for intent in intents:
        row = dict(intent)
        docs = row.get("start_docs", [])
        row["doc_weights"] = default_doc_weights(docs)
        row["intent_priority"] = intent_priority(row.get("intent", ""))
        row["retrieval_hints"] = {
            "prefer_tiers": ["faq", "core", "wiki", "transcript"],
            "require_source_priority": ["code", "ia-docs", "wiki", "transcript"],
            "fallback_to_transcript": True,
        }
        enriched.append(row)
    return enriched


def build_retrieval_eval_cases(intents: list[dict]) -> list[dict]:
    cases: list[dict] = []
    idx = 1
    for intent in intents:
        examples = intent.get("examples", [])
        if not examples:
            continue
        docs = intent.get("start_docs", [])
        primary_doc = docs[0] if docs else "MB-RAG-PLAYBOOK-QA-PROTOCOL"
        secondary_doc = docs[1] if len(docs) > 1 else primary_doc

        cases.append(
            {
                "test_id": f"MB-RAG-EVAL-{idx:03d}",
                "intent": intent["intent"],
                "query": examples[0],
                "expected": {
                    "min_hits": 3,
                    "top1_any_of_docs": [primary_doc],
                    "top3_should_include": [primary_doc, secondary_doc],
                    "preferred_tiers": ["faq", "core"],
                },
            }
        )
        idx += 1

        if len(examples) > 1:
            cases.append(
                {
                    "test_id": f"MB-RAG-EVAL-{idx:03d}",
                    "intent": intent["intent"],
                    "query": examples[1],
                    "expected": {
                        "min_hits": 3,
                        "top1_any_of_docs": [primary_doc, secondary_doc],
                        "top3_should_include": [primary_doc],
                        "preferred_tiers": ["faq", "core", "transcript"],
                    },
                }
            )
            idx += 1

    return cases


def write_json(path: Path, payload: dict | list) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict]) -> None:
    lines = [json.dumps(row, ensure_ascii=False) for row in rows]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    INDEXES.mkdir(parents=True, exist_ok=True)

    manifest = build_manifest()
    write_json(INDEXES / "rag_manifest.json", manifest)

    seed = base_chunks()
    transcript = build_transcript_chunks(start_index=1)
    video_logic = build_video_logic_chunks(start_index=1)
    user_wiki = build_user_wiki_chunks(start_index=1)
    all_chunks = deduplicate_chunks(seed + transcript + video_logic + user_wiki)
    all_chunks = enrich_chunks_for_ranking(all_chunks)
    write_jsonl(INDEXES / "rag_chunks.jsonl", all_chunks)

    intents = build_query_intents()
    intents = enrich_intents_with_weights(intents)
    write_jsonl(INDEXES / "query_intents.jsonl", intents)

    eval_cases = build_retrieval_eval_cases(intents)
    write_jsonl(INDEXES / "retrieval_eval.jsonl", eval_cases)

    print(f"Manifest documents: {len(manifest['documents'])}")
    print(f"Seed chunks: {len(seed)}")
    print(f"Transcript chunks: {len(transcript)}")
    print(f"Video logic QA chunks: {len(video_logic)}")
    print(f"User wiki chunks: {len(user_wiki)}")
    print(f"Total chunks: {len(all_chunks)}")
    print(f"Intents: {len(intents)}")
    print(f"Retrieval eval cases: {len(eval_cases)}")


if __name__ == "__main__":
    main()
