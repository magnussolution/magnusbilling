---
doc_id: MB-RAG-PLAYBOOK-TROUBLESHOOTING-FLOWS
version: 1.0
language: en
tags: [playbook, troubleshooting, support, workflow]
audience: [user-support, operator]
---

# Troubleshooting Flows

Use these flows to answer operational support questions in a consistent order.

## Outbound Call Flow

1. User: active, has credit, correct plan, call limit not exceeded.
2. SIP/IAX account: active, registered or allowed by IP, correct caller source.
3. Dialed number: expected format, prefix match, restricted number checks.
4. Rate: active sell rate for the user/plan and destination prefix.
5. Trunk group: correct strategy and available trunks.
6. Provider: trunk status, host, register/fromuser/fromdomain, codec/NAT/DTMF.
7. Evidence: CDR, Rejected Calls, SIP Trace, provider SIP response.

## Inbound DID Flow

1. DID: active, correct number format, assigned user/reseller.
2. DID destination: active route and correct destination type.
3. Destination target: SIP user, queue, IVR, callback, or custom target exists.
4. Schedule: DID, IVR, callback, or campaign-related time rules.
5. Runtime: inbound AGI route and downstream leg.
6. Evidence: Rejected Calls, SIP Trace, CDR, DID history/use records.

## SIP Registration Flow

1. SIP user: active, username/password, host mode.
2. Device: server IP/domain, port, transport, NAT, codec, DTMF.
3. Security: firewall/fail2ban, blocked IP, wrong password attempts.
4. Asterisk: peer status, qualify, registration messages.
5. Panel: user/group visibility and account ownership.

## Payment and Refill Flow

1. Operation: refill, buy credit, voucher, or gateway callback.
2. Status: created, pending, approved, rejected, canceled.
3. Method: payment method active and allowed for the user/group.
4. Balance: balance mutation exists and matches the expected user.
5. Reports: date range, filters, invoice aggregation source.
6. Evidence: provider callback controller and transaction record.

## Campaign Flow

1. Campaign: active, date/time window, type, max completed calls.
2. Targets: phonebook records, restrictions, pending/active status.
3. Audio/TTS: compatible audio or configured TTS URL.
4. Dispatch: MassiveCall command/runtime can pick eligible records.
5. Outbound route: same checks as normal outbound calls.
6. Evidence: campaign log, CDR, rejected calls, SIP trace.

## Queue Flow

1. DID route: destination type points to queue.
2. Queue: active and configured with expected strategy.
3. Members: active, registered, available, and linked to correct SIP users.
4. Runtime: QueueAgi path and Asterisk queue behavior.
5. Evidence: queue logs/status, CDR, rejected calls, SIP trace.

## Documentation Field Help Flow

1. Field exists in `classic/src/view/<Module>/Form.js`.
2. Help key exists in both `resources/help/help_en.js` and `help_pt_BR.js`.
3. Description is concise and user-facing.
4. `wiki/generate.php` has been run.
5. Generated `.rst` contains the expected anchor and text.
6. Panel `Show fields help` setting is enabled when testing UI icons.
