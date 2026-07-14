.. _module-overview:

MagnusBilling module overview
=============================

This page groups the main MagnusBilling modules by operational purpose. It is
intended to help administrators find the correct area of the panel before
changing configuration.

Detailed field descriptions are displayed directly inside MagnusBilling. Open
a form and use the help control beside a field to see its contextual
description. Those field descriptions are maintained separately from this
public Wiki so that the panel remains the authoritative reference for its
current forms.

Customer management
-------------------

* **Users** manages customer accounts, plans, balances, limits, and account
  status.
* **SIP Users** and **IAX Users** manage telephony endpoints and credentials.
* **CallerID** controls caller identity entries associated with users.
* **Calls Online** shows active calls and available real-time actions.
* **Restricted Numbers** and **Callback** control number restrictions and
  callback services.

Billing and payments
--------------------

* **Refills** records credit movements applied to customer accounts.
* **Payment Methods** configures the payment options offered by the platform.
* **Vouchers** creates prepaid codes that customers can redeem.
* **Provider Refills** records payments and credit movements involving
  providers.
* **Send Credit** modules manage supported credit-transfer products and rates.

Rates, plans, and offers
------------------------

* **Plans** groups the tariffs and services assigned to customers.
* **Tariffs** defines customer selling prices and routing associations.
* **Prefixes** identifies destinations used during tariff matching.
* **Provider Rates** records provider costs for comparison and routing.
* **User Custom Rates** overrides standard rates for specific customers.
* **Offers** configures packages, allowances, and recurring benefits.

For calculation details, see :doc:`Price calculation <price_calculation>` and :doc:`Tariff selection <find_rate>`.

DIDs and inbound routing
------------------------

* **DIDs** manages inbound telephone numbers.
* **DID Destination** defines where an inbound number is delivered.
* **IVRs** builds interactive voice-response menus.
* **Queues** and **Queue Members** configure contact-center distribution.
* **Holidays** applies date-based routing behavior.
* **DID History** and **DID Use** provide assignment and usage visibility.

Trunks and outbound routing
---------------------------

* **Trunks** configures connections to voice providers.
* **Trunk Groups** controls routing order and failover between trunks.
* **Provider Rates** stores the cost associated with provider destinations.
* **Trunk SIP Codes** maps provider responses used by routing and diagnostics.

MBilling 8 uses PJSIP for new installations. Review :doc:`What's new in MBilling 8 <whats_new_mb8>` before migrating legacy ``chan_sip`` settings.

Campaigns and messaging
-----------------------

* **Campaigns** schedules outbound voice, SMS, or WhatsApp operations.
* **Phonebooks** and **Phone Numbers** organize campaign recipients.
* **Campaign Polls** collects responses from supported campaign flows.
* **Campaign Restrictions** blocks numbers that must not be contacted.
* **Campaign Reports** and **Campaign Dashboard** show operational results.

For business messaging setup and compliance requirements, see :doc:`WhatsApp campaigns <whatsapp_campaign>`.

Reports and monitoring
----------------------

* **CDR** provides the detailed call record used for billing investigation.
* **Summary** modules aggregate traffic by day, month, user, trunk, DID, agent,
  or call shop.
* **SIP Trace** captures signaling when the optional module is installed.
* **Alarms** and **User Logs** support operational monitoring and auditing.

System administration
---------------------

* **Configuration** controls global platform behavior.
* **Servers** describes the telephony servers managed by the installation.
* **User Groups** and **Module Groups** control access to panel functions.
* **API** manages credentials and permissions for external integrations.
* **SMTP** and **Email Templates** control outgoing administrative email.
* **Firewall** exposes supported access-control management.
* **Services** manages recurring services assigned to customers.

Use the module-specific field help before saving unfamiliar values. For system
changes, back up the database and configuration and validate behavior on the
actual server.
