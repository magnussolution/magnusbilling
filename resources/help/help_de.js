Help.load({
	'alarm.type' : ``,
	'alarm.period' : ``,
	'alarm.condition' : ``,
	'alarm.amount' : ``,
	'alarm.email' : ``,
	'alarm.status' : ``,
	'api.id_user' : `Sie brauchen die Magnetbilling-API von https://github.com/magnussolution/magnusbilling-api-php nutzen.
	Der Benutzername-Besitzer dieser API`,
	'api.api_key' : `Dieser APY-Schlüssel ist erforderlich, um die API auszuführen`,
	'api.api_secret' : `Dieses apy-Geheimnis wird notwendig sein, um die API auszuführen`,
	'api.status' : `Sie können diese API aktivieren oder inaktivieren`,
	'api.action' : `Welche Aktion hat der Benutzer ausgeführt?`,
	'api.api_restriction_ips' : `Welchen IPs möchten Sie auf diese API zulassen.
	Lassen Sie leer, um IP zuzulassen.
	Es ist sehr empfohlen, das IPS einzustellen`,
	'call.starttime' : `Startzeit des Anrufs`,
	'call.src' : `SIP-Benutzer, der den Anruf gemacht hat`,
	'call.callerid' : `Nummer, die als Kennung des Anrufs an den Trunk gesendet wurde. ||
	Wenn der Trunk den gesendeten CallerID akzeptiert, wird diese Nummer als Kennung verwendet.
	Um diese Arbeit erforderlich zu sein, muss es notwendig sein, das FromSer-Feld in der Trunk leer zu haben.`,
	'call.calledstation' : `Nummer des Clients gewählt.`,
	'call.idPrefixdestination' : `Name des Ziels, dieser Name ist eine Beziehung zum Präfix-Menü.`,
	'call.idUserusername' : `Benutzer, der den Anruf gemacht hat, derjenige, aus dem die Anrufkosten entnommen wurden.`,
	'call.idTrunktrunkcode' : `Trunk, der verwendet wurde, um den Anruf abzuschließen.`,
	'call.sessiontime' : `Dauer des Anrufs in Sekunden.`,
	'call.buycost' : `Kosten kaufen.
	Klicken Sie hier, um zu verstehen, wie die Kosten berechnet werden | https://wiki.magnusbilling.org/de/source/price_calculation.html.`,
	'call.sessionbill' : `Verkaufspreis, der Wert, der vom Kunden entnommen wurde.
	Klicken Sie hier, um zu verstehen, wie die Kosten berechnet werden | https://wiki.magnusbilling.org/de/source/price_calculation.html.`,
	'call.agent_bill' : `Verkaufspreis, der Wert, der vom Kunden entnommen wurde.
	Klicken Sie hier, um zu verstehen, wie die Kosten berechnet werden | https://wiki.magnusbilling.org/de/source/price_calculation.html.`,
	'call.uniqueid' : `Eindeutige ID, die von Asterisk generiert wird, dieses Feld ist auch die Startzeit des Anrufs in Epoche Unix.`,
	'callarchive.calledstation' : `Nummer des Clients gewählt.`,
	'callarchive.sessiontime' : `Dauer des Anrufs in Sekunden.`,
	'callarchive.buycost' : ``,
	'callarchive.sessionbill' : `Kosten kaufen.
	Klicken Sie hier, um zu verstehen, wie die Kosten berechnet werden | https://wiki.magnusbilling.org/de/source/price_calculation.html`,
	'callarchive.agent_bill' : `Kosten kaufen.
	Klicken Sie hier, um zu verstehen, wie die Kosten berechnet werden | https://wiki.magnusbilling.org/de/source/price_calculation.html`,
	'callback.id_user' : `Inhaber des Taten, der die Rückrufanforderung erhielt.`,
	'callback.exten' : `Anzahl derjenige, die den Rückruf angerufen hat`,
	'callback.status' : `Status des Anrufs || Die Status sind: * aktiv Der Rückruf wurde noch nicht verarbeitet.
	* Ausstehender Magnusbilling verarbeitet den Rückruf und schickte es an den Trunk.
	* Der Rückruf gesendet wurde erfolgreich verarbeitet.
	* Außerhalb des Zeitbereichs Der Anruf wurde außerhalb des in dem DID-Menü konfigurierten Zeitspanne empfangen, Registerkarte Callback Pro.
	.`,
	'callerid.id_user' : `Wähle den Benutzer.`,
	'callerid.cid' : `Die Nummer für CID authentifiziert sich mit CallingCard.
	Verwenden Sie das genaue Format, das Sie den CallerID von Ihrem DIDE-Anbieter erhalten haben.`,
	'callerid.name' : `Optional.`,
	'callerid.description' : `CallerID-Beschreibung.`,
	'callerid.activated' : `Status des CallerID.`,
	'callonline.idUserusername' : `Hauptbenutzer des SIP-Benutzers, der den Anruf gestartet hat.`,
	'callonline.sip_account' : `SIP-Benutzer, der den Anruf angefordert hat.`,
	'callonline.idUsercredit' : `Benutzerkredite`,
	'callonline.ndiscado' : `Gewählte Nummer`,
	'callonline.codec' : `Codec verwendet.`,
	'callonline.callerid' : `Die CallerID-Nummer.`,
	'callonline.tronco' : `Trunk, der verwendet wurde, um den Anruf abzuschließen.`,
	'callonline.reinvite' : `Reinvite ist der Parameter, der informiert, ob das Audio durch Asterisk überschreitet oder wenn es durch den Client und den Trunk geht.
	Klicken Sie hier, um mehr über diese Option zu erfahren | https://wiki.magnusbilling.org/de/source/asterisk_options/directmedia.html.`,
	'callonline.from_ip' : `IP des Anrufers.`,
	'callonline.description' : `Daten aus dem Befehl SIP Show Channel.`,
	'callshopcdr.id_user' : `Benutzer.`,
	'callsummarycallshop.sumsessiontime' : `Summe der Anrufminuten.`,
	'callsummarycallshop.sumprice' : `Gesamtwert.`,
	'callsummarycallshop.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarycallshop.sumbuycost' : `Summe der Kaufkosten.`,
	'callsummarycallshop.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummarydayagent.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummarydayagent.sumsessionbill' : `Summe des Verkaufspreises.`,
	'callsummarydayagent.sumbuycost' : `Summe der Kaufkosten.`,
	'callsummarydayagent.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarydayagent.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummarydaytrunk.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummarydaytrunk.sumsessionbill' : `Summe des Verkaufspreises.`,
	'callsummarydaytrunk.sumbuycost' : `Summe der Kaufkosten.`,
	'callsummarydaytrunk.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarydaytrunk.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummarydayuser.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummarydayuser.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarydayuser.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummarymonthdid.sumsessionbill' : ``,
	'callsummarymonthdid.sumsessiontime' : ``,
	'callsummarymonthdid.sumnbcall' : ``,
	'callsummarymonthtrunk.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummarymonthtrunk.sumsessionbill' : `Summe des Verkaufspreises.`,
	'callsummarymonthtrunk.sumbuycost' : `Summe der Kaufkosten.`,
	'callsummarymonthtrunk.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarymonthtrunk.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummarymonthuser.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummarymonthuser.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarymonthuser.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummaryperday.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummaryperday.sumsessionbill' : `Summe des Verkaufspreises.`,
	'callsummaryperday.sumbuycost' : `Summe der Kaufkosten.`,
	'callsummaryperday.sumlucro' : `Summe des Ergebnisses.`,
	'callsummaryperday.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummaryperday.sumnbcallfail' : `Summe der Anrufe, die fehlgeschlagen sind.`,
	'callsummarypermonth.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummarypermonth.sumsessionbill' : `Summe des Verkaufspreises.`,
	'callsummarypermonth.sumbuycost' : `Summe der Kaufkosten.`,
	'callsummarypermonth.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarypermonth.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummarypertrunk.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummarypertrunk.sumsessionbill' : `Summe des Verkaufspreises.`,
	'callsummarypertrunk.sumbuycost' : `Summe der Kaufkosten.`,
	'callsummarypertrunk.sumlucro' : `Summe des Ergebnisses.`,
	'callsummarypertrunk.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummarypertrunk.sumnbcallfail' : `Summe der Anrufe, die fehlgeschlagen sind.`,
	'callsummaryperuser.sumsessiontime' : `Summe der Anrufminuten. || Es ist möglich, Filter wie nur die letzten Tage der Woche oder eines bestimmten Wiederverkäufers zu verwenden.
	Diese Zusammenfassung zeigt nur die Daten, die sich auf den erfundenen Filter beziehen.`,
	'callsummaryperuser.sumlucro' : `Summe des Ergebnisses.`,
	'callsummaryperuser.sumnbcall' : `Insgesamt Anrufe.`,
	'callsummaryperuser.sumnbcallfail' : `Summe der Anrufe, die fehlgeschlagen sind.`,
	'campaign.id_user' : `Benutzer, der die Kampagne besitzt.`,
	'campaign.id_plan' : `Welchen Plan möchten Sie diese Kampagne bill verwenden?`,
	'campaign.name' : `Name der Kampagne.`,
	'campaign.status' : `Status der Kampagne.`,
	'campaign.startingdate' : `Die Kampagne beginnt von diesem Datum.`,
	'campaign.expirationdate' : `Die Kampagne wird an diesem Datum aufhören.`,
	'campaign.type' : `Wählen Sie Sprache oder SMS.
	Wenn Sie Voice auswählen, müssen Sie Audio importieren.
	Wenn Sie SMS auswählen, müssen Sie den Text in der SMS-Registerkarte einstellen.`,
	'campaign.audio' : `Zur massiven Anrufe verfügbar.
	Das Audio muss mit Asterisk kompatibel sein.
	Das empfohlene Format ist GSM oder WAV (8k Hz Mono).`,
	'campaign.audio_2' : `Wenn Sie TTS verwenden, wird der Name zwischen Audio und Audio2 ausgeführt.`,
	'campaign.restrict_phone' : `Wenn Sie diese Option aktivieren, prüft das MagnusBilling, ob die Nummer, die den Anruf gesendet wird, im Menü "Telefon einschreiben" registriert ist. Wenn das System den Status der zu blockierten Nummer ändert, wird der Anruf nicht gesendet.`,
	'campaign.auto_reprocess' : `Wenn in diesem Kampagnen-Telefon keine aktiven Zahlen vorhanden sind, müssen Sie alle anstehenden Nummern wieder aktivieren.`,
	'campaign.id_phonebook' : `Wählen Sie ein oder mehrere Telefonbuche aus, die verwendet werden sollen.`,
	'campaign.digit_authorize' : `Möchten Sie den Anruf nach dem Audio weiterleiten?
	Wenn die Callee 1 drückt, wird er an den SIP-Benutzer XXXX gesendet.
	Setzen Sie die Nummer auf Weiterleiten = 1, Forward Type = SIP und wählen Sie den SIP-Benutzer aus, um die Callee zu senden.
	Set -1 zum Deaktivieren.`,
	'campaign.type_0' : `Wählen Sie die Art der Weiterleitung.
	Dadurch wird der Anruf an das gewählte Ziel gesendet.`,
	'campaign.id_ivr_0' : `Wählen Sie ein IVR, um den Anruf zu senden.
	Das IVR muss zum Eigentümer der Kampagne gehören.`,
	'campaign.id_queue_0' : `Wählen Sie eine Warteschlange, um den Anruf zu senden.
	Die Warteschlange muss dem Eigentümer der Kampagne angehören.`,
	'campaign.id_sip_0' : `Wählen Sie einen SIP-Benutzer, um den Anruf zu senden.
	Der SIP-Benutzer muss dem Eigentümer der Kampagne angehören.`,
	'campaign.extension_0' : `Klicken Sie hier, um weitere Details anzuzeigen || Es sind zwei Optionen verfügbar.
	* Gruppe, der Gruppenname sollte hier genau wie in den SIP-Benutzern angezeigt werden, die die Anrufe erhalten sollen.
	* Personalisiert, Sie können alle gültigen Option über den Befehl von Asterisk ausführen.
	Beispiel: SIP / SIPAccount, 45, TTR.`,
	'campaign.record_call' : `Notieren Sie die Anrufe der Kampagne.
	Sie werden nur aufgezeichnet, wenn der Anruf übertragen wird.`,
	'campaign.daily_start_time' : `Zeit, dass die Kampagne beginnt, zu senden.`,
	'campaign.daily_stop_time' : `Zeit, dass die Kampagne aufhört, zu senden.`,
	'campaign.monday' : `Aktivieren dieser Option Das System sendet montags Anrufe an.`,
	'campaign.tuesday' : `Aktivieren dieser Option Das System sendet Anrufe dienstags.`,
	'campaign.wednesday' : `Aktivieren dieser Option Das System sendet Anrufe an Mittwochs.`,
	'campaign.thursday' : `Aktivieren dieser Option Das System sendet an donnerstags Anrufe an.`,
	'campaign.friday' : `Aktivieren dieser Option Das System sendet an Freitags Anrufe.`,
	'campaign.saturday' : `Aktivieren dieser Option Das System sendet an Samstags Anrufe.`,
	'campaign.sunday' : `Aktivieren dieser Option Das System sendet Anrufe an Sonntagen.`,
	'campaign.frequency' : `Wie viele Zahlen werden pro Minute verarbeitet? || Dieser Wert wird um 60 Sekunden unterteilt und die Anrufe werden jede Minute gleichzeitig gesendet.`,
	'campaign.max_frequency' : `Dies ist der maximale Wert, den der Client einstellen kann.
	Wenn Sie ihn auf 50 einstellen, kann der Benutzer in einem beliebigen Wert wechseln, der 50 oder weniger als 50 beträgt.`,
	'campaign.nb_callmade' : `Zur Steuerung der maximal abgeschlossenen Anrufe.`,
	'campaign.enable_max_call' : `Wenn aktiviertes MagnusBilling überprüft, wie viele Anrufe bereits gemacht wurden und eine Dauer-Gesamtsumme größer als die Audios haben.
	Wenn die Menge gleich oder größer ist als der in diesem Feld eingestellte Wert, wird die Kampagne deaktiviert.`,
	'campaign.secondusedreal' : `Maximale Menge an vollständigen Anrufen.
	Sie müssen das obige Feld aktivieren, um dies zu verwenden.`,
	'campaign.description' : ``,
	'campaign.tts_audio' : `Mit dieser Einstellung generiert das System das Audio 1 für die Kampagne über TTS. || Damit dies funktioniert, müssen Sie die TTS-URL unter Einstellungen, Konfiguration, TTS-URL einstellen.`,
	'campaign.tts_audio2' : `Dieselbe Einstellung wie das vorherige Feld, aber für Audio 2. Beachten Sie, dass zwischen Audio 1 und 2 der TTS den mit der Nummer importierten Namen ausführt.`,
	'campaigndashboard.name' : `Name der Kampagne.`,
	'campaignlog.total' : `Insgesamt Anrufe.`,
	'campaignpoll.id_campaign' : `Wählen Sie die Kampagne, die diese Umfrage ausführt.`,
	'campaignpoll.name' : `Name der Umfrage.
	Dieser Name ist nur an Ihrem Ende zu sehen.`,
	'campaignpoll.repeat' : ``,
	'campaignpoll.request_authorize' : `In einigen Fällen müssen Sie eine Compliance anfordern, um die Umfrage auszuführen.
	Wenn das der Fall ist, wählen Sie Ja.`,
	'campaignpoll.digit_authorize' : `Ziffer, um die Ausführung der Umfrage zu ermächtigen.`,
	'campaignpoll.arq_audio' : `Audiodatei.
	Bitte verwenden Sie eine GSM- oder WAV-8kHz-Mono-Audiodatei.`,
	'campaignpoll.description' : `Beschreibung der Umfrage.`,
	'campaignpoll.option0' : ``,
	'campaignpoll.option1' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option2' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option3' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option4' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option5' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option6' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option7' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option8' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpoll.option9' : `Beschreiben Sie die Option.
	Lesen Sie die Beschreibung der Option 0.`,
	'campaignpollinfo.number' : `Nummer der Person, die gewählt hat.`,
	'campaignpollinfo.resposta' : `Option ausgewählt.`,
	'campaignrestrictphone.number' : `Nummer, die blockiert werden soll.
	Es ist notwendig, die Option Blockierte Zahlen in der Kampagne zu aktivieren.`,
	'configuration.config_value' : `Wert.
	Klicken Sie hier, um mehr über die Optionen dieses Menüs zu erfahren. | https://wiki.magnusbilling.org/de/source/config.html.`,
	'configuration.config_description' : `Beschreibung.
	Klicken Sie hier, um mehr über die Optionen dieses Menüs zu erfahren. | https://wiki.magnusbilling.org/de/source/config.html`,
	'did.did' : `Die genaue Anzahl kommt aus dem Kontext in Sternchen.
	Wir empfehlen Ihnen, immer das E164-Format zu verwenden.`,
	'did.record_call' : `Notieren Sie die Anrufe dafür.
	Unabhängig vom Ziel aufgenommen.`,
	'did.activated' : `Nur aktive Nummern können Anrufe empfangen.`,
	'did.callerid' : `Verwenden Sie dieses Feld, um einen CallerID-Namen festzulegen oder leer zu lassen, um den empfangenen CallerID vom DIDE-Anbieter zu verwenden.`,
	'did.connection_charge' : `Aktivierungskosten.
	Dieser Wert wird vom Kunden vom Client abgezogen, in dem der Tat mit dem Benutzer verbunden ist.`,
	'did.fixrate' : `Monatlicher Preis.
	Dieser Wert wird jeden Monat vom Kontostand des Benutzers automatisch abgezogen.
	Wenn der Kunde nicht genug Guthaben hat, wird das Tat automatisch storniert.`,
	'did.connection_sell' : `Dies ist der Wert, der für jeden Anruf in Rechnung gestellt wird.
	Wenn Sie den Anruf einfach aufheben, wird dieser Wert abgezogen.`,
	'did.minimal_time_charge' : `Mindestzeit, um das Tarif zu trennen.
	Wenn Sie ihn auf 3 Anrufe setzen, für das mit niedrigerer Dauer nicht berechnet wird.`,
	'did.initblock' : `Mindestzeit in Sekunden, um zu kaufen.
	Wenn Sie ihn auf 30 einstellen und die Anrufdauer 10 beträgt, wird der Anruf als 30 in Rechnung gestellt.`,
	'did.increment' : `Dadurch wird der Block definiert, in dem die Rechnungszeit in Sekunden inkrementiert wird.
	Wenn auf 6 eingestellt ist und die Anrufdauer 32 ist, wird der Anruf als 36 in Rechnung gestellt.`,
	'did.charge_of' : `Der Benutzer, der für die geschätzten Kosten berechnet wird.`,
	'did.calllimit' : `Maximales Simultanaufruf dafür hat dies getan.`,
	'did.description' : `Sie können hier Notizen machen!`,
	'did.expression_1' : ``,
	'did.selling_rate_1' : `Preis pro Minute, wenn die Zahl mit dem obigen regulären Ausdruck übereinstimmt.`,
	'did.block_expression_1' : `Setzen Sie auf Ja, um Anrufe zu blockieren, die mit dem obigen regulären Ausdruck übereinstimmen.`,
	'did.send_to_callback_1' : `Senden Sie diesen Anruf an den Rückruf, wenn er mit dem obigen regulären Ausdruck übereinstimmt.`,
	'did.expression_2' : `Wie der erste Ausdruck.
	Klicken Sie hier für weitere Informationen. | https://wiki.magnusbilling.org/de/source/modules/did/did.html`,
	'did.selling_rate_2' : `Preis pro Minute, wenn die Zahl mit dem obigen regulären Ausdruck übereinstimmt.`,
	'did.block_expression_2' : `Setzen Sie auf Ja, um Anrufe zu blockieren, die mit dem obigen regulären Ausdruck übereinstimmen.`,
	'did.send_to_callback_2' : `Senden Sie diesen Anruf an den Rückruf, wenn er mit dem obigen regulären Ausdruck übereinstimmt.`,
	'did.expression_3' : `Wie der erste Ausdruck.
	Klicken Sie hier für weitere Informationen. | https://wiki.magnusbilling.org/de/source/modules/did/did.html`,
	'did.selling_rate_3' : `Preis pro Minute, wenn die Zahl mit dem obigen regulären Ausdruck übereinstimmt.`,
	'did.block_expression_3' : `Setzen Sie auf Ja, um Anrufe zu blockieren, die mit dem obigen regulären Ausdruck übereinstimmen.`,
	'did.send_to_callback_3' : `Senden Sie diesen Anruf an den Rückruf, wenn er mit dem obigen regulären Ausdruck übereinstimmt.`,
	'did.cbr' : `Ermöglicht Callback Pro.`,
	'did.cbr_ua' : `Führen Sie ein Audio aus.`,
	'did.cbr_total_try' : `Wie oft wird das System versuchen, den Anruf zurückzugeben?`,
	'did.cbr_time_try' : `Zeitintervall zwischen jedem Versuch in Minuten.`,
	'did.cbr_em' : `Führen Sie ein Audio aus, bevor der Anruf beantwortet wird.
	Ihr Hat-Anbieter muss frühe Medien zulassen.`,
	'did.TimeOfDay_monFri' : `Beispiel: Wenn Ihr Unternehmen nur auf die Callee zurückgibt, wenn der Anruf zwischen 09: 00-12: 00 und 14: 00-18: 00 Mon-fry zwischen diesem Zeitintervall platziert wurde, wird der Workaudio gespielt und dann Rückruf
	zur Callee.
	Sie können mehrere Zeitintervalle verwenden, die durch | getrennt sind.`,
	'did.TimeOfDay_sat' : `Das gleiche aber für samstag.`,
	'did.TimeOfDay_sun' : `Das gleiche aber für sonntag.`,
	'did.workaudio' : `AUDIO, das ausgeführt wird, wenn ein Anruf im Zeitintervall empfangen wird.`,
	'did.noworkaudio' : `Audio, das ausgeführt wird, wenn ein Anruf aus dem Zeitintervall empfangen wird.`,
	'diddestination.id_did' : `Wählen Sie das getan, an dem Sie ein neues Ziel erstellen möchten.`,
	'diddestination.id_user' : `Benutzer, der der Besitzer davon ist.`,
	'diddestination.activated' : `Es werden nur aktive Ziele verwendet.`,
	'diddestination.priority' : `Sie können bis zu 5 Ziele für Sie erstellen.
	Wenn ein Versuch getroffen wird und ein Fehler eingeht, versucht MagnusBilling, den Anruf an die nächste verfügbare Zielrichter zu senden.
	Funktioniert nur mit dem Typ "SIP CALL".`,
	'diddestination.voip_call' : `Art des Ziels.`,
	'diddestination.destination' : `Verwenden Sie dies, um sich Notizen zu machen!`,
	'diddestination.id_ivr' : `Wählen Sie ein IVR aus, um den Anruf zu senden.
	Das IVR muss dem Eigentümer des Tatens Aswell gehören.`,
	'diddestination.id_queue' : `Wählen Sie eine Warteschlange aus, um den Anruf zu senden.
	Die Warteschlange muss dem Eigentümer des Tates Aswell gehören.`,
	'diddestination.id_sip' : `Wählen Sie einen SIP-Benutzer aus, um den Anruf zu senden.
	Der SIP-Benutzer muss dem Eigentümer des Tates Aswell gehören.`,
	'diddestination.context' : `In diesem Feld können Sie einen Kontext in dem von Asterisk unterstützten Format verwenden. Beispiel: _X.
	=> 1, Zifferblatt (SIP / SIPAccount, 45) gleich => n, goto (S-\ \ $ {dialstatus}, 1) Exten => S-Noanswer, 1, Hangupexten => S-Überlastung, 1, Conggestionexten =>
	s-abbrechen, 1, hangupexten => s-beschäftigt, 1, vielbeutenxten => s-chanunavail, 1, setcallereid (4545454545) exten => s-chanunavail, 2, dial (sip / sipaccount2,, t) Sie sollten nicht einstellen
	Ein Name für den Kontext, da der Name automatisch eingestellt wird, wie [DID-Number-of the-this] eingestellt ist, können Sie den Kontext auf /etc/asterisk/extensions_magnus_did.conf ansehen`,
	'diduse.id_did' : `Hat die Nummer gemacht`,
	'diduse.month_payed' : `Der Gesamtmonat, der dafür bezahlt wurde.`,
	'diduse.reservationdate' : `Tag, an dem der Tat für den Benutzer reserviert war.`,
	'firewall.ip' : `IP Adresse.`,
	'firewall.action' : `Mit dieser Option, die auf Ja markiert ist, wird die IP auf der Liste der IP-Blacklist-Liste von Fail2ban platziert und wird für immer blockiert.
	|| Die Option blockiert das IP nicht momentan entsprechend den Parametern der Datei /etc/fail2ba/jail.local.
	Standardmäßig bleibt die IP für 10 Minuten blockiert`,
	'firewall.description' : `Diese Informationen werden von der Protokolldatei /var/log/fail2ban.log || erfasst
	Es ist möglich, dieses Protokoll mit dem Befehlshandel -f /var/log/fail2ban.log zu verfolgen`,
	'gauthenticator.username' : `Der Benutzer, der Token aktivieren möchte`,
	'gauthenticator.googleAuthenticator_enable' : ``,
	'gauthenticator.code' : `Der Code muss notwendig sein, um das Token zu deaktivieren.
	Wenn Sie den Code nicht mehr haben, müssen Sie über die Datenbank deaktiviert werden.`,
	'gauthenticator.google_authenticator_key' : `Dieser Schlüssel ist erforderlich, um das Token in einem anderen Mobiltelefon zu aktivieren`,
	'groupmodule.id_group' : `Benutzergruppe`,
	'groupmodule.id_module' : `Speisekarte`,
	'groupuser.name' : `Name der Benutzergruppe`,
	'groupuser.id_user_type' : `Gruppentyp.`,
	'groupuser.hidden_prices' : `Versteckt alle Preise wie, kaufen, verkaufen und profitieren Sie an Benutzer, die diese Gruppe verwenden.`,
	'groupusergroup.name' : `Gruppenname`,
	'groupusergroup.user_prefix' : `Füllen dieses Felds, alle Benutzer, die von einem Administrator erstellt wurden, der diese Gruppe verwendet, wird mit diesem Präfix initialisiert.`,
	'groupusergroup.id_group' : `Welche Clientgruppen haben die Administratorgruppe Zugriff. ||
	Wenn ein Administrator, der zu dieser Gruppenanmeldung gehört, wird nur der Administrator die Clientdaten der ausgewählten Gruppen angezeigt`,
	'holidays.name' : `Urlaubsname`,
	'holidays.day' : `Tag des Feiertags`,
	'iax.id_user' : `Der Benutzer, dessen IAX-Konto gehört`,
	'iax.username' : `Der Benutzer, der zur Authentifizierung im Softphone verwendet wird`,
	'iax.secret' : `Das Passwort, mit dem sich im Softphone authentifiziert`,
	'iax.callerid' : `Dies ist der CallerID, der an ihrem Ziel angezeigt wird, in externen Anrufen muss der Anbieter, dass CLI in ihrem Ziel korrekt identifiziert wird.`,
	'iax.disallow' : `In dieser Option können Sie Codecs deaktivieren.
	So deaktivieren Sie alle Codecs und verwenden Sie den Benutzer nur, was Sie unten auswählen, verwenden Sie "Alles verwenden"`,
	'iax.allow' : `Codecs, die akzeptiert werden.`,
	'iax.host' : `"Dynamic" ist eine Option, mit der der Benutzer sein Konto in jeder IP registrieren kann.
	Wenn Sie den Benutzer von ihrem IP authentifizieren möchten, füllen Sie hier die IP des Clients aus, lassen Sie das Kennwortfeld leer und setzen Sie "Unsichere" für den Port / einladen in der Registerkarte "Zusätzliche Informationen" ein.`,
	'iax.nat' : `Der Kunde ist hinter Nat?
	Klicken Sie hier, um weitere Informationen zu erhalten | https://www.voip-info.org/asterisk-sip-nat/.`,
	'iax.context' : `Dies ist der Kontext, den der Anruf verarbeitet wird, standardmäßig auf "Abrechnung" eingestellt ist.
	Nur ändern, wenn Sie ein Wissen über Asterisk haben.`,
	'iax.qualify' : `Sendet das Paket "Option", um zu überprüfen, ob der Benutzer online ist. || SINTAX: Qualify = xxx |
	Nein |
	Ja, wo der XXX die Anzahl der verwendeten Millisekunden ist.
	Wenn "Ja", die in SIP.CONF konfigurierte Zeit verwendet wird, ist 2 Sekunden der Standard. Wenn Sie "Qualify" aktivieren, wird der Asterisk den Befehl "Option" an SIP Peer-Register gesendet, um zu überprüfen, ob das Gerät noch online ist.
	Wenn das Gerät die Option "Option" nicht beantworten kann, prüft Asterisk das Gerät offline für zukünftige Anrufe. Dieser Status kann mit der Funktion "SIP SHOE XXXX" überprüft werden, diese Förderung liefert nur Statusinformationen
	an den SIP-Peer, der "qualifizieren = Ja" hat.`,
	'iax.dtmfmode' : `Art des DTMF.
	Klicken Sie hier für weitere Informationen | https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
	'iax.insecure' : `Wenn der Host auf "Dynamic" eingestellt ist, muss diese Option auf "Nein" eingestellt werden.
	Um sich über IP zu authentifizieren und an Port zu ändern.
	Klicken Sie hier, um weitere Informationen zu erhalten, https://www.voip-info.org/asterisk-sip-incuresecure/.`,
	'iax.type' : `Der Standardtyp ist "Freund", mit anderen Worten, sie können Anrufe erstellen und empfangen.
	Klicken Sie hier, um weitere Informationen zu erhalten | https://www.voip-info.org/asterisk-sip-type/.`,
	'iax.calllimit' : `Summe der gleichzeitigen Anrufe für dieses IAX-Konto erlaubt.`,
	'ivr.name' : `Name des IVR`,
	'ivr.id_user' : `Benutzer, der das IVR besitzt`,
	'ivr.monFriStart' : `Wöchentliches Teilnehmerintervall, kann mit Multiples-Schichten konfiguriert werden. || Beispiel: Angenommen, die Anwesenheitszeiten sind 08h bis 12 Stunden und 14h bis 19h.
	In diesem Fall würde die Regel 08: 00-12: 00 | 14: 00-19: 00`,
	'ivr.satStart' : `Teilnehmerintervall samstags kann mit mehreren Schichten konfiguriert werden. Beispiel: Angenommen, die Anwesenheitszeiten am Samstag sind 08 Uhr bis 13 Stunden.
	In diesem Fall wäre die Regel 08: 00-13: 00`,
	'ivr.sunStart' : `Anwesenheitsintervall Sonntags kann mit mehreren Schichten konfiguriert werden. Beispiel: Angenommen, es gibt keine Anwesenheitszeiten am Sonntag.
	In diesem Fall wäre die Regel 00: 00-00: 00`,
	'ivr.use_holidays' : `Wenn diese Option aktiviert ist, prüft das System, ob ein Felder für den Tag angemeldet ist, wenn ja, dann wird das Audio, das nicht funktioniert, nicht gespielt.`,
	'ivr.workaudio' : `Audio, um in den Anwesenheitszeiten zu spielen.`,
	'ivr.noworkaudio' : `Audio zum Spielen, wenn es keine Anwesenheitszeiten ist`,
	'ivr.option_0' : `Wählen Sie das Ziel aus, wenn die Option 0 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_1' : `Wählen Sie das Ziel aus, wenn die Option 1 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_2' : `Wählen Sie das Ziel aus, wenn die Option 2 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_3' : `Wählen Sie das Ziel aus, wenn die Option 3 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_4' : `Wählen Sie das Ziel aus, wenn die Option 4 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_5' : `Wählen Sie das Ziel aus, wenn die Option 5 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_6' : `Wählen Sie das Ziel aus, wenn die Option 6 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_7' : `Wählen Sie das Ziel aus, wenn die Option 7 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_8' : `Wählen Sie das Ziel aus, wenn die Option 8 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_9' : `Wählen Sie das Ziel aus, wenn die Option gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_10' : `Wählen Sie das Ziel aus, wenn keine der Optionen ausgewählt wurde.`,
	'ivr.direct_extension' : `Die Aktivierung dieser Option kann einen SIP-Benutzer eingeben, um es direkt anzurufen.`,
	'ivr.option_out_0' : `Wählen Sie das Ziel aus, das die Option 0 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_1' : `Wählen Sie das Ziel aus, wenn die Option 1 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_2' : `Wählen Sie das Ziel aus, wenn die Option 2 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_3' : `Wählen Sie das Ziel aus, wenn die Option 3 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_4' : `Wählen Sie das Ziel aus, wenn die Option 4 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_5' : `Wählen Sie das Ziel aus, wenn die Option 5 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_6' : `Wählen Sie das Ziel aus, wenn die Option 6 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_7' : `Wählen Sie das Ziel aus, wenn die Option 7 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_8' : `Wählen Sie das Ziel aus, wenn die Option 8 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_9' : `Wählen Sie das Ziel aus, wenn die Option 9 gedrückt wird.
	Lass es leer, wenn keine Aktion gewünscht wird`,
	'ivr.option_out_10' : `Wählen Sie das Ziel aus, wenn keine der Optionen ausgewählt wurde.`,
	'logusers.id_user' : `Benutzer, der die Aktion ausgeführt hat.`,
	'logusers.id_log_actions' : `Art der Aktion.`,
	'logusers.ip' : `IP für die Aktion verwendet.`,
	'logusers.description' : `Was gemacht wurde, ist normalerweise in JSON.`,
	'methodpay.show_name' : `Der Name, der im Client-Panel angezeigt wird.`,
	'methodpay.id_user' : `Die Benutzungszahlungsmethode.
	Sie können Zahlungsmethoden für Administratoren oder Wiederverkäufer erstellen.`,
	'methodpay.country' : `Nur als referenz.`,
	'methodpay.active' : `Aktivieren Sie diese Option, wenn Sie für die Clients verfügbar sein möchten.`,
	'methodpay.min' : `Minimaler akzeptierter Wert.`,
	'methodpay.max' : `Maximal akzeptierter Wert.`,
	'methodpay.username' : `Benutzerzahlungsmethode`,
	'methodpay.url' : `Zahlungsmethode-URL, in den meisten Fällen die Methoden, die diese URL bereits vorkonfiguriert ist.`,
	'methodpay.fee' : `Zahlungsmethode Gebühr.`,
	'methodpay.pagseguro_TOKEN' : `Zahlungsmethode Token`,
	'methodpay.P2P_CustomerSiteID' : `Dieses Feld ist exklusiv für einige Zahlungsmethoden.`,
	'methodpay.P2P_KeyID' : `Dieses Feld ist exklusiv für einige Zahlungsmethoden.`,
	'methodpay.P2P_Passphrase' : `Dieses Feld ist exklusiv für einige Zahlungsmethoden.`,
	'methodpay.P2P_RecipientKeyID' : `Dieses Feld ist exklusiv für einige Zahlungsmethoden.`,
	'methodpay.P2P_tax_amount' : `Dieses Feld ist exklusiv für einige Zahlungsmethoden.`,
	'methodpay.client_id' : `Dieses Feld ist exklusiv für einige Zahlungsmethoden.`,
	'methodpay.client_secret' : `Dieses Feld ist exklusiv für einige Zahlungsmethoden.`,
	'module.text' : `Menüname`,
	'module.icon_cls' : `Symbol, Standardschrift "Awesome V4".`,
	'module.id_module' : `Menü, das dieses Menü gehört.
	Falls das Menü leer ist, ist es ein Hauptmenü`,
	'module.priority' : `Bestellen, dass das Menü im Menü angezeigt wird`,
	'offer.label' : `Kostenloser Paketname.`,
	'offer.packagetype' : `Art des Pakets, es gibt 3 Typen.
	Unbegrenzte Anrufe, kostenlose Anrufe oder kostenlose Sekunden.`,
	'offer.freetimetocall' : `In diesem Feld erfolgt der Ort, an dem die Paketvarfetrößerungskonfiguration auftritt. || Beispiel: * Unbegrenzte Anrufe: In dieser Option ist das Feld leer, da es ohne Kontrolle anrufen dürfen. * Kostenlose Anrufe: Konfigurieren Sie den Betrag der kostenlosen Anrufe
	Sie möchten geben. * KOSTENLOSE Sekunden: Konfigurieren Sie den Betrag der Sekunden, in denen Sie den Client anrufen möchten.`,
	'offer.billingtype' : `Dies ist der Zeitraum, den das Paket berechnet wird. ||
	Sehen Sie die Beschreibung: * Monatlich: Das System überprüft den Tag der Planaktivierung 30 Tage, an dem der Client das Paketlimit erreichte. * Wöchentlich: Das System überprüft den Tag der Planaktivierung 7 Tage, an denen der Client das Paketlimit erreichte.`,
	'offer.price' : ``,
	'offercdr.id_user' : `Benutzer des Anrufs`,
	'offercdr.id_offer' : `Name des Angebots.`,
	'offercdr.used_secondes' : `Gesprächsdauer.`,
	'offercdr.date_consumption' : `Datum und Stunde des Anrufs.`,
	'offeruse.id_user' : `Benutzer, der den Anruf getroffen hat.`,
	'offeruse.id_offer' : `Name des Angebots.`,
	'offeruse.month_payed' : `Bezahlte Monate.`,
	'offeruse.reservationdate' : `Datum und Stunde, die das Angebot storniert wurde.`,
	'phonebook.name' : `Telefonbuchname`,
	'phonebook.status' : `Telefonbuchstatus.`,
	'phonebook.description' : `Telefonbuch Beschreibung, nur persönliche Steuerung.`,
	'phonenumber.id_phonebook' : `Telefonbuch, zu dem diese Zahl gehört.`,
	'phonenumber.number' : `Nummer zum Senden von Anrufen / SMS.
	Müssen Sie immer im E164-Format verwendet werden.`,
	'phonenumber.name' : `Number-Besitzer Name, verwendet für TTS oder SMS`,
	'phonenumber.city' : `Client City, nicht erforderliches Feld.`,
	'phonenumber.status' : `Magnusbilling versucht nur, zu senden, wenn der Status aktiv ist.
	Der Trunk lehnte den Anruf ab und erfüllte es aus irgendeinem Grund. Wenn Sie in der Kampagne aktiviert sind, wird die Option "Blocked Numpts" aktiviert, wenn die Nummer in den "Anrufen registriert ist`,
	'phonenumber.info' : `Telefonbuch Beschreibung, Personal Control nur || Wenn Sie bei der Umfrage verwendet werden, wird hier gespeichert, was die Nummer, die der Client eingegeben hat.`,
	'phonenumber.doc' : ``,
	'phonenumber.email' : ``,
	'plan.name' : `Name planen`,
	'plan.signup' : `Avaible diesen Plan in der Anmeldungsformulierung erstellen.
	Wenn nur ein Plan verfügt, werden die Clients, die sich registrieren, diesen Plan verwenden, wenn es mehr als 1 Plan gibt, dann kann der Client wählen.
	Es ist notwendig, mindestens einen Plan mit dieser Option zu haben, um die Register zu aktivieren.`,
	'plan.ini_credit' : `Der Kreditbetrag, den Sie den Kunden geben möchten, die durch Anmeldungsformular registriert sind.`,
	'plan.play_audio' : `Führen Sie Audios aus diesem Plan an den Client aus oder senden Sie einfach den Fehler nur?
	Zum Beispiel die Audios, die es nicht mehr Kredit haben.`,
	'plan.techprefix' : `TechPrefix ist wie ein Passwort für den Client, der die Verwendung mehrerer Pläne ermöglicht.`,
	'plan.id_service' : `Wählen Sie hier die Dienstleistungen aus, die den Benutzern dieses Plans zur Verfügung stehen.`,
	'prefix.prefix' : `Präfixcode.
	Das Präfix wird an Tarif verwendet und die Anrufe bestätigt.`,
	'prefix.destination' : `Zielname`,
	'provider.provider_name' : `Anbietername`,
	'provider.credit' : `Der Kreditbetrag, den Sie in Ihrem Anbieterkonto haben.
	Dieses Feld ist optional.`,
	'provider.credit_control' : `Wenn Sie auf Ja eingestellt sind und Ihr Provider-Guthaben <0 ist, werden alle Stämme dieses Anbieters deaktiviert.`,
	'provider.description' : `Beschreibung zum Kalender, nur zur Selbststeuerung.`,
	'queue.id_user' : `Benutzer, der die Warteschlange besitzt.`,
	'queue.name' : `Name des Warteschlangens`,
	'queue.language' : `Warteschlangesprache.`,
	'queue.strategy' : `Warteschlangenstrategie.`,
	'queue.ringinuse' : `Anruf oder nicht die Agenten der Warteschlange, die anrufen.`,
	'queue.timeout' : `Wie lange wird das Telefon bis zum Timeout klingeln?`,
	'queue.retry' : `Der Zeitraum in Sekunden, der den Anruf wiederholt.`,
	'queue.wrapuptime' : `Zeit in Sekunden, bis der Agent einen anderen Anruf erhalten kann.`,
	'queue.weight' : `Warteschlange Priorität.`,
	'queue.periodic-announce' : `Ein Satz periodischer Ankündigungen kann erstellt werden, indem jede Ansagekörper trennen, um Whit-Kommas zu reproduzieren.
	E.g.: Warteschlangen-periodische Ankündigung, Ihr Anruf ist wichtig, bitte warten Sie.
	Diese Daten müssen sich in / var / lib / staster / Sounds / Sounds / Sounds / Sounds / Sounds / Sounds / Sounds / Sounds befinden.`,
	'queue.periodic-announce-frequency' : `Wie oft eine periodische Ankündigung vornehmen.`,
	'queue.announce-position' : `Informiert die Position in der Warteschlange.`,
	'queue.announce-holdtime' : `Sollten wir eine geschätzte Haltezeit in den Positionsmitteilungen enthalten?`,
	'queue.announce-frequency' : `Wie oft, um die Warteschlangenposition und / oder die geschätzte Holdime an den Anrufer 0 = aus anzukündigen`,
	'queue.joinempty' : `Erlauben Sie Anrufe, wenn es niemanden gibt, um den Anruf zu beantworten.`,
	'queue.leavewhenempty' : `Hängen Sie die Anrufe in der Warteschlange auf, wenn es niemand antwortet.`,
	'queue.max_wait_time' : `Maximale Wartezeit auf der Warteschlange`,
	'queue.max_wait_time_action' : `SIPAccount, IVR, Warteschlange oder lokaler Kanal, um den Anrufer zu senden, wenn die maximale Wartezeit erreicht ist.
	Verwendung: SIP / SIP_Account, Warteschlange / Warteschlangenname, IVR / IVR_NAME oder lokal / Erweiterung @ Kontext.`,
	'queue.ring_or_moh' : `Spielen Sie Wintermusik oder Ton, wenn sich der Kunde in der Warteschlange befindet.`,
	'queue.musiconhold' : `Importieren Sie eine wartende Musik in diese Warteschlange.`,
	'queuemember.queue_name' : `Warteschlange, die SIP-Benutzer hinzufügen möchte.`,
	'queuemember.interface' : `SIP-Benutzer, um der Warteschlange wie ein Agent hinzuzufügen.`,
	'queuemember.paused' : `Pauund-Agenten werden keine Anrufe erhalten, ist möglich, die Wahl * 180 anzumelden und zu rocken, um die Pause anzuhalten und * 181 zu stillen.`,
	'rate.id_plan' : `Der Plan, den Sie einen Tarif erstellen möchten.`,
	'rate.id_prefix' : `Das Präfix, für das Sie einen Tarif erstellen möchten.`,
	'rate.id_trunk_group' : `Die Gruppe von Trunks, die zum Senden dieses Anrufs verwendet werden.`,
	'rate.rateinitial' : `Der Betrag, den Sie pro Minute berechnen möchten.`,
	'rate.initblock' : `Mindestzeit in Sekunden, um zu kaufen.
	Wenn in 30er Jahre eingestellt ist, wird für 30er Jahre berechnet.`,
	'rate.billingblock' : `Dies definiert, wie die Zeit nach dem Minimum inkrementiert ist.
	Wenn es auf 6s eingestellt ist und die Anrufdauer 32 ist, wird für 36 eingeschmückt.`,
	'rate.minimal_time_charge' : `Mindestzeit zum Tarif.
	Wenn es auf 3 eingestellt ist, gibt es nur Tarif, wenn die Zeit gleich oder mehr als 3 Sekunden ist.`,
	'rate.additional_grace' : `Zusätzliche Zeit, um alle Anrufdauer hinzuzufügen.
	Wenn es auf 10 eingestellt ist, wird 10 Sekunden in alle Anrufzeitdauer hinzugefügt, dies betrifft Tarife.`,
	'rate.package_offer' : `Setzen Sie sich auf Ja, wenn Sie diesen Tarif auf ein Paketangebot einschließen möchten.`,
	'rate.status' : `Tarife deaktivieren, Magnusbilling wird diesen Tarif vollständig entweichen.
	Daher hat das Löschen oder Deaktivieren den SAM-Effekt.`,
	'ratecallshop.dialprefix' : `Präfix, das einen Tarif erstellen möchte.
	Dieser Tarif wird von Callshop exklusiv sein.`,
	'ratecallshop.destination' : `Name des Präfix-Ziels.`,
	'ratecallshop.buyrate' : `Charged-Wert pro Minute im Callshop.`,
	'ratecallshop.minimo' : `Mindestzeit in Sekunden bis Tarif.
	Ex: Wenn es auf 30 eingestellt ist, werden alle calll, die weniger als 30 Sekunden dauern, 30 Sekunden berechnet.`,
	'ratecallshop.block' : `Zeitraum, der nach der Mindestzeit berechnet wird.
	Ex: Wenn es auf 6 eingestellt ist, bedeutet dies, dass dies immer um bis zu 6 Sekunden umrundet wird. Ein Anruf, der 32 Sekunden dauerte, wird 36 Sekunden aufgeladen.`,
	'ratecallshop.minimal_time_charge' : `Mindestzeit für Tarif.
	Ex: Wenn auf 3 eingestellt ist, nimmt nur Tarifanrufe, die 3 oder mehr Sekunden dauern.`,
	'rateprovider.id_provider' : ``,
	'rateprovider.id_prefix' : `Präfix.`,
	'rateprovider.buyrate' : `Bezahlter Betrag pro Minute an den Anbieter.`,
	'rateprovider.buyrateinitblock' : `Mindestzeit in Sekunden bis Tarif.
	Ex: Wenn es auf 30 eingestellt ist, werden alle calll, die weniger als 30 Sekunden dauern, 30 Sekunden berechnet.`,
	'rateprovider.buyrateincrement' : `Zeitraum, der nach der Mindestzeit berechnet wird.
	Ex: Wenn es auf 6 eingestellt ist, bedeutet dies, dass dies immer um bis zu 6 Sekunden umrundet wird. Ein Anruf, der 32 Sekunden dauerte, wird 36 Sekunden aufgeladen.`,
	'rateprovider.minimal_time_buy' : `Mindestzeit für Tarif.
	Ex: Wenn auf 3 eingestellt ist, nimmt nur Tarifanrufe, die 3 oder mehr Sekunden dauern.`,
	'refill.id_user' : `Benutzer, der die Nachfüllung realisiert wird.`,
	'refill.credit' : `Nachfüllbetrag.
	Kann ein positiver oder negativer Wert sein, wenn der Wert negativ ist, wird der Gesamtbetrag des Guthabens des Kunden entfernen.`,
	'refill.description' : `Beschreibung zum Kalender, nur zur Selbststeuerung.`,
	'refill.payment' : `Diese Einstellung ist nur für Ihre Kontrolle, der Kredit wird trotzdem auf den Benutzer veröffentlicht, wenn er auf Zahlung Nr.`,
	'refill.invoice_number' : `Rechnungsnummer`,
	'refillprovider.id_provider' : `Name des Anbieters`,
	'refillprovider.credit' : `Nachfüllwert`,
	'refillprovider.description' : `Für die interne Kontrolle verwendet.`,
	'refillprovider.payment' : `Diese Option ist nur für Ihre Kontrolle.
	Der Kredit, der für den Kunden genehmigt wurde, auch wenn es auf "Nein" gesetzt ist.`,
	'restrictedphonenumber.id_user' : `Benutzer, der die Nummer registrieren möchte.`,
	'restrictedphonenumber.number' : `Nummer.`,
	'restrictedphonenumber.direction' : `Anrufe krank werden gemäß den ausgewählten Optionen analysiert.`,
	'sendcreditproducts.country' : `Land`,
	'sendcreditproducts.operator_name' : `Name des Bedieners.`,
	'sendcreditproducts.operator_id' : `Bediener-ID.`,
	'sendcreditproducts.SkuCode' : `Skucode`,
	'sendcreditproducts.product' : `Produkt`,
	'sendcreditproducts.send_value' : `Einen Wert senden`,
	'sendcreditproducts.wholesale_price' : `Verkaufspreis.`,
	'sendcreditproducts.provider' : ``,
	'sendcreditproducts.status' : `Status.`,
	'sendcreditproducts.info' : `Für die interne Kontrolle verwendet.`,
	'sendcreditproducts.retail_price' : ``,
	'sendcreditproducts.method' : ``,
	'sendcreditrates.idProductcountry' : `Land.`,
	'sendcreditrates.idProductoperator_name' : `Name des Bedieners.`,
	'sendcreditrates.sell_price' : `Verkaufspreis.`,
	'sendcreditsummary.id_user' : `Benutzer.`,
	'servers.name' : `Servername.`,
	'servers.host' : `Server-IP.
	Klicken Sie hier, um mehr über Slave-Server und Proxy | https://magnussolution.com/br/servicos/auto-desempenho/servidor-slave.html zu erfahren.`,
	'servers.public_ip' : `Öffentliche IP.`,
	'servers.username' : `Benutzer, um eine Verbindung zum Server herzustellen.`,
	'servers.password' : `Passwort zum Verbinden mit dem Server.`,
	'servers.port' : `Port, um eine Verbindung zum Server herzustellen.`,
	'servers.sip_port' : `SIP-Anschluss, den der Server verwendet.`,
	'servers.type' : `Server Typ.`,
	'servers.weight' : `Diese Option ist, die Anrufgespräche auszugleichen. || Beispiel.
	Nehmen wir an, es gibt 1 Magnusbilling-Server- und 3-Slave-Server, und Sie möchten das Doppelte von Anrufen an jeden Slave senden, der an den Magnusbilling-Server proportiert.
	Setzen Sie dann einfach den Magnusbilling-Server auf Gewicht 1 und für die Sklavenserver Gewicht 2.`,
	'servers.status' : `Der Proxy sendet nur Anrufe an aktive Server und mit Gewicht höher als 0.`,
	'servers.description' : `Für die interne Kontrolle verwendet.`,
	'services.type' : `Servicetyp.`,
	'services.name' : `Dienstname.`,
	'services.calllimit' : `Limit von gleichzeitigen Anrufen ..`,
	'services.disk_space' : `Setzen Sie den gesamten Speicherplatz in GB ein.`,
	'services.sipaccountlimit' : `Maximaler Wert von SIP-Benutzern, die dieser Client erstellen kann.`,
	'services.price' : `Monatliche Kosten, um den Client aufzuladen, der diesen Dienst aktiviert.`,
	'services.return_credit' : `Wenn dieser Dienst vor dem Ablaufdatum storniert wird, und wenn diese Option auf "Ja" eingestellt ist, wird der proportionale Wert von nicht verwendeten Tagen an den Client zurückerstattet.`,
	'services.description' : `Für die interne Kontrolle verwendet.`,
	'servicesuse.id_user' : `Benutzer, der den Dienst besitzt.`,
	'servicesuse.id_services' : `Bedienung.`,
	'servicesuse.price' : `Servicepreis.`,
	'servicesuse.method' : `Zahlungsmethode.`,
	'servicesuse.reservationdate' : `Tag der Dienstleistungstätigkeit.`,
	'sip.id_user' : `Benutzer, mit dem dieser SIP-Benutzer zugeordnet ist.`,
	'sip.defaultuser' : `Benutzername, der verwendet wird, um sich in einem Softphone oder einem SIP-Gerät anzumelden.`,
	'sip.secret' : `Passwort, um sich in einem Softphone oder einem SIP-Gerät anzumelden.`,
	'sip.callerid' : `Die Anrufer-ID-Nummer, die in ihrem Ziel angezeigt wird.
	Ihr Trunk muss CLI akzeptieren.`,
	'sip.alias' : `Alias, um zwischen SIP-Benutzern aus demselben Kontokode (Firma) zu wählen.`,
	'sip.disallow' : `Alle Codecs nicht zulassen und dann die unten verfügbaren Codecs auswählen, um sie dem Benutzer zu aktivieren.`,
	'sip.allow' : `Wählen Sie die Codecs aus, die der Trunk akzeptiert.`,
	'sip.host' : `Dynamic ist eine Option, mit der der Benutzer ihr Konto unter jeder IP registrieren kann.
	Wenn Sie den Benutzer über IP authentifizieren möchten, geben Sie den Client-IP hier ein, lassen Sie das Kennwortfeld leer, und legen Sie sie auf "Unsichere", um auf die Registerkarte Atelierinformationen eingeladen zu werden.`,
	'sip.sip_group' : `Beim Senden eines Anrufs aus dem Taten oder Kampagnen an eine Gruppe werden alle SIP-Benutzer aufgerufen, die sich in der Gruppe befinden.
	Sie können die Gruppen mit einem beliebigen Namen erstellen. || wird auch verwendet, um Anrufe mit * 8 aufzunehmen, die Option "pickupupen = * 8" in der Datei "Feature.comf" konfigurieren muss.`,
	'sip.videosupport' : `Videoanrufe aktivieren.`,
	'sip.block_call_reg' : `Blockieren Sie Anrufe mit Regex.
	Um Anrufe von Mobiltelefonen zu blockieren, legen Sie einfach ein, ^ 55 \\ d \\ d9.
	Klicken Sie hier, um den Link zu besuchen, der Regex testet. | https://regex101.com.`,
	'sip.record_call' : `Notieren Sie Anrufe dieses SIP-Benutzers.`,
	'sip.techprefix' : `Nützliche Option, wenn es notwendig ist, um mehr als einen Client per IP zu authentifizieren, der dieselbe IP verwendet.
	Gemeinsam in BBX Multi Mieter.`,
	'sip.nat' : `Nat.
	Klicken Sie hier für weitere Informationen | https://www.voip-info.org/asterisk-sip-nat/`,
	'sip.directmedia' : `Wenn aktiviert, versucht Asterisk, den RTP-Medienstrom umzuleiten, um direkt vom Anrufer zur Callee zu gelangen.`,
	'sip.qualify' : `Sendet das Paket "Option", um zu überprüfen, ob der Benutzer online ist. || SINTAX: Qualify = xxx |
	Nein |
	Ja, wo der XXX die Anzahl der verwendeten Millisekunden ist.
	Wenn "Ja", die in SIP.CONF konfigurierte Zeit verwendet wird, ist 2 Sekunden der Standard.
	Wenn Sie "Qualify" aktivieren, wird der Asterisk den Befehl "Option" an das SIP-Peer-Register gesendet, um sicherzustellen, ob das Gerät noch online ist. Wenn das Gerät nicht die Option "Option" beantworten kann, wird der Asterisk in Betracht gezogen
	Das Gerät offline für zukünftige Anrufe.
	Dieser Status kann mit dem Funcion "SIP SHOW PEER XXXX" überprüft werden. Diese Funktion bietet nur Informationsinformationen für den SIP-Peer, der "qualifizieren = Ja.`,
	'sip.context' : `Dies ist der Kontext, den der Anruf verarbeitet wird, "Abrechnung" ist die Standardoption.
	Ändern Sie nur die Konfiguration, wenn Sie ein Wissen über Asterisk haben.`,
	'sip.dtmfmode' : `DTMF-Typ.
	Klicken Sie hier für weitere Informationen | https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
	'sip.insecure' : `Diese Option muss "Nein" sein, wenn der Host dynamisch ist, sodass die IP-Authentifizierung an Port ändert, eingeladen werden.`,
	'sip.deny' : `Sie können den SIP-Verkehr einer bestimmten IP oder einem Netzwerk beschränken.`,
	'sip.permit' : `Sie können den SIP-Verkehr von einem bestimmten IP oder Netzwerk ermöglichen.`,
	'sip.type' : `Der Standardtyp ist "Freund", mit anderen Worten, können Anrufe erstellen und empfangen.
	Klicken Sie hier, um weitere Informationen zu erhalten | https://www.voip-info.org/asterisk-sip-type/.`,
	'sip.allowtransfer' : `Aktivieren Sie dieses VoIP-Konto, um den Transport zu drucken.
	Der Code zur Übertragung ist * 2 Ramal.
	Es ist notwendig, die Option ATXFER => * 2 in der Datei "Features.conf" von Asterisk zu aktivieren.`,
	'sip.ringfalse' : `Falscher Ring aktivieren.
	RR des Befehls "Dial" hinzufügen.`,
	'sip.calllimit' : `Maximale Simultane Anrufe für diesen SIP-Benutzer erlaubt.`,
	'sip.mohsuggest' : `Wartemusik für diesen SIP-Benutzer.`,
	'sip.url_events' : `.`,
	'sip.addparameter' : `Die hier eingesetzten Parameter ersetzen die Standard-Standardparameter sowie der Stämme, wenn es welche gibt.`,
	'sip.amd' : `.`,
	'sip.type_forward' : `Zieltyp erneut senden.
	Dieser Sender funktioniert nicht in Warteschlangen.`,
	'sip.id_ivr' : `Wählen Sie den IVR aus, den Sie an Anrufe senden möchten, wenn der SIP-Benutzer nicht antwortet.`,
	'sip.id_queue' : `Wählen Sie die Warteschlange aus, die Sie an Anrufe senden möchten, wenn der SIP-Benutzer nicht antwortet.`,
	'sip.id_sip' : `Wählen Sie die SIP-Benutzer aus, die Sie an Anrufe senden möchten, wenn der SIP-Benutzer nicht antwortet.`,
	'sip.extension' : `Klicken Sie hier, um weitere Informationen zu erhalten
	So rufen Sie alle SIP-Benutzer in der Gruppe an. * Benutzerdefiniert ist es möglich, die gültige Option des Wählbefehls von Asterisk auszuführen, Beispiel: SIP / CONTASIP, 45, TTR * -Nummer, kann eine Festnetznummer oder eine Handynummer sein, muss sein
	Im 55-DDD-Format`,
	'sip.dial_timeout' : `Timeout in Sekunden, um zu warten, bis der Anruf abgeholt wird.
	Nachdem das Timeout die Kanalisierung ausgeführt wird, wenn sie konfiguriert ist.`,
	'sip.voicemail' : ``,
	'sip.voicemail_email' : `E-Mail, die die E-Mail mit der Voicemail sendet.`,
	'sip.voicemail_password' : `Voicemail-Passwort.
	Es ist möglich, in der Voicemail-Tippen einzugeben * 111`,
	'sip.sipshowpeer' : `SIP Show Peer.`,
	'siptrace.head' : `SIP-Nachrichtenkörper.`,
	'sipuras.nserie' : `Linksys Seriennummer.`,
	'sipuras.macadr' : `Linksys MAC-Adresse.`,
	'sipuras.senha_user' : `Benutzername, um sich bei Linksys-Einstellungen anzumelden`,
	'sipuras.senha_admin' : `Passwort, um sich bei Linksys-Einstellungen anzumelden`,
	'sipuras.antireset' : `Seien Sie vorsichtig. * 73738`,
	'sipuras.Enable_Web_Server' : `In acht nehmen!
	Wenn deaktiviert, kann sich nicht in den Linksys-Einstellungen anmelden.`,
	'sipuras.Proxy_1' : `Proxy 1.`,
	'sipuras.User_ID_1' : `SIP-Benutzer-Benutzername, der in ATA-Zeile 1 verwendet wird.`,
	'sipuras.Password_1' : `SIP-Benutzer-Passwort.`,
	'sipuras.Use_Pref_Codec_Only_1' : `Verwenden Sie nur den bevorzugten Codec`,
	'sipuras.Preferred_Codec_1' : `Stellen Sie den bevorzugten Codec ein`,
	'sipuras.Register_Expires_1' : `Intervall in Sekunden, die Linksys ein Register an Ihren Server senden.
	Nützlich, um einen Verbindungsverlust zu vermeiden, wenn Sie einen Anruf erhalten.`,
	'sipuras.Dial_Plan_1' : `Linksys-Dokumentation lesen.`,
	'sipuras.NAT_Mapping_Enable_1_' : `Es wird empfohlen, diese Option zu aktivieren, wenn ATA hinter NAT ist.`,
	'sipuras.NAT_Keep_Alive_Enable_1_' : `Es wird empfohlen, diese Option zu aktivieren, wenn ATA hinter NAT ist.`,
	'sipuras.Proxy_2' : `Proxy 2.`,
	'sipuras.User_ID_2' : `SIP-Benutzer-Benutzername, der in ATA-Zeile 1 verwendet wird.`,
	'sipuras.Password_2' : `VoIP-Kontokennwort.`,
	'sipuras.Use_Pref_Codec_Only_2' : `Verwenden Sie nur ein bevorzugtes Codec.`,
	'sipuras.Preferred_Codec_2' : `Einstellungen des vorinkiellen Codecs.`,
	'sipuras.Register_Expires_2' : `Zeit in Sekunden, die Linksys "Registrieren" an den Server sendet.
	Wenn es in dieser Linie Anrufe bekommen wird, setzt es besser zwischen 120 und 480 Sekunden.`,
	'sipuras.Dial_Plan_2' : `Linksys-Dokumentation lesen.`,
	'sipuras.NAT_Mapping_Enable_2_' : `Es wird empfohlen, diese Option zu aktivieren, wenn ATA hinter NAT ist.`,
	'sipuras.NAT_Keep_Alive_Enable_2_' : `Es wird empfohlen, diese Option zu aktivieren, wenn ATA hinter NAT ist.`,
	'sipuras.STUN_Enable' : `STUN-Server aktivieren.`,
	'sipuras.STUN_Test_Enable' : `Überprüfen Sie den STUN-Server regelmäßig ..`,
	'sipuras.Substitute_VIA_Addr' : `Ersetzen Sie die Publias IP in der VIA.`,
	'sipuras.STUN_Server' : `STUN-Server-Domäne.`,
	'sipuras.Dial_Tone' : ``,
	'sms.id_user' : `Benutzer, der die SMS gesendet / erhielt.`,
	'sms.telephone' : `Nummer im E164-Format.`,
	'sms.sms' : `SMS-Text.`,
	'sms.sms_from' : ``,
	'smtps.host' : `SMST-Domain || Sie müssen überprüfen, ob der Rechenzentrum, wenn der Server, an dem der Server gehostet wird, die von SMTP verwendeten Ports nicht blockieren.`,
	'smtps.username' : `Benutzername, der zur Authentifizierung des SMTP-Servers verwendet wird.`,
	'smtps.password' : `Passwort zur Authentifizierung des SMTP-Servers.`,
	'smtps.port' : `Port, der vom SMTP-Server verwendet wird.`,
	'smtps.encryption' : `Verschlüsselungstyp.`,
	'templatemail.fromname' : `Dies ist der Name, der mit dem FromName von der E-Mail verwendet wird.`,
	'templatemail.fromemail' : `E-Mail, die in der FromMail verwendet wird, muss die gleiche E-Mail sein, die vom SMTP-Benutzer verwendet wird.`,
	'templatemail.subject' : `E-Mail Betreff.`,
	'templatemail.status' : `Mit dieser Option können Sie die exklusiven Mailings dieser E-Mail deaktivieren.`,
	'templatemail.messagehtml' : `Botschaft.
	Es ist möglich, Variablen, Blick auf die Registerkarte Variablen, um die Liste der Avaible-Variablen anzuzeigen.`,
	'trunk.id_provider' : `Anbieter, den der Trunk gehört.`,
	'trunk.trunkcode' : `Trunkname, muss einzigartig sein.`,
	'trunk.user' : `Wird nur verwendet, wenn die Authentifizierung über Benutzername und Kennwort erfolgt.`,
	'trunk.secret' : `Wird nur verwendet, wenn die Authentifizierung über Benutzername und Kennwort erfolgt.`,
	'trunk.host' : `IP- oder Trunk-Domäne.`,
	'trunk.trunkprefix' : `Fügen Sie ein Präfix hinzu, um an Ihren Trunk zu senden.`,
	'trunk.removeprefix' : `Entfernen Sie ein Präfix, um an Ihren Trunk zu senden.`,
	'trunk.allow' : `Wählen Sie die Codecs aus, die in diesem Trunk erlaubt sind.`,
	'trunk.providertech' : `Sie müssen ein entsprechendes Laufwerk installieren, um die Karte wie DGV Extra Dongle zu verwenden.`,
	'trunk.status' : `Wenn der Trunk inaktiv ist, schickt Magnusbilling den Anruf an den Backup-Trunk.`,
	'trunk.allow_error' : `Wenn ja, alle Anrufe, aber beantwortet und Abbrechen wird an einen Backup-Trunk gesendet.`,
	'trunk.register' : `Nur aktiv, wenn der Trunk über Benutzername und Kennwort authentifiziert ist.`,
	'trunk.register_string' : `<Benutzer>: <passy> @ <host> / contact. || "Benutzer" ist die Benutzer-ID für diesen SIP-Server (EX 2345). "Passwort" ist das Benutzerpasswort "Host" ist der SIP-Serverdomänen- oder Hostname
	. "PORT" Senden Sie eine Anforderung des Registers in diesen Host-Anschluss.
	Standard für 5060 "Kontakt" ist die Erweiterung des Asterisk-Kontakts.
	BEISPIEL 1234 ist in der Kontaktüberschrift der SIP-Register-Nachricht eingestellt.
	Der Kontakt Ramal wird vom SIP-Server entfernt, wenn er benötigt wird, um einen Anruf an Asterisk zu senden.`,
	'trunk.fromuser' : `Mehrere Anbieter fordern diese Option zur Authentifizierung, in erster Linie, wenn sie über Benutzer und Kennwort authentifiziert wird.
	Lassen Sie es leer, um den CallerID des SIP-Benutzers von aus zu senden.`,
	'trunk.fromdomain' : `Definiert die von der Domäne: in den SIP-Nachrichten, wenn Sie sich wie ein UAC-SIP (Client) handeln.`,
	'trunk.language' : `Standardsprache, die in einer beliebigen Wiedergabe () / Hintergrund () verwendet wird.`,
	'trunk.context' : `Ändern Sie dies nur, wenn Sie wissen, was Sie tun.`,
	'trunk.dtmfmode' : `DMTF-Typ.
	Klicken Sie hier für weitere Informationen | https://www.voip-info.org/asterisk-dtmf/.`,
	'trunk.insecure' : `Unsicher.
	Klicken Sie hier, um weitere Informationen zu erhalten, https://www.voip-info.org/asterisk-sip-incuresecure/.`,
	'trunk.maxuse' : `Maximale gleichzeitige Anrufe für diesen Trunk.`,
	'trunk.nat' : `Ist der Trunk hinter Nat?
	Klicken Sie hier für weitere Informationen | https://www.voip-info.org/asterisk-sip-nat/.`,
	'trunk.directmedia' : `Wenn aktiviert, versucht Asterisk, das RTP-Medium direkt zwischen Ihrem Client und dem Anbieter zu senden.
	Es ist auch notwendig, auch auf dem Trunk aktiv zu sein.
	Klicken Sie hier für weitere Informationen | https://www.voip-info.org/asterisk-sip-canreinvite/.`,
	'trunk.qualify' : `Sendet das Paket "Option", um zu überprüfen, ob der Benutzer online ist. || SINTAX: Qualify = xxx |
	Nein |
	Ja, wo der XXX die Anzahl der verwendeten Millisekunden ist.
	Wenn "Ja", die in SIP.CONF konfigurierte Zeit verwendet wird, ist 2 Sekunden der Standard.
	Wenn Sie "Qualify" aktivieren, wird der Asterisk den Befehl "Option" an das SIP-Peer-Register gesendet, um sicherzustellen, ob das Gerät noch online ist. Wenn das Gerät nicht die Option "Option" beantworten kann, wird der Asterisk in Betracht gezogen
	Das Gerät offline für zukünftige Anrufe.
	Dieser Status kann mit dem Funcion "SIP SHOW PEER XXXX" überprüft werden. Diese Funktion bietet nur Informationsinformationen für den SIP-Peer, der "qualifizieren = Ja.`,
	'trunk.type' : `Der Standardtyp ist "Freund", mit anderen Worten, sie können Anrufe erstellen und empfangen.
	Klicken Sie hier, um weitere Informationen zu erhalten | https://www.voip-info.org/asterisk-sip-type/.`,
	'trunk.disallow' : `In dieser Option ist es möglich, Codecs deaktivieren zu können.
	Verwenden Sie "Alle verwenden", um alle Codecs zu deaktivieren, und stellen Sie es dem Benutzer nur zur Verfügung, nur das, was Sie unten ausgewählt haben.`,
	'trunk.sendrpid' : `Definiert, wenn eine Remote-Party-ID SIP-Header-Aufgabe gesendet werden soll. || Der Standard ist "Nein".
	Dieses Feld wird häufig von VoIP-Großhändler-Anbietern verwendet, um die Anruferidentität unabhängig von den Datenschutzeinstellungen (von SIP-Header) zu liefern.`,
	'trunk.addparameter' : ``,
	'trunk.port' : `Wenn Sie einen anderen Port als 5060 verwenden möchten, müssen Sie den iptabables-Port öffnen.`,
	'trunk.link_sms' : `URL to send SMS. Replace the number variable to %number% and text per %text%. EXAMPLE. Your SMS URL is http://trunkWebSite.com/sendsms.php?user=magnus&pass=billing&number=XXXXXX&sms_text=SSSSSSSSSSS. replace XXXXXX per %number and SSSSSSSSSSS per %text% 	/trunkwebsite.com/sends.php?user=magnus.`,
	'trunk.sms_res' : `Lassen Sie es leer, um den Anbieter nicht zu warten.
	Oder schreiben Sie den Text, der in den Anbietern bestehen muss, um als gesendet zu betrachten.`,
	'trunk.sip_config' : `Gültiges Format von Asterisk SIP.CONF, eine Option pro Zeile. || Beispiel, lasst uns sagen, dass Sie den Parameter des Benutzeragent-Parameters setzen müssen. Setzen Sie es in dieses Feld ein: UserAgent = mein Agent.`,
	'trunkgroup.name' : `Trunkgruppenname.`,
	'trunkgroup.type' : `Typ. || Es ist, wie das System den Trunk sortieren wird, der einer Gruppe gehört. * In Ordnung.
	Das System sendet einen Anruf an die Trunks, die sich in der ausgewählten Reihenfolge * zufällig befinden.
	Das System sortiert die Stämme in randomisierter Weise randomisiert, wobei die Rand () -Funktion von MySQL den Rumpf in der Folge wiederholen kann. * LCR.
	Sorth die Stämme, die niedrigere Kosten haben.
	Wenn der Kofferbesitzer keinen Tarif hat, wird entwachsen und wird es in letzter Zeit gestellt.
	Magnusbilling schickt die Anrufe an die in dieser Gruppe gehörenden Stämme, bis die Anrufe beantwortet, besetzt oder storniert werden.
	Dies sind die Werte, die von Asterisk zurückgegeben werden, und es ist nicht möglich, sich zu ändern.`,
	'trunkgroup.id_trunk' : `Wählen Sie die Stämme aus, die zu dieser Gruppe gehören.
	Wenn Sie den Typ, Reihenfolge ausgewählt haben, wählen Sie die Stämme in der gewünschten Reihenfolge aus.`,
	'trunksipcodes.ip' : ``,
	'trunksipcodes.code' : ``,
	'trunksipcodes.total' : ``,
	'user.username' : `Benutzername, der verwendet wurde, um sich in das Panel anzumelden.`,
	'user.password' : `Passwort zum Anmelden in das Panel.`,
	'user.id_group' : `Es gibt 3 Gruppen: Admin, Agent und Client.
	Sie können mehr oder bearbeiten Sie eine dieser Gruppen.
	Jede Gruppe kann spezifische Berechtigungen haben.
	Überprüfen Sie die Menükonfiguration-> Benutzergruppe.`,
	'user.id_group_agent' : `Wählen Sie die Gruppe aus, die die Kunden dieses Einzelhändlers benutzen.`,
	'user.id_plan' : `Plan, der verwendet wird, um die Kunden aufzuladen.`,
	'user.language' : `Sprache.
	Diese Sprache wird für einige Systemfunktionen verwendet, jedoch nicht für die Panelsprache.`,
	'user.prefix_local' : `Präfixregeln.
	Klicken Sie hier für weitere Informationen | https://www.magnusbilling.org/local_prefix`,
	'user.active' : `Nur aktive Benutzer können sich in das Panel anmelden und Anrufe tätigen`,
	'user.country' : `Wird zum CID-Rückruf verwendet.
	Der Country-Präfix-Code wird hinzugefügt, bevor die CID die CID auf E164 konvertieren kann`,
	'user.id_offer' : `Verwendet, um freie Minuten zu geben.
	Es ist notwendig, die Tarife zu informieren, die zu den freien Paketen gehören.`,
	'user.cpslimit' : `CPS (Anrufe pro Sekunde) limitieren diesem Kunden.
	Die Anrufe, die dieses Limit überschreiten, werden Überlastung gesendet.`,
	'user.company_website' : `Website der Unternehmen. | Wird auch zur Anpassung der Agent Panel verwendet.
	Setzen Sie den Agenten die Domäne ohne HTTP oder WWWW ein.`,
	'user.company_name' : `Name der Firma.
	Wird auch zur Anpassung der Agent Panel verwendet. | Ob ein Agent Dieser Name wird auf dem Anmeldefeld verwendet.
	Setzen Sie die Compnay-Website, und verwenden Sie die Agentendomäne, um die Anpassung zu arbeiten`,
	'user.commercial_name' : `Markenname.`,
	'user.state_number' : `Zustandsnummer`,
	'user.lastname' : `Nachname.`,
	'user.firstname' : `Vorname.`,
	'user.city' : `Stadt.`,
	'user.state' : `Zustand.`,
	'user.address' : `Adresse.`,
	'user.neighborhood' : `Gegend.`,
	'user.zipcode' : `PLZ.`,
	'user.phone' : `Festnetztelefon.`,
	'user.mobile' : `Mobiltelefon.`,
	'user.email' : `E-Mail ist erforderlich, um Systembenachrichtigungen zu senden.`,
	'user.doc' : `Client-Dokument.`,
	'user.vat' : `In einigen Zahlungsmethoden verwendet.`,
	'user.typepaid' : `Pos-bezahlte Kunden können mit negativem Gleichgewicht bleiben, bis die Kreditlimit auf dem Feld unten informiert ist.`,
	'user.creditlimit' : `Wenn der Benutzer nachbezahlt ist, kann der Benutzer Anrufe anrufen, bis er dieses Limit erreicht.`,
	'user.credit_notification' : `Wenn der Client-Guthaben niedriger ist als dieser Feldwert, sendet das MagnusBilling eine E-Mail an den Client, warn er mit niedrigem Credits.
	Es ist notwendig, dass ein registrierter SMTP-Server im Menü Einstellungsmenü verfügt.`,
	'user.enableexpire' : `Ablauf aktivieren.
	Es ist notwendig, das Ablaufdatum im Feld "Verfallsdatum" zu informieren.`,
	'user.expirationdate' : `Das Datum, an dem der Benutzer nicht mehr anrufen kann.`,
	'user.calllimit' : `Die Höhe der gleichzeitigen Anrufe, die für diesen Kunde zulässig ist.`,
	'user.calllimit_error' : `Warnung, um gesendet zu werden, wenn der Anruflimit überschritten wird.`,
	'user.mix_monitor_format' : `Format zum Aufzeichnen von Anrufen.`,
	'user.callshop' : `Aktivieren Sie das Callshop-Modul.
	Nur aktiv, wenn Sie es wirklich verwenden werden.
	Es ist notwendig, der ausgewählten Gruppe zubereiteten.`,
	'user.disk_space' : `Legen Sie den zur Aufnahme verfügbaren Betragspeicherplatz in GB ein.
	Verwenden Sie -1, um es ohne Limit zu speichern.
	Es ist notwendig, den CRON den folgenden PHP-Befehl /var/www/html/mbilling/cron.php userdiskspace hinzuzufügen.`,
	'user.sipaccountlimit' : `Der von diesem Benutzer erlaubte Menge an VoIP-Konten.
	Es ist notwendig, der Gruppe Erlaubnis zu geben, VoIP-Konten zu erstellen.`,
	'user.callingcard_pin' : `Verwendet, um die Anrufkarte zu authentifizieren.`,
	'user.restriction' : `Verwendet, um die Wahl einzuschränken.
	Fügen Sie die Nummern im Menü hinzu: Benutzer-> eingeschränkte Zahlen.`,
	'user.transfer_international_profit' : `Diese Funktion ist in Brasilien nicht verfügbar.
	Es wird nur für mobile Nachfüllungen in einigen Ländern verwendet.`,
	'user.transfer_flexiload_profit' : `Diese Funktion ist in Brasilien nicht verfügbar.
	Es wird nur für mobile Nachfüllungen in einigen Ländern verwendet.`,
	'user.transfer_bkash_profit' : `Diese Funktion ist in Brasilien nicht verfügbar.
	Es wird nur für mobile Nachfüllungen in einigen Ländern verwendet.`,
	'user.transfer_dbbl_rocket' : `Diese Funktion ist in Brasilien nicht verfügbar.
	Es wird nur für mobile Nachfüllungen in einigen Ländern verwendet.`,
	'user.transfer_dbbl_rocket_profit' : `Diese Funktion ist in Brasilien nicht verfügbar.
	Es wird nur für mobile Nachfüllungen in einigen Ländern verwendet.`,
	'user.transfer_show_selling_price' : `Diese Funktion ist in Brasilien nicht verfügbar.
	Es wird nur für mobile Nachfüllungen in einigen Ländern verwendet.`,
	'userrate.id_prefix' : `Wählen Sie das Präfix aus, das Sie abonnieren möchten.`,
	'userrate.rateinitial' : `Neuverkaufspreis für dieses Präfix.`,
	'userrate.initblock' : `Mindestverkaufspreis.`,
	'userrate.billingblock' : `Block verkaufen.`,
	'voucher.credit' : `Gutscheinpreis.
	Klicken Sie hier, um es zu erfahren, Gutscheine einzurichten. | https://wiki.magnusbilling.org/de/source/how_to_use_Voucher.html.`,
	'voucher.id_plan' : `Plan, der mit dem Client verknüpft ist, der diesen Gutschein verwenden wird.`,
	'voucher.language' : `Sprache, die verwendet wird.`,
	'voucher.prefix_local' : `Regel, die im Feld "Präfixregel" verwendet wird`,
	'voucher.quantity' : `Die Menge der zu erzeugenden Gutscheine.`,
	'voucher.tag' : `Beschreibung zum Kalender, nur zur Selbststeuerung.`,
	'voucher.voucher' : `Gutscheinnummer.,`,
	});