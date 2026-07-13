.. _whats-new-mbilling-8:

What's new in MBilling 8
========================

MBilling 8 updates the telephony base and adds a new business-messaging
channel. The main operational changes compared with MBilling 7 are Asterisk
20, PJSIP as the SIP channel driver, and integration with the official Meta
WhatsApp Business Platform.

Asterisk 20
-----------

New MBilling 8 installations compile and install Asterisk 20. The installer
uses the bundled PJProject implementation and prepares the Asterisk files used
by MagnusBilling.

When upgrading an existing server, treat the PBX change as an infrastructure
migration. Back up the database and ``/etc/asterisk``, validate custom
dialplans and modules, and test inbound calls, outbound calls, queues, IVRs,
recordings, DTMF, codecs, and billing before moving production traffic.

PJSIP
-----

New installations use PJSIP instead of the legacy ``chan_sip`` driver. The
installer explicitly disables ``chan_sip`` and creates these managed files:

* ``/etc/asterisk/pjsip_magnus.conf`` for server and trunk configuration;
* ``/etc/asterisk/pjsip_magnus_user.conf`` for customer endpoints.

Both are included from ``/etc/asterisk/pjsip.conf``. Queue members, IVR
destinations, online-call actions, and SIP accounts use ``PJSIP/<endpoint>``
identifiers in MBilling 8.

Do not copy a custom ``sip.conf`` or ``chan_sip`` peer unchanged and expect it
to work with PJSIP. Recreate transports, endpoints, authentication, address of
record, identification, NAT, codec, and registration options using PJSIP
semantics. After the migration, confirm endpoint status from the Asterisk CLI
and make controlled test calls in both directions.

WhatsApp Business messaging
----------------------------

MBilling 8 can send approved message templates from a campaign through the
official Meta WhatsApp Business Cloud API and can store replies received by a
verified webhook.

The integration requires a Meta business app, a WhatsApp Business Account,
an accepted sending number, a production access token, and an approved
parameter-free template. Recipients must have given valid opt-in. Meta remains
the messaging provider and controls delivery, pricing, limits, quality, and
policy enforcement.

See :doc:`whatsapp_campaign` for the complete configuration, campaign, webhook,
security, consent, and troubleshooting guide.

Compatibility note
------------------

This page describes the defaults of a new MBilling 8 installation. Existing
servers may contain local Asterisk, network, trunk, dialplan, or automation
customizations. Validate those customizations against the real host before an
upgrade; installing the web source alone does not migrate every PBX setting.
