Restrict panel login by SSH IP authorization
============================================

MagnusBilling can restrict web-panel login for any user to IP
addresses authorized from an SSH session. The allowlist is stored outside the
web document root and outside MariaDB, under
``/etc/magnusbilling/panel-ip-access``.

Activate the restriction
------------------------

Connect by SSH from the same public IP used by the browser and run::

   addmyip root

The command obtains the client address from the SSH connection itself. It does
not accept an IP supplied on the command line. The first successful execution
creates a user-specific allowlist and activates the restriction for that user.
Existing users remain unrestricted until this command is run for their exact
username.

Any panel username can be used, for example::

   addmyip administrator
   addmyip "support manager"

Each username has an independent allowlist. Usernames are represented by a
SHA-256 identifier in the storage directory so special characters cannot be
interpreted as filesystem paths.

Remove the current IP
---------------------

From the SSH session whose address should be removed, run::

   delmyip root

The restriction remains active even when the last address is removed. In that
case no web-panel IP can log in as that user until ``addmyip USERNAME`` is run
from SSH or all restrictions are released.

Disable all IP restrictions
---------------------------

Run::

   releaseAll

This removes all panel allowlist files and makes every user unrestricted again.
All three commands require ``root`` privileges.

Reverse proxies and VPNs
------------------------

The web login compares Apache's trusted client address (``REMOTE_ADDR``) with
the SSH client address. If a reverse proxy, CDN, NAT gateway, or VPN makes the
two addresses different, configure Apache ``mod_remoteip`` with only the
trusted proxy ranges or connect to SSH through the same egress path. Do not
trust arbitrary ``X-Forwarded-For`` headers.
