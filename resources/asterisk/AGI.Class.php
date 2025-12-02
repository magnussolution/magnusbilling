<?php

define('AST_CONFIG_DIR', '/etc/asterisk/');
define('AST_SPOOL_DIR', '/var/spool/asterisk/');
define('AST_TMP_DIR', AST_SPOOL_DIR . '/tmp/');
define('DEFAULT_PHPAGI_CONFIG', AST_CONFIG_DIR . '/phpagi.conf');

define('AST_DIGIT_ANY', '0123456789#*');

define('AGIRES_OK', 200);

define('AST_STATE_DOWN', 0);
define('AST_STATE_RESERVED', 1);
define('AST_STATE_OFFHOOK', 2);
define('AST_STATE_DIALING', 3);
define('AST_STATE_RING', 4);
define('AST_STATE_RINGING', 5);
define('AST_STATE_UP', 6);
define('AST_STATE_BUSY', 7);
define('AST_STATE_DIALING_OFFHOOK', 8);
define('AST_STATE_PRERING', 9);

define('AUDIO_FILENO', 3); // STDERR_FILENO + 1

class AGI extends PDO
{

    public $request;

    /**
     * Config variables
     *
     * @var integer
     * @access public
     */
    public $nlinetoread = 5;

    /**
     * Config variables
     *
     * @var array
     * @access public
     */
    public $config;

    /**
     * Asterisk Manager
     *
     * @var AGI_AsteriskManager
     * @access public
     */
    public $asmanager;

    /**
     * Input Stream
     *
     * @access private
     */
    public $in = null;

    /**
     * Output Stream
     *
     * @access private
     */
    public $out = null;

    /**
     * Audio Stream
     *
     * @access public
     */
    public $audio = null;

    public $engine;
    private $host;
    private $database;
    private $user;
    private $pass;
    public $verboseLevel;

    public function __construct()
    {

        $configFile = '/etc/asterisk/res_config_mysql.conf';
        $array      = parse_ini_file($configFile);

        $this->engine   = 'mysql';
        $this->host     = $array['dbhost'];
        $this->database = $array['dbname'];
        $this->user     = $array['dbuser'];
        $this->pass     = $array['dbpass'];
        $dns            = $this->engine . ':dbname=' . $this->database . ";host=" . $this->host;

        // load config
        if ( ! is_null($config) && file_exists($config)) {
            $this->config = parse_ini_file($config, true);
        } elseif (file_exists(DEFAULT_PHPAGI_CONFIG)) {
            foreach ($optconfig as $var => $val) {
                $this->config['phpagi'][$var] = $val;
            }
        }

        // add default values to config for uninitialized values
        if ( ! isset($this->config['phpagi']['error_handler'])) {
            $this->config['phpagi']['error_handler'] = true;
        }

        if ( ! isset($this->config['phpagi']['debug'])) {
            $this->config['phpagi']['debug'] = false;
        }

        if ( ! isset($this->config['phpagi']['admin'])) {
            $this->config['phpagi']['admin'] = null;
        }

        if ( ! isset($this->config['phpagi']['tempdir'])) {
            $this->config['phpagi']['tempdir'] = AST_TMP_DIR;
        }

        // festival TTS config
        if ( ! isset($this->config['festival']['text2wave'])) {
            $this->config['festival']['text2wave'] = $this->which('text2wave');
        }

        // swift TTS config
        if ( ! isset($this->config['cepstral']['swift'])) {
            $this->config['cepstral']['swift'] = $this->which('swift');
        }

        ob_implicit_flush(true);

        // open stdin & stdout
        $this->in  = defined('STDIN') ? STDIN : fopen('php://stdin', 'r');
        $this->out = defined('STDOUT') ? STDOUT : fopen('php://stdout', 'w');

        // make sure temp folder exists
        $this->make_folder($this->config['phpagi']['tempdir']);

        // read the request
        $str = fgets($this->in);
        while ($str != "\n") {
            $this->request[substr($str, 0, strpos($str, ':'))] = trim(substr($str, strpos($str, ':') + 1));
            $str                                               = fgets($this->in);
        }

        // open audio if eagi detected
        if ($this->request['agi_enhanced'] == '1.0') {
            if (file_exists('/proc/' . getmypid() . '/fd/3')) {
                $this->audio = fopen('/proc/' . getmypid() . '/fd/3', 'r');
            } elseif (file_exists('/dev/fd/3')) {
                // may need to mount fdescfs
                $this->audio = fopen('/dev/fd/3', 'r');
            } else {
                $this->conlog('Unable to open audio stream');
            }

            if ($this->audio) {
                stream_set_blocking($this->audio, 0);
            }

        }

        parent::__construct($dns, $this->user, $this->pass);
    }

    public function answer()
    {
        return $this->evaluate('ANSWER');
    }

    public function channel_status($channel = '')
    {
        $ret = $this->evaluate("CHANNEL STATUS $channel");
        switch ($ret['result']) {
            case -1:$ret['data'] = trim("There is no channel that matches $channel");
                break;
            case AST_STATE_DOWN: $ret['data'] = 'Channel is down and available';
                break;
            case AST_STATE_RESERVED: $ret['data'] = 'Channel is down, but reserved';
                break;
            case AST_STATE_OFFHOOK: $ret['data'] = 'Channel is off hook';
                break;
            case AST_STATE_DIALING: $ret['data'] = 'Digits (or equivalent) have been dialed';
                break;
            case AST_STATE_RING: $ret['data'] = 'Line is ringing';
                break;
            case AST_STATE_RINGING: $ret['data'] = 'Remote end is ringing';
                break;
            case AST_STATE_UP: $ret['data'] = 'Line is up';
                break;
            case AST_STATE_BUSY: $ret['data'] = 'Line is busy';
                break;
            case AST_STATE_DIALING_OFFHOOK: $ret['data'] = 'Digits (or equivalent) have been dialed while offhook';
                break;
            case AST_STATE_PRERING: $ret['data'] = 'Channel has detected an incoming call and is waiting for ring';
                break;
            default:$ret['data'] = "Unknown ({$ret['result']})";
                break;
        }
        return $ret;
    }

    public function execute($application, $options = '')
    {
        if (is_array($options)) {
            $options = join('|', $options);
        }

        return $this->evaluate("EXEC $application $options");
    }

    public function get_data($filename, $timeout = null, $max_digits = null, $escape_character = null)
    {
        return $this->evaluate(rtrim("GET DATA $filename $timeout $max_digits $escape_character"));
    }

    public function get_variable($variable, $get_value = false)
    {
        $var = $this->evaluate("GET VARIABLE $variable");
        if (isset($get_value) && $get_value) {
            return $var['data'];
        } else {
            return $var;
        }
    }

    public function hangup($channel = '')
    {
        return $this->evaluate("HANGUP $channel");
    }

    public function say_number($number, $escape_digits = '')
    {
        return $this->evaluate("SAY NUMBER $number \"$escape_digits\"");
    }

    public function set_callerid($cid)
    {
        return $this->evaluate("SET CALLERID $cid");
    }
    public function set_context($context)
    {
        return $this->evaluate("SET CONTEXT $context");
    }

    public function set_extension($extension)
    {
        return $this->evaluate("SET EXTENSION $extension");
    }

    public function set_music($enabled = true, $class = '')
    {
        $enabled = ($enabled) ? 'ON' : 'OFF';
        return $this->evaluate("SET MUSIC $enabled $class");
    }

    public function set_priority($priority)
    {
        return $this->evaluate("SET PRIORITY $priority");
    }

    public function set_variable($variable, $value)
    {
        $value = str_replace("\n", '\n', addslashes($value));
        return $this->evaluate("SET VARIABLE $variable \"$value\"");
    }

    public function stream_file($filename, $escape_digits = '', $offset = 0)
    {
        $this->evaluate('ANSWER');

        return $this->evaluate("STREAM FILE $filename \"$escape_digits\" $offset");

    }

    public function wait_for_digit($timeout = -1)
    {
        return $this->evaluate("WAIT FOR DIGIT $timeout");
    }

    public function exec_agi($command, $args)
    {
        return $this->execute("AGI $command", $args);
    }

    public function exec_dial($type, $identifier, $timeout = null, $options = null, $url = null)
    {
        return $this->execute('Dial', trim("$type/$identifier|$timeout|$options|$url", '|'));
    }

    public function exec_goto($a, $b = null, $c = null)
    {
        return $this->execute('Goto', trim("$a,$b,$c", ','));
    }

    public function &new_AsteriskManager()
    {
        $this->asm       = new AGI_AsteriskManager(null, $this->config);
        $this->asm->pagi = &$this;
        $this->config    = &$this->asm->config;
        return $this->asm;
    }

    public function conlog($str, $vbl = 1)
    {
        static $busy = false;

        if ($this->config['phpagi']['debug'] != false) {
            if ( ! $busy) // no conlogs inside conlog!!!
            {
                $busy = true;
                $this->verbose($str, $vbl);
                $busy = false;
            }
        }
    }

    public function make_folder($folder, $perms = 0755)
    {
        $f    = explode(DIRECTORY_SEPARATOR, $folder);
        $base = '';
        for ($i = 0; $i < count($f); $i++) {
            $base .= $f[$i];
            if ($f[$i] != '' && ! file_exists($base)) {
                mkdir($base, $perms);
            }

            $base .= DIRECTORY_SEPARATOR;
        }
    }

    public function verbose($message, $level = 1)
    {
        if ($this->verboseLevel > 0) {
            $level = 1;
        }

        foreach (explode("\n", str_replace("\r\n", "\n", print_r($message, true))) as $msg) {
            $ret = $this->evaluate("VERBOSE \"$msg\" $level");
        }
        return $ret;
    }

    public function which($cmd, $checkpath = null)
    {
        global $_ENV;
        $chpath = is_null($checkpath) ? $_ENV['PATH'] : $checkpath;

        foreach (explode(':', $chpath) as $path) {
            if (is_executable("$path/$cmd")) {
                return "$path/$cmd";
            }
        }

        if (is_null($checkpath)) {
            return $this->which($cmd, '/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:' .
                '/usr/X11R6/bin:/usr/local/apache/bin:/usr/local/mysql/bin');
        }

        return false;
    }

    public function evaluate($command)
    {
        $broken = ['code' => 500, 'result' => -1, 'data' => ''];

        // write command
        if ( ! fwrite($this->out, trim($command) . "\n")) {
            error_log("write command not able to write\n\n", 3, "/var/log/my-errors.log");
            return $broken;
        }

        fflush($this->out);

        $count = 0;
        do {
            $str = trim(fgets($this->in, 4096));
        } while ($str == '' && $count++ < $this->nlinetoread);

        if ($count >= 5) {

            return $broken;
        }

        // parse result
        $ret['code'] = substr($str, 0, 3);
        $str         = trim(substr($str, 3));

        if ($str[0] == '-') // we have a multiline response!
        {
            $count = 0;
            $str   = substr($str, 1) . "\n";
            $line  = fgets($this->in, 4096);
            while (substr($line, 0, 3) != $ret['code'] && $count < 5) {
                $str .= $line;
                $line  = fgets($this->in, 4096);
                $count = (trim($line) == '') ? $count + 1 : 0;
            }
            if ($count >= 5) {
                //          $this->conlog("evaluate error on multiline read for $command");
                return $broken;
            }
        }

        $ret['result'] = null;
        $ret['data']   = '';

        if ($ret['code'] != AGIRES_OK) // some sort of error
        {
            $ret['data'] = $str;
            $this->conlog(print_r($ret, true));
        } else // normal AGIRES_OK response
        {

            $parse    = explode(' ', trim($str));
            $in_token = false;
            foreach ($parse as $token) {
                if ($in_token) // we previously hit a token starting with ')' but not ending in ')'
                {
                    $ret['data'] .= ' ' . trim($token, '() ');
                    if ($token[strlen($token) - 1] == ')') {
                        $in_token = false;
                    }

                } elseif ($token[0] == '(') {
                    if ($token[strlen($token) - 1] != ')') {
                        $in_token = true;
                    }

                    $ret['data'] .= ' ' . trim($token, '() ');
                } elseif (strpos($token, '=')) {
                    $token          = explode('=', $token);
                    $ret[$token[0]] = $token[1];
                } elseif ($token != '') {
                    $ret['data'] .= ' ' . $token;
                }

            }
            $ret['data'] = trim($ret['data']);
        }

        // log some errors
        if ($ret['result'] < 0) {
            $this->conlog("$command returned {$ret['result']}");
        }
        return $ret;
    }

}
