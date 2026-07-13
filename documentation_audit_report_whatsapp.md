# WhatsApp campaign documentation audit

Date: 2026-07-13

## Scope

User-facing documentation for configuring and operating WhatsApp campaigns in MagnusBilling 8, including Meta credentials, templates, campaign execution, inbound replies, platform conditions, and responsibility boundaries.

## Current state

- The durable field-help sources are `resources/help/help_en.js` and `resources/help/help_pt_BR.js`.
- Generated campaign field pages exist at `wiki/en/modules/campaign/campaign.rst` and `wiki/pt_BR/modules/campaign/campaign.rst`.
- The existing campaign help describes only Voice and SMS. It does not describe the WhatsApp campaign type or its template fields.
- The Wiki has no end-to-end guide for Meta app creation, Cloud API credentials, webhook configuration, approved templates, campaign creation, inbound replies, or operational responsibility.
- `wiki/generate.php` still contains MBilling_7-specific absolute paths and database settings, so it is unsafe to run unchanged from this MBilling_8 checkout.

## Documentation changes required

1. Add durable English and Brazilian Portuguese help for the WhatsApp campaign type, template name, and template language.
2. Add a standalone end-to-end WhatsApp campaign guide in English and Brazilian Portuguese.
3. Link both guides from the corresponding Wiki indexes.
4. State clearly that MagnusBilling only integrates with Meta's WhatsApp Business Platform and is not the message sender or messaging provider.
5. State that the user is responsible for Meta account approval, recipient consent, templates, content, audience, legal compliance, charges, quality rating, blocks, and account restrictions.
6. Cite official Meta resources for setup and policy details that can change over time.

## Validation approach

- Do not run the legacy generator until its hard-coded MBilling_7 paths are migrated.
- Validate RST references and structure locally.
- Validate JavaScript help-file syntax locally.
- Do not use real credentials or contact Meta during documentation validation.
