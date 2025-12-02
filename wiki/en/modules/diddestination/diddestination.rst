
.. _diddestination-id-did:

DID
---

| Select the DID that you want create new destination for.




.. _diddestination-id-user:

Username
--------

| User that will be the owner of this DID.




.. _diddestination-activated:

Status
------

| Only active destinations will be used.




.. _diddestination-priority:

Priority
--------

| You can create up to 5 destinations for your DID. If a try is made and a error is received, MagnusBilling will try to send the call to the next destination priority available. Only works with the "SIP call" type.




.. _diddestination-voip-call:

Type
----

| Type of destination.




.. _diddestination-destination:

Destination
-----------

| Set here the destination!




.. _diddestination-id-ivr:

IVR
---

| Select a IVR to send the call to. The IVR needs to belong to the owner of the DID aswell.




.. _diddestination-id-queue:

Queue
-----

| Select a Queue  to send the call to. The Queue needs to belong to the owner of the DID aswell.




.. _diddestination-id-sip:

Sip user
--------

| Select a SIP user to send the call to. The SIP user needs to belong to the owner of the DID aswell.




.. _diddestination-context:

Context
-------

| In this field you may use a context in the format supported by Asterisk
| Example:
|     
| _X. => 1,Dial(SIP/sipaccount,45)
| same => n,Goto(s-\${DIALSTATUS},1)
| 
| 
| exten => s-NOANSWER,1,Hangup
| exten => s-CONGESTION,1,Congestion
| exten => s-CANCEL,1,Hangup
| exten => s-BUSY,1,Busy
| exten => s-CHANUNAVAIL,1,SetCallerId(4545454545)
| exten => s-CHANUNAVAIL,2,Dial(SIP/sipaccount2,,T)
| 
| 
| You should NOT set a name for the context because the name will be set automatically as [did-number-of-the-did]
| 
| You may take a look at the context at /etc/asterisk/extensions_magnus_did.conf
|     
|     



