Secure ATA provisioning
=======================

MagnusBilling ATA profiles contain SIP, web-administration, and user
credentials. A MAC address identifies an ATA but does not authenticate it.
For this reason, MagnusBilling 8 database version 8.0.0.8 no longer serves a
profile from the old ``?mac=$MAC`` URL.

Every ATA now requires a separate random provisioning token. MagnusBilling
stores only its SHA-256 hash. The clear token appears only in the provisioning
URL immediately after it is created or rotated.

Create or rotate a token
------------------------

1. Open **Clients > ATA Linksys** and select exactly one ATA.
2. Select **Rotate provisioning token** and confirm the operation.
3. Copy the complete URL from the one-time dialog. It has this format::

      https://billing.example.com/mbilling/index.php/ata?mac=AABBCCDDEEFF&token=64-lowercase-hexadecimal-characters

4. In the Linksys/Cisco ATA web interface, open **Provisioning** and replace
   **Profile Rule** with that complete URL.
5. Save and resync the ATA. Confirm that it downloads its profile through
   HTTPS.

The global **Server IP** setting must contain the public hostname (and an
optional port) used by the ATA. Token rotation fails closed if this setting is
empty or is not a valid host.

The token cannot be recovered from MagnusBilling. Rotating it immediately
invalidates the previous URL. If the one-time dialog is closed before the URL
is copied, rotate the token again.

Upgrade impact for existing ATAs
--------------------------------

The 8.0.0.8 database migration deliberately leaves existing token hashes
empty. Existing ATAs keep their last applied SIP configuration, but the old
MAC-only URL can no longer download a new profile. Each ATA must be migrated
manually using the rotation procedure above.

Plan a maintenance window and migrate devices in controlled batches:

1. Update MagnusBilling and verify that the database version is 8.0.0.8 or
   newer.
2. Rotate the token for one ATA.
3. Update its Profile Rule, resync it, and place a test call.
4. Continue with the next ATA only after the previous device is verified.

Do not temporarily restore MAC-only provisioning. It exposes every credential
in the profile to anyone who can guess or obtain the MAC address.

Operational security
--------------------

* Serve both the administration panel and ``/mbilling/index.php/ata`` only
  through HTTPS with a valid certificate. Token rotation and provisioning are
  rejected over HTTP, and the generated Profile Rule always uses HTTPS.
* Treat the complete URL as a password. Do not send it through tickets, chat,
  email, or screenshots unless those systems are approved for secrets.
* HTTP access logs commonly record query strings. Configure the reverse proxy
  and web server to redact the ``token`` parameter or to omit query strings
  from logs for the ATA route. Restrict and rotate existing logs that may
  contain provisioning URLs.
* Rotate the token after personnel changes, suspected disclosure, device
  replacement, or accidental logging.
* A generic HTTP 404 response is expected for HTTP requests and for missing,
  malformed, unknown, or expired credentials. This avoids sending credentials
  without TLS and avoids revealing whether a MAC address exists.

Emergency rollback
------------------

If a migrated ATA fails, restore its configuration locally on that device or
rotate a new token and apply the new URL. Do not roll back to the legacy
MAC-only endpoint. Database backups do not contain the clear token and cannot
recover a lost provisioning URL.
