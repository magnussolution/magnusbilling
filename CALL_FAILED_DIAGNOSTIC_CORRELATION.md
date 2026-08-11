# Diagnóstico de CDR Failed — correlação e contrato proposto

Data da investigação: 2026-07-27.

Escopo: MagnusBilling 8 somente. Esta investigação não altera Magnus Sentinel,
schema, `app_mbilling`, Asterisk, formato do evento, serviços ou dados do piloto.

## Decisão

A versão inicial pode correlacionar os registros pela combinação
`(uniqueid, id_server)`. O `uniqueid` sozinho não é suficiente em uma frota:
foi comprovado no piloto que o mesmo valor pode existir em servidores
diferentes e representar chamadas distintas.

O identificador é o `uniqueid` do **canal de origem da chamada**. Ele não é o
identificador do canal de saída e não identifica isoladamente uma tentativa de
trunk. Todas as tentativas realizadas pela mesma execução da chamada recebem o
mesmo valor; `id_trunk`, `event_time` e `id` distinguem e ordenam os eventos.

Não é necessário introduzir `linkedid` ou `correlation_id` nesta versão porque
o CDR failed também persiste `id_server`. O backend deve preservar o
`uniqueid` bruto, consultar pelo índice `ix_uniqueid` e restringir o resultado
ao servidor do CDR. Chamadas sem correspondência exata nos dois campos
continuam inconclusivas e nunca podem ser associadas silenciosamente por
número e horário.

## Fontes verificadas

- MagnusBilling 8 `source` no commit
  `3717e26615a1730e262d8f8020b91729bc9e18ef`.
- `resources/asterisk/Magnus.php:118-124`: o objeto usado para gravar o CDR
  recebe `agi_uniqueid`.
- `resources/asterisk/CalcAgi.php:954-985`: o fluxo de falha grava
  `$MAGNUS->uniqueid` em `pkg_cdr_failed`, diretamente ou pelo `CallCache.php`.
- `protected/commands/ImportCdrCSV_CCommand.php:89-130`: a importação CSV
  preserva o primeiro campo como `uniqueid`.
- fonte da `app_mbilling` para Asterisk 20:
  `app_mbilling_asterisk_20.c:4681-4684` copia
  `ast_channel_uniqueid(chan)`; `:6750` emite esse mesmo valor no evento de
  resposta da tentativa.
- o binário instalado no piloto contém `ast_channel_uniqueid` e o formato
  `Magnus|%d|%s|%s|%d|%s`.
- o `CallCache.php` instalado no piloto também grava
  `$MAGNUS->uniqueid` em `pkg_cdr_failed`.
- MariaDB 10.11.18 do piloto, consultado exclusivamente em transações
  `READ ONLY`, com `ROLLBACK`, `MAX_STATEMENT_TIME` e limites explícitos.

O diretório instalado no piloto não é um checkout Git, portanto não fornece
commit verificável. A estrutura e os trechos relevantes foram comparados com o
checkout acima.

## Significado dos identificadores

| Campo/conceito | Significado comprovado | Persistido |
|---|---|---|
| `pkg_cdr_failed.uniqueid` | `agi_uniqueid` do canal de origem | sim |
| `pkg_magnus_sentinel_trunk_event.uniqueid` | mesmo `uniqueid` do canal de origem naquele servidor, passado a cada tentativa | sim |
| canal de saída | canal tecnológico criado pelo Dial para o trunk | não |
| tentativa de trunk | evento identificado por servidor, chamada, trunk e ordem temporal | parcialmente; não há ID próprio |
| `linkedid` | identificador Asterisk da árvore da chamada | não |
| `correlation_id` | identificador de correlação dedicado | não existe |
| `pkg_cdr_failed.sessionid` | coluna disponível, mas não alimentada no fluxo do piloto | 5.000/5.000 nulos na amostra |
| `pkg_cdr_failed.callerid` | Caller ID final persistido no CDR failed | sim |
| `pkg_magnus_sentinel_trunk_event.callerid` | Caller ID efetivamente registrado para cada tentativa de trunk | sim, por evento |

O identificador comum é, portanto, de chamada de origem. Uma tentativa deve ser
exposta com um identificador derivado apenas para o contrato, por exemplo
`attempt-1`, sem apresentá-lo como um ID persistido.

## Amostra e resultado

O piloto continha:

- 477.284 CDRs failed entre `2026-07-23 17:38:22` e
  `2026-07-27 19:22:24`;
- 4.362.347 eventos entre `2026-07-23 12:00:57` e
  `2026-07-27 19:23:46`.

Foram selecionados os 1.000 CDRs failed mais recentes de cada dia disponível,
totalizando 5.000 registros e 5.000 `uniqueid` distintos. A consulta partiu da
chave primária do CDR e executou busca exata no índice `ix_uniqueid` dos
eventos.

| Dia | Amostra | Com evento exato | Sem evento | Um evento | Mais de um evento | Mais de um trunk |
|---|---:|---:|---:|---:|---:|---:|
| 2026-07-23 | 1.000 | 999 | 1 | 266 | 733 | 733 |
| 2026-07-24 | 1.000 | 1.000 | 0 | 401 | 599 | 599 |
| 2026-07-25 | 1.000 | 996 | 4 | 272 | 724 | 724 |
| 2026-07-26 | 1.000 | 999 | 1 | 264 | 735 | 735 |
| 2026-07-27 | 1.000 | 999 | 1 | 702 | 297 | 297 |
| **Total** | **5.000** | **4.993 (99,86%)** | **7 (0,14%)** | **1.905** | **3.088** | **3.088** |

Os 4.993 casos da coluna “Com evento exato” possuem igualdade de `uniqueid` e
ao menos um evento no mesmo servidor do CDR, correspondendo a **99,86%** da
amostra. Em 4.991 houve também ao menos um evento no mesmo trunk registrado no
CDR. Os dois casos restantes ainda possuem igualdade exata de chamada e
servidor, mas a divergência de trunk deve aparecer como limitação técnica.

O máximo observado foi de três eventos por CDR e dois trunks distintos. A
ordem correta é `event_time ASC, id ASC`; `event_time` sozinho não desempata
eventos no mesmo instante.

### Colisão comprovada entre servidores

O exemplo `1784910159.159421` demonstrou por que `uniqueid` não pode ser usado
sozinho. A consulta exata retornou eventos nos servidores 7 e 8:

| Servidor | Horário | Trunk | Resposta |
|---:|---|---:|---|
| 8 | 2026-07-24 13:22:43 | 277 | `617 Unknown` |
| 7 | 2026-07-24 13:22:44 | 277 | `615 Unknown` |
| 7 | 2026-07-24 13:22:48 | 256 | `615 Unknown` |
| 8 | 2026-07-24 13:22:50 | 256 | `617 Unknown` |

Uma narrativa que misturasse essas quatro linhas seria falsa. Para um CDR do
servidor 7, a história correta contém somente 13:22:44 e 13:22:48; para um CDR
do servidor 8, somente 13:22:43 e 13:22:50.

A parte inteira `1784910159` é o Unix timestamp do momento em que o INVITE
originou o canal (`2026-07-24 13:22:39` em America/Sao_Paulo). A parte após o
ponto é uma sequência do Asterisk, não uma fração de segundo.

### Interpretação dos sete registros sem evento

Os sete casos incluem CDRs com diferentes trunks, servidores nulos ou
preenchidos e diferentes causas finais. A ausência não prova que nenhum trunk
foi chamado. Ela pode representar, entre outras possibilidades não
comprovadas:

- falha anterior ao ponto que emite o evento;
- evento já fora da retenção disponível;
- atraso ou lacuna da coleta;
- caminho de chamada que não emitiu o evento esperado.

Não foi usada correlação por número, caller ID ou proximidade temporal para
preencher essa lacuna.

## Compatibilidade com múltiplos trunks e tentativas

O mesmo `uniqueid` aparece em eventos de trunks diferentes. Isso é comportamento
esperado: o valor representa a chamada de origem e permanece estável enquanto
a `app_mbilling` tenta o próximo trunk.

O contrato deve:

1. retornar todos os eventos exatos até o limite;
2. manter cada código e motivo bruto;
3. ordenar por `event_time` e `id`;
4. numerar as entradas na resposta, sem inventar ID persistente;
5. considerar o último evento apenas como o último **observado**, não
   necessariamente como resultado final da chamada quando a evidência estiver
   incompleta;
6. sinalizar truncamento caso o limite seja alcançado.

## Plano de consulta

Fluxo proposto, sem mudança de schema:

1. buscar `pkg_cdr_failed` por `id = :cdrFailedId` (chave primária);
2. carregar as relações de usuário, plano, prefixo, trunk e servidor no
   backend;
3. verificar a existência das tabelas Sentinel por metadados;
4. buscar eventos com
   `WHERE uniqueid = :uniqueid AND id_server = :id_server
   AND event_time BETWEEN :event_window_start AND :event_window_end
   ORDER BY event_time ASC, id ASC LIMIT :limit`;
   a janela cobre do horário do INVITE ao horário persistido no CDR, com cinco
   minutos de margem em cada lado; horário nunca é usado como correlação ou
   fallback;
5. usar `ix_uniqueid`; o plano verificado no piloto foi `ref`, estimativa de
   uma linha;
6. obter saúde apenas da pequena
   `pkg_magnus_sentinel_component_health`, quando existir.

O limite inicial proposto é 50 eventos. O backend deve solicitar 51 linhas para
calcular `truncated` e retornar no máximo 50.

## Verificações operacionais atuais

Após autorização adicional, o diagnóstico também consulta o estado **atual**
dos trunks comprovadamente observados. Essa informação ajuda o operador, mas
não é apresentada como causa histórica da chamada.

- PJSIP: `pjsip show endpoint <trunkcode>`;
- chan_sip: `sip show peer <trunkcode>`;
- transporte: AMI já configurado no MagnusBilling;
- MASTER e slaves: conexão direta ao Asterisk correspondente por AMI;
- nenhum acesso por HTTP, SSH ou shell;
- no máximo três trunks distintos por diagnóstico;
- o nome do endpoint vem exclusivamente do banco e passa por allowlist antes
  de compor um dos dois comandos fixos;
- a resposta bruta do AMI não é retornada ao navegador.

O resultado diferencia `available`, `unavailable`, `no_contact`, `not_found`,
`not_monitored`, trunk desativado e falha da própria verificação. IPs
comprovados na configuração ou na saída do endpoint são verificados no
Fail2ban, usando internamente `pkg_firewall` no mesmo servidor e considerando
como bloqueios atuais somente ações `0` e `1`. Entradas CIDR também são
verificadas de forma limitada.

O Caller ID é carregado diretamente de
`pkg_magnus_sentinel_trunk_event.callerid` para cada tentativa. Isso permite
mostrar valores diferentes por trunk depois de reescritas como `cid_remove`,
`cid_add`, CNL ou hooks, sem reutilizar silenciosamente o Caller ID final do
CDR. Um evento com o campo vazio retorna `event_callerid_empty`.

## Contrato proposto

Media type lógico: `magnusbilling.call-diagnostic/v1`.

O endpoint futuro será `POST`, autenticado e exclusivo para administrador. A
entrada contém somente:

```json
{
  "cdrFailedId": 123
}
```

Resposta proposta:

```json
{
  "contract": "magnusbilling.call-diagnostic/v1",
  "status": "confirmed",
  "summary": "A chamada recebeu resposta de ocupado na última tentativa observada.",
  "call": {
    "cdrFailedId": 123,
    "uniqueid": "1785188714.1274726",
    "startedAt": "2026-07-27T18:45:14-03:00",
    "source": "conta_sip",
    "callerId": "5511999999999",
    "calledNumber": "5511888888888",
    "user": {"id": 10, "username": "cliente"},
    "plan": {"id": 20, "name": "Plano"},
    "prefix": {"id": 30, "destination": "Brasil"},
    "cdrTrunk": {"id": 255, "name": "Trunk A"},
    "server": {"id": 5, "name": "Servidor 1"}
  },
  "history": {
    "invite": {
      "at": "2026-07-27 18:45:14",
      "unixTimestamp": 1785188714,
      "uniqueid": "1785188714.1274726",
      "server": {"id": 5, "name": "Servidor 1"},
      "source": "uniqueid_epoch"
    },
    "entries": [
      {
        "sequence": 1,
        "eventTime": "2026-07-27 18:45:20",
        "secondsAfterInvite": 6,
        "secondsAfterPrevious": 6,
        "isNextTrunk": false,
        "trunk": {"id": 255, "name": "Trunk A"},
        "raw": {"code": 486, "reason": "Busy Here"},
        "callerIdSent": {
          "available": true,
          "value": "5511999999999",
          "source": "pkg_magnus_sentinel_trunk_event.callerid",
          "reason": null
        },
        "currentTrunkStatus": {
          "checked": true,
          "status": "available",
          "source": "asterisk_ami_pjsip_show_endpoint",
          "technology": "pjsip",
          "endpoint": "Trunk A",
          "latencyMs": 18.4,
          "contactIps": ["198.51.100.10"],
          "firewall": {
            "checked": true,
            "blocked": false,
            "checkedIps": ["198.51.100.10"],
            "matches": [],
            "source": "fail2ban"
          }
        },
        "sentinelAlerts": []
      }
    ]
  },
  "attempts": [
    {
      "sequence": 1,
      "eventId": 5000001,
      "eventTime": "2026-07-27T18:45:20-03:00",
      "trunk": {"id": 255, "name": "Trunk A"},
      "server": {"id": 5, "name": "Servidor 1"},
      "raw": {"code": 486, "reason": "Busy Here"},
      "callerIdSent": {
        "available": true,
        "value": "5511999999999",
        "source": "pkg_magnus_sentinel_trunk_event.callerid",
        "reason": null
      },
      "currentTrunkStatus": {
        "checked": true,
        "status": "available",
        "source": "asterisk_ami_pjsip_show_endpoint",
        "firewall": {
          "checked": true,
          "blocked": false,
          "checkedIps": ["198.51.100.10"],
          "matches": []
        }
      },
      "sentinelAlerts": [],
      "classification": {
        "key": "busy",
        "label": "Destino ocupado",
        "confidence": "high",
        "catalog": "magnusbilling.call-diagnostic-catalog/v1"
      }
    }
  ],
  "operationalFindings": [],
  "runtimeChecks": {
    "scope": "current",
    "checkedAt": "2026-07-28 12:00:00",
    "items": [],
    "truncated": false
  },
  "trunkAlerts": {
    "available": true,
    "scope": "active_now",
    "checkedAt": "2026-07-27 22:30:00.000000",
    "trunks": [
      {
        "trunk": {"id": 255, "name": "Trunk A"},
        "activeAlerts": []
      }
    ],
    "truncated": false
  },
  "lastObservedResult": {
    "sequence": 1,
    "raw": {"code": 486, "reason": "Busy Here"},
    "classificationKey": "busy"
  },
  "facts": [
    {
      "key": "exact_uniqueid_server_match",
      "text": "O evento possui o mesmo identificador e servidor do CDR failed."
    }
  ],
  "probableCause": {
    "key": "destination_busy",
    "text": "O destino estava ocupado na última tentativa observada.",
    "confidence": "high",
    "basis": ["sip_code_486"]
  },
  "recommendedActions": [
    {
      "key": "retry_later",
      "text": "Tente novamente mais tarde.",
      "safety": "safe"
    }
  ],
  "limitations": [],
  "evidence": {
    "sentinelAvailable": true,
    "correlation": "exact_uniqueid_server",
    "pipeline": {
      "status": "HEALTHY",
      "checkedAt": "2026-07-27T22:30:00Z"
    },
    "retention": {
      "earliestEventAt": "2026-07-23T12:00:57-03:00",
      "possiblyExpired": false
    },
    "eventLimit": 50,
    "returnedEvents": 1,
    "truncated": false
  },
  "technicalDetails": {
    "cdrTerminateCauseId": 2,
    "cdrHangupCause": 486,
    "rawUniqueid": "1785188714.1274726",
    "correlationServerId": 5,
    "queryOrder": ["event_time", "id"]
  }
}
```

Todos os textos provenientes do banco, especialmente `response_reason`, nomes
e números, são dados não confiáveis. O JSON deve ser gerado pelo encoder do
framework e a ExtJS Window deve renderizá-los como texto, nunca como HTML.

## Semântica de status

### `confirmed`

- tabela de eventos disponível;
- uma ou mais correspondências exatas;
- pipeline aplicável saudável;
- evidência suficiente para uma conclusão suportada pelo catálogo;
- resposta não truncada de forma que possa ocultar o último evento.

### `partial`

- há correspondência exata, mas a evidência pode estar incompleta;
- pipeline `STALE` ou `UNHEALTHY`;
- resultado truncado;
- divergência relevante entre o trunk final do CDR e os trunks observados;
- último evento não permite conclusão terminal segura.

### `inconclusive`

- Sentinel não instalado;
- nenhum evento exato;
- evento possivelmente fora da retenção;
- CDR recente ainda sem correlação;
- somente códigos ou motivos sem semântica comprovada.

`inconclusive` nunca gera o texto “o trunk não foi chamado”.

## Catálogo determinístico proposto

O catálogo será versionado separadamente como
`magnusbilling.call-diagnostic-catalog/v1`. Cada regra possui códigos exatos,
restrições opcionais de motivo explícito, classificação, confiança máxima,
resumo e ações seguras.

Regras mínimas:

| Evidência | Classificação | Observação |
|---|---|---|
| 486 | `busy` | destino ocupado |
| cancelamento comprovado/487 | `cancelled` | não atribuir culpa ao trunk |
| 404 ou 484 | `number_or_format` | diferenciar pelo motivo explícito |
| timeout comprovado | `timeout` | não inferir apenas de ausência de evento |
| 401/407 ou 403 com motivo explícito de credencial/IP | `authentication` | 403 genérico permanece rejeição |
| 403 explícito não relacionado a autenticação | `rejected` | preservar texto do provedor |
| 488 ou motivo explícito de mídia/codec | `codec_or_media` | 488 sem detalhe limita a precisão |
| 500, 503 e 504 | regras distintas | nunca usar regra genérica `>= 500` |
| 612–618 | `internal_unknown` | sem significado inventado |
| código desconhecido | `unknown` | bruto preservado, sem causa factual |

O texto do provedor pode elevar a confiança somente quando for explícito e
corresponder a uma regra restrita. Texto vago, ausente ou `Unknown` não eleva
confiança.

## Estados sem evidência

- tabela de eventos ausente: “Os detalhes avançados exigem Magnus Sentinel.”
- CDR anterior ao primeiro evento retido: “Os eventos desta chamada podem já
  ter expirado.”
- pipeline `STALE`/`UNHEALTHY`: “A evidência pode estar incompleta.”
- chamada recente sem evento exato: “Ainda não há evidência suficiente para
  concluir o que ocorreu.”

## Gate e implementação

O relatório e o contrato foram revisados e a continuação foi autorizada. A
implementação permanece exclusivamente no MagnusBilling 8 e não introduz
mudança de correlação ou schema.

Implementado:

- `POST index.php/callDiagnostic/cdrFailed`, exclusivo para administrador e
  com `cdrFailedId` como único dado de negócio aceito;
- `FailedCallDiagnosticService`, determinístico, local e versionado;
- consulta exata por `uniqueid + id_server`, usando `ix_uniqueid`, limitada à
  janela temporal da chamada, ordenada e limitada;
- estados de ausência, expiração, saúde da pipeline e truncamento;
- catálogo explícito sem regra genérica para códigos `>=500`;
- códigos internos 612–618 preservados como `internal_unknown`;
- ExtJS Window com conclusão e ação primeiro;
- história cronológica visível com chegada do INVITE, respostas de cada trunk
  e intervalos entre tentativas;
- alertas atualmente ativos do Magnus Sentinel por trunk tentado, sempre
  rotulados como estado no momento do diagnóstico e nunca como prova causal;
- estado atual de cada trunk via AMI, com comando fixo e limitado;
- bloqueio atual do IP do provedor no Fail2ban, restrito ao servidor da
  tentativa;
- Caller ID comprovado por tentativa a partir do próprio evento correlacionado;
- evidências, limitações e detalhes técnicos recolhidos;
- seções “Detalhes técnicos” e “Limitações do diagnóstico” removidas da Window
  para priorizar a narrativa operacional;
- `window.open`, leitura do log e redirecionamento para IP removidos;
- `actionCallInfo` legado desativado com HTTP 410;
- testes dos 17 cenários mínimos e escaping de dados não confiáveis.

A compilação dos quatro temas requer a restauração temporária de
`classic/src/Application.js`, removido anteriormente do branch `source` pelo
commit `348dfbf5`. O arquivo não integra esta mudança.
