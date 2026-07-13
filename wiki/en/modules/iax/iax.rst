
.. _iax-id-user:

Username
--------

| The user whose IAX account will belong




.. _iax-username:

IAX user
--------

| The user that will be used to authenticate in the softphone




.. _iax-secret:

IAX password
------------

| The Password that will be used to authenticate in the softphone




.. _iax-callerid:

CallerID
--------

| This is the CallerID that will be shown in their destination, in external calls the provider will need to permit CLI to be correctly identified in their destination.




.. _iax-disallow:

Disallow
--------

| In this option will be possible to deactivate codecs. To deactivate all the codecs and letting available to the user only what you select below, use "Use all"




.. _iax-allow:

Codec
-----

| Codecs that will be accepted.




.. _iax-host:

Host
----

| "Dynamic" allows the user to register this account from any IP address. To authenticate by IP, enter the client IP here, leave the password blank, and set insecure to port/invite in the Additional Information tab.




.. _iax-nat:

NAT
---

| The client is behind NAT. You can see more details at the link `https://www.voip-info.org/asterisk-sip-nat/.  <https://www.voip-info.org/asterisk-sip-nat/.>`_.




.. _iax-context:

Context
-------

| Asterisk context where calls from this account will be processed. The default is "billing". Change this only if you understand the Asterisk dialplan.




.. _iax-qualify:

Qualify
-------

| Sends SIP OPTIONS packets to verify whether the peer is online.
| Syntax:
|     
| qualify = xxx \| no \| yes
|     
| XXX is the number of milliseconds used as the timeout. If the value is "yes", Asterisk uses the time configured in sip.conf. The common default is 2 seconds.
| 
| When qualify is enabled, Asterisk sends OPTIONS packets regularly to verify whether the device is still online.
| If the device does not answer within the configured time, Asterisk considers the device offline for future calls.
| 
| This status can be verified with the "sip show peer XXXX" command. Asterisk only shows qualify status when the peer has qualify enabled.




.. _iax-dtmfmode:

Dtmfmode
--------

| DTMF mode used by this account. You can see more details at the link `https://www.voip-info.org/asterisk-sip-dtmfmode/.  <https://www.voip-info.org/asterisk-sip-dtmfmode/.>`_.




.. _iax-insecure:

Insecure
--------

| If the host is dynamic, this option must be set to no. For IP authentication, use port. You can see more details at the link `https://www.voip-info.org/asterisk-sip-insecure/.  <https://www.voip-info.org/asterisk-sip-insecure/.>`_.




.. _iax-type:

Type
----

| Default type is "friend", which allows the account to make and receive calls. You can see more details at the link `https://www.voip-info.org/asterisk-sip-type/.  <https://www.voip-info.org/asterisk-sip-type/.>`_.




.. _iax-calllimit:

Call limit
----------

| Total of simultaneous calls allowed for this IAX account.



