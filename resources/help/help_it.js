Help.load({
	'alarm.type' : ``,
	'alarm.period' : ``,
	'alarm.condition' : ``,
	'alarm.amount' : ``,
	'alarm.email' : ``,
	'alarm.status' : ``,
	'api.id_user' : `È necessario utilizzare l'API Magnusbilling da https://github.com/magnussolution/magnusbilling-asi-php.
	Il proprietario del nome utente questa API`,
	'api.api_key' : `Questa chiave APY sarà necessaria per eseguire l'API`,
	'api.api_secret' : `Questo segreto apice sarà necessario per eseguire l'API`,
	'api.status' : `Puoi attivare o inattivare questa API`,
	'api.action' : `Quale azione l'utente sarà eseguito`,
	'api.api_restriction_ips' : `Quali IPS vuoi permettere di accedere a questa API.
	Lascia vuoto per consentire qualsiasi IP.
	È molto raccomandato impostare l'IPS`,
	'call.starttime' : `Ora di inizio della chiamata`,
	'call.src' : `SIP utente che ha effettuato la chiamata`,
	'call.callerid' : `Numero inviato al tronco come identificatore della chiamata. ||
	Se il tronco accetta il callerid inviato, questo numero verrà utilizzato come identificatore.
	Per questo lavoro sarà necessario avere il campo Fromer nel bagagliaio vuoto.`,
	'call.calledstation' : `Numero composto dal client.`,
	'call.idPrefixdestination' : `Nome della destinazione, questo nome è una relazione con il menu Prefisso.`,
	'call.idUserusername' : `Utente che ha effettuato la chiamata, da cui è stato preso il costo della chiamata.`,
	'call.idTrunktrunkcode' : `Tronco che è stato usato per completare la chiamata.`,
	'call.sessiontime' : `Durata della chiamata in pochi secondi.`,
	'call.buycost' : `Comprare il costo.
	Clicca per capire come è calcolato il costo | https://wiki.magnusbilling.org/en/source/price_calculation.html.`,
	'call.sessionbill' : `Prezzo di vendita, il valore preso dal cliente.
	Clicca per capire come è calcolato il costo | https://wiki.magnusbilling.org/en/source/price_calculation.html.`,
	'call.agent_bill' : `Prezzo di vendita, il valore preso dal cliente.
	Clicca per capire come è calcolato il costo | https://wiki.magnusbilling.org/en/source/price_calculation.html.`,
	'call.uniqueid' : `ID univoco generato da Asterisk, questo campo è anche l'ora di inizio della chiamata in Epoch Unix.`,
	'callarchive.calledstation' : `Numero composto dal client.`,
	'callarchive.sessiontime' : `Durata della chiamata in pochi secondi.`,
	'callarchive.buycost' : `Comprare il costo.
	Clicca per capire come è calcolato il costo | https://wiki.magnusbilling.org/en/source/price_calculation.html`,
	'callarchive.sessionbill' : `Comprare il costo.
	Clicca per capire come è calcolato il costo | https://wiki.magnusbilling.org/en/source/price_calculation.html`,
	'callarchive.agent_bill' : `Comprare il costo.
	Clicca per capire come è calcolato il costo | https://wiki.magnusbilling.org/en/source/price_calculation.html`,
	'callback.id_user' : `Proprietario del fatto che ha ricevuto la richiesta di callback.`,
	'callback.exten' : `Numero di chi ha chiamato l'ha richiesto il callback`,
	'callback.status' : `Stato della chiamata || Gli stati sono: * attivo La callback non è stata ancora elaborata.
	* In attesa di Magnusbilling elaborato il callback e lo ha inviato al tronco.
	* Inviato la callback è stata elaborata con successo.
	* Al di fuori del campo dell'intervallo, la chiamata è stata ricevuta al di fuori della gamma di tempo configurata nel menu DED, scheda Callback Pro.
	.`,
	'callerid.id_user' : `Seleziona utente.`,
	'callerid.cid' : `Il numero a CID autentica con CallingCard.
	Utilizzare il formato esatto che hai ricevuto il callerid dal tuo provider.`,
	'callerid.name' : `Opzionale.`,
	'callerid.description' : `Descrizione del callerid.`,
	'callerid.activated' : `Stato del callerid.`,
	'callonline.idUserusername' : `Utente principale dell'utente SIP che ha avviato la chiamata.`,
	'callonline.sip_account' : `SIP utente che ha richiesto la chiamata.`,
	'callonline.idUsercredit' : `Credito utente.`,
	'callonline.ndiscado' : `Numero composto.`,
	'callonline.codec' : `Codec utilizzato.`,
	'callonline.callerid' : `Il numero callid.`,
	'callonline.tronco' : `Tronco che è stato usato per completare la chiamata.`,
	'callonline.reinvite' : `Reinvite è il parametro che informa se l'audio sta passando attraverso l'asterisco o se sta attraversando il client e il tronco.
	Clicca per ulteriori informazioni su questa opzione | https://wiki.magnusbilling.org/en/source/asterisk_options/directmedia.html.`,
	'callonline.from_ip' : `IP del chiamante.`,
	'callonline.description' : `Dati dal comando SIP Show Channel.`,
	'callshopcdr.id_user' : `Utente.`,
	'callsummarycallshop.sumsessiontime' : `Somma dei minuti di chiamata.`,
	'callsummarycallshop.sumprice' : `Valore complessivo.`,
	'callsummarycallshop.sumlucro' : `Somma dei guadagni.`,
	'callsummarycallshop.sumbuycost' : `Somma del costo del compratore.`,
	'callsummarycallshop.sumnbcall' : `Totale delle chiamate.`,
	'callsummarydayagent.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummarydayagent.sumsessionbill' : `Somma del prezzo di vendita.`,
	'callsummarydayagent.sumbuycost' : `Somma del costo del compratore.`,
	'callsummarydayagent.sumlucro' : `Somma dei guadagni.`,
	'callsummarydayagent.sumnbcall' : `Totale delle chiamate.`,
	'callsummarydaytrunk.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummarydaytrunk.sumsessionbill' : `Somma del prezzo di vendita.`,
	'callsummarydaytrunk.sumbuycost' : `Somma del costo del compratore.`,
	'callsummarydaytrunk.sumlucro' : `Somma dei guadagni.`,
	'callsummarydaytrunk.sumnbcall' : `Totale delle chiamate.`,
	'callsummarydayuser.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummarydayuser.sumlucro' : `Somma dei guadagni.`,
	'callsummarydayuser.sumnbcall' : `Totale delle chiamate.`,
	'callsummarymonthdid.sumsessionbill' : ``,
	'callsummarymonthdid.sumsessiontime' : ``,
	'callsummarymonthdid.sumnbcall' : ``,
	'callsummarymonthtrunk.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummarymonthtrunk.sumsessionbill' : `Somma del prezzo di vendita.`,
	'callsummarymonthtrunk.sumbuycost' : `Somma del costo del compratore.`,
	'callsummarymonthtrunk.sumlucro' : `Somma dei guadagni.`,
	'callsummarymonthtrunk.sumnbcall' : `Totale delle chiamate.`,
	'callsummarymonthuser.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummarymonthuser.sumlucro' : `Somma dei guadagni.`,
	'callsummarymonthuser.sumnbcall' : `Totale delle chiamate.`,
	'callsummaryperday.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummaryperday.sumsessionbill' : `Somma del prezzo di vendita.`,
	'callsummaryperday.sumbuycost' : `Somma del costo del compratore.`,
	'callsummaryperday.sumlucro' : `Somma dei guadagni.`,
	'callsummaryperday.sumnbcall' : `Totale delle chiamate.`,
	'callsummaryperday.sumnbcallfail' : `Totale delle chiamate che hanno fallito.`,
	'callsummarypermonth.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummarypermonth.sumsessionbill' : `Somma del prezzo di vendita.`,
	'callsummarypermonth.sumbuycost' : `Somma del costo del compratore.`,
	'callsummarypermonth.sumlucro' : `Somma dei guadagni.`,
	'callsummarypermonth.sumnbcall' : `Totale delle chiamate.`,
	'callsummarypertrunk.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummarypertrunk.sumsessionbill' : `Somma del prezzo di vendita.`,
	'callsummarypertrunk.sumbuycost' : `Somma del costo del compratore.`,
	'callsummarypertrunk.sumlucro' : `Somma dei guadagni.`,
	'callsummarypertrunk.sumnbcall' : `Totale delle chiamate.`,
	'callsummarypertrunk.sumnbcallfail' : `Totale delle chiamate che hanno fallito.`,
	'callsummaryperuser.sumsessiontime' : `Somma dei minuti di chiamata. || È possibile utilizzare i filtri come mostrare solo gli ultimi giorni della settimana o un rivenditore specifico.
	Questo riassunto mostrerà solo i dati relativi al filtro effettuato.`,
	'callsummaryperuser.sumlucro' : `Somma dei guadagni.`,
	'callsummaryperuser.sumnbcall' : `Totale delle chiamate.`,
	'callsummaryperuser.sumnbcallfail' : `Totale delle chiamate che hanno fallito.`,
	'campaign.id_user' : `Utente che possiede la campagna.`,
	'campaign.id_plan' : `Quale piano vuoi usare per Bill questa campagna?`,
	'campaign.name' : `Nome della campagna.`,
	'campaign.status' : `Stato della campagna.`,
	'campaign.startingdate' : `La campagna inizierà da questa data.`,
	'campaign.expirationdate' : `La campagna si fermerà in questa data.`,
	'campaign.type' : `Scegli voce o SMS.
	Se scegli la voce, è necessario importare audio.
	Se si sceglie SMS è necessario impostare il testo nella scheda SMS.`,
	'campaign.audio' : `Disponibile per la calma massiccia.
	L'audio deve essere compatibile con l'asterisco.
	Il formato consigliato è GSM o WAV (8K Hz MONO).`,
	'campaign.audio_2' : `Se si utilizza TTS, il nome verrà eseguito tra Audio e Audio2.`,
	'campaign.restrict_phone' : `Attivazione di questa opzione, Magnusbilling controllerà se il numero che verrà inviato alla chiamata è registrato nel menu Limita del telefono, se lo è, il sistema cambierà lo stato del numero da bloccato e non invierà la chiamata.`,
	'campaign.auto_reprocess' : `Se non ci sono numeri attivi in questa rubrica telefonica della campagna, riattiva tutti i numeri in sospeso.`,
	'campaign.id_phonebook' : `Seleziona una o più rubinetti da utilizzare da utilizzare.`,
	'campaign.digit_authorize' : `Vuoi inoltrare la chiamata dopo l'audio?
	E.G, se il callee preme 1, viene inviato a SIP User XXXX.
	Set Numero da inoltrare = 1, Avanti Type = SIP e selezionare l'utente SIP per inviare il callee a.
	Set -1 per disabilitare.`,
	'campaign.type_0' : `Scegli il tipo di reindirizzamento.
	Ciò invierà la chiamata alla destinazione scelta.`,
	'campaign.id_ivr_0' : `Scegli un IVR per inviare la chiamata a.
	L'IVR deve appartenere al proprietario della campagna.`,
	'campaign.id_queue_0' : `Scegli una coda per inviare la chiamata a.
	La coda deve appartenere al proprietario della campagna.`,
	'campaign.id_sip_0' : `Scegli un utente SIP per inviare la chiamata a.
	L'utente SIP deve appartenere al proprietario della campagna.`,
	'campaign.extension_0' : `Clicca per maggiori dettagli || Ci sono due opzioni disponibili.
	* Gruppo, il nome del gruppo dovrebbe essere messo qui esattamente in quanto è negli utenti SIP che dovrebbero ricevere le chiamate.
	* Personalizzato, è possibile eseguire qualsiasi opzione valida tramite il comando di comando di Asterisk.
	Esempio: SIP / SiPaccount, 45, TTR.`,
	'campaign.record_call' : `Registrare le chiamate della campagna.
	Saranno registrati solo se la chiamata viene trasferita.`,
	'campaign.daily_start_time' : `Tempo che la campagna inizierà a inviare.`,
	'campaign.daily_stop_time' : `Tempo che la campagna interromperà l'invio.`,
	'campaign.monday' : `Attivazione di questa opzione Il sistema invierà le chiamate il lunedì.`,
	'campaign.tuesday' : `Attivazione di questa opzione Il sistema invierà le chiamate al martedì.`,
	'campaign.wednesday' : `Attivazione di questa opzione Il sistema invierà le chiamate mercoledì.`,
	'campaign.thursday' : `Attivazione di questa opzione Il sistema invierà chiamate il giovedì.`,
	'campaign.friday' : `Attivazione di questa opzione Il sistema invierà le chiamate il venerdì.`,
	'campaign.saturday' : `Attivazione di questa opzione Il sistema invierà chiamate il sabato.`,
	'campaign.sunday' : `Attivazione di questa opzione Il sistema invierà le chiamate la domenica.`,
	'campaign.frequency' : `Quanti numeri verranno elaborati al minuto? || Questo valore sarà diviso per 60 secondi e le chiamate verranno inviate ogni minuto allo stesso tempo.`,
	'campaign.max_frequency' : `Questo è il valore massimo che il cliente sarà in grado di impostare.
	Se lo si imposta su 50 l'utente sarà in grado di passare a qualsiasi valore 50 o inferiore a 50.`,
	'campaign.nb_callmade' : `Utilizzato per controllare le chiamate massime completate.`,
	'campaign.enable_max_call' : `Se Attivato Magnusbilling controllerà quante chiamate sono già state apportate e hanno una durata totale più grande dell'U-Audio.
	Se la quantità è uguale o maggiore del valore impostato nel campo, la campagna sarà disattivata.`,
	'campaign.secondusedreal' : `Quantità massima di chiamate complete.
	È necessario attivare il campo sopra per usarlo.`,
	'campaign.description' : ``,
	'campaign.tts_audio' : `Con questa impostazione il sistema genererà l'audio 1 per la campagna tramite TTS. || Affinché questo funzioni, è necessario impostare l'URL TTS in Impostazioni, configurazione, URL TTS.`,
	'campaign.tts_audio2' : `La stessa impostazione del campo precedente ma per Audio 2. Tieni presente che tra Audio 1 e 2, il TTS esegue il nome importato con il numero.`,
	'campaigndashboard.name' : `Nome della campagna.`,
	'campaignlog.total' : `Totale delle chiamate.`,
	'campaignpoll.id_campaign' : `Scegli la campagna che eseguirà questo sondaggio.`,
	'campaignpoll.name' : `Nome del sondaggio.
	Questo nome è visto solo sulla tua fine.`,
	'campaignpoll.repeat' : `Quante volte è necessario ripetere l'audio del sondaggio se il client non ha premuto alcuna opzione valida. || È possibile controllare quali sono le opzioni sotto la scheda opzione.`,
	'campaignpoll.request_authorize' : `In alcuni casi, è necessario richiedere la conformità al fine di eseguire il sondaggio.
	Se è così, selezionare Sì.`,
	'campaignpoll.digit_authorize' : `Cifra per autorizzare l'esecuzione del sondaggio.`,
	'campaignpoll.arq_audio' : `File audio.
	Si prega di utilizzare un file audio GSM o WAV 8KHZ MONO.`,
	'campaignpoll.description' : `Descrizione del sondaggio.`,
	'campaignpoll.option0' : `Descrivi% 20the% 20option || Esempio% 20Poll:% 20% 20% 20% 20Questo% 20 VaiL% 20you% 20Voote% 20Per?% 20% 20% 20% 20Press% 201% 20FOR% 20OPTION% 20ONE% 20% 20% 20
	% 20Press% 202% 20 Pensione% 20Option% 20Two% 20% 20% 20% 20Press% 203% 20FOR% 20Option% 20three% 20% 20% 20% 20% 20% 20% 20% 20 ..% 20image ::% 20
	../img/poll_optiontions.png%20%20%20%20:scale :%20100%%20%20%20%20%20%20%20%20%20Questa%20Settings%20will%20e%20usefund%20
	% 20reading% 20La% 20POLL% 20Summary.`,
	'campaignpoll.option1' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option2' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option3' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option4' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option5' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option6' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option7' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option8' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpoll.option9' : `Descrivi l'opzione.
	Leggi la descrizione dell'opzione 0.`,
	'campaignpollinfo.number' : `Numero della persona che ha votato.`,
	'campaignpollinfo.resposta' : `Opzione scelta.`,
	'campaignrestrictphone.number' : `Numero che dovrebbe essere bloccato.
	È necessario attivare l'opzione dei numeri bloccati nella campagna.`,
	'configuration.config_value' : `Valore.
	Clicca qui per leggere di più sulle opzioni di questo menu. | https://wiki.magnusbilling.org/en/source/config.html.`,
	'configuration.config_description' : `Descrizione.
	Clicca qui per leggere di più sulle opzioni di questo menu. | https://wiki.magnusbilling.org/en/source/config.html`,
	'did.did' : `Il numero esatto proveniente dal contesto in Asterisk.
	Ti consigliamo di utilizzare sempre il formato E164.`,
	'did.record_call' : `Record chiama per questo.
	Registrato indipendentemente dalla destinazione.`,
	'did.activated' : `Solo i numeri attivi possono ricevere chiamate.`,
	'did.callerid' : `Utilizzare questo campo per impostare un nome chiamante o lasciarlo vuoto per utilizzare il callerid ricevuto dal provider di had.`,
	'did.connection_charge' : `Costo di attivazione.
	Questo valore verrà detratto dal client nel momento in cui l'ha fatto è associato all'utente.`,
	'did.fixrate' : `Prezzo mensile
	Questo valore verrà detratto automaticamente ogni mese dal saldo dell'utente.
	Se il cliente non ha abbastanza credito, il fatto verrà annullato automaticamente.`,
	'did.connection_sell' : `Questo è il valore che verrà addebitato per ogni chiamata.
	Semplicemente prelevando la chiamata, questo valore verrà detratto.`,
	'did.minimal_time_charge' : `Tempo minimo per tariffa l'ha fatto.
	Se lo si imposta su 3 qualsiasi chiamata che con una durata inferiore non verrà addebitata.`,
	'did.initblock' : `Tempo minimo in secondi per comprare.
	Se lo si imposta su 30 e la durata della chiamata è 10, la chiamata verrà fatturata come 30.`,
	'did.increment' : `Questo definisce il blocco in cui il tempo di fatturazione della chiamata verrà incrementato, in secondi.
	Se impostato su 6 e la durata della chiamata è 32, la chiamata verrà fatturata come 36.`,
	'did.charge_of' : `L'utente che verrà addebitato per il costo del costo.`,
	'did.calllimit' : `Le chiamate simultanee massime per questo.`,
	'did.description' : `Puoi prendere appunti qui!`,
	'did.expression_1' : ``,
	'did.selling_rate_1' : `Prezzo al minuto se il numero corrisponde all'espressione regolare sopra.`,
	'did.block_expression_1' : `Impostare su Sì per bloccare le chiamate che corrispondono all'espressione regolare sopra.`,
	'did.send_to_callback_1' : `Invia questa chiamata a richiamare se si abbina con l'espressione regolamentare sopra.`,
	'did.expression_2' : `Come la prima espressione.
	Clicca per maggiori informazioni. | https://wiki.magnusbilling.org/en/source/modules/did/did.html`,
	'did.selling_rate_2' : `Prezzo al minuto se il numero corrisponde all'espressione regolare sopra.`,
	'did.block_expression_2' : `Impostare su Sì per bloccare le chiamate che corrispondono all'espressione regolare sopra.`,
	'did.send_to_callback_2' : `Invia questa chiamata a richiamare se si abbina con l'espressione regolamentare sopra.`,
	'did.expression_3' : `Come la prima espressione.
	Clicca per maggiori informazioni. | https://wiki.magnusbilling.org/en/source/modules/did/did.html`,
	'did.selling_rate_3' : `Prezzo al minuto se il numero corrisponde all'espressione regolare sopra.`,
	'did.block_expression_3' : `Impostare su Sì per bloccare le chiamate che corrispondono all'espressione regolare sopra.`,
	'did.send_to_callback_3' : `Invia questa chiamata a richiamare se si abbina con l'espressione regolamentare sopra.`,
	'did.cbr' : `Abilita il callback pro.`,
	'did.cbr_ua' : `Eseguire un audio.`,
	'did.cbr_total_try' : `Quante volte il sistema cercherà di restituire la chiamata?`,
	'did.cbr_time_try' : `Intervallo di tempo tra ogni tentativo, in pochi minuti.`,
	'did.cbr_em' : `Esegui un audio prima della risposta della chiamata.
	Il tuo fornitore ha bisogno di consentire ai primi media.`,
	'did.TimeOfDay_monFri' : `Esempio: se la tua azienda callback solo alla callee se la chiamata è stata inserita tra il 09: 00-12: 00 e 14: 00-18: 00 lunedì, tra questo intervallo di tempo il workaudio verrà riprodotto e quindi callback
	al callee.
	È possibile utilizzare più intervalli di tempo separati da |.`,
	'did.TimeOfDay_sat' : `Lo stesso ma per sabato.`,
	'did.TimeOfDay_sun' : `Lo stesso ma per domenica.`,
	'did.workaudio' : `Audio che verrà eseguito quando viene ricevuta una chiamata all'intervallo di tempo.`,
	'did.noworkaudio' : `Audio che verrà eseguito quando una chiamata viene ricevuta dall'intervallo di tempo.`,
	'diddestination.id_did' : `Seleziona il fatto che vuoi creare una nuova destinazione per.`,
	'diddestination.id_user' : `Utente che sarà il proprietario di questo.`,
	'diddestination.activated' : `Verranno utilizzate solo le destinazioni attive.`,
	'diddestination.priority' : `Puoi creare fino a 5 destinazioni per il tuo fatto.
	Se viene effettuata una prova e viene ricevuto un errore, Magnusbilling proverà a inviare la chiamata alla priorità della destinazione successiva disponibile.
	Funziona solo con il tipo "Chiamata SIP".`,
	'diddestination.voip_call' : `Tipo di destinazione.`,
	'diddestination.destination' : `Usa questo per prendere appunti!`,
	'diddestination.id_ivr' : `Seleziona un IVR per inviare la chiamata a.
	L'IVR ha bisogno di appartenere al proprietario dell'Aswell.`,
	'diddestination.id_queue' : `Seleziona una coda per inviare la chiamata a.
	La coda deve appartenere al proprietario del fatto.`,
	'diddestination.id_sip' : `Seleziona un utente SIP per inviare la chiamata a.
	L'utente SIP deve appartenere al proprietario del THE ASWELL.`,
	'diddestination.context' : ``,
	'diduse.id_did' : `Fatto numero.`,
	'diduse.month_payed' : `Il mese totale pagato a questo.`,
	'diduse.reservationdate' : `Giorno in cui l'ha fatto è stato riservato per l'utente.`,
	'firewall.ip' : `Indirizzo IP.`,
	'firewall.action' : `Con questa opzione contrassegnata su Sì, l'IP verrà inserito nell'elenco IP-Blacklist di Fail2ban e sarà bloccato per sempre.
	|| L'opzione non bloccherà l'IP momentaneamente in base ai parametri del file /etc/fail2ba/jail.local.
	Per impostazione predefinita, il IP sta per rimanere bloccato per 10 minuti`,
	'firewall.description' : `Queste informazioni vengono catturate dal file di registro /var/log/fail2ban.log ||
	È possibile tracciare questo registro con il comando tail -f /var/log/fail2ban.log.log`,
	'gauthenticator.username' : `L'utente che vuole attivare il token`,
	'gauthenticator.googleAuthenticator_enable' : ``,
	'gauthenticator.code' : `Il codice sarà necessario per disattivare il token.
	Nel caso in cui non si disponga del codice, sarà necessario disattivare tramite il database.`,
	'gauthenticator.google_authenticator_key' : `Questa chiave sarà necessaria per attivare il token in un ciclo cellulare diverso`,
	'groupmodule.id_group' : `Gruppo di utenti`,
	'groupmodule.id_module' : `Menù`,
	'groupuser.name' : `Nome del gruppo di utenti`,
	'groupuser.id_user_type' : `Tipo di gruppo.`,
	'groupuser.hidden_prices' : `Nascosto Tutti i prezzi amano, compra, vendiamo e profitti, agli utenti che utilizzano questo gruppo.`,
	'groupusergroup.name' : `Nome del gruppo`,
	'groupusergroup.user_prefix' : `Riempire questo campo, tutti gli utenti creati da un amministratore che utilizza questo gruppo verranno inizializzati con questo prefisso.`,
	'groupusergroup.id_group' : `Quali gruppi client avranno accesso al gruppo amministratore. ||
	Quando un amministratore che appartiene a questo login di gruppo, solo l'amministratore vedrà i dati del client dei gruppi selezionati`,
	'holidays.name' : `Nome delle vacanze`,
	'holidays.day' : `Giorno di vacanza`,
	'iax.id_user' : `L'utente di cui apparterrà un account IAX`,
	'iax.username' : `L'utente che verrà utilizzato per autenticare nel softphone`,
	'iax.secret' : `La password che verrà utilizzata per autenticare nel softphone`,
	'iax.callerid' : `Questo è il callerid che verrà mostrato nella loro destinazione, in chiamate esterne il fornitore dovrà consentire il CLI di essere identificati correttamente nella loro destinazione.`,
	'iax.disallow' : `In questa opzione sarà possibile disattivare i codec.
	Per disattivare tutti i codec e lasciarli disponibili all'utente solo ciò che selezioni di seguito, utilizzare "Usa tutto"`,
	'iax.allow' : `Codec che saranno accettati.`,
	'iax.host' : `"Dynamic" è un'opzione che consentirà all'utente di registrare il suo account in qualsiasi IP.
	Se si desidera autenticare l'utente con il proprio IP, compilare qui l'IP del client, lasciare vuoto il campo della password e inserire "insicure" per la porta / invito nella scheda "Informazioni aggiuntive"`,
	'iax.nat' : `Il cliente è dietro il NAT?
	Clicca qui per maggiori informazioni | https://www.voip-info.org/astisk-sip-nat/.`,
	'iax.context' : `Questo è il contesto che la chiamata verrà elaborata, per impostazione predefinita è impostato su "Fatturazione".
	Modifica solo se hai conoscenza di asterisco.`,
	'iax.qualify' : `Inviato il pacchetto "opzione" per verificare se l'utente è online. || Sintax: qualifica = xxx |
	No |
	Sì, dove XXX è il numero di millisecondi usati.
	Se "Sì", viene utilizzato il tempo configurato in SIP.CONF, 2 secondi è lo standard. Se si attiva "qualifica", l'asterisco invierà il comando "Opzione" per SIP Peer Regulary per verificare se il dispositivo è ancora online.
	Se il dispositivo non risponde all'opzione "Opzione" nel periodo di tempo impostato, l'asterisk prenderà in considerazione il dispositivo offline per le chiamate future. Questo stato può essere verificato con la funzione "SIP SHOW PEER XXXX", questa funzioni fornirà solo informazioni sugli stato
	al peer SIP che hanno "qualificato = sì".`,
	'iax.dtmfmode' : `Tipo di DTMF.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
	'iax.insecure' : `Se l'host è impostato su "Dynamic", questa opzione dovrà essere impostata su "NO".
	Per autenticare tramite IP e modificare la porta.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/asterisk-sip-insecure/.`,
	'iax.type' : `Il tipo di default è "amico", in altre parole possono fare e ricevere chiamate.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/astisk-sip-type/.`,
	'iax.calllimit' : `Totale delle chiamate simultanee consentite per questo account IAX.`,
	'ivr.name' : `Nome del IVR`,
	'ivr.id_user' : `Utente che possiede l'IVR`,
	'ivr.monFriStart' : `Intervallo settimanale di frequenza, può essere configurato con spostamenti multipli. || Esempio: supponendo che le ore di presentazione siano 08h a 12h e 14h a 19h.
	In questo caso la regola sarebbe 08: 00-12: 00 | 14: 00-19: 00`,
	'ivr.satStart' : `Intervallo di partecipazione nel sabato, può essere configurato con spostamenti multipli | | Esempio: supponendo che le ore di presenze nei sabato siano 08h a 13h.
	In questo caso la regola sarebbe 08: 00-13: 00`,
	'ivr.sunStart' : `Intervallo di frequenza di domenica, può essere configurato con più spostamenti || Esempio: supponendo che non ci siano ore di frequenza nella domenica.
	In questo caso la regola sarebbe 00: 00-00: 00`,
	'ivr.use_holidays' : `Se questa opzione è attivata, il sistema controllerà se c'è una vacanza registrata per il giorno, in caso affermativo, allora l'audio, non funziona, verrà riprodotto.`,
	'ivr.workaudio' : `Audio da giocare nelle ore di frequenza.`,
	'ivr.noworkaudio' : `Audio da giocare quando non sono ore di presenza`,
	'ivr.option_0' : `Seleziona la destinazione se viene premuto l'opzione 0.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_1' : `Selezionare la destinazione se viene premuto l'opzione 1.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_2' : `Selezionare la destinazione se viene premuta l'opzione 2.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_3' : `Selezionare la destinazione se viene premuta l'opzione 3.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_4' : `Selezionare la destinazione se viene premuto l'opzione 4.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_5' : `Selezionare la destinazione se viene premuta l'opzione 5.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_6' : `Selezionare la destinazione se viene premuta l'opzione 6.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_7' : `Selezionare la destinazione se viene premuta l'opzione 7.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_8' : `Selezionare la destinazione se viene premuta l'opzione 8.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_9' : `Seleziona la destinazione se viene premuta l'opzione.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_10' : `Selezionare la destinazione se non è stata selezionata nessuna delle opzioni.`,
	'ivr.direct_extension' : `L'attivazione di questa opzione sarà in grado di digitare un utente SIP per chiamarlo direttamente.`,
	'ivr.option_out_0' : `Seleziona la destinazione dell'opzione 0 è premuto.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_1' : `Selezionare la destinazione se viene premuto l'opzione 1.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_2' : `Selezionare la destinazione se viene premuta l'opzione 2.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_3' : `Selezionare la destinazione se viene premuta l'opzione 3.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_4' : `Selezionare la destinazione se viene premuto l'opzione 4.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_5' : `Selezionare la destinazione se viene premuta l'opzione 5.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_6' : `Selezionare la destinazione se viene premuta l'opzione 6.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_7' : `Selezionare la destinazione se viene premuta l'opzione 7.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_8' : `Selezionare la destinazione se viene premuta l'opzione 8.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_9' : `Selezionare la destinazione se viene premuta l'opzione 9.
	Lascialo in bianco se non volere alcuna azione`,
	'ivr.option_out_10' : `Selezionare la destinazione se non è stata selezionata nessuna delle opzioni.`,
	'logusers.id_user' : `Utente che ha eseguito l'azione.`,
	'logusers.id_log_actions' : `Tipo di azione.`,
	'logusers.ip' : `IP utilizzato per l'azione.`,
	'logusers.description' : `Quello che è stato fatto, normalmente è in JSON.`,
	'methodpay.show_name' : `Il nome che viene visualizzato nel pannello client.`,
	'methodpay.id_user' : `Il metodo di pagamento dell'utente.
	È possibile creare metodi di pagamento per amministratori o rivenditori.`,
	'methodpay.country' : `Solo per riferimento.`,
	'methodpay.active' : `Attiva questo se vuoi essere disponibile per i client.`,
	'methodpay.min' : `Valore minimo accettato.`,
	'methodpay.max' : `Valore massimo accettato.`,
	'methodpay.username' : `Metodo di pagamento dell'utente`,
	'methodpay.url' : `URL del metodo di pagamento, nella maggior parte dei casi i metodi che questo URL è già preconfigurato.`,
	'methodpay.fee' : `Commissione del metodo di pagamento.`,
	'methodpay.pagseguro_TOKEN' : `Token del metodo di pagamento.`,
	'methodpay.P2P_CustomerSiteID' : `Questo campo è esclusivo per alcuni metodi di pagamento.`,
	'methodpay.P2P_KeyID' : `Questo campo è esclusivo per alcuni metodi di pagamento.`,
	'methodpay.P2P_Passphrase' : `Questo campo è esclusivo per alcuni metodi di pagamento.`,
	'methodpay.P2P_RecipientKeyID' : `Questo campo è esclusivo per alcuni metodi di pagamento.`,
	'methodpay.P2P_tax_amount' : `Questo campo è esclusivo per alcuni metodi di pagamento.`,
	'methodpay.client_id' : `Questo campo è esclusivo per alcuni metodi di pagamento.`,
	'methodpay.client_secret' : `Questo campo è esclusivo per alcuni metodi di pagamento.`,
	'module.text' : `Nome del menu`,
	'module.icon_cls' : `Icona, carattere predefinito "Awesome V4".`,
	'module.id_module' : `Menu che appartiene questo menu.
	Nel caso in cui il menu sia vuoto, è un menu principale`,
	'module.priority' : `Ordina che il menu verrà visualizzato nel menu`,
	'offer.label' : `Nome del pacchetto gratuito`,
	'offer.packagetype' : `Tipo di pacchetto, ci sono 3 tipi.
	Chiamate illimitate, chiamate gratuite o secondi gratuiti.`,
	'offer.freetimetocall' : `In questo campo è dove verrà verificata la configurazione della quantità di quantità del pacchetto disponibile. || Esempio: * Chiamate illimitate: in questa opzione Il campo è vuoto, poiché sarà consentito chiamare senza alcun controllo. * Chiamate gratuite: configura la quantità di chiamate gratuite
	Vuoi dare. * Secondi liberi: configurare la quantità di secondi che si desidera consentire al client di chiamare.`,
	'offer.billingtype' : `Questo è il periodo in cui il pacchetto verrà calcolato. ||
	Guarda la descrizione: * Mensile: il sistema verificherà il giorno dell'attivazione del piano 30 giorni in cui il client ha raggiunto il limite del pacchetto. * Settimanale: il sistema verificherà il giorno dell'attivazione del piano 7 giorni in cui il client ha raggiunto il limite del pacchetto.`,
	'offer.price' : `Prezzo che verrà addebitato mensilmente al cliente. || Se nel giorno di scadenza il cliente non ha i fondi sufficienti per pagare il pacchetto Magnusbilling annullerà automaticamente il pacchetto.
	Nel menu Impostazioni, adjustss, esistono un'opzione denominata notifica di offerta del pacchetto, questo valore significa che quanti giorni sono rimasti fino alla scadenza del pacchetto, il sistema cercherà di caricare l'abbonamento, se il client non ha il saldo, Magnusbilling
	invierà un'e-mail al cliente che informa la mancanza di fondi. L'e-mail può essere modificata nel menu, nei modelli di posta elettronica, del tipo, del Plan_unpaid, della scadenza dell'oggetto del preavviso del piano mensile. Per inviare e-mail è necessario la configurazione di SMTP nel menu SMTP.
	Per imparare come funziona i pacchetti gratuiti: https://wiki.magnusbilling.org/en/source/offer.html.`,
	'offercdr.id_user' : `Utente di chiamata.`,
	'offercdr.id_offer' : `Nome dell'offerta.`,
	'offercdr.used_secondes' : `Durata della chiamata.`,
	'offercdr.date_consumption' : `Data e ora della chiamata.`,
	'offeruse.id_user' : `Utente che ha effettuato la chiamata.`,
	'offeruse.id_offer' : `Nome dell'offerta.`,
	'offeruse.month_payed' : `Mesi pagati.`,
	'offeruse.reservationdate' : `Data e ora che l'offerta è stata annullata.`,
	'phonebook.name' : `Nome della rubrica.`,
	'phonebook.status' : `Stato della rubrica.`,
	'phonebook.description' : `Descrizione della rubrica, solo controllo personale.`,
	'phonenumber.id_phonebook' : `Rubrica a cui appartiene questo numero.`,
	'phonenumber.number' : `Numero per inviare chiamate / SMS.
	Sempre deve essere utilizzato nel formato E164.`,
	'phonenumber.name' : `Nome del proprietario del numero, utilizzato per TTS o SMS`,
	'phonenumber.city' : `Città del cliente, non è richiesto il campo.`,
	'phonenumber.status' : `Magnusbilling proverà solo a inviare quando lo stato è attivo || Quando la chiamata viene inviata al provider, il numero rimane con lo stato in sospeso. Se la chiamata è completata, lo stato passa da inventato. Direzione in attesa, questo significa che il tuo
	Tronco ha rifiutato la chiamata e completato il sé per qualche motivo. Se è attivato nella campagna dell'opzione "Numeri bloccati", se il numero è registrato nelle "chiamate`,
	'phonenumber.info' : `Descrizione della rubrica, controllo personale solo || Se utilizzato per il sondaggio, verrà salvato qui qual è il numero del client digitato.`,
	'phonenumber.doc' : ``,
	'phonenumber.email' : ``,
	'plan.name' : `Plan Name.`,
	'plan.signup' : `Fare disponibile questo piano nel formulario dell'iscrizione.
	Se ha solo un piano, i client che registrano utilizzeranno questo piano, se c'è più di 1 piano, allora il client sarà in grado di scegliere.
	È necessario avere almeno 1 piano con questa opzione attivata per far funzionare i registri.`,
	'plan.ini_credit' : `La quantità di credito che si desidera dare ai clienti che registrati attraverso il formulario di iscrizione.`,
	'plan.play_audio' : `Esegui Audio per il cliente da questo piano o semplicemente inviare solo l'errore?
	Ad esempio, l'audio che non c'è più credito.`,
	'plan.techprefix' : `TechPrefix è come una password per il client, che consente l'uso di più piani.`,
	'plan.id_service' : `Seleziona qui i servizi che saranno disponibili per gli utenti di questo piano.`,
	'prefix.prefix' : `Codice prefisso.
	Il prefisso sarà utilizzato per tariffa e fatturare le chiamate.`,
	'prefix.destination' : `Nome destinazione.`,
	'provider.provider_name' : `Nome del provider`,
	'provider.credit' : `La quantità di credito che hai nel tuo account del tuo provider.
	Questo campo è facoltativo.`,
	'provider.credit_control' : `Se sei impostato su Sì e il credito del provider è <0, tutti i trunks da questo fornitore saranno disattivati.`,
	'provider.description' : `Descrizione al calendario, solo per l'autocontrollo.`,
	'queue.id_user' : `Utente che possiede la coda.`,
	'queue.name' : `Nome della coda.`,
	'queue.language' : `Linguaggio della coda.`,
	'queue.strategy' : `Strategia della coda.`,
	'queue.ringinuse' : `Chiamare o non gli agenti della coda che sono in chiamata.`,
	'queue.timeout' : `Per quanto tempo il telefono squillerà fino al timeout`,
	'queue.retry' : `La quantità di tempo in secondi che riprodurrà la chiamata.`,
	'queue.wrapuptime' : `Tempo in pochi secondi finché l'agente non può ricevere un'altra chiamata.`,
	'queue.weight' : `Priorità della coda.`,
	'queue.periodic-announce' : `È possibile creare una serie di annunci periodici separando ciascun annuncio per riprodurre con le virgole.
	E.G.: Code-periodico-annuncio, il tuo chiamato è importante, per favore attendi.
	Questi dati devono essere in / var / lib / asterisk / suoni / directory.`,
	'queue.periodic-announce-frequency' : `Quanto spesso fare un annuncio periodico.`,
	'queue.announce-position' : `Informa la posizione in coda.`,
	'queue.announce-holdtime' : `Dovremmo includere un tempo di attesa stimato negli annunci di posizione?`,
	'queue.announce-frequency' : `Quante volte annunciare la posizione della coda e / o stimato in attesa di holdtime al chiamante 0 = disattivato`,
	'queue.joinempty' : `Consenti alle chiamate quando non c'è nessuno a rispondere alla chiamata.`,
	'queue.leavewhenempty' : `Appendere le chiamate in coda quando non c'è nessuno a rispondere.`,
	'queue.max_wait_time' : `Tempo di attesa massimo in coda`,
	'queue.max_wait_time_action' : `SiPaccount, IVR, coda o canale locale per inviare il chiamante se viene raggiunto il tempo di attesa massimo.
	Uso: SIP / SIP_Account, Queue / Queue_Name, IVR / IVR_NAME o Local / Extension @ contesto.`,
	'queue.ring_or_moh' : `Riproduci musica in attesa o tono quando il client è in coda.`,
	'queue.musiconhold' : `Importa una musica in attesa a questa coda.`,
	'queuemember.queue_name' : `Queue che vuole aggiungere utente SIP.`,
	'queuemember.interface' : `SIP utente da aggiungere come un agente alla coda.`,
	'queuemember.paused' : `Gli agenti in pausa non riceveranno chiamate, è possibile mettere in pausa e disattivare la composizione * 180 per mettere in pausa, e * 181 per rimandare.`,
	'rate.id_plan' : `Il piano che vuoi creare una tariffa per.`,
	'rate.id_prefix' : `Il prefisso che vuoi creare una tariffa per.`,
	'rate.id_trunk_group' : `Il gruppo di trunks che verrà utilizzato per inviare questa chiamata.`,
	'rate.rateinitial' : `L'importo che si desidera caricare al minuto.`,
	'rate.initblock' : `Tempo minimo in secondi per comprare.
	Ad esempio, se impostato su 30 e la durata della chiamata è 21, verrà addebitato per 30 anni.`,
	'rate.billingblock' : `Questo definisce il modo in cui il tempo viene incrementato dopo il minimo.
	E.g, se impostato su 6S e la durata della chiamata è 32S, sarà beaplicato per 36.`,
	'rate.minimal_time_charge' : `Tempo minimo per tariffa.
	Se è impostato su 3, le chiamate solo tariffarie quando il tempo è uguale o superiore a 3 secondi.`,
	'rate.additional_grace' : `Ora aggiuntivo per aggiungere a tutte le chiamate durata.
	Se è impostato su 10, verrà aggiunto 10 secondi a tutta la durata del tempo di chiamata, questo influenza le tariffe.`,
	'rate.package_offer' : `Impostare su Sì se si desidera includere questa tariffa a un'offerta di pacchetti.`,
	'rate.status' : `Disattivazione delle tariffe, Magnusbilling rivolgerà completamente questa tariffa.
	Pertanto, l'eliminazione o la disattivazione avrà l'effetto SAM.`,
	'ratecallshop.dialprefix' : `Prefisso che vuole creare una tariffa.
	Questa tariffa sarà esclusiva per callshop.`,
	'ratecallshop.destination' : `Prefisso Nome destinazione.`,
	'ratecallshop.buyrate' : `Valore caricato al minuto nel callshop.`,
	'ratecallshop.minimo' : `Tempo minimo in secondi per tariffa.
	Es: Se è impostato su 30, qualsiasi calll che dura meno di 30 secondi verrà addebitato 30 secondi.`,
	'ratecallshop.block' : `Periodo di tempo che verrà addebitato dopo il tempo minimo.
	EX: Se è impostato su 6, ciò significa che completerà sempre fino a 6 secondi, pertanto, una chiamata che è durata 32 secondi verrà addebitata 36 secondi.`,
	'ratecallshop.minimal_time_charge' : `Tempo minimo per Tarrif.
	Es: Se è impostato su 3, solo le chiamate tariffarie che sono durate 3 o più secondi.`,
	'rateprovider.id_provider' : ``,
	'rateprovider.id_prefix' : `Prefisso.`,
	'rateprovider.buyrate' : `Importo pagato per minuto al fornitore.`,
	'rateprovider.buyrateinitblock' : `Tempo minimo in secondi per tariffa.
	Es: Se è impostato su 30, qualsiasi calll che dura meno di 30 secondi verrà addebitato 30 secondi.`,
	'rateprovider.buyrateincrement' : `Periodo di tempo che verrà addebitato dopo il tempo minimo.
	EX: Se è impostato su 6, ciò significa che completerà sempre fino a 6 secondi, pertanto, una chiamata che è durata 32 secondi verrà addebitata 36 secondi.`,
	'rateprovider.minimal_time_buy' : `Tempo minimo per Tarrif.
	Es: Se è impostato su 3, solo le chiamate tariffarie che sono durate 3 o più secondi.`,
	'refill.id_user' : `Utente che verrà realizzato la ricarica.`,
	'refill.credit' : `Ricaricabilità.
	Può essere un valore positivo o negativo, se il valore è negativo rimuoverà dalla quantità totale di credito del client.`,
	'refill.description' : `Descrizione al calendario, solo per l'autocontrollo.`,
	'refill.payment' : `Questa impostazione è solo per il controllo, il credito verrà rilasciato all'utente comunque se impostato sul pagamento no`,
	'refill.invoice_number' : `Numero di fattura.`,
	'refillprovider.id_provider' : `Nome dei fornitori.`,
	'refillprovider.credit' : `Valore di ricarica.`,
	'refillprovider.description' : `Utilizzato per il controllo interno.`,
	'refillprovider.payment' : `Questa opzione è solo al tuo controllo.
	Il credito autorizzato al cliente anche se è impostato su "no".`,
	'restrictedphonenumber.id_user' : `Utente che desidera registrare il numero.`,
	'restrictedphonenumber.number' : `Numero.`,
	'restrictedphonenumber.direction' : `Le chiamate sono analizzate in base alle opzioni selezionate.`,
	'sendcreditproducts.country' : `Nazione`,
	'sendcreditproducts.operator_name' : `Nome dell'operatore.`,
	'sendcreditproducts.operator_id' : `ID operatore.`,
	'sendcreditproducts.SkuCode' : `Culodesco`,
	'sendcreditproducts.product' : `Prodotto`,
	'sendcreditproducts.send_value' : `Invia valore`,
	'sendcreditproducts.wholesale_price' : `Prezzo di vendita.`,
	'sendcreditproducts.provider' : ``,
	'sendcreditproducts.status' : `Stato.`,
	'sendcreditproducts.info' : `Utilizzato per il controllo interno.`,
	'sendcreditproducts.retail_price' : ``,
	'sendcreditproducts.method' : ``,
	'sendcreditrates.idProductcountry' : `Nazione.`,
	'sendcreditrates.idProductoperator_name' : `Nome dell'operatore.`,
	'sendcreditrates.sell_price' : `Prezzo di vendita.`,
	'sendcreditsummary.id_user' : `Utente.`,
	'servers.name' : `Nome del server.`,
	'servers.host' : `IP del server.
	Clicca qui per saperne di più sui server slave e nei proxy | https://magnussolution.com/br/servicos/auto-desempenho/servidoor-slave.html.`,
	'servers.public_ip' : `IP pubblico`,
	'servers.username' : `Utente per connettersi al server.`,
	'servers.password' : `Password per connettersi al server.`,
	'servers.port' : `Porta per connettersi al server.`,
	'servers.sip_port' : `Porta SIP che il server utilizzerà.`,
	'servers.type' : `Tipo di server.`,
	'servers.weight' : `Questa opzione è di bilanciare le chiamate in peso. || Esempio.
	Diciamo che ci sono 1 server Magnusbilling e 3 server slave e si desidera inviare il doppio delle chiamate a ciascun slave, proporcionalmente al server Magnusbilling.
	Quindi imposta semplicemente il server Magnusbilling in peso 1 e per il peso dei server slave 2.`,
	'servers.status' : `Il proxy invierà solo chiamate ai server attivi e con peso superiore a 0.`,
	'servers.description' : `Utilizzato per il controllo interno.`,
	'services.type' : `Tipo di servizio.`,
	'services.name' : `Nome di Servizio.`,
	'services.calllimit' : `Limite di chiamate simultanee ..`,
	'services.disk_space' : `Inserire lo spazio totale del disco in GB.`,
	'services.sipaccountlimit' : `Valore massimo degli utenti SIP che questo client può creare.`,
	'services.price' : `Costo mensile per caricare il cliente che attiva questo servizio.`,
	'services.return_credit' : `Se questo servizio viene annullato prima della data di scadenza, e se questa opzione è impostata su "sì", verrà rimborsato il valore proporcionale dei giorni non utilizzati per il client.`,
	'services.description' : `Utilizzato per il controllo interno.`,
	'servicesuse.id_user' : `Utente che possiede il servizio.`,
	'servicesuse.id_services' : `Servizio.`,
	'servicesuse.price' : `Prezzo di servizio`,
	'servicesuse.method' : `Metodo di pagamento.`,
	'servicesuse.reservationdate' : `Attivazione del giorno di servizio.`,
	'sip.id_user' : `Utente con cui questo utente SIP è associato.`,
	'sip.defaultuser' : `Username utilizzato per accedere in un softphone o qualsiasi dispositivo SIP.`,
	'sip.secret' : `Password per accedere a un softphone o qualsiasi dispositivo SIP.`,
	'sip.callerid' : `Il numero ID del chiamante che verrà mostrato nella loro destinazione.
	Il tuo trunk ha bisogno di accettare cli.`,
	'sip.alias' : `Alias per quadrare tra gli utenti SIP dello stesso accountCode (Azienda).`,
	'sip.disallow' : `Non consentire tutti i codec e quindi selezionare i codec disponibili qui sotto per abilitarli all'utente.`,
	'sip.allow' : `Seleziona i codec che il trunk accetterà.`,
	'sip.host' : `Dynamic è un'opzione che consente all'utente di registrare il proprio account in qualsiasi IP.
	Se si desidera autenticare l'utente tramite IP, inserire il PI del client qui, consentono il campo della password vuota e impostalo su "Insicure" a por / invitare nella scheda Informazioni Adizionali.`,
	'sip.sip_group' : `Quando si invia una chiamata da DED, o campagna a un gruppo, verrà chiamato tutti gli utenti SIP che sono nel Gruppo.
	È possibile creare i gruppi con qualsiasi nome. || Viene utilizzato anche per acquisire le chiamate con * 8, è necessario configurare l'opzione "PickUPEXTEN = * 8" nel file "features.comf".`,
	'sip.videosupport' : `Attiva le videochiamate.`,
	'sip.block_call_reg' : `Bloccare le chiamate utilizzando Regex.
	Per bloccare le chiamate dai cellulari, basta inserirlo ^ 55 \\ d \\ d9.
	Clicca qui per visitare il link che prova Regex. | https://regex101.com.`,
	'sip.record_call' : `Registra chiamate di questo utente SIP.`,
	'sip.techprefix' : `Opzione utile per quando è necessario autenticare più di un client tramite IP che utilizza lo stesso IP.
	Comune in BBX Multi Tenant.`,
	'sip.nat' : `Nat.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/asterisk-sip-nat/`,
	'sip.directmedia' : `Se abilitato, Asterisk cerca di reindirizzare il flusso multimediale RTP per andare direttamente dal chiamante a Callee.`,
	'sip.qualify' : `Inviato il pacchetto "opzione" per verificare se l'utente è online. || Sintax: qualifica = xxx |
	No |
	Sì, dove XXX è il numero di millisecondi usati.
	Se "Sì", viene utilizzato il tempo configurato in sip.conf, 2 secondi è lo standard.
	Se si attiva "qualifica", l'asterisco invierà il comando "opzione" per SIP Peer Regulary per verificare se il dispositivo è ancora online. Se il dispositivo non risponderà all'opzione "Opzione" nel set di tempo, Asterisk si considererà
	Il dispositivo offline per le chiamate future.
	Questo stato può essere verificato con la funzionale "SIP show peer xxxx", questa funzionale fornirà solo informazioni di stato per il peer SIP che possiede "qualificati = sì.`,
	'sip.context' : `Questo è il contesto che la chiamata verrà elaborata, "fatturazione" è l'opzione standard.
	Cambia solo la configurazione se hai conoscenza di asterisco.`,
	'sip.dtmfmode' : `DTMF Tipo.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
	'sip.insecure' : `Questa opzione deve essere "no" se l'host è dinamico, quindi l'autenticazione IP cambia alla porta, invitare.`,
	'sip.deny' : `È possibile limitare il traffico SIP di un determinato IP o una rete.`,
	'sip.permit' : `È possibile consentire il traffico SIP di un determinato IP o di una rete.`,
	'sip.type' : `Il tipo standard è "amico", in altre parole, può effettuare e ricevere chiamate.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/astisk-sip-type/.`,
	'sip.allowtransfer' : `Abilita questo account VoIP per fare transfere.
	Il codice da trasferire è * 2 Ramal.
	È necessario attivare l'opzione ATXFER => * 2 nel file "Caratteristiche.conf" di asterisco.`,
	'sip.ringfalse' : `Attiva il falso anello.
	Aggiungi RR del comando "Dial".`,
	'sip.calllimit' : `Le chiamate simultanee massime consentite per questo utente SIP.`,
	'sip.mohsuggest' : `Aspetto musica per questo utente SIP.`,
	'sip.url_events' : `.`,
	'sip.addparameter' : ``,
	'sip.amd' : `.`,
	'sip.type_forward' : `Resenda il tipo di destinazione.
	Questa rivendita non funzionerà nelle code.`,
	'sip.id_ivr' : `Seleziona l'IVR che si desidera inviare a chiamate se l'utente SIP non risponde.`,
	'sip.id_queue' : `Selezionare la coda che si desidera inviare alle chiamate se l'utente SIP non risponde.`,
	'sip.id_sip' : `Seleziona gli utenti SIP che si desidera inviare a chiamate se l'utente SIP non risponde.`,
	'sip.extension' : ``,
	'sip.dial_timeout' : `Timeout in secondi per attendere che la chiamata venga prelevata.
	Dopo che il timeout verrà eseguito la canalizzazione se è configurata.`,
	'sip.voicemail' : `Attiva Voicemail.
	È necessario che la configurazione di SMTP in Linux riceva l'e-mail con il messaggio.
	Clicca qui per imparare come configurare lo smtp. | https://www.magnusbilling.org/br/blog-br/9-novidades/25-configurar-ssmtp-para-envior-voicemail-no-asterisk.html.`,
	'sip.voicemail_email' : `Email che verrà inviata l'e-mail con la segreteria telefonica.`,
	'sip.voicemail_password' : `PASSWORD VOICEMAIL.
	È possibile entrare nella voicemail digitando * 111`,
	'sip.sipshowpeer' : `SIP SHOW PEER.`,
	'siptrace.head' : `Corpo del messaggio SIP.`,
	'sipuras.nserie' : `Numero di serie Linksys.`,
	'sipuras.macadr' : `Indirizzo MAC Linksys.`,
	'sipuras.senha_user' : `Nome utente per accedere a Impostazioni Linksys`,
	'sipuras.senha_admin' : `Password per accedere in Impostazioni Linksys`,
	'sipuras.antireset' : `Sii cauto. * 73738`,
	'sipuras.Enable_Web_Server' : `Attenzione!
	Se disattivato, non sarà in grado di accedere nelle impostazioni Linksys.`,
	'sipuras.Proxy_1' : `Proxy 1.`,
	'sipuras.User_ID_1' : `Nome utente dell'utente SIP che verrà utilizzato in ATA LINEY 1.`,
	'sipuras.Password_1' : `SIP Password utente.`,
	'sipuras.Use_Pref_Codec_Only_1' : `Utilizzare solo il codec preferito`,
	'sipuras.Preferred_Codec_1' : `Imposta il codec preferito`,
	'sipuras.Register_Expires_1' : `Intervallo in secondi che Linksys invierà un registro al tuo server.
	Utile per evitare una perdita di connessione quando si riceve una chiamata.`,
	'sipuras.Dial_Plan_1' : `Leggi la documentazione Linksys.`,
	'sipuras.NAT_Mapping_Enable_1_' : `Si consiglia di attivare questa opzione se ATA è dietro il Nat.`,
	'sipuras.NAT_Keep_Alive_Enable_1_' : `Si consiglia di attivare questa opzione se ATA è dietro il Nat.`,
	'sipuras.Proxy_2' : `Proxy 2.`,
	'sipuras.User_ID_2' : `Nome utente dell'utente SIP che verrà utilizzato in ATA LINEY 1.`,
	'sipuras.Password_2' : `Password del conto VoIP.`,
	'sipuras.Use_Pref_Codec_Only_2' : `Utilizzare solo codec preferenziale.`,
	'sipuras.Preferred_Codec_2' : `Impostazioni del codec preferenziale.`,
	'sipuras.Register_Expires_2' : `Tempo in secondi in cui Linksys invia "Registrati" al server.
	Se riceverà chiamate in questa linea, è meglio impostarlo tra 120 e 480 secondi.`,
	'sipuras.Dial_Plan_2' : `Leggi la documentazione Linksys.`,
	'sipuras.NAT_Mapping_Enable_2_' : `Si consiglia di attivare questa opzione se ATA è dietro il Nat.`,
	'sipuras.NAT_Keep_Alive_Enable_2_' : `Si consiglia di attivare questa opzione se ATA è dietro il Nat.`,
	'sipuras.STUN_Enable' : `Attivare Stun server.`,
	'sipuras.STUN_Test_Enable' : `Convalidare periodicamente il server stordimento ..`,
	'sipuras.Substitute_VIA_Addr' : `Sostituisci Publia IP in Via.`,
	'sipuras.STUN_Server' : `Domain Domain Server.`,
	'sipuras.Dial_Tone' : ``,
	'sms.id_user' : `Utente che ha inviato / ha ricevuto l'SMS.`,
	'sms.telephone' : `Numero nel formato E164.`,
	'sms.sms' : `Testo SMS.`,
	'sms.sms_from' : ``,
	'smtps.host' : `Dominio SMST || È necessario verificare se il datacenter in cui il server verrà ospitato non bloccare le porte utilizzate da SMTP.`,
	'smtps.username' : `Nome utente utilizzato per autenticare il server SMTP.`,
	'smtps.password' : `Password utilizzata per autenticare il server SMTP.`,
	'smtps.port' : `Porta utilizzata dal server SMTP.`,
	'smtps.encryption' : `Tipo di crittografia.`,
	'templatemail.fromname' : `Questo è il nome che sarà utilizzato con il nome dall'e-mail.`,
	'templatemail.fromemail' : `L'e-mail utilizzata nella FromMail, deve essere la stessa email utilizzata dall'utente SMTP.`,
	'templatemail.subject' : `Oggetto dell'email.`,
	'templatemail.status' : `Questa opzione consente di disattivare le spedizioni esclusive di questa email.`,
	'templatemail.messagehtml' : `Messaggio.
	È possibile le variabili, guardare la scheda Variabili per vedere l'elenco delle variabili disponibili.`,
	'trunk.id_provider' : `Fornitore che è il trunk.`,
	'trunk.trunkcode' : `Il nome del tronco, deve essere unico.`,
	'trunk.user' : `Utilizzato solo se l'autenticazione è tramite nome utente e password.`,
	'trunk.secret' : `Utilizzato solo se l'autenticazione è tramite nome utente e password.`,
	'trunk.host' : `Dominio IP o Trunk.`,
	'trunk.trunkprefix' : `Aggiungi un prefisso da inviare al tuo trunk.`,
	'trunk.removeprefix' : `Rimuovere un prefisso da inviare al tuo trunk.`,
	'trunk.allow' : `Seleziona i codec consentiti in questo trunk.`,
	'trunk.providertech' : `È necessario installare l'unità appropriata per utilizzare la carta come DGV Extra Dongle.`,
	'trunk.status' : `Se il tronco è inattivo, Magnusbilling invierà la chiamata al trunk di backup.`,
	'trunk.allow_error' : `Se sì tutte le chiamate ma risposte e annulla verranno inviate a un trunk di backup.`,
	'trunk.register' : `Solo attivo questo se il trunk è autenticato tramite nome utente e password.`,
	'trunk.register_string' : `<utente>: <Password> @ <host> / Contact. || "User" è l'ID utente per questo server SIP (EX 2345). "Password" è la password utente "host" è il dominio del server SIP o il nome host
	. "Porta" Invia una sollecitazione del registro a questa porta host.
	Standard per 5060 "Contact" è l'estensione del contatto asterisco.
	ESEMPIO 1234 è impostato nell'intestazione del contatto del messaggio del registro SIP.
	Il Ramal Contact viene utilizzato dal server SIP da remoto quando è necessario per inviare una chiamata a Asterisk.`,
	'trunk.fromuser' : `Diversi provider richiedono questa opzione di autenticare, principalmente quando è autenticato tramite utente e password.
	Lascialo vuoto per inviare il callerid dell'utente SIP da.`,
	'trunk.fromdomain' : `Definisce il dominio dal dominio: nei messaggi SIP quando si comporta come un SIP UAC (client).`,
	'trunk.language' : `Lingua predefinita utilizzata in qualsiasi riproduzione () / sfondo ().`,
	'trunk.context' : `Cambia questo solo se sai cosa stai facendo.`,
	'trunk.dtmfmode' : ``,
	'trunk.insecure' : `Insicuro.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/astisk-sip-insecure/.`,
	'trunk.maxuse' : `Massima chiamata simultanea per questo trunk.`,
	'trunk.nat' : `È il tronco dietro Nat?
	Clicca qui per maggiori informazioni | https://www.voip-info.org/asterisk-sip-nat/.`,
	'trunk.directmedia' : `Se attivato, Asterisk proverà a inviare il supporto RTP direttamente tra il cliente e il fornitore.
	È necessario attivare anche il tronco.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/astisk-sip-canreinvite/.`,
	'trunk.qualify' : `Inviato il pacchetto "opzione" per verificare se l'utente è online. || Sintax: qualifica = xxx |
	No |
	Sì, dove XXX è il numero di millisecondi usati.
	Se "Sì", viene utilizzato il tempo configurato in sip.conf, 2 secondi è lo standard.
	Se si attiva "qualifica", l'asterisco invierà il comando "opzione" per SIP Peer Regulary per verificare se il dispositivo è ancora online. Se il dispositivo non risponderà all'opzione "Opzione" nel set di tempo, Asterisk si considererà
	Il dispositivo offline per le chiamate future.
	Questo stato può essere verificato con la funzionale "SIP show peer xxxx", questa funzionale fornirà solo informazioni di stato per il peer SIP che possiede "qualificati = sì.`,
	'trunk.type' : `Il tipo di default è "amico", in altre parole possono fare e ricevere chiamate.
	Clicca qui per maggiori informazioni | https://www.voip-info.org/astisk-sip-type/.`,
	'trunk.disallow' : `In questa opzione è possibile disattivare i codec.
	Utilizzare "Usa tutto" per disattivare tutti i codec e renderlo disponibile solo per l'utente che è stato selezionato di seguito.`,
	'trunk.sendrpid' : `Definisce se un compito di intestazione SIP SIP da partito a distanza da inviare. || Il valore predefinito è "no".
	Questo campo viene frequentemente utilizzato dai fornitori di grossisti VoIP per fornire l'identità dei chiamanti, indipendentemente dalle impostazioni della privacy (dall'intestazione SIP).`,
	'trunk.addparameter' : `QUESTI% 20Parametrers% 20 Will% 20BE% 20ADDED% 20IN% 20THE% 20FINAL% 20AGI% 20Command% 20-% 20dial% 20Command,% 20 Dove% 20IS% 20in% 20La% 20AJUST% 20SETTINGS% 20MENU. || Per% 20Default% 20La%
	20dial% 20Command% 20IS:, 60, l (% timeout%: 61000: 30000)% 20let% 27s% 20say% 20Chet% 20You% 20Want% 20to% 20ADD% 20an% 20Macro% 20in% 20TH% 20TRunk,% 20There prima% 20in
	% 20Questo% 20field% 20you% 20Will% 20ADD% 20TH% 20Parameter,% 20Set% 20IT% 20UP% 20M (Macro_Name)% 20and% 20Create% 20YOUR% 20Macro% 20in% 20TH% 20ASKISK% 20EXTIONS.`,
	'trunk.port' : `Se si desidera utilizzare una porta diversa da 5060, è necessario aprire la porta Iptables.`,
	'trunk.link_sms' : `URL% 20to% 20Send% 20sms.% 20Replace% 20the% 20Number% 20 Variable% 20to% 20% Numero %% 20and% 20Text% 20Per% 20% Testo%.% 20Esempio.% 20YOUR% 20SMS% 20URL% 20IS% 20HTTP: /
	/trunkwebsite.com/sendsms.php?user=magnus.`,
	'trunk.sms_res' : `Lascialo vuoto per non aspettare la risposta del provider.
	O scrivere il testo che deve consistere nella risposta dei fornitori per essere considerata inviata.`,
	'trunk.sip_config' : `Formato valido di Asterisk Sip.Conf, un'opzione per riga. || Esempio, diciamo che è necessario inserire il parametro USERAgent, quindi mettilo in questo campo: USERAgent = My Agent.`,
	'trunkgroup.name' : `Nome del gruppo del bagagliaio.`,
	'trunkgroup.type' : `Digitare. || È il modo in cui il sistema ordinerà il tronco che appartiene a un gruppo. * In ordine.
	Il sistema invierà una chiamata ai trunk che si trovano nell'ordine selezionato * casuale.
	Il sistema ordinerà i trunk in modo randomizzato, utilizzando la funzione Rand () di MySQL, quindi, sarà in grado di ripetere il tronco in sequenza. * LCR.
	Sorth i tronchi che hanno un costo inferiore.
	Se il proprietario del tronco non ha la tariffa, sarà discutibile e lo sarà all'ultimo.
	Magnusbilling invierà le chiamate ai tronchi che appartengono a questo gruppo, fino a quando le chiamate non riceveranno risposta, occupata o annullata.Magnusbilling cercherà di inviare le chiamate al trunk successivo del Gruppo purché il prossimo gruppo trunk testato risponderà a Chanunavail o congestione
	, questi sono i valori restituiti da asterisco, e non è possibile modificare.`,
	'trunkgroup.id_trunk' : `Seleziona i trunks che appartiene a questo gruppo.
	Se selezionato il tipo, l'ordine, quindi selezionare i trunk nell'ordine desiderato.`,
	'trunksipcodes.ip' : ``,
	'trunksipcodes.code' : ``,
	'trunksipcodes.total' : ``,
	'user.username' : `Nome utente utilizzato per accedere al pannello.`,
	'user.password' : `Password utilizzata per accedere al pannello.`,
	'user.id_group' : `Ci sono 3 gruppi: admin, agente e cliente.
	Puoi creare di più o modificare uno qualsiasi di questi gruppi.
	Ogni gruppo può avere autorizzazioni specifiche.
	Controllare il menu Configuration-> Gruppo utente.`,
	'user.id_group_agent' : `Seleziona il gruppo che i client di questo rivenditore utilizzati.`,
	'user.id_plan' : `Piano che verrà utilizzato per caricare i clienti.`,
	'user.language' : `Linguaggio.
	Questa lingua viene utilizzata per una funzione di sistema, ma non per il linguaggio del pannello.`,
	'user.prefix_local' : `Regole prefisso.
	Clicca qui per maggiori informazioni | https://www.magnusbilling.org/local_prefix`,
	'user.active' : ``,
	'user.country' : `Usato per cidire la callback.
	Il codice del prefisso del paese verrà aggiunto prima del CID per convertire il CID su E164`,
	'user.id_offer' : `Usato per dare minuti gratuiti.
	È necessario informare le tariffe che appartengono ai pacchetti liberi.`,
	'user.cpslimit' : `CPS (chiamate al secondo) limite a questo cliente.
	Le chiamate che superano questo limite saranno inviare la congestione.`,
	'user.company_website' : `Sito web dell'azienda. | Usato anche per la personalizzazione del pannello dell'agente.
	Per agente, impostare il dominio senza http o wwww.`,
	'user.company_name' : `Nome della ditta.
	Utilizzato anche per la personalizzazione del pannello dell'agente. | Se è un agente questo nome verrà utilizzato sul pannello di accesso.
	Hai bisogno di impostare il sito Web Compnay e utilizzare il dominio dell'agente per lavorare sulla personalizzazione`,
	'user.commercial_name' : `Marchio.`,
	'user.state_number' : `Numero di stato.`,
	'user.lastname' : `Cognome.`,
	'user.firstname' : `Nome di battesimo.`,
	'user.city' : `Città.`,
	'user.state' : `Stato.`,
	'user.address' : `Indirizzo.`,
	'user.neighborhood' : `Quartiere.`,
	'user.zipcode' : `Cap.`,
	'user.phone' : `Telefono fisso.`,
	'user.mobile' : `Cellulare.`,
	'user.email' : `Email, è necessario inviare notifiche di sistema.`,
	'user.doc' : `Documento client.`,
	'user.vat' : `Utilizzato in alcuni metodi di pagamento.`,
	'user.typepaid' : `I clienti pagati possono rimanere con saldo negativo fino al limite di credito informato nel campo sottostante.`,
	'user.creditlimit' : `Se l'utente è post-pagato, l'utente sarà in grado di effettuare chiamate fino a quando non raggiunge questo limite.`,
	'user.credit_notification' : `Se il credito del cliente diventa inferiore a questo valore di campo, Magnusbilling invierà un'e-mail all'intervento del cliente che è con bassi crediti.
	È necessario avere un server SMTP registrato nel menu Impostazioni.`,
	'user.enableexpire' : `Attiva scadisci.
	È necessario informare la data di scadenza nel campo "Data di scadenza".`,
	'user.expirationdate' : `La data in cui l'utente non sarà più in grado di effettuare chiamate.`,
	'user.calllimit' : `La quantità di chiamate simultanee consentita per questo client.`,
	'user.calllimit_error' : `Avvertenza da inviare se il limite di chiamata viene superato.`,
	'user.mix_monitor_format' : `Formato utilizzato per registrare le chiamate.`,
	'user.callshop' : `Attivare il modulo callshop.
	Solo attivo se davvero lo userete.
	È necessario dare la perdita al gruppo selezionato.`,
	'user.disk_space' : ``,
	'user.sipaccountlimit' : `La quantità di account VoIP consentiti da questo utente.
	Sarà necessario dare il permesso al gruppo per creare account VoIP.`,
	'user.callingcard_pin' : `Utilizzato per autenticare la carta telefonica.`,
	'user.restriction' : `Usato per limitare la composizione.
	Aggiungi i numeri nel menu: Utenti-> Numeri limitati.`,
	'user.transfer_international_profit' : `Questa funzione non è disponibile in Brasile.
	Si usa solo per le ricariche mobili in alcuni paesi.`,
	'user.transfer_flexiload_profit' : `Questa funzione non è disponibile in Brasile.
	Si usa solo per le ricariche mobili in alcuni paesi.`,
	'user.transfer_bkash_profit' : `Questa funzione non è disponibile in Brasile.
	Si usa solo per le ricariche mobili in alcuni paesi.`,
	'user.transfer_dbbl_rocket' : `Questa funzione non è disponibile in Brasile.
	Si usa solo per le ricariche mobili in alcuni paesi.`,
	'user.transfer_dbbl_rocket_profit' : `Questa funzione non è disponibile in Brasile.
	Si usa solo per le ricariche mobili in alcuni paesi.`,
	'user.transfer_show_selling_price' : `Questa funzione non è disponibile in Brasile.
	Si usa solo per le ricariche mobili in alcuni paesi.`,
	'userrate.id_prefix' : `Seleziona il prefisso che si desidera iscriverti.`,
	'userrate.rateinitial' : `Nuovo prezzo di vendita per questo prefisso.`,
	'userrate.initblock' : `Prezzo minimo di vendita.`,
	'userrate.billingblock' : `Blocco di vendita.`,
	'voucher.credit' : `Prezzo del buono.
	Clicca qui per sapere per configurare i buoni. | https://wiki.magnusbilling.org/en/source/how_to_use_voucher.html.`,
	'voucher.id_plan' : `Piano che sarà collegato al cliente che utilizzerà questo voucher.`,
	'voucher.language' : `Linguaggio che verrà utilizzato.`,
	'voucher.prefix_local' : `Regola che verrà utilizzata nel campo "Regola prefisso"`,
	'voucher.quantity' : `La quantità di buoni da generare.`,
	'voucher.tag' : `Descrizione al calendario, solo per l'autocontrollo.`,
	'voucher.voucher' : `Numero di voucher.,`,
});