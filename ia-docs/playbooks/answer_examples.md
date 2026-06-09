---
doc_id: MB-RAG-PLAYBOOK-ANSWER-EXAMPLES
version: 1.0
language: en
tags: [playbook, examples, support, answers]
audience: [user-support, operator, developer]
---

# Answer Examples

These examples show the expected style for AI answers to MagnusBilling users.

## DID Does Not Ring

Start by checking the DID route, not the SIP user only. In MagnusBilling, a DID
can route to different destination types.

1. Open DIDs and confirm the DID is active.
2. Open DID Destination and confirm the destination type and target.
3. If the target is a queue, confirm the queue and members are active.
4. If the target is a SIP user, confirm the SIP user is registered.
5. Check Rejected Calls and SIP Trace for the same time window.

If the panel configuration looks correct, trace the inbound path through
`resources/asterisk/DidAgi.php`.

## Outbound Call Uses the Wrong Trunk

Trunk selection depends on the matched prefix and the trunk group mode.

1. Check the dialed number format.
2. Confirm the most specific prefix/rate that matches the number.
3. Check the user's plan and rate relation.
4. Check the trunk group mode: ordered, random, or LCR.
5. If using LCR, compare provider buy rates for the matched prefix.

For code verification, start in `resources/asterisk/mbilling.php`, then follow
`SearchTariff.php` and `CalcAgi.php`.

## SIP User Does Not Register

Separate registration from call authorization.

1. Confirm the SIP user is active.
2. Confirm username and password.
3. If Host is dynamic, the device may register from any IP.
4. If authenticating by IP, check Host, password, and insecure settings.
5. Check firewall/fail2ban and Asterisk peer status.

If registration succeeds but calls fail, continue with the outbound AGI path.

## Refill Exists But Credit Did Not Change

A payment/refill record and a balance update are different side effects.

1. Confirm the refill or buy-credit status.
2. Confirm the payment method and callback used.
3. Check whether the balance mutation was applied.
4. Compare the user's balance history with the refill timestamp.
5. Validate reports with the same date range and filters.

For gateway callbacks, inspect the provider controller instead of assuming the
generic refill controller applied the credit.

## Field Help Icon Has No Description

Field help is generated from the help source files.

1. Confirm `Show fields help` is enabled in Settings, Configuration.
2. Find the field name in `classic/src/view/<Module>/Form.js`.
3. Confirm the key exists in `resources/help/help_en.js` and
   `resources/help/help_pt_BR.js`.
4. Run `php wiki/generate.php`.
5. Confirm the generated `.rst` page contains the field anchor and description.

Do not edit generated `.rst` as the primary fix for field help.

## User Can Login But Menu Is Empty

Login success does not guarantee menu authorization is correct.

1. Confirm the user status and group.
2. Confirm the user type and group module permissions.
3. Check the authentication check response used by the frontend bootstrap.
4. Confirm the session flags match the user's role.

For code verification, inspect `AuthenticationController.php`,
`BaseController.php`, and `classic/src/Application.js`.
