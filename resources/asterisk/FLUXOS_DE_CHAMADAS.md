# MagnusBilling - Documentação Completa de Fluxos de Chamadas

## 📞 Visão Geral

Este documento descreve em detalhes todos os tipos de chamadas que o MagnusBilling
processa, incluindo:

1. **Chamadas Outbound (Saída)** – chamadas originadas por usuários para números externos
2. **Chamadas Inbound (Entrada)** – chamadas que chegam via DID
3. **Filas (Queue)** – chamadas encaminhadas para agentes em filas
4. **IVR (Resposta Interativa por Voz)** – menus de navegação automática
5. **Autenticação** – como os usuários são identificados
6. **Seleção de Tarifa** – como o sistema escolhe o preço da chamada

---

# 🔄 1. FLUXO DE CHAMADA OUTBOUND (Saída)

## Visão Geral

Uma **chamada outbound** é quando um usuário autenticado disca um número externo
(PSTN, móvel ou internacional) através do MagnusBilling. O sistema cobra pelo tempo
da chamada usando uma tarifa definida para o destino.

## Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. DIALPLAN DO ASTERISK ATIVA O AGI                       │
│     exten => _[*0-9].,1,AGI(/resources/asterisk/mbilling) │
│                                                             │
│                          ↓                                  │
│                                                             │
│  2. mbilling.php INICIALIZA                                │
│     - Carrega configurações (load_conf)                    │
│     - Lê parâmetros AGI (accountcode, dnid, callerid)      │
│     - Trata DNID especiais (*120 voucher, *7 pickup, etc)  │
│                                                             │
│                          ↓                                  │
│                                                             │
│  3. ROTEIA PARA StandardCallAgi->processCall()             │
│     (quando modo = 'standard')                             │
│                                                             │
│                          ↓                                  │
│                                                             │
│  4. AUTENTICAÇÃO (AuthenticateAgi::authenticateUser)       │
│     Tenta: CallerID → TechPrefix → Accountcode →           │
│             SIP Proxy → Calling Card                        │
│     Se falhar: toca "prepaid-auth-fail" e desliga          │
│                                                             │
│                          ↓ (sucesso)                        │
│                                                             │
│  5. VERIFICA RESTRIÇÕES E STATUS DO USUÁRIO                │
│     - Expiration date (vencimento da conta)                │
│     - Call limits (limite de chamadas simultâneas)          │
│     - Plan restrictions (restrições do plano)              │
│     - Intra/Inter state rules (telecom brasileiro)          │
│                                                             │
│                          ↓                                  │
│                                                             │
│  6. LOOP DE TENTATIVAS (number_try)                        │
│     for (i = 0; i < number_try; i++) {                     │
│                                                             │
│        a) VERIFICA O NÚMERO                                │
│           Magnus::checkNumber()                            │
│           - Valida contra blacklist/whitelist              │
│           - Valida prefixo (se restringido)                │
│           - Aplica tradução de número (prefix_local)       │
│                          ↓                                  │
│        b) SELECIONA TARIFA                                 │
│           SearchTariff->find()                             │
│           - Procura em pkg_rate por prefixo                │
│           - Aplica custom rates do usuário                 │
│           - Retorna tariffObj com rateinitial, initblock   │
│                          ↓                                  │
│        c) CALCULA TIMEOUT (tempo máximo permitido)         │
│           CalcAgi->calculateAllTimeout()                   │
│           - credito / rateinitial = segundos               │
│           - Aplica initblock, connectcharge                │
│           - Verifica free minutes (ofertas)                │
│           - Avisa ao usuário via say_time_call             │
│                          ↓                                  │
│        d) SELECIONA TRONCO                                 │
│           CalcAgi->sendCall()                              │
│           - Se id_trunk_group > 0: busca melhor tronco     │
│           - Senão: busca primeiro tronco disponível        │
│           - Verifica status do tronco (ativo)              │
│           - Valida crédito do provedor                     │
│                          ↓                                  │
│        e) EXECUTA DIAL                                     │
│           DIAL(TRUNK/numero, timeout, options)             │
│           - Inicia gravação se habilitada                  │
│           - Aguarda conectar ou timeout                    │
│           - Captura ANSWERTIME e DIALSTATUS                │
│                          ↓                                  │
│        f) VALIDA RESPOSTA                                  │
│           Se DIALSTATUS == ANSWER:                         │
│             - Chamada conectada com sucesso                │
│             - Calcula custo final                          │
│             - Se say_balance_after_call: anuncia saldo     │
│             - Sai do loop                                  │
│           Senão:                                           │
│             - Falhou nesta tentativa                       │
│             - Modifica uniqueid para próxima tentativa      │
│             - Continua loop                                │
│                                                             │
│     } // fim loop                                          │
│                                                             │
│                          ↓                                  │
│                                                             │
│  7. ATUALIZA SISTEMA & CDR                                 │
│     CalcAgi->updateSystem()                                │
│     - Calcula custo final baseado em answeredtime          │
│     - Decrementa crédito do usuário                        │
│     - Aplica comissões de agentes (se houver)              │
│     - Insere registro em pkg_cdr                           │
│     - Atualiza estatísticas de utilização                 │
│                                                             │
│                          ↓                                  │
│                                                             │
│  8. ENCERRA CHAMADA                                        │
│     Magnus->hangup()                                       │
│     - Toca prompt de encerramento (se configurado)         │
│     - Executa HANGUP com optional cause code               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Pontos Importantes

### Tentativas Múltiplas
Se a primeira tentativa falhar (NOANSWER, CONGESTION, etc.), o sistema pode tentar
usar troncos alternativos até `number_try` vezes. Cada tentativa recebe um uniqueid
diferente para fins de rastreamento.

### Autenticação
O usuário pode ser autenticado de cinco maneiras diferentes (em ordem):
1. **CallerID** – número que faz a chamada
2. **TechPrefix** – código técnico extraído dos dígitos decimados
3. **Accountcode** – número da conta (DNID prefixado)
4. **SIP Proxy** – cabeçalhos SIP especiais (X-AUTH-IP, P-Accountcode)
5. **Calling Card / Voucher** – PIN inserido interativamente

### Restrições
Após autenticação bem-sucedida, o sistema valida:
- **Vencimento**: se a conta expirou ou está próximo de vencer
- **Limite de chamadas**: máximo de chamadas simultâneas
- **Plano**: restrições específicas do plano (intra/inter state)
- **Blacklist**: se o número de destino está na lista de bloqueio

---

# 📱 2. FLUXO DE CHAMADA INBOUND (Entrada) - DID

## Visão Geral

Uma **chamada inbound** chega através de um número DID (Direct Inward Dialing)
configurado no MagnusBilling. O sistema identifica o DID, aplica regras de roteamento
e pode encaminhar para IVR, fila, SIP, voicemail ou PSTN.

## Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. CHAMADA EXTERNA CHEGA                                  │
│     → Asterisk encaminha para dialplan                     │
│     → AGI acionado com número DID                          │
│                                                             │
│                          ↓                                  │
│                                                             │
│  2. mbilling.php PROCESSA ENTRADA                          │
│     - Identifica modo como DID                             │
│     - Extrai dnid (número discado)                         │
│     - Carrega configurações                                │
│                                                             │
│                          ↓                                  │
│                                                             │
│  3. DidAgi->checkIfIsDidCall()                             │
│                                                             │
│     a) BUSCA O DID EM pkg_did                              │
│        SELECT * FROM pkg_did WHERE did = dnid              │
│        AND activated = 1 LIMIT 1                           │
│                                                             │
│        Se não encontrado: desliga a chamada                │
│                                                             │
│                          ↓ (encontrado)                    │
│                                                             │
│     b) CARREGA DESTINOS                                    │
│        SELECT * FROM pkg_did_destination                   │
│        WHERE id_did = modelDid->id                         │
│        ORDER BY priority                                   │
│                                                             │
│        Pode ter múltiplos destinos com fallback            │
│                                                             │
│                          ↓                                  │
│                                                             │
│     c) VALIDA LIMITES DE CHAMADAS                          │
│        - Verifica limit per DID (pkg_did.calllimit)        │
│        - Verifica limit per usuário (pkg_user.             │
│          inbound_call_limit)                               │
│        - Conta canais ativos via AMI                       │
│        - Se excede: toca busy ou congestion                │
│                                                             │
│                          ↓                                  │
│                                                             │
│     d) APLICA RESTRIÇÕES DE USUÁRIO                        │
│        - Verifica se usuário pode receber chamadas         │
│        - Aplica restrições de telefone (blacklist caller)  │
│        - Valida horário de funcionamento (se IVR)          │
│                                                             │
│                          ↓                                  │
│                                                             │
│     e) CALCULA CUSTO DO DID                                │
│        DidAgi->didCallCost()                               │
│        - Busca tarifa em pkg_rate para este DID            │
│        - Aplica sell_price (preço de venda ao cliente)     │
│        - Aplica buy_price (custo do fornecedor)            │
│                                                             │
│                          ↓                                  │
│                                                             │
│  4. PROCESSA DESTINOS (prioridade)                         │
│     DidAgi->checkDidDestinationType()                      │
│                                                             │
│     Para cada destino:                                     │
│                                                             │
│     if (destino == 'ivr'):                                 │
│        → IvrAgi::callIvr()                                 │
│        → Toca menu IVR e aguarda DTMF                      │
│        → Roteia baseado em seleção do usuário              │
│                                                             │
│     else if (destino == 'queue'):                          │
│        → QueueAgi::callQueue()                             │
│        → Executa Asterisk Queue application                │
│        → Distribui para agentes disponíveis                │
│                                                             │
│     else if (destino == 'sip'):                            │
│        → SipCallAgi::processCall()                         │
│        → Disca ramal SIP configurado                       │
│        → Se não responde e tem forward: aplica forward     │
│                                                             │
│     else if (destino == 'number'):                         │
│        → Call_did()                                        │
│        → Disca número fixo/celular externo                 │
│                                                             │
│     else if (destino == 'voicemail'):                      │
│        → Asterisk VoiceMail application                    │
│        → Deixa mensagem gravada                            │
│                                                             │
│     Tenta próximo destino apenas se anterior falhar        │
│                                                             │
│                          ↓                                  │
│                                                             │
│  5. REGISTRA CDR DE ENTRADA                                │
│     DidAgi->call_did_billing()                             │
│     - Insere em pkg_cdr com origem DID                     │
│     - Atualiza pkg_did_destination.secondusedreal          │
│     - Decrementa crédito do cliente (se configurado)       │
│     - Registra tempo de atendimento                        │
│                                                             │
│                          ↓                                  │
│                                                             │
│  6. ENCERRA CHAMADA                                        │
│     Asterisk termina a conexão                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Casos de Uso

### DID com Fallback
Se o primeiro destino (ex: SIP) não responde:
1. Sistema aguarda timeout
2. Se falhou, tenta próximo destino na lista
3. Se todos falhem, toca "voicemail" fallback ou desliga

### Horários Diferentes
Um DID pode ter comportamentos diferentes:
- **Horário comercial** (segunda-sexta 9-18h): roteio para SIP
- **Fora do horário** (fins de semana, após 18h): roteio para IVR

Isso é configurado em `pkg_ivr.monFriStart`, `satStart`, `sunStart`.

---

# 👥 3. FLUXO DE FILA (QUEUE)

## Visão Geral

Uma **fila** conecta chamadores com agentes. As chamadas podem originar:
- De DIDs (inbound)
- De IVRs (após seleção de menu)
- De forwarding de SIP

## Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. ENTRADA NA FILA                                        │
│     QueueAgi::callQueue()                                  │
│                                                             │
│     a) BUSCA CONFIGURAÇÃO DA FILA                          │
│        SELECT * FROM pkg_queue WHERE id = id_queue         │
│        Carrega: estratégia de ring, timeout, MOH, etc      │
│                                                             │
│                          ↓                                  │
│                                                             │
│     b) REGISTRA ENTRADA                                    │
│        INSERT INTO pkg_queue_status                        │
│        (id_queue, callId, queue_name, callerId, status)    │
│        VALUES (..., 'ringing', ...)                        │
│                          ↓                                  │
│                                                             │
│     c) EXECUTA APLICAÇÃO QUEUE DO ASTERISK                 │
│        Queue(queueName, ringing_or_moh, [options])         │
│                                                             │
│        Asterisk faz:                                       │
│        - Toca música em espera (MOH) ou ringback           │
│        - Procura agentes logados na fila                   │
│        - Disca o ramal do agente                           │
│        - Se agente responde: conecta chamador ao agente    │
│        - Se agente não responde: tenta próximo             │
│        - Se timeout: aplica ação de timeout                │
│                                                             │
│                          ↓                                  │
│                                                             │
│     d) ANALISA RESULTADO DA FILA                           │
│        egrep uniqueid /var/log/asterisk/queue_log          │
│                                                             │
│        Possíveis resultados:                               │
│        - COMPLETEAGENT: agente respondeu                   │
│        - EXITWITHTIMEOUT: timeout expirou                  │
│        - ABANDON: chamador saiu                            │
│        - TRANSFER: chamador transferiu                     │
│                                                             │
│                          ↓                                  │
│                                                             │
│  2. PROCESSAMENTO D E AGENTE (Callback)                    │
│     Se agente respondeu: QueueAgi::recIvrQueue()           │
│                                                             │
│     a) PREPARA CONTEXTO DE AGENTE                          │
│        - Mantém registro da fila                           │
│        - Atualiza status para 'answered'                   │
│        - Define música em espera do agente                 │
│        - Registra tempo em espera (holdtime)               │
│                                                             │
│                          ↓                                  │
│                                                             │
│     b) AGENTE PROCESSA CHAMADA                             │
│        - Transferência SIP (opcional)                      │
│        - Gravação de conversa                              │
│        - Logging de comportamento                          │
│                                                             │
│                          ↓                                  │
│                                                             │
│  3. PROCESSAMENTO DE TIMEOUT                               │
│     Se linha[4] == 'EXITWITHTIMEOUT':                      │
│                                                             │
│     a) BUSCA AÇÃO CONFIGURADA                              │
│        SELECT max_wait_time_action FROM pkg_queue          │
│        Formato: TIPO/VALOR (ex: SIP/ramal101, IVR/5)       │
│                                                             │
│                          ↓                                  │
│                                                             │
│     b) APLICA AÇÃO                                         │
│        if (actionType == 'SIP'):                           │
│           → Disca ramal SIP alternativo                    │
│        else if (actionType == 'QUEUE'):                    │
│           → Redireciona para outra fila                    │
│        else if (actionType == 'IVR'):                      │
│           → Encaminha para IVR                             │
│        else if (actionType == 'LOCAL'):                    │
│           → Executa dialplan customizado                   │
│                                                             │
│                          ↓                                  │
│                                                             │
│  4. ENCERRAMENTO DA FILA                                   │
│     QueueAgi::callQueue() (fim da função)                  │
│                                                             │
│     a) DELETE DE pkg_queue_status                          │
│        Remove registro da fila                             │
│                                                             │
│                          ↓                                  │
│                                                             │
│     b) CALCULA TEMPO DE SESSÃO                             │
│        stopTime - startTime = tempo total em fila          │
│                                                             │
│                          ↓                                  │
│                                                             │
│     c) REGISTRA CDR BILLING                                │
│        QueueAgi ou DidAgi::billDidCall()                   │
│        - sipiax = 8 (identificar como fila)                │
│        - sessionbill = sell_price do DID                   │
│        - sessiontime = tempo na fila                       │
│        - agent_bill = comissão agente (se houver)          │
│        - Insere em pkg_cdr                                 │
│                                                             │
│                          ↓                                  │
│                                                             │
│     d) ENCERRA EXECUÇÃO                                    │
│        exit ou return                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Agente (Pause/Resume)

Agentes usam comandos especiais para pausar/retomar:

```
*180  →  PAUSE (sair da fila temporariamente)
*181  →  RESUME (voltar à fila)

QueueAgi::pauseQueue() toggliza estado na tabela pkg_queue
```

---

# 🎙️ 4. FLUXO DE IVR (Resposta Interativa por Voz)

## Visão Geral

Um **IVR** é um menu automático onde o chamador ouve opções e disca números para
navegar. Pode estar associado a um DID ou a uma ação de timeout.

## Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. ENTRADA NO IVR                                         │
│     IvrAgi::callIvr()                                      │
│                                                             │
│     a) BUSCA CONFIGURAÇÃO DO IVR                           │
│        SELECT * FROM pkg_ivr WHERE id = id_ivr             │
│        Carrega opções (option_0 até option_9)              │
│                                                             │
│                          ↓                                  │
│                                                             │
│     b) DETERMINA HORÁRIO (OPEN/CLOSED)                     │
│        Magnus::checkIVRSchedule()                          │
│        - Valida se está dentro horário comercial           │
│        - Verifica feriados (pkg_holidays)                  │
│                                                             │
│        If OPEN:                                            │
│           audioURA = 'idIvrDidWork_' + id_ivr              │
│        Else:                                               │
│           audioURA = 'idIvrDidNoWork_' + id_ivr            │
│                                                             │
│                          ↓                                  │
│                                                             │
│  2. LOOP DO MENU (max 10 iterações)                        │
│     while (continue && i < 10):                            │
│                                                             │
│     a) SOLICITA ENTRADA DO USUÁRIO                         │
│        agi->get_data(audioURA, wait_time, digit_timeout)   │
│                                                             │
│        Toca arquivo de áudio:                              │
│        /files/sounds/idIvrDidWork_[id_ivr].gsm             │
│        Aguarda DTMF (0-9, # para finalizar)                │
│                                                             │
│                          ↓                                  │
│                                                             │
│     b) PROCESSA ENTRADA                                    │
│        if (option == ''):          // timeout, sem entrada │
│           → Toca som padrão e sai                          │
│        else if (invalid option):   // opção não existe     │
│           → Toca "invalid-digits" e repete                 │
│        else:                                               │
│           → Processa a seleção                             │
│                                                             │
│                          ↓                                  │
│                                                             │
│  3. ROTEAMENTO POR OPÇÃO SELECIONADA                       │
│                                                             │
│     dtmf = explode("|", modelIvr->option_X)               │
│     optionType = dtmf[0]  (ex: 'sip', 'queue', 'number')   │
│     optionValue = dtmf[1] (ex: '101', '5', '1122334455')   │
│                                                             │
│                          ↓                                  │
│                                                             │
│     if (optionType == 'sip'):                              │
│        → SipCallAgi::processCall()                         │
│        → Disca ramal SIP                                   │
│                                                             │
│     else if (optionType == 'queue'):                       │
│        → QueueAgi::callQueue()                             │
│        → Coloca em fila                                    │
│                                                             │
│     else if (optionType == 'ivr'):                         │
│        → Recursivo: IvrAgi::callIvr() (subnível)           │
│                                                             │
│     else if (optionType == 'number'):                      │
│        → DidAgi::call_did()                                │
│        → Disca número externo (PSTN)                       │
│                                                             │
│     else if (optionType == 'custom'):                      │
│        → Executa dialplan customizado                      │
│        → Se começa com SMS: envia SMS                      │
│                                                             │
│     else if (optionType == 'sms'):                         │
│        → SipCallAgi::smsForward()                          │
│        → Envia SMS para número                             │
│                                                             │
│     continue = false  // sai do loop                       │
│                                                             │
│     } // fim loop                                          │
│                                                             │
│                          ↓                                  │
│                                                             │
│  4. ENCERRAMENTO DO IVR                                    │
│     - Se tipo = 'ivr' apenas: desliga                      │
│     - Se tipo = 'queue' ou 'did': mantém chamada ativa     │
│       (pois passou para próximo estágio)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Opções de IVR

| Type | Value | Comportamento |
|------|-------|---------------|
| `sip` | id_sip | Disca ramal SIP (ex: 101, 102) |
| `queue` | id_queue | Encaminha para fila |
| `ivr` | id_ivr | Carrega IVR sub-nível |
| `number` | telefone | Disca número externo |
| `custom` | dialplan | Executa contexto customizado |
| `sms` | SMS/msg@numero | Envia SMS |

---

# 🔐 5. AUTENTICAÇÃO

## Visão Geral

O MagnusBilling suporta **5 métodos de autenticação** executados em cadeia
(se um falhar, tenta o próximo).

## Métodos Detalhados

### 1️⃣ CallerID Authentication

```
Acionado: Se agiconfig['cid_enable'] == 1 e CallerID é numérico
Processo:
  1. Busca em pkg_callerid WHERE cid = CallerID AND activated = 1
  2. Se encontrado: carrega usuário associado (pkg_user)
  3. Carrega SIP associado (pkg_sip)
  4. Popula $MAGNUS com dados do usuário

Casos de uso: Ramais que sempre chamam do mesmo número
```

### 2️⃣ TechPrefix Authentication

```
Acionado: Sempre que DNID começa com techprefix cadastrado
Processo:
  1. Extrai primeiros N dígitos (ip_tech_length)
  2. Busca em pkg_sip WHERE techprefix = 'XX' AND host != 'dynamic'
  3. Extrai IP de origem do cabeçalho SIP_HEADER(Contact)
  4. Valida se IP corresponde a pkg_sip.host
  5. Se válido: carrega usuário associado
  6. Remove techprefix do DNID para o número real

Casos de uso: Clientes conectados com IP fixo (VPN, dedicada)
Exemplo: TechPrefix '55', digita '5511987654321'
         Autentica, remove 55, número real = 11987654321
```

### 3️⃣ Accountcode Authentication

```
Acionado: Se houver accountcode no Asterisk
Processo:
  1. Busca em pkg_user WHERE username = accountcode
  2. Se encontrado: carrega dados do usuário
  3. Popula email, plano, restrições, etc

Casos de uso: Mais comum - usuários com login/PIN
```

### 4️⃣ SIP Proxy Authentication

```
Acionado: Se chamada vem de proxy autenticado
Cabeçalhos utilizados:
  - X-AUTH-IP: IP do proxy
  - P-Accountcode: username do cliente
  
Processo:
  1. Valida se X-AUTH-IP é IP válido
  2. Busca em pkg_servers WHERE host = proxy_domain
  3. Se proxy autorizado:
     a. Se P-Accountcode presente: autentica por accountcode
     b. Senão: busca por X-AUTH-IP em pkg_sip.host

Casos de uso: Grandes corretoras com proxy próprio
```

### 5️⃣ Calling Card / Voucher Authentication

```
Acionado: Se outros métodos falham
Processo interativo:
  1. Toca prompt "prepaid-enter-pin-number"
  2. Coleta 6 dígitos via get_data
  3. Busca em pkg_voucher ou pkg_calling_card
  4. Valida status (ativo, crédito disponível)
  5. Se válido: carrega usuário associado, aplica crédito
  
Variantes:
  - voucherAuthenticate(): PIN é código de recarga (voucher)
  - pinAuthenticate(): PIN é conta pré-paga simples

Casos de uso: Usuários ocasionais, viajantes
```

### 6️⃣ Callshop Authentication

```
Acionado: Se usuário tem tipo 'callshop' (cabine de discagem)
Processo:
  1. Aguarda moeda/cartão inserido (ASR ou IVR)
  2. Valida depósito (crédito temporário concedido)
  3. Cria sessão com timeout
  4. Ao encerrar: deduz tempo utilizado

Casos de uso: Cabines telefônicas, saguões de aeroporto
```

## Fluxo de Autenticação Completo

```
AuthenticateAgi::authenticateUser():
  
  authentication = false
  
  TENTA callerIdAuthenticate()
    → Se sucesso: authentication = true
  
  Se falhou, TENTA techPrefixAuthenticate()
    → Se sucesso: authentication = true
  
  Se falhou, TENTA accountcodeAuthenticate()
    → Se sucesso: authentication = true
  
  Se falhou, TENTA sipProxyAuthenticate()
    → Se sucesso: authentication = true
  
  Se falhou, TENTA callingCardAuthenticate()
    [prompt interativo]
    → Se sucesso: authentication = true
  
  Se falhou, TENTA checkIfCallShopCall()
    → Se sucesso: authentication = true
  
  Se authentication == false:
    TOCA "prepaid-auth-fail"
    DESLIGA CHAMADA
    EXIT
  
  CASO CONTRÁRIO, executa validações pós-autenticação:
    - check_expirationdate_customer()
    - checkUserCallLimit()
    - checkPlanTechPrefix()
    - checkIfIsAgent()
    - checkPlanIntraInter()
  
  return authentication (true ou false)
```

---

# 💰 6. SELEÇÃO DE TARIFA

## Visão Geral

A **tarifa** determina quanto o MagnusBilling cobra do usuário por minuto de chamada.
O sistema seleciona a melhor tarifa baseado no prefixo do destino e no plano do usuário.

## Hierarquia de Seleção

```
1. CUSTOM RATE (maior prioridade)
   └─ Busca em pkg_user_rate
   └─ Se existir para este usuário + prefixo: USADA

2. PLAN RATE
   └─ Busca em pkg_rate
   └─ Critérios:
      - Plano do usuário (pkg_user.id_plan)
      - Prefixo mais comprido que bate com destino
      - Status = 1 (ativo)
      - ORDER BY LENGTH(prefix) DESC
   
3. AGENT RATE (se usuário é agente)
   └─ Busca em pkg_rate_agent
   └─ Plano do agente (pkg_user.id_plan_agent)
   └─ Usa se custo for menor

4. TRUNK GROUP SELECTION
   └─ id_trunk_group define estratégia:
      - Tipo 1: FIFO (primeiro na fila)
      - Tipo 2: RANDOM (aleatório)
      - Tipo 3: LOWEST COST (menor preço)
```

## Fluxo Completo de Seleção de Tarifa

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  SearchTariff::find($MAGNUS, $agi)               │
│                                                  │
│  1. MONTA CLÁUSULA DE PREFIXO                   │
│     prefixclause = "(prefix='11' OR             │
│                     prefix='1198' OR            │
│                     prefix='119876' OR ..."     │
│                                                  │
│                          ↓                      │
│                                                  │
│  2. BUSCA RATE DO PLANO                        │
│     SELECT * FROM pkg_rate                     │
│     WHERE id_plan = $MAGNUS->id_plan            │
│       AND status = 1                            │
│       AND prefixclause                          │
│     ORDER BY LENGTH(prefix) DESC                │
│     LIMIT 1                                     │
│                                                  │
│     Retorna: rateinitial (preço/min),           │
│              initblock (segundos iniciais),     │
│              billingblock (incremento),         │
│              connectcharge (taxa de conexão),   │
│              id_trunk_group (para seleção)      │
│                          ↓                      │
│                                                  │
│  3. BUSCA CUSTOM RATE DO USUÁRIO (opcional)    │
│     SELECT * FROM pkg_user_rate                │
│     WHERE id_user = $MAGNUS->id_user            │
│       AND id_prefix = result[0]['id_prefix']    │
│     LIMIT 1                                     │
│                                                  │
│     Se encontrado: sobrescreve rateinitial,     │
│                    initblock, billingblock      │
│                          ↓                      │
│                                                  │
│  4. SE AGENTE: busca agent rate                │
│     Se $MAGNUS->id_agent > 1:                   │
│        SELECT * FROM pkg_rate_agent             │
│        WHERE id_plan = $MAGNUS->id_plan_agent   │
│        Comparar: se cheaper que plan rate,      │
│                  usa package_offer do agente    │
│                          ↓                      │
│                                                  │
│  5. EXECUTA HOOKS CUSTOMIZADOS                 │
│     Verifica:                                   │
│     - /beforeSearchTariff.php (antes)           │
│     - /AfterSearchTariff.php (depois)           │
│                                                  │
│     Permite lógica de business customizada      │
│                          ↓                      │
│                                                  │
│  6. RETORNA tariffObj[]                        │
│     Contém todos os campos necessários para     │
│     calcular timeout e custo                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Estrutura da Tarifa (tariffObj)

```php
tariffObj[0] = [
    'id_rate'           => 123,           // ID da tarifa
    'id_plan'           => 5,             // ID do plano
    'id_prefix'         => 45,            // ID do prefixo
    'dialprefix'        => '11',          // Prefixo discado
    'rateinitial'       => '0.05',        // Preço por minuto
    'initblock'         => 60,            // Segundos iniciais
    'billingblock'      => 1,             // Incremento (1 = por segundo)
    'connectcharge'     => '0.02',        // Taxa de conexão
    'minimal_time_charge' => 60,          // Tempo mínimo cobrado
    'package_offer'     => 0 ou 1,        // Oferece minutos grátis?
    'id_trunk_group'    => 8,             // Grupo de troncos a usar
    'trunk_group_type'  => 1|2|3,         // Tipo de seleção
    'timeout'           => 600,           // Tempo máximo calculado
];
```

## Exemplo Prático

```
Usuário: João Costa
Plano: Simples (id_plan = 3)
Crédito: R$ 10,00 (600 segundos de crédito)
Disca: 11987654321

1. Monta cláusula:
   prefixclause = "(prefix='1' OR prefix='11' OR ...)"

2. Busca melhor rate:
   SELECT * FROM pkg_rate 
   WHERE id_plan = 3 AND status = 1 AND prefixclause
   ORDER BY LENGTH(prefix) DESC LIMIT 1
   
   Encontra: prefix='11', rateinitial=0.10 R$/min, initblock=60s

3. Busca custom rate:
   SELECT * FROM pkg_user_rate
   WHERE id_user = 5 AND id_prefix = 12
   Não encontra → usa padrão do plano

4. Calcula timeout:
   timeout = 600 segundos ÷ (0.10 R$/min × 1 min)
   timeout = 600 ÷ 0.10 = 6000 minutos? Não!
   
   Na verdade:
   - Conectcharge = 0.02 R$ (deduz)
   - Credito = 600 - 0.02 = 599.98
   - Se initblock = 60s por 0.10 R$ = 0.10 R$ por minuto
   - timeout = 599.98 ÷ (0.10/60) = 359,988 segundos
   
   Mas existe max_call_duration global (ex: 3600s = 1h)
   
   Portanto: timeout = 3600 segundos (1 hora)

5. Dialplan:
   DIAL(SIP/tronco/11987654321, 3600, options)
```

## Ofertas (Free Minutes)

Se `package_offer == 1` e usuário tem `id_offer` ativo:

```
Busca em pkg_offer_use:
  - Verifica se oferta está ativa
  - Verifica tipo (unlimited, N calls, N minutes)
  
Se tipo = 0 (unlimited):
  timeout = max_call_duration (chamada grátis)
  
Se tipo = 1 (N free calls):
  Se chamadas usadas < chamadas permitidas:
    freecall = true, timeout = max_call_duration
    
Se tipo = 2 (N free minutes):
  Se minutos restantes > 0:
    freetimetocall_left = minutos restantes
    Desconta apenas quando expira oferta
```

---

# 🎯 Resumo: Fluxos por Tipo de Chamada

## Outbound (PSTN)
1. Autenticação (5 métodos)
2. Verifica restrições
3. Seleciona tarifa (SearchTariff)
4. Calcula timeout (CalcAgi)
5. Tenta tronco(s) (number_try)
6. Registra CDR & deduz crédito

## Inbound (DID)
1. Identifica DID
2. Valida limites
3. Verifica horário
4. Roteia para destino (IVR/Queue/SIP)
5. Registra CDR com sell_price

## Queue
1. Entra em fila
2. Aguarda agente
3. Se timeout: aplica ação alternativa
4. Registra tempo em fila como billing

## IVR
1. Reproduz menu
2. Coleta DTMF
3. Roteia baseado em seleção
4. Loop até sair (max 10)

---

# 📚 Referência Rápida: Tabelas Principais

| Tabela | Propósito |
|--------|-----------|
| `pkg_user` | Usuários, crédito, plano, restrições |
| `pkg_sip` | Ramais SIP, forwards, gravação, etc |
| `pkg_iax` | Contas IAX2 |
| `pkg_rate` | Tarifas por prefixo e plano |
| `pkg_user_rate` | Tarifas customizadas por usuário |
| `pkg_trunk` | Troncos PSTN (SIP/IAX) |
| `pkg_did` | DIDs inbound configurados |
| `pkg_did_destination` | Rotas para cada DID (prioridade) |
| `pkg_queue` | Filas e agentes |
| `pkg_ivr` | Menus IVR |
| `pkg_cdr` | Call Detail Records (cobrança) |
| `pkg_offer`, `pkg_offer_use` | Ofertas de minutos grátis |
| `pkg_queue_status` | Status atual de chamadas em fila |

---

Documento criado para auxiliar no entendimento de todos os fluxos de chamadas
do MagnusBilling. Consulte o código-fonte e comentários inline para detalhes técnicos.
