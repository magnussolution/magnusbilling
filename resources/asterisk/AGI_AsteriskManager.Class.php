<?php
/**
 * phpagi-asmanager.php : PHP Asterisk Manager functions
 * Website: http://phpagi.sourceforge.net
 *
 * Copyright (c) 2004 - 2010 Matthew Asham <matthew@ochrelabs.com>, David Eder <david@eder.us>
 * Copyright (c) 2005 - 2015 Schmooze Com, Inc
 * All Rights Reserved.
 *
 * This software is released under the terms of the GNU Public License v2
 * A copy of which is available from http://www.fsf.org/licenses/gpl.txt
 *
 * @package phpAGI
 */

/**
 * Asterisk Manager class
 *
 * @link http://www.voip-info.org/wiki-Asterisk+config+manager.conf
 * @link http://www.voip-info.org/wiki-Asterisk+manager+API
 * @example examples/sip_show_peer.php Get information about a sip peer
 * @package phpAGI
 */
class AGI_AsteriskManager
{
    /**
     * Config variables
     *
     * @var array
     */
    public $config;

    /**
     * Socket
     *
     */
    public $socket = null;

    /**
     * Server we are connected to
     *
     * @var string
     */
    public $server;

    /**
     * Port on the server we are connected to
     *
     * @var integer
     */
    public $port;

    /**
     * Parent AGI
     *
     * @var AGI
     */
    private $pagi;

    /**
     * Username we connected with (for reconnect)
     *
     * @var string
     */
    public $username = null;

    /**
     * Secret we connected with (for reconnect)
     *
     *  @var string
     */
    public $secret = null;

    /**
     * Current state of events (for reconnect)
     *
     * @var string
     */
    public $events = null;

    /**
     * Number of reconnect attempts per incident
     *
     * @var string
     */
    public $reconnects = 2;

    /**
     * Asterisk settings from CoreSettings
     * @var array
     */
    private $settings = null;

    /**
     * Event Handlers
     *
     * @var array
     */
    private $event_handlers;

    /**
     * Log Level
     *
     * @var integer
     */
    private $log_level;

    /**
     * Whether to cache the asterisk DB information
     * @var bool
     */
    private $useCaching = false;

    /**
     * The cached Asterisk DB
     * @var array
     */
    private $memAstDB = null;

    /**
     * Constructor
     *
     * @param string $config is an array of configuration vars and vals, stuffed into $this->config
     */
    public function __construct($config = [])
    {
        //No Errors to the screen
        error_reporting(0);
        @ini_set('display_errors', 0);

        // load config
        if (is_array($config)) {
            $this->config = $config;
        } else {

            if ( ! is_null($config) && file_exists($config)) {
                $this->config = parse_ini_file($config, true);
            } elseif (file_exists(DEFAULT_PHPAGI_CONFIG)) {
                $this->config = parse_ini_file(DEFAULT_PHPAGI_CONFIG, true);
            }
        }

        // add default values to config for uninitialized values
        if ( ! isset($this->config['server'])) {
            $this->config['server'] = 'localhost';
        }
        if ( ! isset($this->config['port'])) {
            $this->config['port'] = 5038;
        }
        if ( ! isset($this->config['username'])) {
            $this->config['username'] = 'phpagi';
        }
        if ( ! isset($this->config['secret'])) {
            $this->config['secret'] = 'phpagi';
        }
        if ( ! isset($this->config['timeout'])) {
            $this->config['timeout'] = 5;
        }
        if (isset($this->config['cachemode'])) {
            $this->useCaching = $this->config['cachemode'];
        }

        $this->log_level  = (isset($this->config['log_level']) && is_numeric($this->config['log_level'])) ? $this->config['log_level'] : false;
        $this->reconnects = isset($this->config['reconnects']) ? $this->config['reconnects'] : 2;
    }

    /**
     * Load Asterisk DB into local cache
     */
    private function LoadAstDB()
    {
        if ($this->memAstDB != null) {
            unset($this->memAstDB);
        }
        $this->memAstDB = $this->database_show();
    }

    /**
     * Send a request
     *
     * @param string $action
     * @param array $parameters
     * @return array of parameters
     */
    public function send_request($action, $parameters = [], $retry = true)
    {
        $reconnects = $this->reconnects;

        $req = "Action: $action\r\n";
        foreach ($parameters as $var => $val) {
            if (is_array($val)) {
                foreach ($val as $k => $v) {
                    $req .= "$var: $k=$v\r\n";
                }
            } else {
                $req .= "$var: $val\r\n";
            }

        }
        $req .= "\r\n";
        $this->log("Sending Request down socket:", 10);
        $this->log($req, 10);
        if ( ! $this->connected()) {
            //echo ("Asterisk is not connected\n");
            return;
        }
        fwrite($this->socket, $req);
        $response = $this->wait_response();

        //print_r($response);

        // If we got a false back then something went wrong, we will try to reconnect the manager connection to try again
        //
        while ($response === false && $retry && $reconnects > 0) {
            $this->log("Unexpected failure executing command: $action, reconnecting to manager and retrying: $reconnects");
            $this->disconnect();
            if ($this->connect($this->server . ':' . $this->port, $this->username, $this->secret, $this->events) !== false) {
                if ( ! $this->connected()) {
                    // echo ("Asterisk is not connected\n");
                    break;
                }
                fwrite($this->socket, $req);
                $response = $this->wait_response();
            } else {
                if ($reconnects > 1) {
                    $this->log("reconnect command failed, sleeping before next attempt");
                    sleep(1);
                } else {
                    $this->log("FATAL: no reconnect attempts left, command permanently failed, returning to calling program with 'false' failure code");
                }
            }
            $reconnects--;
        }
        if ($action == 'Command' && empty($response['data']) && ! empty($response['Output'])) {
            $response['data'] = $response['Output'];
            unset($response['Output']);
        }
        return $response;
    }

    /**
     * Wait for a response
     *
     * If a request was just sent, this will return the response.
     * Otherwise, it will loop forever, handling events.
     *
     * @param boolean $allow_timeout if the socket times out, return an empty array
     * @return array of parameters, empty on timeout
     */
    public function wait_response($allow_timeout = false)
    {
        $timeout = false;

        do {
            $type       = null;
            $parameters = [];

            if ( ! $this->socket || feof($this->socket)) {
                $this->log("Got EOF in wait_response() from socket waiting for response, returning false", 10);
                restore_error_handler();
                return false;
            }
            $buffer = trim(fgets($this->socket, 4096));
            while ($buffer != '') {
                $a = strpos($buffer, ':');

                if ($a) {
                    if ( ! count($parameters)) {
// first line in a response?
                        $type = strtolower(substr($buffer, 0, $a));
                        if ((substr($buffer, $a + 2) == 'Follows')) {
                            // A 'follows' response means there is a muiltiline field that follows.
                            $parameters['data'] = '';
                            $buff               = fgets($this->socket, 4096);
                            $s                  = 0;
                            while (substr($buff, 0, 6) != '--END ' && $s < 30000) {
                                if ($buff == '') {
                                    break;
                                }
                                $parameters['data'] .= $buff;
                                $buff = fgets($this->socket, 4096);
                                $s++;
                            }
                        }
                    } elseif (count($parameters) == 2) {

                        if ($parameters['Response'] == "Success" && isset($parameters['Message']) && $parameters['Message'] == 'Command output follows') {
                            // A 'Command output follows' response means there is a muiltiline field that follows.
                            $parameters['data'] = '';

                            $buff = fgets($this->socket, 4096);

                            while ($buff !== "\r\n") {
                                $buff = preg_replace("/^Output:\s*/", "", $buff);
                                $parameters['data'] .= $buff;
                                $buff = fgets($this->socket, 4096);
                            }
                            if (empty($parameters['data'])) {
                                $parameters['data'] = preg_replace("/^Output:\s*/", "", $buffer);
                            }
                            break;
                        }
                    }

                    // store parameter in $parameters
                    $parameters[substr($buffer, 0, $a)] = substr($buffer, $a + 2);
                }
                $buffer = trim(fgets($this->socket, 4096));
            }

            // process response
            switch ($type) {
                case '': // timeout occured
                    $timeout = $allow_timeout;
                    break;
                case 'event':
                    $this->process_event($parameters);
                    break;
                case 'response':
                case 'message':
                    break;
                default:
                    $this->log('Unhandled response packet (' . $type . ') from Manager: ' . print_r($parameters, true));
                    break;
            }
        } while ($type != 'response' && $type != 'message' && ! $timeout);

        if (preg_match("/Output/", $buffer)) {
            $parameters['data'] .= preg_replace("/Output: /", '', $buffer);
        }

        $this->log("returning from wait_response with with type: $type", 10);
        $this->log('$parmaters: ' . print_r($parameters, true), 10);
        $this->log('$buffer: ' . print_r($buffer, true), 10);
        if (isset($buff)) {
            $this->log('$buff: ' . print_r($buff, true), 10);
        }
        restore_error_handler();
        return $parameters;
    }

    /**
     * Connect to Asterisk
     *
     * @example examples/sip_show_peer.php Get information about a sip peer
     *
     * @param string $server
     * @param string $username
     * @param string $secret
     * @return boolean true on success
     */
    public function connect($server = null, $username = null, $secret = null, $events = 'on')
    {

        if (is_null($server)) {
            $server = $this->config['server'];
        }

        $this->username = is_null($username) ? $this->config['username'] : $username;
        $this->secret   = is_null($secret) ? $this->config['secret'] : $secret;
        $this->events   = $events;

        // get port from server if specified
        if (strpos($server, ':') !== false) {
            $c            = explode(':', $server);
            $this->server = $c[0];
            $this->port   = $c[1];
        } else {
            $this->server = $server;
            $this->port   = $this->config['port'];
        }

        // connect the socket
        $errno        = $errstr        = null;
        $this->socket = stream_socket_client("tcp://" . $this->server . ":" . $this->port, $errno, $errstr, 3);
        stream_set_timeout($this->socket, 5);
        if ( ! $this->socket) {
            restore_error_handler();
            $this->log("Unable to connect to manager {$this->server}:{$this->port} ($errno): $errstr");
        }

        // read the header
        $str = fgets($this->socket);
        if ($str == false) {
            // a problem.
            restore_error_handler();
            //echo ("Asterisk Manager Header not received");
        } else {
            // note: don't $this->log($str) until someone looks to see why it mangles the logging
        }

        stream_set_timeout($this->socket, $this->config['timeout']);

        // login
        $res = $this->send_request('login',
            [
                'Username' => $this->username,
                'Secret'   => $this->secret,
                'Events'   => $this->events,
            ],
            false);
        if ($res['Response'] != 'Success') {
            $this->disconnect();
            restore_error_handler();
            $this->log("Failed to login manager {$this->server}:{$this->port}");
            return false;
        }
        $this->CoreSettings();
        restore_error_handler();
        return true;
    }

    /**
     * Disconnect
     *
     */
    public function disconnect()
    {
        if ($this->connected()) {
            $this->logoff();
        }
        fclose($this->socket);
        $this->settings = null;
    }

    /**
     * Check if the socket is connected
     *
     */
    public function connected()
    {
        return is_resource($this->socket) && ! feof($this->socket);
    }

    /**
     * Set Absolute Timeout
     *
     * Hangup a channel after a certain time. Acknowledges set time with Timeout Set message.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_AbsoluteTimeout
     * @version 11
     * @param string $channel
     * @param integer $timeout
     */
    public function AbsoluteTimeout($channel, $timeout)
    {
        return $this->send_request('AbsoluteTimeout', ['Channel' => $channel, 'Timeout' => $timeout]);
    }

    /**
     * Show PBX core settings (version etc).
     *
     * Query for Core PBX settings.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_CoreSettings
     */
    public function CoreSettings()
    {
        if (empty($this->settings)) {
            $this->settings = $this->send_request('CoreSettings');
        }
        return $this->settings;
    }

    /**
     * Sets an agent as no longer logged in.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_AgentLogoff
     * @version 11
     * @param string $agent Agent ID of the agent to log off.
     * @param string $soft  Set to true to not hangup existing calls.
     */
    public function AgentLogoff($agent, $soft = 'false')
    {
        return $this->send_request('AgentLogoff', ['Agent' => $agent, 'Soft' => $soft]);
    }

    /**
     * Lists agents and their status.
     *
     * Will list info about all possible agents.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Agents
     * @version 11
     */
    public function Agents()
    {
        return $this->send_request('Agents');
    }

    /**
     * Add an AGI command to execute by Async AGI.
     *
     * Add an AGI command to the execute queue of the channel in Async AGI.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_AGI
     * @param string $channel Channel that is currently in Async AGI.
     * @param string $command Application to execute.
     * @param string $commandid This will be sent back in CommandID header of AsyncAGI exec event notification.
     */
    public function AGI($channel, $command, $commandid)
    {
        return $this->send_request('AGI', ['Channel' => $channel, 'Command' => $command, "CommandID" => $commandid]);
    }

    /**
     * Send an arbitrary event.
     *
     * Send an event to manager sessions.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_UserEvent
     * @param string $channel
     * @param string $file
     */
    public function UserEvent($event, $headers = [])
    {
        $d = ['UserEvent' => $event];
        $i = 1;
        foreach ($headers as $header) {
            $d['Header' . $i] = $header;
            $i++;
        }
        return $this->send_request('UserEvent', $d);
    }

    /**
     * Change monitoring filename of a channel
     *
     * This action may be used to change the file started by a previous 'Monitor' action.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ChangeMonitor
     * @param string $channel Used to specify the channel to record.
     * @param string $file Is the new name of the file created in the monitor spool directory.
     */
    public function ChangeMonitor($channel, $file)
    {
        return $this->send_request('ChangeMonitor', ['Channel' => $channel, 'File' => $file]);
    }

    /**
     * Execute Asterisk CLI Command
     *
     * Run a CLI command
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Command
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Command+Line+Interface
     * @param string $command Asterisk CLI command to run
     * @param string $actionid message matching variable
     */
    public function Command($command, $actionid = null)
    {
        $parameters = ['Command' => $command];
        if ($actionid) {
            $parameters['ActionID'] = $actionid;
        }
        return $this->send_request('Command', $parameters);
    }

    /**
     * Tell Asterisk to poll mailboxes for a change
     *
     * Normally, MWI indicators are only sent when Asterisk itself changes a mailbox.
     * With external programs that modify the content of a mailbox from outside the
     * application, an option exists called pollmailboxes that will cause voicemail
     * to continually scan all mailboxes on a system for changes. This can cause a
     * large amount of load on a system. This command allows external applications
     * to signal when a particular mailbox has changed, thus permitting external
     * applications to modify mailboxes and MWI to work without introducing
     * considerable CPU load.
     *
     * If Context is not specified, all mailboxes on the system will be polled for
     * changes. If Context is specified, but Mailbox is omitted, then all mailboxes
     * within Context will be polled. Otherwise, only a single mailbox will be
     * polled for changes.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+12+ManagerAction_VoicemailRefresh
     * @param string $context
     * @param string $mailbox
     * @param string $actionid ActionID for this transaction. Will be returned.
     */
    public function VoicemailRefresh($context = null, $mailbox = null, $actionid = null)
    {
        if (version_compare($this->settings['AsteriskVersion'], "12.0", "lt")) {
            return false;
        }
        $parameters = [];
        if ( ! empty($context)) {
            $parameters['Context'] = $context;
        }
        if ( ! empty($mailbox)) {
            $parameters['Mailbox'] = $mailbox;
        }
        if ( ! empty($actionid)) {
            $parameters['ActionID'] = $actionid;
        }
        return $this->send_request('VoicemailRefresh', $parameters);
    }

    /**
     * Get and parse codecs
     * @param {string} $type='audio' Type of codec to look up
     */
    public function Codecs($type = 'audio')
    {
        $type = strtolower($type);
        switch ($type) {
            case 'video':
                $ret = $this->Command('core show codecs video');
                break;
            case 'text':
                $ret = $this->Command('core show codecs text');
                break;
            case 'image':
                $ret = $this->Command('core show codecs image');
                break;
            case 'audio':
            default:
                $ret = $this->Command('core show codecs audio');
                break;
        }

        if (preg_match_all('/\d{1,6}\s*' . $type . '\s*([a-z0-9]*)\s/i', $ret['data'], $matches)) {
            return $matches[1];
        } else {
            return [];
        }
    }

    /**
     * Kick a Confbridge user.
     *
     * Kick a Confbridge user.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeKick
     * @param string $conference Conference number.
     * @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used.
     */
    public function ConfbridgeKick($conference, $channel)
    {
        return $this->send_request('ConfbridgeKick', ['Conference' => $conference, 'Channel' => $channel]);
    }

    /**
     * List Users in a Conference
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeList
     * @param string $conference Conference number.
     */
    public function ConfbridgeList($conference)
    {
        $this->add_event_handler("confbridgelist", [$this, 'Confbridge_catch']);
        $this->add_event_handler("confbridgelistcomplete", [$this, 'Confbridge_catch']);
        $response = $this->send_request('ConfbridgeList', ['Conference' => $conference]);
        if ($response["Response"] == "Success") {
            $this->response_catch = [];
            $this->wait_response(true);
            stream_set_timeout($this->socket, 30);
        } else {
            return false;
        }
        return $this->response_catch;
    }

    /**
     * List active conferences.
     *
     * Lists data about all active conferences. ConfbridgeListRooms will follow as separate events, followed by a final event called ConfbridgeListRoomsComplete.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeListRooms
     */
    public function ConfbridgeListRooms()
    {
        $this->add_event_handler("confbridgelistrooms", [$this, 'Confbridge_catch']);
        $this->add_event_handler("confbridgelistroomscomplete", [$this, 'Confbridge_catch']);
        $response = $this->send_request('ConfbridgeListRooms');
        if ($response["Response"] == "Success") {
            $this->response_catch = [];
            $this->wait_response(true);
            stream_set_timeout($this->socket, 30);
        } else {
            return false;
        }
        return $this->response_catch;
    }

    /**
     * Conference Bridge Event Catch
     *
     * This catches events obtained from the confbridge stream, it should not be used externally
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeListRooms
     */
    private function Confbridge_catch($event, $data, $server, $port)
    {
        switch ($event) {
            case 'confbridgelistcomplete':
            case 'confbridgelistroomscomplete':
                /* HACK: Force a timeout after we get this event, so that the wait_response() returns. */
                stream_set_timeout($this->socket, 0, 1);
                break;
            case 'confbridgelist':
                $this->response_catch[] = $data;
                break;
            case 'confbridgelistrooms':
                $this->response_catch[] = $data;
                break;
        }
    }

    /**
     * Conference Bridge Event Catch
     *
     * This catches events obtained from the confbridge stream, it should not be used externally
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeListRooms
     */
    private function Meetme_catch($event, $data, $server, $port)
    {
        switch ($event) {
            case 'meetmelistcomplete':
            case 'meetmelistroomscomplete':
                /* HACK: Force a timeout after we get this event, so that the wait_response() returns. */
                stream_set_timeout($this->socket, 0, 1);
                break;
            case 'meetmelist':
                $this->response_catch[] = $data;
                break;
            case 'meetmelistrooms':
                $this->response_catch[] = $data;
                break;
        }
    }

    /**
     * Lock a Confbridge conference.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeLock
     * @param string $conference Conference number.
     */
    public function ConfbridgeLock($conference)
    {
        return $this->send_request('ConfbridgeLock', ['Conference' => $conference]);
    }

    /**
     * Mute a Confbridge user.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeMute
     * @param string $conference Conference number.
     * @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used.
     */
    public function ConfbridgeMute($conference, $channel)
    {
        return $this->send_request('ConfbridgeMute', ['Conference' => $conference, 'Channel' => $channel]);
    }

    /**
     * Set a conference user as the single video source distributed to all other participants.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeSetSingleVideoSrc
     * @param string $conference Conference number.
     * @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used.
     */
    public function ConfbridgeSetSingleVideoSrc($conference, $channel)
    {
        return $this->send_request('ConfbridgeSetSingleVideoSrc', ['Conference' => $conference, 'Channel' => $channel]);
    }

    /**
     * Start recording a Confbridge conference.
     *
     * Start recording a conference. If recording is already present an error will be returned.
     * If RecordFile is not provided, the default record file specified in the conference's bridge profile will be used, if that is not present either a file will automatically be generated in the monitor directory.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeMute
     * @param string $conference Conference number.
     * @param string $channel If this parameter is not a complete channel name, the first channel with this prefix will be used.
     */
    public function ConfbridgeStartRecord($conference, $recordFile)
    {
        return $this->send_request('ConfbridgeStartRecord', ['Conference' => $conference, 'RecordFile' => $recordFile]);
    }

    /**
     * Stop recording a Confbridge conference.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeStopRecord
     * @param string $conference Conference number.
     */
    public function ConfbridgeStopRecord($conference)
    {
        return $this->send_request('ConfbridgeStopRecord', ['Conference' => $conference]);
    }

    /**
     * Unlock a Confbridge conference.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeUnlock
     * @param string $conference Conference number.
     */
    public function ConfbridgeUnlock($conference)
    {
        return $this->send_request('ConfbridgeUnlock', ['Conference' => $conference]);
    }

    /**
     * Unmute a Confbridge user.
     *
     *  @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeUnmute
     * @param string $conference Conference number.
     */
    public function ConfbridgeUnmute($conference, $channel)
    {
        return $this->send_request('ConfbridgeUnmute', ['Conference' => $conference, 'Channel' => $channel]);
    }

    /**
     * Enable/Disable sending of events to this manager
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Events
     * @param string $eventmask is either 'on', 'off', or 'system,call,log'
     */
    public function Events($eventmask)
    {
        $this->events = $eventmask;
        return $this->send_request('Events', ['EventMask' => $eventmask]);
    }

    /**
     * Check Extension Status
     *
     * Report the extension state for given extension.
     * If the extension has a hint, will use devicestate to check the status of the device connected to the extension.
     * Will return an Extension Status message.
     * The response will include the hint for the extension and the status.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ExtensionState
     * @param string $exten Extension to check state on
     * @param string $context Context for extension
     * @param string $actionid message matching variable
     */
    public function ExtensionState($exten, $context, $actionid = null)
    {
        $parameters = ['Exten' => $exten, 'Context' => $context];
        if ($actionid) {
            $parameters['ActionID'] = $actionid;
        }
        return $this->send_request('ExtensionState', $parameters);
    }

    /**
     * Gets a Channel Variable
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Getvar
     * @param string $channel  Channel to read variable from
     * @param string $variable Variable name, function or expression
     * @param string $actionid message matching variable
     */
    public function GetVar($channel, $variable, $actionid = null)
    {
        $parameters = ['Channel' => $channel, 'Variable' => $variable];
        if ($actionid) {
            $parameters['ActionID'] = $actionid;
        }
        return $this->send_request('GetVar', $parameters);
    }

    /**
     * Hangup Channel
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/ManagerAction_Hangup
     * @param string $channel The channel name to be hungup
     */
    public function Hangup($channel)
    {
        return $this->send_request('Hangup', ['Channel' => $channel]);
    }

    /**
     * List IAX Peers
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_IAXpeers
     */
    public function IAXPeers()
    {
        return $this->send_request('IAXPeers');
    }

    /**
     * Check Presence State
     *
     * Report the presence state for the given presence provider.
     * Will return a Presence State message.
     * The response will include the presence state and, if set, a presence subtype and custom message.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+ManagerAction_PresenceState
     * @param string $provider Presence Provider to check the state of
     */
    public function PresenceState($provider)
    {
        return $this->send_request('PresenceState', ['Provider' => $provider]);
    }

    /**
     * List available manager commands
     *
     * Returns the action name and synopsis for every action that is available to the user.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ListCommands
     * @param string $actionid message matching variable
     */
    public function ListCommands($actionid = null)
    {
        if ($actionid) {
            return $this->send_request('ListCommands', ['ActionID' => $actionid]);
        } else {
            return $this->send_request('ListCommands');
        }
    }

    /**
     * Logoff Manager
     *
     * Logoff the current manager session.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Logoff
     */
    public function Logoff()
    {
        return $this->send_request('Logoff', [], false);
    }

    /**
     * Check Mailbox Message Count
     *
     * Returns number of new and old messages.
     *   Message: Mailbox Message Count
     *   Mailbox: <mailboxid>
     *   NewMessages: <count>
     *   OldMessages: <count>
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MailboxStatus
     * @param string $mailbox Full mailbox ID <mailbox>@<vm-context>
     */
    public function MailboxCount($mailbox, $actionid = null)
    {
        $parameters = ['Mailbox' => $mailbox];
        if ($actionid) {
            $parameters['ActionID'] = $actionid;
        }
        return $this->send_request('MailboxCount', $parameters);
    }

    /**
     * Check Mailbox
     *
     * Returns number of messages.
     *   Message: Mailbox Status
     *   Mailbox: <mailboxid>
     *   Waiting: <count>
     *
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+MailboxStatus
     * @param string $mailbox Full mailbox ID <mailbox>@<vm-context>
     * @param string $actionid message matching variable
     */
    public function MailboxStatus($mailbox, $actionid = null)
    {
        $parameters = ['Mailbox' => $mailbox];
        if ($actionid) {
            $parameters['ActionID'] = $actionid;
        }
        return $this->send_request('MailboxStatus', $parameters);
    }

    /**
     * MessageSend
     *
     * Send an SMS message
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MessageSend
     * @param string $to
     * @param string $from
     * @param string $body
     * @param string $variable optional
     * @return array result of send_request
     */
    public function MessageSend($to, $from, $body, $variable = null)
    {
        $parameters['To']         = $to;
        $parameters['From']       = $from;
        $parameters['Base64Body'] = base64_encode($body);
        if ($variable) {
            $parameters['Variable'] = $variable;
        }
        return $this->send_request('MessageSend', $parameters);
    }

    /**
     * List participants in a conference.
     *
     * Lists all users in a particular MeetMe conference. MeetmeList will follow as separate events, followed by a final event called MeetmeListComplete.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MeetmeList
     * @param string $conference Conference number.
     */
    public function MeetmeList($conference)
    {
        $this->add_event_handler("meetmelist", [$this, 'Meetme_catch']);
        $this->add_event_handler("meetmelistcomplete", [$this, 'Meetme_catch']);
        $response = $this->send_request('MeetmeList', ['Conference' => $conference]);
        if ($response["Response"] == "Success") {
            $this->response_catch = [];
            $this->wait_response(true);
            stream_set_timeout($this->socket, 30);
        } else {
            return false;
        }
        return $this->response_catch;
    }

    /**
     * List active conferences.
     *
     * Lists data about all active conferences. MeetmeListRooms will follow as separate events, followed by a final event called MeetmeListRoomsComplete.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ConfbridgeListRooms
     */
    public function MeetmeListRooms()
    {
        $this->add_event_handler("meetmelistrooms", [$this, 'Meetme_catch']);
        $this->add_event_handler("meetmelistroomscomplete", [$this, 'Meetme_catch']);
        $response = $this->send_request('MeetmeListRooms');
        if ($response["Response"] == "Success") {
            $this->response_catch = [];
            $this->wait_response(true);
            stream_set_timeout($this->socket, 30);
        } else {
            return false;
        }
        return $this->response_catch;
    }

    /**
     * Mute a Meetme user.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MeetmeUnmute
     * @param string $meetme Conference number.
     * @param string $usernum User Number
     */
    public function MeetmeMute($meetme, $usernum)
    {
        return $this->send_request('MeetmeMute', ['Meetme' => $meetme, 'Usernum' => $usernum]);
    }

    /**
     * Unmute a Meetme user.
     *
     * Unmute a Meetme user.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MeetmeUnmute
     * @param string $meetme Conference number.
     * @param string $usernum User Number
     */
    public function MeetmeUnmute($meetme, $usernum)
    {
        return $this->send_request('MeetmeUnmute', ['Meetme' => $meetme, 'Usernum' => $usernum]);
    }

    /**
     * Monitor a channel
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Monitor
     * @param string $channel
     * @param string $file
     * @param string $format
     * @param boolean $mix
     */
    public function Monitor($channel, $file = null, $format = null, $mix = null)
    {
        $parameters = ['Channel' => $channel];
        if ($file) {
            $parameters['File'] = $file;
        }
        if ($format) {
            $parameters['Format'] = $format;
        }
        if ( ! is_null($file)) {
            $parameters['Mix'] = ($mix) ? 'true' : 'false';
        }
        return $this->send_request('Monitor', $parameters);
    }

    /**
     * Originate Call
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Originate
     * @param string $channel
     * @param string $exten
     * @param string $context
     * @param string $priority
     * @param integer $timeout
     * @param string $callerid
     * @param string $variable (Supports an array of values)
     * @param string $account
     * @param string $application
     * @param string $data
     * == exactly 11 values required ==
     *
     * -- OR --
     *
     * @pram array a key => value array of what ever you want to pass in
     */
    public function Originate()
    {
        $num_args = func_num_args();

        if ($num_args === 10) {
            $args = func_get_args();

            $parameters = [];
            if ($args[0]) {
                $parameters['Channel'] = $args[0];
            }
            if ($args[1]) {
                $parameters['Exten'] = $args[1];
            }
            if ($args[2]) {
                $parameters['Context'] = $args[2];
            }
            if ($args[3]) {
                $parameters['Priority'] = $args[3];
            }
            if ($args[4]) {
                $parameters['Timeout'] = $args[4];
            }
            if ($args[5]) {
                $parameters['CallerID'] = $args[5];
            }
            if ($args[6]) {
                $parameters['Variable'] = $args[6];
            }
            if ($args[7]) {
                $parameters['Account'] = $args[7];
            }
            if ($args[8]) {
                $parameters['Application'] = $args[8];
            }
            if ($args[9]) {
                $parameters['Data'] = $args[9];
            }
        } else {
            $args = func_get_args();
            $args = $args[0];
            foreach ($args as $key => $val) {
                $parameters[$key] = $val;
            }
        }

        return $this->send_request('Originate', $parameters);
    }

    /**
     * List parked calls
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_ParkedCalls
     */
    public function ParkedCalls($actionid = null)
    {
        if ($actionid) {
            return $this->send_request('ParkedCalls', ['ActionID' => $actionid]);
        } else {
            return $this->send_request('ParkedCalls');
        }
    }

    /**
     * Ping
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Ping
     */
    public function Ping()
    {
        return $this->send_request('Ping');
    }

    /**
     * Queue Add
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_QueueAdd
     * @param string $queue
     * @param string $interface
     * @param integer $penalty
     */
    public function QueueAdd($queue, $interface, $penalty = 0)
    {
        $parameters = ['Queue' => $queue, 'Interface' => $interface];
        if ($penalty) {
            $parameters['Penalty'] = $penalty;
        }
        return $this->send_request('QueueAdd', $parameters);
    }

    /**
     * Queue Remove
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_QueueRemove
     * @param string $queue
     * @param string $interface
     */
    public function QueueRemove($queue, $interface)
    {
        return $this->send_request('QueueRemove', ['Queue' => $queue, 'Interface' => $interface]);
    }
    /**
     * Queues
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Queues
     */
    public function Queues()
    {
        return $this->send_request('Queues');
    }

    /**
     * Queue Status
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_QueueStatus
     * @param string $actionid message matching variable
     */
    public function QueueStatus($actionid = null)
    {
        if ($actionid) {
            return $this->send_request('QueueStatus', ['ActionID' => $actionid]);
        } else {
            return $this->send_request('QueueStatus');
        }
    }

    /**
     * Redirect
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Redirect
     * @param string $channel
     * @param string $extrachannel
     * @param string $exten
     * @param string $context
     * @param string $priority
     */
    public function Redirect($channel, $extrachannel, $exten, $context, $priority)
    {
        return $this->send_request('Redirect', ['Channel' => $channel, 'ExtraChannel' => $extrachannel, 'Exten' => $exten, 'Context' => $context, 'Priority' => $priority]);
    }

    /**
     * Set the CDR UserField
     *
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+SetCDRUserField
     * @param string $userfield
     * @param string $channel
     * @param string $append
     */
    public function SetCDRUserField($userfield, $channel, $append = null)
    {
        $parameters = ['UserField' => $userfield, 'Channel' => $channel];
        if ($append) {
            $parameters['Append'] = $append;
        }
        return $this->send_request('SetCDRUserField', $parameters);
    }

    /**
     * Set Channel Variable
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Setvar
     * @param string $channel Channel to set variable for
     * @param string $variable name
     * @param string $value
     */
    public function SetVar($channel, $variable, $value)
    {
        return $this->send_request('SetVar', ['Channel' => $channel, 'Variable' => $variable, 'Value' => $value]);
    }

    /**
     * List SIP Peers
     */
    public function SIPpeers()
    {
        //TODO need to look at source to find this function...
        return $this->send_request('SIPpeers');
    }

    /**
     * Channel Status
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Status
     * @param string $channel
     * @param string $actionid message matching variable
     */
    public function Status($channel, $actionid = null)
    {
        $parameters = ['Channel' => $channel];
        if ($actionid) {
            $parameters['ActionID'] = $actionid;
        }
        return $this->send_request('Status', $parameters);
    }

    /**
     * Stop monitoring a channel
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_StopMonitor
     * @param string $channel
     */
    public function StopMonitor($channel)
    {
        return $this->send_request('StopMonitor', ['Channel' => $channel]);
    }

    /**
     * Dial over Zap channel while offhook
     *
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapDialOffhook
     * @param string $zapchannel
     * @param string $number
     */
    public function ZapDialOffhook($zapchannel = '', $number = '')
    {
        //TODO: need to look at source to find this function...
        if ($zapchannel && $number) {
            return $this->send_request('ZapDialOffhook', ['ZapChannel' => $zapchannel, 'Number' => $number]);
        } else {
            return $this->send_request('ZapDialOffhook');
        }
    }

    /**
     * Toggle Zap channel Do Not Disturb status OFF
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapDNDoff
     * @param string $zapchannel
     */
    public function ZapDNDoff($zapchannel = '')
    {
        //TODO: need to look at source to find this function...
        if ($zapchannel) {
            return $this->send_request('ZapDNDoff', ['ZapChannel' => $zapchannel]);
        } else {
            return $this->send_request('ZapDNDoff');
        }
    }

    /**
     * Toggle Zap channel Do Not Disturb status ON
     *
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapDNDon
     * @param string $zapchannel
     */
    public function ZapDNDon($zapchannel = '')
    {
        //TODO: need to look at source to find this function...
        if ($zapchannel) {
            return $this->send_request('ZapDNDon', ['ZapChannel' => $zapchannel]);
        } else {
            return $this->send_request('ZapDNDon');
        }
    }

    /**
     * Hangup Zap Channel
     *
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapHangup
     * @param string $zapchannel
     */
    public function ZapHangup($zapchannel = '')
    {
        //TODO: need to look at source to find this function...
        if ($zapchannel) {
            return $this->send_request('ZapHangup', ['ZapChannel' => $zapchannel]);
        } else {
            return $this->send_request('ZapHangup');
        }
    }

    /**
     * Transfer Zap Channel
     *
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapTransfer
     * @param string $zapchannel
     */
    public function ZapTransfer($zapchannel = '')
    {
        //TODO need to look at source to find this function...
        if ($zapchannel) {
            return $this->send_request('ZapTransfer', ['ZapChannel' => $zapchannel]);
        } else {
            return $this->send_request('ZapTransfer');
        }
    }

    /**
     * Zap Show Channels
     *
     * @link http://www.voip-info.org/wiki-Asterisk+Manager+API+Action+ZapShowChannels
     * @param string $actionid message matching variable
     */
    public function ZapShowChannels($actionid = null)
    {
        if ($actionid) {
            return $this->send_request('ZapShowChannels', ['ActionID' => $actionid]);
        } else {
            return $this->send_request('ZapShowChannels');
        }
    }

    /**
     * Log a message
     *
     * @param string $message
     * @param integer $level from 1 to 4
     */
    public function log($message, $level = 1)
    {
        if ($this->pagi != false) {
            $this->pagi->conlog($message, $level);
        } elseif ($this->log_level === false && $level <= $this->log_level) {
            error_log(date('r') . ' - ' . $message);
        }
    }

    /**
     * Add event handler
     *
     * Known Events include ( https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events )
     *   Link - Fired when two voice channels are linked together and voice data exchange commences.
     *   Unlink - Fired when a link between two voice channels is discontinued, for example, just before call completion.
     *   Newexten -
     *   Hangup -
     *   Newchannel -
     *   Newstate -
     *   Reload - Fired when the "RELOAD" console command is executed.
     *   Shutdown -
     *   ExtensionStatus -
     *   Rename -
     *   Newcallerid -
     *   Alarm -
     *   AlarmClear -
     *   Agentcallbacklogoff -
     *   Agentcallbacklogin -
     *   Agentlogoff -
     *   MeetmeJoin -
     *   MessageWaiting -
     *   join -
     *   leave -
     *   AgentCalled -
     *   ParkedCall - Fired after ParkedCalls
     *   Cdr -
     *   ParkedCallsComplete -
     *   QueueParams -
     *   QueueMember -
     *   QueueStatusEnd -
     *   Status -
     *   StatusComplete -
     *   ZapShowChannels -  Fired after ZapShowChannels
     *   ZapShowChannelsComplete -
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events
     *
     * @param string $event type or * for default handler
     * @param string $callback function
     * @return boolean sucess
     */
    public function add_event_handler($event, $callback)
    {
        $event                          = strtolower($event);
        $this->event_handlers[$event][] = $callback;
        return true;
    }

    /**
     * Process event
     *
     * @param array $parameters
     * @return mixed result of event handler or false if no handler was found
     */
    private function process_event($parameters)
    {
        $ret      = false;
        $handlers = [];
        $e        = strtolower($parameters['Event']);
        $this->log("Got event... $e");

        if (isset($this->event_handlers[$e])) {
            $handlers = array_merge($handlers, $this->event_handlers[$e]);
        }
        if (isset($this->event_handlers['*'])) {
            $handlers = array_merge($handlers, $this->event_handlers['*']);
        }

        foreach ($handlers as $handler) {
            if (is_callable($handler)) {
                if (is_array($handler)) {
                    $this->log('Execute handler ' . get_class($handler[0]) . '::' . $handler[1]);
                    $ret = $handler[0]->$handler[1]($e, $parameters, $this->server, $this->port);
                } else {
                    if (is_object($handler)) {
                        $this->log("Execute handler " . get_class($handler));
                    } else {
                        $this->log("Execute handler $handler");
                    }
                    $ret = $handler($e, $parameters, $this->server, $this->port);
                }
            }
        }
        return $ret;
    }

    /**
     * Show all entries in the asterisk database
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database
     *
     * @return Array associative array of key=>value
     */
    public function database_show($family = '')
    {
        if ($this->useCaching && $this->memAstDB != null) {
            if ($family == '') {
                return $this->memAstDB;
            } else {
                $key = '/' . $family;
                if (isset($this->memAstDB[$key])) {
                    return [$key => $this->memAstDB[$key]];
                } elseif (isset($this->memAstDBArray[$key])) {
                    return $this->memAstDBArray[$key];
                } else {
                    //TODO: this is intensive cache results
                    $k = $key;
                    $key .= '/';
                    $len     = strlen($key);
                    $fam_arr = [];
                    foreach ($this->memAstDB as $this_key => $value) {
                        if (substr($this_key, 0, $len) == $key) {
                            $fam_arr[$this_key] = $value;
                        }
                    }
                    $this->memAstDBArray[$k] = $fam_arr;
                    return $fam_arr;
                }
            }
        }
        $r = $this->command("database show $family");

        $data = explode("\n", $r["data"]);
        $db   = [];

        // Remove the Privilege => Command initial entry that comes from the heading
        //
        array_shift($data);
        foreach ($data as $line) {
            // Note the space here is specifically for PJSIP registration entries,
            // which have a : in them:
            // /registrar/contact/301;@sip:301@192.168.15.125:5062: {"outbound_proxy":"",....
            $temp = explode(": ", $line, 2);
            if (trim($temp[0]) != '' && count($temp) == 2) {
                $temp[1]            = isset($temp[1]) ? $temp[1] : null;
                $db[trim($temp[0])] = trim($temp[1]);
            }
        }
        return $db;
    }

    /**
     * Add an entry to the asterisk database
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database
     *
     * @param string $family    The family name to use
     * @param string $key       The key name to use
     * @param mixed $value      The value to add
     * @return bool True if successful
     */
    public function database_put($family, $key, $value)
    {
        $write_through = false;
        if ( ! empty($this->memAstDB)) {
            $keyUsed = "/" . str_replace(" ", "/", $family) . "/" . str_replace(" ", "/", $key);
            if ( ! isset($this->memAstDB[$keyUsed]) || $this->memAstDB[$keyUsed] != $value) {
                $this->memAstDB[$keyUsed] = $value;
                $write_through            = true;
            }
            if (isset($this->memAstDBArray[$keyUsed])) {
                unset($this->memAstDBArray[$keyUsed]);
            }
        } else {
            $write_through = true;
        }
        if ($write_through) {
            $value = str_replace('"', '\\"', $value);
            $r     = $this->command("database put " . str_replace(" ", "/", $family) . " " . str_replace(" ", "/", $key) . " \"" . $value . "\"");
            return (bool) strstr($r["data"], "success");
        }
        return true;
    }

    /**
     * Get an entry from the asterisk database
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database
     *
     * @param string $family    The family name to use
     * @param string $key       The key name to use
     * @return mixed Value of the key, or false if error
     */
    public function database_get($family, $key)
    {
        if ($this->useCaching) {
            if ($this->memAstDB == null) {
                $this->LoadAstDB();
            }
            $keyUsed = "/" . str_replace(" ", "/", $family) . "/" . str_replace(" ", "/", $key);
            if (isset($this->memAstDB[$keyUsed])) {
                return $this->memAstDB[$keyUsed];
            }
        } else {
            $r    = $this->command("database get " . str_replace(" ", "/", $family) . " " . str_replace(" ", "/", $key));
            $data = strpos($r["data"], "Value:");
            if ($data !== false) {
                return trim(substr($r["data"], 6 + $data));
            }
        }
        return false;
    }

    /**
     * Delete an entry from the asterisk database
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database
     *
     * @param string $family    The family name to use
     * @param string $key       The key name to use
     * @return bool True if successful
     */
    public function database_del($family, $key)
    {
        $r      = $this->command("database del " . str_replace(" ", "/", $family) . " " . str_replace(" ", "/", $key));
        $status = (bool) strstr($r["data"], "removed");
        if ($status && ! empty($this->memAstDB)) {
            $keyUsed = "/" . str_replace(" ", "/", $family) . "/" . str_replace(" ", "/", $key);
            unset($this->memAstDB[$keyUsed]);
            if (isset($this->memAstDBArray[$keyUsed])) {
                unset($this->memAstDBArray[$keyUsed]);
            }
        }
        return $status;
    }

    /**
     * Delete a family from the asterisk database
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+Internal+Database
     *
     * @param string $family    The family name to use
     * @return bool True if successful
     */
    public function database_deltree($family)
    {
        $r      = $this->command("database deltree " . str_replace(" ", "/", $family));
        $status = (bool) strstr($r["data"], "removed");
        if ($status && ! empty($this->memAstDB)) {
            $keyUsed = "/" . str_replace(" ", "/", $family);
            foreach ($this->memAstDB as $key => $val) {
                $reg = preg_quote($keyUsed, "/");
                if (preg_match("/^" . $reg . ".*/", $key)) {
                    unset($this->memAstDB[$key]);
                    if (isset($this->memAstDBArray[$key])) {
                        unset($this->memAstDBArray[$key]);
                    }
                }
            }
        }
        return $status;
    }

    /**
     * Returns whether a give function exists in this Asterisk install
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore
     *
     * @param string $func  The case sensitve name of the function
     * @return bool True if if it exists
     */
    public function func_exists($func)
    {
        $r = $this->command("core show function $func");
        return (strpos($r['data'], "No function by that name registered") === false);
    }

    /**
     * Returns whether a give application exists in this Asterisk install
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore
     *
     * @param string $app   The case in-sensitve name of the application
     * @return bool True if if it exists
     */
    public function app_exists($app)
    {
        $r = $this->command("core show application $app");
        return (strpos($r['data'], "Your application(s) is (are) not registered") === false);
    }

    /**
     * Returns whether a give channeltype exists in this Asterisk install
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore
     *
     * @param string $channel The case in-sensitve name of the channel
     * @return bool True if if it exists
     */
    public function chan_exists($channel)
    {
        $r = $this->command("core show channeltype $channel");
        return (strpos($r['data'], "is not a registered channel driver") === false);
    }

    /**
     * Returns whether a give asterisk module is loaded in this Asterisk install
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/CLI+Syntax+and+Help+Commands#CLISyntaxandHelpCommands-Helpforfunctions,applicationsandmore
     *
     * @param string $app The case in-sensitve name of the application
     * @return bool True if if it exists
     */
    public function mod_loaded($mod)
    {
        $r = $this->command("module show like $mod");
        return (preg_match('/1 modules loaded/', $r['data']) > 0);
    }

    /**
     * Sets a global var or function to the provided value
     *
     * @param string $var The variable or function to set
     * @param string $val the value to set it to
     * @return array returns the array value from the send_request
     */
    public function set_global($var, $val)
    {
        static $pre = '';

        if ( ! $pre) {
            //TODO: Query Asterisk for it's version during start up
            $pre = version_compare($this->settings['AsteriskVersion'], "1.6.1", "ge") ? 'dialplan' : 'core';
        }
        return $this->command($pre . ' set global ' . $var . ' ' . $val);
    }

    /**
     * Reload module(s)
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Reload
     * @param string $module
     * @param string $actionid
     */
    public function Reload($module = null, $actionid = null)
    {
        $parameters = [];

        if ($actionid) {
            $parameters['ActionID'] = $actionid;
        }
        if ($module) {
            $parameters['Module'] = $module;
        }
        return $this->send_request('Reload', $parameters);
    }

    /**
     * Starts mixmonitor
     *
     * @param string $channel   The channel to start recording
     * @param string $file The file to record to
     * @param string $options Options to pass to mixmonitor
     * @param string $postcommand Command to execute after recording
     * @param string $actionid message matching variable
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MixMonitor
     *
     * @return array returns the array value from the send_request
     */
    public function mixmonitor($channel, $file, $options = '', $postcommand = '', $actionid = null)
    {
        if ( ! $channel || ! $file) {
            return false;
        }
        $args = 'mixmonitor start ' . trim($channel) . ' ' . trim($file);
        if ($options || $postcommand) {
            $args .= ',' . trim($options);
        }
        if ($postcommand) {
            $args .= ',' . trim($postcommand);
        }
        return $this->command($args, $actionid);
    }

    /**
     * Stops mixmonitor
     *
     * @param string $channel The channel to stop recording
     * @param string $actionid message matching variable
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_MixMonitor
     *
     * @return array returns the array value from the send_request
     */
    public function stopmixmonitor($channel, $actionid = null)
    {
        if ( ! $channel) {
            return false;
        }
        $args = 'mixmonitor stop ' . trim($channel);
        return $this->command($args, $actionid);
    }

    /**
     * PJSIPShowEndpoint
     *
     * @param string $channel
     * @version 12
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+ManagerAction_PJSIPShowEndpoints
     *
     * @return array returns a key => val array
     */
    public function PJSIPShowEndpoint($dev)
    {
        $this->add_event_handler("endpointdetail", [$this, 'Endpoint_catch']);
        $this->add_event_handler("authdetail", [$this, 'Endpoint_catch']);
        $this->add_event_handler("endpointdetailcomplete", [$this, 'Endpoint_catch']);
        $params   = ["Endpoint" => $dev];
        $response = $this->send_request('PJSIPShowEndpoint', $params);
        if ($response["Response"] == "Success") {
            $this->wait_response(true);
            stream_set_timeout($this->socket, 30);
        } else {
            return false;
        }
        $res = $this->response_catch;
        // Asterisk 12 can sometimes dump extra garbage after the
        // output of this. So grab it, and discard it, if it's
        // pending.
        // Note that this has been reported as a bug and should
        // be removed, or, wait_response needs to be re-written
        // to keep waiting until it receives the ending event
        // https://issues.asterisk.org/jira/browse/ASTERISK-24331
        usleep(1000);
        stream_set_blocking($this->socket, false);
        while (fgets($this->socket)) { /* do nothing */}
        stream_set_blocking($this->socket, true);
        unset($this->event_handlers['endpointdetail']);
        unset($this->event_handlers['authdetail']);
        unset($this->event_handlers['endpointdetailcomplete']);
        return $res;
    }

    /**
     * Catcher for the pjsip events
     *
     */
    private function Endpoint_catch($event, $data, $server, $port)
    {
        switch ($event) {
            case 'endpointdetailcomplete':
                stream_set_timeout($this->socket, 0, 1);
                break;
            default:
                $this->response_catch[] = $data;
        }
    }

    /**
     * List all channels
     *
     * List currently defined channels and some information about them.
     *
     * @link https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_CoreShowChannels
     *
     * @return array of all channels currently active
     */
    public function CoreShowChannels()
    {
        $this->add_event_handler("coreshowchannel", [$this, 'coreshowchan_catch']);
        $this->add_event_handler("coreshowchannelscomplete", [$this, 'coreshowchan_catch']);
        $response = $this->send_request('CoreShowChannels');
        if ($response["Response"] == "Success") {
            $this->response_catch = [];
            $this->wait_response(true);
            stream_set_timeout($this->socket, 30);
        } else {
            return false;
        }
        unset($this->event_handlers['coreshowchannel']);
        unset($this->event_handlers['coreshowchannelscomplete']);
        return $this->response_catch;
    }

    /**
     * Core Show Channels Catch
     */
    private function coreshowchan_catch($event, $data, $server, $port)
    {
        switch ($event) {
            case 'coreshowchannelscomplete':
                stream_set_timeout($this->socket, 0, 1);
                break;
            default:
                $this->response_catch[] = $data;
        }
    }
}

function phpasmanager_error_handler($errno, $errstr, $errfile, $errline)
{
    switch ($errno) {
        case E_WARNING:
        case E_USER_WARNING:
        case E_NOTICE:
        case E_USER_NOTICE:
        default:
            //dbug("Got a php-asmanager error of [$errno] $errstr");
            break;
    }
    /* Don't execute PHP internal error handler */
    return true;
}
