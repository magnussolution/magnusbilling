
.. _campaign-id-user:

Usuário
--------

| Usuário dono da campanha.




.. _campaign-id-plan:

Plano
-----

| Que plano será usado para tarifar as chamadas desta campanha, pode ser um plano diferente do plano cadastrado na conta do cliente.




.. _campaign-name:

Nome
----

| Nome para a campanha.




.. _campaign-callerid:

CallerID
--------

| Caller ID




.. _campaign-status:

Status
------

| Status da campanha.




.. _campaign-startingdate:

Data de início
---------------

| Data que a campanha será considerada ativa.




.. _campaign-expirationdate:

Data de expiração
-------------------

| Data que a campanha não será mais considerada ativa, mesmo ser tiver números ativos.




.. _campaign-type:

Tipo
----

| Selecione entre VOZ ou SMS, se for audio, precisa importar áudio, se for SMS, preciso colocar o texto do SMS na tab SMS.




.. _campaign-audio:

Audio
-----

| Somente usado se o tipo de campanha for de voz. O áudio precisa ser compativel com Asterisk. Recomendamos usar GSM. Se usar WAV, tem que ser mono e 8k hz.




.. _campaign-audio-2:

Audio 2
-------

| Se você usar TTS, o nome cadastrado do número será executado entre o áudio 1 e 2.




.. _campaign-restrict-phone:

Números Restritos
------------------

| Ativando esta opção o MagnusBilling vai verificar se o número que será enviado a chamada está cadastrado no menu Números Bloqueados, se tiver, o sistema vai mudar o status do número para bloqueado e não vai enviar a chamada.




.. _campaign-auto-reprocess:

Reprocessar automático
-----------------------

| Reativar automaticamente todos os números das agendas da campanha quando não tiver mais números ativos.




.. _campaign-id-phonebook:




| Selecione as agendas que esta campanha vai usar.




.. _campaign-digit-authorize:

Número para reenviar
---------------------

| Você quer enviar o cliente para algum destino após o audio? Ex. Se o cliente digitar 1 transferir para uma conta SIP, então coloque aqui o número 1, e abaixo selecione SIP, e abaixo a conta VOIP que quer enviar a chamada. Selecione "Qualquer Dígito", para enviar para o destino se o cliente marcar qu.




.. _campaign-type-0:

Tipo de encaminhamento
----------------------

| Selecionar o tipo de reenvio, esta opção vai redirecionar a chamada para o destino selecionado conforme o tipo escolhido.




.. _campaign-id-ivr-0:

URA
---

| Selecione uma URA para enviar a chamada, a URA precisa ser do mesmo usuário dono da campanha.




.. _campaign-id-queue-0:

Fila de espera
--------------

| Selecione uma fila de espera para enviar a chamada, a fila de espera precisa ser do mesmo usuário dono da campanha.




.. _campaign-id-sip-0:

Conta SIP
---------

| Selecione uma conta SIP para enviar a chamada, a conta SIP precisa ser do mesmo usuário dono da campanha.




.. _campaign-extension-0:

Destino
-------

| Clique para mais detalhes
| Temos duas opcōes, conforme o tipo selecionado, personalizado ou grupo.
| 
| * Grupo, o nome do grupo colocado aqui, deve ser exatamente o mesmo do grupo das contas SIP que deseja receber as chamadas, vai chamar todas as contas SIP do grupo. 
| * Personalizado, então é possível a execução de qualquer opção válida do comando DIAL do asterisk, exemplo: SIP/contaSIP,45,tTr.




.. _campaign-record-call:

Gravar chamadas
---------------

| Gravar chamadas data campanha. Será gravado somente se a chamada for transferida.




.. _campaign-daily-start-time:

Horário de início diário
---------------------------

| Hora que a campanha vai iniciar o envio.




.. _campaign-daily-stop-time:

Horário de finalização diário
---------------------------------

| Hora que a campanha vai parar o envio.




.. _campaign-monday:

Segunda
-------

| Ativando esta opção o sistema vai enviar chamadas desta campanha nas segundas feiras.




.. _campaign-tuesday:

Terça feira
------------

| Ativando esta opção o sistema vai enviar chamadas desta campanha nas terças feiras.




.. _campaign-wednesday:

Quarta feira
------------

| Ativando esta opção o sistema vai enviar chamadas desta campanha nas quartas feiras.




.. _campaign-thursday:

Quinta feira
------------

| Ativando esta opção o sistema vai enviar chamadas desta campanha nas quintas feiras.




.. _campaign-friday:

Sexta
-----

| Ativando esta opção o sistema vai enviar chamadas desta campanha nas sextas feiras.




.. _campaign-saturday:

Sábado
-------

| Ativando esta opção o sistema vai enviar chamadas desta campanha nos sábados.




.. _campaign-sunday:

Domingo
-------

| Ativando esta opção o sistema vai enviar chamadas desta campanha nos domingos.




.. _campaign-frequency:

Limite de chamada
-----------------

| Quantas chamadas o sistema deverá gerar por minuto nesta campanha.
| Este valor será divido por 60 segundos, e as chamadas serão enviadas durante o minuto, e nao todas de uma vez.




.. _campaign-max-frequency:

Limite máximo de chamadas
--------------------------

| Este é o valor máximo que o cliente poderá alterar. Se você colocar 50, o usuário poderá alterar, desde que um valor igual ou menor que 50.




.. _campaign-nb-callmade:

Duração do áudio
-------------------

| Tempo do áudio da campanha, usado para controlar quantidade de chamadas considerada sucesso.




.. _campaign-enable-max-call:

Toggle max completed calls
--------------------------

| Se ativado, MagnusBilling vai verificar quantas chamadas já foram realizadas e tiveram a duração igual à duração do áudio.  Se a quantidade for igual ou maior que o valor colocado no próximo campo , a campanha será desativada.




.. _campaign-secondusedreal:

Quantidade máxima completada
-----------------------------

| Máximo de chamadas completas. Precisa ativar o campo acima.




.. _campaign-description:

Descrição ou texto do SMS
---------------------------

| Este campo tem uso diferente dependendo se a campanha é VOZ ou SMS.
| Tipos possíveis:
| 
| * VOZ, neste caso este campo é simplesmente a descrição da campanha. 
| * SMS, quando a campanha for do tipo SMS, então o texto colocado aqui será o SMS que será enviado aos números das agendas da campanha. 
| 
| No caso de SMS, você pode usar a variável %name% onde você deseja usar o nome do dono do número, exemplo:
| 
| Ola %name% temos uma promoção para você.....
| 
| Então digamos que tenha cadastrado na agenda utilizada por esta campanha uma lista de números contendo número e nome.
| 
| 5511998844334,Paulo Ricardo
| 5511974635734,João Matos
| 
| Então para o número 5511998844334 a mensagem enviada será. 
| Ola Paulo Ricardo temos uma promoção para você.....
| 
| e para 
| 
| 5511974635734 a mensagem enviada será. 
| Ola João Matos temos uma promoção para você.....
| 
| .




.. _campaign-tts-audio:

Audio 1 TTS
-----------

| Com está opção de TTS, o sistema vai gerar o áudio 1 da campanha via TTS, text to speech, tradução livre, texto para áudio
| Para que está opção funcione, será necessário a configuração da url TTS no menu Configurações, sub menu Ajustes, opção Tts URL.
| 
| Clique neste link para saber mais cobre como configurar TTS no Magnusbilling https://wiki.magnusbilling.org/pt_BR/source/tts.html
| .




.. _campaign-tts-audio2:

Audio 2 TTS
-----------

| Mesma função do campo campo anterior, mas para o áudio 2. Lembra que entre o áudio 1 e 2, o TTS executa o nome importado nos números.



