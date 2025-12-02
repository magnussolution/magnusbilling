
.. _did-did:

DID
---

| The exact number coming from the context in Asterisk. We recommend you to always use the E164 format. Also you can create intervals. Example 13605040001-13605040009. In this example will be created the DIDs 13605040001 until  13605040009.




.. _did-record-call:

Record call
-----------

| Record calls for this DID. Recorded regardless of destination.




.. _did-activated:

Status
------

| Only active numbers can receive calls.




.. _did-callerid:

Callerid name
-------------

| Use this field to set a CallerID name or leave it blank to use the received CallerID from the DID provider.




.. _did-connection-charge:

Setup price
-----------

| Activation cost. This value will be deducted from the client the moment that the DID is associated with the user.




.. _did-fixrate:

Monthly price
-------------

| Monthly price. This value will be deducted automatically every month from the user's balance. If the client doesn't have enough credit the DID will be cancelled automatically.




.. _did-connection-sell:

Connection charge
-----------------

| This is the value that will be charged for each call. Simply by picking up the call, this value will be deducted.




.. _did-minimal-time-buy:

Minimum time to charge
----------------------

| We did not write the description to this field.




.. _did-buyrateinitblock:

Buy price initblock
-------------------

| We did not write the description to this field.




.. _did-buyrateincrement:

Buy price increment
-------------------

| We did not write the description to this field.




.. _did-minimal-time-charge:

Minimum time to charge
----------------------

| Minimum time to tariff the DID. If you set it to 3 any call that with lower duration will not be charged for.




.. _did-initblock:

Initial block
-------------

| Minimum time in seconds to buy. If you set it to 30 and the call duration is 10, the call will be billed as 30.




.. _did-increment:

Billing block
-------------

| This defines the block in which the call billing time will be incremented, in seconds. If set to 6 and call duration is 32, the call will be billed as 36.




.. _did-charge-of:

Charge who
----------

| The user that will be charged for the DID cost.




.. _did-calllimit:

Channel limit
-------------

| Maximum simultaneous calls for this DID.




.. _did-description:

Description
-----------

| Set here the destination!




.. _did-expression-1:

Regular expression
------------------

| This is a regular expression to tariff the DID depending on who is calling it.
| Lets analyze a real example:
|     Suppose we want to charge 0.10 when we receive a call from a landline and 0.20 if its a mobile phone and block any other format.
|     In this example we will create rules to identify the CallerID in the format 0 + area code + number, area code + number, or 55 + area code + number.
| 
|     Take a look at the following image on what the result would look like:
|     
|     .. image:: ../img/did_regex.png
   :scale: 100% 
| 
| 
|     Regular expression for mobile
|     ^[1-9][0-9]9\\d{8}$|^0[1-9][0-9]9\\d{8}$|^55[1-9][0-9]9\\d{8}$
| 
|     Regular expression for landline
|     ^[1-9][0-9]\\d{8}$|^0[1-9][0-9]\\d{8}$|^55[1-9][0-9]\\d{8}$
| 
| 
|     




.. _did-buy-rate-1:

Buy price per min
-----------------

| We did not write the description to this field.




.. _did-selling-rate-1:

Sell price per min
------------------

| Price per minute if the number matches the above regular expression.




.. _did-block-expression-1:

Block calls from this expression
--------------------------------

| Set to yes to block calls that matches with the above regular expression.




.. _did-send-to-callback-1:

Send the call to callback
-------------------------

| Send this call to CallBack if it matches with the above regular expression.




.. _did-expression-2:

Regular expression
------------------

| Same as the first expression. You can see more details at the link `https://wiki.magnusbilling.org/en/source/modules/did/did.html#did-expression-1.  <https://wiki.magnusbilling.org/en/source/modules/did/did.html#did-expression-1.>`_.




.. _did-buy-rate-2:

Buy price per min
-----------------

| We did not write the description to this field.




.. _did-selling-rate-2:

Sell price per min
------------------

| Price per minute if the number matches the above regular expression.




.. _did-block-expression-2:

Block calls from this expression
--------------------------------

| Set to yes to block calls that matches with the above regular expression.




.. _did-send-to-callback-2:

Send the call to callback
-------------------------

| Send this call to CallBack if it matches with the above regular expression.




.. _did-expression-3:

Regular expression
------------------

| Same as the first expression. You can see more details at the link `https://wiki.magnusbilling.org/en/source/modules/did/did.html#did-expression-1.  <https://wiki.magnusbilling.org/en/source/modules/did/did.html#did-expression-1.>`_.




.. _did-buy-rate-3:

Buy price per min
-----------------

| We did not write the description to this field.




.. _did-selling-rate-3:

Sell price per min
------------------

| Price per minute if the number matches the above regular expression.




.. _did-block-expression-3:

Block calls from this expression
--------------------------------

| Set to yes to block calls that matches with the above regular expression.




.. _did-send-to-callback-3:

Send the call to callback
-------------------------

| Send this call to CallBack if it matches with the above regular expression.




.. _did-cbr:

CallBack pro
------------

| Enables CallBack Pro.




.. _did-cbr-ua:

Use audio
---------

| Execute an audio.




.. _did-cbr-total-try:

Maximum trying
--------------

| How many times will the system try to return the call?




.. _did-cbr-time-try:

Interval between trying
-----------------------

| Time interval between each try, in minutes.




.. _did-cbr-em:

Early media
-----------

| Execute an audio before the call is answered. Your DID provider needs to allow early media.




.. _did-TimeOfDay-monFri:

Mon-Fri
-------

| Example: if your company only callbacks to the callee if the call was placed in between 09:00-12:00 and 14:00-18:00 MON-FRY, between this time interval the workaudio is going to be played and then callback to the callee. You can use multiple time intervals separated by |.




.. _did-TimeOfDay-sat:

Sat
---

| The same but for Saturday.




.. _did-TimeOfDay-sun:

Sun
---

| The same but for Sunday.




.. _did-workaudio:

Work audio
----------

| Audio that will be executed when a call is received at the time interval.




.. _did-noworkaudio:

Out work audio
--------------

| Audio that will be executed when a call is received out of the time interval.




.. _did-country:

Country
-------

| We did not write the description to this field.




.. _did-id-server:

Server
------

| We did not write the description to this field.



