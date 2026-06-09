Help.load({
    //ALARMES
    'alarm.type': ``,
    'alarm.period': ``,
    'alarm.condition': ``,
    'alarm.amount': ``,
    'alarm.status': ``,
    'alarm.email': ``,
    'alarm.subject': ``,
    'alarm.message': ``,
    //API
    'api.id_user': `Usuário que poderá usar está API.||Para usar a API é necessário o uso do projeto MagnusBilling API PHP publicado no GITHUB.
    
O projeto está publicado no link https://github.com/magnussolution/magnusbilling-api-php. 
A API tem documentação, atualmente somente em Ingles, e está publicado no link https://github.com/magnussolution/magnusbilling-api-php/wiki. .`,
    'api.api_key': `Key necessária para autenticar na API.`,
    'api.api_secret': `Secret necessário para autenticar na API.`,
    'api.status': `Permitir ou não a conexão na API.`,
    'api.action': `Quais as açōes será permitidas na conexão.`,
    'api.api_restriction_ips': `Quais os IPs poderão conectar na API.
Deixar em branco para permitir a conexão de qualquer IP.

É extremamente recomendável somente liberar os IPs que realmente deseja conectar.`,
    //EXTRATO DE CHAMADAS
    'call.starttime': `Dia e hora do início da chamada.`,
    'call.src': `Conta SIP que realizou a chamada.`,
    'call.callerid': `Número enviado para o tronco como identificador de chamada.||
Caso o tronco aceite o envio de callerid, então este número será usado como identificador de chamada.

Para funcionar é necessário deixar o campo Fromuser no tronco em branco.`,
    'call.calledstation': `Número discado pelo cliente.`,
    'call.idPrefixdestination': `Nome do destino, este nome está relacionado com o menu Prefixos.`,
    'call.idUserusername': `Usuário que realizou a chamada, e ao qual o custo da chamada foi descontado.`,
    'call.idTrunktrunkcode': `Tronco que foi utilizado para completar a chamada.`,
    'call.sessiontime': `Duração da chamada em segundos.`,
    'call.buycost': `Preço de compra. Clique para entender como é calculado o preço|https://wiki.magnusbilling.org/pt_BR/source/price_calculation.html.`,
    'call.sessionbill': `Preço de venda, este foi o valor descontado do cliente. Clique para entender como é calculado o preço|https://wiki.magnusbilling.org/pt_BR/source/price_calculation.html.`,
    'call.agent_bill': `Preço de venda, este foi o valor descontado do cliente. Clique para entender como é calculado o preço|https://wiki.magnusbilling.org/pt_BR/source/price_calculation.html.`,
    'call.uniqueid': `ID único gerado pelo Asterisk, este campo é também a hora de início da chamada em Epoch Unix.`,
    'call.terminatecauseid': ``,
    //CHAMADAS ARQUIVADAS
    'callarchive.calledstation': `Número discado pelo cliente.`,
    'callarchive.sessiontime': `Duração da chamada em segundos.`,
    'callarchive.buycost': `Preço de compra. Clique para entender como é calculado o preço|https://wiki.magnusbilling.org/pt_BR/source/price_calculation.html.`,
    'callarchive.sessionbill': `Preço de compra. Clique para entender como é calculado o preço|https://wiki.magnusbilling.org/pt_BR/source/price_calculation.html.`,
    'callarchive.agent_bill': `Preço de compra. Clique para entender como é calculado o preço|https://wiki.magnusbilling.org/pt_BR/source/price_calculation.html.`,
    //CALLBACK
    'callback.id_user': `Usuário dono do DID que recebeu a solicitação de CallBack.`,
    'callback.exten': `Número da pessoa que ligou para o DID solicitando o CallBack.`,
    'callback.status': `Status da chamada||Os status podem ser:
* Ativa
    O CallBack ainda não foi processado.
* Pendente
    O MagnusBilling processou o CallBack e enviou para o tronco.
* Enviado
    O CallBack foi processado com sucesso.
* Fora do horário
    A chamada foi recebida fora do horário de atendimento configurado no menu DID, tab CallBack pro.
    .`,
    //CALLERID
    'callerid.id_user': `Selecionar o usuário.`,
    'callerid.cid': `Número do callerid para autenticar o Calling Card. É necessário cadastrar o número no formato que chega no servidor. Verifique o formato no Cli do Asterisk, ou consulte com o provedor do DID.`,
    'callerid.name': `Opcional.`,
    'callerid.description': `Descrição para o CallerID.`,
    'callerid.activated': `Status do CallerID.`,
    //CHAMADAS ONLINE
    'callonline.idUserusername': `Usuário principal da conta SIP que iniciou a chamada.`,
    'callonline.sip_account': `Conta SIP que solicitou a chamada.`,
    'callonline.idUsercredit': `Crédito do usuário.`,
    'callonline.ndiscado': `Número no formato que o usuário discou.`,
    'callonline.codec': `Codec usado na chamada.`,
    'callonline.callerid': `Número enviado para o tronco como identificador de chamada.||
Caso o tronco aceite o envio de callerid, então este número será usado como identificador de chamada.

Você pode confirmar este valor no campo abaixo onde mostra o resultado do comando core show channel, no valor [Caller ID] => 3341185338
Para funcionar é necessário deixar o campo Fromuser no tronco em branco.`,
    'callonline.tronco': `Tronco que foi utilizado para completar a chamada.`,
    'callonline.reinvite': `Reinvite é o parâmetro que informa se o áudio está passando pelo Asterisk, ou se está passando diretamente entre o cliente e o tronco. Clique para saber mais sobre está opção|https://wiki.magnusbilling.org/pt_BR/source/asterisk_options/directmedia.html.`,
    'callonline.from_ip': `Ip do terminal SIP que foi iniciado a chamada.`,
    'callonline.description': `Dados do comando sip show channel.`,
    //RELATóRIO
    'callshopcdr.id_user': `Usuário.`,
    //RESUMO POR DIA
    'callsummarycallshop.sumsessiontime': `Somatório de minutos chamadas.`,
    'callsummarycallshop.sumprice': `Valor total.`,
    'callsummarycallshop.sumlucro': `Somatório do lucro.`,
    'callsummarycallshop.sumbuycost': `Somatório do preço de compra.`,
    'callsummarycallshop.sumnbcall': `Total de chamadas.`,
    //RESUMO POR REVENDEDOR
    'callsummarydayagent.sumsessiontime': `Somatório de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os dias da última semana, ou de um revendedor específico, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummarydayagent.sumsessionbill': `Somatório do preço de venda.`,
    'callsummarydayagent.sumbuycost': `Somatório do preço de compra.`,
    'callsummarydayagent.sumlucro': `Somatório do lucro.`,
    'callsummarydayagent.sumnbcall': `Total de chamadas.`,
    //RESUMO POR DIA/TRONCO
    'callsummarydaytrunk.sumsessiontime': `Somatório de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os dias da última semana, ou de um tronco específico, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummarydaytrunk.sumsessionbill': `Somatório do preço de venda.`,
    'callsummarydaytrunk.sumbuycost': `Somatório do preço de compra.`,
    'callsummarydaytrunk.sumlucro': `Somatório do lucro.`,
    'callsummarydaytrunk.sumnbcall': `Total de chamadas.`,
    //RESUMO POR DIA/USUáRIO
    'callsummarydayuser.sumsessiontime': `Somatório de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os dias da última semana, ou de um usuário específico, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummarydayuser.sumlucro': `Somatório do lucro.`,
    'callsummarydayuser.sumnbcall': `Total de chamadas.`,
    //RESUMO POR MêS/DID
    'callsummarymonthdid.sumsessionbill': `Somatório do preço de venda`,
    'callsummarymonthdid.sumsessiontime': `Somatório de minutos`,
    'callsummarymonthdid.sumnbcall': `Total de chamadas`,
    //RESUMO POR MêS/TRONCO
    'callsummarymonthtrunk.sumsessiontime': `Somatorio de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os últimos 3 meses, ou de um tronco específico, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummarymonthtrunk.sumsessionbill': `Somatório do preço de venda.`,
    'callsummarymonthtrunk.sumbuycost': `Somatório do preço de compra.`,
    'callsummarymonthtrunk.sumlucro': `Somatório do lucro.`,
    'callsummarymonthtrunk.sumnbcall': `Total de chamadas.`,
    //RESUMO POR MêS/USUáRIO
    'callsummarymonthuser.sumsessiontime': `Somatório de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os últimos 3 meses, ou de um usuário específico, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummarymonthuser.sumlucro': `Somatório do lucro.`,
    'callsummarymonthuser.sumnbcall': `Total de chamadas.`,
    //RESUMO POR DIA
    'callsummaryperday.sumsessiontime': `Somatório de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os dias da última semana, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummaryperday.sumsessionbill': `Somatório do preço de venda.`,
    'callsummaryperday.sumbuycost': `Somatório do preço de compra.`,
    'callsummaryperday.sumlucro': `Somatório do lucro.`,
    'callsummaryperday.sumnbcall': `Total de chamadas.`,
    'callsummaryperday.sumnbcallfail': `Total de chamadas rejeitadas.`,
    //RESUMO POR MêS
    'callsummarypermonth.sumsessiontime': `Somatório de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os últimos 3 meses, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummarypermonth.sumsessionbill': `Somatório do preço de venda.`,
    'callsummarypermonth.sumbuycost': `Somatório do preço de compra.`,
    'callsummarypermonth.sumlucro': `Somatório do lucro.`,
    'callsummarypermonth.sumnbcall': `Total de chamadas.`,
    //RESUMO POR TRONCO
    'callsummarypertrunk.sumsessiontime': `Somatório de minutos chamadas.||É possível realizar filtros, por exemplo, filtrar os últimos 3 meses, neste caso. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummarypertrunk.sumsessionbill': `Somatório do preço de venda.`,
    'callsummarypertrunk.sumbuycost': `Somatório do preço de compra.`,
    'callsummarypertrunk.sumlucro': `Somatório do lucro.`,
    'callsummarypertrunk.sumnbcall': `Total de chamadas.`,
    'callsummarypertrunk.sumnbcallfail': `Total de chamadas rejeitadas.`,
    //RESUMO POR USUáRIO
    'callsummaryperuser.sumsessiontime': `Somatório de minutos chamadas por usuário.||É possível realizar filtros, por exemplo, somente usuários que iniciam com a letra a, ou um usuário específico. Este somatório mostrará somente os dados do filtro executado.`,
    'callsummaryperuser.sumlucro': `Somatório do lucro.`,
    'callsummaryperuser.sumnbcall': `Total de chamadas.`,
    'callsummaryperuser.sumnbcallfail': `Total de chamadas rejeitadas.`,
    //CAMPAIGNS
    'campaign.id_user': `Usuário dono da campanha.`,
    'campaign.id_plan': `Que plano será usado para tarifar as chamadas desta campanha, pode ser um plano diferente do plano cadastrado na conta do cliente.`,
    'campaign.name': `Nome para a campanha.`,
    'campaign.callerid': `Caller ID`,
    'campaign.status': `Status da campanha.`,
    'campaign.startingdate': `Data que a campanha será considerada ativa.`,
    'campaign.expirationdate': `Data que a campanha não será mais considerada ativa, mesmo ser tiver números ativos.`,
    'campaign.type': `Selecione entre VOZ ou SMS, se for audio, precisa importar áudio, se for SMS, preciso colocar o texto do SMS na tab SMS.`,
    'campaign.audio': `Somente usado se o tipo de campanha for de voz. O áudio precisa ser compativel com Asterisk. Recomendamos usar GSM. Se usar WAV, tem que ser mono e 8k hz.`,
    'campaign.audio_2': `Se você usar TTS, o nome cadastrado do número será executado entre o áudio 1 e 2.`,
    'campaign.restrict_phone': `Ativando esta opção o MagnusBilling vai verificar se o número que será enviado a chamada está cadastrado no menu Números Bloqueados, se tiver, o sistema vai mudar o status do número para bloqueado e não vai enviar a chamada.`,
    'campaign.auto_reprocess': `Reativar automaticamente todos os números das agendas da campanha quando não tiver mais números ativos.`,
    'campaign.id_phonebook': `Selecione as agendas que esta campanha vai usar.`,
    'campaign.digit_authorize': `Você quer enviar o cliente para algum destino após o audio? Ex. Se o cliente digitar 1 transferir para uma conta SIP, então coloque aqui o número 1, e abaixo selecione SIP, e abaixo a conta VOIP que quer enviar a chamada. Selecione "Qualquer Dígito", para enviar para o destino se o cliente marcar qu.`,
    'campaign.type_0': `Selecionar o tipo de reenvio, esta opção vai redirecionar a chamada para o destino selecionado conforme o tipo escolhido.`,
    'campaign.id_ivr_0': `Selecione uma URA para enviar a chamada, a URA precisa ser do mesmo usuário dono da campanha.`,
    'campaign.id_queue_0': `Selecione uma fila de espera para enviar a chamada, a fila de espera precisa ser do mesmo usuário dono da campanha.`,
    'campaign.id_sip_0': `Selecione uma conta SIP para enviar a chamada, a conta SIP precisa ser do mesmo usuário dono da campanha.`,
    'campaign.extension_0': `Clique para mais detalhes||Temos duas opcōes, conforme o tipo selecionado, personalizado ou grupo.

* Grupo, o nome do grupo colocado aqui, deve ser exatamente o mesmo do grupo das contas SIP que deseja receber as chamadas, vai chamar todas as contas SIP do grupo. 
* Personalizado, então é possível a execução de qualquer opção válida do comando DIAL do asterisk, exemplo: SIP/contaSIP,45,tTr.`,
    'campaign.record_call': `Gravar chamadas data campanha. Será gravado somente se a chamada for transferida.`,
    'campaign.daily_start_time': `Hora que a campanha vai iniciar o envio.`,
    'campaign.daily_stop_time': `Hora que a campanha vai parar o envio.`,
    'campaign.monday': `Ativando esta opção o sistema vai enviar chamadas desta campanha nas segundas feiras.`,
    'campaign.tuesday': `Ativando esta opção o sistema vai enviar chamadas desta campanha nas terças feiras.`,
    'campaign.wednesday': `Ativando esta opção o sistema vai enviar chamadas desta campanha nas quartas feiras.`,
    'campaign.thursday': `Ativando esta opção o sistema vai enviar chamadas desta campanha nas quintas feiras.`,
    'campaign.friday': `Ativando esta opção o sistema vai enviar chamadas desta campanha nas sextas feiras.`,
    'campaign.saturday': `Ativando esta opção o sistema vai enviar chamadas desta campanha nos sábados.`,
    'campaign.sunday': `Ativando esta opção o sistema vai enviar chamadas desta campanha nos domingos.`,
    'campaign.frequency': `Quantas chamadas o sistema deverá gerar por minuto nesta campanha.||Este valor será divido por 60 segundos, e as chamadas serão enviadas durante o minuto, e nao todas de uma vez.`,
    'campaign.max_frequency': `Este é o valor máximo que o cliente poderá alterar. Se você colocar 50, o usuário poderá alterar, desde que um valor igual ou menor que 50.`,
    'campaign.nb_callmade': `Tempo do áudio da campanha, usado para controlar quantidade de chamadas considerada sucesso.`,
    'campaign.enable_max_call': `Se ativado, MagnusBilling vai verificar quantas chamadas já foram realizadas e tiveram a duração igual à duração do áudio.  Se a quantidade for igual ou maior que o valor colocado no próximo campo , a campanha será desativada.`,
    'campaign.secondusedreal': `Máximo de chamadas completas. Precisa ativar o campo acima.`,
    'campaign.description': `Este campo tem uso diferente dependendo se a campanha é VOZ ou SMS.||Tipos possíveis:

* VOZ, neste caso este campo é simplesmente a descrição da campanha. 
* SMS, quando a campanha for do tipo SMS, então o texto colocado aqui será o SMS que será enviado aos números das agendas da campanha. 

No caso de SMS, você pode usar a variável %name% onde você deseja usar o nome do dono do número, exemplo:

Ola %name% temos uma promoção para você.....

Então digamos que tenha cadastrado na agenda utilizada por esta campanha uma lista de números contendo número e nome.

5511998844334,Paulo Ricardo
5511974635734,João Matos

Então para o número 5511998844334 a mensagem enviada será. 
Ola Paulo Ricardo temos uma promoção para você.....

e para 

5511974635734 a mensagem enviada será. 
Ola João Matos temos uma promoção para você.....

.`,
    'campaign.tts_audio': `Com está opção de TTS, o sistema vai gerar o áudio 1 da campanha via TTS, text to speech, tradução livre, texto para áudio||Para que está opção funcione, será necessário a configuração da url TTS no menu Configurações, sub menu Ajustes, opção Tts URL.

Clique neste link para saber mais cobre como configurar TTS no Magnusbilling https://wiki.magnusbilling.org/pt_BR/source/tts.html
.`,
    'campaign.tts_audio2': `Mesma função do campo campo anterior, mas para o áudio 2. Lembra que entre o áudio 1 e 2, o TTS executa o nome importado nos números.`,
    //CAMPAIGNS DASHBOARD
    'campaigndashboard.name': `Nome da campanha.`,
    //CHAMADAS POR MINUTO
    'campaignlog.total': `Total de chamadas.`,
    //POLLS
    'campaignpoll.id_campaign': `Selecione a campanha que esta enquete será executa.`,
    'campaignpoll.name': `Nome para a enquete, este nome é somente para seu contro.`,
    'campaignpoll.repeat': `Quantas vezes o MagnusBilling deve repetir o áudio da enquete caso o cliente não digite nenhuma opção ou digite uma opção inválida.||O que é opção inválida?

É quando a opção digitada pelo cliente está vazia na TAB opções. Conforme a imagem abaixo.

.. image:: ../img/pool_blank.png
        :scale: 100%

.`,
    'campaignpoll.request_authorize': `Em alguns casos, é necessário solicitar autorização para executar a enquete, nestes casos, deixe está opção para sim||Um exemplo de caso seria:

Digamos que seja necessário enviar uma campanha com o seguinte áudio.


    Ola, temos uma oferta incrível para você. Se deseja escutar digite 1.

caso o cliente digitar 1, executar o áudio.


    Que bom que não perdeu esta chance de contratar seu plano de saúde …...

Neste caso, o áudio “Ola, temos uma oferta incrível para você. Se deseja escutar digite 1” seria o áudio da campanha.

E o áudio “Que bom que não perdeu esta chance de contratar seu plano de saúde …...” seria o áudio da enquete.

As opções, solicitar autorização deverá ser SIM e a opção dígito para autorizar deve ser 1.

Neste exemplo somente seria executado áudio da enquete caso o cliente digitar a tecla 1, caso contrário a chamada seria finalizada.
.`,
    'campaignpoll.digit_authorize': `Dígito que para autorizar a execução da enquete.`,
    'campaignpoll.arq_audio': `Arquivo de áudio, lembre-se que somente é valido áudios em GSM ou WAV 8khz mono.`,
    'campaignpoll.description': `Descrição para a enquete.`,
    'campaignpoll.option0': `Descreva a opção||Vamos supor que uma enquete política.

Onde a pergunta é:
Nas próximas eleições em quem você votaria?
    Digite 1 se você votaria no Roberto Matos
    Digite 2 se você votaria no Heleno Souza
    Digite 3 se você votaria na Roberta Silva

Neste exemplo você completaria as opções da seguinte forma


.. image:: ../img/poll_options.png
    :scale: 100% 

Estas opções será útil para ver os relatórios no menu Relatório de Enquete

.`,
    'campaignpoll.option1': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option2': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option3': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option4': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option5': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option6': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option7': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option8': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option9': `Descreva a opção, veja a descrição da opção 0.`,
    'campaignpoll.option10': ``,
    //POLLS REPORTS
    'campaignpollinfo.number': `Número da pessoa que votou.`,
    'campaignpollinfo.resposta': `Opção votada.`,
    //RELATóRIO DE CAMPANHAS
    'campaignreport.idCampaignname': ``,
    //NúMEROS RESTRITOS
    'campaignrestrictphone.number': `Número a ser bloqueado. É necessário ativar a opção números bloqueados na campanha.`,
    'campaignrestrictphone.description': `Descrição`,
    //AJUSTES
    'configuration.config_value': `Valor. Clique para ler sobre as opções deste menu.|https://wiki.magnusbilling.org/pt_BR/source/config.html.`,
    'configuration.config_description': `Descrição. Clique para ler sobre as opções deste menu.|https://wiki.magnusbilling.org/pt_BR/source/config.html.`,
    //DIDS
    'did.did': `O número exatamente como chega no Asterisk. Você também pode usar intervalos. Examplo: 551140040001-551140040009. Neste exemplo criar os DIDS 551140040001 ao 551140040009.`,
    'did.country': `País`,
    'did.record_call': `Gravar chamadas deste DID. Será gravado independente do destino da chamada.`,
    'did.activated': `Somente os números ativos podem receber chamadas.`,
    'did.callerid': `Coloque aqui CallerID name, deixe em branco para usar o que vem do provedor do DID.`,
    'did.connection_charge': `Custo de ativaçao. Este custo será descontado do cliente somente no momento que o DID é vinculado ao usuário.`,
    'did.fixrate': `Custo mensal. Este valor será descontado automaticamente todos os meses do saldo do cliente. Se o cliente não tiver crédito o DID é cancelado automaticamente.`,
    'did.connection_sell': `Este é o valor que será cobrado em cada chamada, simplesmente por atender a chamada.`,
    'did.minimal_time_buy': `Tempo mínimo para tarifar o custo do DID. Ex. Se colocar 3, qualquer chamada com tempo menor que 3 não será tarifado.`,
    'did.buyrateinitblock': `Tempo mínimo em segundos para tarifar o custo do DID. Ex, se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.`,
    'did.buyrateincrement': `Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo de custo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.`,
    'did.minimal_time_charge': `Tempo mínimo para tarifar o DID. Ex. Se colocar 3, qualquer chamada com tempo menor que 3 não será tarifado.`,
    'did.initblock': `Tempo mínimo em segundos para tarifar. Ex, se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.`,
    'did.increment': `Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.`,
    'did.charge_of': `Esta opção é para quando o DID tiver custo, neste caso poderá cobrar do usuário dono do DID, ou somente permitir chamadas de números cadastrado no menu CallerID.||Neste caso, o custo será cobrado do usuário ao qual o número foi atrelado.`,
    'did.calllimit': `Limite de chamadas simultâneas para este DID.`,
    'did.id_server': `Servidor. Somente usado quando você usa SIP PROXY.`,
    'did.description': `Usado para seu controle interno.`,
    'did.expression_1': `Esta é uma Expressão regular para tarifar o DID conforme o número de quem liga para o DID||Vamos analisar um exemplo real:

Digamos que queremos cobrar 0.10 quando recebemos uma chamada de um telefone fixo, e 0.20 se for de um celular, e bloquear qualquer outro formato.

Neste exemplo vamos criar regras para identificar o CallerID nos formatos 0 DDD número, DDD número ou 55 DDD número.

Veja na imagem abaixo como ficaria.

.. image:: ../img/did_regex.png
    :scale: 100% 


Expressão regular para celular
^[1-9][0-9]9\\d{8}$|^0[1-9][0-9]9\\d{8}$|^55[1-9][0-9]9\\d{8}$

Expressão regular para fixo
^[1-9][0-9]\\d{8}$|^0[1-9][0-9]\\d{8}$|^55[1-9][0-9]\\d{8}$



.`,
    'did.buy_rate_1': `Preço por minuto de compra se validar a Expressão regular acima.`,
    'did.selling_rate_1': `Preço por minuto a ser cobrado se validar a Expressão regular acima.`,
    'did.block_expression_1': `Se colocar como SIM, e o número de quem ligou for validado com a Expressão regular acima, a chamada será desligada imediatamente.`,
    'did.send_to_callback_1': `Envia a chamada para CallBack se o número for validado com a Expressão regular acima||Como a chamada será enviada para um CallBack, então a chamada será desligada imediatamente. 
E se todas as configurações estiverem corretas, o CallBack este executado e o telefone do cliente tocará.`,
    'did.expression_2': `Igual a opção 1. Clique para mais informaçōes.|https://wiki.magnusbilling.org/pt_BR/source/modules/did/did.html#did-expression-1.`,
    'did.buy_rate_2': `Preço por minuto de compra se validar a Expressão regular acima.`,
    'did.selling_rate_2': `Preço por minuto a ser cobrado se validar a Expressão regular acima.`,
    'did.block_expression_2': `Se colocar como SIM, e o número de quem ligou for validado com a Expressão regular acima, a chamada será desligada imediatamente.`,
    'did.send_to_callback_2': `Envia a chamada para CallBack se o número for validado com a Expressão regular acima||Como a chamada será enviada para um CallBack, então a chamada será desligada imediatamente. 
E se todas as configurações estiverem corretas, o CallBack este executado e o telefone do cliente tocará.`,
    'did.expression_3': `Igual a opção 1. Clique para mais informaçōes.|https://wiki.magnusbilling.org/pt_BR/source/modules/did/did.html#did-expression-1.`,
    'did.buy_rate_3': `Preço por minuto de compra se validar a Expressão regular acima.`,
    'did.selling_rate_3': `Preço por minuto a ser cobrado se validar a Expressão regular acima.`,
    'did.block_expression_3': `Se colocar como SIM, e o número de quem ligou for validado com a Expressão regular acima, a chamada será desligada imediatamente.`,
    'did.send_to_callback_3': `Envia a chamada para CallBack se o número for validado com a Expressão regular acima||Como a chamada será enviada para um CallBack, então a chamada será desligada imediatamente. 
E se todas as configurações estiverem corretas, o CallBack este executado e o telefone do cliente tocará.`,
    'did.cbr': `Ativa o CallBack Pro.`,
    'did.cbr_ua': `Executar um áudio.`,
    'did.cbr_total_try': `Quantas vezes o sistema vai tentar retornar para o cliente?.`,
    'did.cbr_time_try': `Intervalo de tempo entre cada tentativa, em minutos.`,
    'did.cbr_em': `Executar o áudio antes de atender. O provedor do DID precisa aceitar EarlyMedia.`,
    'did.TimeOfDay_monFri': `Ex: sua trabalha de 09 as 12 e de 14h às 18h, e dentro deste horário você quer executar o callback e retornar a chamada para a pessoa que ligou, então coloque 09:00-12:00|14:00-18:00, os intervalos são separados por |.`,
    'did.TimeOfDay_sat': `Mesma regra só que para sábados.`,
    'did.TimeOfDay_sun': `Mesma regra só que para domingos.`,
    'did.workaudio': `Áudio que será executado quando alguém ligar dentro do horário de atendimento.`,
    'did.noworkaudio': `Áudio que será executado quando ligar fora do horário de atendimento.`,
    'did.agent_client_rate_2': ``,
    'did.agent_client_rate_3': ``,
    'did.agent_client_rate_1': ``,
    //DESTINO DE DIDS
    'diddestination.id_did': `Selecione o DID para criar o novo destino.`,
    'diddestination.id_user': `Usuário que será o dono deste DID.`,
    'diddestination.activated': `Somente destinos ativos serão usados.`,
    'diddestination.priority': `Você pode criar até 5 destino para o mesmo DID. Se a chamada não completa no 1º tenta o 2º, até completar. .`,
    'diddestination.voip_call': `Tipo de destinos. Esta opção vai redirecionar a chamada para o destino selecionado conforme o tipo escolhido.`,
    'diddestination.destination': `Usado para seu controle interno.`,
    'diddestination.id_ivr': `Selecione uma URA para enviar a chamada, a URA precisa ser do mesmo usuário dono do DID.`,
    'diddestination.id_queue': `Selecione uma fila de espera para enviar a chamada, a fila de espera precisa ser do mesmo usuário dono do DID.`,
    'diddestination.id_sip': `Selecione uma conta SIP para enviar a chamada, a conta SIP precisa ser do mesmo usuário dono do DID.`,
    'diddestination.context': `Nesta opção poderá ser usado um contexto no formato aceito pelo Asterisk||Como por exemplo:

_X. => 1,Dial(SIP/contavoip,45)
    same => n,Goto(s-\${DIALSTATUS},1)


exten => s-NOANSWER,1,Hangup
exten => s-CONGESTION,1,Congestion
exten => s-CANCEL,1,Hangup
exten => s-BUSY,1,Busy
exten => s-CHANUNAVAIL,1,SetCallerId(4545454545)
exten => s-CHANUNAVAIL,2,Dial(SIP/contavoip2,,T)


NÃO deve ser colocado o nome para o context, pois o nome do contexto será [did-numero-do-did]

Você pode verificar o contexto no arquivo /etc/asterisk/extensions_magnus_did.conf


    .`,
    //HISTóRICO DOS DID
    'didhistory.did': `DID`,
    'didhistory.username': `Usuário`,
    'didhistory.month_payed': `Meses pagos`,
    'didhistory.reservationdate': `Data reservado`,
    'didhistory.description': `Descrição`,
    //USO DE DIDS
    'diduse.id_did': `Número DID.`,
    'diduse.month_payed': `Total de meses pagos.`,
    'diduse.reservationdate': `Dia que o DID foi reservado para o usuário.`,
    //FAIL2BAN
    'firewall.ip': `IP.`,
    'firewall.action': `Com está opção em SIM, o IP será colocado na lista de ip-blacklist do fail2ban e ficará bloqueado para sempre.||A opção NÃO vai bloquear o IP momentaneamente conforme os parâmetros no arquivo /etc/fail2ba/jail.local.

    Por padrão o IP ficará bloqueado por 10 minutos.`,
    'firewall.description': `Estas informaçōes são capturadas do arquivo de log /var/log/fail2ban.log||É possível acompanhar esse LOG com o comando 


tail -f /var/log/fail2ban.log.`,
    //GAUTHENTICATOR
    'gauthenticator.username': `Usuário que deseja ativar TOKEN.`,
    'gauthenticator.googleAuthenticator_enable': `Após ativar o TOKEN para o usuário, somente será possível logar usando o TOKEN gerado pelo APP do Google Aunthenticator.||Após ativar o TOKEN, no próximo login do usuário será solicitado que escaneie o QR CODE conforme a imagem abaixo

.. image:: ../img/token.png
    :scale: 100% 

Para escanear o código é necessário instalar a APP Google authenticator, este APP está disponível para download na loja de aplicativos IOS e Android.

É importante guardar o código manual mostrado na imagem, pois será com este código que será possível ativar o token em outro celular caso necessário.


Com o token do APP Google Aunthenticator somente será possível logar no painel ou desativar a opção de token.`,
    'gauthenticator.code': `O código é necessário para poder desativar o TOKEN. Caso não tiver mais o código, então será necessário desativar pelo banco de dados.`,
    'gauthenticator.google_authenticator_key': `Está KEY é necessário para poder ativar o TOKEN em outro celular.`,
    //GROUPMODULE
    'groupmodule.id_group': `Grupo de usuário.`,
    'groupmodule.id_module': `Menu.`,
    //GRUPOS PARA CLIENTE
    'groupuser.name': `Nome para o grupo de usuários.`,
    'groupuser.id_user_type': `Tipo de usuário. É importante selecionar o tipo corremtanete. Não adianta chamar o grupo de Admin e selecionar o tipo Cliente.`,
    'groupuser.hidden_prices': `Ocular os valores de compra, venda e lucro para este grupo?`,
    'groupuser.hidden_batch_update': `Ocular o botão atualizar em lote em todos os menus para usuários deste grupo`,
    //GRUPOS ADMINISTRADORES
    'groupusergroup.name': `Nome do Grupo.`,
    'groupusergroup.user_prefix': `Preenchendo este campo, todos os usuários criados por um administrador que usa este grupo será iniciado com este prefixo.`,
    'groupusergroup.id_group': `Quais os grupos de cliente este grupo de administrador terá acesso.||Quando um administrador que está neste grupo logar no sistema, ele somente vai ver os dados dos clientes dos grupos selecionados aqui.`,
    //FERIADOS
    'holidays.name': `Nome para o feriado`,
    'holidays.day': `Dia do feriado`,
    //IAX
    'iax.id_user': `Usuário ao qual está conta IAX vai pertencer.`,
    'iax.username': `Usuário que será usado para autenticar no softphone.`,
    'iax.secret': `Senha que será usado para autenticar no softphone.`,
    'iax.callerid': `Este é o CallerID que será mostrado no destino, em chamadas externas o provedor precisa permitir CLI para que seja identificado corretamente no destino.`,
    'iax.disallow': `Nesta opção é possível desativar codecs. Use all para desativar todos os codecs e deixar disponível para o usuário somente os que você selecionar abaixo.`,
    'iax.allow': `Codecs que será aceito.`,
    'iax.host': `Dynamic é a opção para deixar o usuário registrar sua conta em qualquer IP. Se você deseja autenticar o usuário por IP, coloque aqui o IP do cliente, deixe a senha em branco e coloque insecure para port/invite na TAB Informaçōes Adicionais.`,
    'iax.nat': `O cliente está atrás de NAT? Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-nat/.`,
    'iax.context': `Este é o contexto que a chamada será processada, por padrão é billing. Somente alterar se tiver conhecimento sobre Asterisk.`,
    'iax.qualify': `Enviar pacote OPTION para verificar se o usuário está online.||Sintaxe:

qualify = xxx | no | yes

onde XXX é o número de milissegundos usados. Se sim, o tempo configurado no sip.conf é usado, padrão é usado 2 segundos.

Se você ativar o qualify, o Asterisk enviará um comando OPTION o SIP peer regularmente para verificar se o dispositivo ainda está online. 
Se o dispositivo não responder o OPTION dentro do período configurado (ou padrão) (em ms), o Asterisk considera o dispositivo off-line para chamadas futuras.

Este status pode ser verificado pela função sip show peer XXXX, esta função somente fornecerá informações de status para SIP peer que possuem qualify = yes.`,
    'iax.dtmfmode': `Tipo de DTMF. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
    'iax.insecure': `Se o host estiver dynamic está opção precisa estar como NO.Para autenticação por IP alterar para port. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-insecure/.`,
    'iax.type': `Tipo padrão é friend, ou seja pode fazer e receber chamadas. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-type/.`,
    'iax.calllimit': `Total de chamadas simultâneas permitida para esta conta IAX.`,
    //URAS
    'ivr.name': `Nome para a URA.`,
    'ivr.id_user': `Usuário dono da URA.`,
    'ivr.monFriStart': `Intervalo de atendimento de segunda a sexta, pode ser configurado múltiplos horarios||Exemplo:

Digamos que o horário de atendimento é de 08h às 12h e das 14h às 19h. Neste caso a regra ficaria

08:00-12:00|14:00-19:00

.`,
    'ivr.satStart': `Intervalo de atendimento aos sábados, pode ser configurado múltiplos horários||Exemplo:

Digamos que o horário de atendimento aos sábados é dia de 08h às 13h. Neste caso a regra ficaria

08:00-13:00

.`,
    'ivr.sunStart': `Intervalo de atendimento nos domingos, pode ser configurado múltiplos horarios||Exemplo:

Digamos que o não existe horário de atendimento no domingo. Neste caso a regra ficaria

00:00-00:00

.`,
    'ivr.use_holidays': `Se ativado esta opção então o sistema irá verificar se existe um feriado cadastrado para o dia, se sim, então será executado o audio não trabalhando.`,
    'ivr.workaudio': `Áudio para executar dentro dos horários de atendimento.`,
    'ivr.noworkaudio': `Áudio para executar fora dos horários de atendimento.`,
    'ivr.option_0': `Selecione o destino caso for digitado a opção 0. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_1': `Selecione o destino caso for digitado a opção 1. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_2': `Selecione o destino caso for digitado a opção 2. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_3': `Selecione o destino caso for digitado a opção 3. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_4': `Selecione o destino caso for digitado a opção 4. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_5': `Selecione o destino caso for digitado a opção 5. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_6': `Selecione o destino caso for digitado a opção 6. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_7': `Selecione o destino caso for digitado a opção 7. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_8': `Selecione o destino caso for digitado a opção 8. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_9': `Selecione o destino caso for digitado a opção 9. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_10': `Selecione o destino caso não for digitado nada.`,
    'ivr.direct_extension': `Ativando esta opção será possível digitar uma conta SIP para chamar diretamente.`,
    'ivr.option_out_0': `Selecione o destino caso for digitado a opção 0. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_1': `Selecione o destino caso for digitado a opção 1. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_2': `Selecione o destino caso for digitado a opção 2. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_3': `Selecione o destino caso for digitado a opção 3. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_4': `Selecione o destino caso for digitado a opção 4. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_5': `Selecione o destino caso for digitado a opção 0. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_6': `Selecione o destino caso for digitado a opção 6. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_7': `Selecione o destino caso for digitado a opção 7. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_8': `Selecione o destino caso for digitado a opção 8. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_9': `Selecione o destino caso for digitado a opção 9. Deixe em branco se não desejar nenhuma ação.`,
    'ivr.option_out_10': `Selecione o destino caso não for digitado nada.`,
    'ivr.type_1': ``,
    //LOG DE ACESSOS
    'logusers.id_user': `Usuário que executou a ação.`,
    'logusers.id_log_actions': `Tipo de ação.`,
    'logusers.ip': `IP utilizado para realizar a ação.`,
    'logusers.description': `O que foi feito, normalmente está em JSON.`,
    //MéTODOS DE PAGAMENTO
    'methodpay.show_name': `Nome que será mostrado no painel do cliente.`,
    'methodpay.id_user': `Usuário do método de pagamento. Pode ser criado métodos de pagamento para o administrado ou revendedores.`,
    'methodpay.country': `Somente para referencia.`,
    'methodpay.active': `Ative se quiser deixar disponível para os clientes.`,
    'methodpay.min': `Valor mínimo que deseja aceitar.`,
    'methodpay.max': `Valor máximo que deseja aceitar.`,
    'methodpay.username': `Usuário do método de pagamento.`,
    'methodpay.url': `URL do método de pagamento, na maioria dos métodos está URL já está preconfigurada.`,
    'methodpay.fee': `Taxa cobrada pelo método de pagamento.`,
    'methodpay.pagseguro_TOKEN': `TOKEN do método de pagamento.`,
    'methodpay.P2P_CustomerSiteID': `Este campo é exclusivo para alguns métodos de pagamento.`,
    'methodpay.P2P_KeyID': `Este campo é exclusivo para alguns métodos de pagamento.`,
    'methodpay.P2P_Passphrase': `Este campo é exclusivo para alguns métodos de pagamento.`,
    'methodpay.P2P_RecipientKeyID': `Este campo é exclusivo para alguns métodos de pagamento.`,
    'methodpay.P2P_tax_amount': `Este campo é exclusivo para alguns métodos de pagamento.`,
    'methodpay.client_id': `Este campo é exclusivo para alguns métodos de pagamento.`,
    'methodpay.client_secret': `Este campo é exclusivo para alguns métodos de pagamento.`,
    'methodpay.payment_method': ``,
    //MENUS
    'module.text': `Nome do menu.`,
    'module.icon_cls': `Icone, padrão font awesome V4.`,
    'module.id_module': `Menu ao qual este menu pertence. Caso estiver em branco é porque é um menu principal.`,
    'module.priority': `Ordem em que o menu vai aparecer no menu.`,
    //PACOTES GRáTIS
    'offer.label': `Nome para o pacote gratís.`,
    'offer.packagetype': `Tipo do pacote, pode ser de 3 tipos. Chamadas ilimitadas, chamadas gratuitas ou Segundos gratís.`,
    'offer.freetimetocall': `Neste campo é onde deve ser configurado a quantidade disponível no pacote.||Exemplo:

* Chamadas ilimitadas: Nesta opção este campo fica sem uso, pois se está permitindo ligar de forma ilimitada, sem nenhum controle.
* Chamadas gratuitas: Colocar a quantidade de chamadas que deseja dar gratís.
* Segundos gratís: Colocar quantos segundos deseja permitir o cliente chamar.

.`,
    'offer.billingtype': `Este é o período que será calculado o pacote.||Veja a descrição:

* Mensal: O sistema vai verificar se do dia de ativação do plano + 30 dias o cliente chegou ao limite do pacote.
* Semanal: O sistema vai verificar se do dia de ativação do plano + 7 dias o cliente chegou ao limite do pacote.

Quando o cliente chegar no limite do pacote, o MagnusBilling vai verificar se o usuário tem crédito para completar a chamada, caso o usuário não tenha crédito a chamada será finalizada.

.`,
    'offer.price': `Preço que será cobrado mensalmente do cliente.||Se no dia do vencimento o cliente não tem saldo suficiente para pagar o pacote o MagnusBilling vai cancelar o pacote automaticamente.

No menu configurações, ajustes, existe uma opção chamada Notificação de Pacote de Oferta, este valor é quantos dias antes do vencimento do pacote o sistema tentará cobrar a mensalidade, caso o cliente não tiver saldo, então o MagnusBilling vai enviar um Email para o cliente informando a falta de crédito.

O email pode ser editado no menu, modelos de Email, tipo, plan_unpaid, assunto Aviso de Vencimento de Plano Mensal.

Para o envio de email, é necessário a configuração do SMTP no menu SMTP.


Para saber como funciona os pacotes gratís veja o link https://wiki.magnusbilling.org/pt_BR/source/offer.html.

    .`,
    'offer.initblock': `Tempo mínimo em segundos para tarifar a venda. Este valor irá subscrever os valores das tarifa do plano do cliente.`,
    'offer.billingblock': `Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Este valor irá subscrever os valores das tarifa do plano do cliente.`,
    'offer.minimal_time_charge': `Tempo mínimo para tarifar. Se colocar 3, só vai tarifar chamadas que o tempo for maior ou igual que 3 segundos.`,
    //RELATóRIO DE PACOTES
    'offercdr.id_user': `Usuário que realizou a chamada.`,
    'offercdr.id_offer': `Nome do pacote de gratís.`,
    'offercdr.used_secondes': `Duração da chamada.`,
    'offercdr.date_consumption': `Data de hora da chamada.`,
    //USO DE PACOTES
    'offeruse.id_user': `Usuário que realizou a chamada.`,
    'offeruse.id_offer': `Nome do pacote de gratís.`,
    'offeruse.month_payed': `Meses que foram pagos.`,
    'offeruse.reservationdate': `Data e hora que foi cancelado o pacote gratís.`,
    //PHONEBOOKS
    'phonebook.name': `Nome da agenda.`,
    'phonebook.status': `Status da agenda.`,
    'phonebook.description': `Descrição para a agenda, somente para controle próprio.`,
    //NúMEROS
    'phonenumber.id_phonebook': `Agenda que esse número pertence.`,
    'phonenumber.number': `Nümero para enviar o torpedo/sms. Deve ser usado sempre no formato 55 DDD número.`,
    'phonenumber.name': `Nome do dono do número, usado para TTS ou SMS.`,
    'phonenumber.doc': `Documento, campo não obrigatório.`,
    'phonenumber.city': `Cidade do cliente, campo não obrigatório.`,
    'phonenumber.email': `Email, campo não obrigatório.`,
    'phonenumber.status': `MagnusBilling somente tenta enviar quando o status está ativo.||Quando a chamada é enviada para seu provedor, o número fica com status pendente. 
Se a chamada é completada, o status muda para enviado.
Caso contrário ficará como pendente, isso quer dizer que seu tronco rejeitou e completou a chamada por algum motivo.
Se for ativado na campanha a opção números bloqueados, e o número estiver cadastrado no menu torpedo de voz & SMS, submenu números Restritos, o status bloqueado.
Você pode usar o botão processar para reativar os números que estão com status pendente.`,
    'phonenumber.info': `Descrição para a agenda, somente para controle próprio.||Quando for usado enquete, será salvo aqui o número que o cliente digitou.`,
    //PLANOS
    'plan.name': `Nome do plano.`,
    'plan.signup': `Disponibilizar este plano no formulário de registro. Se tiver somente 1 plano os clientes que se registrarem vão usar este plano, se tiver mais de 1, aí o cliente poderá escolher. É necessário ter pelo menos 1 plano com está opção ativada para funcionar o registro.`,
    'plan.ini_credit': `Quanto de crédito você quer dar para clientes que se registram através do formulário de registro.`,
    'plan.play_audio': `Executar áudios para os cliente deste plano ou mandar somente erro? Por exemplo os áudios que acabou o crédito.`,
    'plan.techprefix': `Techprefix é como uma senha para o cliente poder usar mais de uma plano. Por exemplo, digamos que você tem 3 tipos de planos,GSM, TDM e CLI, e quer deixar seu cliente escolher qual plano ele deseja usar. Então coloque techprefix nos planos e solicite ao seu cliente que para usar cada um dos planos e.`,
    'plan.id_services': ``,
    //PREFIXOS
    'prefix.prefix': `Prefixo. Prefixos serão usados para criar as tarifas. EX. 5511.`,
    'prefix.destination': `Nome do destino. EX: Brasil SP.`,
    //PROVEDORES
    'provider.provider_name': `Nome do provedor. Provedor é a empresa que você compra os minutos. O mesmo provedor pode ter vários troncos.`,
    'provider.credit': `A quantidade de crédito que você possuí com seu provedor. Este campo é opcional.`,
    'provider.credit_control': `Se esta opção for ativada os troncos deste provedor serão desativados quando o crédito do provedor ficar em zero.`,
    'provider.description': `Descrição para a agenda, somente para controle próprio.`,
    //PROVEDOR CNL
    'providercnl.id_provider': `Provedor`,
    'providercnl.cnl': `Código CNL`,
    'providercnl.zone': `Zona`,
    //FILAS DE ESPERA
    'queue.id_user': `Usuário dono da fila.`,
    'queue.name': `Nome para a fila.`,
    'queue.language': `Idioma da fila.`,
    'queue.strategy': `Estratégia para a fila.`,
    'queue.ringinuse': `Chamar ou não agentes da fila que estejam em chamada.`,
    'queue.timeout': `Por quanto tempo deve ficar chamando um agente.`,
    'queue.retry': `Tempo em segundos para tentar chamadas outro agente caso o anterior não atender.`,
    'queue.wrapuptime': `Intervalo de tempo em segundos que o agente poderá receber outra chamada.`,
    'queue.weight': `Prioridade de fila. Por exemplo, você tem o mesmo agente em 2 filas, e chega 12 chamadas ao mesmo tempo, o Asterisk vai enviar a chamada da fila com maior prioridade para o agente.`,
    'queue.periodic-announce': `Áudio para os anúncios. Você pode colocar mais de um áudio, separando por  (,). Estes dados devem estar no diretório /var/lib/asterisk/sounds/.`,
    'queue.periodic-announce-frequency': `Frequência que deve executar os anúncios.`,
    'queue.announce-position': `Informar a posição que a pessoa se encontra na fila.`,
    'queue.announce-holdtime': `Deveria ser incluso no anuncio da posição a estimativa de espera?.`,
    'queue.announce-frequency': `A cada quantos segundos deve informar a posição. Deixe em 0 para desativar o anúncio de posição.`,
    'queue.joinempty': `Permitir novas chamadas quando não tiver agente disponível para atender a chamada.`,
    'queue.leavewhenempty': `Desligar as chamadas em espera quando não tiver mais agente livres.`,
    'queue.max_wait_time': `Tempo máximo de espera para ser atendido.`,
    'queue.max_wait_time_action': `Coloque uma Conta VoIP, IVR, Fila de espera ou um canal LOCAL para enviar o cliente caso o tempo máximo de espera for superado. Formatos aceitos: SIP/conta_voip, QUEUE/nome_da_queue, IRV/nome_da_ivr ou LOCAL/extension@context.`,
    'queue.ring_or_moh': `Tocar a música de espera ou tom de chamando quando o cliente estiver aguardando na fila.`,
    'queue.musiconhold': `Importar uma música de espera para esta fila.`,
    //AGENTES DA FILA
    'queuemember.queue_name': `Fila de espera que quer adicionar a conta SIP.`,
    'queuemember.interface': `Conta SIP para adicionar como agente da fila de espera.`,
    'queuemember.paused': `Agentes pausados não receberam chamadas, é possível pausar e despausar discando *180 para pausar, e *181 para despausar.`,
    //TARIFAS
    'rate.id_plan': `O plano que você quer adicionar esta tarifa.`,
    'rate.id_prefix': `Selecione o prefixo que quer criar a tarifa.`,
    'rate.id_trunk_group': `Grupo de troncos que será usado para enviar esta chamada.`,
    'rate.rateinitial': `Preço de venda por minuto para este destino.`,
    'rate.initblock': `Tempo mínimo em segundos para tarifar a venda. Ex, se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.`,
    'rate.billingblock': `Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.`,
    'rate.minimal_time_charge': `Tempo mínimo para tarifar. Se colocar 3, só vai tarifar chamadas que o tempo for maior ou igual que 3 segundos.`,
    'rate.additional_grace': `Tempo para adicionar na duração da chamada. Se colocar 10, será adicionar 10 segundos no tempo de todas as chamadas, isso afeta a tarifação.`,
    'rate.connectcharge': `Valor cobrado ao conectar a chamada. Será somado ao valor cobrado por minuto.`,
    'rate.package_offer': `Ative esta opção se você quer que esta tarifa seja usada nos pacotes grátis.`,
    'rate.status': `Desativando a tarifa, o MagnusBilling vai desconsiderar completamente está tarifa. Ou seja, deletar ou desativar terá o mesmo efeito.`,
    //TARIFAS
    'ratecallshop.dialprefix': `Prefixo que quer criar a tarifa. Esta tarifa será exclusiva para o CALLSHOP.`,
    'ratecallshop.destination': `Nome do destino para este prefixo.`,
    'ratecallshop.buyrate': `Valor cobrado por minuto do cliente do Callshop.`,
    'ratecallshop.minimo': `Tempo mínimo em segundos para tarifar. Ex: se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.`,
    'ratecallshop.block': `Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.`,
    'ratecallshop.minimal_time_charge': `Tempo mínimo para tarifar. Ex: Se colocar 3, só vai tarifar chamadas que o tempo for maior ou igual que 3 segundos.`,
    //TARIFAS PROVEDORES
    'rateprovider.id_provider': `Provedor.`,
    'rateprovider.id_prefix': `Prefixo.`,
    'rateprovider.buyrate': `Valor pago ao provedor por minuto.`,
    'rateprovider.buyrateinitblock': `Tempo mínimo em segundos para tarifar. Ex, se colocar 30, qualquer chamada que durar menos de 30 segundos, será cobrado 30 segundos.`,
    'rateprovider.buyrateincrement': `Bloco de quantos em quantos segundos irá cobrar após o tempo mínimo. Ex: se colocar 6, quer dizer que sempre vai arredondar de 6 em 6 segundos, ou seja, uma chamada durou 32s, vai cobrar 36s.`,
    'rateprovider.minimal_time_buy': `Tempo mínimo para tarifar. Se colocar 3, só vai tarifar chamadas que o tempo for maior ou igual que 3 segundos.`,
    //RECARGAS
    'refill.id_user': `Usuário que será realizado a recarga.`,
    'refill.credit': `Valor da recarga. Pode ser valor positivo ou negativo, caso o valor for negativo, vai retirar o valor da recarga do crédito do cliente.`,
    'refill.description': `Descrição para a agenda, somente para controle próprio.`,
    'refill.payment': `Esta opção é somente para seu controle. O crédito será liberado para o cliente mesmo colocando como NÃO.`,
    'refill.date': ``,
    'refill.invoice_number': `Número da fatura.`,
    'refill.image': ``,
    //RECARGA DE PROVEDORES
    'refillprovider.id_provider': `Nome do provedor.`,
    'refillprovider.credit': `Valor da recarga.`,
    'refillprovider.description': `Usado para seu controle interno.`,
    'refillprovider.payment': `Esta opção é somente para seu controle. O crédito será liberado para o cliente mesmo colocando como NÃO.`,
    //NúMEROS BLOQUEADOS
    'restrictedphonenumber.id_user': `Usuário que deseja cadastrar o número.`,
    'restrictedphonenumber.number': `Número.`,
    'restrictedphonenumber.direction': `Será analisado em ligaçōes conforme selecionado.`,
    //SENDCREDITPRODUCTS
    'sendcreditproducts.country': `País.`,
    'sendcreditproducts.operator_name': `Nome da operadora.`,
    'sendcreditproducts.operator_id': `Id da operadora.`,
    'sendcreditproducts.SkuCode': `SkuCode.`,
    'sendcreditproducts.product': `Produto.`,
    'sendcreditproducts.send_value': `Valor a ser enviado.`,
    'sendcreditproducts.wholesale_price': `Preço de venda.`,
    'sendcreditproducts.provider': `Provedor.`,
    'sendcreditproducts.status': `Status.`,
    'sendcreditproducts.info': `Usado para seu controle interno.`,
    'sendcreditproducts.retail_price': ``,
    'sendcreditproducts.method': ``,
    //SENDCREDITRATES
    'sendcreditrates.idProductcountry': `País.`,
    'sendcreditrates.idProductoperator_name': `Nome da operadora.`,
    'sendcreditrates.sell_price': `Preço de venda.`,
    //SEND CREDIT SUMMARY
    'sendcreditsummary.id_user': `Usuário.`,
    //SERVIDORES
    'servers.name': `Nome para o servidor.`,
    'servers.host': `IP do servidor. Clique para saber mais sobre servidores Slave e Proxy|https://magnussolution.com/br/servicos/auto-desempenho/servidor-slave.html.`,
    'servers.public_ip': `Ip Público.`,
    'servers.username': `Usuário para conectar no servidor.`,
    'servers.password': `Senha para conectar no servidor.`,
    'servers.port': `Porta para conectar no servidor.`,
    'servers.sip_port': `Porta SIP que o servidor usar.`,
    'servers.type': `Tipo de servidor.`,
    'servers.weight': `Esta opção é para balancear as chamadas por peso.||Exemplo. 

Digamos que tenha 1 servidor MagnusBilling 3 servidores slaves, e você deseja enviar o dobro de chamadas para cada slave, comparado com o MagnusBilling, então, é só colocar no servidor MagnusBilling o peso 1, e nos slaves peso 2.

.`,
    'servers.status': `O proxy somente envia chamadas para servidores ativos e com peso maior que 0.`,
    'servers.id_server': ``,
    'servers.description': `Usado para seu controle interno.`,
    //SERVIçOS
    'services.type': `Tipo de serviço.`,
    'services.name': `Nome para o serviço.`,
    'services.calllimit': `Limite de chamadas simultâneas.`,
    'services.disk_space': `Coloque o total de espaço em disco em GB.`,
    'services.sipaccountlimit': `Quantidade máxima de contas SIP este cliente poderá criar.`,
    'services.price': `Custo mensal para descontar do cliente que ativar este serviço.`,
    'services.return_credit': `Caso o serviço seja cancelado antes do dia do vencimento, e esta opção esteja como sim, será devolvido o valor proporcional dos dias não usado ao crédito do cliente.`,
    'services.description': `Usado para seu controle interno.`,
    //USO DE SERVIçOS
    'servicesuse.id_user': `Usuário dono do serviço.`,
    'servicesuse.id_services': `Serviço.`,
    'servicesuse.price': `Valor do serviço.`,
    'servicesuse.method': `Forma de pagamento.`,
    'servicesuse.month_payed': `Meses pagos`,
    'servicesuse.reservationdate': `Dia que o serviço foi ativado.`,
    'servicesuse.termination_date': `Termino do contrato`,
    'servicesuse.contract_period': `Tempo de contrato`,
    //CONTAS SIP
    'sip.id_user': `Usuário ao qual esta conta SIP está vinculada.`,
    'sip.defaultuser': `Usuário que será usado para logar nos softphones ou qualquer dispositivo SIP.`,
    'sip.secret': `Senha que será usado para logar nos softphones ou qualquer dispositivo SIP.`,
    'sip.callerid': `Este é o CallerID que será mostrado no destino, em chamadas externas o provedor precisa permitir CLI para que seja identificado corretamente no destino.`,
    'sip.alias': `Alias é um número para facilitar a discagem, pode colocar qualquer número. Pode repetir os mesmos números para contas diferente.`,
    'sip.disallow': `Nesta opção é possível desativar codecs. Use all para desativar todos os codecs e deixar disponível para o usuário somente os que você selecionar abaixo.`,
    'sip.allow': `Selecione os codecs que o tronco aceita.`,
    'sip.host': `Dynamic é a opção para deixar o usuário registrar sua conta em qualquer IP. Se você deseja autenticar o usuário por IP, coloque aqui o IP do cliente, deixe a senha em branco e coloque insecure para port,invite na TAB Informaçōes Adicionais.`,
    'sip.sip_group': `Quando enviar um chamada de um DID, ou campanha para um grupo, será chamado todas as contas SIP que estiverem no grupo. Você pode criar os grupos com qualquer nome.||

Também usado para capturar chamada com *8, deve ser configurada a opção pickupexten = *8  no arquivo feature.conf.
.`,
    'sip.videosupport': `Ativa chamadas de vídeo.`,
    'sip.block_call_reg': `Bloquear chamadas usando REGEX. Para bloquear chamadas para celular é so colocar ^55\\d\\d9. Click para ir ao site que testa REGEX.|https://regex101.com.`,
    'sip.record_call': `Grava as chamadas saintes desta conta SIP.`,
    'sip.techprefix': `Opção útil para quando for necessário autenticar mais de um cliente via IP que usa o mesmo IP. Comum em BBX multi tenant.`,
    'sip.cnl': ``,
    'sip.description': `Descrição`,
    'sip.nat': `O cliente está atrás de NAT? Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-nat/.`,
    'sip.directmedia': `Se ativado, Asterisk vai tentar enviar a mídia RTP direto entre seu cliente e seu provedor. Precisa ativar no tronco também. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-canreinvite/.`,
    'sip.qualify': `Enviar pacote OPTION para verificar se o usuário está online.||Sintaxe:

qualify = xxx | no | yes

onde XXX é o número de milissegundos usados. Se sim, o tempo configurado no sip.conf é usado, padrão é usado 2 segundos.

Se você ativar o qualify, o Asterisk enviará um comando OPTION o SIP peer regularmente para verificar se o dispositivo ainda está online. 
Se o dispositivo não responder o OPTION dentro do período configurado (ou padrão) (em ms), o Asterisk considera o dispositivo off-line para chamadas futuras.

Este status pode ser verificado pela função sip show peer XXXX, esta função somente fornecerá informações de status para SIP peer que possuem qualify = yes.`,
    'sip.id_trunk_group': `::::::ATENÇÃO::::::. Selecionando um grupo de tronco aqui, será ignorado o grupo de tronco das tarifas e sempre será usado este grupo de tronco. Somente selecione um grupo de troncos aqui se você realmente desaja que todas as chamadas desta conta SIP sejam enviadas para este grupo de troncos`,
    'sip.context': `Este é o contexto que a chamada será processada, por padrão é billing. Somente alterar se tiver conhecimento sobre Asterisk.`,
    'sip.dtmfmode': `Tipo de DTMF. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
    'sip.insecure': `Se o host estiver dynamic está opção precisa estar como NO, para o IP authentication alterar para port,invite.`,
    'sip.deny': `Você pode limitar o tráfego SIP de um determinado IP ou rede.`,
    'sip.permit': `Você pode permitir o tráfego SIP de um determinado IP ou rede.`,
    'sip.type': `Tipo padrão é friend, ou seja pode fazer e receber chamadas. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-type/.`,
    'sip.allowtransfer': `Permite esta conta VOIP fazer transferência. O código para transferência é *2 + ramal. É necessário ativar a opção atxfer => *2 no arquivo features.conf do Asterisk.`,
    'sip.ringfalse': `Ativa ring falso. Adiciona rR do comando Dial.`,
    'sip.calllimit': `Total de chamadas simultâneas permitida para esta conta SIP.`,
    'sip.mohsuggest': `Música de espera para esta conta SIP.`,
    'sip.url_events': `.`,
    'sip.addparameter': `Os parâmetros colocado aqui irão substituir os parâmetros padrão do sistema, e também os do tronco, caso houver.`,
    'sip.amd': `.`,
    'sip.type_forward': `Tipo de destino do reenvio. Este reenvio não funciona em fila de espera.`,
    'sip.id_ivr': `Selecione a URA que deseja enviar para as chamadas caso a conta SIP não atender.`,
    'sip.id_queue': `Selecione a fila de espera que deseja enviar para as chamadas caso a conta SIP não atender.`,
    'sip.id_sip': `Selecione a conta SIP que deseja enviar para as chamadas caso a conta SIP não atender.`,
    'sip.extension': `Clique para mais detalhes||Temos três opcōes, conforme o tipo selecionado, grupo, número ou personalizado.

* Grupo, o nome do grupo colocado aqui, deve ser exatamente o mesmo do grupo das contas SIP que deseja receber as chamadas, vai chamar todas as contas SIP do grupo. 
* Personalizado, é possível a execução de qualquer opção válida do comando DIAL do Asterisk, exemplo: SIP/contaSIP,45,tTr
* Número, pode ser um número fixo ou celular, deve estar no formato 55 DDD número.
.`,
    'sip.dial_timeout': `Tempo em segundos que será aguardado para atender a chamada. Após este tempo será executado o encaminhamento caso for configurado.`,
    'sip.voicemail': `Ativar voicemail. É necessário a configuração do SMTP no Linux para receber o email com a mensagem. Clique aqui para saber como configurar o SMTP de forma simples.|https://www.magnusbilling.org/br/blog-br/9-novidades/25-configurar-ssmtp-para-enviar-voicemail-no-asterisk.html.`,
    'sip.voicemail_email': `Email que será enviado o email com a gravação.`,
    'sip.voicemail_password': `Senha do VOICEMAIL. É possível entrar no VOICEMAIL digitando *111.`,
    'sip.sip_config': ``,
    'sip.sipshowpeer': `sip show peer.`,
    'sip.forwardtype': ``,
    //SIP TRACE
    'siptrace.head': `Corpo da mensagem SIP.`,
    //ATA LINKSYS
    'sipuras.nserie': `Linksys serial number.`,
    'sipuras.macadr': `Linksys MAC address.`,
    'sipuras.senha_user': `Usuário para entrar na configuração do LinkSys.`,
    'sipuras.senha_admin': `Senha para entrar na configuração do LinkSys.`,
    'sipuras.antireset': `Tenha cuidado. Esta opção desativa o reinicio com o comando *73738#.`,
    'sipuras.Enable_Web_Server': `Tenha cuidado! Se desativado, não será mais possível entrar nas configuraçōes do Linksys.`,
    'sipuras.Dial_Tone': ``,
    'sipuras.Proxy_1': `IP do proxy 1`,
    'sipuras.User_ID_1': `Conta SIP que vai será usado na linha 1 do ATA.`,
    'sipuras.Password_1': `Senha da Conta VoIP.`,
    'sipuras.Use_Pref_Codec_Only_1': `Somente usar o codec preferencial.`,
    'sipuras.Preferred_Codec_1': `Configurar codec preferencial.`,
    'sipuras.Register_Expires_1': `Tempo em segundos que o Linksys fica enviando o REGISTER para o servidor. Se for receber chamadas nesta linha, melhor deixar entre 120 e 480 segundos.`,
    'sipuras.Dial_Plan_1': `Read linksys documentation.`,
    'sipuras.NAT_Mapping_Enable_1_': `Recomendado ativar esta opção se o ATA estiver atrás de NAT.`,
    'sipuras.NAT_Keep_Alive_Enable_1_': `Recomendado ativar esta opção se o ATA estiver atrás de NAT.`,
    'sipuras.Proxy_2': `IP do proxy 2`,
    'sipuras.User_ID_2': `Conta SIP que vai será usado na linha 1 do ATA.`,
    'sipuras.Password_2': `Senha da Conta VoIP.`,
    'sipuras.Use_Pref_Codec_Only_2': `Somente usar o codec preferencial.`,
    'sipuras.Preferred_Codec_2': `Configurar codec preferencial.`,
    'sipuras.Register_Expires_2': `Tempo em segundos que o Linksys fica enviando o REGISTER para o servidor. Se for receber chamadas nesta linha, melhor deixar entre 120 e 480 segundos.`,
    'sipuras.Dial_Plan_2': `Read linksys documentation.`,
    'sipuras.NAT_Mapping_Enable_2_': `Recomendado ativar esta opção se o ATA estiver atrás de NAT.`,
    'sipuras.NAT_Keep_Alive_Enable_2_': `Recomendado ativar esta opção se o ATA estiver atrás de NAT.`,
    'sipuras.STUN_Enable': `Ativar servidor STUN.`,
    'sipuras.STUN_Test_Enable': `Validar o servidor STUN periodicamente.`,
    'sipuras.Substitute_VIA_Addr': `Substituir o IP publico no VIA.`,
    'sipuras.STUN_Server': `Dominio do servidor STUN.`,
    //SMS
    'sms.id_user': `Usuário que enviou/recebeu o SMS.`,
    'sms.telephone': `Número no formato E 164.`,
    'sms.sms': `Texto no SMS.`,
    'sms.sms_from': `Se seu provedor de SMS aceita o envio do FROM, coloque aqui. Este valor será subistituido pela variável %from% na URL do tronco.`,
    'sms.result': ``,
    //SMTP
    'smtps.host': `Domínio só SMST||Você precisa verificar se o datacenter onde seu servidor está hospedado não bloqueia as portas usada pelo SMTP.`,
    'smtps.username': `Usuário para autenticar no servidor SMTP.`,
    'smtps.password': `Senha para autenticar no servidor SMTP.`,
    'smtps.port': `Porta usada pelo servidor SMTP.`,
    'smtps.encryption': `Tipo de encriptação.`,
    //MODELOS DE EMAIL
    'templatemail.fromname': `Este é o nome que será usado com fromname no email.`,
    'templatemail.fromemail': `Email usado no fromemail, deve ser o mesmo email do usuário do SMTP.`,
    'templatemail.subject': `Assunto para o email.`,
    'templatemail.status': `Esta opção permite desativar o envio exclusivamente deste email.`,
    'templatemail.messagehtml': `Mensagem. É possível usar variáveis, veja a tab variáveis para ver a lista de variáveis disponível.`,
    //TRONCOS
    'trunk.id_provider': `Provedor ao qual este tronco pertence.`,
    'trunk.trunkcode': `Nome para o tronco, deve ser único.`,
    'trunk.user': `Somente coloque usuário se seu tronco for autenticado por usuário e senha.`,
    'trunk.secret': `Somente coloque senha se seu tronco for autenticado por usuário e senha.`,
    'trunk.host': `IP ou Domínio do tronco.`,
    'trunk.trunkprefix': `Adiciona um prefixo no inicio do número to enviar para o tronco. Também usado para quando você precisa enviar um techprefix. EX: Se você tem que enviar o número no formato 0DDD número, coloque aqui 0 e no campo abaixo 55. Isso vai remover o 55 e adiconar o 0 .`,
    'trunk.removeprefix': `Remove este prefixo do número.`,
    'trunk.allow': `Selecione os codecs que o tronco aceita.`,
    'trunk.providertech': `Protocolo do tronco. Alguns protocolos como Dahdi, Dongle, DGV, khomp, precisam ser instalado no Asterisk antes de usar.`,
    'trunk.status': `Se o tronco for inativado, Magnusbilling enviara a chamada para o tronco backup.`,
    'trunk.allow_error': `Envia a chamada para o próximo tronco  se receber error 404.`,
    'trunk.register': `Somente ative se seu tronco for por usuário e senha.`,
    'trunk.register_string': `<usuario>:<senha>@<host>/contact.||usuário é a id de usuário para este servidor SIP (ex 2345).
senha é a senha do usuário.
host é o domínio ou nome do host do servidor SIP.
port envia a solicitação de registro para esta porta no host. Padrões para 5060
contact é a extensão de contato do Asterisk. Exemplo 1234 é colocado no cabeçalho do contato na mensagem de registro SIP. O ramal de contato é usado pelo servidor SIP remoto quando ele precisa enviar uma chamada para o Asterisk.

.`,
    'trunk.cnl': ``,
    'trunk.fromuser': `Muitos provedores exigem esta opção para autenticar, principalmente quando é autenticado via USER/SENHA. Deixe em branco para enviar o CallerID da conta SIP no From.`,
    'trunk.fromdomain': `Define o domínio no FROM: nas mensagens SIP ao atuar como um SIP UAC (cliente).`,
    'trunk.block_cid': ``,
    'trunk.context': `Somente altere se você souber o que está fazendo.`,
    'trunk.dtmfmode': `Tipo de DTMF. Clique para mais informaçōes|https://www.voip-info.org/asterisk-dtmf/.`,
    'trunk.insecure': `Insecure. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-insecure/.`,
    'trunk.maxuse': `Número máximo de chamadas simultâneas para este tronco.`,
    'trunk.nat': `O tronco está atrás de NAT? Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-nat/.`,
    'trunk.directmedia': `Se ativado, Asterisk vai tentar enviar a mídia RTP direto entre seu cliente e seu provedor. Precisa ativar no tronco também. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-canreinvite/.`,
    'trunk.qualify': `Enviar pacote OPTION para verificar se o usuário está online.||Sintaxe:

qualify = xxx | no | yes

onde XXX é o número de milissegundos usados. Se sim, o tempo configurado no sip.conf é usado, padrão é usado 2 segundos.

Se você ativar o qualify, o Asterisk enviará um comando OPTION o SIP peer regularmente para verificar se o dispositivo ainda está online. 
Se o dispositivo não responder o OPTION dentro do período configurado (ou padrão) (em ms), o Asterisk considera o dispositivo off-line para chamadas futuras.

Este status pode ser verificado pela função sip show peer XXXX, esta função somente fornecerá informações de status para SIP peer que possuem qualify = yes.
.`,
    'trunk.type': `Tipo padrão é friend, ou seja pode fazer e receber chamadas. Clique para mais informaçōes|https://www.voip-info.org/asterisk-sip-type/.`,
    'trunk.disallow': `Nesta opção é possível desativar codecs. Use all para desativar todos os codecs e deixar disponível para o usuário somente os que você selecionar abaixo.`,
    'trunk.sendrpid': `Define se um cabeçalho SIP Remote-Party-ID deve ser enviado.||O padrão é não.

Este campo é frequentemente usado por provedores VoIP de atacado para fornecer a identidade do chamador, independentemente das configurações de privacidade (o From SIP header).`,
    'trunk.addparameter': `Estes parâmetros serão adicionados no final do comando AGI - Comando Dial, que está no menu configurações ajustes.||Por padrão o comando DIAL é:
,60,L(%timeout%:61000:30000)

Digamos que queira adicionar um MACRO no tronco, estão neste campo, adicionar parâmetro, só colocar M(nome_do_macro) e criar seu MACRO nos extensions do Asterisk.
    .`,
    'trunk.port': `Porta do tronco. Se você precisar usar outra porta diferente da 5060, lembre-se de liberar a porta no IPTABLES.`,
    'trunk.link_sms': `URL para enviar SMS. Substituir o número por %number% e o texto por %text%. EX. a URL enviada pelo seu provedor de SMS é http://trunkWebSite.com.br/sendsms.php?usuário=magnus&senha=billing&numero=XXXXXX&texto=SSSSSSSSSSS. altere XXXXXX per %number% e SSSSSSSSSSS por %text% .`,
    'trunk.sms_res': `Deixe em branco para não aguardar resposta do provedor. Ou coloque o texto que deve constar na resposta do provedor para ser considerado ENVIADO.`,
    'trunk.sip_config': `Formato válido no Asterisk sip.conf, uma opção por linha.||Exemplo, digamos que você precise colocar o parâmetro useragent então coloque neste campo:

useragent=meu agente

.`,
    'trunk.cid_add': ``,
    'trunk.cid_remove': ``,
    //GRUPO DE TRONCOS
    'trunkgroup.name': `Nome para o grupo de troncos, recomendável usar nomes amigáveis para facilitar a administração das tarifas.`,
    'trunkgroup.type': `Tipo.||É como o sistema vai ordenar os troncos que pertence ao grupo.

* Em ordem. O sistema vai enviar a chamada para os troncos na ordem que está selecionado.
* Aleatório. O sistema ordena os troncos de forma aleatória, usando a função RAND() do MYSQL, por tanto, poderá se repetir um tronco em sequência.
* LCR. Ordena pelo tronco que tiver um custo menor. Se o provedor que o tronco pertence não tiver tarifa, será desconsiderado e colocado por último.

O MagnusBilling vai enviar as chamadas para os troncos que estão neste grupo, até que a chamada seja atendida, ocupado ou cancelada.

O MagnusBilling tentará enviar a chamada para o próximo tronco do grupo desde que o tronco testado responda CHANUNAVAIL ou CONGESTION, estes valores são retornados pelo Asterisk, e não é possível alterar.


.`,
    'trunkgroup.weight': `Esta opção é para balancear as chamadas por peso.||Exemplo. 

Digamos que tenha selecionado 3 troncos, e você deseja enviar 1 chamada para primeiro tronco, 2 para o segundo e 1 para o terceiro, então, neste exemplo, coloque neste campo 1,2,1.`,
    'trunkgroup.id_trunk': `Selecionar os troncos que pertenceram a este grupo. Se for selecionado o tipo, em ordem, então selecione os troncos na ordem desejada.`,
    //ERROS TRONCO
    'trunksipcodes.ip': ``,
    'trunksipcodes.code': ``,
    'trunksipcodes.total': ``,
    //USUáRIOS
    'user.username': `Usuário para logar no painel de cliente.`,
    'user.password': `Senha para logar no painel de cliente.`,
    'user.id_group': `Existe 3 tipos de grupos: Administrador, Revendedor e Cliente. Você pode criar ou editar qualquer destes grupos. Cada grupo tem suas permissōes específicas. Veja o menu Configurações, Grupo para Clientes.`,
    'user.id_group_agent': `Selecione o grupo que os clientes deste revendedor usaram.`,
    'user.id_plan': `Plano usado para tarifar este cliente.`,
    'user.language': `Idioma. Esta idioma é usado para algumas funçōes do sistema, mas não para o idioma do painel.`,
    'user.prefix_local': `Esta regra permite o cliente discar no formato local. ||EX 0 DDD ou somente o número dentro de seu DDD. As regras são separadas por vírgula e composta por 2 ou 3 parâmetros separados por /.
1º é o número que será substituído. Pode ser * para pegar qualquer dígito.
2º é o número que vai substituir o 1º.
3º é a quantidade de dígitos do número. Se nao colocar o 3º parâmetro, não será verificado a quantidade de dígitos.

Alguns exemplos.

Permite ligar 55DDDnº, 0DDDnº ou somente o número

0/55,*/5511/8,*/5511/9
Regra 1 -> números que iniciam com 0, o zero será substituído por 55, independente de quantos dígitos tiver o número. 
Regra 2 -> números que iniciam com qualquer valor e tem 8 dígitos, será adicionado 5511 na frente. 
Regra 3 -> números que iniciam com qualquer valor e tem 9 dígitos, será adicionado 5511 na frente


Permite ligar 55DDDnº, 0DDDnº, DDDnº ou somente o número

0/55,*/5511/8,*/5511/9,*/55/10,*/55/11
Regra 1 -> números que iniciam com 0, o zero será substituído por 55, independente de quantos dígitos tiver o número. 
Regra 2 -> números que iniciam com qualquer valor e tem 8 dígitos, será adicionado 55 na frente. 
Regra 3 -> números que iniciam com qualquer valor e tem 9 dígitos, será adicionado 55 na frente
Regra 4 -> números que iniciam com qualquer valor e tem 10 dígitos, será adicionado 5511 na frente. 
Regra 5 -> números que iniciam com qualquer valor e tem 11 dígitos, será adicionado 5511 na frente
.`,
    'user.active': `Somente usuários ativos podem fazer chamadas.`,
    'user.country': `Usado para CID Callback. O DDI do país será adicionado antes do CallerID to converter o CallerID para o formato DDI DDD nº.`,
    'user.id_offer': `Usado para ativar um pacote grátis. É necessário informar as tarifas que vão pertencer aos pacotes gratís.`,
    'user.cpslimit': `Limite de CPS(chamadas por segundo) para este cliente. As chamadas que superar este limite será enviado CONGESTION.`,
    'user.description': ``,
    'user.company_website': `Site da empresa|Tambem usado para customizar o painel de login para um revendedor. Neste caso, o dominio ou subdominio deve ser colocado sem http ou www`,
    'user.company_name': `Nome da empresa.|Tambem usado para customizar o painel de login para um revendedor`,
    'user.commercial_name': `Nome fantasia.`,
    'user.state_number': `Inscrição estadual.`,
    'user.lastname': `Sobrenome.`,
    'user.firstname': `Nome.`,
    'user.city': `Cidade.`,
    'user.state': `Estado.`,
    'user.address': `Endereço.`,
    'user.neighborhood': `Bairro.`,
    'user.zipcode': `CEP.`,
    'user.phone': `Telefone fixo.`,
    'user.mobile': `Telefone celular.`,
    'user.email': `Email, é necessário para o envio de notificaçōes do sistema.`,
    'user.email2': `Email 2`,
    'user.doc': `Documento do cliente.`,
    'user.vat': `Usado em alguns métodos de pagamento.`,
    'user.contract_value': `Valor do contrato`,
    'user.dist': ``,
    'user.typepaid': `Cliente pós-pago poderá ficar com saldo negativo até o limite de crédito informado no campo abaixo.`,
    'user.credit_notification_daily': `Se ativar esta opção o MagnusBilling vai enviar um email diariamente com o saldo do cliente. Você pode editar o email que será enviado no menu Configurações submenu Modelo de Emails.`,
    'user.creditlimit': `Somente usado para Pos-Pago. O cliente poderá ligar até chegar a este limite negativo.`,
    'user.credit_notification': `Se o crédito do cliente ficar menor que está campo, MagnusBilling vai enviar um email para o cliente informando que está com pouco crédito. NECESSÁRIO TER CADASTRADO UM SERVIDOR SMTP NO MENU CONFIGURAÇŌES.`,
    'user.email_services': `Ativa ou não as notificaçōes por email dos serviços`,
    'user.email_did': `Ativa ou não as notificaçōes por email dos DIDs`,
    'user.enableexpire': `Ativar expiração. Necessário informar a data da expiração no campo Data de expiração.`,
    'user.expirationdate': `Data que este cliente não poderá mais efetuar chamadas.`,
    'user.calllimit': `Chamadas simultâneas permitidas para este usuário.`,
    'user.inbound_call_limit': ``,
    'user.mix_monitor_format': `Formato que será usado para gravar as chamadas.`,
    'user.callshop': `Ativa o módulo CallShop. Somente ative se realmente for usar. É necessário dar permissōes ao grupo selecionado.`,
    'user.disk_space': `Espaço em GB que o usuário poderá usar com as gravaçōes. Coloque -1 para deixar sem limite.É necessário adicionar no cron o seguinte comando php /var/www/html/mbilling/cron.php UserDiskSpace .`,
    'user.sipaccountlimit': `Quantas Contas VoIP este usuário poderá ter. Será necessário dar permissōes no grupo para criar Contas VoIP.`,
    'user.callingcard_pin': `Usado para autenticação do calling card.`,
    'user.restriction': `Esta opção permite restringir o usuário para somente discar para alguns números, ou proibir discar para alguns números, conforme for selecionado. Os números deverão ser adicionado no menu Números Bloqueados.`,
    'user.restriction_use': `Qual número será usado para verificar a Restrição. Esta opção é somente válida para chamas de saida.`,
    'user.transfer_international_profit': `Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.`,
    'user.transfer_flexiload_profit': `Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.`,
    'user.transfer_bkash_profit': `Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.`,
    'user.transfer_dbbl_rocket': `Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.`,
    'user.transfer_dbbl_rocket_profit': `Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.`,
    'user.transfer_show_selling_price': `Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.`,
    //HISTóRICO CLIENTES
    'userhistory.id_user': ``,
    'userhistory.date': ``,
    'userhistory.description': ``,
    //TARIFAS PARA CLIENTES
    'userrate.id_prefix': `Selecione o prefixo que você deseja subscrever.`,
    'userrate.rateinitial': `Novo preço de venda para este prefixo.`,
    'userrate.initblock': `Mínimo de venda.`,
    'userrate.billingblock': `Bloco de venda.`,
    'userrate.id_user': ``,
    //VOUCHER
    'voucher.credit': `Valor do VOUCHER. Clique para saber como usar os VOUCHERs.|https://wiki.magnusbilling.org/pt_BR/source/how_to_use_voucher.html.`,
    'voucher.id_plan': `Plano que será vinculado ao cliente que usar este VOUCHER.`,
    'voucher.language': `Idioma que será usado.`,
    'voucher.prefix_local': `Regra que será usado no campo Regra prefixo.`,
    'voucher.quantity': `Quantidade de VOUCHERs para serem gerados.`,
    'voucher.tag': `Descrição para a agenda, somente para controle próprio.`,
    'voucher.voucher': `Número do VOUCHER.`,
});