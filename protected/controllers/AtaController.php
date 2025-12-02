<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 *
 */
/**
 * Add in Linksys, menu Provisioning, option Profile Rule: http://your_magnusbilling_ip/mbilling/index.php/ata?mac=$MAC
 *
 *
 * to force update
 * http://linksys_ip/admin/resync?http://your_magnusbilling_ip/mbilling/index.php/ata?mac=$MAC
 *
 *
 */
class AtaController extends Controller
{

    public function actionIndex()
    {

        $config = LoadConfig::getConfig();
        $mac    = isset($_GET['mac']) ? $_GET['mac'] : null;
        $date   = date("Y-m-d H:i:s");
        $mac    = strtoupper(preg_replace("/:/", "", $mac));
        $mac    = substr($mac, 0);

        $proxy        = $this->config['global']['ip_servers'];
        $Profile_Rule = "http://" . $proxy . "/mbilling/index.php/ata?mac=$mac";
        $modelo       = explode(" ", $_SERVER["HTTP_USER_AGENT"]);

        $modelSipuras = Sipuras::model()->find('macadr = :mac', [':mac' => $mac]);

        if ( ! isset($modelSipuras->id)) {
            echo 'Ata no found';
            $info = 'Username or password is wrong - User ' . $mac . ' from IP - ' . $_SERVER['REMOTE_ADDR'];
            Yii::log($info, 'error');
            MagnusLog::insertLOG(1, $info);
            exit;
        }

        if ($modelSipuras->altera == 'si') {
            $modelSipuras->fultmov      = $date;
            $modelSipuras->fultlig      = $date;
            $modelSipuras->Profile_Rule = $Profile_Rule;
            $modelSipuras->last_ip      = $_SERVER["REMOTE_ADDR"];
            $modelSipuras->fultlig      = $date;
            $modelSipuras->obs          = $modelo[0];
            $modelSipuras->fultlig      = $date;

            //verfica se a senha da linha 1 foi alterada
            $modelSip = Sip::model()->find('name = :name', [':name' => $modelSipuras->User_ID_1]);

            if (isset($modelSip->id) && $modelSip->secret != $modelSipuras->Password_1) {
                $modelSipuras->Password_1 = $modelSip->secret;
                $modelSipuras->altera     = 'si';
                $modelSipuras->Password_1 = $modelSip->secret;
            }

            //verfica se a senha da linha 2 foi alterada
            $modelSip = Sip::model()->find("name = :name", [':name' => $modelSipuras->User_ID_2]);

            if (isset($modelSip->id) && $modelSip->secret != $modelSipuras->Password_2) {
                $modelSipuras->Password_2 = $modelSip->secret;
                $modelSipuras->altera     = 'si';
                $modelSipuras->Password_2 = $modelSip->secret;
            }

            // $modelSipuras->save();

            //marca como nao alterar mais
            $modelSipuras->altera = 'no';

            $modelSipuras->remote = true;
            $modelSipuras->save();

            Yii::log(print_r($modelSipuras->getAttributes(), true), 'error');

            $xml = '<?xml version="1.0" encoding="iso-8859-2"?>';
            $xml .= '<flat-profile>';

            //MENU System

            $xml .= '<Resync_Periodic ua="na">60</Resync_Periodic >';
            $xml .= '<Resync_Error_Retry_Delay ua="na">60</Resync_Error_Retry_Delay>';

            // *** System Configuration
            $xml .= '<Enable_Web_Server ua="na">' . $modelSipuras->Enable_Web_Server . '</Enable_Web_Server>'; //habilita web acesses
            $xml .= '<Web_Server_Port ua="na">' . $modelSipuras->Web_Server_Port . '</Web_Server_Port>'; // porta web acesses
            $xml .= '<Enable_Web_Admin_Access ua="na">' . $modelSipuras->Enable_Web_Server . '</Enable_Web_Admin_Access>';
            $xml .= '<Admin_Passwd ua="na">' . $modelSipuras->senha_admin . '</Admin_Passwd>';
            $xml .= '<User_Password ua="na">' . $modelSipuras->senha_user . '</User_Password>';

            # *** Internet Connection Type
            $xml .= '<DHCP ua="na">' . $modelSipuras->DHCP . '</DHCP>';
            $xml .= '<Static_IP ua="na">' . $modelSipuras->Static_IP . '</Static_IP>';
            $xml .= '<NetMask ua="na">' . $modelSipuras->NetMask . '</NetMask>';
            $xml .= '<Gateway ua="na">' . $modelSipuras->Gateway . '</Gateway>';

            # *** Optional Network Configuration
            //$xml .= '<HostName ua="na">' . $modelSipuras->HostName .'</HostName>';
            //$xml .= '<Domain ua="na">' . $modelSipuras->Domain .'</Domain>';
            $xml .= '<Primary_DNS ua="na">' . $modelSipuras->Primary_DNS . '</Primary_DNS>';
            $xml .= '<Secondary_DNS ua="na">' . $modelSipuras->Secondary_DNS . '</Secondary_DNS>';
            //$xml .= '<DNS_Server_Order ua="na">' . $modelSipuras->DNS_Server_Order .'</DNS_Server_Order>';
            //$xml .= '<DNS_Query_Mode ua="na">' . $modelSipuras->DNS_Query_Mode .'</DNS_Query_Mode>';
            $xml .= '<Syslog_Server ua="na">' . $modelSipuras->Syslog_Server . '</Syslog_Server>';
            $xml .= '<Debug_Server ua="na">' . $modelSipuras->Debug_Server . '</Debug_Server>';
            $xml .= '<Debug_Level ua="na">' . $modelSipuras->Debug_Level . '</Debug_Level>';
            //$xml .= '<Primary_NTP_Server ua="na">' . $modelSipuras->Primary_NTP_Server .'</Primary_NTP_Server>';
            //$xml .= '<Secondary_NTP_Server ua="na">' . $modelSipuras->Secondary_NTP_Server .'</Secondary_NTP_Server>';

            //MENU SIP
            $xml .= '<RTP_Port_Min  ua="na">' . $modelSipuras->RTP_Port_Min . '</RTP_Port_Min>';
            $xml .= '<RTP_Port_Max ua="na">' . $modelSipuras->RTP_Port_Max . '</RTP_Port_Max>';
            $xml .= '<RTP_Packet_Size ua="na">' . $modelSipuras->RTP_Packet_Size . '</RTP_Packet_Size>';
            $xml .= '<AVT_Dynamic_Payload ua="na">' . $modelSipuras->AVT_Dynamic_Payload . '</AVT_Dynamic_Payload>';
            //stun
            $xml .= '<Handle_VIA_received ua="na">' . $modelSipuras->Handle_VIA_received . '</Handle_VIA_received>';
            $xml .= '<Handle_VIA_rport ua="na">' . $modelSipuras->Handle_VIA_rport . '</Handle_VIA_rport>';
            $xml .= '<Insert_VIA_received ua="na">' . $modelSipuras->Insert_VIA_received . '</Insert_VIA_received>';
            $xml .= '<Insert_VIA_rport ua="na">' . $modelSipuras->Insert_VIA_rport . '</Insert_VIA_rport>';
            $xml .= '<Substitute_VIA_Addr ua="na">' . $modelSipuras->Substitute_VIA_Addr . '</Substitute_VIA_Addr>';
            $xml .= '<Send_Resp_To_Src_Port ua="na">' . $modelSipuras->Send_Resp_To_Src_Port . '</Send_Resp_To_Src_Port>';
            $xml .= '<STUN_Enable ua="na">' . $modelSipuras->STUN_Enable . '</STUN_Enable>';
            $xml .= '<STUN_Test_Enable ua="na">' . $modelSipuras->STUN_Test_Enable . '</STUN_Test_Enable>';
            $xml .= '<STUN_Server ua="na">' . $modelSipuras->STUN_Server . '</STUN_Server>';

            //MENU Provisioning
            # *** Configuration Profile
            $xml .= '<Provision_Enable ua="na">' . $modelSipuras->Provision_Enable . '</Provision_Enable>';
            //$xml .='<Resync_On_Reset ua="na">Yes</Resync_On_Reset>';
            //$xml .='<Resync_Random_Delay  ua="na">2</Resync_Random_Delay>';
            $xml .= '<Resync_Periodic ua="na">1800</Resync_Periodic >';
            $xml .= '<Resync_Error_Retry_Delay ua="na">1800</Resync_Error_Retry_Delay>';
            $xml .= '<Profile_Rule ua="na">' . $Profile_Rule . '</Profile_Rule>';
            //firewall update
            $xml .= '<Upgrade_Enable ua="na">' . $modelSipuras->Upgrade_Enable . '</Upgrade_Enable>';
            $xml .= '<Upgrade_Rule ua="na">' . $modelSipuras->Upgrade_Rule . '</Upgrade_Rule>';

            //MENU Regional
            $xml .= '<Dial_Tone ua="na">' . $modelSipuras->Dial_Tone . '</Dial_Tone>';
            $xml .= '<Busy_Tone ua="na">' . $modelSipuras->Busy_Tone . '</Busy_Tone>';
            $xml .= '<Reorder_Tone ua="na">' . $modelSipuras->Reorder_Tone . '</Reorder_Tone>';
            $xml .= '<Ring_Back_Tone ua="na">' . $modelSipuras->Ring_Back_Tone . '</Ring_Back_Tone>';
            $xml .= '<Hook_Flash_Timer_Min ua="na">' . $modelSipuras->Hook_Flash_Timer_Min . '</Hook_Flash_Timer_Min>';
            $xml .= '<Hook_Flash_Timer_Max ua="na">' . $modelSipuras->Hook_Flash_Timer_Max . '</Hook_Flash_Timer_Max>';
            $xml .= '<Caller_ID_Method ua="na">' . $modelSipuras->Caller_ID_Method . '</Caller_ID_Method>';
            $xml .= '<Time_Zone ua="na">' . $modelSipuras->Time_Zone . '</Time_Zone>';
            $xml .= '<FXS_Port_Input_Gain ua="na">' . $modelSipuras->FXS_Port_Input_Gain . '</FXS_Port_Input_Gain>';
            $xml .= '<FXS_Port_Output_Gain ua="na">' . $modelSipuras->FXS_Port_Output_Gain . '</FXS_Port_Output_Gain>';

            # *** LINE 1
            $xml .= '<SAS_Enable_1_ ua="na">' . $modelSipuras->SAS_Enable_1_ . '</SAS_Enable_1_>';
            $xml .= '<SAS_DLG_Refresh_Intvl_1_ ua="na">' . $modelSipuras->SAS_DLG_Refresh_Intvl_1_ . '</SAS_DLG_Refresh_Intvl_1_>';
            $xml .= '<Proxy_1_ ua="na">' . $modelSipuras->Proxy_1 . '</Proxy_1_>';
            //$xml .= '<SIP_Port_1_ ua="na">' . $modelSipuras->SIP_Port_1_ .'</SIP_Port_1_>';
            $xml .= '<NAT_Keep_Alive_Enable_1_ ua="na">' . $modelSipuras->NAT_Keep_Alive_Enable_1_ . '</NAT_Keep_Alive_Enable_1_>';
            $xml .= '<Use_Outbound_Proxy_1_ ua="na">' . $modelSipuras->Use_Outbound_Proxy_1 . '</Use_Outbound_Proxy_1_>';
            $xml .= '<Outbound_Proxy_1_ ua="na">' . $modelSipuras->Outbound_Proxy_1 . '</Outbound_Proxy_1_>';
            $xml .= '<Use_OB_Proxy_In_Dialog_1_ ua="na">' . $modelSipuras->Use_OB_Proxy_In_Dialog_1 . '</Use_OB_Proxy_In_Dialog_1_>';
            $xml .= '<Register_1_ ua="na">' . $modelSipuras->Register_1 . '</Register_1_>';
            $xml .= '<Make_Call_Without_Reg_1_ ua="na">' . $modelSipuras->Make_Call_Without_Reg_1 . '</Make_Call_Without_Reg_1_>';
            $xml .= '<Register_Expires_1_ ua="na">' . $modelSipuras->Register_Expires_1 . '</Register_Expires_1_>';
            $xml .= '<Ans_Call_Without_Reg_1_ ua="na">' . $modelSipuras->Ans_Call_Without_Reg_1 . '</Ans_Call_Without_Reg_1_>';
            $xml .= '<Use_DNS_SRV_1_ ua="na">' . $modelSipuras->Use_DNS_SRV_1 . '</Use_DNS_SRV_1_>';
            $xml .= '<DNS_SRV_Auto_Prefix_1_ ua="na">' . $modelSipuras->DNS_SRV_Auto_Prefix_1 . '</DNS_SRV_Auto_Prefix_1_>';
            $xml .= '<Proxy_Fallback_Intvl_1_ ua="na">' . $modelSipuras->Proxy_Fallback_Intvl_1 . '</Proxy_Fallback_Intvl_1_>';
            $xml .= '<Voice_Mail_Server_1_ ua="na">' . $modelSipuras->Voice_Mail_Server_1 . '</Voice_Mail_Server_1_>';
            $xml .= '<Display_Name_1_ ua="na">' . $modelSipuras->Display_Name_1 . '</Display_Name_1_>';
            $xml .= '<User_ID_1_ ua="na">' . $modelSipuras->User_ID_1 . '</User_ID_1_>';
            $xml .= '<Password_1_ ua="na">' . $modelSipuras->Password_1 . '</Password_1_>';
            $xml .= '<Use_Auth_ID_1_ ua="na">' . $modelSipuras->Use_Auth_ID_1 . '</Use_Auth_ID_1_>';
            $xml .= '<Auth_ID_1_ ua="na">' . $modelSipuras->Auth_ID_1 . '</Auth_ID_1_>';
            $xml .= '<Preferred_Codec_1_ ua="na">' . $modelSipuras->Preferred_Codec_1 . '</Preferred_Codec_1_>';
            $xml .= '<Silence_Supp_Enable_1_ ua="na">' . $modelSipuras->Silence_Supp_Enable_1_ . '</Silence_Supp_Enable_1_>';
            $xml .= '<Use_Pref_Codec_Only_1_ ua="na">' . $modelSipuras->Use_Pref_Codec_Only_1 . '</Use_Pref_Codec_Only_1_>';
            $xml .= '<DTMF_Tx_Method_1_ ua="na">' . $modelSipuras->DTMF_Tx_Method_1_ . '</DTMF_Tx_Method_1_>';
            $xml .= '<Dial_Plan_1_ ua="na">' . $modelSipuras->Dial_Plan_1 . '</Dial_Plan_1_>';
            $xml .= '<SAS_Enable_1_ ua="na">' . $modelSipuras->SAS_Enable_1_ . '</SAS_Enable_1_>';
            $xml .= '<Enable_IP_Dialing_1_ ua="na">' . $modelSipuras->Enable_IP_Dialing_1_ . '</Enable_IP_Dialing_1_>';
            $xml .= '<Idle_Conn_Polarity_1_ ua="na">' . $modelSipuras->Idle_Conn_Polarity_1 . '</Idle_Conn_Polarity_1_>';
            $xml .= '<Caller_Conn_Polarity_1_ ua="na">' . $modelSipuras->Caller_Conn_Polarity_1 . '</Caller_Conn_Polarity_1_>';
            $xml .= '<Callee_Conn_Polarity_1_ ua="na">' . $modelSipuras->Callee_Conn_Polarity_1 . '</Callee_Conn_Polarity_1_>';
            $xml .= '<NAT_Mapping_Enable_1_ ua="na">' . $modelSipuras->NAT_Mapping_Enable_1_ . '</NAT_Mapping_Enable_1_>';
            $xml .= '<NAT_Keep_Alive_Enable_1_ ua="na">' . $modelSipuras->NAT_Keep_Alive_Enable_1_ . '</NAT_Keep_Alive_Enable_1_>';
            $xml .= '<NAT_Keep_Alive_Dest_1_ ua="na">' . $modelSipuras->NAT_Keep_Alive_Dest_1_ . '</NAT_Keep_Alive_Dest_1_>';
            $xml .= '<SIP_TOS_DiffServ_Value_1_ ua="na">' . $modelSipuras->SIP_TOS_DiffServ_Value_1_ . '</SIP_TOS_DiffServ_Value_1_>';
            $xml .= '<RTP_TOS_DiffServ_Value_1_ ua="na">' . $modelSipuras->RTP_TOS_DiffServ_Value_1_ . '</RTP_TOS_DiffServ_Value_1_>';
            $xml .= '<Jitter_1_ ua="na">' . $modelSipuras->Jitter_1 . '</Jitter_1_>';
            $xml .= '<SIP_Debug_Option_1_ ua="na">' . $modelSipuras->SIP_Debug_Option_1_ . '</SIP_Debug_Option_1_>';
            $xml .= '<Blind_Attn_Xfer_Enable_1_ ua="na">' . $modelSipuras->Blind_Attn_Xfer_Enable_1_ . '</Blind_Attn_Xfer_Enable_1_>';
            $xml .= '<Xfer_When_Hangup_Conf_1_ ua="na">' . $modelSipuras->Xfer_When_Hangup_Conf_1_ . '</Xfer_When_Hangup_Conf_1_>';
            $xml .= '<Three_Way_Call_Serv_1_ ua="na">' . $modelSipuras->Three_Way_Call_Serv_1_ . '</Three_Way_Call_Serv_1_>';
            $xml .= '<Three_Way_Conf_Serv_1_ ua="na">' . $modelSipuras->Three_Way_Conf_Serv_1_ . '</Three_Way_Conf_Serv_1_>';
            $xml .= '<Attn_Transfer_Serv_1_ ua="na">' . $modelSipuras->Attn_Transfer_Serv_1_ . '</Attn_Transfer_Serv_1_>';
            $xml .= '<Unattn_Transfer_Serv_1_ ua="na">' . $modelSipuras->Unattn_Transfer_Serv_1_ . '</Unattn_Transfer_Serv_1_>';
            $xml .= '<Echo_Supp_Enable_1_ ua="na">' . $modelSipuras->Echo_Supp_Enable_1_ . '</Echo_Supp_Enable_1_>';

            //MENU USER1
            $xml .= '<Speed_Dial_2_1_ ua="na">' . $modelSipuras->Speed_Dial_2_1_ . '</Speed_Dial_2_1_>';
            $xml .= '<Speed_Dial_3_1_ ua="na">' . $modelSipuras->Speed_Dial_3_1_ . '</Speed_Dial_3_1_>';
            $xml .= '<Speed_Dial_4_1_ ua="na">' . $modelSipuras->Speed_Dial_4_1_ . '</Speed_Dial_4_1_>';
            $xml .= '<Speed_Dial_5_1_ ua="na">' . $modelSipuras->Speed_Dial_5_1_ . '</Speed_Dial_5_1_>';
            $xml .= '<Speed_Dial_6_1_ ua="na">' . $modelSipuras->Speed_Dial_6_1_ . '</Speed_Dial_6_1_>';
            $xml .= '<Speed_Dial_7_1_ ua="na">' . $modelSipuras->Speed_Dial_7_1_ . '</Speed_Dial_7_1_>';
            $xml .= '<Speed_Dial_8_1_ ua="na">' . $modelSipuras->Speed_Dial_8_1_ . '</Speed_Dial_8_1_>';
            $xml .= '<Speed_Dial_9_1_ ua="na">' . $modelSipuras->Speed_Dial_9_1_ . '</Speed_Dial_9_1_>';

            # *** LINE 2
            $xml .= '<SAS_Enable_2_ ua="na">' . $modelSipuras->SAS_Enable_2_ . '</SAS_Enable_2_>';
            $xml .= '<SAS_DLG_Refresh_Intvl_2_ ua="na">' . $modelSipuras->SAS_DLG_Refresh_Intvl_2_ . '</SAS_DLG_Refresh_Intvl_2_>';
            $xml .= '<Proxy_2_ ua="na">' . $modelSipuras->Proxy_2 . '</Proxy_2_>';
            //$xml .= '<SIP_Port_2_ ua="na">' . $modelSipuras->SIP_Port_2_ .'</SIP_Port_2_>';
            $xml .= '<NAT_Keep_Alive_Enable_2_ ua="na">' . $modelSipuras->NAT_Keep_Alive_Enable_2_ . '</NAT_Keep_Alive_Enable_2_>';
            $xml .= '<Use_Outbound_Proxy_2_ ua="na">' . $modelSipuras->Use_Outbound_Proxy_2 . '</Use_Outbound_Proxy_2_>';
            $xml .= '<Outbound_Proxy_2_ ua="na">' . $modelSipuras->Outbound_Proxy_2 . '</Outbound_Proxy_2_>';
            $xml .= '<Use_OB_Proxy_In_Dialog_2_ ua="na">' . $modelSipuras->Use_OB_Proxy_In_Dialog_2 . '</Use_OB_Proxy_In_Dialog_2_>';
            $xml .= '<Register_2_ ua="na">' . $modelSipuras->Register_2 . '</Register_2_>';
            $xml .= '<Make_Call_Without_Reg_2_ ua="na">' . $modelSipuras->Make_Call_Without_Reg_2 . '</Make_Call_Without_Reg_2_>';
            $xml .= '<Register_Expires_2_ ua="na">' . $modelSipuras->Register_Expires_2 . '</Register_Expires_2_>';
            $xml .= '<Ans_Call_Without_Reg_2_ ua="na">' . $modelSipuras->Ans_Call_Without_Reg_2 . '</Ans_Call_Without_Reg_2_>';
            $xml .= '<Use_DNS_SRV_2_ ua="na">' . $modelSipuras->Use_DNS_SRV_2 . '</Use_DNS_SRV_2_>';
            $xml .= '<DNS_SRV_Auto_Prefix_2_ ua="na">' . $modelSipuras->DNS_SRV_Auto_Prefix_2 . '</DNS_SRV_Auto_Prefix_2_>';
            $xml .= '<Proxy_Fallback_Intvl_2_ ua="na">' . $modelSipuras->Proxy_Fallback_Intvl_2 . '</Proxy_Fallback_Intvl_2_>';
            $xml .= '<Voice_Mail_Server_2_ ua="na">' . $modelSipuras->Voice_Mail_Server_2 . '</Voice_Mail_Server_2_>';
            $xml .= '<Display_Name_2_ ua="na">' . $modelSipuras->Display_Name_2 . '</Display_Name_2_>';
            $xml .= '<User_ID_2_ ua="na">' . $modelSipuras->User_ID_2 . '</User_ID_2_>';
            $xml .= '<Password_2_ ua="na">' . $modelSipuras->Password_2 . '</Password_2_>';
            $xml .= '<Use_Auth_ID_2_ ua="na">' . $modelSipuras->Use_Auth_ID_2 . '</Use_Auth_ID_2_>';
            $xml .= '<Auth_ID_2_ ua="na">' . $modelSipuras->Auth_ID_2 . '</Auth_ID_2_>';
            $xml .= '<Preferred_Codec_2_ ua="na">' . $modelSipuras->Preferred_Codec_2 . '</Preferred_Codec_2_>';
            $xml .= '<Silence_Supp_Enable_2_ ua="na">' . $modelSipuras->Silence_Supp_Enable_2_ . '</Silence_Supp_Enable_2_>';
            $xml .= '<Use_Pref_Codec_Only_2_ ua="na">' . $modelSipuras->Use_Pref_Codec_Only_2 . '</Use_Pref_Codec_Only_2_>';
            $xml .= '<DTMF_Tx_Method_2_ ua="na">' . $modelSipuras->DTMF_Tx_Method_2_ . '</DTMF_Tx_Method_2_>';
            $xml .= '<Dial_Plan_2_ ua="na">' . $modelSipuras->Dial_Plan_2 . '</Dial_Plan_2_>';
            $xml .= '<SAS_Enable_2_ ua="na">' . $modelSipuras->SAS_Enable_2_ . '</SAS_Enable_2_>';
            $xml .= '<Enable_IP_Dialing_2_ ua="na">' . $modelSipuras->Enable_IP_Dialing_2_ . '</Enable_IP_Dialing_2_>';
            $xml .= '<Idle_Conn_Polarity_2_ ua="na">' . $modelSipuras->Idle_Conn_Polarity_2 . '</Idle_Conn_Polarity_2_>';
            $xml .= '<Caller_Conn_Polarity_2_ ua="na">' . $modelSipuras->Caller_Conn_Polarity_2 . '</Caller_Conn_Polarity_2_>';
            $xml .= '<Callee_Conn_Polarity_2_ ua="na">' . $modelSipuras->Callee_Conn_Polarity_2 . '</Callee_Conn_Polarity_2_>';
            $xml .= '<NAT_Mapping_Enable_2_ ua="na">' . $modelSipuras->NAT_Mapping_Enable_2_ . '</NAT_Mapping_Enable_2_>';
            $xml .= '<NAT_Keep_Alive_Enable_2_ ua="na">' . $modelSipuras->NAT_Keep_Alive_Enable_2_ . '</NAT_Keep_Alive_Enable_2_>';
            $xml .= '<NAT_Keep_Alive_Dest_2_ ua="na">' . $modelSipuras->NAT_Keep_Alive_Dest_2_ . '</NAT_Keep_Alive_Dest_2_>';
            $xml .= '<SIP_TOS_DiffServ_Value_2_ ua="na">' . $modelSipuras->SIP_TOS_DiffServ_Value_2_ . '</SIP_TOS_DiffServ_Value_2_>';
            $xml .= '<RTP_TOS_DiffServ_Value_2_ ua="na">' . $modelSipuras->RTP_TOS_DiffServ_Value_2_ . '</RTP_TOS_DiffServ_Value_2_>';
            $xml .= '<Jitter_2_ ua="na">' . $modelSipuras->Jitter_2 . '</Jitter_2_>';
            $xml .= '<SIP_Debug_Option_2_ ua="na">' . $modelSipuras->SIP_Debug_Option_2_ . '</SIP_Debug_Option_2_>';
            $xml .= '<Blind_Attn_Xfer_Enable_2_ ua="na">' . $modelSipuras->Blind_Attn_Xfer_Enable_2_ . '</Blind_Attn_Xfer_Enable_2_>';
            $xml .= '<Xfer_When_Hangup_Conf_2_ ua="na">' . $modelSipuras->Xfer_When_Hangup_Conf_2_ . '</Xfer_When_Hangup_Conf_2_>';
            $xml .= '<Three_Way_Call_Serv_2_ ua="na">' . $modelSipuras->Three_Way_Call_Serv_2_ . '</Three_Way_Call_Serv_2_>';
            $xml .= '<Three_Way_Conf_Serv_2_ ua="na">' . $modelSipuras->Three_Way_Conf_Serv_2_ . '</Three_Way_Conf_Serv_2_>';
            $xml .= '<Attn_Transfer_Serv_2_ ua="na">' . $modelSipuras->Attn_Transfer_Serv_2_ . '</Attn_Transfer_Serv_2_>';
            $xml .= '<Unattn_Transfer_Serv_2_ ua="na">' . $modelSipuras->Unattn_Transfer_Serv_2_ . '</Unattn_Transfer_Serv_2_>';
            $xml .= '<Echo_Supp_Enable_2_ ua="na">' . $modelSipuras->Echo_Supp_Enable_2_ . '</Echo_Supp_Enable_2_>';

            //MENU USER2
            $xml .= '<Speed_Dial_2_2_ ua="na">' . $modelSipuras->Speed_Dial_2_2_ . '</Speed_Dial_2_2_>';
            $xml .= '<Speed_Dial_3_2_ ua="na">' . $modelSipuras->Speed_Dial_3_2_ . '</Speed_Dial_3_2_>';
            $xml .= '<Speed_Dial_4_2_ ua="na">' . $modelSipuras->Speed_Dial_4_2_ . '</Speed_Dial_4_2_>';
            $xml .= '<Speed_Dial_5_2_ ua="na">' . $modelSipuras->Speed_Dial_5_2_ . '</Speed_Dial_5_2_>';
            $xml .= '<Speed_Dial_6_2_ ua="na">' . $modelSipuras->Speed_Dial_6_2_ . '</Speed_Dial_6_2_>';
            $xml .= '<Speed_Dial_7_2_ ua="na">' . $modelSipuras->Speed_Dial_7_2_ . '</Speed_Dial_7_2_>';
            $xml .= '<Speed_Dial_8_2_ ua="na">' . $modelSipuras->Speed_Dial_8_2_ . '</Speed_Dial_8_2_>';
            $xml .= '<Speed_Dial_9_2_ ua="na">' . $modelSipuras->Speed_Dial_9_2_ . '</Speed_Dial_9_2_>';

            //ANTIRESET
            if ($modelSipuras->antireset == '1') {
                $xml .= '<Protect_IVR_FactoryReset ua="na">Yes</Protect_IVR_FactoryReset>';
            } else {
                $xml .= '<Protect_IVR_FactoryReset ua="na">No</Protect_IVR_FactoryReset>';
            }

            $xml .= '<Admin_Passwd ua="na">' . $modelSipuras->senha_admin . '</Admin_Passwd>';

            $xml .= '</flat-profile>';

            echo $xml;
        }
    }
}
