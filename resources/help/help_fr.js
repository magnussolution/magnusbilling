Help.load({
	'alarm.type' : ``,
	'alarm.period' : ``,
	'alarm.condition' : ``,
	'alarm.amount' : ``,
	'alarm.email' : ``,
	'alarm.status' : ``,
	'api.id_user' : `Vous devez utiliser l'API MagnusBilling à partir de https://github.com/magnussolution/magnusbilling-api-php.
	Le propriétaire du nom d'utilisateur cette API`,
	'api.api_key' : `Cette touche d'apy sera nécessaire pour exécuter l'API`,
	'api.api_secret' : `Ce secret d'apy sera nécessaire pour exécuter l'API`,
	'api.status' : `Vous pouvez activer ou inactiver cette API`,
	'api.action' : `Quelle action l'utilisateur aura exécuter`,
	'api.api_restriction_ips' : `Ce que vous voulez autoriser l'accès à cette API.
	Laisser blanc pour permettre n'importe quelle adresse IP.
	Il est très recommandé fixé les IPS`,
	'call.starttime' : `Heure de début de l'appel`,
	'call.src' : `SIP utilisateur qui a fait appel à l'appel`,
	'call.callerid' : `Numéro envoyé au coffre comme identifiant de l'appel. ||
	Si le tronc accepte le CallerID envoyé, ce numéro sera utilisé comme identifiant.
	Pour ce travail, il sera nécessaire d'avoir le champ FromUSer dans le coffre vide.`,
	'call.calledstation' : `Numéro composé par le client.`,
	'call.idPrefixdestination' : `Nom de la destination, ce nom est une relation avec le menu préfixe.`,
	'call.idUserusername' : `Utilisateur qui a apporté l'appel, celui qui a été pris par le coût de l'appel.`,
	'call.idTrunktrunkcode' : `Coffre qui a été utilisé pour compléter l'appel.`,
	'call.sessiontime' : `Durée de l'appel en secondes.`,
	'call.buycost' : `Acheter des coûts.
	Cliquez pour comprendre comment le coût est calculé | https://wiki.magnusbilling.org/en/source/price_calculation.html.`,
	'call.sessionbill' : `Prix de vente, la valeur prise du client.
	Cliquez pour comprendre comment le coût est calculé | https://wiki.magnusbilling.org/en/source/price_calculation.html.`,
	'call.agent_bill' : `Prix de vente, la valeur prise du client.
	Cliquez pour comprendre comment le coût est calculé | https://wiki.magnusbilling.org/en/source/price_calculation.html.`,
	'call.uniqueid' : `ID unique généré par Asterisk, ce champ est également l'heure de départ de l'appel à Epoch Unix.`,
	'callarchive.calledstation' : `Numéro composé par le client.`,
	'callarchive.sessiontime' : `Durée de l'appel en secondes.`,
	'callarchive.buycost' : `Acheter des coûts.
	Cliquez pour comprendre comment le coût est calculé | https://wiki.magnusbilling.org/en/source/price_calculation.html`,
	'callarchive.sessionbill' : `Acheter des coûts.
	Cliquez pour comprendre comment le coût est calculé | https://wiki.magnusbilling.org/en/source/price_calculation.html`,
	'callarchive.agent_bill' : `Acheter des coûts.
	Cliquez pour comprendre comment le coût est calculé | https://wiki.magnusbilling.org/en/source/price_calculation.html`,
	'callback.id_user' : `Propriétaire du fait que cela a reçu la demande de rappel.`,
	'callback.exten' : `Nombre de qui a appelé le demandeur a demandé le rappel`,
	'callback.status' : `Statut de l'appel || Les statuts sont: * Actif Le rappel n'a toujours pas été traité.
	* En attente de magnusbillants traitées le rappel et envoyé-la au coffre.
	* Envoyé le rappel a été traité avec succès.
	* En dehors de la plage de temps, l'appel a été reçu en dehors de la plage de temps configurée dans le menu DAI, onglet Callback Pro.
	.`,
	'callerid.id_user' : `Sélectionnez Utilisateur.`,
	'callerid.cid' : `Le numéro à la CID s'authentifier avec CallingCard.
	Utilisez le format exact que vous avez reçu l'appeleur de votre fournisseur de votre fournisseur.`,
	'callerid.name' : ``,
	'callerid.description' : `Description CallerID.`,
	'callerid.activated' : `Statut de l'appeléide.`,
	'callonline.idUserusername' : `Utilisateur principal de l'utilisateur SIP qui a commencé l'appel.`,
	'callonline.sip_account' : `Utilisateur SIP qui a demandé l'appel.`,
	'callonline.idUsercredit' : `Crédit d'utilisateurs.`,
	'callonline.ndiscado' : `Numéro composé.`,
	'callonline.codec' : `Codec utilisé.`,
	'callonline.callerid' : `Le numéro de callerid.`,
	'callonline.tronco' : `Coffre qui a été utilisé pour compléter l'appel.`,
	'callonline.reinvite' : `REINVITE est le paramètre qui informe si l'audio passe à travers un astérisque ou si elle passe par le client et le coffre.
	Cliquez pour en savoir plus sur cette option | https://wiki.magnusbilling.org/en/source/asterisk_options/directmedia.html.`,
	'callonline.from_ip' : `IP de l'appelant.`,
	'callonline.description' : `Données de la commande SIP Show Channel.`,
	'callshopcdr.id_user' : ``,
	'callsummarycallshop.sumsessiontime' : `Somme des minutes d'appel.`,
	'callsummarycallshop.sumprice' : `Valeur totale.`,
	'callsummarycallshop.sumlucro' : `Somme des gains.`,
	'callsummarycallshop.sumbuycost' : `Somme du coût d'achat.`,
	'callsummarycallshop.sumnbcall' : `Total des appels.`,
	'callsummarydayagent.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummarydayagent.sumsessionbill' : `Somme du prix de vente.`,
	'callsummarydayagent.sumbuycost' : `Somme du coût d'achat.`,
	'callsummarydayagent.sumlucro' : `Somme des gains.`,
	'callsummarydayagent.sumnbcall' : `Total des appels.`,
	'callsummarydaytrunk.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummarydaytrunk.sumsessionbill' : `Somme du prix de vente.`,
	'callsummarydaytrunk.sumbuycost' : `Somme du coût d'achat.`,
	'callsummarydaytrunk.sumlucro' : `Somme des gains.`,
	'callsummarydaytrunk.sumnbcall' : `Total des appels.`,
	'callsummarydayuser.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummarydayuser.sumlucro' : `Somme des gains.`,
	'callsummarydayuser.sumnbcall' : `Total des appels.`,
	'callsummarymonthdid.sumsessionbill' : ``,
	'callsummarymonthdid.sumsessiontime' : ``,
	'callsummarymonthdid.sumnbcall' : ``,
	'callsummarymonthtrunk.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummarymonthtrunk.sumsessionbill' : `Somme du prix de vente.`,
	'callsummarymonthtrunk.sumbuycost' : `Somme du coût d'achat.`,
	'callsummarymonthtrunk.sumlucro' : `Somme des gains.`,
	'callsummarymonthtrunk.sumnbcall' : `Total des appels.`,
	'callsummarymonthuser.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummarymonthuser.sumlucro' : `Somme des gains.`,
	'callsummarymonthuser.sumnbcall' : `Total des appels.`,
	'callsummaryperday.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummaryperday.sumsessionbill' : `Somme du prix de vente.`,
	'callsummaryperday.sumbuycost' : `Somme du coût d'achat.`,
	'callsummaryperday.sumlucro' : `Somme des gains.`,
	'callsummaryperday.sumnbcall' : `Total des appels.`,
	'callsummaryperday.sumnbcallfail' : `Total des appels qui ont échoué.`,
	'callsummarypermonth.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummarypermonth.sumsessionbill' : `Somme du prix de vente.`,
	'callsummarypermonth.sumbuycost' : `Somme du coût d'achat.`,
	'callsummarypermonth.sumlucro' : `Somme des gains.`,
	'callsummarypermonth.sumnbcall' : `Total des appels.`,
	'callsummarypertrunk.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummarypertrunk.sumsessionbill' : `Somme du prix de vente.`,
	'callsummarypertrunk.sumbuycost' : `Somme du coût d'achat.`,
	'callsummarypertrunk.sumlucro' : `Somme des gains.`,
	'callsummarypertrunk.sumnbcall' : `Total des appels.`,
	'callsummarypertrunk.sumnbcallfail' : `Total des appels qui ont échoué.`,
	'callsummaryperuser.sumsessiontime' : `Somme des minutes d'appel. || Il est possible d'utiliser des filtres comme indiquant que les derniers jours de la semaine ou un revendeur spécifique.
	Ce résumé ne montrera que les données relatives au filtre effectuées.`,
	'callsummaryperuser.sumlucro' : `Somme des gains.`,
	'callsummaryperuser.sumnbcall' : `Total des appels.`,
	'callsummaryperuser.sumnbcallfail' : `Total des appels qui ont échoué.`,
	'campaign.id_user' : `Utilisateur qui possède la campagne.`,
	'campaign.id_plan' : `Quel plan souhaitez-vous utiliser pour faire face à cette campagne?`,
	'campaign.name' : `Nom de la campagne.`,
	'campaign.status' : `Statut de la campagne.`,
	'campaign.startingdate' : `La campagne commencera à partir de cette date.`,
	'campaign.expirationdate' : `La campagne s'arrêtera à cette date.`,
	'campaign.type' : `Choisissez la voix ou les SMS.
	Si vous choisissez la voix, vous devrez importer audio.
	Si vous choisissez SMS, vous devrez définir le texte dans l'onglet SMS.`,
	'campaign.audio' : `Disponible pour appeler massive.
	L'audio doit être compatible avec l'astérisque.
	Le format recommandé est GSM ou WAV (8K Hz Mono).`,
	'campaign.audio_2' : `Si vous utilisez TTS, le nom sera exécuté entre l'audio et l'audio2.`,
	'campaign.restrict_phone' : `Activation de cette option, MagnusBilling vérifiera si le numéro qui sera envoyé l'appel est enregistré dans le menu du téléphone restreint, le cas échéant, le système modifiera l'état du numéro en bloc et n'enverra pas l'appel.`,
	'campaign.auto_reprocess' : `S'il n'y a pas de numéros actifs dans ce livre téléphonique de la campagne, réactive tous les numéros en attente.`,
	'campaign.id_phonebook' : `Sélectionnez un ou plusieurs répertoires à utiliser.`,
	'campaign.digit_authorize' : `Voulez-vous envoyer l'appel après l'audio?
	E.g, si la callee presse 1, il est envoyé à SIP User XXXX.
	Définissez le numéro sur Transférer = 1, Type d'avant = SiP et sélectionnez l'utilisateur SIP pour envoyer la callee à.
	Ensemble -1 pour désactiver.`,
	'campaign.type_0' : `Choisissez le type de redirection.
	Cela enverra l'appel à la destination choisie.`,
	'campaign.id_ivr_0' : `Choisissez un IVR pour envoyer l'appel à.
	L'IVR doit appartenir au propriétaire de la campagne.`,
	'campaign.id_queue_0' : `Choisissez une file d'attente pour envoyer l'appel à.
	La file d'attente doit appartenir au propriétaire de la campagne.`,
	'campaign.id_sip_0' : `Choisissez un utilisateur SIP pour envoyer l'appel à.
	L'utilisateur SIP doit appartenir au propriétaire de la campagne.`,
	'campaign.extension_0' : `Cliquez pour plus de détails || Il existe deux options disponibles.
	* Groupe, le nom du groupe doit être mis ici exactement comme dans les utilisateurs de SIP qui devraient recevoir les appels.
	* Personnalisé, vous pouvez exécuter une option valide via la commande de cadran d'Asterisk.
	Exemple: SIP / SIPAccount, 45, TTR.`,
	'campaign.record_call' : `Notez les appels de la campagne.
	Ils seront uniquement enregistrés si l'appel est transféré.`,
	'campaign.daily_start_time' : `Temps que la campagne commencera à envoyer.`,
	'campaign.daily_stop_time' : `Temps que la campagne cessera d'envoyer.`,
	'campaign.monday' : `Activation de cette option Le système envoie des appels le lundi.`,
	'campaign.tuesday' : `Activation de cette option Le système enverra des appels le mardi.`,
	'campaign.wednesday' : `Activation de cette option Le système envoie des appels le mercredi.`,
	'campaign.thursday' : `Activation de cette option Le système enverra des appels le jeudi.`,
	'campaign.friday' : `Activation de cette option Le système enverra des appels le vendredi.`,
	'campaign.saturday' : `Activation de cette option Le système enverra des appels le samedi.`,
	'campaign.sunday' : `Activation de cette option Le système enverra des appels le dimanche.`,
	'campaign.frequency' : `Combien de chiffres seront traités par minute? || Cette valeur sera divisée de 60 secondes et les appels seront envoyés chaque minute en même temps.`,
	'campaign.max_frequency' : `Ceci est la valeur maximale que le client pourra définir.
	Si vous le définissez sur 50, l'utilisateur sera en mesure de passer à une valeur de 50 ou moins de 50.`,
	'campaign.nb_callmade' : `Utilisé pour contrôler les appels terminés max.`,
	'campaign.enable_max_call' : `Si la magnusbilling activée vérifiera le nombre d'appels déjà fabriqués et avoir une durée totale supérieure à celle des audios.
	Si la quantité est égale ou plus grande que la valeur définie dans le champ, la campagne sera désactivée.`,
	'campaign.secondusedreal' : `Quantité maximale d'appels complets.
	Vous devez activer le champ ci-dessus pour l'utiliser.`,
	'campaign.description' : ``,
	'campaign.tts_audio' : ``,
	'campaign.tts_audio2' : `Même paramètre que le champ précédent mais pour l'audio 2. N'oubliez pas qu'entre audio 1 et 2, le TTS exécute le nom importé avec le numéro.`,
	'campaigndashboard.name' : `Nom de la campagne.`,
	'campaignlog.total' : `Total des appels.`,
	'campaignpoll.id_campaign' : `Choisissez la campagne qui exécutera ce sondage.`,
	'campaignpoll.name' : `Nom du sondage.
	Ce nom est vu sur votre fin seulement.`,
	'campaignpoll.repeat' : `Combien de fois faut-il répéter l'audio de sondage si le client n'a appuyé sur une option valide. || Vous pouvez vérifier quelles sont les options dans l'onglet Option.`,
	'campaignpoll.request_authorize' : `Dans certains cas, vous devrez demander la conformité afin d'exécuter le sondage.
	Si tel est le cas, sélectionnez Oui.`,
	'campaignpoll.digit_authorize' : `Chiffre d'autoriser l'exécution du sondage.`,
	'campaignpoll.arq_audio' : `Fichier audio.
	Veuillez utiliser un fichier audio GSM ou WAV 8KHZ Mono.`,
	'campaignpoll.description' : `Description du sondage.`,
	'campaignpoll.option0' : ``,
	'campaignpoll.option1' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option2' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option3' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option4' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option5' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option6' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option7' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option8' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpoll.option9' : `Décrire l'option.
	Lisez la description de l'option 0.`,
	'campaignpollinfo.number' : `Nombre de la personne qui a voté.`,
	'campaignpollinfo.resposta' : `Option choisie.`,
	'campaignrestrictphone.number' : `Nombre qui devrait être bloqué.
	Il est nécessaire d'activer l'option Nombres bloquées dans la campagne.`,
	'configuration.config_value' : `Valeur.
	Cliquez ici pour en savoir plus sur les options de ce menu. | https://wiki.magnusbilling.org/en/source/config.html.`,
	'configuration.config_description' : `La description.
	Cliquez ici pour en savoir plus sur les options de ce menu. | https://wiki.magnusbilling.org/en/source/config.html`,
	'did.did' : `Le nombre exact provenant du contexte dans l'astérisque.
	Nous vous recommandons de toujours utiliser le format E164.`,
	'did.record_call' : `Enregistrez des appels à cela.
	Enregistré indépendamment de la destination.`,
	'did.activated' : `Seuls les numéros actifs peuvent recevoir des appels.`,
	'did.callerid' : `Utilisez ce champ pour définir un nom de callateur ou laissez-le en blanc pour utiliser l'appelé reçu reçu du fournisseur de travail.`,
	'did.connection_charge' : `Coût d'activation.
	Cette valeur sera déduite du client au moment où le DID est associé à l'utilisateur.`,
	'did.fixrate' : `Prix mensuel.
	Cette valeur sera déduite automatiquement chaque mois à partir du solde de l'utilisateur.
	Si le client n'a pas assez de crédit, le DID sera annulé automatiquement.`,
	'did.connection_sell' : `C'est la valeur qui sera facturée pour chaque appel.
	En choisissant simplement l'appel, cette valeur sera déduite.`,
	'did.minimal_time_charge' : `Temps minimum pour tarif tarif le.
	Si vous l'avez défini sur 3 tout appel qui, avec une durée inférieure, ne sera pas facturé.`,
	'did.initblock' : `Temps minimum en quelques secondes à acheter.
	Si vous le définissez à 30 et que la durée de l'appel est 10, l'appel sera facturé 30.`,
	'did.increment' : `Cela définit le bloc dans lequel le temps de facturation d'appel sera incrémenté, en quelques secondes.
	Si défini sur 6 et la durée d'appel est 32, l'appel sera facturé comme 36.`,
	'did.charge_of' : `L'utilisateur qui sera facturé pour le coût.`,
	'did.calllimit' : `Des appels simultanés maximaux à cela ont fait.`,
	'did.description' : `Vous pouvez prendre des notes ici!`,
	'did.expression_1' : ``,
	'did.selling_rate_1' : `Prix par minute si le numéro correspond à l'expression régulière ci-dessus.`,
	'did.block_expression_1' : `Définissez sur Oui pour bloquer les appels qui correspondent à l'expression régulière ci-dessus.`,
	'did.send_to_callback_1' : `Envoyez cet appel à Callback s'il correspond à l'expression régulière ci-dessus.`,
	'did.expression_2' : `Comme la première expression.
	Cliquez pour plus d'informations. | https://wiki.magnusbilling.org/en/source/modules/did/did.html`,
	'did.selling_rate_2' : `Prix par minute si le numéro correspond à l'expression régulière ci-dessus.`,
	'did.block_expression_2' : `Définissez sur Oui pour bloquer les appels qui correspondent à l'expression régulière ci-dessus.`,
	'did.send_to_callback_2' : `Envoyez cet appel à Callback s'il correspond à l'expression régulière ci-dessus.`,
	'did.expression_3' : `Comme la première expression.
	Cliquez pour plus d'informations. | https://wiki.magnusbilling.org/en/source/modules/did/did.html`,
	'did.selling_rate_3' : `Prix par minute si le numéro correspond à l'expression régulière ci-dessus.`,
	'did.block_expression_3' : `Définissez sur Oui pour bloquer les appels qui correspondent à l'expression régulière ci-dessus.`,
	'did.send_to_callback_3' : `Envoyez cet appel à Callback s'il correspond à l'expression régulière ci-dessus.`,
	'did.cbr' : `Active Callback Pro.`,
	'did.cbr_ua' : `Exécuter un audio.`,
	'did.cbr_total_try' : `Combien de fois le système essaie-t-il de retourner l'appel?`,
	'did.cbr_time_try' : `Intervalle de temps entre chaque essai, en minutes.`,
	'did.cbr_em' : `Exécuter un audio avant que l'appel soit répondu.
	Votre fournisseur DID doit permettre aux premiers médias.`,
	'did.TimeOfDay_monFri' : `Exemple: si votre entreprise ne rappelle que sur la callee si l'appel a été placé entre 09h00 et 12h00 et 14h00 à 18h00, mon-frire, entre cet intervalle de temps, Workaudio va être joué, puis rappel
	à la callee.
	Vous pouvez utiliser plusieurs intervalles de temps séparés par |.`,
	'did.TimeOfDay_sat' : `Le même mais pour samedi.`,
	'did.TimeOfDay_sun' : `Le même mais le dimanche.`,
	'did.workaudio' : `Audio qui sera exécuté lorsqu'un appel est reçu à l'intervalle de temps.`,
	'did.noworkaudio' : `Audio qui sera exécuté lorsqu'un appel est reçu hors de l'intervalle de temps.`,
	'diddestination.id_did' : `Sélectionnez le fait que vous voulez créer une nouvelle destination.`,
	'diddestination.id_user' : `Utilisateur qui sera le propriétaire de cela a fait.`,
	'diddestination.activated' : `Seules les destinations actives seront utilisées.`,
	'diddestination.priority' : `Vous pouvez créer jusqu'à 5 destinations pour votre.
	Si un essai est effectué et qu'une erreur est reçue, MagnusBilling essaiera d'envoyer l'appel à la priorité de destination suivante disponible.
	Ne fonctionne que avec le type "SIP Call".`,
	'diddestination.voip_call' : `Type de destination.`,
	'diddestination.destination' : `Utilisez ceci pour prendre des notes!`,
	'diddestination.id_ivr' : `Sélectionnez un IVR pour envoyer l'appel à.
	Le RIV doit appartenir au propriétaire de l'ASWELL.`,
	'diddestination.id_queue' : `Sélectionnez une file d'attente pour envoyer l'appel à.
	La file d'attente doit appartenir au propriétaire de l'ASWELL.`,
	'diddestination.id_sip' : `Sélectionnez un utilisateur SIP à envoyer l'appel à l'appel.
	L'utilisateur SIP doit appartenir au propriétaire de l'ASWELL.`,
	'diddestination.context' : ``,
	'diduse.id_did' : `Le nombre`,
	'diduse.month_payed' : `Le mois total payé à cela.`,
	'diduse.reservationdate' : `Jour que le fait a été réservé à l'utilisateur.`,
	'firewall.ip' : `Adresse IP.`,
	'firewall.action' : `Avec cette option marquée sur Oui, la propriété intellectuelle sera placée sur la liste de liste noire IP de Fail2Ban et sera bloquée pour toujours.
	|| L'option ne bloquera pas l'IP momentanément selon les paramètres du fichier /etc/fail2ba/jail.local.
	Par défaut, l'IP va rester bloquée pendant 10 minutes`,
	'firewall.description' : `Ces informations sont capturées à partir du fichier journal /var/log/fail2ban.log ||
	Il est possible de suivre ce journal avec la queue de commande -f /var/log/fail2ban.log`,
	'gauthenticator.username' : `L'utilisateur qui veut activer le jeton`,
	'gauthenticator.googleAuthenticator_enable' : ``,
	'gauthenticator.code' : `Le code sera nécessaire pour désactiver le jeton.
	Si vous n'avez plus que vous n'avez plus que le code, vous devrez désactiver la désactivation via la base de données.`,
	'gauthenticator.google_authenticator_key' : `Cette clé sera nécessaire pour activer le jeton dans un téléphone portable différent`,
	'groupmodule.id_group' : `Groupe d'utilisateurs`,
	'groupmodule.id_module' : `Menu`,
	'groupuser.name' : `Nom du groupe d'utilisateurs`,
	'groupuser.id_user_type' : `Type de groupe.`,
	'groupuser.hidden_prices' : `Caché tous les prix comme, acheter, vendre et profiter, aux utilisateurs qui utilisent ce groupe.`,
	'groupusergroup.name' : `Nom de groupe`,
	'groupusergroup.user_prefix' : `Remplir ce champ, tous les utilisateurs créés par un administrateur utilisant ce groupe seront initialisés avec ce préfixe.`,
	'groupusergroup.id_group' : `Quels groupes de clients le groupe administrateur aura-t-il accès? ||
	Lorsqu'un administrateur appartenant à ce groupe de connexion, seul l'administrateur verra les données client des groupes sélectionnés.`,
	'holidays.name' : `Nom de vacances`,
	'holidays.day' : `Jour de vacances`,
	'iax.id_user' : `L'utilisateur dont le compte IAX appartiendra`,
	'iax.username' : `L'utilisateur qui sera utilisé pour authentifier dans le logiciel`,
	'iax.secret' : `Le mot de passe qui sera utilisé pour authentifier dans le logiciel`,
	'iax.callerid' : `Il s'agit du callerid qui sera montré dans leur destination, dans les appels externes, le fournisseur devra permettre à CLI d'être correctement identifié dans leur destination.`,
	'iax.disallow' : `Dans cette option, il sera possible de désactiver les codecs.
	Pour désactiver tous les codecs et laisser disponibilité à l'utilisateur que ce que vous sélectionnez ci-dessous, utilisez "Utilisez tous"`,
	'iax.allow' : `Codecs qui seront acceptés.`,
	'iax.host' : `"Dynamic" est une option qui permettra à l'utilisateur d'enregistrer son compte dans n'importe quelle adresse IP.
	Si vous souhaitez authentifier l'utilisateur par leur IP, remplissez ici l'adresse IP du client, laissez le champ de mot de passe en blanc et à mettre «insécurité» pour le port / inviter dans l'onglet «Informations supplémentaires».`,
	'iax.nat' : `Le client est derrière Nat?
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-nat/.`,
	'iax.context' : `C'est le contexte que l'appel sera traité, par défaut est défini sur "facturation".
	Alliter uniquement si vous connaissez l'astérisque.`,
	'iax.qualify' : `Envoyé l'emballage "Option" pour vérifier si l'utilisateur est en ligne. || Sintax: Qualify = XXX |
	non |
	Oui où le XXX est le nombre de millisecondes utilisés.
	Si "oui", le temps configuré dans sIp.conf est utilisé, 2 secondes est la norme.Si vous activez "si vous activez" qualifier ", l'astérisque a envoyé la commande" option "à SIP peer régulary pour vérifier si l'appareil est toujours en ligne.
	Si le périphérique ne répond pas à "Option" dans la période définie, Asterisk envisagera que l'appareil hors ligne des appels futurs.Ce état peut être vérifié avec la fonction "SIP show peer xxxx", cette fonction ne fournira que des informations de statut.
	à la petite pair qui ont "qualifié = oui".`,
	'iax.dtmfmode' : `Type de DTMF.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
	'iax.insecure' : `Si l'hôte est défini sur "Dynamic", cette option devra être réglée sur "Non".
	Authentifier via IP et modifier le port.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-insecure/.`,
	'iax.type' : `Le type par défaut est "ami", en d'autres termes, ils peuvent apporter et recevoir des appels.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-type/.`,
	'iax.calllimit' : `Total des appels simultanés autorisés pour ce compte IAX.`,
	'ivr.name' : `Nom du IVR`,
	'ivr.id_user' : `Utilisateur qui possède le IVR`,
	'ivr.monFriStart' : `Intervalle hebdomadaire de la présence, peut être configuré avec des déplacements multiples. || Exemple: supposant que les heures de présence sont de 08h à 12h et de 14h à 19h.
	Dans ce cas, la règle serait 08: 00-12: 00 | 14h00-19h00`,
	'ivr.satStart' : `Intervalle de présence les samedis, peut être configuré avec plusieurs quarts de travail || Exemple: supposant que les heures de présence dans les samedis soient de 08h à 13h.
	Dans ce cas, la règle serait de 08h00 à 13h00: 00`,
	'ivr.sunStart' : `Intervalle de présence au dimanche, peut être configuré avec plusieurs quarts de travail || Exemple: supposant qu'il n'y ait aucune heure de présence au dimanche.
	Dans ce cas, la règle serait 00: 00-00: 00`,
	'ivr.use_holidays' : `Si cette option est activée, le système vérifiera s'il y a des vacances enregistrées pour la journée, le cas échéant, l'audio, ne fonctionne pas, sera joué.`,
	'ivr.workaudio' : `Audio à jouer dans les heures de présence.`,
	'ivr.noworkaudio' : `Audio à jouer quand ce n'est pas des heures de fréquentation`,
	'ivr.option_0' : `Sélectionnez la destination si l'option 0 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_1' : `Sélectionnez la destination si l'option 1 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_2' : `Sélectionnez la destination si l'option 2 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_3' : `Sélectionnez la destination si l'option 3 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_4' : `Sélectionnez la destination si l'option 4 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_5' : `Sélectionnez la destination si l'option 5 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_6' : `Sélectionnez la destination si l'option 6 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_7' : `Sélectionnez la destination si l'option 7 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_8' : `Sélectionnez la destination si l'option 8 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_9' : `Sélectionnez la destination si l'option est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_10' : `Sélectionnez la destination si aucune des options n'a été sélectionnée.`,
	'ivr.direct_extension' : `L'activation de cette option sera en mesure de saisir un utilisateur SIP pour l'appeler directement.`,
	'ivr.option_out_0' : `Sélectionnez la destinationIfl l'option 0 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_1' : `Sélectionnez la destination si l'option 1 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_2' : `Sélectionnez la destination si l'option 2 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_3' : `Sélectionnez la destination si l'option 3 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_4' : `Sélectionnez la destination si l'option 4 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_5' : `Sélectionnez la destination si l'option 5 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_6' : `Sélectionnez la destination si l'option 6 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_7' : `Sélectionnez la destination si l'option 7 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_8' : `Sélectionnez la destination si l'option 8 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_9' : `Sélectionnez la destination si l'option 9 est enfoncée.
	Laissez-le en blanc si vous ne voulez aucune action`,
	'ivr.option_out_10' : `Sélectionnez la destination si aucune des options n'a été sélectionnée.`,
	'logusers.id_user' : `Utilisateur qui a exécuté l'action.`,
	'logusers.id_log_actions' : `Type d'action.`,
	'logusers.ip' : `IP utilisée pour l'action.`,
	'logusers.description' : `Ce qui a été fait, est normalement dans Json.`,
	'methodpay.show_name' : `Le nom montré dans le panneau clientèle.`,
	'methodpay.id_user' : `La méthode de paiement de l'utilisateur.
	Vous pouvez créer des méthodes de paiement pour les administrateurs ou les revendeurs.`,
	'methodpay.country' : `Seulement pour référence.`,
	'methodpay.active' : `Activez ceci si vous souhaitez être disponible pour les clients.`,
	'methodpay.min' : `Valeur acceptée minimale.`,
	'methodpay.max' : `Valeur acceptée maximale.`,
	'methodpay.username' : `Méthode de paiement de l'utilisateur`,
	'methodpay.url' : `Méthode de paiement URL, dans la plupart des cas, les méthodes de cette URL sont déjà préconfigurées.`,
	'methodpay.fee' : `Frais de méthode de paiement.`,
	'methodpay.pagseguro_TOKEN' : `Jeton de la méthode de paiement`,
	'methodpay.P2P_CustomerSiteID' : `Ce champ est exclusif pour certaines méthodes de paiement.`,
	'methodpay.P2P_KeyID' : `Ce champ est exclusif pour certaines méthodes de paiement.`,
	'methodpay.P2P_Passphrase' : `Ce champ est exclusif pour certaines méthodes de paiement.`,
	'methodpay.P2P_RecipientKeyID' : `Ce champ est exclusif pour certaines méthodes de paiement.`,
	'methodpay.P2P_tax_amount' : `Ce champ est exclusif pour certaines méthodes de paiement.`,
	'methodpay.client_id' : `Ce champ est exclusif pour certaines méthodes de paiement.`,
	'methodpay.client_secret' : `Ce champ est exclusif pour certaines méthodes de paiement.`,
	'module.text' : `Nom du menu`,
	'module.icon_cls' : `Icône, police par défaut "génial v4".`,
	'module.id_module' : `Menu que ce menu appartient.
	Si le menu est vide, c'est un menu principal`,
	'module.priority' : `Commandez que le menu sera affiché dans le menu`,
	'offer.label' : `Nom du paquet gratuit`,
	'offer.packagetype' : `Type d'emballage, il y a 3 types.
	Appels illimités, appels gratuits ou secondes libres.`,
	'offer.freetimetocall' : `Dans ce champ est l'endroit où la configuration de la quantité disponible du paquet se produira. || Exemple: * Appels illimités: Dans cette option, le champ est vide, car il sera autorisé à appeler sans aucun contrôle. * Appels gratuits: Configurez le montant des appels gratuits qui
	Vous voulez donner. * Secondes libres: Configurez la quantité de secondes que vous souhaitez autoriser au client à appeler.`,
	'offer.billingtype' : `C'est la période que le paquet sera calculé. ||
	Regardez la description: * Mensuel: le système vérifiera le jour de l'activation du plan 30 jours que le client a atteint la limite de package. * Hebdomadaire: le système vérifiera le jour de l'activation du plan 7 jours que le client a atteint la limite de package.`,
	'offer.price' : `Prix qui sera chargé mensuellement au client. || Si au cours de la journée d'expiration, le client ne dispose pas de fonds suffisants pour payer le package Magnusbilling annulera automatiquement le package.
	Dans le menu Paramètres, des AJUSTS, existent une option nommée notification d'offre de package, cette valeur signifie combien de jours reste jusqu'à l'expiration de l'emballage, le système essaiera de charger l'abonnement, si le client n'a pas la balance, magnusbilling
	Enverrons un courrier électronique au client informant le manque de fonds. L'e-mail peut être modifié dans le menu, les modèles de messagerie, le type, le plan_unpaid, l'expiration de l'avis de plan mensuel soumis.Pour envoyer des courriels Il est nécessaire de configurer SMTP dans le menu SMTP.
	Pour apprendre à quel point les packages gratuits fonctionnent: https://wiki.magnusbilling.org/fr/source/offer.html.`,
	'offercdr.id_user' : `Utilisateur de l'appel.`,
	'offercdr.id_offer' : `Nom de l'offre.`,
	'offercdr.used_secondes' : `Durée d'appel.`,
	'offercdr.date_consumption' : `Date et heure de l'appel.`,
	'offeruse.id_user' : `Utilisateur qui a fait l'appel.`,
	'offeruse.id_offer' : `Nom de l'offre.`,
	'offeruse.month_payed' : `Mois payés.`,
	'offeruse.reservationdate' : `Date et heure que l'offre a été annulée.`,
	'phonebook.name' : `Nom du répertoire.`,
	'phonebook.status' : `État du répertoire.`,
	'phonebook.description' : `Description du répertoire, contrôle personnel uniquement.`,
	'phonenumber.id_phonebook' : `Répertoire que ce nombre appartient à.`,
	'phonenumber.number' : `Numéro à envoyer des appels / SMS.
	Toujours avoir besoin d'être utilisé dans le format E164.`,
	'phonenumber.name' : `Nom du propriétaire numérique, utilisé pour TTS ou SMS`,
	'phonenumber.city' : `City client, non requis sur le terrain.`,
	'phonenumber.status' : `MagnusBilling n'essaiera que d'envoyer lorsque l'état est actif || Lorsque l'appel est envoyé à votre fournisseur, le numéro reste avec l'état en attente.Si l'appel est terminé, le statut passe à envoyer. Il restera en attente de votre
	coffre a rejeté l'appel et s'est terminée pour une raison quelconque.Si est activé dans la campagne l'option "Numéros bloquantes", si le numéro est enregistré dans "Appels`,
	'phonenumber.info' : `Description du répertoire, contrôle personnel uniquement || Lorsqu'il est utilisé pour l'enquête, sera enregistré ici ce que le nombre saisi par le client.`,
	'phonenumber.doc' : ``,
	'phonenumber.email' : ``,
	'plan.name' : `Nom de plan`,
	'plan.signup' : `Faire une disponibilité de ce plan dans le formulaire d'inscription.
	Si seulement 1 plan, les clients qui s'inscrivent utiliseront ce plan, le cas échéant de 1 plan, le client sera capable de choisir.
	Il est nécessaire d'avoir au moins 1 plan avec cette option activée pour que les registres fonctionnent.`,
	'plan.ini_credit' : `Le montant du crédit que vous souhaitez donner aux clients qui enregistrés par l'inscription formulaire.`,
	'plan.play_audio' : `Exécuter des audios au client à partir de ce plan ou simplement envoyer l'erreur seulement?
	Par exemple, les audios qui n'y ont pas plus de crédit.`,
	'plan.techprefix' : `TechPrefix est comme un mot de passe au client, qui permet d'utiliser plus de plans.`,
	'plan.id_service' : `Sélectionnez ici les services qui seront disponibles pour les utilisateurs de ce plan.`,
	'prefix.prefix' : `Code préfixe.
	Le préfixe sera utilisé pour tarifer et facturer les appels.`,
	'prefix.destination' : `Nom de destination.`,
	'provider.provider_name' : `Nom du fournisseur`,
	'provider.credit' : `Le montant du crédit que vous avez sur votre fournisseur.
	Ce champ est facultatif.`,
	'provider.credit_control' : `Si vous avez défini sur Oui et que votre crédit de fournisseur est <0, tous les troncs de ce fournisseur seront désactivés.`,
	'provider.description' : `Description au calendrier, uniquement pour la maîtrise de soi.`,
	'queue.id_user' : `Utilisateur qui possède la file d'attente.`,
	'queue.name' : `Nom de la file d'attente.`,
	'queue.language' : `Langue de la file d'attente.`,
	'queue.strategy' : `Stratégie de la file d'attente.`,
	'queue.ringinuse' : `Appeler ou non les agents de la file d'attente qui sont en appel.`,
	'queue.timeout' : `Combien de temps le téléphone sonnera jusqu'à l'heure`,
	'queue.retry' : `La quantité de temps en secondes qui réessayeront l'appel.`,
	'queue.wrapuptime' : `Temps en quelques secondes jusqu'à ce que l'agent puisse recevoir un autre appel.`,
	'queue.weight' : `Priorité de la file d'attente.`,
	'queue.periodic-announce' : `Un ensemble d'annonces périodiques peut être créée en séparant chaque annonce pour reproduire les virgules WHIT.
	E.G.: Queue-périodique-annoncez, votre-appel-est-important, veuillez patienter.
	Ces données doivent être dans / var / lib / astérisque / sons / répertoires.`,
	'queue.periodic-announce-frequency' : `Combien de fois faire une annonce périodique.`,
	'queue.announce-position' : `Informe la position dans la file d'attente.`,
	'queue.announce-holdtime' : `Devrions-nous inclure une période de maintien estimée dans les annonces de poste?`,
	'queue.announce-frequency' : `Combien de fois annoncer la position de la file d'attente et / ou estimer HolleTime à l'appelant 0 = off`,
	'queue.joinempty' : `Autoriser les appels quand il n'y a personne pour répondre à l'appel.`,
	'queue.leavewhenempty' : `Accrochez les appels en file d'attente quand il n'y a personne à répondre.`,
	'queue.max_wait_time' : `Temps d'attente maximum sur la file d'attente`,
	'queue.max_wait_time_action' : ``,
	'queue.ring_or_moh' : `Jouez à attendre la musique ou le ton lorsque le client est dans la file d'attente.`,
	'queue.musiconhold' : `Importez une musique d'attente à cette file d'attente.`,
	'queuemember.queue_name' : `La file d'attente qui veut ajouter un utilisateur SIP.`,
	'queuemember.interface' : `SIP utilisateur d'ajouter comme un agent à la file d'attente.`,
	'queuemember.paused' : `Les agents en pause n'obtiendront pas aux appels, sont possibles de mettre en pause et d'attribuer la composition * 180 pour faire une pause, et * 181 à un décompte.`,
	'rate.id_plan' : `Le plan que vous souhaitez créer un tarif.`,
	'rate.id_prefix' : `Le préfixe que vous voulez créer un tarif.`,
	'rate.id_trunk_group' : `Le groupe de troncs qui seront utilisés pour envoyer cet appel.`,
	'rate.rateinitial' : `Le montant que vous souhaitez charger par minute.`,
	'rate.initblock' : `Temps minimum en quelques secondes à acheter.
	E.G., si défini sur 30 et la durée des appels est de 21 ans, sera facturé pour 30 ans.`,
	'rate.billingblock' : `Cela définit la manière dont le temps est incrémenté après le minimum.
	E.g, si défini sur 6s et la durée des appels est de 32 secondes, bêté pour 36.`,
	'rate.minimal_time_charge' : `Temps minimum pour tarif.
	S'il est défini sur 3, seuls les tarifs appellent que lorsque le temps est égal ou supérieur à 3 secondes.`,
	'rate.additional_grace' : ``,
	'rate.package_offer' : `Définissez sur Oui si vous souhaitez inclure ce tarif à une offre de paquet.`,
	'rate.status' : `Désactiver les tarifs, magnusbillants découvrira complètement ce tarif.
	Par conséquent, la suppression ou la désactivation aura l'effet SAM.`,
	'ratecallshop.dialprefix' : `Préfixe qui veut créer un tarif.
	Ce tarif sera exclusif à CallShop.`,
	'ratecallshop.destination' : `Préfixe Nom de destination.`,
	'ratecallshop.buyrate' : `Valeur chargée par minute dans l'appelcial.`,
	'ratecallshop.minimo' : `Temps minimum en secondes à tarif.
	Ex: Si cela est défini sur 30, tout CallL qui dure moins de 30 secondes sera facturé 30 secondes.`,
	'ratecallshop.block' : `Période de temps qui sera chargée après un minimum de temps.
	Ex: Si c'est défini sur 6, cela signifie que cela arrondira toujours jusqu'à 6 secondes, par conséquent, un appel qui a duré 32 secondes sera facturé 36 secondes.`,
	'ratecallshop.minimal_time_charge' : `Temps minimum pour Tarif.
	Ex: Si c'est défini sur 3, seuls les appels tarifaires ne durent que 3 secondes ou plus.`,
	'rateprovider.id_provider' : ``,
	'rateprovider.id_prefix' : `Préfixe.`,
	'rateprovider.buyrate' : `Montant payé par min au fournisseur.`,
	'rateprovider.buyrateinitblock' : `Temps minimum en secondes à tarif.
	Ex: Si cela est défini sur 30, tout CallL qui dure moins de 30 secondes sera facturé 30 secondes.`,
	'rateprovider.buyrateincrement' : `Période de temps qui sera chargée après un minimum de temps.
	Ex: Si c'est défini sur 6, cela signifie que cela arrondira toujours jusqu'à 6 secondes, par conséquent, un appel qui a duré 32 secondes sera facturé 36 secondes.`,
	'rateprovider.minimal_time_buy' : `Temps minimum pour Tarif.
	Ex: Si c'est défini sur 3, seuls les appels tarifaires ne durent que 3 secondes ou plus.`,
	'refill.id_user' : `Utilisateur qui sera réalisé le recharge.`,
	'refill.credit' : `Montant de recharge.
	Peut être une valeur positive ou négative, si la valeur est négative supprimera du montant total du crédit du client.`,
	'refill.description' : `Description au calendrier, uniquement pour la maîtrise de soi.`,
	'refill.payment' : `Ce paramètre n'est que de votre contrôle, le crédit sera libéré à l'utilisateur de toute façon sié au paiement`,
	'refill.invoice_number' : `Numéro de facture.`,
	'refillprovider.id_provider' : `Nom des fournisseurs.`,
	'refillprovider.credit' : `Valeur de remplissage.`,
	'refillprovider.description' : `Utilisé pour le contrôle interne.`,
	'refillprovider.payment' : `Cette option est de votre contrôle uniquement.
	Le crédit autorisé au client même s'il est défini sur "Non".`,
	'restrictedphonenumber.id_user' : `Utilisateur qui veut enregistrer le numéro.`,
	'restrictedphonenumber.number' : `Nombre.`,
	'restrictedphonenumber.direction' : `Les appels seront analysés en fonction des options sélectionnées.`,
	'sendcreditproducts.country' : `Pays`,
	'sendcreditproducts.operator_name' : `Nom de l'opérateur.`,
	'sendcreditproducts.operator_id' : `ID de l'opérateur.`,
	'sendcreditproducts.SkuCode' : `Skucode`,
	'sendcreditproducts.product' : `Produit`,
	'sendcreditproducts.send_value' : `Valorisation`,
	'sendcreditproducts.wholesale_price' : `Prix de vente.`,
	'sendcreditproducts.provider' : ``,
	'sendcreditproducts.status' : `Statut.`,
	'sendcreditproducts.info' : `Utilisé pour le contrôle interne.`,
	'sendcreditproducts.retail_price' : ``,
	'sendcreditproducts.method' : ``,
	'sendcreditrates.idProductcountry' : `Pays.`,
	'sendcreditrates.idProductoperator_name' : `Nom de l'opérateur.`,
	'sendcreditrates.sell_price' : `Prix de vente.`,
	'sendcreditsummary.id_user' : ``,
	'servers.name' : `Nom du serveur.`,
	'servers.host' : `IP du serveur.
	Cliquez ici pour en savoir plus sur les serveurs esclaves et proxy | https://magnussolution.com/br/servicos/auto-desempenho/servidor-slave.html.`,
	'servers.public_ip' : `IP publique.`,
	'servers.username' : `Utilisateur à se connecter au serveur.`,
	'servers.password' : `Mot de passe pour vous connecter au serveur.`,
	'servers.port' : `Port pour se connecter au serveur.`,
	'servers.sip_port' : `Port SIP que le serveur utilisera.`,
	'servers.type' : `Type de serveur.`,
	'servers.weight' : `Cette option consiste à équilibrer les appels en poids. || Exemple.
	Disons qu'il y a 1 serveur magnusbilling et 3 serveurs esclaves, et vous souhaitez envoyer le double des appels à chaque esclave, proporcionaly au serveur Mélusbilling.
	Ensuite, définissez simplement le serveur Mélusbilling sur Poids 1, et pour le poids des serveurs esclaves 2.`,
	'servers.status' : `Le proxy n'enverra que des appels aux serveurs actifs et avec du poids supérieur à 0.`,
	'servers.description' : `Utilisé pour le contrôle interne.`,
	'services.type' : `Type de service.`,
	'services.name' : `Nom du service.`,
	'services.calllimit' : `Limite d'appels simultanés ..`,
	'services.disk_space' : `Insérez l'espace disque total dans GB.`,
	'services.sipaccountlimit' : `Valeur maximale des utilisateurs de SIP que ce client peut créer.`,
	'services.price' : `Coût mensuel pour charger le client qui active ce service.`,
	'services.return_credit' : `Si ce service est annulé avant la date d'expiration, et si cette option est définie sur «Oui», vous sera remboursé la valeur proportionnelle des jours non utilisés au client.`,
	'services.description' : `Utilisé pour le contrôle interne.`,
	'servicesuse.id_user' : `Utilisateur qui possède le service.`,
	'servicesuse.id_services' : `Un service.`,
	'servicesuse.price' : `Prix de service.`,
	'servicesuse.method' : `Mode de paiement.`,
	'servicesuse.reservationdate' : `Activation du jour de service.`,
	'sip.id_user' : `Utilisateur que cet utilisateur SIP est associé à.`,
	'sip.defaultuser' : `Nom d'utilisateur utilisé pour se connecter dans un téléphone logiciel ou un périphérique SIP.`,
	'sip.secret' : `Mot de passe pour vous connecter dans un logiciel logiciel ou tout périphérique SIP.`,
	'sip.callerid' : `Le numéro d'identification de l'appelant qui sera affiché dans leur destination.
	Votre coffre a besoin d'accepter CLI.`,
	'sip.alias' : `Alias à composer entre les utilisateurs de SIP du même code de compte (société).`,
	'sip.disallow' : `Interdit à tous les codecs, puis sélectionnez les codecs disponibles ci-dessous pour les activer à l'utilisateur.`,
	'sip.allow' : `Sélectionnez les codecs que le coffre acceptera.`,
	'sip.host' : ``,
	'sip.sip_group' : `Lors de l'envoi d'un appel de Dad, ou de la campagne à un groupe, s'appellera tous les utilisateurs de SIP dans le groupe.
	Vous pouvez créer les groupes avec n'importe quel nom. || est également utilisé pour capturer les appels avec * 8, besoin de configurer l'option "pickupexten = * 8" dans le fichier "fonctionnalité".`,
	'sip.videosupport' : `Activer les appels vidéo.`,
	'sip.block_call_reg' : `Bloquer les appels à l'aide de Regex.
	Pour bloquer les appels des téléphones portables, mettez-le simplement ^ 55 \\ d \\ d9.
	Cliquez ici pour visiter le lien qui teste regex. | https://regex101.com.`,
	'sip.record_call' : `Enregistrer des appels de cet utilisateur SIP.`,
	'sip.techprefix' : `Option utile pour quand il est nécessaire d'authentifier plus d'un client via IP utilisant la même adresse IP.
	Commun dans BBX Multi locataire.`,
	'sip.nat' : `Nat.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-nat/`,
	'sip.directmedia' : `Si activé, l'astérisque tente de rediriger le flux de média RTP pour aller directement de l'appelant à la callee.`,
	'sip.qualify' : `Envoyé l'emballage "Option" pour vérifier si l'utilisateur est en ligne. || Sintax: Qualify = XXX |
	non |
	Oui où le XXX est le nombre de millisecondes utilisés.
	Si "oui", le temps configuré dans sip.conf est utilisé, 2 secondes est la norme.
	Si vous activez "Qualifier", l'astérisque a envoyé la commande "Option" à SIP Peer Régulaire pour vérifier si l'appareil est toujours en ligne.Si l'appareil ne répond pas à "Option" dans la période définie, l'astérisque considérera.
	L'appareil hors ligne pour les appels futurs.
	Ce statut peut être vérifié avec le Funcion "SIP show peer xxxx", ce funcion ne fournira que des informations de statut pour la peer SIP qui possèdent "qualifié = oui.`,
	'sip.context' : `C'est le contexte que l'appel sera traité, "facturation" est l'option standard.
	Ne modifiez que la configuration si vous connaissez l'astérisque.`,
	'sip.dtmfmode' : `Type DTMF.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-dtmfmode/.`,
	'sip.insecure' : `Cette option doit être "non" si l'hôte est dynamique, l'authentification IP modifie donc le port, inviter.`,
	'sip.deny' : `Vous pouvez limiter le trafic SIP d'une adresse IP ou d'un réseau déterminé.`,
	'sip.permit' : `Vous pouvez autoriser le trafic SIP d'une adresse IP ou d'un réseau déterminé.`,
	'sip.type' : `Le type standard est "ami", en d'autres termes, peut apporter et recevoir des appels.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-type/.`,
	'sip.allowtransfer' : `Activez ce compte VoIP de faire de la transférence.
	Le code à transférer est * 2 ramal.
	Il est nécessaire d'activer l'option AtXFER => * 2 dans le fichier "Caractéristiques.conf" d'astérisque.`,
	'sip.ringfalse' : `Activer la fausse bague.
	Ajoutez RR de la commande "Dial".`,
	'sip.calllimit' : `Appels simultanés maximum autorisés pour cet utilisateur SIP.`,
	'sip.mohsuggest' : `En attente de la musique pour cet utilisateur SIP.`,
	'sip.url_events' : `.`,
	'sip.addparameter' : `Les paramètres définis ici remplaceront les paramètres système par défaut, ainsi que des troncs, s'il y en a.`,
	'sip.amd' : `.`,
	'sip.type_forward' : `Renvoyer le type de destination.
	Ce renvoi ne fonctionnera pas dans les files d'attente.`,
	'sip.id_ivr' : `Sélectionnez le IVR que vous souhaitez envoyer aux appels si l'utilisateur SIP ne répond pas.`,
	'sip.id_queue' : `Sélectionnez la file d'attente que vous souhaitez envoyer aux appels si l'utilisateur SIP ne répond pas.`,
	'sip.id_sip' : `Sélectionnez les utilisateurs SIP que vous souhaitez envoyer aux appels si l'utilisateur SIP ne répond pas.`,
	'sip.extension' : `Cliquez pour plus de détails || Nous avons 3 options, conforme au type sélectionné, groupe, numéro ou personnalisé. * Groupe, le nom du groupe défini ici, doit être exatcly le même groupe d'utilisateurs de SIP qui souhaite recevoir les appels, se passe
	Pour appeler tous les utilisateurs de SIP dans le groupe. * Personnalisé, il est possible d'exécuter une option valide de la commande de cadran de Asterisk, exemple: SIP / CONTASIP, 45, TTR * Number, peut être un numéro de téléphone fixe ou un numéro de téléphone mobile,
	Dans le format 55 DDD`,
	'sip.dial_timeout' : `Délai d'attente en quelques secondes pour attendre que l'appel soit ramassé.
	Une fois que le délai d'attente sera exécuté la canalisation si elle est configurée.`,
	'sip.voicemail' : `Activer la messagerie vocale.
	Il est nécessaire que la configuration de SMTP sous Linux reçoive le courrier électronique avec le message.
	Cliquez ici pour savoir comment configurer SMTP. | https://www.magnusbilling.org/br/blog-br/9-novidades/25-configurar-ssmtp-para-enviar-voicemail-no -asterisk.html.`,
	'sip.voicemail_email' : `Email qui sera envoyé le courrier électronique avec la messagerie vocale.`,
	'sip.voicemail_password' : `Mot de passe de messagerie vocale.
	Il est possible d'entrer dans la messagerie vocale de frappe * 111`,
	'sip.sipshowpeer' : `SIP show peer`,
	'siptrace.head' : `Corps de message SIP.`,
	'sipuras.nserie' : `Numéro de série Linksys`,
	'sipuras.macadr' : `Adresse MAC Linksys`,
	'sipuras.senha_user' : `Nom d'utilisateur pour vous connecter à Linksys Paramètres`,
	'sipuras.senha_admin' : `Mot de passe pour vous connecter dans les paramètres Linksys`,
	'sipuras.antireset' : `Être prudent. * 73738`,
	'sipuras.Enable_Web_Server' : `Faire attention!
	Si désactivé, ne pourra pas être capable de vous connecter dans les paramètres Linksys.`,
	'sipuras.Proxy_1' : `Proxy 1.`,
	'sipuras.User_ID_1' : `Nom d'utilisateur de l'utilisateur SIP qui sera utilisé dans ATA Line 1.`,
	'sipuras.Password_1' : `Mot de passe utilisateur SIP`,
	'sipuras.Use_Pref_Codec_Only_1' : `Utilisez uniquement le codec préféré`,
	'sipuras.Preferred_Codec_1' : `Définir le codec préféré`,
	'sipuras.Register_Expires_1' : `Intervalle en secondes que Linksys enverra un registre à votre serveur.
	Utile pour éviter une perte de connexion lorsque vous recevez un appel.`,
	'sipuras.Dial_Plan_1' : `Lire la documentation Linksys`,
	'sipuras.NAT_Mapping_Enable_1_' : `Il est recommandé d'activer cette option si ATA est derrière NAT.`,
	'sipuras.NAT_Keep_Alive_Enable_1_' : `Il est recommandé d'activer cette option si ATA est derrière NAT.`,
	'sipuras.Proxy_2' : `Proxy 2.`,
	'sipuras.User_ID_2' : `Nom d'utilisateur de l'utilisateur SIP qui sera utilisé dans ATA Line 1.`,
	'sipuras.Password_2' : `Mot de passe de compte VoIP.`,
	'sipuras.Use_Pref_Codec_Only_2' : `Utilisez uniquement le codec préféré.`,
	'sipuras.Preferred_Codec_2' : `Paramètres du codec préféré.`,
	'sipuras.Register_Expires_2' : `Temps en secondes que Linksys envoie "registre" sur le serveur.
	Si cela va passer des appels dans cette ligne, il est préférable de la configurer entre 120 et 480 secondes.`,
	'sipuras.Dial_Plan_2' : `Lire la documentation Linksys`,
	'sipuras.NAT_Mapping_Enable_2_' : `Il est recommandé d'activer cette option si ATA est derrière NAT.`,
	'sipuras.NAT_Keep_Alive_Enable_2_' : `Il est recommandé d'activer cette option si ATA est derrière NAT.`,
	'sipuras.STUN_Enable' : `Activer Stud Server.`,
	'sipuras.STUN_Test_Enable' : `Valider périodiquement le serveur d'étourdissement ..`,
	'sipuras.Substitute_VIA_Addr' : `Remplacez Publia IP dans la via.`,
	'sipuras.STUN_Server' : `Domaine Stun Server.`,
	'sipuras.Dial_Tone' : ``,
	'sms.id_user' : `Utilisateur qui a envoyé / reçu le SMS.`,
	'sms.telephone' : `Numéro dans le format E164.`,
	'sms.sms' : `Texte SMS.`,
	'sms.sms_from' : `IF% 20Your% 20sms% 20SProvider% 20Accepts% 20Le% 20submission% 20core% 20fore% 20FROM,% 20t% 20Il% 20Hee.% 20His% 20HIS% 20Be% 20Replacé% 20Be% 20% 20% 20% de% 20% 20% 20%
	% 20Trunk% 20url.`,
	'smtps.host' : `Domaine SMST || Vous devez vérifier si le datacenter où le serveur sera hébergé, ne bloquez pas les ports utilisés par SMTP.`,
	'smtps.username' : `Nom d'utilisateur utilisé pour authentifier le serveur SMTP.`,
	'smtps.password' : `Mot de passe utilisé pour authentifier le serveur SMTP.`,
	'smtps.port' : `Port utilisé par le serveur SMTP.`,
	'smtps.encryption' : `Type de chiffrement.`,
	'templatemail.fromname' : `Ceci est le nom qui utilisera avec le nom de l'email.`,
	'templatemail.fromemail' : `Email utilisé dans TheMail, doit être le même email utilisé par l'utilisateur SMTP.`,
	'templatemail.subject' : `Sujet du courriel.`,
	'templatemail.status' : `Cette option vous permet de désactiver les envois exclusifs de cet email.`,
	'templatemail.messagehtml' : `Un message.
	Il est possible de variables, regardez l'onglet Variables pour voir la liste des variables disponibles.`,
	'trunk.id_provider' : `Fournisseur que appartient le coffre.`,
	'trunk.trunkcode' : `Le nom du coffre doit être unique.`,
	'trunk.user' : `Utilisé uniquement si l'authentification est via le nom d'utilisateur et le mot de passe.`,
	'trunk.secret' : `Utilisé uniquement si l'authentification est via le nom d'utilisateur et le mot de passe.`,
	'trunk.host' : `Domaine IP ou coffre.`,
	'trunk.trunkprefix' : `Ajouter un préfixe à envoyer à votre coffre.`,
	'trunk.removeprefix' : `Supprimez un préfixe pour envoyer à votre coffre.`,
	'trunk.allow' : `Sélectionnez les codecs autorisés dans ce coffre.`,
	'trunk.providertech' : `Vous avez besoin d'installer un lecteur approprié pour utiliser une carte comme DGV Extra Dongle.`,
	'trunk.status' : `Si le coffre est inactif, Magnusbilling a envoyé l'appel au coffre de sauvegarde.`,
	'trunk.allow_error' : `Si oui, tous les appels mais répondis et annuler seront envoyés à un coffre de sauvegarde.`,
	'trunk.register' : `Active uniquement si le coffre est authentifié via le nom d'utilisateur et le mot de passe.`,
	'trunk.register_string' : `<utilisateur>: <mot de passe> @ <hôte> / contact. || "utilisateur" est l'ID utilisateur de ce serveur SIP (EX 2345). "Mot de passe" est le mot de passe de l'utilisateur "hôte" est le domaine de serveur SIP ou le nom d'hôte
	. "Port" Envoyez une sollicitation du registre à ce port d'hôte.
	Standard pour 5060 "Contact" est l'extension du contact d'astérisque.
	L'exemple 1234 est défini dans l'en-tête de contact du message du registre SIP.
	La Ramal de contact est utilisée à distance par le serveur SIP lorsqu'il est nécessaire d'envoyer un appel à l'astérisque.`,
	'trunk.fromuser' : `Plusieurs fournisseurs exigent cette option d'authentification, principalement lorsqu'il est authentifié via l'utilisateur et le mot de passe.
	Laissez-le en blanc pour envoyer le callerid de l'utilisateur SIP de.`,
	'trunk.fromdomain' : `Définit le domaine du domaine: dans les messages SIP lorsque vous agissez comme un SIP UAC (client).`,
	'trunk.language' : `Langue par défaut utilisée dans n'importe quelle lecture () / arrière-plan ().`,
	'trunk.context' : `Ne changez que ceci si vous savez ce que vous faites.`,
	'trunk.dtmfmode' : `Type DMTF.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-dtmf/.`,
	'trunk.insecure' : `Précaire.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-insecure/.`,
	'trunk.maxuse' : `Appels simultanés maximum pour ce tronc.`,
	'trunk.nat' : `Est le coffre derrière Nat?
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-nat/.`,
	'trunk.directmedia' : `S'il est activé, l'astérisque tentera d'envoyer le support RTP directement entre votre client et votre fournisseur.
	Il est nécessaire d'activer le coffre aussi.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-canreinvite/.`,
	'trunk.qualify' : `Envoyé l'emballage "Option" pour vérifier si l'utilisateur est en ligne. || Sintax: Qualify = XXX |
	non |
	Oui où le XXX est le nombre de millisecondes utilisés.
	Si "oui", le temps configuré dans sip.conf est utilisé, 2 secondes est la norme.
	Si vous activez "Qualifier", l'astérisque a envoyé la commande "Option" à SIP Peer Régulaire pour vérifier si l'appareil est toujours en ligne.Si l'appareil ne répond pas à "Option" dans la période définie, l'astérisque considérera.
	L'appareil hors ligne pour les appels futurs.
	Ce statut peut être vérifié avec le Funcion "SIP show peer xxxx", ce funcion ne fournira que des informations de statut pour la peer SIP qui possèdent "qualifié = oui.`,
	'trunk.type' : `Le type par défaut est "ami", en d'autres termes, ils peuvent apporter et recevoir des appels.
	Cliquez ici pour plus d'informations | https://www.voip-info.org/asterisk-sip-type/.`,
	'trunk.disallow' : `Dans cette option, il est possible de désactiver les codecs.
	Utilisez "Utilisez tous" pour désactiver tous les codecs et la rendre disponible pour l'utilisateur que ce que vous avez sélectionné ci-dessous.`,
	'trunk.sendrpid' : `Définit si une tâche d'en-tête SIP à distance de l'ID à distance est envoyée. || La valeur par défaut est "Non".
	Ce champ est fréquemment utilisé par les fournisseurs de grossistes VoIP pour fournir l'identité des appelants, indépendamment des paramètres de confidentialité (à partir de l'en-tête SIP).`,
	'trunk.addparameter' : ``,
	'trunk.port' : `Si vous souhaitez utiliser un orifice différent de 5060, vous aurez besoin d'ouvrir le port IPTABLES.`,
	'trunk.link_sms' : ``,
	'trunk.sms_res' : `Laissez-le vide pour ne pas attendre la réponse du fournisseur.
	Ou écrivez le texte qui doit être consisté dans la réponse aux fournisseurs à considérer envoyé.`,
	'trunk.sip_config' : ``,
	'trunkgroup.name' : `Nom du groupe de coffre.`,
	'trunkgroup.type' : `Type. || C'est la façon dont le système trier le coffre appartient à un groupe. * Dans l'ordre.
	Le système enverra un appel aux coffres qui se trouvent dans l'ordre sélectionné * aléatoire.
	Le système triera les troncs de manière randomisée, à l'aide de la fonction RAND () de MySQL, peut donc répéter le coffre en séquence. * LCR.
	Sorth les troncs qui ont un coût inférieur.
	Si le propriétaire du coffre n'a pas de tarif, sera déconseillé et sera mis en fin de compte.
	Magnusbilling enverra les appels aux coffres qui appartiennent à ce groupe, jusqu'à ce que les appels soient en réponse, occupés ou annulés.MagnusBilling essaiera d'envoyer les appels au prochain réseau du groupe tant que le prochain groupe de coffre testé a répondu à Chanunavail ou en congestion.
	Ce sont les valeurs renvoyées par l'astérisque et il n'est pas possible de changer.`,
	'trunkgroup.id_trunk' : `Sélectionnez les troncs qui appartiennent à ce groupe.
	Si vous avez sélectionné le type, commandez, puis sélectionnez les troncs de la commande souhaitée.`,
	'trunksipcodes.ip' : ``,
	'trunksipcodes.code' : ``,
	'trunksipcodes.total' : ``,
	'user.username' : `Nom d'utilisateur utilisé pour se connecter au panneau.`,
	'user.password' : `Mot de passe utilisé pour se connecter dans le panneau.`,
	'user.id_group' : `Il y a 3 groupes: admin, agent et client.
	Vous pouvez créer plus ou modifier l'un de ces groupes.
	Chaque groupe peut avoir des autorisations spécifiques.
	Vérifiez le menu Configuration-> Groupe d'utilisateurs.`,
	'user.id_group_agent' : `Sélectionnez le groupe que les clients de ce détaillant utilisaient.`,
	'user.id_plan' : `Plan qui sera utilisé pour charger les clients.`,
	'user.language' : `Langue.
	Cette langue est utilisée pour une fonction système, mais pas pour la langue du panneau.`,
	'user.prefix_local' : `Règles de préfixes.
	Cliquez ici pour plus d'informations | https://www.magnusbilling.org/local_prefix`,
	'user.active' : `Seuls les utilisateurs actifs peuvent se connecter au panneau et faire des appels`,
	'user.country' : `Utilisé pour raclacer le CID.
	Le code de préfixe de pays sera ajouté avant que la CID convertit le CID en E164.`,
	'user.id_offer' : `Utilisé pour donner des minutes gratuites.
	Il est nécessaire d'informer les tarifs qui appartiendront aux forfaits gratuits.`,
	'user.cpslimit' : `CPS (appels par seconde) limite à ce client.
	Les appels dépassant cette limite seront envoyés de la congestion.`,
	'user.company_website' : `Site Web de la société. | Également utilisé dans la personnalisation du panneau d'agent.
	À l'agent, définissez le domaine sans http ou wwww.`,
	'user.company_name' : `Nom de la compagnie.
	Également utilisé à la personnalisation du panneau d'agent. | Si un agent sera utilisé sur le panneau de connexion.
	Besoin de définir le site Web de Compnay et utilisez le domaine de l'agent pour travailler la personnalisation.`,
	'user.commercial_name' : `Marque.`,
	'user.state_number' : `Numéro d'état.`,
	'user.lastname' : `Nom de famille.`,
	'user.firstname' : `Prénom.`,
	'user.city' : `Ville.`,
	'user.state' : `État.`,
	'user.address' : `Adresse.`,
	'user.neighborhood' : `Quartier.`,
	'user.zipcode' : `Code postal.`,
	'user.phone' : `Téléphone fixe.`,
	'user.mobile' : `Téléphone mobile.`,
	'user.email' : `Email, il est nécessaire d'envoyer des notifications système.`,
	'user.doc' : `Document client.`,
	'user.vat' : `Utilisé dans certaines méthodes de paiement.`,
	'user.typepaid' : `Les clients payés POS peuvent rester avec un équilibre négatif jusqu'à la limite de crédit informée sur le terrain ci-dessous.`,
	'user.creditlimit' : `Si l'utilisateur est post-payé, l'utilisateur pourra apporter des appels jusqu'à ce qu'il atteigne cette limite.`,
	'user.credit_notification' : `Si le crédit client est inférieur à cette valeur de champ, MagnusBilling enverra un courrier électronique au client AVERTISSEMENT AVERTISSEMENT SE QU'IL AVEC DES CRD CRÉDITS.
	Il est nécessaire d'avoir un serveur SMTP enregistré dans le menu Paramètres.`,
	'user.enableexpire' : `Activer expirer.
	Il est nécessaire d'informer la date d'expiration dans le champ «Date d'expiration».`,
	'user.expirationdate' : `La date à laquelle l'utilisateur ne pourra plus faire des appels.`,
	'user.calllimit' : `La quantité d'appels simultanés autorisés pour ce client.`,
	'user.calllimit_error' : `Avertissement d'être envoyé si la limite d'appel est dépassée.`,
	'user.mix_monitor_format' : `Format utilisé pour enregistrer des appels.`,
	'user.callshop' : `Activez le module CallShop.
	Seulement actif si vous allez vraiment l'utiliser.
	Il est nécessaire de donner la permission au groupe sélectionné.`,
	'user.disk_space' : `Insérez l'espace disque disponible pour enregistrer, en GB.
	Utilisez -1 pour l'enregistrer sans limite.
	Il est nécessaire d'ajouter dans le cron la commande PHP suivante /var/www/html/mbilling/cron.php userDiskspace.`,
	'user.sipaccountlimit' : `La quantité de comptes VoIP autorisée par cet utilisateur.
	Sera nécessaire donner la permission au groupe pour créer des comptes VoIP.`,
	'user.callingcard_pin' : `Utilisé pour authentifier la carte d'appel.`,
	'user.restriction' : `Utilisé pour limiter la composition.
	Ajoutez les numéros dans le menu: Utilisateurs-> Numéros restreints.`,
	'user.transfer_international_profit' : `Cette fonction n'est pas disponible au Brésil.
	Il n'est utilisé que pour les recharges mobiles dans certains pays.`,
	'user.transfer_flexiload_profit' : `Cette fonction n'est pas disponible au Brésil.
	Il n'est utilisé que pour les recharges mobiles dans certains pays.`,
	'user.transfer_bkash_profit' : `Cette fonction n'est pas disponible au Brésil.
	Il n'est utilisé que pour les recharges mobiles dans certains pays.`,
	'user.transfer_dbbl_rocket' : `Cette fonction n'est pas disponible au Brésil.
	Il n'est utilisé que pour les recharges mobiles dans certains pays.`,
	'user.transfer_dbbl_rocket_profit' : `Cette fonction n'est pas disponible au Brésil.
	Il n'est utilisé que pour les recharges mobiles dans certains pays.`,
	'user.transfer_show_selling_price' : `Cette fonction n'est pas disponible au Brésil.
	Il n'est utilisé que pour les recharges mobiles dans certains pays.`,
	'userrate.id_prefix' : `Sélectionnez le préfixe que vous souhaitez vous abonner.`,
	'userrate.rateinitial' : `Nouveau prix de vente pour ce préfixe.`,
	'userrate.initblock' : `Prix de vente minimum.`,
	'userrate.billingblock' : `Vendre bloc.`,
	'voucher.credit' : `Prix du voucher.
	Cliquez ici pour savoir pour configurer vos bons. | https://wiki.magnusbilling.org/en/source/how_to_use_voucher.html.`,
	'voucher.id_plan' : `Plan qui sera lié au client qui utilisera ce voucher.`,
	'voucher.language' : `Langue qui sera utilisée.`,
	'voucher.prefix_local' : `Règle qui sera utilisée dans le champ "Règle de préfixe"`,
	'voucher.quantity' : `La quantité de bons à générer.`,
	'voucher.tag' : `Description au calendrier, uniquement pour la maîtrise de soi.`,
	'voucher.voucher' : `Numéro de bon.,`,
});