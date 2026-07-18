.. _tts:

TTS configuration
=================

MagnusBilling can generate campaign audio from text. This page describes the
ElevenLabs API integration and the legacy URL-based providers.

Use automated calls only for contacts who have consented to receive them.
Follow the privacy, telemarketing, opt-out, and telecommunications rules that
apply in the sender's and recipient's jurisdictions.

ElevenLabs
----------

Requirements
~~~~~~~~~~~~

The server needs outbound HTTPS access, the PHP cURL and iconv extensions, and
``mpg123``. The ElevenLabs account must have an API key and an available voice.

Keep the API key outside the web root. Never place it in a campaign field,
source file, database setting, screenshot, ticket, or log.

Server configuration
~~~~~~~~~~~~~~~~~~~~

Copy ``resources/elevenlabs/elevenlabs.conf.example`` to
``/etc/asterisk/elevenlabs.conf`` and edit the copy:

.. code-block:: ini

   api_url = "https://api.elevenlabs.io/v1/text-to-speech"
   api_key = "REPLACE_WITH_ELEVENLABS_API_KEY"
   voice_id = "REPLACE_WITH_VOICE_ID"
   model_id = "eleven_multilingual_v2"
   output_format = "mp3_44100_128"

Protect the configuration so only the administrator and Asterisk can read it:

.. code-block:: console

   chown root:asterisk /etc/asterisk/elevenlabs.conf
   chmod 0640 /etc/asterisk/elevenlabs.conf

The default path can be changed with the ``ELEVENLABS_CONFIG`` environment
variable.

In **Settings > Configuration**, set **TTS URL** to:

.. code-block:: text

   elevenlabs

Campaign fields
~~~~~~~~~~~~~~~

Both ``tts_audio`` and ``tts_audio2`` accept ``%name%``. MagnusBilling replaces
it with the name stored for that contact in **Phone Numbers** before requesting
and caching the audio.

Example:

.. code-block:: text

   tts_audio:
   Hello %name%. We have important information for you.

   tts_audio2:
   To receive the link by SMS, press 2.

When two prompts are configured, the second starts immediately after the first.
A digit pressed during the first prompt is preserved and the second prompt is
skipped. When either text contains ``%name%``, MagnusBilling does not play the
legacy standalone name prompt, which avoids speaking the name twice.

To override the configured model and voice for one text, use:

.. code-block:: text

   MODEL_ID|VOICE_ID|Text to synthesize

Audio processing and cache
~~~~~~~~~~~~~~~~~~~~~~~~~~

MagnusBilling converts the ElevenLabs response to an 8 kHz, 16-bit, mono WAV
file for Asterisk. Files are cached as ``/tmp/tts_audio_<hash>.wav``.

The cache key includes the provider, voice, model, output format, and
personalized text. A file lock prevents concurrent requests from generating
and charging for the same audio twice. Invalid Windows-1252 input is normalized
to UTF-8 before the JSON request is sent.

Testing and troubleshooting
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Leave only a test contact active before starting a test campaign. Monitor the
Asterisk console:

.. code-block:: console

   asterisk -rvvvvv

Verify generated files when diagnosing audio:

.. code-block:: console

   file /tmp/tts_audio_*.wav

``ElevenLabs TTS request failed``
   Check the API key, voice ID, model, account quota, DNS, and outbound HTTPS.

The first prompt plays but the second is silent
   Confirm that ``tts_audio2`` is populated, ``mpg123`` is installed, and the
   Asterisk console has no ``ElevenLabs TTS error`` or conversion error.

Accented names fail or generate no audio
   Update MagnusBilling to the version containing the UTF-8 normalization
   support and regenerate the affected cache file.

Legacy URL-based providers
--------------------------

For URL-based providers, the **TTS URL** setting may contain ``$name``.
MagnusBilling replaces it with the URL-encoded text. Provider credentials and
options must be replaced with values from the provider account.

Vocalware
~~~~~~~~~

Example configured for Brazilian Portuguese:

.. code-block:: text

   https://www.vocalware.com/tts/gen.php?EID=3&LID=6&VID=1&TXT=$name&EXT=mp3&FX_TYPE=&FX_LEVEL=&ACC=YOUR_ACC&API=YOUR_API&SESSION=&HTTP_ERR=&CS=&SECRET=YOUR_SECRET

In this example, ``EID=3`` is the engine, ``LID=6`` is Portuguese, and
``VID=1`` selects the voice.

VoiceRSS
~~~~~~~~

Example configured for Brazilian Portuguese and Asterisk-compatible output:

.. code-block:: text

   http://api.voicerss.org/?key=YOUR_API&hl=pt-br&src=$name&f=8khz_16bit_mono

Google
~~~~~~

The legacy Google URL format is:

.. code-block:: text

   https://translate.google.com/translate_tts?ie=UTF-8&q=$name&tl=pt-BR&total=1&idx=0&textlen=5&client=tw-ob&tk=$token

Third-party interfaces, prices, limits, and terms can change. Review the
provider's current documentation before using any legacy URL in production.

Security and costs
------------------

TTS services can charge per request or character. Review usage and billing,
restrict access to configuration files, and rotate any credential that was
shared in chat, email, terminal history, or a support ticket.

Provider references:

* `ElevenLabs API documentation <https://elevenlabs.io/docs/api-reference/>`_
* `Vocalware <https://www.vocalware.com/>`_
* `VoiceRSS <https://www.voicerss.org/>`_
