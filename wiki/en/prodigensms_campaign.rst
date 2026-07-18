.. _prodigensms-campaign:

Prodigensms campaigns
=====================

This guide configures a voice campaign to send a Prodigensms template when the
called contact presses the campaign authorization digit.

.. important::

   MagnusBilling does not deliver the SMS. It sends a template request to
   Prodigensms. The account owner is responsible for recipient consent,
   template content, opt-out handling, provider charges, and compliance with
   all applicable privacy, telecommunications, and messaging rules.

Requirements
------------

Before starting, confirm that:

* the server has outbound HTTPS access and the PHP cURL extension;
* the Prodigensms account and API token are active;
* the template and shortener already exist at the provider;
* the landing URL is correct; and
* the test contact is a valid Brazilian mobile number.

Keep credentials outside the web root. Never place the API token in a campaign
URL, source file, database field, screenshot, ticket, or log.

1. Configure the provider
-------------------------

Copy ``resources/prodigensms/prodigensms.conf.example`` to
``/etc/asterisk/prodigensms.conf`` and edit the copy:

.. code-block:: ini

   api_url = "https://prodigensms.com/api/v1/sms/send"
   api_token = "REPLACE_WITH_PRODIGENSMS_TOKEN"
   webhook_secret = "REPLACE_WITH_RANDOM_SECRET"
   shortener_id = "689"
   original_url = "https://cadastro.example.com/"

Generate a random webhook secret and protect the file:

.. code-block:: console

   openssl rand -hex 32
   chown root:www-data /etc/asterisk/prodigensms.conf
   chmod 0640 /etc/asterisk/prodigensms.conf

The default path can be changed with the ``PRODIGENSMS_CONFIG`` environment
variable.

2. Configure the campaign
-------------------------

#. Open **Voice Broadcasting > Campaigns**.
#. Select the campaign and its test phonebook.
#. Configure the authorization digit, for example ``2``.
#. Configure the campaign prompts. ElevenLabs setup and ``%name%`` usage are
   documented in :doc:`TTS configuration <tts>`.
#. Set ``forward_number`` to:

   .. code-block:: text

      custom|http://127.0.0.1/mbilling/index.php/prodigensms/send?number=%number%&templateId=77&name=%name%&msg=campaign+SMS+test

#. Replace ``77`` with the template ID approved for the provider account.
#. Leave only the test contact active and start the campaign.

When the contact presses the configured digit, MagnusBilling replaces
``%number%`` and ``%name%`` and invokes the local callback.

3. Understand the provider payload
----------------------------------

The controller sends a JSON request such as:

.. code-block:: json

   {
     "to": "5511999999999",
     "templateId": 77,
     "shortenerId": 689,
     "originalUrl": "https://cadastro.example.com/",
     "name": "Contact name",
     "msg": "campaign SMS test"
   }

The parameters are handled as follows:

``number``
   Becomes ``to`` and is normalized to a Brazilian mobile number.

``templateId``
   Is required in the campaign URL and must be a positive integer.

``shortenerId`` and ``originalUrl``
   Use the server configuration defaults. Valid values in the callback URL
   override those defaults.

Other query parameters
   Every other valid scalar parameter is forwarded to Prodigensms. This allows
   ``name``, ``msg``, and additional variables supported by the selected
   template. The controller accepts up to 30 extra parameters with validation
   limits on names and values.

The ``key``, ``number``, ``templateId``, and ``to`` parameters are reserved and
are not forwarded as extra template variables.

4. Callback security
--------------------

Use ``127.0.0.1`` when Asterisk and the MagnusBilling web application are on
the same server. Loopback requests do not need the webhook key.

An external request must use HTTPS and include the configured secret:

.. code-block:: text

   https://YOUR_HOST/mbilling/index.php/prodigensms/send?key=WEBHOOK_SECRET&number=5511999999999&templateId=77

Do not expose the external callback unless it is necessary. Protect the host
with the normal MagnusBilling firewall and access-control practices.

5. Test the callback
--------------------

Always quote a shell URL containing ``&``:

.. code-block:: console

   curl 'http://127.0.0.1/mbilling/index.php/prodigensms/send?number=5511999999999&templateId=77&name=Test'

For spaces and special characters, use:

.. code-block:: console

   curl --get 'http://127.0.0.1/mbilling/index.php/prodigensms/send' \
     --data-urlencode 'number=5511999999999' \
     --data-urlencode 'templateId=77' \
     --data-urlencode 'name=Test contact' \
     --data-urlencode 'msg=Campaign SMS test'

A successful callback returns:

.. code-block:: json

   {"success":true,"provider_status":200}

If the URL is not quoted, the shell treats each ``&`` as a background-command
separator. The server receives only the first parameter and normally returns
``invalid_template_id``.

6. Test the complete campaign
-----------------------------

#. Leave only the test contact active.
#. Confirm the prompts, authorization digit, template ID, and
   ``forward_number``.
#. Start the campaign and answer the call.
#. Confirm both prompts play and press the authorization digit.
#. Confirm the SMS arrives.
#. Check that the campaign report records the forward action.

Monitor the Asterisk console during the test:

.. code-block:: console

   asterisk -rvvvvv

Common problems
---------------

``invalid_template_id``
   Ensure ``templateId`` is numeric and present. Quote the entire cURL URL.

``invalid_number``
   The endpoint accepts Brazilian mobile destinations and normalizes them to
   ``55 + DDD + 9-digit mobile number``.

``forbidden``
   An external callback did not include the correct ``key``. Prefer the
   loopback callback for a local campaign.

``provider_error``
   Check the API token, template, shortener, account status, provider balance,
   outbound HTTPS connectivity, and MagnusBilling application log.

The authorization digit does not send an SMS
   Confirm that the campaign digit matches the pressed digit, the forward URL
   begins with ``custom|``, the number remains active for the test, and the
   campaign report records the DTMF result.

Security and maintenance
------------------------

Rotate any credential that was shared in chat, email, terminal history, or a
support ticket. Use a restricted API token where available, protect backups
containing ``/etc/asterisk``, and review provider usage and billing.

Provider reference:

* `Prodigensms <https://prodigensms.com/>`_
