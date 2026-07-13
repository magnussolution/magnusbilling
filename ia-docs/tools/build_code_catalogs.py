#!/usr/bin/env python3
"""Build code-derived IA documentation catalogs.

Outputs:
- ia-docs/sources/module_catalog.md
- ia-docs/sources/database_table_index.md
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IA_DOCS = ROOT / "ia-docs"


def camel_lower(name: str) -> str:
    return name[:1].lower() + name[1:] if name else name


def model_table(model_path: Path) -> str:
    text = model_path.read_text(encoding="utf-8", errors="ignore")
    match = re.search(
        r"function\s+tableName\s*\([^)]*\)\s*\{\s*return\s+['\"]([^'\"]+)['\"]",
        text,
        re.S,
    )
    return match.group(1) if match else ""


def first_sentence_from_help(help_entries: dict[str, str], key: str) -> str:
    value = help_entries.get(key.lower(), "").strip()
    if not value:
        return ""
    value = value.replace("||", " ")
    value = re.sub(r"\s+", " ", value)
    sentence = re.split(r"(?<=[.!?])\s+", value, maxsplit=1)[0]
    return sentence[:220]


def load_help_entries() -> dict[str, str]:
    path = ROOT / "resources/help/help_en.js"
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8", errors="ignore")
    entries: dict[str, str] = {}
    for module, field, value in re.findall(r"'(.*?)\.(.*?)': `([\s\S]*?)`,", text):
        entries[f"{module}.{field}".lower()] = value
    return entries


def table_domain(table: str) -> str:
    key = table.replace("pkg_", "")
    if key.startswith(("cdr", "call_", "call")):
        return "calls and reports"
    if key.startswith(("sip", "iax", "trunk")):
        return "telephony endpoints and trunks"
    if key.startswith(("rate", "prefix", "provider")):
        return "rates, routing, and providers"
    if key.startswith(("did", "queue", "ivr")):
        return "inbound routing"
    if key.startswith(("campaign", "phonebook")):
        return "campaigns"
    if key.startswith(("refill", "method", "balance", "voucher", "send_credit")):
        return "payments and credit"
    if key.startswith(("user", "group", "module")):
        return "users, permissions, and menus"
    if key.startswith(("services", "offer", "plan")):
        return "plans, offers, and services"
    if key.startswith(("sms", "smtp", "template")):
        return "messaging"
    if key.startswith(("firewall", "log", "status", "servers")):
        return "operations and diagnostics"
    return "other"


def build_module_catalog() -> str:
    controllers = {
        p.stem.removesuffix("Controller"): p
        for p in (ROOT / "protected/controllers").glob("*Controller.php")
    }
    models = {p.stem: p for p in (ROOT / "protected/models").glob("*.php")}
    forms = {p.parent.name: p for p in (ROOT / "classic/src/view").glob("*/Form.js")}
    controllers_lc = {name.lower(): path for name, path in controllers.items()}
    models_lc = {name.lower(): path for name, path in models.items()}
    help_entries = load_help_entries()

    modules = sorted({camel_lower(k) for k in controllers} | {camel_lower(k) for k in models} | set(forms), key=str.lower)

    lines = [
        "---",
        "doc_id: MB-RAG-SOURCE-MODULE-CATALOG",
        "version: 1.0",
        "language: en",
        "tags: [source, module, extjs, yii, catalog]",
        "---",
        "",
        "# Module Catalog",
        "",
        "This catalog is generated from current code. Use it to map user-facing",
        "panel modules to ExtJS forms, Yii controllers, ActiveRecord models,",
        "database tables, and field-help descriptions.",
        "",
        "## Reading Rule",
        "",
        "- `Form.js` indicates a user-facing form module exists in the Classic ExtJS UI.",
        "- `Controller.php` indicates a Yii web endpoint exists.",
        "- `Model.php` indicates an ActiveRecord or related backend model exists.",
        "- Table names are parsed from model `tableName()` methods when available.",
        "- Field help comes from `resources/help/help_en.js` and should be checked",
        "  before answering field-definition questions.",
        "",
        "## Catalog",
        "",
        "| Module | Form | Controller | Model | Table | Help Signal |",
        "|---|---:|---:|---:|---|---|",
    ]

    for module in modules:
        controller = controllers_lc.get(module.lower())
        model = models_lc.get(module.lower())
        form = forms.get(module)
        table = model_table(model) if model else ""

        help_signal = ""
        prefix = f"{module}."
        for key in sorted(help_entries):
            if key.startswith(prefix.lower()):
                help_signal = first_sentence_from_help(help_entries, key)
                break

        lines.append(
            "| {module} | {form} | {controller} | {model} | {table} | {help_signal} |".format(
                module=module,
                form="yes" if form else "",
                controller="yes" if controller else "",
                model="yes" if model else "",
                table=table,
                help_signal=help_signal.replace("|", "\\|"),
            )
        )

    lines.append("")
    return "\n".join(lines)


def build_database_index() -> str:
    sql_path = ROOT / "script/database.sql"
    sql = sql_path.read_text(encoding="utf-8", errors="ignore")
    tables = sorted(dict.fromkeys(re.findall(r"CREATE TABLE `?(pkg_[A-Za-z0-9_]+)`?", sql, re.I)))

    model_tables: dict[str, str] = {}
    for model in (ROOT / "protected/models").glob("*.php"):
        table = model_table(model)
        if table:
            model_tables[table] = model.stem

    lines = [
        "---",
        "doc_id: MB-RAG-SOURCE-DATABASE-TABLE-INDEX",
        "version: 1.0",
        "language: en",
        "tags: [source, database, tables, schema]",
        "---",
        "",
        "# Database Table Index",
        "",
        "This index is generated from `script/database.sql` and model",
        "`tableName()` mappings. It complements the curated top-30 operational",
        "table dictionary by listing every current `pkg_*` table found in schema.",
        "",
        f"Current `pkg_*` table count: {len(tables)}.",
        "",
        "## Table Index",
        "",
        "| Table | Domain | Model |",
        "|---|---|---|",
    ]

    for table in tables:
        lines.append(f"| {table} | {table_domain(table)} | {model_tables.get(table, '')} |")

    lines.append("")
    return "\n".join(lines)


def main() -> None:
    sources = IA_DOCS / "sources"
    sources.mkdir(parents=True, exist_ok=True)
    (sources / "module_catalog.md").write_text(build_module_catalog(), encoding="utf-8")
    (sources / "database_table_index.md").write_text(build_database_index(), encoding="utf-8")
    print("Wrote ia-docs/sources/module_catalog.md")
    print("Wrote ia-docs/sources/database_table_index.md")


if __name__ == "__main__":
    main()
