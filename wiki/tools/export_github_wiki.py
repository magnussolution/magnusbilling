#!/usr/bin/env python3
"""Export the MagnusBilling Sphinx Wiki to a GitHub Wiki checkout.

The English RST files remain the source of truth. This exporter creates a flat
set of GitHub-Flavored Markdown pages for the GitHub Wiki repository.
"""

from __future__ import annotations

import argparse
import fnmatch
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[2]
WIKI = ROOT / "wiki"
LANGUAGES = {
    "en": {"prefix": "EN", "label": "English", "home": "English documentation"},
}
SKIP_PARTS = {"_build", ".venv", "__pycache__", "ntemplates", "_templates"}
PUBLIC_EXCLUDED_ROOTS = {"modules"}
HEADING_CHARS = {"=": "#", "-": "##", "~": "###", "+": "###", "^": "####", '"': "####"}
REPOSITORY_URL = "https://github.com/magnussolution/magnusbilling"


def page_slug(language: str, relative: Path) -> str:
    parts = list(relative.with_suffix("").parts)
    clean = []
    for part in parts:
        part = re.sub(r"[^A-Za-z0-9._-]+", "-", part.strip()).strip("-")
        clean.append(part or "page")
    return LANGUAGES[language]["prefix"] + "--" + "--".join(clean)


def discover_pages() -> dict[tuple[str, str], str]:
    pages: dict[tuple[str, str], str] = {}
    for language in LANGUAGES:
        source = WIKI / language
        for path in sorted(source.rglob("*.rst")):
            if any(part in SKIP_PARTS for part in path.parts):
                continue
            if path.stem.endswith(" 2"):
                continue
            relative = path.relative_to(source)
            if relative.parts and relative.parts[0] in PUBLIC_EXCLUDED_ROOTS:
                continue
            pages[(language, relative.with_suffix("").as_posix())] = page_slug(language, relative)
    return pages


def normalize_doc_target(current: Path, target: str) -> str:
    target = target.strip().removesuffix(".rst")
    if target.startswith("/"):
        candidate = Path(target.lstrip("/"))
    else:
        candidate = current.parent / target
    parts: list[str] = []
    for part in candidate.parts:
        if part in ("", "."):
            continue
        if part == "..":
            if parts:
                parts.pop()
            continue
        parts.append(part)
    return Path(*parts).as_posix()


def document_title(source_file: Path) -> str:
    """Return the first RST heading without changing the source document."""
    lines = source_file.read_text(encoding="utf-8-sig", errors="replace").splitlines()
    for index, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        if (
            index + 2 < len(lines)
            and len(stripped) >= 3
            and len(set(stripped)) == 1
            and lines[index + 1].strip()
            and lines[index + 2].strip() == stripped
        ):
            return lines[index + 1].strip()
        if index + 1 < len(lines):
            underline = lines[index + 1].strip()
            if len(underline) >= 3 and len(set(underline)) == 1 and underline[0] in HEADING_CHARS:
                return stripped
    return source_file.stem.replace("_", " ").replace("-", " ").title()


def page_title(language: str, key: str) -> str:
    return document_title(WIKI / language / f"{key}.rst")


def toctree_links(
    block: list[str],
    language: str,
    relative: Path,
    pages: dict[tuple[str, str], str],
) -> tuple[str | None, list[tuple[str, str]]]:
    """Convert Sphinx toctree entries to a caption and GitHub Wiki links."""
    caption: str | None = None
    links: list[tuple[str, str]] = []
    seen: set[str] = set()
    for item in block:
        entry = item.strip()
        if not entry:
            continue
        option = re.match(r":([A-Za-z0-9_-]+):\s*(.*)$", entry)
        if option:
            if option.group(1) == "caption" and option.group(2):
                caption = option.group(2).strip()
            continue

        explicit = re.match(r"(.+?)\s*<([^>]+)>$", entry)
        label = explicit.group(1).strip() if explicit else None
        raw_target = explicit.group(2).strip() if explicit else entry
        if raw_target == "self":
            continue
        normalized = normalize_doc_target(relative, raw_target)
        matching_keys = (
            sorted(key for lang, key in pages if lang == language and fnmatch.fnmatch(key, normalized))
            if any(character in normalized for character in "*?[")
            else [normalized]
        )
        for key in matching_keys:
            slug = pages.get((language, key))
            if not slug or slug in seen:
                continue
            seen.add(slug)
            links.append((label or page_title(language, key), slug))
    return caption, links


def convert_inline(text: str, language: str, current: Path, pages: dict[tuple[str, str], str]) -> str:
    def doc_role(match: re.Match[str]) -> str:
        body = match.group(1).strip()
        explicit = re.match(r"(.+?)\s*<([^>]+)>$", body)
        if explicit:
            label, target = explicit.groups()
        else:
            label, target = body, body
        key = normalize_doc_target(current, target)
        slug = pages.get((language, key))
        return f"[{label.strip()}]({slug})" if slug else label.strip()

    text = re.sub(r":doc:`([^`]+)`", doc_role, text)
    text = re.sub(r":ref:`([^`]+)`", lambda m: m.group(1).split("<", 1)[0].strip(), text)
    text = re.sub(r":guilabel:`([^`]+)`", r"**\1**", text)
    text = re.sub(r":(?:class|func|meth|mod|file|command|option):`([^`]+)`", r"`\1`", text)
    text = re.sub(r"`([^`<>]+?)\s*<([^>]+)>`_", r"[\1](\2)", text)
    text = re.sub(r"`([^`]+)`_", r"[\1][\1]", text)
    text = re.sub(r"(?<!`)``([^`]+)``(?!`)", r"`\1`", text)
    text = re.sub(r"\|([A-Za-z0-9_-]+)\|", r"`\1`", text)
    return text.rstrip()


def image_target(source_file: Path, raw_target: str, language: str, output: Path) -> str | None:
    source = (source_file.parent / raw_target.strip()).resolve()
    language_root = (WIKI / language).resolve()
    try:
        relative = source.relative_to(language_root)
    except ValueError:
        return None
    if not source.is_file():
        return None
    destination = output / "assets" / language / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    destination.chmod(0o644)
    return destination.relative_to(output).as_posix()


def indented_block(lines: list[str], start: int) -> tuple[list[str], int]:
    block: list[str] = []
    index = start
    while index < len(lines):
        line = lines[index]
        if not line.strip():
            block.append("")
            index += 1
            continue
        if line.startswith(("   ", "\t")):
            block.append(line[3:] if line.startswith("   ") else line.lstrip("\t"))
            index += 1
            continue
        break
    while block and not block[-1].strip():
        block.pop()
    while block and not block[0].strip():
        block.pop(0)
    return block, index


def rst_to_markdown(
    source_file: Path,
    language: str,
    relative: Path,
    pages: dict[tuple[str, str], str],
    output: Path,
) -> str:
    lines = source_file.read_text(encoding="utf-8-sig", errors="replace").splitlines()
    rendered: list[str] = []
    index = 0
    while index < len(lines):
        line = lines[index].rstrip()

        if (
            index + 2 < len(lines)
            and len(line.strip()) >= 3
            and len(set(line.strip())) == 1
            and lines[index + 1].strip()
            and lines[index + 2].strip() == line.strip()
        ):
            rendered.extend([f"# {convert_inline(lines[index + 1].strip(), language, relative, pages)}", ""])
            index += 3
            continue

        if index + 1 < len(lines):
            underline = lines[index + 1].strip()
            if line.strip() and len(underline) >= 3 and len(set(underline)) == 1 and underline[0] in HEADING_CHARS:
                rendered.extend([f"{HEADING_CHARS[underline[0]]} {convert_inline(line.strip(), language, relative, pages)}", ""])
                index += 2
                continue

        anchor = re.match(r"^\.\. _([^:]+):\s*$", line)
        if anchor:
            rendered.extend([f'<a id="{anchor.group(1)}"></a>', ""])
            index += 1
            continue

        external_target = re.match(r"^\.\. _([^:]+):\s+(\S+)\s*$", line)
        if external_target:
            rendered.extend([f"[{external_target.group(1)}]: {external_target.group(2)}", ""])
            index += 1
            continue

        directive = re.match(r"^\.\. ([A-Za-z0-9_-]+)\s*::\s*(.*)$", line)
        if directive:
            kind, argument = directive.groups()
            block, next_index = indented_block(lines, index + 1)
            if kind == "toctree":
                caption, links = toctree_links(block, language, relative, pages)
                if caption and links:
                    rendered.extend([f"## {convert_inline(caption, language, relative, pages)}", ""])
                rendered.extend(f"- [{label}]({slug})" for label, slug in links)
                if links:
                    rendered.append("")
                index = next_index
                continue
            if kind == "include":
                key = normalize_doc_target(relative, argument)
                slug = pages.get((language, key))
                if slug:
                    rendered.extend([f"[Open the {page_title(language, key)} field reference]({slug})", ""])
                index = next_index
                continue
            if kind in {"image", "figure"}:
                argument = re.sub(r"\s*/\s*", "/", argument)
                target = image_target(source_file, argument, language, output)
                alt = Path(argument).stem.replace("-", " ").replace("_", " ")
                for option in block:
                    alt_match = re.match(r":alt:\s*(.+)", option.strip())
                    if alt_match:
                        alt = alt_match.group(1)
                if target:
                    rendered.extend([f"![{alt}]({target})", ""])
                index = next_index
                continue
            if kind == "list-table":
                rows: list[list[str]] = []
                current_row: list[str] | None = None
                for item in block:
                    stripped = item.strip()
                    if not stripped or stripped.startswith(":"):
                        continue
                    first_cell = re.match(r"\*\s+-\s+(.*)", stripped)
                    next_cell = re.match(r"-\s+(.*)", stripped)
                    if first_cell:
                        if current_row:
                            rows.append(current_row)
                        current_row = [convert_inline(first_cell.group(1), language, relative, pages)]
                    elif next_cell and current_row is not None:
                        current_row.append(convert_inline(next_cell.group(1), language, relative, pages))
                if current_row:
                    rows.append(current_row)
                if rows:
                    columns = max(len(row) for row in rows)
                    rendered.append("<table>")
                    for row in rows:
                        cells = row + [""] * (columns - len(row))
                        rendered.append("  <tr>" + "".join(f"<td>{cell}</td>" for cell in cells) + "</tr>")
                    rendered.extend(["</table>", ""])
                index = next_index
                continue
            if kind in {"note", "warning", "important", "tip", "caution", "attention", "danger"}:
                label = kind.upper()
                body = [argument] if argument else []
                body.extend(item for item in block if not item.lstrip().startswith(":"))
                rendered.append(f"> **{label}:**")
                for item in body:
                    rendered.append("> " + convert_inline(item, language, relative, pages) if item else ">")
                rendered.append("")
                index = next_index
                continue
            if kind in {"code", "code-block", "sourcecode"}:
                language_hint = argument.strip() or "text"
                code = [item for item in block if not item.lstrip().startswith(":")]
                rendered.extend([f"```{language_hint}", *code, "```", ""])
                index = next_index
                continue
            if kind in {"meta", "contents", "highlight", "orphan"}:
                index = next_index
                continue
            if argument:
                rendered.extend([convert_inline(argument, language, relative, pages), ""])
            if block:
                rendered.extend(convert_inline(item, language, relative, pages) for item in block)
                rendered.append("")
            index = next_index
            continue

        if line.startswith(".. "):
            _comment, next_index = indented_block(lines, index + 1)
            index = next_index
            continue

        if line.startswith("+-"):
            table_lines: list[str] = []
            next_index = index
            while next_index < len(lines) and lines[next_index].strip():
                table_lines.append(lines[next_index].rstrip())
                next_index += 1
            rows = []
            for table_line in table_lines:
                if table_line.startswith("|"):
                    cells = [convert_inline(cell.strip(), language, relative, pages) for cell in table_line.strip("|").split("|")]
                    rows.append(cells)
            if rows:
                columns = max(len(row) for row in rows)
                normalized = [row + [""] * (columns - len(row)) for row in rows]
                rendered.append("| " + " | ".join(normalized[0]) + " |")
                rendered.append("| " + " | ".join(["---"] * columns) + " |")
                rendered.extend("| " + " | ".join(row) + " |" for row in normalized[1:])
                rendered.append("")
                index = next_index
                continue

        ordered = re.match(r"^(\s*)#\.\s+(.*)$", line)
        if ordered:
            content = ordered.group(2)
            if content.endswith("::"):
                rendered.append(f"{ordered.group(1)}1. {convert_inline(content[:-1], language, relative, pages)}")
                block, next_index = indented_block(lines, index + 1)
                if block:
                    rendered.extend(["", "```text", *block, "```", ""])
                    index = next_index
                else:
                    index += 1
            else:
                rendered.append(f"{ordered.group(1)}1. {convert_inline(content, language, relative, pages)}")
                index += 1
            continue

        if line.strip() == "::":
            block, next_index = indented_block(lines, index + 1)
            rendered.extend(["```text", *block, "```", ""])
            index = next_index
            continue

        if line.endswith("::") and line.strip() != "::":
            rendered.append(convert_inline(line[:-1], language, relative, pages))
            block, next_index = indented_block(lines, index + 1)
            if block:
                rendered.extend(["", "```text", *block, "```", ""])
                index = next_index
            else:
                index += 1
            continue

        if re.match(r"^\s*:[A-Za-z0-9_-]+:", line):
            index += 1
            continue

        if line.startswith("| "):
            rendered.append(convert_inline(line[2:], language, relative, pages) + "  ")
        else:
            rendered.append(convert_inline(line, language, relative, pages))
        index += 1

    cleaned: list[str] = []
    for line in rendered:
        if not line.strip() and cleaned and not cleaned[-1].strip():
            continue
        cleaned.append(line.rstrip())
    while cleaned and not cleaned[-1].strip():
        cleaned.pop()
    markdown = "\n".join(cleaned) + "\n"
    if relative.as_posix() == "index.rst":
        markdown = re.sub(
            r"\n# Indices and tables\n\n\* genindex\n\* search\n?",
            "\n",
            markdown,
        )
    return markdown


def append_page_navigation(markdown: str, language: str, relative: Path) -> str:
    source_path = quote(f"wiki/{language}/{relative.as_posix()}")
    edit_url = f"{REPOSITORY_URL}/edit/source/{source_path}"
    navigation = (
        "\n---\n\n"
        "[Documentation home](Home) · "
        "[Documentation index](EN--index) · "
        f"[Edit this page]({edit_url})\n"
    )
    return markdown.rstrip() + "\n" + navigation


def available_link(
    pages: dict[tuple[str, str], str], label: str, key: str
) -> str | None:
    slug = pages.get(("en", key))
    return f"- [{label}]({slug})" if slug else None


def write_navigation(output: Path, pages: dict[tuple[str, str], str]) -> None:
    def links(items: list[tuple[str, str]]) -> str:
        return "\n".join(
            link for label, key in items if (link := available_link(pages, label, key))
        )

    home = f"""# MagnusBilling 8 Documentation

MagnusBilling is an open-source billing and management platform for IP
telephony providers. This Wiki documents installation, daily operation,
billing, Asterisk 20, PJSIP, campaigns, and integrations.

## Start here

{links([
    ("Introduction and supported functions", "intro"),
    ("Install MagnusBilling 8", "get_started/quick_install"),
    ("Place the first call", "get_started/first_call"),
    ("Understand the web interface", "get_started/interface"),
    ("Update an installation", "get_started/update"),
    ("Back up the system", "get_started/backup"),
])}

## MBilling 8 platform

{links([
    ("What's new: Asterisk 20, PJSIP, and WhatsApp Business", "whats_new_mb8"),
    ("Configure WhatsApp Business campaigns", "whatsapp_campaign"),
    ("Understand Direct Media in Asterisk", "asterisk_options/directmedia"),
    ("Review system configuration", "config"),
])}

## Billing and routing

{links([
    ("How prices are calculated", "price_calculation"),
    ("How MagnusBilling selects a tariff", "find_rate"),
    ("Offers and packages", "offer"),
    ("Using vouchers", "how_to_use_voucher"),
])}

## Administration and troubleshooting

{links([
    ("Module overview", "module_overview"),
    ("Troubleshoot calls without audio", "admin_guide/troubleshooting_no_audio"),
    ("Troubleshoot errors when saving", "admin_guide/troubleshooting_save_errors"),
    ("Firewall and security", "security/iptables"),
    ("Configure STIR/SHAKEN on OpenSIPS 3.6", "security/stir_shaken_opensips"),
    ("Technical architecture guide", "ai_codebase_guide"),
])}

## Need help or want to contribute?

- [Report a documentation problem]({REPOSITORY_URL}/issues/new)
- [View the documentation source]({REPOSITORY_URL}/tree/source/wiki/en)
- [Open the complete documentation index](EN--index)

> **Documentation policy:** The public Wiki is maintained in English. These
> pages are generated from the RST sources in the main repository. Direct edits
> in the GitHub Wiki may be replaced by the next synchronization.
"""
    (output / "Home.md").write_text(home, encoding="utf-8")

    sections = [
        ("Getting started", [
            ("Installation", "get_started/quick_install"),
            ("First call", "get_started/first_call"),
            ("Web interface", "get_started/interface"),
            ("Update", "get_started/update"),
            ("Backup", "get_started/backup"),
        ]),
        ("MBilling 8", [
            ("What's new", "whats_new_mb8"),
            ("WhatsApp Business", "whatsapp_campaign"),
            ("Asterisk Direct Media", "asterisk_options/directmedia"),
        ]),
        ("Operations", [
            ("Configuration", "config"),
            ("No-audio troubleshooting", "admin_guide/troubleshooting_no_audio"),
            ("Save-error troubleshooting", "admin_guide/troubleshooting_save_errors"),
            ("Security", "security/iptables"),
            ("STIR/SHAKEN", "security/stir_shaken_opensips"),
        ]),
        ("Billing", [
            ("Price calculation", "price_calculation"),
            ("Tariff selection", "find_rate"),
            ("Offers", "offer"),
            ("Vouchers", "how_to_use_voucher"),
        ]),
        ("Reference", [
            ("Module overview", "module_overview"),
            ("Technical architecture", "ai_codebase_guide"),
            ("Complete index", "index"),
        ]),
    ]
    sidebar = ["## MagnusBilling 8", "", "- [Home](Home)"]
    for heading, items in sections:
        section_links = [
            link for label, key in items if (link := available_link(pages, label, key))
        ]
        if section_links:
            sidebar.extend(["", f"### {heading}", "", *section_links])
    (output / "_Sidebar.md").write_text("\n".join(sidebar) + "\n", encoding="utf-8")
    footer = (
        f"[Documentation source]({REPOSITORY_URL}/tree/source/wiki/en) · "
        f"[Report an issue]({REPOSITORY_URL}/issues) · "
        "English documentation generated from the MagnusBilling 8 RST sources.\n"
    )
    (output / "_Footer.md").write_text(footer, encoding="utf-8")


def validate_export(output: Path, pages: dict[tuple[str, str], str]) -> list[str]:
    errors: list[str] = []
    expected = {slug for slug in pages.values()} | {"Home", "_Sidebar", "_Footer"}
    actual = {path.stem for path in output.glob("*.md")}
    missing = sorted(expected - actual)
    if missing:
        errors.append("Missing generated pages: " + ", ".join(missing[:20]))

    link_re = re.compile(r"!?\[[^]]*]\(([^)]+)\)")
    for markdown in sorted(output.glob("*.md")):
        text = markdown.read_text(encoding="utf-8")
        for target in link_re.findall(text):
            clean = target.split("#", 1)[0]
            if not clean or re.match(r"(?:https?|mailto):", clean):
                continue
            if clean.startswith("assets/"):
                if not (output / clean).is_file():
                    errors.append(f"{markdown.name}: missing asset {clean}")
            elif clean.removesuffix(".md") not in actual:
                errors.append(f"{markdown.name}: missing page {clean}")
    return errors


def export(output: Path) -> int:
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)
    pages = discover_pages()
    for (language, key), slug in sorted(pages.items()):
        relative = Path(key + ".rst")
        source = WIKI / language / relative
        markdown = rst_to_markdown(source, language, relative, pages, output)
        markdown = append_page_navigation(markdown, language, relative)
        (output / f"{slug}.md").write_text(markdown, encoding="utf-8")
    write_navigation(output, pages)
    errors = validate_export(output, pages)
    if errors:
        print("GitHub Wiki export validation failed:", file=sys.stderr)
        for error in errors[:100]:
            print(f"- {error}", file=sys.stderr)
        return 1
    assets = sum(1 for path in (output / "assets").rglob("*") if path.is_file()) if (output / "assets").exists() else 0
    print(f"Exported {len(pages)} pages and {assets} assets to {output}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True, help="Target GitHub Wiki checkout/export directory")
    args = parser.parse_args()
    return export(args.output.resolve())


if __name__ == "__main__":
    raise SystemExit(main())
