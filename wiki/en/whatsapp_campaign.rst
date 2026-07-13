.. _whatsapp-campaign:

WhatsApp campaigns
==================

This guide explains how to connect MagnusBilling to the official Meta WhatsApp Business Platform, send approved templates from a campaign, and receive replies through a webhook.

.. important::

   MagnusBilling is not a WhatsApp messaging provider and does not deliver messages. It only integrates your MagnusBilling installation with the official Meta WhatsApp Business Cloud API. Meta processes delivery and applies its own approval, pricing, quality, messaging-limit, and enforcement rules.

Responsibility and acceptable use
---------------------------------

The person or organization that owns and operates the Meta and MagnusBilling accounts is solely responsible for:

* obtaining valid recipient opt-in before sending a message;
* keeping evidence of consent and providing a clear opt-out method;
* selecting the recipients, content, templates, languages, dates, times, and sending frequency;
* complying with the WhatsApp Business Messaging Policy, WhatsApp Business Terms, commerce rules, privacy and data-protection requirements, telecommunications rules, consumer-protection rules, and every law applicable in the sender's and recipient's jurisdictions;
* all Meta fees, taxes, account verification, payment methods, quality ratings, messaging limits, template decisions, blocks, suspensions, and other restrictions;
* protecting access tokens, app secrets, personal data, and access to the MagnusBilling server.

Do not use campaigns for unsolicited messaging, purchased lists without valid consent, deception, harassment, illegal content, or prohibited/restricted goods and services. A technically successful API request does not prove that a message is lawful, compliant, accepted, or delivered.

Meta can change its interfaces, prices, limits, and policies at any time. Always review the current `WhatsApp Business Messaging Policy <https://business.whatsapp.com/policy>`_, `WhatsApp Business Terms <https://www.whatsapp.com/legal/business-terms/>`_, `opt-in guidance <https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in>`_, and `platform pricing <https://business.whatsapp.com/products/platform-pricing>`_ before using a campaign. These official rules prevail over this guide.

Requirements
------------

Before starting, make sure that you have:

* MagnusBilling 8 updated through database version 8.0.0.4;
* a public HTTPS URL with a valid certificate if replies will be received;
* a Meta developer account and a Meta business portfolio;
* a business app with the WhatsApp product;
* a WhatsApp Business Account (WABA) and a phone number accepted by Meta;
* an approved message template;
* recipient phone numbers with valid opt-in, saved in international format with country code;
* an active MagnusBilling user with credit and a phonebook containing active numbers.

The Meta dashboard changes occasionally. If a label differs, follow the current `Cloud API getting-started guide <https://developers.facebook.com/docs/whatsapp/cloud-api/get-started>`_.

1. Create the Meta app and WhatsApp account
--------------------------------------------

#. Sign in to `Meta for Developers <https://developers.facebook.com/>`_ and open **My Apps**.
#. Create an app intended for business use and associate it with the correct business portfolio.
#. Add the **WhatsApp** product to the app.
#. Open the WhatsApp API setup area.
#. Select or create the WhatsApp Business Account.
#. Add the sending phone number and complete the verification and display-name steps requested by Meta.
#. Add a valid payment method when Meta requires it for production use.
#. Record the **Phone Number ID** and **WhatsApp Business Account ID**. MagnusBilling sending currently needs the Phone Number ID; the WABA ID remains useful for administration in Meta.

A Meta test number and temporary token can be used during initial setup, but they are not appropriate production credentials.

2. Create a production access token
------------------------------------

Use Meta Business Settings to create or select a system user for the integration. Assign the app and the required WhatsApp account assets to that system user, then generate a production access token with the permissions required by the current Cloud API, normally including:

* ``whatsapp_business_messaging``;
* ``whatsapp_business_management``.

Copy the token only once and store it securely. Never place it in screenshots, tickets, chat messages, source control, or public documentation. Use the minimum necessary permissions, restrict administrative access, and rotate the token immediately if it may have been exposed. Meta controls token validity and can revoke it.

3. Configure MagnusBilling
--------------------------

Run the MagnusBilling database update before configuring the integration. In **Settings > Configuration**, set:

``WhatsApp Phone Number ID``
   The Phone Number ID shown in the Meta WhatsApp API setup.

``WhatsApp Access Token``
   The production token created for the integration. Do not use a temporary test token in production.

``WhatsApp API Version``
   The Graph API version used by MagnusBilling. Keep the installed default unless the integration is being upgraded and validated for another version.

``WhatsApp API Timeout``
   Maximum time, in seconds, for an API request.

The token is sensitive. Limit access to the Configuration menu and to server backups containing the database.

4. Create and approve a template
--------------------------------

#. Open WhatsApp Manager in Meta Business tools.
#. Create a message template with the correct category, name, language, body, and any required examples.
#. Submit it to Meta and wait until its status is approved before activating the campaign.
#. Copy the template name and language code exactly as shown by Meta. They are case-sensitive integration values.

Read Meta's current `message-template guidelines <https://developers.facebook.com/docs/whatsapp/message-templates/guidelines>`_ and `template sending guide <https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates>`_. Meta may reject, pause, or disable a template based on content, feedback, or policy compliance.

.. warning::

   The current MagnusBilling campaign integration sends the template name and language only. It does not send header, body, button, or variable components. Use a template that requires no parameters. A template containing placeholders such as ``{{1}}`` will not work until component support is implemented.

5. Prepare the phonebook
-------------------------

#. Open **Voice Broadcasting > Phonebooks** and create or select a phonebook owned by the campaign user.
#. Import the recipients in international format: country code, area code, and number. Digits-only format is recommended.
#. Confirm that the numbers have active status and that every recipient has provided valid WhatsApp opt-in.
#. Remove opted-out, invalid, blocked, or otherwise ineligible recipients before every campaign.

The fact that a number has a WhatsApp account is not consent to receive marketing or automated messages.

6. Create the WhatsApp campaign
-------------------------------

#. Open **Voice Broadcasting > Campaigns** and create a campaign.
#. Select the user that owns the phonebook and has available credit.
#. Set **Type** to **WhatsApp**.
#. Enter a name and configure the starting date, expiration date, enabled weekdays, daily start time, and daily stop time.
#. Set **Frequency** to the maximum number of contacts MagnusBilling should attempt per minute. Meta's own throughput and messaging limits still apply.
#. Select one or more phonebooks.
#. In the **Messages** tab, set **WhatsApp template name** and **WhatsApp template language** exactly as approved by Meta.
#. Enable **Restrict phone** if the local restricted-number list must be applied.
#. Save the campaign with active status.

The WhatsApp campaign process runs every minute. It selects active phonebook numbers that are eligible for the campaign schedule. A successful Cloud API acceptance is recorded in the message history with the Meta message ID. Acceptance is not the same as final delivery.

7. Receive replies
------------------

Replies require a public HTTPS webhook.

#. In **Settings > Configuration**, create a strong random value for **WhatsApp Webhook Verify Token**. This is a secret chosen by you; it is not the access token.
#. Copy the Meta application's **App Secret** into **WhatsApp App Secret**.
#. In the Meta app's WhatsApp webhook configuration, use this callback URL, replacing the host and installation directory as required::

      https://YOUR_HOST/mbilling/index.php/whatsappWebhook/index

#. Enter the same verify token configured in MagnusBilling.
#. Complete Meta's webhook verification.
#. Subscribe the WhatsApp Business Account webhook to the ``messages`` field. Follow Meta's current `webhook setup guide <https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks>`_.

Incoming requests are accepted only when their ``X-Hub-Signature-256`` matches the configured App Secret. Received messages are stored in **Voice Broadcasting > Received Messages** with channel ``whatsapp`` and status **Received**.

MagnusBilling associates a reply with the most recent logged WhatsApp send to that number. For older sends, it also tries to locate the number in a WhatsApp campaign phonebook. A reply that cannot be associated with a MagnusBilling user is logged on the server and is not shown in the menu.

Operational checklist
---------------------

Before activating a campaign, confirm all of the following:

* the database version is at least 8.0.0.4;
* the Phone Number ID and production access token belong to the same Meta setup;
* the template is approved, enabled, parameter-free, and matches the configured name and language;
* the campaign owner has credit;
* the campaign is active and currently inside its date, weekday, and daily-time window;
* its phonebooks contain active, correctly formatted, opted-in numbers;
* Frequency is compatible with Meta limits and the desired sending rate;
* the campaign cron process is running;
* account quality, messaging limits, billing, and phone-number status are healthy in WhatsApp Manager;
* the restricted-number and opt-out lists are current.

Common problems
---------------

No messages are sent
   Check the token, Phone Number ID, approved template name/language, user credit, campaign schedule, active phonebook numbers, cron process, Meta billing, quality rating, messaging limits, and account restrictions.

Meta reports missing template parameters
   The selected template requires components or variables. Use a parameter-free approved template with the current integration.

The API accepts the message but the recipient does not receive it
   API acceptance is not delivery. Review message status and diagnostics in Meta, recipient eligibility, opt-in, quality, limits, template status, and the destination number.

Replies do not appear
   Confirm HTTPS availability, webhook verification, subscription to ``messages``, the App Secret, the signature header, and that the sender number exists in a logged WhatsApp send or campaign phonebook.

The integration suddenly stops
   Check whether Meta revoked the token, changed asset permissions, disabled the template, restricted the account or phone number, changed an API requirement, or retired the configured Graph API version.

No warranty of delivery
-----------------------

MagnusBilling does not control Meta's network, approvals, delivery, pricing, recipient devices, blocks, quality systems, or enforcement decisions. The integration does not guarantee acceptance, delivery, reading, replies, uninterrupted service, or continued availability of any Meta feature. The user assumes all responsibility and risk arising from the configuration and use of WhatsApp campaigns. This guide is operational information and is not legal advice.
