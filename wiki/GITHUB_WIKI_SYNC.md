# GitHub Wiki synchronization

The user-facing documentation under `wiki/en` and `wiki/pt_BR` is the source of
truth. The GitHub Wiki is a generated Markdown publication target and must not
be maintained independently.

## Local export

```bash
python3 wiki/tools/export_github_wiki.py --output /tmp/magnusbilling8-wiki
```

The exporter:

- converts all English and Brazilian Portuguese RST pages to Markdown;
- prefixes and flattens page names so the two languages cannot collide;
- converts Sphinx document links and copies referenced images;
- creates `Home.md`, `_Sidebar.md`, and `_Footer.md`;
- validates that generated internal page and asset links resolve.

## Publication

GitHub stores the Wiki in a separate Git repository:

```bash
git clone https://github.com/magnussolution/magnusbilling8.wiki.git
```

The repository exists only after the first Wiki page has been created in the
GitHub interface. The workflow in `.github/workflows/sync-github-wiki.yml`
exports the documentation, replaces the generated Wiki checkout, and pushes a
commit only when the result changed.

## Editing policy

Edit `wiki/en` or `wiki/pt_BR`. When a generated module page comes from the
durable field-help sources under `resources/help`, update the help source and
regenerate its RST page before committing. Direct edits in the GitHub Wiki may
be overwritten by the next synchronization.

Do not publish `ia-docs` to the user Wiki. It is a machine-oriented RAG source
with internal support and code-navigation material.
