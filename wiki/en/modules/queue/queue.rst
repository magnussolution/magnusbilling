
.. _queue-id-user:

Username
--------

| User that owns the queue. 




.. _queue-name:

Name
----

| Queue name.




.. _queue-language:

Language
--------

| Queue language.




.. _queue-strategy:

Strategy
--------

| Queue strategy.




.. _queue-ringinuse:

Ringinuse
---------

| Call or not the agents of the queue that are in call.




.. _queue-timeout:

Ring for
--------

| How long the phone will ring until timeout




.. _queue-retry:

Time for another agent
----------------------

| The amount of time in seconds that will retry the call.




.. _queue-wrapuptime:

Time for another call
---------------------

| Time in seconds until the agent can receive another call.




.. _queue-weight:

Weight
------

| Queue Priority.




.. _queue-periodic-announce:

Periodic announce
-----------------

| A set of periodic announcements can be created by separating each announcements to reproduce whit commas. E.g.: queue-periodic-announce,your-call-is-important,please-wait. This data need to be in /var/lib/asterisk/sounds/ directory.




.. _queue-periodic-announce-frequency:

Frequency
---------

| How often to make a periodic announcement.




.. _queue-announce-position:

Announce position
-----------------

| Informs the postition in the queue.




.. _queue-announce-holdtime:

Announce holdtime
-----------------

| Should we include an estimated hold time in the position announcements?




.. _queue-announce-frequency:

Announce frequency
------------------

| How often to announce queue position and/or estimated holdtime to caller 0=off




.. _queue-joinempty:

Join empty
----------

| Allow calls when theres no one to answer the call.




.. _queue-leavewhenempty:

Leave when empty
----------------

| Hang the calls in queue when there's no one to answer.




.. _queue-max-wait-time:

Max wait time
-------------

| Maximum wait time on the queue




.. _queue-max-wait-time-action:

Max wait time action
--------------------

| SipAccount, IVR, QUEUE or LOCAL channel to send the caller if the maximum wait time is reached. Use: SIP/sip_account, QUEUE/queue_name, IVR/ivr_name OR LOCAL/extension@context.




.. _queue-ring-or-moh:

Ring or playing MOH
-------------------

| Play waiting music or tone when the client is in the queue.




.. _queue-musiconhold:

Audio musiconhold
-----------------

| Import one waiting music to this queue.



