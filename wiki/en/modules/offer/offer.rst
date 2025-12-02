
.. _offer-label:

Name
----

| Free package name




.. _offer-packagetype:

Package type
------------

| Type of package, there's 3 types. Unlimited calls, free calls or free seconds. 




.. _offer-freetimetocall:

Free time to call
-----------------

| In this field is where the package avaible quantity configuration will occur.
| Example:
| * Unlimited calls: In this option the field is blank, because will be allowed to call without any control.
| * Free calls: Configure the amount of free calls that you want to give.
| * Free seconds: Configure the amount of seconds that you want to allow the client to call.




.. _offer-billingtype:

Billing type
------------

| This is the period that the package will be calculated.
|  Look the description:
| * Monthly: The system will verify the day of the plan activation + 30 days that the client reached the package limit.
| * Weekly: The system will verify the day of the plan activation + 7 days that the client reached the package limit.




.. _offer-price:

Price
-----

| Price that will be charged monthly to the client.
| If on the expiry day the client don't have the sufficient funds to pay the package MagnusBilling will automatically cancel the package.
|     
| In the settings menu, ajusts, exist one option named Package Offer Notification, this value means how many days are left until the expiration of the package, the system will try to charge the subscription, if the client don't have the balance, MagnusBilling will send an email to the client informing the lack of funds.
| 
| The email can be edited in the menu, Email models , type, plan_unpaid, Expiry of Monthly Plan Notice subject.
| 
| To send emails it's necessary the configuration of SMTP in the SMTP menu.
| 
| To learn how free packages works: https://wiki.magnusbilling.org/en/source/offer.html.




.. _offer-initblock:

Initial block
-------------

| Minimum time in seconds to sell. This value will subscribe the tariffs of the client's plan.




.. _offer-billingblock:

Billing block
-------------

| This defines how the time is incremented after the minimum. This value will subscribe the tariffs of the client's plan.




.. _offer-minimal-time-charge:

Minimum time to charge
----------------------

| Minimun time to tariff. If it's set to 3, will only tariff calls when the time is equal or more than 3 seconds.



