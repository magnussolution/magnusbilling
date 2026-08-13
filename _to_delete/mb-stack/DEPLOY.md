# Deploy — MagnusBilling 8 no seu Swarm (nó MB, mb.di4e.com.br)

Este pacote sobe o MagnusBilling em container no seu Swarm, com CI/CD pelo seu
GitHub. Leia as três decisões de arquitetura antes — elas são o que faz o **áudio
funcionar** e o pipeline não te trair.

## As três decisões (e por que não são o pedido literal)

**1. Rede host para a voz, não a ingress do Swarm.**
SIP/RTP não sobrevivem à *routing mesh* do Swarm nem ao Traefik. A mesh faz SNAT
(perde o IP de origem) e o Traefik só fala HTTP — RTP por ali vira áudio mudo /
one-way. Por isso o serviço `app` (Asterisk+Apache+PHP) roda em `network: host`,
fixado no nó MB. É o padrão de quem roda Asterisk em Docker.

**2. Traefik entra só no painel, por arquivo dinâmico.**
Como `app` está em rede host, o Traefik não o descobre por label. O painel é
exposto em `<IP_MB>:8080` e o Traefik roteia via `traefik-dynamic-mb.yml`.
`mb.di4e.com.br` → HTTPS no Traefik → `http://IP_MB:8080`.

**3. Watchtower não gerencia serviços Swarm — trocamos por Portainer GitOps.**
Watchtower atua em containers standalone; serviços de um `stack deploy` no Swarm
ele não atualiza. E, para um core de telefonia com billing, auto-pull cego de
`:latest` é risco — um deploy quebra tarifação. O fluxo correto e "pull na VPS"
que você quer: **GitHub Actions builda a imagem → publica no GHCR → chama o
webhook do Portainer → o Portainer re-puxa a imagem e atualiza o serviço**.
(Se você fizer questão do Watchtower, só rodando `app` como container standalone
fora do Swarm — não recomendado aqui.)

## Estrutura do repositório

Estes arquivos vão para a **raiz do seu fork** (junto de `script/`, `protected/`,
`resources/`), porque o `Dockerfile` empacota o próprio código do fork:

```
Dockerfile
docker-compose.yml
.dockerignore
.env.example
traefik-dynamic-mb.yml
DEPLOY.md
docker/
  entrypoint.sh
  supervisord.conf
  asterisk/{asterisk,manager,pjsip,rtp}.conf.template
.github/workflows/build-and-deploy.yml
```

## Passo a passo

1. **Copie estes arquivos para o seu fork** e faça commit/push na branch `source`.
   O Actions vai buildar e publicar `ghcr.io/alvarovasques/magnusbilling:latest`.
   Torne o *package* GHCR público, ou cadastre credenciais do GHCR no Portainer
   (o `docker service update` usa `--with-registry-auth`).

2. **Firewall do nó MB** (crítico — voz precisa abrir, gestão precisa fechar):
   - Abrir para a internet: `5060/udp`, `5060/tcp`, `${RTP_START}-${RTP_END}/udp`.
   - **Fechar** para a internet: `3306/tcp` (banco), `8080/tcp` (só Traefik/nó),
     `5038/tcp` (AMI já está em 127.0.0.1). Restrinja `5060` às faixas de IP da
     sua operadora quando possível — trava de fraude nº 1.

3. **Traefik**: coloque `traefik-dynamic-mb.yml` no dynamic-config do seu Traefik,
   preencha `<IP_DO_NÓ_MB>` e ajuste `entryPoints`/`certResolver` para os nomes
   que você já usa. Confirme que o DNS `mb.di4e.com.br` aponta para o Traefik.

4. **Suba a stack no Portainer** (Stacks → Add stack → do repositório Git, ou cole
   o `docker-compose.yml`). Cadastre as variáveis do `.env.example` (senhas fortes,
   `PUBLIC_IP` = IP público do nó MB). Nomeie a stack `mb` (serviços viram
   `mb_app` e `mb_db`). Ative o **webhook** da stack e cole a URL no secret
   `PORTAINER_WEBHOOK_URL` do GitHub.

5. **Secrets do GitHub** (repo → Settings → Secrets):
   - `PORTAINER_WEBHOOK_URL` — webhook da stack no Portainer.
   - (GHCR usa o `GITHUB_TOKEN` automático.)

6. **Primeiro boot**: o `entrypoint` espera o banco, importa `script/database.sql`
   e sobe Asterisk+Apache+cron. Login inicial do painel: **root / magnus** —
   **troque imediatamente** e restrinja o acesso.

7. **Validação (definição de "funcionou")**:
   - `https://mb.di4e.com.br` abre o painel.
   - No container: `docker exec -it <app> asterisk -rx "pjsip show transports"`.
   - Cadastre o **trunk da operadora** (interconexão) e um **ramal de teste**;
     complete **uma chamada de saída tarifada** e **uma entrante** por um DID seu,
     com CDR gravado e saldo debitado.

## Fluxo de atualização (dia a dia)

`git push` na branch `source` → Actions builda e publica no GHCR → webhook do
Portainer → serviço `mb_app` atualiza no nó MB. Rollback: no Portainer, aponte o
serviço para a tag `:<sha>` anterior (as imagens ficam versionadas por commit).

## Confiança / o que validar no primeiro build

Alta confiança na topologia (rede host, Traefik por arquivo, GitOps Portainer) e
na fidelidade ao `install.sh` (caminhos, DB, AMI, cron, includes). O ponto que
pode pedir 1–2 iterações é a **compilação do Asterisk 20** no Dockerfile
(seleção de módulos `menuselect`) — valide o primeiro build e ajuste os
`--enable/--disable` se algum módulo faltar. Não é um risco de arquitetura, é de
compilação.

## Nota honesta de engenharia

Muita operadora roda o core de voz do MagnusBilling em VM/bare-metal justamente
para fugir das questões de mídia em container. A abordagem daqui é válida e
alinhada ao seu stack (Swarm+Portainer+Traefik+GitOps), desde que a rede host e o
firewall estejam como descrito. Se algum dia a voz precisar de HA real, o caminho
é OpenSIPS na borda (já vem no fork) balanceando 2+ nós Asterisk — não a ingress
do Swarm.
