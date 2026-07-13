.. _novidades-mbilling-8:

Novidades do MBilling 8
=======================

O MBilling 8 atualiza a base de telefonia e adiciona um novo canal de mensagens
corporativas. As principais mudanças operacionais em relação ao MBilling 7 são
o Asterisk 20, o PJSIP como driver SIP e a integração com a plataforma oficial
Meta WhatsApp Business.

Asterisk 20
-----------

As novas instalações do MBilling 8 compilam e instalam o Asterisk 20. O
instalador usa o PJProject incluído no Asterisk e prepara os arquivos utilizados
pelo MagnusBilling.

Ao atualizar um servidor existente, trate a troca do PBX como uma migração de
infraestrutura. Faça backup do banco de dados e de ``/etc/asterisk``, valide
dialplans e módulos personalizados e teste chamadas de entrada e saída, filas,
URAs, gravações, DTMF, codecs e tarifação antes de mover o tráfego de produção.

PJSIP
-----

As novas instalações usam PJSIP no lugar do antigo driver ``chan_sip``. O
instalador desativa explicitamente o ``chan_sip`` e cria estes arquivos
gerenciados:

* ``/etc/asterisk/pjsip_magnus.conf`` para servidores e troncos;
* ``/etc/asterisk/pjsip_magnus_user.conf`` para os terminais dos clientes.

Os dois arquivos são incluídos por ``/etc/asterisk/pjsip.conf``. Membros de
fila, destinos de URA, ações de chamadas online e contas SIP usam identificadores
``PJSIP/<terminal>`` no MBilling 8.

Não copie um ``sip.conf`` personalizado ou um peer do ``chan_sip`` sem adaptação.
Recrie transportes, endpoints, autenticação, address of record, identificação,
NAT, codecs e registros com a semântica do PJSIP. Depois da migração, confirme
o estado dos endpoints no CLI do Asterisk e faça chamadas controladas nos dois
sentidos.

Envio de mensagens pelo WhatsApp Business
------------------------------------------

O MBilling 8 pode enviar templates aprovados em campanhas pela API oficial Meta
WhatsApp Business Cloud e armazenar respostas recebidas por um webhook validado.

A integração exige um aplicativo empresarial da Meta, uma conta WhatsApp
Business, um número remetente aceito, um token de produção e um template
aprovado sem parâmetros. Os destinatários devem ter dado consentimento válido.
A Meta continua sendo a provedora das mensagens e controla entrega, preços,
limites, qualidade e aplicação das políticas.

Consulte :doc:`whatsapp_campaign` para o guia completo de configuração,
campanhas, webhook, segurança, consentimento e solução de problemas.

Nota de compatibilidade
-----------------------

Esta página descreve os padrões de uma nova instalação do MBilling 8. Servidores
existentes podem ter personalizações locais no Asterisk, rede, troncos, dialplan
ou automações. Valide essas personalizações no servidor real antes de atualizar;
instalar somente o código do painel não migra todas as configurações do PBX.
