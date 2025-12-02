
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

| You need install appropriate drive to use card like dgv extra Dongle.




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




.. _trunk-fromuser:

Fromuser
--------

| Several providers demand this option to authenticate, primarly when it's authenticated via user and paswword. Let it blank to send the CallerID of the SIP user of From.




.. _trunk-fromdomain:

Fromdomain
----------

| Defines the FROM domain: in the SIP messages when act like a UAC SIP (client).




.. _trunk-language:

Language
--------

| Default launguage used in any Playback()/Background().




.. _trunk-context:

Context
-------

| Only change this if you know what you are doing.




.. _trunk-dtmfmode:

Dtmfmode
--------

| DMTF type. You can see more details at the link `https://www.voip-info.org/asterisk-dtmf/.  <https://www.voip-info.org/asterisk-dtmf/.>`_.




.. _trunk-insecure:

Insecure
--------

| Insecure. You can see more details at the link `https://www.voip-info.org/asterisk-sip-insecure/.  <https://www.voip-info.org/asterisk-sip-insecure/.>`_.




.. _trunk-maxuse:

Max use
-------

| Maximum simultaneous calls for this trunk.




.. _trunk-nat:

NAT
---

| Is the trunk behind NAT. You can see more details at the link `https://www.voip-info.org/asterisk-sip-nat/.  <https://www.voip-info.org/asterisk-sip-nat/.>`_.




.. _trunk-directmedia:

Directmedia
-----------

| If activated, Asterisk will try to send the RTP media directly between your client and provider. It's necessary to active on the trunk as well. You can see more details at the link `https://www.voip-info.org/asterisk-sip-canreinvite/.  <https://www.voip-info.org/asterisk-sip-canreinvite/.>`_.




.. _trunk-qualify:

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
| This status can be verified with the funcion "sip show peer XXXX", this funcion will only provide informations of status for the SIP peer that possess "qualify = yes.




.. _trunk-type:

Type
----

| Default type is "friend", in other words they can make and receive calls. You can see more details at the link `https://www.voip-info.org/asterisk-sip-type/.  <https://www.voip-info.org/asterisk-sip-type/.>`_.




.. _trunk-disallow:

Disallow
--------

| In this option is possible to deactivate codecs. Use "Use all" to deactive all codects and make it avaible to the user only what you selected below.




.. _trunk-sendrpid:

Sendrpid
--------

| Defines if one Remote-Party-ID SIP header task to be send.
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




.. _trunk-cnl:

Enable CNL
----------

| We did not write the description to this field.



