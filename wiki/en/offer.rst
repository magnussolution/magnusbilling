.. _offer:

Free Packages
==============

What is free packages?
++++++++++++++++++++++

Free packages are for giving customers a number of calls at no charge, for a monthly fee or with no cost whatsoever.

How to configure?
++++++++++++++++

The configuration of the free packages needs several steps.

1 - Create the package.

	See the list of descriptions for each field:

	* :ref:`offer-label` 
	* :ref:`offer-packagetype` 
	* :ref:`offer-freetimetocall` 
	* :ref:`offer-billingtype` 
	* :ref:`offer-price`


2 - Select the tariffs that you want to include in the packages.

	It's necessary to inform which prefixes will be included in the free packages. To do this, go to the tariffs menu in the tariffs submenu, click on the tariff you want to include in the packages and put the option "Include in free packages" instead.


3 - Activate the free packages for users.
	Go to the Customers menu, users submenu, click on the customer who wants to activate the package, and select the option "Activate free package" the package you want to activate for the customer.


How it works?
++++++++++++++

We will use the following example:

A free package called SPAIN FIXED was created, with 6000 free seconds, that is 100 minutes, charging monthly and with the price of  USD 5,00.

It was configured to include in the free packages the Spain fixed tariffs, of the Gold plan.

And the free package was activated on the 24315 user, and this customer was placed on the Gold plan.

And we left this client 24315 with a balance of USD 10.00.


Process performed by the system.

Customer 24315 calls the number 551140040001, the system will check the customer's plan, and will soon search for the most appropriate rate for the number dialed, in this case it will be the rate 55114, São Paulo Prefix.

Now it will check if this tariff has the option "Include in free packages", if it does, and in our example it does, MagnusBilling will check if the customer has already used 100 minutes from the day of activation, considering if the type of charging is monthly or week, in our example it is monthly. If the 100 minutes have not yet been used, the system will allow the customer to call even if the customer's balance is 0. And if the customer has a balance, the call will be free.

If the tariff is included in the packages, but the customer has already exceeded the package limit, MagnusBilling will only allow the call if the customer has credit.

Continuing with our example, if the customer dials any other number that does not start with 55114, he can only call if he has credit. In our Gold plan, we only select the precise 55114 prefix to include in the packages.



How is the monthly fee charged?
+++++++++++++++++++++++++++++

Using the same example as before, and that the plan was activated on the 15th, the system will automatically charge the customer for the value of the package, in this example USD 5.00 from the customer's credit every 15th.

There is an option in the settings submenu settings menu called "Notification of Offer Packages", by default it is 5 days. This means that 5 days before the expiration date of the plan, MagnusBilling will try to charge the value of the package, in our example it would be on the 10th.

If the customer does not have enough credit for MagnusBilling to discount the USD 5.00, an "plan_unpaid" email will be sent.

Magnusbilling will try to charge the value of the free package until it succeeds , or until the package expires..

If the customer places credit, or already has enough credit for payment, MagnusBilling will mark the plan as paid for another month, and create a refill in the plan price, and will send the "plan_paid" email.

If it arrives on the 16th and the customer still does not have enough credit for the payment, the plan will be deactivated in the user's account, and an "plan_released" email will be sent.


The emails can be found, and edited, in the settings menu submenu email templates.


Where to see the consumption of each customer?
+++++++++++++++++++++++++++++++++++

All calls made using a package will be added to the tariff menu submenu package report.



OBS:
* It is not possible to activate more than one package per customer.
* It is not possible to create combined packages, for example, 100 minutes for fixed, and 50 minutes for mobile.
* Calls made using packages will always be rounded up to minutes, regardless of the minimum time and block of tariff time.





Example image
+++++++++++++++++


See some images of the configuration of our example.


The free package.

.. image :: img / package.png

Tariffs.

.. image :: img / Bundle-Rates.png

Show the Include in free packages column.

.. image :: img / package-column-hidden.png

User activation

.. image :: img / package-user.png

Report

.. image :: img / package-relatorio.png

Email Templates

.. image :: img / packages-emails.png
