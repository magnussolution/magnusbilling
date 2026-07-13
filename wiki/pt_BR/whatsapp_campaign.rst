.. _campanha-whatsapp:

Campanhas via WhatsApp
======================

Este guia explica como conectar o MagnusBilling à plataforma oficial WhatsApp Business da Meta, enviar templates aprovados por uma campanha e receber respostas por webhook.

.. important::

   O MagnusBilling não é um provedor de mensagens do WhatsApp e não realiza a entrega das mensagens. Ele somente integra a instalação do MagnusBilling à API oficial WhatsApp Business Cloud da Meta. A Meta processa a entrega e aplica suas próprias regras de aprovação, preços, qualidade, limites de mensagens e fiscalização.

Responsabilidade e condições de uso
-----------------------------------

A pessoa ou organização titular e operadora das contas Meta e MagnusBilling é a única responsável por:

* obter o consentimento válido (opt-in) do destinatário antes de enviar mensagens;
* conservar prova do consentimento e oferecer uma forma clara de cancelamento (opt-out);
* escolher destinatários, conteúdo, templates, idiomas, datas, horários e frequência de envio;
* cumprir a Política de Mensagens do WhatsApp Business, os Termos Comerciais do WhatsApp, regras de comércio, privacidade e proteção de dados, telecomunicações, defesa do consumidor e todas as leis aplicáveis nas jurisdições do remetente e do destinatário;
* todas as cobranças da Meta, impostos, verificação da conta, formas de pagamento, classificação de qualidade, limites, decisões sobre templates, bloqueios, suspensões e demais restrições;
* proteger tokens de acesso, segredo do aplicativo, dados pessoais e o acesso ao servidor MagnusBilling.

Não use campanhas para mensagens não solicitadas, listas compradas sem consentimento válido, fraude, assédio, conteúdo ilegal ou produtos e serviços proibidos/restritos. Uma requisição aceita tecnicamente pela API não comprova que a mensagem seja legal, compatível com as políticas, aceita ou entregue.

A Meta pode alterar telas, preços, limites e políticas a qualquer momento. Antes de usar uma campanha, consulte sempre a `Política de Mensagens do WhatsApp Business <https://business.whatsapp.com/policy>`_, os `Termos Comerciais do WhatsApp <https://www.whatsapp.com/legal/business-terms/>`_, a `orientação oficial de opt-in <https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in>`_ e os `preços da plataforma <https://business.whatsapp.com/products/platform-pricing>`_. As regras oficiais prevalecem sobre este guia.

Requisitos
----------

Antes de começar, tenha:

* MagnusBilling 8 atualizado até a versão de banco 8.0.0.4;
* URL HTTPS pública com certificado válido, caso queira receber respostas;
* conta Meta for Developers e portfólio empresarial da Meta;
* aplicativo empresarial com o produto WhatsApp;
* conta WhatsApp Business (WABA) e número aceito pela Meta;
* template de mensagem aprovado;
* números com opt-in válido, cadastrados no formato internacional com código do país;
* usuário MagnusBilling ativo, com crédito, e agenda contendo números ativos.

O painel da Meta muda ocasionalmente. Se algum nome de tela estiver diferente, siga o `guia atual de início da Cloud API <https://developers.facebook.com/docs/whatsapp/cloud-api/get-started>`_.

1. Criar o aplicativo e a conta WhatsApp na Meta
------------------------------------------------

#. Entre no `Meta for Developers <https://developers.facebook.com/>`_ e abra **Meus aplicativos**.
#. Crie um aplicativo destinado a uso empresarial e vincule-o ao portfólio empresarial correto.
#. Adicione o produto **WhatsApp** ao aplicativo.
#. Abra a área de configuração da API do WhatsApp.
#. Selecione ou crie a conta WhatsApp Business.
#. Adicione o número remetente e conclua a verificação e aprovação do nome de exibição solicitadas pela Meta.
#. Cadastre uma forma de pagamento válida quando exigida pela Meta para uso em produção.
#. Anote o **Phone Number ID** e o **WhatsApp Business Account ID**. Atualmente, o envio pelo MagnusBilling precisa do Phone Number ID; o WABA ID continua útil para administração dentro da Meta.

O número de teste e o token temporário fornecidos pela Meta podem ser usados durante a configuração inicial, mas não são credenciais adequadas para produção.

2. Criar um token de acesso para produção
------------------------------------------

Nas Configurações do Negócio da Meta, crie ou selecione um usuário do sistema para a integração. Atribua a esse usuário o aplicativo e os ativos necessários da conta WhatsApp e gere um token de produção com as permissões exigidas pela Cloud API atual, normalmente incluindo:

* ``whatsapp_business_messaging``;
* ``whatsapp_business_management``.

Copie o token uma única vez e guarde-o de forma segura. Nunca o coloque em capturas de tela, chamados, conversas, controle de versão ou documentação pública. Use somente as permissões necessárias, limite os acessos administrativos e troque imediatamente o token se houver suspeita de exposição. A Meta controla a validade e pode revogá-lo.

3. Configurar o MagnusBilling
-----------------------------

Execute a atualização do banco do MagnusBilling antes de configurar a integração. Em **Configurações > Ajustes**, preencha:

``WhatsApp Phone Number ID``
   Phone Number ID exibido na configuração da API do WhatsApp na Meta.

``WhatsApp Access Token``
   Token de produção criado para a integração. Não use token temporário de teste em produção.

``WhatsApp API Version``
   Versão da Graph API usada pelo MagnusBilling. Mantenha o padrão instalado, exceto quando a integração estiver sendo atualizada e validada para outra versão.

``WhatsApp API Timeout``
   Tempo máximo, em segundos, para uma requisição à API.

O token é confidencial. Restrinja o acesso ao menu Ajustes e aos backups do servidor que contenham o banco de dados.

4. Criar e aprovar um template
------------------------------

#. Abra o WhatsApp Manager nas ferramentas empresariais da Meta.
#. Crie um template com categoria, nome, idioma, corpo e exemplos exigidos.
#. Envie para análise e aguarde o status aprovado antes de ativar a campanha.
#. Copie exatamente o nome e o código do idioma exibidos pela Meta. Esses valores devem corresponder exatamente na integração.

Consulte as `diretrizes atuais para templates <https://developers.facebook.com/docs/whatsapp/message-templates/guidelines>`_ e o `guia de envio de templates <https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates>`_. A Meta pode rejeitar, pausar ou desativar um template por conteúdo, reclamações ou descumprimento das políticas.

.. warning::

   A integração atual de campanhas envia somente o nome e o idioma do template. Ela não envia componentes de cabeçalho, corpo, botão ou variáveis. Use um template que não exija parâmetros. Um template com marcadores como ``{{1}}`` não funcionará enquanto o suporte a componentes não for implementado.

5. Preparar a agenda
--------------------

#. Abra **Torpedo de voz e SMS > Agendas** e crie ou selecione uma agenda pertencente ao usuário da campanha.
#. Importe os destinatários no formato internacional: código do país, DDD e número. Recomenda-se usar somente dígitos.
#. Confirme que os números estejam ativos e que todos tenham fornecido opt-in válido para WhatsApp.
#. Remova destinatários que cancelaram o consentimento, números inválidos, bloqueados ou não qualificados antes de cada campanha.

O fato de um número possuir WhatsApp não significa que exista consentimento para receber mensagens comerciais ou automáticas.

6. Criar a campanha WhatsApp
----------------------------

#. Abra **Torpedo de voz e SMS > Campanhas** e crie uma campanha.
#. Selecione o usuário proprietário da agenda e que possua crédito disponível.
#. Em **Tipo**, selecione **WhatsApp**.
#. Informe um nome e configure data inicial, data de expiração, dias da semana, horário de início diário e horário de fim diário.
#. Em **Limite de chamada/Frequência**, defina quantos contatos o MagnusBilling poderá tentar por minuto. Os limites de capacidade e mensagens da Meta continuam válidos.
#. Selecione uma ou mais agendas.
#. Na aba **Mensagens**, preencha **WhatsApp template name** e **WhatsApp template language** exatamente como aprovados pela Meta.
#. Ative **Números restritos** caso a lista local de bloqueio deva ser aplicada.
#. Salve a campanha com status ativo.

O processo de campanha WhatsApp é executado a cada minuto e seleciona os números ativos que atendam ao agendamento. Quando a Cloud API aceita a requisição, o MagnusBilling registra o envio no histórico com o ID fornecido pela Meta. Aceitação não significa entrega final.

7. Receber respostas
--------------------

O recebimento exige um webhook HTTPS público.

#. Em **Configurações > Ajustes**, crie um valor aleatório forte em **WhatsApp Webhook Verify Token**. Esse segredo é escolhido por você e não é o access token.
#. Copie o **App Secret** do aplicativo Meta para **WhatsApp App Secret**.
#. Na configuração de webhook do WhatsApp dentro do aplicativo Meta, use a seguinte URL, adaptando domínio e diretório da instalação::

      https://SEU_DOMINIO/mbilling/index.php/whatsappWebhook/index

#. Informe o mesmo verify token cadastrado no MagnusBilling.
#. Conclua a verificação do webhook pela Meta.
#. Assine o campo ``messages`` para a conta WhatsApp Business. Siga o `guia oficial de configuração de webhook <https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks>`_.

As requisições recebidas somente são aceitas quando ``X-Hub-Signature-256`` corresponde ao App Secret configurado. As mensagens ficam em **Torpedo de voz e SMS > Received Messages**, com canal ``whatsapp`` e status **Received**.

O MagnusBilling associa a resposta ao envio WhatsApp mais recente registrado para o número. Para envios antigos, também procura o número nas agendas das campanhas WhatsApp. Uma resposta que não possa ser associada a um usuário MagnusBilling é registrada no log do servidor e não aparece no menu.

Checklist operacional
---------------------

Antes de ativar uma campanha, confirme:

* banco atualizado no mínimo para 8.0.0.4;
* Phone Number ID e token de produção pertencem à mesma configuração Meta;
* template aprovado, ativo, sem parâmetros e com nome e idioma idênticos aos configurados;
* usuário da campanha possui crédito;
* campanha está ativa e dentro das datas, dias e horários configurados;
* agendas contêm números ativos, no formato correto e com opt-in;
* frequência respeita os limites da Meta e a velocidade desejada;
* processo cron da campanha está em execução;
* qualidade, limites, cobrança e status do número estão normais no WhatsApp Manager;
* listas de bloqueio e opt-out estão atualizadas.

Problemas comuns
----------------

Nenhuma mensagem é enviada
   Verifique token, Phone Number ID, nome/idioma do template aprovado, crédito, agendamento, números ativos, cron, cobrança da Meta, qualidade, limites e restrições da conta.

A Meta informa ausência de parâmetros
   O template selecionado exige componentes ou variáveis. Use um template aprovado sem parâmetros com a integração atual.

A API aceita, mas o destinatário não recebe
   Aceitação não é entrega. Consulte status e diagnósticos na Meta, qualificação e opt-in do destinatário, qualidade, limites, status do template e número de destino.

As respostas não aparecem
   Confirme HTTPS, verificação do webhook, assinatura do campo ``messages``, App Secret, cabeçalho de assinatura e se o remetente consta em um envio WhatsApp registrado ou agenda de campanha.

A integração parou repentinamente
   Verifique se a Meta revogou o token, alterou permissões dos ativos, desativou o template, restringiu a conta ou o número, mudou algum requisito ou encerrou a versão configurada da Graph API.

Ausência de garantia de entrega
-------------------------------

O MagnusBilling não controla a rede da Meta, aprovações, entrega, preços, aparelhos dos destinatários, bloqueios, sistema de qualidade ou decisões de fiscalização. A integração não garante aceitação, entrega, leitura, resposta, funcionamento ininterrupto ou disponibilidade futura de qualquer recurso da Meta. O usuário assume toda a responsabilidade e os riscos decorrentes da configuração e do uso das campanhas WhatsApp. Este guia contém informações operacionais e não constitui aconselhamento jurídico.
