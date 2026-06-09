
.. _trunk-id-provider:

Provider
--------

| Provider which the trunk belongs.




.. _trunk-trunkcode:

Name
----

| Trunk name, must be unique.




.. _trunk-user:

Username
--------

| Only used if the authentication is via username and password.




.. _trunk-secret:

Password
--------

| Only used if the authentication is via username and password.




.. _trunk-host:

Host
----

| IP or Trunk domain.




.. _trunk-trunkprefix:

Add prefix
----------

| Add a prefix to send to your trunk.




.. _trunk-removeprefix:

Remove prefix
-------------

| Remove a prefix to send to your trunk.




.. _trunk-allow:

Codec
-----

| Select the codecs that are allowed in this trunk.




.. _trunk-providertech:

Provider tech
-------------

| You need install appropriate driver to use card like DGV extra Dongle.




.. _trunk-status:

Status
------

| If the trunk is inactive, Magnusbilling will sent the call to the backup trunk.




.. _trunk-allow-error:

Go to backup if 404
-------------------

| Send call to the next trunk if receive error 404.




.. _trunk-register:

Register trunk
--------------

| Only active this if the trunk is authenticated via username and password.




.. _trunk-register-string:

Register string
---------------

| <user>:<password>@<host>/contact.
| "user" is the user ID for this SIP server (ex 2345).
| "password" is the user password
| "host" is the SIP server domain or host name.
| "port" send an solicitation of the register to this host port. Standard for 5060
| "contact" is the extension of Asterisk contact. Example 1234 is set in the contact header of the SIP register message. The contact ramal is used by the SIP server remotely when it's needed to send one call to Asterisk.
|     




.. _trunk-cnl:

Enable CNL
----------

| Enable CNL lookup on this trunk to apply Brazilian numbering and routing information.




.. _trunk-fromuser:

Fromuser
--------

| Some providers require this value for authentication, especially when the trunk authenticates by username and password. Leave it blank to send the SIP user's CallerID in the From header.




.. _trunk-fromdomain:

Fromdomain
----------

| Domain used in the From header of SIP messages when MagnusBilling acts as a SIP UAC client.




.. _trunk-block-cid:

Block CID REGEX
---------------

| Regular expression used to block calls by CallerID before sending them through this trunk.




.. _trunk-context:

Context
-------

| Only change this if you know what you are doing.




.. _trunk-dtmfmode:

Dtmfmode
--------

| DTMF mode used by this trunk. You can see more details at the link `https://www.voip-info.org/asterisk-dtmf/.  <https://www.voip-info.org/asterisk-dtmf/.>`_.




.. _trunk-insecure:

Insecure
--------

| Asterisk insecure option used for this trunk. You can see more details at the link `https://www.voip-info.org/asterisk-sip-insecure/.  <https://www.voip-info.org/asterisk-sip-insecure/.>`_.




.. _trunk-maxuse:

Max use
-------

| Maximum simultaneous calls for this trunk.




.. _trunk-nat:

NAT
---

| NAT setting used by this trunk. You can see more details at the link `https://www.voip-info.org/asterisk-sip-nat/.  <https://www.voip-info.org/asterisk-sip-nat/.>`_.




.. _trunk-directmedia:

Directmedia
-----------

| If enabled, Asterisk tries to send RTP media directly between the client and the provider. Direct media must also be supported by the trunk. You can see more details at the link `https://www.voip-info.org/asterisk-sip-canreinvite/.  <https://www.voip-info.org/asterisk-sip-canreinvite/.>`_.




.. _trunk-qualify:

Qualify
-------

| Sends SIP OPTIONS packets to verify whether the trunk is online.
| Syntax:
|     
| qualify = xxx \| no \| yes
|             
| XXX is the number of milliseconds used as the timeout. If the value is "yes", Asterisk uses the time configured in sip.conf. The common default is 2 seconds.
|         
| When qualify is enabled, Asterisk sends OPTIONS packets regularly to verify whether the trunk is still online.
| If the trunk does not answer within the configured time, Asterisk considers it offline for future calls.
|         
| This status can be verified with the "sip show peer XXXX" command. Asterisk only shows qualify status when the peer has qualify enabled.




.. _trunk-type:

Type
----

| Default type is "friend", which allows the trunk to make and receive calls. You can see more details at the link `https://www.voip-info.org/asterisk-sip-type/.  <https://www.voip-info.org/asterisk-sip-type/.>`_.




.. _trunk-disallow:

Disallow
--------

| Codecs disabled for this trunk. Use "all" to disable all codecs, then enable only the codecs selected in the Allow field.




.. _trunk-sendrpid:

Sendrpid
--------

| Defines whether MagnusBilling sends the Remote-Party-ID SIP header.
| The default is "no".
|     
| This field is frequently used by VoIP wholesalers providers to supply the callers identity, independently of the privacy settings (From SIP header).    




.. _trunk-addparameter:

Addparameter
------------

| These parameters will be added in the final AGI command - Dial command, where is in the ajust settings menu.
| By default the DIAL command is:
| ,60,L(%timeout%:61000:30000) 
| 
| Let's say that you wanted to add an MACRO in the trunk, therefore in this field you will add the parameter, set it up M(macro_name) and create your MACRO in the Asterisk extensions.
|     




.. _trunk-port:

Port
----

| If you want to use a different port than 5060, you will need open the IPTABLES port.




.. _trunk-link-sms:

Link SMS
--------

| URL to send SMS. Replace the number variable to %number% and text per %text%. EXAMPLE. Your SMS URL is http://trunkWebSite.com/sendsms.php?user=magnus&pass=billing&number=XXXXXX&sms_text=SSSSSSSSSSS. replace XXXXXX per %number and SSSSSSSSSSS per %text% 




.. _trunk-sms-res:

SMS match result
----------------

| Leave it blank to not wait the provider answer. Or write the text that needs to consist in the providers answer to be considered SENT.




.. _trunk-sip-config:

Parameters
----------

| Valid format of Asterisk sip.conf, one option per line.
| Example, let's say that you need to put the useragent parameter, so put it in this field:
|     
| useragent=my agent
| 
| .




.. _trunk-cid-add:

CID Add prefix
--------------

| Prefix added to the CallerID before the call is sent to this trunk.




.. _trunk-cid-remove:

CID Remove prefix
-----------------

| Prefix removed from the CallerID before the call is sent to this trunk.



