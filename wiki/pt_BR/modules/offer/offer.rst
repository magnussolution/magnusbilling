
.. _offer-label:

Nome
----

| Nome para o pacote gratís.




.. _offer-packagetype:

Tipo de pacote
--------------

| Tipo do pacote, pode ser de 3 tipos. Chamadas ilimitadas, chamadas gratuitas ou Segundos gratís.




.. _offer-freetimetocall:

Quantidade gratuita
-------------------

| Neste campo é onde deve ser configurado a quantidade disponível no pacote.
| Exemplo:
| 
| * Chamadas ilimitadas: Nesta opção este campo fica sem uso, pois se está permitindo ligar de forma ilimitada, sem nenhum controle.
| * Chamadas gratuitas: Colocar a quantidade de chamadas que deseja dar gratís.
| * Segundos gratís: Colocar quantos segundos deseja permitir o cliente chamar.
| 
| .




.. _offer-billingtype:

Tipo de tarifação
-------------------

| Este é o período que será calculado o pacote.
| Veja a descrição:
| 
| * Mensal: O sistema vai verificar se do dia de ativação do plano + 30 dias o cliente chegou ao limite do pacote.
| * Semanal: O sistema vai verificar se do dia de ativação do plano + 7 dias o cliente chegou ao limite do pacote.
| 
| Quando o cliente chegar no limite do pacote, o MagnusBilling vai verificar se o usuário tem crédito para completar a chamada, caso o usuário não tenha crédito a chamada será finalizada.
| 
| .




.. _offer-price:

Preço
------

| Preço que será cobrado mensalmente do cliente.
| Se no dia do vencimento o cliente não tem saldo suficiente para pagar o pacote o MagnusBilling vai cancelar o pacote automaticamente.
| 
| No menu configurações, ajustes, existe uma opção chamada Notificação de Pacote de Oferta, este valor é quantos dias antes do vencimento do pacote o sistema tentará cobrar a mensalidade, caso o cliente não tiver saldo, então o MagnusBilling vai enviar um Email para o cliente informando a falta de crédito.
| 
| O email pode ser editado no menu, modelos de Email, tipo, plan_unpaid, assunto Aviso de Vencimento de Plano Mensal.
| 
| Para o envio de email, é necessário a configuração do SMTP no menu SMTP.
| 
| 
| Para saber como funciona os pacotes gratís veja o link https://wiki.magnusbilling.org/pt_BR/source/offer.html.
| 
|     .




.. _offer-initblock:

Bloco mínimo
-------------

| Tempo mínimo em segundos para tarifar a venda. Este valor irá subscrever os valores das tarifa do plano do cliente.




.. _offer-billingblock:

Bloco de tarifação
--------------------

| Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Este valor irá subscrever os valores das tarifa do plano do cliente.




.. _offer-minimal-time-charge:

Tempo mínimo para tarifar
--------------------------

| Tempo mínimo para tarifar. Se colocar 3, só vai tarifar chamadas que o tempo for maior ou igual que 3 segundos.



