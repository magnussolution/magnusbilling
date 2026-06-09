---
doc_id: MB-RAG-SOURCE-DATABASE-TABLE-INDEX
version: 1.0
language: en
tags: [source, database, tables, schema]
---

# Database Table Index

This index is generated from `script/database.sql` and model
`tableName()` mappings. It complements the curated top-30 operational
table dictionary by listing every current `pkg_*` table found in schema.

Current `pkg_*` table count: 93.

## Table Index

| Table | Domain | Model |
|---|---|---|
| pkg_alarm | other | Alarm |
| pkg_api | other | Api |
| pkg_balance | payments and credit | Balance |
| pkg_boleto | other |  |
| pkg_call_chart | calls and reports | CallOnlineChart |
| pkg_call_online | calls and reports | CallOnLine |
| pkg_callback | calls and reports | CallBack |
| pkg_callerid | calls and reports | Callerid |
| pkg_callshop | calls and reports | CallShopCdr |
| pkg_campaign | campaigns | Campaign |
| pkg_campaign_log | campaigns | CampaignLog |
| pkg_campaign_phonebook | campaigns | CampaignPhonebook |
| pkg_campaign_poll | campaigns | CampaignPoll |
| pkg_campaign_poll_info | campaigns | CampaignPollInfo |
| pkg_campaign_report | campaigns | CampaignReport |
| pkg_campaign_restrict_phone | campaigns | CampaignRestrictPhone |
| pkg_cdr | calls and reports | Call |
| pkg_cdr_archive | calls and reports | CallArchive |
| pkg_cdr_failed | calls and reports | CallFailed |
| pkg_cdr_summary_day | calls and reports | CallSummaryPerDay |
| pkg_cdr_summary_day_agent | calls and reports | CallSummaryDayAgent |
| pkg_cdr_summary_day_trunk | calls and reports | CallSummaryDayTrunk |
| pkg_cdr_summary_day_user | calls and reports | CallSummaryDayUser |
| pkg_cdr_summary_ids | calls and reports |  |
| pkg_cdr_summary_month | calls and reports | CallSummaryPerMonth |
| pkg_cdr_summary_month_did | calls and reports | CallSummaryMonthDid |
| pkg_cdr_summary_month_trunk | calls and reports | CallSummaryMonthTrunk |
| pkg_cdr_summary_month_user | calls and reports | CallSummaryMonthUser |
| pkg_cdr_summary_trunk | calls and reports | CallSummaryPerTrunk |
| pkg_cdr_summary_user | calls and reports | CallSummaryPerUser |
| pkg_configuration | other | Configuration |
| pkg_cryptocurrency | other | Cryptocurrency |
| pkg_did | inbound routing | Did |
| pkg_did_destination | inbound routing | Diddestination |
| pkg_did_history | inbound routing | DidHistory |
| pkg_did_use | inbound routing | DidUse |
| pkg_estados | other | Estados |
| pkg_firewall | operations and diagnostics | Firewall |
| pkg_group_module | users, permissions, and menus | GroupModule |
| pkg_group_user | users, permissions, and menus | GroupUser |
| pkg_group_user_group | users, permissions, and menus | GroupUserGroup |
| pkg_holidays | other | Holidays |
| pkg_iax | telephony endpoints and trunks | Iax |
| pkg_ivr | inbound routing | Ivr |
| pkg_log | operations and diagnostics | LogUsers |
| pkg_log_actions | operations and diagnostics | LogActions |
| pkg_method_pay | payments and credit | Methodpay |
| pkg_module | users, permissions, and menus | Module |
| pkg_module_extra | users, permissions, and menus |  |
| pkg_offer | plans, offers, and services | Offer |
| pkg_offer_cdr | plans, offers, and services | OfferCdr |
| pkg_offer_use | plans, offers, and services | OfferUse |
| pkg_phonebook | campaigns | PhoneBook |
| pkg_phonenumber | other | PhoneNumber |
| pkg_plan | plans, offers, and services | Plan |
| pkg_prefix | rates, routing, and providers | Prefix |
| pkg_prefix_length | rates, routing, and providers | PrefixLength |
| pkg_provider | rates, routing, and providers | Provider |
| pkg_provider_cnl | rates, routing, and providers | ProviderCNL |
| pkg_queue | inbound routing | Queue |
| pkg_queue_agent_status | inbound routing | QueueMemberDashBoard |
| pkg_queue_member | inbound routing | QueueMember |
| pkg_queue_status | inbound routing | QueueDashBoard |
| pkg_rate | rates, routing, and providers | Rate |
| pkg_rate_agent | rates, routing, and providers | RateAgent |
| pkg_rate_callshop | rates, routing, and providers | RateCallshop |
| pkg_rate_provider | rates, routing, and providers | RateProvider |
| pkg_refill | payments and credit | Refill |
| pkg_refill_icepay | payments and credit | RefillIcepay |
| pkg_refill_provider | payments and credit | Refillprovider |
| pkg_restrict_phone | other | RestrictedPhonenumber |
| pkg_send_credit | payments and credit |  |
| pkg_servers | operations and diagnostics | Servers |
| pkg_services | plans, offers, and services | Services |
| pkg_services_module | plans, offers, and services | ServicesModule |
| pkg_services_plan | plans, offers, and services | ServicesPlan |
| pkg_services_use | plans, offers, and services | ServicesUse |
| pkg_sip | telephony endpoints and trunks | Sip |
| pkg_sipura | telephony endpoints and trunks | Sipuras |
| pkg_sms | messaging | Sms |
| pkg_smtp | messaging | Smtps |
| pkg_status_system | operations and diagnostics | StatusSystem |
| pkg_templatemail | messaging | TemplateMail |
| pkg_trunk | telephony endpoints and trunks | Trunk |
| pkg_trunk_error | telephony endpoints and trunks | TrunkSipCodes |
| pkg_trunk_group | telephony endpoints and trunks | TrunkGroup |
| pkg_trunk_group_trunk | telephony endpoints and trunks | TrunkGroupTrunk |
| pkg_user | users, permissions, and menus | Signup |
| pkg_user_history | users, permissions, and menus | UserHistory |
| pkg_user_rate | users, permissions, and menus | UserRate |
| pkg_user_type | users, permissions, and menus | UserType |
| pkg_voicemail_users | other |  |
| pkg_voucher | payments and credit | Voucher |
