
.. _campaign-id-user:

Username
--------

| User that owns the campaign.




.. _campaign-id-plan:

Plan
----

| What plan do you want to use to bill this campaign?




.. _campaign-name:

Name
----

| Name of the campaign.




.. _campaign-callerid:

CallerID
--------

| We did not write the description to this field.




.. _campaign-status:

Status
------

| Status of the campaign.




.. _campaign-startingdate:

Starting date
-------------

| The campaign will start from this date.




.. _campaign-expirationdate:

Expiration date
---------------

| The campaign will stop in this date.




.. _campaign-type:

Type
----

| Choose Voice or SMS. If you choose Voice you will need to import audio. If you choose SMS you will need to set the text in the SMS tab.




.. _campaign-audio:

Audio
-----

| Available to massive calling. The audio needs to be compatible with Asterisk. The recomended format is GSM or WAV(8k hz mono).




.. _campaign-audio-2:

Audio 2
-------

| If you use TTS, the name will be executed between Audio and Audio2.




.. _campaign-restrict-phone:

Restrict phone
--------------

| Activating this option, MagnusBilling will check if the number that will be sent the call is registered in the Restrict Phone menu, if it has, the system will change the status of the number to blocked and will not send the call.




.. _campaign-auto-reprocess:

Auto reprocess
--------------

| If there are no active numbers in this campaign phone book, reactivates all pending numbers.




.. _campaign-id-phonebook:




| Select one or more phonebooks to to be used.




.. _campaign-digit-authorize:

Number to forward
-----------------

| Do you want to forward the call after the audio?  E.g, if the callee presses 1, he gets sent to SIP user XXXX. Set Number to Forward = 1, Forward Type = SIP and select the SIP user to send the callee to. Set -1 to disable.




.. _campaign-type-0:

Forward type
------------

| Choose the type of redirect. This will send the call to the chosen destination.




.. _campaign-id-ivr-0:

IVR
---

| Choose a IVR to send the call to. The IVR needs to belong to the owner of the campaign.




.. _campaign-id-queue-0:

Queue
-----

| Choose a Queue to send the call to. The Queue needs to belong to the owner of the campaign.




.. _campaign-id-sip-0:

Sip user
--------

| Choose a SIP user to send the call to. The SIP user needs to belong to the owner of the campaign.




.. _campaign-extension-0:

Destination
-----------

| Click for more details
| There are two options available.
|     *Group, the group name should be put here exactly as it is in the SIP users that should receive the calls.
|     *Personalized, you may execute any valid option via Asterisk's DIAL command. Example: SIP/sipaccount,45,tTr.




.. _campaign-record-call:

Record call
-----------

| Record the calls of the campaign. They only will be recorded if the call is transferred.




.. _campaign-daily-start-time:

Daily start time
----------------

| Time that the campaign will start sending.




.. _campaign-daily-stop-time:

Daily stop time
---------------

| Time that the campaign will stop sending.




.. _campaign-monday:

Monday
------

| Activating this option the system will send calls on Mondays.




.. _campaign-tuesday:

Tuesday
-------

| Activating this option the system will send calls on Tuesdays.




.. _campaign-wednesday:

Wednesday
---------

| Activating this option the system will send calls on Wednesdays.




.. _campaign-thursday:

Thursday
--------

| Activating this option the system will send calls on Thursdays.




.. _campaign-friday:

Friday
------

| Activating this option the system will send calls on Fridays.




.. _campaign-saturday:

Saturday
--------

| Activating this option the system will send calls on Saturdays.




.. _campaign-sunday:

Sunday
------

| Activating this option the system will send calls on Sundays.




.. _campaign-frequency:

Call limit
----------

| How many numbers will be processed per minute?
| This value will be divided by 60 seconds and the calls will be sent every minute at the same time.




.. _campaign-max-frequency:

Maximum call limit
------------------

| This is the maximum value that the client will be able to set. If you set it to 50 the user will be able to change to any value that is 50 or less than 50.




.. _campaign-nb-callmade:

Audio duration
--------------

| Used to control the max completed calls.




.. _campaign-enable-max-call:

Toggle max completed calls
--------------------------

| If activated MagnusBilling will check how many calls were already made and have a duration total bigger than the audios. If the quantity is equal or bigger than the value set in the field, the campaign will be deactivated.




.. _campaign-secondusedreal:

Max completed calls
-------------------

| Maximum amount of complete calls. You need to activate the field above to use this.




.. _campaign-description:

Description or SMS Text
-----------------------

| This field has different uses if the campaign is sending Voice or SMS.
| Uses:
|     * Voice: This field is simply a description of the campaign.
|     * SMS: The text in here is going to be sent to the numbers. You may use the var %name% where you want to use the name of the customer. Example:
|     Hello %name%




.. _campaign-tts-audio:

Audio 1 TTS
-----------

| With this setting the system will generate the audio 1 for the campaign via TTS.
| In order for this to work, you will need to set the TTS URL under Settings, Configuration, TTS URL.




.. _campaign-tts-audio2:

Audio 2 TTS
-----------

| Same setting as the previous field but for audio 2. Keep in mind that in between audio 1 and 2, the TTS executes the name imported with the number.



