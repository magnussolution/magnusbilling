
.. _trunkGroup-name:

Nome
----

| Nome para o grupo de troncos, recomendável usar nomes amigáveis para facilitar a administração das tarifas.




.. _trunkGroup-type:

Tipo
----

| Tipo.
| É como o sistema vai ordenar os troncos que pertence ao grupo.
| 
| * Em ordem. O sistema vai enviar a chamada para os troncos na ordem que está selecionado.
| * Aleatório. O sistema ordena os troncos de forma aleatória, usando a função RAND() do MYSQL, por tanto, poderá se repetir um tronco em sequência.
| * LCR. Ordena pelo tronco que tiver um custo menor. Se o provedor que o tronco pertence não tiver tarifa, será desconsiderado e colocado por último.
| 
| O MagnusBilling vai enviar as chamadas para os troncos que estão neste grupo, até que a chamada seja atendida, ocupado ou cancelada.
| 
| O MagnusBilling tentará enviar a chamada para o próximo tronco do grupo desde que o tronco testado responda CHANUNAVAIL ou CONGESTION, estes valores são retornados pelo Asterisk, e não é possível alterar.
| 
| 
| .




.. _trunkGroup-id-trunk:

Troncos
-------

| Selecionar os troncos que pertenceram a este grupo. Se for selecionado o tipo, em ordem, então selecione os troncos na ordem desejada.




.. _trunkGroup-weight:

Peso
----

| Esta opção é para balancear as chamadas por peso.
| Exemplo. 
| 
| Digamos que tenha selecionado 3 troncos, e você deseja enviar 1 chamada para primeiro tronco, 2 para o segundo e 1 para o terceiro, então, neste exemplo, coloque neste campo 1,2,1.



