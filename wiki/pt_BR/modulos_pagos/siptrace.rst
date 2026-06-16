
.. _sipTrace-head:

SIPTrace
========

O módulo **SIPTrace** permite capturar pacotes SIP diretamente pela interface do MagnusBilling para ajudar no diagnóstico de chamadas, registros e respostas dos troncos.

Este é um módulo pago. Para adquirir, acesse:

`https://magnussolution.com/br/servicos/auto-desempenho/siptrace.html <https://magnussolution.com/br/servicos/auto-desempenho/siptrace.html>`_

A captura é solicitada pelo usuário no painel. O processo em segundo plano executa o ``ngrep`` com os dados informados e grava o resultado no arquivo:

``/var/www/html/mbilling/resources/reports/siptrace.log``

Quando o usuário atualiza o módulo, o sistema lê este arquivo e mostra os pacotes encontrados no grid.

.. image:: ../img/modulos_pagos/siptrace-grid.png
   :alt: Grid do módulo SIPTrace


Quando usar
-----------

Use o SIPTrace para verificar, por exemplo:

* se uma chamada está chegando ao servidor;
* se o servidor está enviando a chamada para o tronco;
* qual resposta SIP foi retornada pelo tronco, como ``403``, ``404``, ``480``, ``486``, ``500`` ou ``503``;
* se um ``REGISTER`` está chegando ao servidor;
* se existe diferença entre a perna de entrada e a perna de saída da chamada;
* se o Call-ID de uma chamada possui todos os pacotes esperados.


Iniciar uma captura
-------------------

1. Acesse o módulo **SIPTrace**.
2. Clique em **Start capture**.
3. Informe os campos da captura.
4. Clique novamente em **Start capture** na janela do filtro.
5. Aguarde o tempo configurado.
6. Clique em **Atualizar** no grid para visualizar os pacotes capturados.

Enquanto existir uma captura ativa, o sistema não permite iniciar outra captura. Aguarde a captura terminar ou clique em **Stop capture**.

.. image:: ../img/modulos_pagos/siptrace-start-capture.png
   :alt: Janela para iniciar captura SIPTrace


Campos da captura
-----------------

Filter timeout
~~~~~~~~~~~~~~

Tempo, em segundos, que a captura ficará ativa.

O valor deve ser numérico. O valor mínimo é ``5`` e o valor máximo é ``300``.


Port
~~~~

Porta SIP que será monitorada.

Normalmente a porta é ``5060``. Em instalações com outra porta SIP, informe a porta correspondente.

O valor deve ser numérico e estar entre ``1`` e ``65535``.


Filter
~~~~~~

Texto usado para filtrar os pacotes capturados.

Exemplos comuns:

* IP do cliente;
* IP do tronco;
* número discado;
* conta SIP;
* parte do Call-ID.

Use filtros específicos sempre que possível. Quanto mais genérico for o filtro, maior será o arquivo gerado e mais difícil será analisar o resultado.


Atualizar o grid
----------------

Depois de iniciar a captura, clique em **Atualizar** para carregar os pacotes gravados no arquivo ``siptrace.log``.

O grid mostra as principais informações de cada pacote:

* **Method**: método SIP ou resposta SIP, como ``INVITE``, ``ACK``, ``BYE``, ``100 Trying``, ``180 Ringing`` ou ``503 Service Unavailable``;
* **Call ID**: identificador SIP da chamada ou transação;
* **SIP To**: destino informado no cabeçalho ``To``;
* **Source**: origem do pacote;
* **Destination**: destino do pacote;
* **Head**: corpo completo do pacote SIP, usado internamente e também para análise detalhada.


Filtrar no grid
---------------

Os filtros do grid ajudam a encontrar pacotes específicos dentro do arquivo capturado.

Você pode filtrar por:

* método ou resposta SIP;
* Call-ID;
* IP de origem;
* IP de destino;
* cabeçalho ``To``.

Para analisar uma chamada, normalmente o melhor filtro é o **Call ID**, porque todos os pacotes da mesma chamada usam o mesmo identificador.


Ver detalhes de uma chamada
---------------------------

Para abrir a visualização detalhada:

1. Selecione um ou mais registros no grid.
2. Clique em **Details**.

O sistema abre uma janela com os pacotes do Call-ID selecionado em uma visão semelhante ao ``sngrep``.

É possível selecionar até ``3`` registros por vez. Isto permite comparar chamadas ou pernas diferentes sem deixar a tela muito pesada.

Na tela de detalhes:

* cada linha representa um pacote SIP;
* as setas indicam a direção do pacote entre origem e destino;
* respostas ``1xx`` e ``2xx`` indicam progresso ou sucesso;
* respostas ``3xx``, ``4xx``, ``5xx`` e ``6xx`` indicam redirecionamento, erro ou rejeição;
* pacotes com SDP mostram informação de mídia, como codecs e IP/porta de áudio;
* ao clicar em um pacote, o corpo completo da mensagem SIP é exibido.


Exportar o log
--------------

Clique em **Export file** para baixar o arquivo ``siptrace.log``.

Use esta opção quando precisar enviar a captura para suporte ou analisar o conteúdo em outra ferramenta.


Parar uma captura
-----------------

Clique em **Stop capture** para interromper a solicitação de captura ativa.

Use esta opção quando o filtro informado estiver errado ou quando não for necessário aguardar o tempo configurado.


Apagar o log
------------

Clique em **Delete** para apagar o arquivo de log do SIPTrace.

Esta ação remove o conteúdo capturado anteriormente. Antes de apagar, exporte o arquivo caso precise guardar a análise.


Como interpretar respostas comuns
---------------------------------

``100 Trying``
    O equipamento recebeu o ``INVITE`` e iniciou o processamento da chamada.

``180 Ringing``
    O destino está chamando.

``183 Session Progress``
    O destino enviou progresso da chamada. Pode incluir SDP e áudio antecipado.

``200 OK``
    A solicitação foi aceita. Em chamadas, normalmente indica chamada atendida.

``403 Forbidden``
    A chamada foi rejeitada por permissão, autenticação, rota ou política do provedor.

``404 Not Found``
    O destino ou rota não foi encontrado.

``480 Temporarily Unavailable``
    O destino está temporariamente indisponível.

``486 Busy Here``
    O destino está ocupado.

``500 Server Internal Error``
    Erro interno no servidor ou no provedor.

``503 Service Unavailable``
    O serviço ou rota não está disponível. Pode indicar falha no tronco, limite, indisponibilidade ou problema temporário no provedor.


Boas práticas
-------------

* Use sempre o filtro mais específico possível.
* Prefira capturas curtas, entre ``30`` e ``60`` segundos.
* Para chamadas, filtre pelo número discado ou IP do cliente/tronco.
* Depois de encontrar o pacote no grid, use **Details** para analisar o Call-ID completo.
* Compare a perna de entrada e a perna de saída da chamada.
* Apague ou exporte logs antigos para evitar arquivos muito grandes.


Limitações
----------

O SIPTrace captura apenas o tráfego que passa pela interface e porta monitoradas. Se o pacote não chegou ao servidor, ele não aparecerá no log.
