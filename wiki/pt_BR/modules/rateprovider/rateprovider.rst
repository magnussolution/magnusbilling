
.. _rateProvider-id-provider:

Nome do provedor
----------------

| Provedor.




.. _rateProvider-id-prefix:

Destino
-------

| Prefixo.




.. _rateProvider-buyrate:

Preço de compra
----------------

| Valor pago ao provedor por minuto.




.. _rateProvider-buyrateinitblock:

Bloco inicial
-------------

| Tempo mínimo em segundos para tarifar. Ex, se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.




.. _rateProvider-buyrateincrement:

Incremento
----------

| Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.




.. _rateProvider-minimal-time-buy:

Tempo mínimo para compra
-------------------------

| Tempo mínimo para tarifar. Se colocar 3, só vai tarifar chamadas que o tempo for maior ou igual que 3 segundos.



