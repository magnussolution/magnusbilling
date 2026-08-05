# GitHub Wiki synchronization

The English user-facing documentation under `wiki/en` is the source of truth.
The GitHub Wiki is a generated Markdown publication target and must not be
maintained independently.

## Local export

```bash
python3 wiki/tools/export_github_wiki.py --output /tmp/magnusbilling8-wiki
```

The exporter:

- converts all English RST pages to Markdown;
- prefixes and flattens page names for GitHub Wiki compatibility;
- converts Sphinx document links and copies referenced images;
- turns Sphinx `toctree` and generated module references into navigable links;
- fixes RST heading adornments for GitHub Markdown rendering;
- creates `Home.md`, `_Sidebar.md`, and `_Footer.md`;
- adds links back to the documentation index and editable RST source;
- validates that generated internal page and asset links resolve.

## Publication

GitHub stores the Wiki in a separate Git repository:

```bash
git clone https://github.com/magnussolution/magnusbilling.wiki.git
```

The repository exists only after the first Wiki page has been created in the
GitHub interface. The workflow in `.github/workflows/sync-github-wiki.yml`
exports the documentation, replaces the generated Wiki checkout, and pushes a
commit only when the result changed.

## Editing policy

Edit `wiki/en`. When a generated module page comes from the durable field-help
sources under `resources/help`, update the English help source and regenerate
its RST page before committing. Application translations and localized panel
help remain independent from the English-only public documentation. Direct
edits in the GitHub Wiki may be overwritten by the next synchronization.

The exporter is intentionally presentation-only. It does not publish or
rewrite `wiki/en/modules/*` or `resources/help/help_en.js`, because that
generated tree supplies the contextual help displayed beside fields in
MagnusBilling. Public module documentation is maintained separately in
`wiki/en/module_overview.rst`.

Do not publish `ia-docs` to the user Wiki. It is a machine-oriented RAG source
with internal support and code-navigation material.
