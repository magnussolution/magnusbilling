#!/usr/bin/env python3
"""Export the MagnusBilling Sphinx Wiki to a GitHub Wiki checkout.

The English RST files remain the source of truth. This exporter creates a flat
set of GitHub-Flavored Markdown pages for the GitHub Wiki repository.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
WIKI = ROOT / "wiki"
LANGUAGES = {
    "en": {"prefix": "EN", "label": "English", "home": "English documentation"},
}
SKIP_PARTS = {"_build", ".venv", "__pycache__", "ntemplates", "_templates"}
HEADING_CHARS = {"=": "#", "-": "##", "~": "###", "+": "###", "^": "####", '"': "####"}


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
    return "\n".join(cleaned) + "\n"


def write_navigation(output: Path, pages: dict[tuple[str, str], str]) -> None:
    home = """# MagnusBilling 8 Documentation

- [Open the documentation](EN--index)
- [What's new in MBilling 8](EN--whats_new_mb8)
- [Installation](EN--get_started--quick_install)
- [WhatsApp Business](EN--whatsapp_campaign)

The pages in this Wiki are generated from the documentation maintained in the
[`magnussolution/magnusbilling8`](https://github.com/magnussolution/magnusbilling8)
repository. Edit the RST sources there; direct changes made in this GitHub Wiki
may be replaced by the next synchronization.
"""
    (output / "Home.md").write_text(home, encoding="utf-8")

    links = [
        ("Documentation", "EN--index"),
        ("What's new in MBilling 8", "EN--whats_new_mb8"),
        ("Installation", "EN--get_started--quick_install"),
        ("WhatsApp Business", "EN--whatsapp_campaign"),
        ("Modules", "EN--modules--index"),
    ]
    available = {slug for slug in pages.values()}
    sidebar = ["## MagnusBilling 8", "", "- [Home](Home)"]
    sidebar.extend(f"- [{label}]({slug})" for label, slug in links if slug in available)
    (output / "_Sidebar.md").write_text("\n".join(sidebar) + "\n", encoding="utf-8")
    footer = "Generated from the MagnusBilling 8 RST documentation.\n"
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
