.. _price-calculation:

Call Price Calculation
===========================



This value is calculated based on the adjusted price for the provider which trunk was used to complete this call.

The price is calculated using 4 values. 

* Call dutarion;
* Purchase price;
* Initial block;
* Increment.

Example.

The client calls to the number 5511988443300 and spoke for 45 seconds. 
And exist one tariff on the Providers Tariff menu for the 55119 prefix, with:

* Purchase price = 0.05
* Initial block = 30
* Increment = 6 

The calculation formula is:

If the call durations is inferior than the Initial block value the formula will be

::
     
  (Purchase price / 60 seconds) * Initial block


If the call durations is higher than the Initial block value the formula will be


::
     
  (Purchase price / 60 seconds) * Call duration


When the call duration is higher than the Initial block, the Increment is calculated as well.

In the last example, the duration was 45 seconds, and the Increment is 6, so the formula become

::
     
  (Call duration / Increment ) the result is 7, with 3 as remainder. Then we need to add up 3 to the rest, the result is 48. Therefore in this example will be calculated

::
     
  (0.05 / 60) * 48 = 0.04



The code below is used for the calculus.

.. code-block:: php

   $cost = 0;  
   if ($callduration < $initblock) {
       $callduration = $initblock;
   }

   if (($billingblock > 0) && ($callduration > $initblock)) {
       $mod_sec = $callduration % $billingblock;
       if ($mod_sec > 0) {
           $callduration += ($billingblock - $mod_sec);
       }
   }
   $cost += ($callduration / 60) * $rateinitial;


The variable $callduration is the call duration;
The variable $initblock is the Initial block;
The variable $billingblock is the Increment.



