---
doc_id: MB-RAG-SOURCE-MODULE-CATALOG
version: 1.0
language: en
tags: [source, module, extjs, yii, catalog]
---

# Module Catalog

This catalog is generated from current code. Use it to map user-facing
panel modules to ExtJS forms, Yii controllers, ActiveRecord models,
database tables, and field-help descriptions.

## Reading Rule

- `Form.js` indicates a user-facing form module exists in the Classic ExtJS UI.
- `Controller.php` indicates a Yii web endpoint exists.
- `Model.php` indicates an ActiveRecord or related backend model exists.
- Table names are parsed from model `tableName()` methods when available.
- Field help comes from `resources/help/help_en.js` and should be checked
  before answering field-definition questions.

## Catalog

| Module | Form | Controller | Model | Table | Help Signal |
|---|---:|---:|---:|---|---|
| alarm | yes | yes | yes | pkg_alarm | Reference value used together with the condition to decide when the alarm must be sent. |
| api | yes | yes | yes | pkg_api | Actions that this API user is allowed to execute. |
| ata |  | yes |  |  |  |
| authentication |  | yes |  |  |  |
| backup | yes | yes |  |  |  |
| balance |  |  | yes | pkg_balance |  |
| buyCredit |  | yes | yes | pkg_method_pay |  |
| call | yes | yes | yes | pkg_cdr | Sell price, the value that was taken from the client. |
| call0800Web |  | yes |  |  |  |
| callApp |  | yes |  |  |  |
| callArchive | yes | yes | yes | pkg_cdr_archive | Buy cost. |
| callBack | yes | yes | yes | pkg_callback | Number of who called the DID requesting the CallBack |
| callerid | yes | yes | yes | pkg_callerid | Status of the CallerID. |
| callFailed | yes | yes | yes | pkg_cdr_failed |  |
| callOnLine | yes | yes | yes | pkg_call_online | The CallerID number. |
| callOnlineChart | yes | yes | yes | pkg_call_chart |  |
| callShop | yes | yes | yes | pkg_sip |  |
| callShopCdr | yes | yes | yes | pkg_callshop | User. |
| callSummaryCallShop | yes | yes | yes | pkg_callshop | Sum of the buy cost. |
| callSummaryDayAgent | yes | yes | yes | pkg_cdr_summary_day_agent | Sum of the buy cost. |
| callSummaryDayTrunk | yes | yes | yes | pkg_cdr_summary_day_trunk | Sum of the buy cost. |
| callSummaryDayUser | yes | yes | yes | pkg_cdr_summary_day_user | Sum of the earnings. |
| callSummaryMonthDid | yes | yes | yes | pkg_cdr_summary_month_did | Total number of calls received on this DID during the selected month. |
| callSummaryMonthTrunk | yes | yes | yes | pkg_cdr_summary_month_trunk | Sum of the buy cost. |
| callSummaryMonthUser | yes | yes | yes | pkg_cdr_summary_month_user | Sum of the earnings. |
| callSummaryPerDay | yes | yes | yes | pkg_cdr_summary_day | Sum of the buy cost. |
| callSummaryPerMonth | yes | yes | yes | pkg_cdr_summary_month | Sum of the buy cost. |
| callSummaryPerTrunk | yes | yes | yes | pkg_cdr_summary_trunk | Sum of the buy cost. |
| callSummaryPerUser | yes | yes | yes | pkg_cdr_summary_user | Sum of the earnings. |
| campaign | yes | yes | yes | pkg_campaign | Audio used by the massive calling campaign. |
| campaignDashboard | yes | yes |  |  | Name of the campaign. |
| campaignDashBoard |  | yes |  |  | Name of the campaign. |
| campaignLog | yes | yes | yes | pkg_campaign_log | Total of calls. |
| campaignPhonebook |  |  | yes | pkg_campaign_phonebook |  |
| campaignPoll | yes | yes | yes | pkg_campaign_poll | Audio file. |
| campaignPollInfo | yes | yes | yes | pkg_campaign_poll_info | Number of the person who voted. |
| campaignPollInfoChart |  | yes |  |  |  |
| campaignReport | yes | yes | yes | pkg_campaign_report | Campaign used to filter the report results. |
| campaignRestrictPhone | yes | yes | yes | pkg_campaign_restrict_phone | Optional note explaining why this number is restricted for the campaign. |
| clicToCall |  | yes |  |  |  |
| coinpayup |  | yes |  |  |  |
| configuration | yes | yes | yes | pkg_configuration | Description. |
| cryptocurrency |  |  | yes | pkg_cryptocurrency |  |
| did | yes | yes | yes | pkg_did | Only active numbers can receive calls. |
| diddestination | yes | yes | yes | pkg_did_destination | Only active destinations will be used. |
| didHistory | yes | yes | yes | pkg_did_history | Additional information recorded for this DID history entry. |
| didUse | yes | yes | yes | pkg_did_use | DID Number |
| didww |  | yes |  |  |  |
| efi |  | yes |  |  |  |
| estados |  |  | yes | pkg_estados |  |
| extra |  | yes |  |  |  |
| firewall | yes | yes | yes | pkg_firewall | With this option set to YES, the IP will be added to the fail2ban ip-blacklist and will remain blocked permanently. |
| gAuthenticator | yes | yes | yes | pkg_user | The code will be necessary to deactivate the TOKEN. |
| groupModule | yes | yes | yes | pkg_group_module | User group |
| groupUser | yes | yes | yes | pkg_group_user | Hide the bath update button in all menus to users that use this group. |
| groupUserGroup | yes | yes | yes | pkg_group_user_group | Which client groups will the administrator group have access. |
| holidays | yes | yes | yes | pkg_holidays | Day of holiday |
| iax | yes | yes | yes | pkg_iax | Codecs that will be accepted. |
| icepay |  | yes |  |  |  |
| ivr | yes | yes | yes | pkg_ivr | Activating this option will be able to type an SIP user to call it directly. |
| joomla |  | yes |  |  |  |
| logActions |  |  | yes | pkg_log_actions |  |
| logUsers | yes | yes | yes | pkg_log | What was done, normally is in JSON. |
| mBillingSoftphone |  | yes |  |  |  |
| mercadoPago |  | yes |  |  |  |
| methodpay |  | yes | yes | pkg_method_pay | Activate this if you want to be available for the clients. |
| methodPay | yes | yes | yes | pkg_method_pay | Activate this if you want to be available for the clients. |
| module | yes | yes | yes | pkg_module | Icon, default font "awesome V4". |
| moip |  | yes |  |  |  |
| molPay |  | yes |  |  |  |
| offer | yes | yes | yes | pkg_offer | This defines how the time is incremented after the minimum. |
| offerCdr | yes | yes | yes | pkg_offer_cdr | Date and hour of the call. |
| offerUse | yes | yes | yes | pkg_offer_use | Name of the offer. |
| pagHiper |  | yes |  |  |  |
| pagSeguro |  | yes |  |  |  |
| paypal |  | yes |  |  |  |
| phoneBook | yes | yes | yes | pkg_phonebook | Phonebook description, personal control only. |
| phoneNumber | yes | yes | yes | pkg_phonenumber | Client city, not required field. |
| placetoPay |  | yes |  |  |  |
| Plan | yes | yes | yes | pkg_plan | Select here the services that will be available to the users of this plan. |
| plan |  | yes | yes | pkg_plan | Select here the services that will be available to the users of this plan. |
| playAudio |  | yes |  |  |  |
| portability |  |  | yes | pkg_portabilidade |  |
| prefix | yes | yes | yes | pkg_prefix | Destination name. |
| prefixLength |  |  | yes | pkg_prefix_length |  |
| provider | yes | yes | yes | pkg_provider | The amount of credit you have in your provider's account. |
| providerCNL | yes | yes | yes | pkg_provider_cnl | CNL code used to identify the local area or tariff zone for Brazilian numbers. |
| queue | yes | yes | yes | pkg_queue | How often to announce queue position and/or estimated holdtime to caller 0=off |
| queueDashBoard |  | yes | yes | pkg_queue_status |  |
| queueMember | yes | yes | yes | pkg_queue_member | SIP user to add like a agent to the queue. |
| queueMemberDashBoard |  | yes | yes | pkg_queue_agent_status |  |
| rate | yes | yes | yes | pkg_rate | Aditional time to add to all call duration. |
| rateAgent |  |  | yes | pkg_rate_agent |  |
| rateCallshop | yes | yes | yes | pkg_rate_callshop | Time period that will be charged after minimun time. |
| rateProvider | yes | yes | yes | pkg_rate_provider | Paid amount per min to the provider. |
| refill | yes | yes | yes | pkg_refill | Refill amount. |
| refillChart |  | yes |  |  |  |
| refillIcepay |  |  | yes | pkg_refill_icepay |  |
| refillprovider | yes | yes | yes | pkg_refill_provider | Refill value. |
| restrictedPhonenumber | yes | yes | yes | pkg_restrict_phone | Calls ill be analysed according to the selected options. |
| servers | yes | yes | yes | pkg_servers | Used for internal control. |
| serversServers |  |  | yes | pkg_servers_servers |  |
| services | yes | yes | yes | pkg_services | Limit of simultaneos calls.. |
| servicesModule |  |  | yes | pkg_services_module |  |
| servicesPlan |  |  | yes | pkg_services_plan |  |
| servicesUse | yes | yes | yes | pkg_services_use | Minimum contract end date for this service subscription. |
| signup |  | yes | yes | pkg_user |  |
| sip | yes | yes | yes | pkg_sip | The parameters set in here will replace the system default parameters, as well of the trunks, if there's any. |
| sip2 | yes |  |  |  |  |
| sipTrace | yes | yes | yes | pkg_trace | SIP message body. |
| sipuras | yes | yes | yes | pkg_sipura | Be cautious.*73738# command prevents resetting LinkSys. |
| site |  | yes |  |  |  |
| sms | yes | yes | yes | pkg_sms | User that sent/received the SMS. |
| smsCallback |  | yes |  |  |  |
| smtps | yes | yes | yes | pkg_smtp | Encryption type. |
| statusSystem |  | yes | yes | pkg_status_system |  |
| tablesChanges |  |  | yes | pkg_tables_changes |  |
| templateMail | yes | yes | yes | pkg_templatemail | Email used in the frommail, must be the same email used by the SMTP user. |
| trunk | yes | yes | yes | pkg_trunk | These parameters will be added in the final AGI command - Dial command, where is in the ajust settings menu. |
| trunkGroup | yes | yes | yes | pkg_trunk_group | Select the trunks that belongs to this group. |
| trunkGroupTrunk |  |  | yes | pkg_trunk_group_trunk |  |
| trunkSipCodes | yes | yes | yes | pkg_trunk_error | SIP response code returned by the trunk, such as 403, 404, 486, or 503. |
| user | yes | yes | yes | pkg_user | Only active users can login into the panel and make calls |
| userHistory | yes | yes | yes | pkg_user_history | Date and time when this history record was created. |
| userRate | yes | yes | yes | pkg_user_rate | Sell block. |
| userType |  | yes | yes | pkg_user_type |  |
| voucher | yes | yes | yes | pkg_voucher | Voucher price. |
| wHMCS |  | yes | yes | pkg_user_whmcs |  |
