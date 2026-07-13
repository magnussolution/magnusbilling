# MBilling 7 documentation copy audit for MBilling 8

Date: 2026-07-13

## Scope

Copy the maintained user Wiki and AI-support documentation from MBilling 7 into
MBilling 8, then add a version-specific section covering Asterisk 20, PJSIP,
and WhatsApp Business messaging.

## Inventory before the copy

- MBilling 8 already contains the English and Brazilian Portuguese Wiki trees.
- MBilling 8 does not contain the `ia-docs` tree.
- MBilling 7 has 406 tracked documentation files under `wiki/` and `ia-docs/`;
  MBilling 8 has 338 tracked files in those paths.
- The MBilling 8 worktree already has local WhatsApp documentation changes in
  both Wiki indexes and both generated campaign pages, plus standalone English
  and Brazilian Portuguese WhatsApp campaign guides.
- `wiki/generate.php` in MBilling 8 still contains MBilling 7-specific runtime
  settings and must not be executed as part of this copy.

## Source-of-truth checks

- `script/install.sh` explicitly installs Asterisk 20.
- The Asterisk build uses bundled PJSIP/PJProject, disables `chan_sip`, creates
  `pjsip_magnus.conf` and `pjsip_magnus_user.conf`, and includes both from
  `pjsip.conf`.
- The MBilling 8 application uses PJSIP identifiers in queues, IVRs, online
  calls, server configuration, and Asterisk-generated account files.
- The current MBilling 8 WhatsApp guide documents the official Meta WhatsApp
  Business Cloud API integration, approved templates, campaign execution, and
  inbound webhook replies.

## Copy and merge policy

1. Copy only files tracked by the MBilling 7 repository, avoiding virtual
   environments, build output, caches, and other local artifacts.
2. Preserve the four locally modified MBilling 8 Wiki files instead of
   overwriting them: both language indexes and both campaign pages.
3. Preserve the standalone WhatsApp campaign guides already present in
   MBilling 8.
4. Add one durable "What's new in MBilling 8" page per Wiki language and link
   it from a dedicated index section.
5. Add an equivalent AI-support domain document and rebuild the local RAG
   indexes after the copy.

## Validation plan

- Verify that every local Wiki `toctree` entry resolves to a source file.
- Build both Sphinx language trees without executing `wiki/generate.php`.
- Rebuild and verify `ia-docs` catalogs and RAG indexes.
- Confirm that existing MBilling 8 local changes remain present.
