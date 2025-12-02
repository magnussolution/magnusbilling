
.. _did-did:

DID
---

| O número exatamente como chega no Asterisk. Você também pode usar intervalos. Examplo: 551140040001-551140040009. Neste exemplo criar os DIDS 551140040001 ao 551140040009.




.. _did-record-call:

Gravar chamadas
---------------

| Gravar chamadas deste DID. Será gravado independente do destino da chamada.




.. _did-activated:

Status
------

| Somente os números ativos podem receber chamadas.




.. _did-callerid:

Callerid name
-------------

| Coloque aqui CallerID name, deixe em branco para usar o que vem do provedor do DID.




.. _did-connection-charge:

Taxa de ativação
------------------

| Custo de ativaçao. Este custo será descontado do cliente somente no momento que o DID é vinculado ao usuário.




.. _did-fixrate:

Preço mensal
-------------

| Custo mensal. Este valor será descontado automaticamente todos os meses do saldo do cliente. Se o cliente não tiver crédito o DID é cancelado automaticamente.




.. _did-connection-sell:

Taxa de conexão
----------------

| Este é o valor que será cobrado em cada chamada, simplesmente por atender a chamada.




.. _did-minimal-time-buy:

Tempo mínimo para tarifar
--------------------------

| Tempo mínimo para tarifar o custo do DID. Ex. Se colocar 3, qualquer chamada com tempo menor que 3 não será tarifado.




.. _did-buyrateinitblock:

Bloco inicial
-------------

| Tempo mínimo em segundos para tarifar o custo do DID. Ex, se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.




.. _did-buyrateincrement:

Incremento
----------

| Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo de custo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.




.. _did-minimal-time-charge:

Tempo mínimo para tarifar
--------------------------

| Tempo mínimo para tarifar o DID. Ex. Se colocar 3, qualquer chamada com tempo menor que 3 não será tarifado.




.. _did-initblock:

Bloco mínimo
-------------

| Tempo mínimo em segundos para tarifar. Ex, se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.




.. _did-increment:

Bloco de tarifação
--------------------

| Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.




.. _did-charge-of:

Quem será cobrado
------------------

| Esta opção é para quando o DID tiver custo, neste caso poderá cobrar do usuário dono do DID, ou somente permitir chamadas de números cadastrado no menu CallerID.
| Neste caso, o custo será cobrado do usuário ao qual o número foi atrelado.




.. _did-calllimit:

Limite de canais
----------------

| Limite de chamadas simultâneas para este DID.




.. _did-description:

Descrição
-----------

| Usado para seu controle interno.




.. _did-expression-1:

Expressão regular
------------------

| Esta é uma Expressão regular para tarifar o DID conforme o número de quem liga para o DID
| Vamos analisar um exemplo real:
| 
| Digamos que queremos cobrar 0.10 quando recebemos uma chamada de um telefone fixo, e 0.20 se for de um celular, e bloquear qualquer outro formato.
| 
| Neste exemplo vamos criar regras para identificar o CallerID nos formatos 0 DDD número, DDD número ou 55 DDD número.
| 
| Veja na imagem abaixo como ficaria.
| 
.. image:: ../img/did_regex.png
   :scale: 100% 
| 
| 
| Expressão regular para celular
| ^[1-9][0-9]9\\d{8}$|^0[1-9][0-9]9\\d{8}$|^55[1-9][0-9]9\\d{8}$
| 
| Expressão regular para fixo
| ^[1-9][0-9]\\d{8}$|^0[1-9][0-9]\\d{8}$|^55[1-9][0-9]\\d{8}$
| 
| 
| 
| .




.. _did-buy-rate-1:

Preço de compra por min
------------------------

| Preço por minuto de compra se validar a Expressão regular acima.




.. _did-selling-rate-1:

Preço de venda por min
-----------------------

| Preço por minuto a ser cobrado se validar a Expressão regular acima.




.. _did-block-expression-1:

Bloquear chamadas desta expressão
----------------------------------

| Se colocar como SIM, e o número de quem ligou for validado com a Expressão regular acima, a chamada será desligada imediatamente.




.. _did-send-to-callback-1:

Enviar a chamada para callback
------------------------------

| Envia a chamada para CallBack se o número for validado com a Expressão regular acima
| Como a chamada será enviada para um CallBack, então a chamada será desligada imediatamente. 
| E se todas as configurações estiverem corretas, o CallBack este executado e o telefone do cliente tocará.




.. _did-expression-2:

Expressão regular
------------------

| Igual a opção 1. Você pode ver mais detalhes no link `https://wiki.magnusbilling.org/pt_BR/source/modules/did/did.html#did-expression-1.  <https://wiki.magnusbilling.org/pt_BR/source/modules/did/did.html#did-expression-1.>`_.




.. _did-buy-rate-2:

Preço de compra por min
------------------------

| Preço por minuto de compra se validar a Expressão regular acima.




.. _did-selling-rate-2:

Preço de venda por min
-----------------------

| Preço por minuto a ser cobrado se validar a Expressão regular acima.




.. _did-block-expression-2:

Bloquear chamadas desta expressão
----------------------------------

| Se colocar como SIM, e o número de quem ligou for validado com a Expressão regular acima, a chamada será desligada imediatamente.




.. _did-send-to-callback-2:

Enviar a chamada para callback
------------------------------

| Envia a chamada para CallBack se o número for validado com a Expressão regular acima
| Como a chamada será enviada para um CallBack, então a chamada será desligada imediatamente. 
| E se todas as configurações estiverem corretas, o CallBack este executado e o telefone do cliente tocará.




.. _did-expression-3:

Expressão regular
------------------

| Igual a opção 1. Você pode ver mais detalhes no link `https://wiki.magnusbilling.org/pt_BR/source/modules/did/did.html#did-expression-1.  <https://wiki.magnusbilling.org/pt_BR/source/modules/did/did.html#did-expression-1.>`_.




.. _did-buy-rate-3:

Preço de compra por min
------------------------

| Preço por minuto de compra se validar a Expressão regular acima.




.. _did-selling-rate-3:

Preço de venda por min
-----------------------

| Preço por minuto a ser cobrado se validar a Expressão regular acima.




.. _did-block-expression-3:

Bloquear chamadas desta expressão
----------------------------------

| Se colocar como SIM, e o número de quem ligou for validado com a Expressão regular acima, a chamada será desligada imediatamente.




.. _did-send-to-callback-3:

Enviar a chamada para callback
------------------------------

| Envia a chamada para CallBack se o número for validado com a Expressão regular acima
| Como a chamada será enviada para um CallBack, então a chamada será desligada imediatamente. 
| E se todas as configurações estiverem corretas, o CallBack este executado e o telefone do cliente tocará.




.. _did-cbr:

Callback pro
------------

| Ativa o CallBack Pro.




.. _did-cbr-ua:

Usar áudio
-----------

| Executar um áudio.




.. _did-cbr-total-try:

Tentativa máxima
-----------------

| Quantas vezes o sistema vai tentar retornar para o cliente?.




.. _did-cbr-time-try:

Intervalo entre tentativas
--------------------------

| Intervalo de tempo entre cada tentativa, em minutos.




.. _did-cbr-em:

Early media
-----------

| Executar o áudio antes de atender. O provedor do DID precisa aceitar EarlyMedia.




.. _did-TimeOfDay-monFri:

Seg-Sex
-------

| Ex: sua trabalha de 09 as 12 e de 14h às 18h, e dentro deste horário você quer executar o callback e retornar a chamada para a pessoa que ligou, então coloque 09:00-12:00|14:00-18:00, os intervalos são separados por |.




.. _did-TimeOfDay-sat:

Sab
---

| Mesma regra só que para sábados.




.. _did-TimeOfDay-sun:

Domingo
-------

| Mesma regra só que para domingos.




.. _did-workaudio:

Áudio Trabalhando
------------------

| Áudio que será executado quando alguém ligar dentro do horário de atendimento.




.. _did-noworkaudio:

Não trabalhando
----------------

| Áudio que será executado quando ligar fora do horário de atendimento.




.. _did-country:

País
-----

| País




.. _did-id-server:

Servidor
--------

| Servidor. Somente usado quando você usa SIP PROXY.



