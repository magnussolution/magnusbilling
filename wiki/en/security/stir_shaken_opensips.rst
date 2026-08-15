STIR/SHAKEN on the OpenSIPS 3.6 proxy
=====================================

This guide explains how to enable STIR/SHAKEN signing and verification on the
OpenSIPS 3.6 proxy used by MagnusBilling 8.

The integration does not change master/slave routing or dispatcher selection.
The private header sent to MagnusBilling slaves remains exactly::

   P-CallerID: display-name|number

Existing slave dialplans can continue reading it with::

   Set(CALLERID(name)=${CUT(PJSIP_HEADER(read,P-CallerID),|,1)})
   Set(CALLERID(num)=${CUT(PJSIP_HEADER(read,P-CallerID),|,2)})

Requirements
------------

Production signing requires the following material from an approved
STIR/SHAKEN authority:

* a valid STI X.509 certificate in PEM format;
* the matching private key in PEM format;
* a stable public HTTPS URL (``x5u``) that serves the STI certificate; and
* an attestation policy appropriate for the authenticated caller.

Do not use a self-signed certificate in production. Never publish the private
key. The server clock must be synchronized with NTP because the configured
authentication and verification freshness window is 60 seconds.

Publish the certificate
-----------------------

Publish only the certificate at a stable HTTPS location, for example::

   https://certificates.example.com/stir/certificate.pem

The URL must use a valid TLS certificate, return HTTP 200, and serve the STI
certificate as PEM. Test it before installation::

   curl --fail --show-error --location \
     https://certificates.example.com/stir/certificate.pem

Inspect the published certificate::

   curl --fail --silent \
     https://certificates.example.com/stir/certificate.pem \
     | openssl x509 -noout -subject -issuer -dates

Choose the attestation
----------------------

Use the strongest attestation that the authentication and Caller ID
authorization process can truthfully support:

``A``
   The customer is authenticated and is authorized to use the presented
   calling number.

``B``
   The customer is authenticated, but authorization for that particular
   calling number has not been fully established.

``C``
   The call arrived through a gateway and the originating caller cannot be
   authenticated.

Do not assign ``A`` to all traffic unless MagnusBilling or an upstream system
has verified that each subscriber owns or controls the presented number. The
installer defaults to ``C``.

New proxy installation
----------------------

Validate the local files first::

   openssl x509 -in /root/stir/certificate.pem \
     -noout -subject -issuer -dates
   openssl pkey -in /root/stir/private-key.pem -check -noout

Run the installer with the signing material in environment variables::

   sudo env \
     STIR_SHAKEN_CERT_PATH=/root/stir/certificate.pem \
     STIR_SHAKEN_KEY_PATH=/root/stir/private-key.pem \
     STIR_SHAKEN_X5U=https://certificates.example.com/stir/certificate.pem \
     STIR_SHAKEN_ATTESTATION=A \
     STIR_SHAKEN_VERIFY_REJECT=0 \
     ./script/installOpenSips-3.6.sh PUBLIC_IP MAGNUSBILLING_IP

When the bind/local address differs from the advertised public address, pass
it as the third argument::

   sudo env \
     STIR_SHAKEN_CERT_PATH=/root/stir/certificate.pem \
     STIR_SHAKEN_KEY_PATH=/root/stir/private-key.pem \
     STIR_SHAKEN_X5U=https://certificates.example.com/stir/certificate.pem \
     STIR_SHAKEN_ATTESTATION=A \
     STIR_SHAKEN_VERIFY_REJECT=0 \
     ./script/installOpenSips-3.6.sh PUBLIC_IP MAGNUSBILLING_IP LOCAL_IP

The installer performs these actions:

#. Installs the OpenSIPS STIR/SHAKEN and HTTP modules.
#. Creates ``/etc/opensips/stir-shaken``.
#. Installs the certificate, private key, and trusted CA list.
#. Creates ``stir_shaken_config`` in the ``opensips`` database.
#. Enables signing only after MySQL successfully loads the certificate and
   private key.
#. Enables verification in monitor-only mode by default.

If ``STIR_SHAKEN_CERT_PATH``, ``STIR_SHAKEN_KEY_PATH``, and
``STIR_SHAKEN_X5U`` are omitted, installation continues with signing disabled.

Upgrade an existing proxy
-------------------------

Install the modules::

   sudo apt update
   sudo apt install -y opensips-stir-shaken-module opensips-http-modules

Deploy the updated configuration::

   sudo cp script/opensips-3.6.cfg /etc/opensips/opensips.cfg

If the file was copied directly from a source checkout, replace the installer
markers ``MYSQLUSER:MYSQLPASS``, ``MYIP``, ``LOCALIP``, and ``MASTERIP`` with
the values for that proxy.

Create the certificate directory and initial trust list::

   sudo install -d -o opensips -g opensips -m 0755 \
     /etc/opensips/stir-shaken
   sudo cp /etc/ssl/certs/ca-certificates.crt \
     /etc/opensips/stir-shaken/ca-list.pem
   sudo chown opensips:opensips \
     /etc/opensips/stir-shaken/ca-list.pem
   sudo chmod 0640 /etc/opensips/stir-shaken/ca-list.pem

Open the database client with ``mysql -u root -p opensips`` and create the
configuration table::

   CREATE TABLE IF NOT EXISTS stir_shaken_config (
       id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
       sign_enabled TINYINT(1) NOT NULL DEFAULT 0,
       verify_enabled TINYINT(1) NOT NULL DEFAULT 1,
       verify_reject TINYINT(1) NOT NULL DEFAULT 0,
       attestation ENUM('A','B','C') NOT NULL DEFAULT 'C',
       x5u VARCHAR(1024) NOT NULL DEFAULT '',
       certificate LONGTEXT NULL,
       private_key LONGTEXT NULL,
       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
           ON UPDATE CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

   INSERT IGNORE INTO stir_shaken_config (id) VALUES (1);

Temporarily make the files readable by the MySQL process::

   sudo install -o root -g mysql -m 0640 /root/stir/certificate.pem \
     /etc/opensips/stir-shaken/certificate.pem
   sudo install -o root -g mysql -m 0640 /root/stir/private-key.pem \
     /etc/opensips/stir-shaken/private-key.pem

Load the material without pasting or printing the private key::

   SET @stir_cert =
       LOAD_FILE('/etc/opensips/stir-shaken/certificate.pem');
   SET @stir_key =
       LOAD_FILE('/etc/opensips/stir-shaken/private-key.pem');

   UPDATE stir_shaken_config
   SET sign_enabled =
           IF(@stir_cert IS NOT NULL AND @stir_key IS NOT NULL, 1, 0),
       verify_enabled = 1,
       verify_reject = 0,
       attestation = 'A',
       x5u = 'https://certificates.example.com/stir/certificate.pem',
       certificate = @stir_cert,
       private_key = @stir_key
   WHERE id = 1;

Restore restrictive ownership and permissions::

   sudo chown opensips:opensips \
     /etc/opensips/stir-shaken/certificate.pem \
     /etc/opensips/stir-shaken/private-key.pem
   sudo chmod 0640 \
     /etc/opensips/stir-shaken/certificate.pem \
     /etc/opensips/stir-shaken/private-key.pem

Confirm that the content was loaded without displaying it::

   SELECT id, sign_enabled, verify_enabled, verify_reject,
          attestation, x5u,
          LENGTH(certificate) AS certificate_bytes,
          LENGTH(private_key) AS private_key_bytes,
          updated_at
   FROM stir_shaken_config
   WHERE id = 1;

Verification policy
-------------------

The default policy is::

   verify_enabled = 1
   verify_reject  = 0

This is monitor-only mode. Valid and invalid identities are logged and passed
to MagnusBilling as verification metadata, but STIR/SHAKEN failures do not
reject calls.

After monitoring interoperability with every provider, strict rejection can
be enabled::

   UPDATE stir_shaken_config
   SET verify_enabled = 1, verify_reject = 1
   WHERE id = 1;

Return to monitor-only mode with::

   UPDATE stir_shaken_config
   SET verify_reject = 0
   WHERE id = 1;

Disable verification with::

   UPDATE stir_shaken_config
   SET verify_enabled = 0
   WHERE id = 1;

Calls without an ``Identity`` header continue normally. With
``verify_reject=1``, a call that supplies an invalid Identity, unreachable
certificate, or invalid signature is rejected.

Signing policy
--------------

Enable signing only when all required values exist::

   UPDATE stir_shaken_config
   SET sign_enabled = 1
   WHERE id = 1
     AND certificate IS NOT NULL
     AND private_key IS NOT NULL
     AND x5u LIKE 'https://%';

Disable signing without deleting credentials::

   UPDATE stir_shaken_config
   SET sign_enabled = 0
   WHERE id = 1;

Change the attestation, when justified by the authorization policy::

   UPDATE stir_shaken_config
   SET attestation = 'B'
   WHERE id = 1;

New calls read these database values immediately; a restart is not required
for policy changes.

Trusted certification authorities
---------------------------------

The verifier reads trusted authorities from::

   /etc/opensips/stir-shaken/ca-list.pem

If the STI authority is not in the system CA bundle, append the CA chain
supplied by the authority::

   sudo sh -c 'cat /root/stir/sti-ca-chain.pem >> \
     /etc/opensips/stir-shaken/ca-list.pem'
   sudo chown opensips:opensips \
     /etc/opensips/stir-shaken/ca-list.pem
   sudo chmod 0640 /etc/opensips/stir-shaken/ca-list.pem

Reload the trust list::

   sudo opensips-cli -x mi stir_shaken_ca_reload

Some package revisions expose the newer MI command name::

   sudo opensips-cli -x mi stir_shaken:ca_reload

Validate and restart OpenSIPS
-----------------------------

Validate the configuration before restarting::

   sudo /sbin/opensips -C /etc/opensips/opensips.cfg

Then restart and inspect the service::

   sudo systemctl restart opensips
   sudo systemctl status opensips --no-pager
   sudo opensips-cli -x mi which | grep -i stir

Test calls
----------

Place an outbound call and inspect the relayed INVITE with ``sudo sngrep``.
An authenticated call should include headers similar to::

   Date: ...
   Identity: ...;info=<https://.../certificate.pem>;alg=ES256;ppt=shaken
   P-CallerID: display-name|number

Dispatcher selection and the chosen master or slave remain unchanged.

For an inbound call containing ``Identity``, the proxy adds one of these
internal status headers::

   P-STIR-Verification: passed;attest=A
   P-STIR-Verification: failed;reason=verification-failed

Inspect STIR/SHAKEN log events with::

   sudo grep '|STIR|' /var/log/opensips.log

Typical success messages contain::

   STIR|signed caller=... destination=... attest=A
   STIR|verified caller=... destination=... attest=A

Certificate renewal
-------------------

Before expiration:

#. Publish the new certificate at the ``x5u`` URL.
#. Install the new certificate and private key on the proxy.
#. Update ``certificate``, ``private_key``, and, if needed, ``x5u`` in the
   database.
#. Validate an outbound call.
#. Keep the old certificate available long enough for in-progress calls and
   remote verifier caches.

Plan rotation before expiration because remote verifiers may cache the old
certificate served by an existing ``x5u`` URL.

Troubleshooting
---------------

No Identity header on outbound calls
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Check the active values::

   SELECT sign_enabled, attestation, x5u,
          LENGTH(certificate), LENGTH(private_key)
   FROM stir_shaken_config
   WHERE id = 1;

The originating and destination identities must also be valid telephone
numbers. The module does not sign identities it cannot parse as telephone
numbers.

``certificate-unavailable``
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Test the URL from the proxy::

   curl --fail --verbose \
     https://certificates.example.com/stir/certificate.pem

Check DNS, firewall rules, TLS validation, HTTP 200, and response size.

Date or freshness failure
~~~~~~~~~~~~~~~~~~~~~~~~~

Check and enable time synchronization::

   timedatectl status
   sudo timedatectl set-ntp true

Untrusted certificate
~~~~~~~~~~~~~~~~~~~~~

Ensure the STI authority chain is present in ``ca-list.pem`` and reload the
CA list. Do not disable TLS peer or hostname verification to bypass the error.

MySQL ``LOAD_FILE`` returns NULL
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Inspect the server restriction::

   SHOW VARIABLES LIKE 'secure_file_priv';

Also verify that the ``mysql`` process can traverse the directory and read the
files temporarily. Restore ownership to ``opensips:opensips`` and mode
``0640`` after loading them.

Security checklist
------------------

* Never publish, transmit in SIP, or log the private key.
* Restrict database access to ``stir_shaken_config``.
* Accept only HTTPS ``x5u`` URLs.
* Keep TLS peer and hostname validation enabled.
* Use attestation ``A`` only after Caller ID authorization.
* Start with ``verify_reject=0`` and monitor providers before blocking calls.
* Rotate the STI certificate before expiration.

References
----------

* `OpenSIPS 3.6 STIR/SHAKEN module
  <https://docs.opensips.org/manual/3-6/modules/stir_shaken/>`_
* `OpenSIPS 3.6 REST client module
  <https://docs.opensips.org/modules/3-6/rest_client/>`_
* `RFC 8224 <https://www.rfc-editor.org/rfc/rfc8224>`_
* `RFC 8588 <https://www.rfc-editor.org/rfc/rfc8588>`_
