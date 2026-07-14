#!/usr/bin/env python3
"""Regression tests for the English-only GitHub Wiki export."""

from __future__ import annotations

import hashlib
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import export_github_wiki


ROOT = Path(__file__).resolve().parents[2]
MODULES = ROOT / "wiki" / "en" / "modules"


def module_source_digest() -> str:
    digest = hashlib.sha256()
    for path in sorted(MODULES.rglob("*.rst")):
        digest.update(path.relative_to(MODULES).as_posix().encode())
        digest.update(path.read_bytes())
    return digest.hexdigest()


class GitHubWikiExportTest(unittest.TestCase):
    def test_export_is_english_only_navigable_and_read_only(self) -> None:
        before = module_source_digest()
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory)
            self.assertEqual(export_github_wiki.export(output), 0)

            self.assertEqual(before, module_source_digest())
            self.assertFalse(any(output.glob("PT-BR--*.md")))
            self.assertFalse((output / "assets" / "pt_BR").exists())

            home = (output / "Home.md").read_text(encoding="utf-8")
            index = (output / "EN--index.md").read_text(encoding="utf-8")
            module_overview = (output / "EN--module_overview.md").read_text(encoding="utf-8")
            installation = (output / "EN--get_started--quick_install.md").read_text(encoding="utf-8")

            self.assertIn("## Start here", home)
            self.assertIn("## First Steps", index)
            self.assertIn("EN--get_started--quick_install", index)
            self.assertIn("## Customer management", module_overview)
            self.assertFalse(any(output.glob("EN--modules--*.md")))
            self.assertNotIn("*************", installation)
            self.assertIn("[Edit this page]", installation)


if __name__ == "__main__":
    unittest.main()
