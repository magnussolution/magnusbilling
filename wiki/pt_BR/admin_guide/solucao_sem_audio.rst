solução sem áudio
=================

Quando a chamada completa, mas o áudio não passa, normalmente o problema está relacionado a **RTP, NAT ou firewall**, e não diretamente ao MagnusBilling.

Por favor, verifique os pontos abaixo:

1. **Abrir as portas RTP no firewall do servidor**
Por padrão o MagnusBilling já tem estas portas abertas, mas se você tem uma configuração de firewall personalizada, por favor certifique-se de que as seguintes portas estão abertas.

```bash
10000:60000/udp
```

Verifique se estas portas estão abertas no firewall do servidor, no firewall da nuvem, roteador ou security group.

2. **Verificar as configurações de NAT do Asterisk**

Edite o arquivo:

```bash
/etc/asterisk/sip.conf
```

Confirme se o IP público do servidor está configurado corretamente, por exemplo:


* externip=IP_PUBLICO_DO_SEU_SERVIDOR
* localnet=SUA_REDE_LOCAL/MASCARA
* nat=force_rport,comedia

Depois recarregue o SIP:

```bash
asterisk -rx "sip reload"
```

3. **Verificar se os pacotes RTP estão chegando no servidor**

Durante uma chamada de teste, execute:

```bash
tcpdump -n udp portrange 10000-60000
```

Se não aparecerem pacotes RTP, o áudio está sendo bloqueado antes de chegar ao servidor.

4. **Testar com Directmedia desativado**

Se o Directmedia estiver ativado, o áudio pode tentar passar diretamente entre o cliente e o provedor, causando áudio mudo ou áudio somente para um lado, principalmente em cenários com NAT.

Veja a documentação:
https://wiki.magnusbilling.org/pt-br/source/get_started/first_call.html#directmedia

5. **Testar com outro provedor ou outra conta SIP**

Este teste ajuda a identificar se o problema está:

* no dispositivo/softphone do cliente;
* no provedor SIP;
* no firewall/NAT;
* ou na configuração do servidor.

Documentação útil:
https://wiki.magnusbilling.org/pt-br/source/get_started/first_call.html
https://wiki.magnusbilling.org/pt-br/source/get_started/quick_install.html

Se depois destes testes o problema continuar, por favor nos envie:

* data e horário de uma chamada de exemplo;
* número de origem;
* número de destino;
* provedor usado;
* e se o problema é sem áudio nos dois lados ou áudio somente para um lado.
