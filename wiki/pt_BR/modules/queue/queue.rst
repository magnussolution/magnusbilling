
.. _queue-id-user:

Usuário
--------

| Usuário dono da fila.




.. _queue-name:

Nome
----

| Nome para a fila.




.. _queue-language:

Idioma
------

| Idioma da fila.




.. _queue-strategy:

Estratégia
-----------

| Estratégia para a fila.




.. _queue-ringinuse:

Chamar conta SIP em uso
-----------------------

| Chamar ou não agentes da fila que estejam em chamada.




.. _queue-timeout:

Chamado por
-----------

| Por quanto tempo deve ficar chamando um agente.




.. _queue-retry:

Tempo para chamar proximo agente
--------------------------------

| Tempo em segundos para tentar chamadas outro agente caso o anterior não atender.




.. _queue-wrapuptime:

Tempo para próxima chamada
---------------------------

| Intervalo de tempo em segundos que o agente poderá receber outra chamada.




.. _queue-weight:

Peso
----

| Prioridade de fila. Por exemplo, você tem o mesmo agente em 2 filas, e chega 12 chamadas ao mesmo tempo, o Asterisk vai enviar a chamada da fila com maior prioridade para o agente.




.. _queue-periodic-announce:

Periodic announce
-----------------

| Áudio para os anúncios. Você pode colocar mais de um áudio, separando por  (,). Estes dados devem estar no diretório /var/lib/asterisk/sounds/.




.. _queue-periodic-announce-frequency:

Frequência
-----------

| Frequência que deve executar os anúncios.




.. _queue-announce-position:

Announce position
-----------------

| Informar a posição que a pessoa se encontra na fila.




.. _queue-announce-holdtime:

Announce holdtime
-----------------

| Deveria ser incluso no anuncio da posição a estimativa de espera?.




.. _queue-announce-frequency:

Frequência de anúncio
-----------------------

| A cada quantos segundos deve informar a posição. Deixe em 0 para desativar o anúncio de posição.




.. _queue-joinempty:

Aceitar quando vazia
--------------------

| Permitir novas chamadas quando não tiver agente disponível para atender a chamada.




.. _queue-leavewhenempty:

Desligar fila sem agentes
-------------------------

| Desligar as chamadas em espera quando não tiver mais agente livres.




.. _queue-max-wait-time:

Tempo máximo de espera
-----------------------

| Tempo máximo de espera para ser atendido.




.. _queue-max-wait-time-action:

Ação quando superar a espera
------------------------------

| Coloque uma Conta VoIP, IVR, Fila de espera ou um canal LOCAL para enviar o cliente caso o tempo máximo de espera for superado. Formatos aceitos: SIP/conta_voip, QUEUE/nome_da_queue, IRV/nome_da_ivr ou LOCAL/extension@context.




.. _queue-ring-or-moh:

Chamar ou executar MOH
----------------------

| Tocar a música de espera ou tom de chamando quando o cliente estiver aguardando na fila.




.. _queue-musiconhold:

Audio tom de espera
-------------------

| Importar uma música de espera para esta fila.



