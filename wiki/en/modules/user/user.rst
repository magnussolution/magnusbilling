
.. _user-username:

Username
--------

| Username used to login into the panel.




.. _user-password:

Password
--------

| Password used to login into the panel.




.. _user-id-group:

Group
-----

| There are 3 groups: admin, agent and client. You can create more or edit any of these groups. Each group can have specific permissions. Check the menu Configuration->User Group.




.. _user-id-group-agent:

Group for agent users
---------------------

| Select the group that the clients of this retailer used.




.. _user-id-plan:

Plan
----

| Plan that will be used to charge the clients.




.. _user-language:

Language
--------

| Language. This languague is used for some system function, but not for the panel language.




.. _user-prefix-local:

Prefix rules
------------

| Prefix rules. You can see more details at the link `https://www.magnusbilling.org/local_prefix  <https://www.magnusbilling.org/local_prefix>`_.




.. _user-active:

Active
------

| Only active users can login into the panel and make calls




.. _user-country:

Country
-------

| Used to CID Callback. The country prefix code will be added before the CID to convert the CID to E164




.. _user-id-offer:

Activate offer
--------------

| Used to give free minutes. It's necessary to inform the tariffs that will belongs to the free packages.




.. _user-cpslimit:

CPS Limit
---------

| CPS(calls per second) limit to this client. The calls that exceed this limit will be send CONGESTION.




.. _user-description:

Description
-----------

| We did not write the description to this field.




.. _user-company-website:

Company website
---------------

| Company website.|Also used to agent panel customization. To agent, set the domain without http or wwww.




.. _user-company-name:

Company name
------------

| Company name. Also used to agent panel customization.|Whether is a agent this name will be used on the login panel. Need set the compnay website and use the agent domain to working the customization




.. _user-commercial-name:

Commercial name
---------------

| Brand name.




.. _user-state-number:

State number
------------

| State number.




.. _user-lastname:

Last name
---------

| Lastname.




.. _user-firstname:

First name
----------

| Firstname.




.. _user-city:

City
----

| City.




.. _user-state:

State
-----

| State.




.. _user-address:

Address
-------

| Address.




.. _user-neighborhood:

Neighborhood
------------

| Neighborhood.




.. _user-zipcode:

Zip code
--------

| Zipcode.




.. _user-phone:

Phone
-----

| Landline phone.




.. _user-mobile:

Mobile
------

| Mobile phone.




.. _user-email:

Email
-----

| Email, it's necessary to send system notifications.




.. _user-doc:

DOC
---

| Client document.




.. _user-vat:

VAT
---

| Used in some payment methods.




.. _user-contract-value:

Contract value
--------------

| We did not write the description to this field.




.. _user-dist:

DIST
----

| We did not write the description to this field.




.. _user-typepaid:

Type paid
---------

| Pos-paid clients can stay with negative balance until the credit limit informed in the field below.




.. _user-credit-notification-daily:

Credit notification daily
-------------------------

| Enable this option to customer receive daily balance notification Email. You can customize the email on Configuration menu, submenu Email Templates




.. _user-creditlimit:

Credit limit
------------

| If the user is Post-paid, the user will be able to make calls until he reaches this limit.




.. _user-credit-notification:

Credit notification
-------------------

| If the client credit get lower than this field value, MagnusBilling will send an email to the client warning that he is with low credits. IT'S NECESSARY HAVE A REGISTERED SMTP SERVER IN THE SETTINGS MENU.




.. _user-enableexpire:

Enable expire
-------------

| Activate expire. It's necessary to inform the expiry date in the "Expiry date" field.




.. _user-expirationdate:

Expiration date
---------------

| The date that the user will not be able to make calls anymore.




.. _user-calllimit:

Call limit
----------

| The amount of  simultaneous calls allowed for this client.




.. _user-calllimit-error:

Limit error
-----------

| Warning to be send if the call limit is exceeded.




.. _user-mix-monitor-format:

Record call format
------------------

| Format used to record calls.




.. _user-callshop:

Callshop
--------

| Activate the CallShop module. Only active if you really are going to use it. It's necessary give permition to the selected group.




.. _user-disk-space:

Disk space
----------

| Insert the amount disk space available to record, in GB. Use -1 to save it without limit. It's necessary to add in the cron the following php command /var/www/html/mbilling/cron.php UserDiskSpace .




.. _user-sipaccountlimit:

SIP account limit
-----------------

| The amount of VoIP accounts allowed by this user. Will be necessary give permission to the group to create VoIP accounts.




.. _user-callingcard-pin:

CallingCard PIN
---------------

| Used to authenticate the CallingCard.




.. _user-restriction:

Restriction
-----------

| Used to restrict dialing. Add the numbers in the menu: Users->Restricted numbers.




.. _user-restriction-use:

Use
---

| Which number will be used to check the restriction. This option is valid only to outbound calls.




.. _user-transfer-international-profit:

Profit
------

| This function is not avaible in Brazil. It's only used to mobile refills in some countries.




.. _user-transfer-flexiload-profit:

Profit
------

| This function is not avaible in Brazil. It's only used to mobile refills in some countries.




.. _user-transfer-bkash-profit:

Profit
------

| This function is not avaible in Brazil. It's only used to mobile refills in some countries.




.. _user-transfer-dbbl-rocket:

Enable DBBL/Rocket
------------------

| This function is not avaible in Brazil. It's only used to mobile refills in some countries.




.. _user-transfer-dbbl-rocket-profit:

Profit
------

| This function is not avaible in Brazil. It's only used to mobile refills in some countries.




.. _user-transfer-show-selling-price:

Show selling price
------------------

| This function is not avaible in Brazil. It's only used to mobile refills in some countries.




.. _user-email2:

Email
-----

| We did not write the description to this field.




.. _user-email-services:

Services email notification
---------------------------

| We did not write the description to this field.




.. _user-email-did:

DID email notification
----------------------

| We did not write the description to this field.



