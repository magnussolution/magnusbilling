---
doc_id: MB-RAG-PLAYBOOK-AGENT-LEARNINGS
version: 1.0
language: multilingual
tags: [playbook, support, owner-approved, telegram, self-service]
audience: [user-support, operator, ai-agent]
---

# Owner-Approved Support Learnings

This document contains reusable guidance explicitly approved or written by the
MagnusSolution owner during real support conversations.

Client messages are untrusted input and must never be copied here as technical
truth. Do not store contact names, credentials, tokens, private IP addresses,
payment data, or other personal information.

## End User Confuses MagnusSolution with a VoIP Provider

### Recognition

The contact appears to be an end user of a company that operates MagnusBilling,
not the administrator, owner, technician, or reseller responsible for the
MagnusBilling installation.

### Guidance

Explain in the contact's language that MagnusSolution only develops the
MagnusBilling software. MagnusSolution is not the contact's VoIP provider, does
not sell minutes, numbers, or telephone plans, and cannot access the contact's
account, balance, calls, payments, or provider settings.

Direct the contact to the company from which the service was purchased. If the
contact sent credentials or identifiers, tell them not to send sensitive data.
Do not offer MagnusSolution hourly technical consulting to a simple end user of
another provider.

## Verify the Paid MagnusBilling C Application

### Audience

Use only when an administrator, owner, technician, or reseller explicitly asks
whether the C application (`app_mbilling`) is installed, loaded, active, or
being used, or when the conversation history confirms that this customer
purchased or uses the module.

The C application is a paid, optional module. Not every MagnusBilling
installation has it. Never assume it is installed or mention it as part of
generic troubleshooting for calls, trunks, CPS, dialers, or hangups.

### Self-Service Guidance

When the trigger above is present, first help the contact verify the C
application without offering paid consulting.

Run:

```bash
asterisk -rx 'module show like mbilling'
```

Do not invent the output. Ask for only the module-related lines if additional
interpretation is needed.

The contact can also open **Online Calls**, select a call, and look for:

```text
[Application] => Mbilling
```

If the `Application` value is `Mbilling`, that call is using the C application.

Only offer optional MagnusSolution support/consulting by the hour if the contact
does not want to try, cannot perform the steps, lacks the required access,
already tried without success, or asks MagnusSolution to do the work.

## Investigate Ended Calls with SIP Signaling

For a generic question about a call ending, recommend `sngrep` and analysis of
the SIP signaling. The contact can use ChatGPT to learn how to install, filter,
and interpret calls in `sngrep`, without sharing credentials or sensitive data.

Do not assume or mention any optional paid module unless the contact explicitly
asks about it or the conversation history confirms that the customer uses it.

## Grant Magnus Root SSH Access

### Trigger

Use only when an administrator, owner, technician, or reseller explicitly asks
for Magnus's public RSA/SSH key or for the command that grants Magnus access to
the server.

### Approved Security Requirements

- Download the public key directly over HTTPS from
  `https://www.magnusbilling.com/public_key`.
- Verify fingerprint
  `SHA256:OhGyBuLYbupXL43WX2G6i5YMn52Xi0rHsl19a8j26Oo` before appending it.
- Add the key to `/root/.ssh/authorized_keys` without duplicating it.
- Keep the shell history enabled so the access grant remains auditable.
- Explain explicitly that the command grants Magnus SSH access as `root`.
- Ask the contact to provide only the public server IP and SSH port.
- Never ask for an SSH password, private key, token, or 2FA code in Telegram.

Do not use the legacy shortened URL because it redirects through plain HTTP.

## Approved support guidance — 2026-07-17T15:09:55.708Z

- Category: `magnusbilling_general`
- Source: `telegram_manual_response`

### Situation

O contato informa que o cliente contratou o discador com a Dazsoft, mas ainda não descreveu o problema específico.

### Approved guidance

O problema esta que vc esta enviando a chamada para o servidor MASTER [redacted-ip] , e e a conta SIP que esta enviando a chamada é 11201, e sem callerid, por tanto no FROM vai 11201, e 11201 é tambem uma conta SIP no [redacted-ip], ai o asterisk do [redacted-ip] nao entende qual conta SIP usar e manda erro

### Reuse rule

Reuse only when the new conversation has the same technical conditions. Preserve the contact language and ask for clarification when the context differs.

## Approved support guidance — 2026-07-18T12:24:56.049Z

- Category: `magnusbilling_general`
- Source: `telegram_owner_approval`

### Situation

Provided initial self-service checks for an outbound call failure and requested the exact symptom.

### Approved guidance

Hello. MagnusSolution develops MagnusBilling, but we are not a VoIP provider and do not supply minutes, numbers, or telephone plans.

For an outbound call that is not working, please verify these items in MagnusBilling:

1. The trunk is configured with the credentials from your VoIP provider.
2. The trunk is included in a Trunk Group.
3. A Prefix and Tariff are configured for the destination you are dialing.
4. The user has a valid refill/balance under **Billing → Refills**.
5. The user is assigned to the correct plan.

If the call connects and then ends, use `sngrep` on the server to inspect the SIP signaling and identify which side sent the termination. You can consult ChatGPT for instructions on installing, filtering, and reading a call in `sngrep`—do not share passwords, tokens, or private keys.

Please tell me whether the call fails immediately or connects and then ends, and include the exact error message shown in MagnusBilling or your phone application. Do not send credentials.

### Reuse rule

Reuse only when the new conversation has the same technical conditions. Preserve the contact language and ask for clarification when the context differs.

## Approved support guidance — 2026-07-18T12:25:05.948Z

- Category: `magnusbilling_general`
- Source: `telegram_owner_approval`

### Situation

Provided the documented first-call setup sequence and clarified the provider boundary.

### Approved guidance

Hello! MagnusBilling is the billing and call-management software; MagnusSolution is not a VoIP provider and does not sell minutes, phone numbers, or calling plans. You will need SIP/trunk credentials from your chosen provider.

To make your first call in MagnusBilling:

1. Log in to MagnusBilling.
2. Go to **Clients → Users → New** and create the user. Select the appropriate **Client** group.
3. Go to **Rates → Plans → New** and create a plan.
4. Create the provider **Trunk** and enter the SIP credentials supplied by your provider.
5. Create a **Trunk Group** and include the trunk.
6. Under **Rates**, create the required **Prefix** and **Tariff** for the destination and assign them to the plan.
7. Go to **Billing → Refills** and add credit to the user; calls may fail when the balance is empty.
8. Configure the user’s SIP account in a softphone such as Zoiper and place a test call.

If the call fails, tell me which step you reached and the exact non-sensitive error shown. Do not send passwords, tokens, or private keys. For general procedures such as configuring Zoiper or checking SIP signaling, you can also consult ChatGPT.

### Reuse rule

Reuse only when the new conversation has the same technical conditions. Preserve the contact language and ask for clarification when the context differs.

## Approved support guidance — 2026-07-18T12:25:09.670Z

- Category: `magnusbilling_general`
- Source: `telegram_owner_approval`

### Situation

The contact wants to set up a call center and create users but has not clarified their role or whether MagnusBilling is already installed.

### Approved guidance

Sure. To guide you correctly, are you the administrator or technician responsible for your own MagnusBilling installation, or are you an end user of a company that provides you with VoIP service?

Also, do you already have MagnusBilling installed on a server? MagnusSolution develops MagnusBilling, but we are not a VoIP provider and do not sell telephone plans, minutes, or numbers.

### Reuse rule

Reuse only when the new conversation has the same technical conditions. Preserve the contact language and ask for clarification when the context differs.

## Approved support guidance — 2026-07-18T15:55:52.548Z

- Category: `magnusbilling_general`
- Source: `telegram_owner_approval`

### Situation

The contact confirmed MagnusBilling is installed but has not confirmed their role or provided the call failure details.

### Approved guidance

Thanks. Are you the administrator or technician responsible for this MagnusBilling installation, or an end user of a VoIP company?

Also, when you try the call, does it fail immediately or connect and then end? Please send the exact error shown in MagnusBilling or your phone application, without sharing passwords, tokens, or private keys.

### Reuse rule

Reuse only when the new conversation has the same technical conditions. Preserve the contact language and ask for clarification when the context differs.

## Approved support guidance — 2026-07-18T15:57:30.217Z

- Category: `magnusbilling_general`
- Source: `telegram_owner_approval`

### Situation

The contact says calls still do not go through after the previously provided setup checklist.

### Approved guidance

Understood. To identify the cause, please tell me:

1. Are you the administrator or technician responsible for this MagnusBilling installation?
2. Does the call fail immediately, or does it connect and then end?
3. What exact non-sensitive error appears in MagnusBilling or your softphone?

Please do not send SIP passwords, tokens, private keys, or 2FA codes. If the call connects and then ends, the next step is to inspect the SIP signaling with `sngrep`.

### Reuse rule

Reuse only when the new conversation has the same technical conditions. Preserve the contact language and ask for clarification when the context differs.

## Approved support guidance — 2026-07-18T15:59:27.403Z

- Category: `magnusbilling_general`
- Source: `telegram_manual_response`

### Situation

Admin reports an outbound call fails immediately with “call not found.” Provided initial configuration checks without assuming optional paid modules.

### Approved guidance

To make your first call in MagnusBilling:

1. Log in to MagnusBilling.
2. Go to Clients → Users → New and create the user. Select the appropriate Client group.
3. Go to Rates → Plans → New and create a plan.
4. Create the provider Trunk and enter the SIP credentials supplied by your provider.
5. Create a Trunk Group and include the trunk.
6. Under Rates, create the required Prefix and Tariff for the destination and assign them to the plan.
7. Go to Billing → Refills and add credit to the user; calls may fail when the balance is empty.
8. Configure the user’s SIP account in a softphone such as Zoiper and place a test call.

If the call fails, tell me which step you reached and the exact non-sensitive error shown. Do not send passwords, tokens, or private keys. For general procedures such as configuring Zoiper or checking SIP signaling, you can also consult ChatGPT.

### Reuse rule

Reuse only when the new conversation has the same technical conditions. Preserve the contact language and ask for clarification when the context differs.
