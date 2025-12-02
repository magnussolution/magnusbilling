
.. _sip-id-user:

Username
--------

| User that this SIP user is associated with.




.. _sip-defaultuser:

SIP user
--------

| Username used to login in a Softphone or any SIP device.




.. _sip-secret:

SIP password
------------

| Password to login in a Softphone or any SIP device.




.. _sip-callerid:

CallerID
--------

| The Caller ID number that will be shown in their destination. Your trunk needs to accept CLI.




.. _sip-alias:

Alias
-----

| Alias to dial between sip accounts from the same AccountCode (company).




.. _sip-disallow:

Disallow
--------

| Disallow all codecs and then select the codecs available below to enable them to the user.




.. _sip-allow:

Codec
-----

| Select the codecs that the trunk will accept.




.. _sip-host:

Host
----

| Dynamic is an option that allows the user to register their account under any IP. If you want to authenticate the user via IP, put the client IP here, let the password field blank and set it to "insecure" to por/invite in the Aditional Informations tab.




.. _sip-sip-group:

Group
-----

| When sending an call from DID, or campaign to a group, will be called all SIP users that are in the group. You can create the groups with any name.
| 
| 
| Is used as well to capture calls with *8, need to configurate the option "pickupexten = *8" in the file "feature.comf".
| 




.. _sip-videosupport:

Videosupport
------------

| Activate video calls.




.. _sip-block-call-reg:

Block call regex
----------------

| Block calls using REGEX. To block calls from cellphones, just put it ^55\\d\\d9. You can see more details at the link `https://regex101.com.  <https://regex101.com.>`_.




.. _sip-record-call:

Record call
-----------

| Record calls of this SIP user.




.. _sip-techprefix:

Tech prefix
-----------

| Useful option for when it's necessary to authenticate more than one client via IP that uses the same IP. Common in BBX multi tenant.




.. _sip-description:

Description
-----------

| We did not write the description to this field.




.. _sip-nat:

NAT
---

| Nat. You can see more details at the link `https://www.voip-info.org/asterisk-sip-nat/  <https://www.voip-info.org/asterisk-sip-nat/>`_.




.. _sip-directmedia:

Directmedia
-----------

| If enabled, Asterisk tries to redirect the RTP media stream to go directly from the caller to the callee.




.. _sip-qualify:

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




.. _sip-id-trunk-group:

Trunk groups
------------

| :::::::WARNING::::::. By selecting a trunk group here, the trunk group will be ignored from tariffs and this trunk group will always be used. Only select a trunk group here if you really want all calls from this SIP user to be sent to this trunk group




.. _sip-context:

Context
-------

| This is the context that the call will be processed, "billing" is the standard option. Only change configuration if you have knowledge of Asterisk.




.. _sip-dtmfmode:

Dtmfmode
--------

| DTMF type. You can see more details at the link `https://www.voip-info.org/asterisk-sip-dtmfmode/.  <https://www.voip-info.org/asterisk-sip-dtmfmode/.>`_.




.. _sip-insecure:

Insecure
--------

| This option need to be "NO" if the host is dynamic, so the IP authentication changes to port,invite.




.. _sip-deny:

Deny
----

| You can limit SIP traffic of a determined IP or network.




.. _sip-permit:

Permit
------

| You can allow SIP traffic of a determined IP or network.




.. _sip-type:

Type
----

| Standard type is "friend", in other words, can make and receive calls. You can see more details at the link `https://www.voip-info.org/asterisk-sip-type/.  <https://www.voip-info.org/asterisk-sip-type/.>`_.




.. _sip-allowtransfer:

Allowtransfer
-------------

| Enable this VOIP account to do tranference. The code to transfer is *2 + ramal. It's necessary to activa the option atxfer => *2 in the file "features.conf" of Asterisk.




.. _sip-ringfalse:

Ring false
----------

| Activate false ring. Add rR of the "Dial" command.




.. _sip-calllimit:

Call limit
----------

| Maximum simultaneous calls allowed for this SIP user.




.. _sip-mohsuggest:

MOH
---

| Waiting music for this SIP user.




.. _sip-url-events:

URL events notify
-----------------

| .




.. _sip-addparameter:

Addparameter
------------

| The parameters set in here will replace the system default parameters, as well of the trunks, if there's any.




.. _sip-amd:

AMD
---

| .




.. _sip-type-forward:

Forward type
------------

| Resend destination type. This resend will not work in queues.




.. _sip-id-ivr:

IVR
---

| Select the IVR that you want to to send to calls if the SIP user don't answer.




.. _sip-id-queue:

Queue
-----

| Select the queue that you want to to send to calls if the SIP user don't answer.




.. _sip-id-sip:

Sip user
--------

| Select the SIP users that you want to to send to calls if the SIP user don't answer.




.. _sip-extension:

Destination
-----------

| Click for more details
| We have 3 options, conform the selected type, group, number or custom.
| 
| * Group, the group name set here, needs to be exatcly the same group of SIP users that wants to receive the calls, is going to call all SIP users in the group.
| * Custom, it's possible to execute any valid option of the DIAL command of Asterisk, example: SIP/contaSIP,45,tTr
| * Number, can be a landline number or mobile number, needs to be in the 55 DDD format




.. _sip-dial-timeout:

Dial timeout
------------

| Timeout in seconds to wait for the call to be picked-up. After the timeout will be execute the channeling if it's configurated.




.. _sip-voicemail:

Enable voicemail
----------------

| Activate voicemail. It's necessary the configuration of SMTP in Linux to receive the email with the message. You can see more details at the link `https://www.magnusbilling.org/br/blog-br/9-novidades/25-configurar-ssmtp-para-enviar-voicemail-no-asterisk.html.  <https://www.magnusbilling.org/br/blog-br/9-novidades/25-configurar-ssmtp-para-enviar-voicemail-no-asterisk.html.>`_.




.. _sip-voicemail-email:

Email
-----

| Email that will be send the email with the voicemail.




.. _sip-voicemail-password:

Password
--------

| Voicemail password. It's possible to enter in the Voicemail typing *111




.. _sip-sip-config:

Parameters
----------

| We did not write the description to this field.




.. _sip-sipshowpeer:

Peer
----

| sip show peer




.. _sip-cnl:

CNL zone
--------

| We did not write the description to this field.



