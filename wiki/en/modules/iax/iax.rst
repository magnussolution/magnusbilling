
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

| In this option will be possible to deactivate codecs. To deactivate all the codecs and letting avaible to the user only what you select below, use "Use all"




.. _iax-allow:

Codec
-----

| Codecs that will be accepted.




.. _iax-host:

Host
----

| "Dynamic" is an option that will let the user register his account in any IP. If you want to to authenticate the user by their IP, fill here the IP of the client, let the password field blank and put "insecure" for the port/invite in the tab "Additional Information"




.. _iax-nat:

NAT
---

| The client is behind NAT. You can see more details at the link `https://www.voip-info.org/asterisk-sip-nat/.  <https://www.voip-info.org/asterisk-sip-nat/.>`_.




.. _iax-context:

Context
-------

| This is the context that the call will be processed, by default is set to "billing". Only alter if you have knowledge of Asterisk.




.. _iax-qualify:

Qualify
-------

| Sent the "OPTION" package to verify if the user is online.
| Sintax:
|     
| qualify = xxx | no | yes
|     
| Where the XXX is the number of milliseconds used. If "yes", the time configurated in sip.conf is used, 2 seconds is the standard.
| 
| If you activate "qualify", the Asterisk will sent the command "OPTION" to SIP peer regulary to verify if the device is still online.
| If the device don't answer the "OPTION" in the set period of time, Asterisk will consider the device offline for future calls.
| 
| This status can be verified with the function "sip show peer XXXX", this funcition will only provide status informations to the SIP peer that have "qualify = yes".




.. _iax-dtmfmode:

Dtmfmode
--------

| Type of DTMF. You can see more details at the link `https://www.voip-info.org/asterisk-sip-dtmfmode/.  <https://www.voip-info.org/asterisk-sip-dtmfmode/.>`_.




.. _iax-insecure:

Insecure
--------

| If the host is set to "dynamic", this option will need to be set to "no". To authenticate via IP and alter to port. You can see more details at the link `https://www.voip-info.org/asterisk-sip-insecure/.  <https://www.voip-info.org/asterisk-sip-insecure/.>`_.




.. _iax-type:

Type
----

| Default type is "friend", in other words they can make and receive calls. You can see more details at the link `https://www.voip-info.org/asterisk-sip-type/.  <https://www.voip-info.org/asterisk-sip-type/.>`_.




.. _iax-calllimit:

Call limit
----------

| Total of simultaneous calls allowed for this IAX account.



