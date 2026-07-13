---
doc_id: MB-RAG-DOMAIN-MBILLING8-PLATFORM-CHANGES
version: 1.0
language: en
tags: [mbilling8, asterisk20, pjsip, whatsapp-business, migration]
---

# MBilling 8 Platform Changes

## What This Domain Answers

- What changed in the MBilling 8 telephony base.
- Whether a SIP registration or routing issue belongs to PJSIP migration.
- How WhatsApp Business campaigns differ from voice and SMS campaigns.

## Current Code Evidence

- `script/install.sh` installs Asterisk 20 with bundled PJProject.
- The installer disables `chan_sip`, writes `/etc/asterisk/pjsip.conf`, and
  includes `pjsip_magnus.conf` and `pjsip_magnus_user.conf`.
- `protected/components/AsteriskAccess.php` writes PJSIP user definitions and
  operates queue members with `PJSIP/<endpoint>` identifiers.
- `protected/components/WhatsAppBusinessApi.php` sends through the official
  Meta Cloud API.
- `protected/commands/WhatsappCampaignCommand.php` dispatches eligible
  WhatsApp campaign recipients.
- `protected/controllers/WhatsappWebhookController.php` verifies and stores
  inbound webhook messages.
- `wiki/en/whatsapp_campaign.rst` is the user-facing operational guide.

## Support Routing

### Asterisk or PJSIP

1. Confirm whether the host is a new MBilling 8 installation or an upgraded,
   customized server.
2. Check the active Asterisk version and loaded channel modules on the host.
3. Inspect the generated PJSIP files and endpoint status before changing panel
   records.
4. Separate registration, authentication, NAT, codec, dialplan, and billing
   failures; they occur at different layers.
5. For migrations, do not translate `chan_sip` options literally. Validate the
   equivalent PJSIP transport, endpoint, auth, AOR, identify, and registration.

### WhatsApp Business

1. Confirm the campaign type, schedule, owner credit, eligible phonebook
   numbers, and the exact approved template name and language.
2. Confirm the Meta Phone Number ID, production token, Graph API version,
   account quality, billing, and messaging limits.
3. Treat Cloud API acceptance separately from final delivery.
4. For replies, validate the public HTTPS callback, verify token, app secret,
   signature, and subscription to the `messages` webhook field.
5. MagnusBilling provides the integration; Meta is the messaging provider.
   Consent, content, legal compliance, charges, and account standing remain the
   operator's responsibility.

## Compatibility Boundary

The installer documents defaults for a new server. A production upgrade may
have custom Asterisk files, trunks, dialplans, firewalls, NAT, TLS, codecs, or
automation. Verify the active runtime and preserve those customizations during
migration.
