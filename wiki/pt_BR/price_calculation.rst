.. _price-calculation:

Cálculo de preço da chamada
===========================


O valor a ser cobrado do cliente é calculado em base ao preço da tarifa do prefixo que mais se adequa ao número discado do plano da do usuário.


O valor é calculado usando 4 valores. 

* Duração da chamada;
* Preço de venda;
* Bloco inicial;
* Incremento.

Exemplo.

O cliente liga para o número 5511988443300 e fala por 45 segundos. 
Existe uma tarifa no menu Tarifas para o prefixo 55119, com os seguint:

* Preço de compra = 0.05
* Bloco inicial = 30
* Incremento = 6

A fórmula do cálculo é:

Caso a Duração da chamada for menor que o Bloco inicial a fórmula será

::
     
  (Preço de compra / 60 segundos) * Bloco inicial 


Caso a Duração da chamada maior que Bloco inicial a fórmula será.


::
     
  (Preço de compra / 60 segundos) * Duração da chamada


Quando a duração da chamada é superior ao Bloco inicial, também é calculado o Incremento.

No exemplo anterior, a duração foi 45 segundos, e o Incremento é 6, então a fórmula fica

::
     
  (Duração da chamada / Incremento ) da 7 com resto 3. Então temos que somar 3 ao resto que será 48, portanto neste exemplo será calculado

::
     
  (0.05 / 60) * 48 = 0.04



O código abaixa é o utilizado para o cálculo.

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


A variável $callduration é a duração da chamada;
A variável $initblock é Bloco inicial;
A variável $billingblock é Incremento.



