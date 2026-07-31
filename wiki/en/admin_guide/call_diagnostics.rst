Call diagnostics
================

The call diagnostic tools let an administrator verify outbound routing for a
SIP account and inbound routing for a DID without placing a real call.
Both actions are added to their module form toolbar through the
``extraButtons`` convention.

Access
------

This feature is available exclusively to administrators. MagnusBilling hides
the diagnostic actions from other users and the backend rejects direct
requests made without an administrator session.

The database update from ``8.0.0.4`` to ``8.0.0.5`` in
``protected/commands/UpdateMysqlCommand.php`` creates the hidden
``callDiagnostic`` module and grants read access to the default administrator
group. No separate SQL script is required.

The database update from ``8.0.0.5`` to ``8.0.0.6`` normalizes existing
fixed-IP accounts without a password and regenerates the PJSIP user
configuration. Accounts configured for authentication exclusively by IP use
``identify/match`` with ``identify_by=ip`` and do not receive an inbound
``auth=`` association. No manual edit of the generated PJSIP file is required.

The system update from ``8.0.0.6`` to ``8.0.0.7`` adds
``noload => res_pjsip_endpoint_identifier_anonymous.so`` to Asterisk's
``modules.conf``. This prevents an unidentified INVITE from reaching the
billing AGI through a ``PJSIP/anonymous-*`` channel. Restart Asterisk after
the update, at a controlled time, to activate the module change.

Check User
----------

#. Open **Users > SIP Users**.
#. Select exactly one SIP account.
#. Click **Check User**.
#. Enter the destination number.
#. Click **Run diagnostic**.

The CallerID is filled from the selected SIP account and can be changed before
running the diagnostic. The check always uses the current date and time.

The result is produced by the same AGI routing code used for a real call. The
AGI runs in a protected dry-run context and follows number normalization,
restrictions, portability, tariff, credit, trunk group and trunk selection.
It stops on entry to ``Magnus::run_dial()`` and does not place the call.

All database activity performed while evaluating the route is enclosed in a
transaction and rolled back before the result is returned. Asterisk commands
such as ``Dial``, ``Queue``, audio playback and channel operations are
ignored in dry-run mode and are never sent to Asterisk.

When a tariff is selected, the result identifies the plan, rate per minute,
connection charge, initial block and billing block. If a package offer applies,
the price is shown as zero and the package is identified. The result also
identifies Techprefix-based authentication or plan selection, the normalized
number, trunk group, selected trunk and the number that would be sent to the
trunk.

Check DID
---------

#. Open **DIDs**.
#. Select exactly one DID.
#. Click **Check DID**.
#. Optionally enter the originating CallerID.
#. Click **Run diagnostic**.

The selected DID number is passed to the same ``mbilling.php`` entry point used
by Asterisk. Therefore DID normalization, special-number handling and
destination priority always follow the installed AGI code. Changes made to
the routing rules under ``resources/asterisk`` automatically apply to future
diagnostics.

The DID diagnostic identifies the configured destination type using the same
labels as the destination form. Depending on the selected route, it validates
DID blocking expressions and prices, linked users, SIP accounts and SIP groups,
IVR schedules, holidays, options and audio compatibility, Queue existence and
members, multiple-IP destinations, and the other conditions reached by the
production AGI flow. Missing required routing data is blocking. A missing
optional IVR audio or a Queue without agents is reported as a warning when the
production route can still continue.

Reading the result
------------------

Each step is marked as passed, warning, failed or inconclusive. The diagnostic
stops at the first blocking error and includes a recommended action. The
displayed text can be selected and copied, including only part of a message.

Messages follow the language selected in the active MagnusBilling session.
Displayed monetary values use the session currency. Technical details are
available only to administrators and are formatted for readability without
exposing credentials.

If the isolated AGI process itself fails, the result identifies the failure
before showing any route summary. The administrator sees a stable failure
code, a plain-language explanation, the recommended action, the process exit
code, JSON parsing errors, permission checks and bounded process output. Empty
route details are not displayed when routing was never evaluated.

The diagnostic ID is logged with the classified failure and safe execution
metadata. The administrator can send the ID together with the selectable
technical evidence to support without requiring direct server access.

AGI logging
-----------

Routing decisions use stable messages in the following format::

    [MBilling][Component][EVENT_CODE] Human-readable message | key=value

New operational messages follow the Asterisk AGI verbosity range:

* level 1: a blocking validation error;
* level 2: a warning or skipped route candidate;
* level 3: a routing decision;
* level 4: useful processing context.

The standard Asterisk verbosity level 5 displays all operational events.
Database queries and internal dumps remain at level 25 and are shown only when
explicit extended debugging is enabled. The diagnostic interface consumes the
stable event code and structured context instead of interpreting free-form log
sentences.

Security and implementation notes
---------------------------------

Diagnostic endpoints accept only ``POST`` requests, apply a per-session rate
limit and return JSON. Detailed routing information is exposed only inside an
authenticated administrator session. The web service starts the AGI process
with validated arguments, an execution timeout and an output-size limit.
Every user-facing backend message uses ``Yii::t('zii', ...)`` and its
translation keys are maintained in ``resources/locale/php/LANG/zii.php``.

The AGI emits exactly one line prefixed by ``MBILLING_RESULT``. Result
serialization substitutes invalid UTF-8 safely and falls back to a minimal
valid error contract if JSON encoding still fails. The web parser records
bounded, credential-redacted evidence for malformed payloads, including byte
length, JSON error, invalid-byte detection, extra output and construction
stage.

The main implementation files are:

* ``protected/components/CallDiagnosticService.php``;
* ``protected/controllers/CallDiagnosticController.php``;
* ``classic/src/view/callDiagnostic/Window.js``;
* ``classic/src/view/sip/Form.js``;
* ``classic/src/view/did/Form.js``;
* ``resources/asterisk/mbilling.php`` and the ``*Agi.php`` classes reached by
  the production route.
