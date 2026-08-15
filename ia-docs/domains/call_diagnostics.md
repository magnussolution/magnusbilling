---
doc_id: MB-RAG-DOMAIN-CALL-DIAGNOSTICS
version: 1.0
language: en
tags: [call-diagnostics, agi, dry-run, did, sip, ivr, queue, routing]
audience: [developer, operator, ai-agent]
---

# Call Diagnostics

## Purpose

MagnusBilling 8 provides administrator-only **Check User** and **Check DID**
tools. They execute the production AGI decision flow in a protected dry-run so
that changes to routing rules under `resources/asterisk` are automatically
covered without maintaining a second implementation.

## Entry Points

- CLI dry-run:
  `php resources/asterisk/mbilling.php debug NUMBER MB_ACC CALLERID`
- Web orchestration:
  `protected/components/CallDiagnosticService.php`
- Web access and admin guard:
  `protected/controllers/CallDiagnosticController.php`
- Result window:
  `classic/src/view/callDiagnostic/Window.js`
- Form toolbar buttons:
  `classic/src/view/sip/Form.js` and `classic/src/view/did/Form.js`
- REGISTER log/firewall diagnosis:
  `protected/components/SipRegisterDiagnosticService.php`
- AGI adapter and structured events:
  `resources/asterisk/AGI.Class.php`
- Dry-run stop boundary:
  `resources/asterisk/Magnus.php::run_dial()`
- Inbound routes:
  `resources/asterisk/DidAgi.php`, `IvrAgi.php`, `QueueAgi.php`,
  `SipCallAgi.php`

## Non-Negotiable Dry-Run Boundary

- Use the real AGI validation and selection code.
- Never execute Dial, Queue, audio playback, channel operations, callbacks,
  notifications, or external integrations.
- Never create real or failed CDRs, charge accounts, update queue status, write
  queue logs, or commit other operational database mutations.
- Database work is wrapped in a transaction and rolled back.
- Stop at `Magnus::run_dial()` before Dial, CDR, and charging.
- Do not stop before route validations that production performs before a
  channel operation.

## Structured AGI Events

Use `AGI::verboseEvent()` when a decision must be understood by the web
diagnostic. Event codes are stable contracts for tests, translation, and
presentation.

- level 1: blocking error
- level 2: warning or skipped candidate
- level 3: validated routing decision
- level 4: operational detail
- level 25: SQL or deep trace

The normal initial Asterisk verbose level is 5. Operational messages must be
concise and actionable; the web formatter must not infer outcomes from raw SQL
or free-form text.

## Outbound Facts to Preserve

- CallerID defaults to the selected SIP account.
- Diagnostics always use the current date and time.
- Number normalization includes `prefix_local`.
- Authentication and plan selection may be based on Techprefix. Keep the term
  `Techprefix` unchanged in user-facing text.
- Rate output includes plan, per-minute rate, connection charge, initial block,
  and billing block.
- When an offer package applies, the displayed call price is zero and the
  package is identified.
- Trunk output includes trunk group, selected trunk, and final number sent to
  the trunk.
- Distinguish an empty trunk group, all trunks inactive, and other
  ineligibility conditions.

## Inbound Facts to Preserve

- Display destination types using the exact mapping from
  `classic/src/view/diddestination/Combo.js` (`voip_call` values 0 through 11).
- DID prices include buy and sell values and the matched expression.
- Report a DID with no linked user as a missing destination/link, not as an
  inactive user.
- A SIP group with no rows in `pkg_sip` is blocking in all three group-routing
  paths.
- A multiple-IP destination must contain at least one valid IP before building
  or trimming the Dial string.
- IVR schedule and holidays are evaluated before audio diagnostics.
- An IVR with no options for the current schedule is blocking.
- Missing IVR audio is a warning because production can continue without it.
  Existing audio is checked for an Asterisk-compatible format; WAV must be
  mono at 8000 Hz.
- A missing Queue is blocking. A Queue without members is passed with a warning
  because production may still accept the call depending on Queue behavior.
- Queue dry-run must not write `pkg_queue_status` or access `queue_log`.

## Translation, Currency, and Security

- Backend user-facing text uses `Yii::t('zii', 'English source text')`.
- Add keys to every `resources/locale/php/LANG/zii.php`.
- Use the language selected in the active UI session, not the default
  `pkg_configuration` language.
- Monetary display values use `Yii::app()->session['currency']`.
- Feature access and technical details are administrator-only.
- Never expose SIP/trunk passwords, API keys, DSNs, or provider credentials.
- Diagnostic result text must remain selectable so administrators can copy any
  portion of it.
- AGI execution failures must be self-contained in the result. Show a stable
  failure code, plain-language cause, safe action, process exit code, JSON
  error and bounded stdout/stderr. Do not show an empty route summary when the
  route was never evaluated.
- Log the diagnostic ID with the classified failure and safe metadata, but do
  not duplicate raw stdout/stderr in the application log.

## Fixed-IP PJSIP Authentication

- `protected/components/PjsipAuthenticationMode.php` is the single decision
  point for generated inbound authentication.
- Dynamic accounts retain username/password authentication.
- A fixed-IP account is IP-only when `insecure` contains `invite` (the MB7
  chan_sip convention) or when its password is empty.
- IP-only endpoints use `identify_by=ip`, an `identify/match` section, and no
  auth section or endpoint `auth=`.
- Fixed-IP accounts with a password and `insecure=no` intentionally retain
  inbound credentials.
- `Sip::beforeSave()` normalizes fixed-IP accounts without a password to
  `port,invite`.
- Update `8.0.0.5 -> 8.0.0.6` normalizes existing rows and calls
  `AsteriskAccess::generateSipPeers()`. Administrators must not edit generated
  PJSIP files manually.
- Update `8.0.0.6 -> 8.0.0.7` idempotently adds
  `noload => res_pjsip_endpoint_identifier_anonymous.so` to `modules.conf`.
  The update does not restart Asterisk automatically; a controlled restart is
  required before unidentified INVITEs stop reaching the anonymous endpoint.

## Check REGISTER

- This is an administrator-only action beside **Run diagnostic** in the Check
  User window and posts only the selected `sipId`.
- Read no more than the last 4 MiB of `/var/log/asterisk/messages`.
- Correlate events using `pkg_sip.name` and `defaultuser`; never return raw log
  lines or authentication material to the browser.
- Classify the latest matching evidence, so an older authentication failure
  does not override a newer successful contact update.
- Extract validated source IPs and check both exact/CIDR entries in
  `pkg_firewall` and live Fail2Ban jails.
- Fail2Ban access is read-only (`status` only), bounded to 20 validated jail
  names and a short process timeout. Never unban automatically.
- Missing log or Fail2Ban permissions produce an inconclusive step; they do
  not imply that the address is clear or blocked.
- Read the selected endpoint/AOR/auth/identify objects from
  `/etc/asterisk/pjsip_magnus_user.conf`, redact password-like values, and
  compare them with `pkg_sip` expectations.
- Query the runtime endpoint and AOR through AMI. Report generated-but-not-
  loaded configuration separately from an endpoint loaded without a contact.
- The post-analysis **Capture SIP packets** action creates the existing
  `SipTrace` model with the exact SIP name, 120-second timeout, and UDP bind
  port parsed from `pjsip.conf`.
- Record the starting `siptrace.log` offset and correlate only new packets by
  exact SIP identity and Call-ID. Never use the ngrep substring match as proof
  that a packet belongs to the selected endpoint.
- Treat the first 401 as a normal digest challenge. Report bad credentials
  only after an authenticated REGISTER is rejected; preserve `stale=true` as
  a retryable challenge. Never expose Authorization/digest content.

## JSON Result Contract

- `AGI::finishDebug()` emits exactly one `MBILLING_RESULT` line.
- `AGI::encodeDebugResult()` uses invalid-UTF-8 substitution and has a minimal
  valid JSON fallback with `resultStage=finishDebug.serialization`.
- `CallDiagnosticService::parseAgiResultOutput()` records marker presence,
  raw payload byte length, exact JSON error, invalid UTF-8, extra output after
  the marker, warning/error output, and result construction stage.
- Raw failure evidence is bounded, non-printable bytes are escaped, and
  credential-like values are redacted before logging or display.

## Database and Documentation Placement

- Schema/update logic belongs in
  `protected/commands/UpdateMysqlCommand.php`; do not create a separate feature
  SQL installer.
- Public documentation belongs under `wiki/en` and is exported to the GitHub
  Wiki.
- This `ia-docs` domain is internal AI memory and must not be published as
  public Wiki content.

## Verification Checklist

1. Run `php -l` on every modified PHP and locale file.
2. Run the CLI dry-run for an outbound route and each affected DID route.
3. Confirm `MBILLING_RESULT` is valid JSON and the final status matches the
   last blocking/warning event.
4. Confirm no operational rows or files were written.
5. Confirm UI language, session currency, admin restriction, and selectable
   result text.
6. When Wiki source changes, run
   `python3 wiki/tools/test_export_github_wiki.py` and the exporter.
