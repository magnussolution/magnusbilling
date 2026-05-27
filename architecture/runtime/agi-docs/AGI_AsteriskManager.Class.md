# AGI_AsteriskManager.Class

phpagi-asmanager.php : PHP Asterisk Manager functions Website: http://phpagi.sourceforge.net Copyright (c) 2004 - 2010 Matthew Asham <matthew@ochrelabs.com>, David Eder <david@eder.us> Copyright (c) 2005 - 2015 Schmooze Com, Inc All Rights Reserved. This software is released under the terms of the GNU Public License v2 A copy of which is available from http://www.fsf.org/licenses/gpl.txt @package phpAGI

## Methods

### __construct($config = [])

Constructor  @param string $config is an array of configuration vars and vals, stuffed into $this->config /

### send_request($action, $parameters = [], $retry = true)

Send a request  @param string $action @param array $parameters @return array of parameters /

### wait_response($allow_timeout = false)

Wait for a response  If a request was just sent, this will return the response. Otherwise, it will loop forever, handling events.  @param boolean $allow_timeout if the socket times out, return an empty array @return array of parameters, empty on timeout /

### connect($server = null, $username = null, $secret = null, $events = 'on')

Connect to Asterisk  @example examples/sip_show_peer.php Get information about a sip peer  @param string $server @param string $username @param string $secret @return boolean true on success /

### disconnect()

Disconnect  /

### connected()

Check if the socket is connected  /

### AbsoluteTimeout($channel, $timeout)

Set Absolute Timeout  Hangup a channel after a certain time. Acknowledges set time with Timeout Set message.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_AbsoluteTimeout @version 11 @param string $channel @param integer $timeout /

### CoreSettings()

Show PBX core settings (version etc).  Query for Core PBX settings.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_CoreSettings /

### AgentLogoff($agent, $soft = 'false')

Sets an agent as no longer logged in.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_AgentLogoff @version 11 @param string $agent Agent ID of the agent to log off. @param string $soft  Set to true to not hangup existing calls. /

### Agents()

Lists agents and their status.  Will list info about all possible agents.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Agents @version 11 /

### AGI($channel, $command, $commandid)

Add an AGI command to execute by Async AGI.  Add an AGI command to the execute queue of the channel in Async AGI.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_AGI @param string $channel Channel that is currently in Async AGI. @param string $command Application to execute. @param string $commandid This will be sent back in CommandID header of AsyncAGI exec event notification. /

### UserEvent($event, $headers = [])

Send an arbitrary event.  Send an event to manager sessions.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_UserEvent @param string $channel @param string $file /

### ChangeMonitor($channel, $file)

Change monitoring filename of a channel  This action may be used to change the file started by a previous 'Monitor' action.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ChangeMonitor @param string $channel Used to specify the channel to record. @param string $file Is the new name of the file created in the monitor spool directory. /

### Command($command, $actionid = null)

Execute Asterisk CLI Command  Run a CLI command  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Command @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Command+Line+Interface @param string $command Asterisk CLI command to run @param string $actionid message matching variable /

### VoicemailRefresh($context = null, $mailbox = null, $actionid = null)

Tell Asterisk to poll mailboxes for a change  Normally, MWI indicators are only sent when Asterisk itself changes a mailbox. With external programs that modify the content of a mailbox from outside the application, an option exists called pollmailboxes that will cause voicemail to continually scan all mailboxes on a system for changes. This can cause a large amount of load on a system. This command allows external applications to signal when a particular mailbox has changed, thus permitting external applications to modify mailboxes and MWI to work without introducing considerable CPU load.  If Context is not specified, all mailboxes on the system will be polled for changes. If Context is specified, but Mailbox is omitted, then all mailboxes within Context will be polled. Otherwise, only a single mailbox will be polled for changes.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+12+ManagerAction_VoicemailRefresh @param string $context @param string $mailbox @param string $actionid ActionID for this transaction. Will be returned. /

### Codecs($type = 'audio')

Get and parse codecs @param {string} $type='audio' Type of codec to look up /

### ConfbridgeKick($conference, $channel)

Kick a Confbridge user.  Kick a Confbridge user.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeKick @param string $conference Conference number. @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used. /

### ConfbridgeList($conference)

List Users in a Conference  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeList @param string $conference Conference number. /

### ConfbridgeListRooms()

List active conferences.  Lists data about all active conferences. ConfbridgeListRooms will follow as separate events, followed by a final event called ConfbridgeListRoomsComplete.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeListRooms /

### ConfbridgeLock($conference)

Lock a Confbridge conference.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeLock @param string $conference Conference number. /

### ConfbridgeMute($conference, $channel)

Mute a Confbridge user.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeMute @param string $conference Conference number. @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used. /

### ConfbridgeSetSingleVideoSrc($conference, $channel)

Set a conference user as the single video source distributed to all other participants.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeSetSingleVideoSrc @param string $conference Conference number. @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used. /

### ConfbridgeStartRecord($conference, $recordFile)

Start recording a Confbridge conference.  Start recording a conference. If recording is already present an error will be returned. If RecordFile is not provided, the default record file specified in the conference's bridge profile will be used, if that is not present either a file will automatically be generated in the monitor directory.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeMute @param string $conference Conference number. @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used. /

### ConfbridgeStopRecord($conference)

Stop recording a Confbridge conference.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeStopRecord @param string $conference Conference number. /

### ConfbridgeUnlock($conference)

Unlock a Confbridge conference.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeUnlock @param string $conference Conference number. /

### ConfbridgeUnmute($conference, $channel)

Unmute a Confbridge user.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeUnmute @param string $conference Conference number. /

### Events($eventmask)

Enable/Disable sending of events to this manager  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Events @param string $eventmask is either 'on', 'off', or 'system,call,log' /

### ExtensionState($exten, $context, $actionid = null)

Check Extension Status  Report the extension state for given extension. If the extension has a hint, will use devicestate to check the status of the device connected to the extension. Will return an Extension Status message. The response will include the hint for the extension and the status.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ExtensionState @param string $exten Extension to check state on @param string $context Context for extension @param string $actionid message matching variable /

### GetVar($channel, $variable, $actionid = null)

Gets a Channel Variable  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Getvar @param string $channel  Channel to read variable from @param string $variable Variable name, function or expression @param string $actionid message matching variable /

### Hangup($channel)

Hangup Channel  @link https://wiki.asterisk.org/wiki/display/AST/ManagerAction_Hangup @param string $channel The channel name to be hungup /

### IAXPeers()

List IAX Peers  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_IAXpeers /

### PresenceState($provider)

Check Presence State  Report the presence state for the given presence provider. Will return a Presence State message. The response will include the presence state and, if set, a presence subtype and custom message.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+ManagerAction_PresenceState @param string $provider Presence Provider to check the state of /

### ListCommands($actionid = null)

List available manager commands  Returns the action name and synopsis for every action that is available to the user.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ListCommands @param string $actionid message matching variable /

### Logoff()

Logoff Manager  Logoff the current manager session.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Logoff /

### MailboxCount($mailbox, $actionid = null)

Check Mailbox Message Count  Returns number of new and old messages. Message: Mailbox Message Count Mailbox: <mailboxid> NewMessages: <count> OldMessages: <count>  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MailboxStatus @param string $mailbox Full mailbox ID <mailbox>@<vm-context> /

### MailboxStatus($mailbox, $actionid = null)

Check Mailbox  Returns number of messages. Message: Mailbox Status Mailbox: <mailboxid> Waiting: <count>  @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+MailboxStatus @param string $mailbox Full mailbox ID <mailbox>@<vm-context> @param string $actionid message matching variable /

### MessageSend($to, $from, $body, $variable = null)

MessageSend  Send an SMS message  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MessageSend @param string $to @param string $from @param string $body @param string $variable optional @return array result of send_request /

### MeetmeList($conference)

List participants in a conference.  Lists all users in a particular MeetMe conference. MeetmeList will follow as separate events, followed by a final event called MeetmeListComplete.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MeetmeList @param string $conference Conference number. /

### MeetmeListRooms()

List active conferences.  Lists data about all active conferences. MeetmeListRooms will follow as separate events, followed by a final event called MeetmeListRoomsComplete.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeListRooms /

### MeetmeMute($meetme, $usernum)

Mute a Meetme user.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MeetmeUnmute @param string $meetme Conference number. @param string $usernum User Number /

### MeetmeUnmute($meetme, $usernum)

Unmute a Meetme user.  Unmute a Meetme user.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MeetmeUnmute @param string $meetme Conference number. @param string $usernum User Number /

### Monitor($channel, $file = null, $format = null, $mix = null)

Monitor a channel  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Monitor @param string $channel @param string $file @param string $format @param boolean $mix /

### Originate()

Originate Call  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Originate @param string $channel @param string $exten @param string $context @param string $priority @param integer $timeout @param string $callerid @param string $variable (Supports an array of values) @param string $account @param string $application @param string $data == exactly 11 values required ==  -- OR --  @pram array a key => value array of what ever you want to pass in /

### ParkedCalls($actionid = null)

List parked calls  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ParkedCalls /

### Ping()

Ping  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Ping /

### QueueAdd($queue, $interface, $penalty = 0)

Queue Add  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_QueueAdd @param string $queue @param string $interface @param integer $penalty /

### QueueRemove($queue, $interface)

Queue Remove  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_QueueRemove @param string $queue @param string $interface /

### Queues()

Queues  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Queues /

### QueueStatus($actionid = null)

Queue Status  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_QueueStatus @param string $actionid message matching variable /

### Redirect($channel, $extrachannel, $exten, $context, $priority)

Redirect  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Redirect @param string $channel @param string $extrachannel @param string $exten @param string $context @param string $priority /

### SetCDRUserField($userfield, $channel, $append = null)

Set the CDR UserField  @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+SetCDRUserField @param string $userfield @param string $channel @param string $append /

### SetVar($channel, $variable, $value)

Set Channel Variable  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Setvar @param string $channel Channel to set variable for @param string $variable name @param string $value /

### SIPpeers()

List SIP Peers /

### Status($channel, $actionid = null)

Channel Status  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Status @param string $channel @param string $actionid message matching variable /

### StopMonitor($channel)

Stop monitoring a channel  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_StopMonitor @param string $channel /

### ZapDialOffhook($zapchannel = '', $number = '')

Dial over Zap channel while offhook  @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapDialOffhook @param string $zapchannel @param string $number /

### ZapDNDoff($zapchannel = '')

Toggle Zap channel Do Not Disturb status OFF @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapDNDoff @param string $zapchannel /

### ZapDNDon($zapchannel = '')

Toggle Zap channel Do Not Disturb status ON  @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapDNDon @param string $zapchannel /

### ZapHangup($zapchannel = '')

Hangup Zap Channel  @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapHangup @param string $zapchannel /

### ZapTransfer($zapchannel = '')

Transfer Zap Channel  @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapTransfer @param string $zapchannel /

### ZapShowChannels($actionid = null)

Zap Show Channels  @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapShowChannels @param string $actionid message matching variable /

### log($message, $level = 1)

Log a message  @param string $message @param integer $level from 1 to 4 /

### add_event_handler($event, $callback)

Add event handler  Known Events include ( https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events ) Link - Fired when two voice channels are linked together and voice data exchange commences. Unlink - Fired when a link between two voice channels is discontinued, for example, just before call completion. Newexten - Hangup - Newchannel - Newstate - Reload - Fired when the "RELOAD" console command is executed. Shutdown - ExtensionStatus - Rename - Newcallerid - Alarm - AlarmClear - Agentcallbacklogoff - Agentcallbacklogin - Agentlogoff - MeetmeJoin - MessageWaiting - join - leave - AgentCalled - ParkedCall - Fired after ParkedCalls Cdr - ParkedCallsComplete - QueueParams - QueueMember - QueueStatusEnd - Status - StatusComplete - ZapShowChannels -  Fired after ZapShowChannels ZapShowChannelsComplete -  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events  @param string $event type or * for default handler @param string $callback function @return boolean sucess /

### database_show($family = '')

Show all entries in the asterisk database  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database  @return Array associative array of key=>value /

### database_put($family, $key, $value)

Add an entry to the asterisk database  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database  @param string $family    The family name to use @param string $key       The key name to use @param mixed $value      The value to add @return bool True if successful /

### database_get($family, $key)

Get an entry from the asterisk database  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database  @param string $family    The family name to use @param string $key       The key name to use @return mixed Value of the key, or false if error /

### database_del($family, $key)

Delete an entry from the asterisk database  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database  @param string $family    The family name to use @param string $key       The key name to use @return bool True if successful /

### database_deltree($family)

Delete a family from the asterisk database  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database  @param string $family    The family name to use @return bool True if successful /

### func_exists($func)

Returns whether a give function exists in this Asterisk install  @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore  @param string $func  The case sensitve name of the function @return bool True if if it exists /

### app_exists($app)

Returns whether a give application exists in this Asterisk install  @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore  @param string $app   The case in-sensitve name of the application @return bool True if if it exists /

### chan_exists($channel)

Returns whether a give channeltype exists in this Asterisk install  @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore  @param string $channel The case in-sensitve name of the channel @return bool True if if it exists /

### mod_loaded($mod)

Returns whether a give asterisk module is loaded in this Asterisk install  @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore  @param string $app The case in-sensitve name of the application @return bool True if if it exists /

### set_global($var, $val)

Sets a global var or function to the provided value  @param string $var The variable or function to set @param string $val the value to set it to @return array returns the array value from the send_request /

### Reload($module = null, $actionid = null)

Reload module(s)  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Reload @param string $module @param string $actionid /

### mixmonitor($channel, $file, $options = '', $postcommand = '', $actionid = null)

Starts mixmonitor  @param string $channel   The channel to start recording @param string $file The file to record to @param string $options Options to pass to mixmonitor @param string $postcommand Command to execute after recording @param string $actionid message matching variable  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MixMonitor  @return array returns the array value from the send_request /

### stopmixmonitor($channel, $actionid = null)

Stops mixmonitor  @param string $channel The channel to stop recording @param string $actionid message matching variable  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MixMonitor  @return array returns the array value from the send_request /

### PJSIPShowEndpoint($dev)

PJSIPShowEndpoint  @param string $channel @version 12 @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+ManagerAction_PJSIPShowEndpoints  @return array returns a key => val array /

### CoreShowChannels()

List all channels  List currently defined channels and some information about them.  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_CoreShowChannels  @return array of all channels currently active /

