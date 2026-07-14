# GitHub Wiki quality audit

Audit date: 2026-07-14

## Scope

- English documentation under `wiki/en`.
- GitHub Wiki Markdown export and navigation.
- Compatibility with contextual field help generated from `resources/help`.
- Repository entrypoints that direct users to documentation.

## Baseline findings

- The exporter published 102 English RST pages, including 79 generated module
  and field-reference pages.
- The generated Home and sidebar exposed only a small part of that content.
- Sphinx `toctree` directives were discarded, leaving the public index almost
  empty.
- RST overline headings appeared as literal adornment characters in Markdown.
- Generated field pages were useful inside MagnusBilling but many were too
  short to work as standalone public documentation.
- The repository README did not link directly to the GitHub Wiki.

## Publication decision

The public GitHub Wiki is English-only and is separated from contextual field
help:

- `resources/help/help_en.js` and `wiki/en/modules/*` remain the source for help
  displayed beside fields in MagnusBilling.
- The GitHub Wiki exporter excludes the generated `wiki/en/modules` tree.
- Public module orientation is maintained in `wiki/en/module_overview.rst`.
- Public presentation improvements are implemented by the Markdown exporter,
  without rewriting generated field-help sources.

## Acceptance criteria

- GitHub Wiki export contains no Portuguese or generated field-reference pages.
- Home and sidebar organize documentation by common user tasks.
- The complete index contains working links generated from Sphinx `toctree`.
- RST heading adornments do not leak into Markdown.
- Every public page links back to Home, the complete index, and its editable RST
  source.
- Export validation reports no missing internal pages or assets.
- Running the exporter does not modify any file under `wiki/en/modules`.
